// Streams AI response over Lovable AI Gateway and logs to ai_queries.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "X-Model-Used, X-Records-Analysed",
};

// Map a UI model choice to a Lovable AI Gateway model + a human label.
function resolveModel(model: string): { gateway: string; label: string } {
  switch (model) {
    case "Deep Analysis":
      return { gateway: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" };
    case "Fast":
      return { gateway: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" };
    case "Auto":
    case "Private / Local":
    default:
      return { gateway: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" };
  }
}

// Normalise workflow (accepts ids or legacy labels) and build a system prompt.
function resolveWorkflow(workflow: string): { id: string; system: string } {
  const w = (workflow ?? "").toLowerCase();
  const base =
    "You are saha.team's field memory assistant for a retail operations team. " +
    "Answer using ONLY the provided field records as evidence. If the records do not contain the answer, " +
    "say plainly that there is not enough data — never invent facts. " +
    "When possible, structure the answer in Markdown with these sections: " +
    "### Executive summary, ### Key findings, ### Relevant records, ### Recommended actions, ### Sources. " +
    "Keep it concise and operational.";

  if (w.includes("quality")) {
    return {
      id: "quality",
      system: base + " FOCUS: Find incomplete, inconsistent or low-quality records — missing root cause, missing evidence, weak closures. Highlight which stores have the weakest data quality.",
    };
  }
  if (w.includes("compliance")) {
    return {
      id: "compliance",
      system: base + " FOCUS: Check records against procedures and mandatory fields (photo evidence, approvals, SOP steps). Flag non-compliant closures explicitly.",
    };
  }
  if (w.includes("audit")) {
    return {
      id: "audit",
      system: base + " FOCUS: Answer who changed what and when. Surface edits after closing, reopened records, and attributable changes with timestamps.",
    };
  }
  return {
    id: "general",
    system: base + " FOCUS: Search operational records and summarise recurring issues, returns, stock discrepancies and customer complaints across stores.",
  };
}

function timeRangeStart(timeRange: string): string | null {
  const now = Date.now();
  const day = 86400000;
  switch (timeRange) {
    case "Last 7 days":
      return new Date(now - 7 * day).toISOString();
    case "Last 30 days":
      return new Date(now - 30 * day).toISOString();
    case "Last 90 days":
      return new Date(now - 90 * day).toISOString();
    case "Last 12 months":
      return new Date(now - 365 * day).toISOString();
    default:
      return null; // All time
  }
}

// Explicit mapping from UI data-source labels to the DB `source` column values.
const DATA_SOURCE_MAP: Record<string, string[]> = {
  WhatsApp: ["whatsapp", "wa"],
  "POS / Kasa": ["pos", "kasa", "pos/kasa"],
  Documents: ["document", "documents", "doc", "pdf"],
  CRM: ["crm"],
  Drive: ["drive", "google_drive"],
  Sheets: ["sheets", "google_sheets", "sheet"],
};

function dataSourceValues(dataSource: string): string[] | null {
  if (!dataSource || dataSource === "All data sources") return null;
  return DATA_SOURCE_MAP[dataSource] ?? [dataSource.toLowerCase()];
}

type EvidenceMeta = { url: string; type: "image" | "pdf" | "document" };

function classifyEvidence(url: string): EvidenceMeta {
  const lower = url.toLowerCase().split("?")[0];
  if (/\.(png|jpe?g|gif|webp|bmp|heic)$/.test(lower)) return { url, type: "image" };
  if (/\.pdf$/.test(lower)) return { url, type: "pdf" };
  return { url, type: "document" };
}

// Build structured ChatSource[] from the retrieved records (records + evidence).
async function buildSources(
  supabase: any,
  records: any[],
): Promise<any[]> {
  const sources: any[] = [];
  let counter = 1;
  const next = () => `S${counter++}`;

  for (const r of records.slice(0, 6)) {
    const urls: string[] = Array.isArray(r.evidence_urls) ? r.evidence_urls : [];
    for (const raw of urls.slice(0, 3)) {
      if (!raw) continue;
      let url = raw as string;
      // Resolve storage paths into short-lived signed URLs (private bucket).
      if (!/^https?:\/\//.test(url)) {
        try {
          const { data: signed } = await supabase.storage
            .from("evidence")
            .createSignedUrl(url, 60 * 30);
          if (signed?.signedUrl) url = signed.signedUrl;
        } catch {
          /* leave path as-is */
        }
      }
      const meta = classifyEvidence(url);
      const fileName = (raw as string).split("/").pop() ?? "evidence";
      sources.push({
        id: next(),
        label: fileName,
        type: meta.type,
        recordId: r.id,
        storagePath: /^https?:\/\//.test(raw as string) ? undefined : (raw as string),
        fileName,
        url,
        thumbnailUrl: meta.type === "image" ? url : undefined,
        location: r.location,
        createdAt: r.created_at,
        snippet: r.raw_text ? String(r.raw_text).slice(0, 200) : undefined,
      });
    }
  }

  // Always include the top records themselves as record-type sources.
  for (const r of records.slice(0, 4)) {
    sources.push({
      id: next(),
      label: `${r.topic ?? "Field record"}`,
      type: "record",
      recordId: r.id,
      topic: r.topic,
      rawText: r.raw_text,
      status: r.status,
      rootCause: r.root_cause,
      resolution: r.resolution,
      location: r.location,
      createdAt: r.created_at,
    });
  }

  return sources;
}


  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      query,
      orgId,
      workflow,
      model = "Auto",
      location,
      timeRange,
      dataSource,
      conversationHistory,
    } = body;

    if (!query || typeof query !== "string" || !orgId) {
      return new Response(JSON.stringify({ error: "Missing query or orgId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { gateway: gatewayModel, label: modelLabel } = resolveModel(model);
    const { id: workflowId, system } = resolveWorkflow(workflow);
    const startDate = timeRangeStart(timeRange);
    const locationFilter = location && location !== "All locations" ? location : null;

    // Try semantic retrieval via pgvector; fall back to recency on failure.
    let records: any[] | null = null;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (openaiKey) {
      try {
        const embRes = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "text-embedding-3-small", input: query }),
        });
        if (!embRes.ok) throw new Error(`embedding ${embRes.status}`);
        const embJson = await embRes.json();
        const queryEmbedding = embJson.data[0].embedding as number[];
        const { data: matched, error: matchErr } = await supabase.rpc("match_field_records", {
          _org_id: orgId,
          _user_id: user.id,
          _embedding: queryEmbedding as unknown as string,
          _match_count: 30,
        });
        if (matchErr) throw matchErr;
        records = matched ?? [];
        // Apply post-retrieval filters (semantic search ignores SQL filters)
        if (locationFilter) records = records.filter((r) => r.location === locationFilter);
        if (startDate) records = records.filter((r) => r.created_at >= startDate);
        records = records.slice(0, 20);
      } catch (e) {
        console.error("Semantic retrieval failed, falling back to recency:", e);
      }
    }

    if (!records) {
      let q = supabase
        .from("field_records")
        .select("id, topic, location, status, raw_text, root_cause, resolution, action_required, quality_score, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (locationFilter) q = q.eq("location", locationFilter);
      if (startDate) q = q.gte("created_at", startDate);
      const { data: recent } = await q;
      records = recent ?? [];
    }

    const recordCount = records?.length ?? 0;

    const contextBlock = (records ?? [])
      .map((r, i) =>
        `#${i + 1} [${r.status}] ${r.topic ?? "(no topic)"} @ ${r.location ?? "—"}\n` +
          `  created: ${r.created_at}\n` +
          (r.raw_text ? `  text: ${r.raw_text}\n` : "") +
          (r.root_cause ? `  root_cause: ${r.root_cause}\n` : "") +
          (r.resolution ? `  resolution: ${r.resolution}\n` : "") +
          (r.action_required ? `  action: ${r.action_required}\n` : "") +
          (r.quality_score != null ? `  quality: ${r.quality_score}\n` : ""),
      )
      .join("\n");

    // Limited conversation context to control token usage.
    const history = Array.isArray(conversationHistory)
      ? conversationHistory
          .filter((m: any) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
          .slice(-6)
          .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 1500) }))
      : [];

    const filterNote = [
      locationFilter ? `Location: ${locationFilter}` : null,
      timeRange ? `Time range: ${timeRange}` : null,
      dataSource && dataSource !== "All data sources" ? `Data source: ${dataSource}` : null,
    ].filter(Boolean).join(" · ");

    const userMsg =
      `Question: ${query}\n` +
      (filterNote ? `Filters → ${filterNote}\n` : "") +
      `\n--- ${recordCount} field records ---\n${contextBlock || "(no records)"}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: gatewayModel,
        stream: true,
        messages: [
          { role: "system", content: system },
          ...history,
          { role: "user", content: userMsg },
        ],
      }),
    });

    if (!aiRes.ok || !aiRes.body) {
      const txt = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `AI gateway error: ${txt}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log audit row with the actual model used (fire-and-forget)
    supabase
      .from("ai_queries")
      .insert({
        org_id: orgId,
        user_id: user.id,
        ai_client: modelLabel,
        query_text: query,
        sources_accessed: ["field_records"],
      })
      .then(() => {});

    // Transform OpenAI-style SSE to plain text token stream
    const reader = aiRes.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";

    const stream = new ReadableStream({
      async pull(controller) {
        const { value, done } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch {
            // ignore partials
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "X-Model-Used": modelLabel,
        "X-Records-Analysed": String(recordCount),
        "X-Workflow": workflowId,
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
