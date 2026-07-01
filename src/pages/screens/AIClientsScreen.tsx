import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useUserOrg } from "@/hooks/useUserOrg";
import { supabase } from "@/lib/supabase";
import { Breadcrumb, CodeBlock } from "@/pages/Index";
import { SmallCard } from "@/pages/screens/DashboardScreen";
import { useLanguage } from "@/hooks/useLanguage";
import { WA_CHANNELS, PHONE_MAPPINGS } from "@/lib/i18n";


export const AI_TABS = ["Claude", "ChatGPT", "Copilot", "Local LLM", "Custom Agent"] as const;
export type AITab = (typeof AI_TABS)[number];

export const WORKFLOW_TABS = ["General Search", "Store Operations", "Visual Merchandising", "Store Audit"] as const;
export type WorkflowTab = (typeof WORKFLOW_TABS)[number];

export const WORKFLOW_CONTENT: Record<WorkflowTab, { placeholder: string; prompts: string[] }> = {
  "General Search": {
    placeholder: "Ask about store records, campaigns, deliveries, or past field cases…",
    prompts: [
      "Show recent records for the Kadıköy store",
      "Find similar issues across stores in the last 90 days",
      "What was the last update from this store?",
    ],
  },
  "Store Operations": {
    placeholder: "Ask about stock, deliveries, staffing, or store setup…",
    prompts: [
      "Which stores reported stock issues this week?",
      "Show late deliveries in the last 30 days",
      "Which store openings are still pending setup?",
    ],
  },
  "Visual Merchandising": {
    placeholder: "Ask about window displays, planograms, or campaign setup…",
    prompts: [
      "Which stores have not updated the campaign window?",
      "Show planogram issues reported this month",
      "Find stores missing new season display photos",
    ],
  },
  "Store Audit": {
    placeholder: "Ask about repeated findings, store standards, or audit-ready learnings…",
    prompts: [
      "What are the most repeated store audit findings?",
      "Show common issues by region",
      "Which corrective actions are still open?",
    ],
  },
};

export function WorkflowPanel() {
  const [tab, setTab] = useState<WorkflowTab>("General Search");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [streaming, setStreaming] = useState(false);
  const { orgId } = useUserOrg();
  const { t } = useLanguage();
  const { placeholder, prompts } = WORKFLOW_CONTENT[tab];

  const ask = async () => {
    const q = query.trim();
    if (!q || streaming) return;
    if (!orgId) {
      toast.error(t("aic.notReady"));
      return;
    }
    setStreaming(true);
    setAnswer("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-field-memory`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: q, orgId, workflow: tab }),
      });
      if (!res.ok || !res.body) {
        const errText = await res.text();
        throw new Error(errText || `Request failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        setAnswer((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to query");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {WORKFLOW_TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setAnswer(""); setQuery(""); }}
            className={`relative px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${
              tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
            {tab === t && <span className="absolute bottom-[-1px] left-2 right-2 h-[2px] bg-primary" />}
          </button>
        ))}
      </div>
      <div className="pt-6">
        <div className="mt-5 flex items-center rounded-xl border-[1.5px] border-border bg-background overflow-hidden transition-all focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !streaming) ask(); }}
            placeholder={placeholder}
            className="flex-1 h-12 px-4 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={ask}
            disabled={streaming || !query.trim()}
            className="h-12 px-5 bg-primary text-primary-foreground text-sm font-medium border-l border-primary hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            {streaming ? "Asking…" : "Ask"}
          </button>
        </div>

        {(answer || streaming) && (
          <div className="mt-5 rounded-md border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Claude · saha.team
              </span>
              {streaming && <span className="text-xs text-muted-foreground">streaming…</span>}
            </div>
            <div className="text-sm text-foreground leading-relaxed min-h-[1.5rem] prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-headings:font-serif">
              <ReactMarkdown>{answer}</ReactMarkdown>
              {streaming && <span className="inline-block w-2 h-4 bg-primary/60 align-middle animate-pulse ml-0.5" />}
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="mt-2 flex flex-wrap gap-2">
            {prompts.map((p) => (
              <button
                key={p}
                onClick={() => setQuery(p)}
                className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LocalLLMConfig() {
  const { orgId } = useUserOrg();
  const storageKey = orgId ? `saha:localLLM:${orgId}` : null;
  const [endpoint, setEndpoint] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (!storageKey) return;
    setEndpoint(localStorage.getItem(storageKey) ?? "");
  }, [storageKey]);

  const save = (v: string) => {
    setEndpoint(v);
    if (storageKey) localStorage.setItem(storageKey, v);
  };

  const test = async () => {
    const url = endpoint.trim();
    if (!url) {
      toast.error("Enter an endpoint URL first");
      return;
    }
    setTesting(true);
    const ctrl = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; ctrl.abort(); }, 5000);
    try {
      await fetch(url, { method: "GET", signal: ctrl.signal });
      clearTimeout(timeout);
      toast.success("Endpoint reachable");
    } catch (e) {
      clearTimeout(timeout);
      if (timedOut || (e instanceof Error && e.name === "AbortError")) {
        toast.error("Connection timed out");
      } else {
        toast.error("Could not reach endpoint");
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="mt-4 rounded-md border border-border bg-muted/30 p-4">
      <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-3">
        Local model endpoint
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={endpoint}
          onChange={(e) => save(e.target.value)}
          placeholder="http://localhost:11434/v1/chat/completions"
          className="flex-1 h-10 px-3 rounded-md border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={test}
          disabled={testing}
          className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          {testing ? "Testing…" : "Test connection"}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Saved locally per workspace. Used to point Claude · saha.team at your private model.
      </p>
    </div>
  );
}

export function AIClientPanel({ compact = false }: { compact?: boolean }) {
  const [tab, setTab] = useState<AITab>("Claude");

  const panes: Record<AITab, React.ReactNode> = {
    Claude: (
      <div className="space-y-6">
        <div>
          <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-3">Desktop App</div>
          <ol className="space-y-3">
            <Step n={1}>Open Claude Desktop → Settings → Connectors</Step>
            <Step n={2}>Click "Add custom connector" at the bottom-left</Step>
            <Step n={3}>
              Set Name to "saha.team" and paste this URL:
              <div className="mt-3"><CodeBlock>https://api.saha.team/mcp</CodeBlock></div>
            </Step>
            <Step n={4}>Click Add, then click Connect</Step>
          </ol>
        </div>
        <div>
          <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-3">CLI / Code</div>
          <ol className="space-y-3">
            <Step n={1}>
              Run this command in your terminal:
              <div className="mt-3"><CodeBlock>claude mcp add saha-team --transport http https://api.saha.team/mcp</CodeBlock></div>
            </Step>
          </ol>
        </div>
      </div>
    ),
    ChatGPT: (
      <div>
        <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-3">ChatGPT Connector</div>
        <ol className="space-y-3">
          <Step n={1}>Open your ChatGPT workspace admin / connectors area</Step>
          <Step n={2}>Create a new enterprise connector or API integration</Step>
          <Step n={3}>
            Use the saha.team gateway URL below:
            <div className="mt-3"><CodeBlock>https://api.saha.team/chatgpt-connector</CodeBlock></div>
          </Step>
          <Step n={4}>Grant access only to approved field memory datasets</Step>
        </ol>
      </div>
    ),
    Copilot: (
      <div>
        <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-3">Microsoft Copilot</div>
        <ol className="space-y-3">
          <Step n={1}>Open Microsoft Copilot Studio or your M365 admin integration panel</Step>
          <Step n={2}>Add a new external knowledge or custom API source</Step>
          <Step n={3}>
            Use this endpoint:
            <div className="mt-3"><CodeBlock>https://api.saha.team/copilot</CodeBlock></div>
          </Step>
          <Step n={4}>Map access policies for maintenance, QA and compliance teams</Step>
        </ol>
      </div>
    ),
    "Local LLM": (
      <div>
        <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-3">Local / On-prem LLM</div>
        <ol className="space-y-3">
          <Step n={1}>Deploy your local model inside your private network</Step>
          <Step n={2}>Whitelist saha.team's internal MCP or REST endpoint</Step>
          <Step n={3}>
            Use this internal endpoint:
            <div className="mt-3"><CodeBlock>https://api.saha.team/local-llm</CodeBlock></div>
          </Step>
          <Step n={4}>All field data stays inside your environment</Step>
        </ol>
        <LocalLLMConfig />
      </div>
    ),
    "Custom Agent": (
      <div>
        <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-3">Custom Agent / Internal Apps</div>
        <ol className="space-y-3">
          <Step n={1}>Create an API key from the API / MCP page</Step>
          <Step n={2}>Use saha.team tools to search field memory and asset history</Step>
          <Step n={3}>
            Base URL:
            <div className="mt-3"><CodeBlock>https://api.saha.team/v1</CodeBlock></div>
          </Step>
          <Step n={4}>Call tools like search_field_memory, get_asset_history, create_followup_task</Step>
        </ol>
      </div>
    ),
  };

  const { t } = useLanguage();
  return (
    <div>
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {AI_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${
              tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
            {tab === t && <span className="absolute bottom-[-1px] left-2 right-2 h-[2px] bg-primary" />}
          </button>
        ))}
      </div>
      <div className={compact ? "pt-6" : "pt-8"}>{panes[tab]}</div>
      <div className="pt-6">
        <a href="#" className="text-sm text-primary hover:underline inline-flex items-center gap-1.5">
          {t("aic.manage")} <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

export function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded bg-muted text-xs text-foreground border border-border">
        {n}
      </span>
      <div className="text-sm leading-relaxed text-foreground pt-0.5 flex-1 min-w-0">{children}</div>
    </li>
  );
}

export function AIClientsScreen() {
  const { t } = useLanguage();
  return (
    <div className="space-y-12">
      <div>
        <Breadcrumb screen="ai-clients" />
        <h1 className="font-serif text-5xl text-foreground mt-4">{t("aic.title")}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {t("aic.subtitle")}
        </p>
      </div>

      <section className="rounded-lg border border-border bg-card p-8">
        <h2 className="font-serif text-2xl text-foreground mb-6">{t("aic.connect")}</h2>
        <AIClientPanel compact />
      </section>

      <WhatsAppChannelStructure />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallCard icon={Sparkles} title="Claude" text={t("aic.claude")} />
        <SmallCard icon={Sparkles} title="ChatGPT" text={t("aic.chatgpt")} />
        <SmallCard icon={Sparkles} title="Copilot" text={t("aic.copilot")} />
        <SmallCard icon={Sparkles} title="Local LLM" text={t("aic.localllm")} />
      </div>
    </div>
  );
}

function ChannelStatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground whitespace-nowrap">
      {status}
    </span>
  );
}

export function WhatsAppChannelStructure() {
  const { t, lang } = useLanguage();
  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-2xl text-foreground">{t("wcs.title")}</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{t("wcs.subtitle")}</p>
        </div>
        <span className="shrink-0 text-[11px] text-muted-foreground border border-border rounded-full px-2.5 py-0.5">
          {t("wcs.sample")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WA_CHANNELS[lang].map((c) => (
          <div key={c.title} className="rounded-lg border border-border bg-card p-5 flex items-start justify-between gap-4 hover:border-foreground/20 transition-colors">
            <div className="flex items-start gap-4 min-w-0">
              <div className="h-9 w-9 rounded-md bg-muted border border-border flex items-center justify-center shrink-0">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="font-serif text-lg text-foreground">{c.title}</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{c.detail}</p>
              </div>
            </div>
            <ChannelStatusBadge status={c.status} />
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">{t("pm.title")}</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">{t("pm.body")}</p>
        <div className="mt-4">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">{t("pm.example")}</div>
          <div className="space-y-2">
            {PHONE_MAPPINGS[lang].map((m, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 rounded-md border border-border bg-muted/40 px-4 py-2.5 text-sm">
                <span className="font-mono text-foreground shrink-0">{m.phone}</span>
                <span className="text-muted-foreground hidden sm:inline">→</span>
                <span className="text-muted-foreground">{m.mapping}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

}
