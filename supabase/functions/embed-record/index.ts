// Embeds a field_record's text and stores it in the embedding column.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export async function embedText(text: string): Promise<number[]> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI embeddings error: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data.data[0].embedding as number[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { record_id } = await req.json().catch(() => ({}));
    if (!record_id || typeof record_id !== "string") {
      return json({ error: "Missing record_id" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: record, error } = await admin
      .from("field_records")
      .select("id, topic, raw_text, location, root_cause, resolution")
      .eq("id", record_id)
      .maybeSingle();
    if (error) return json({ error: error.message }, 500);
    if (!record) return json({ error: "Record not found" }, 404);

    const text = [record.topic, record.raw_text, record.location, record.root_cause, record.resolution]
      .filter(Boolean)
      .join("\n")
      .trim();
    if (!text) return json({ result: "skipped: empty text" });

    const embedding = await embedText(text);

    const { error: upErr } = await admin
      .from("field_records")
      .update({ embedding: embedding as unknown as string })
      .eq("id", record_id);
    if (upErr) return json({ error: upErr.message }, 500);

    return json({ result: "ok" });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
