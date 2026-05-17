import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const ONBOARDING_DASHBOARD_KEY = "saha:onboarding:dashboard";
const ONBOARDING_DATASOURCES_KEY = "saha:onboarding:datasources";
const isOnboardingDismissed = (key: string) => {
  try { return localStorage.getItem(key) === "true"; } catch { return false; }
};
const dismissOnboarding = (key: string) => {
  try { localStorage.setItem(key, "true"); } catch { /* ignore */ }
};
import {
  LayoutDashboard,
  Database,
  Sparkles,
  ShieldCheck,
  Code2,
  ScrollText,
  CreditCard,
  Plus,
  Copy,
  ChevronDown,
  Lock,
  Mail,
  ArrowRight,
  X,
  LogOut,
  Menu,
  Inbox,
  KeyRound,
  ShieldAlert,
  FileSearch,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { workspaceName, workspaceInitial } from "@/lib/workspaceName";
import { useOrgRecordCount, RECORD_QUOTA } from "@/hooks/useOrgRecordCount";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats, type Period } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import sahaLogo from "@/assets/saha-logo.png";
import sahaMark from "@/assets/saha-mark.png";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useUserOrg } from "@/hooks/useUserOrg";
import { useRecentFieldRecords } from "@/hooks/useRecentFieldRecords";
import { AddFieldRecordDialog } from "@/components/AddFieldRecordDialog";
import { FieldRecordDetailSheet } from "@/components/FieldRecordDetailSheet";
import type { FieldRecord } from "@/hooks/useRecentFieldRecords";
import { useDataQuality } from "@/hooks/useDataQuality";
import { toast } from "sonner";
import { logAIQuery } from "@/lib/logAIQuery";
import { useAuditLog } from "@/hooks/useAuditLog";
import { supabase } from "@/lib/supabase";
import { useApiKeys, type ApiKey } from "@/hooks/useApiKeys";
import { CreateApiKeyDialog } from "@/components/CreateApiKeyDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type Screen = "dashboard" | "data-sources" | "ai-clients" | "data-quality" | "api" | "audit" | "billing";

const NAV: { id: Screen; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "data-sources", label: "Data Sources", icon: Database },
  { id: "ai-clients", label: "AI Clients", icon: Sparkles },
  { id: "data-quality", label: "Data Quality", icon: ShieldCheck },
  { id: "api", label: "API / MCP", icon: Code2 },
  { id: "audit", label: "Audit", icon: ScrollText },
  { id: "billing", label: "Billing", icon: CreditCard },
];

const SCREEN_LABEL: Record<Screen, string> = {
  dashboard: "Dashboard",
  "data-sources": "Data Sources",
  "ai-clients": "AI Clients",
  "data-quality": "Data Quality",
  api: "API / MCP",
  audit: "Audit",
  billing: "Billing",
};

const SCREEN_TO_PATH: Record<Screen, string> = {
  dashboard: "/",
  "data-sources": "/data-sources",
  "ai-clients": "/ai-clients",
  "data-quality": "/data-quality",
  api: "/api",
  audit: "/audit",
  billing: "/billing",
};

const PATH_TO_SCREEN: Record<string, Screen> = {
  "/": "dashboard",
  "/data-sources": "data-sources",
  "/ai-clients": "ai-clients",
  "/data-quality": "data-quality",
  "/api": "api",
  "/audit": "audit",
  "/billing": "billing",
};

function LogoMark({ className = "h-6 w-6" }: { className?: string }) {
  return <img src={sahaMark} alt="saha.team" className={className} />;
}

function LogoFull({ className = "h-7" }: { className?: string }) {
  return <img src={sahaLogo} alt="saha.team" className={`${className} w-auto`} />;
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-muted/70 border border-border px-4 py-3 font-mono text-[13px] text-foreground">
      <span className="truncate">{children}</span>
      <button
        onClick={() => navigator.clipboard?.writeText(children)}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        aria-label="Copy"
      >
        <Copy className="h-4 w-4" />
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: "Connected" | "Syncing" | "Setup" }) {
  const map = {
    Connected: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Syncing: "bg-amber-50 text-amber-700 border-amber-200",
    Setup: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "Connected" ? "bg-emerald-500" : status === "Syncing" ? "bg-amber-500" : "bg-muted-foreground/60"}`} />
      {status}
    </span>
  );
}

function Breadcrumb({ screen }: { screen: Screen }) {
  const { user } = useAuth();
  return (
    <div className="text-sm text-muted-foreground">
      <span>{workspaceName(user?.email)}</span>
      <span className="mx-2">›</span>
      <span className="text-foreground">{SCREEN_LABEL[screen]}</span>
    </div>
  );
}

/* -------------------- AI CLIENT TABS -------------------- */

const AI_TABS = ["Claude", "ChatGPT", "Copilot", "Local LLM", "Custom Agent"] as const;
type AITab = (typeof AI_TABS)[number];

/* -------------------- WORKFLOW TABS -------------------- */

const WORKFLOW_TABS = ["General Search", "Quality Review", "Compliance Check", "Audit Memory"] as const;
type WorkflowTab = (typeof WORKFLOW_TABS)[number];

const WORKFLOW_CONTENT: Record<WorkflowTab, { description: string; placeholder: string; prompts: string[] }> = {
  "General Search": {
    description: "Ask general questions across field records, asset history, work orders, and connected data sources.",
    placeholder: "Ask about field records, asset history, work orders, or past cases…",
    prompts: [
      "Show recent records for Pump P-204",
      "Find similar failures in the last 90 days",
      "What was the last intervention on this asset?",
    ],
  },
  "Quality Review": {
    description: "Review data quality, missing fields, weak records, and repeated quality issues.",
    placeholder: "Ask about missing fields, weak records, root causes, or data quality…",
    prompts: [
      "Which records are missing root cause?",
      "Show low-quality closures from this month",
      "Which data sources create the weakest records?",
    ],
  },
  "Compliance Check": {
    description: "Check mandatory evidence, SOP adherence, and record completeness.",
    placeholder: "Ask about mandatory evidence, SOP adherence, or non-compliant records…",
    prompts: [
      "Show records missing mandatory photo evidence",
      "Which closures are not SOP-compliant?",
      "Find non-compliant records this week",
    ],
  },
  "Audit Memory": {
    description: "Explore repeated findings, common root causes, and audit-ready learnings.",
    placeholder: "Ask about repeated findings, common root causes, or audit-ready learnings…",
    prompts: [
      "What are the most repeated audit findings?",
      "Show common root causes by site",
      "Which corrective actions are still uncovered?",
    ],
  },
};

function WorkflowPanel() {
  const [tab, setTab] = useState<WorkflowTab>("General Search");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [streaming, setStreaming] = useState(false);
  const { orgId } = useUserOrg();
  const { description, placeholder, prompts } = WORKFLOW_CONTENT[tab];

  const ask = async () => {
    const q = query.trim();
    if (!q || streaming) return;
    if (!orgId) {
      toast.error("Workspace not ready");
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
        <p className="text-sm text-muted-foreground">{description}</p>

        <div className="mt-5">
          <label className="text-sm font-medium text-foreground">Ask your field memory</label>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !streaming) ask(); }}
              placeholder={placeholder}
              className="flex-1 h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={ask}
              disabled={streaming || !query.trim()}
              className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {streaming ? "Asking…" : "Ask"}
            </button>
          </div>
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
          <span className="text-xs text-muted-foreground">Suggested prompts</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {prompts.map((p) => (
              <button
                key={p}
                onClick={() => setQuery(p)}
                className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-foreground hover:bg-muted transition-colors"
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


function LocalLLMConfig() {
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

function AIClientPanel({ compact = false }: { compact?: boolean }) {
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
          Manage connections <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded bg-muted text-xs text-foreground border border-border">
        {n}
      </span>
      <div className="text-sm leading-relaxed text-foreground pt-0.5 flex-1 min-w-0">{children}</div>
    </li>
  );
}

/* -------------------- SCREENS -------------------- */

function DashboardScreen({ showOnboarding, onClose }: { showOnboarding: boolean; onClose: () => void }) {
  const [period, setPeriod] = useState<Period>("30d");
  const { orgId } = useUserOrg();
  const { user } = useAuth();
  const { data: stats, loading, error, reload } = useDashboardStats(period, orgId);

  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="space-y-12">
      {showOnboarding && (
        <section className="rounded-lg border border-border bg-card p-8 relative">
          <button onClick={onClose} className="absolute top-5 right-5 text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
          <h2 className="font-serif text-3xl text-foreground">Welcome to saha.team</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Şirketinizin saha verisini AI-ready hale getirin. Verinizi ChatGPT, Claude, Copilot veya kendi modelinizle güvenli şekilde sorgulayın.
          </p>
          <ol className="mt-6 space-y-3 max-w-2xl">
            <Step n={1}>Saha veri kaynaklarını bağla</Step>
            <Step n={2}>Veriyi ekipman, iş, kanıt ve kapanış kayıtlarına dönüştür</Step>
            <Step n={3}>İstediğin AI client ile güvenli sorgula</Step>
          </ol>
        </section>
      )}

      <div>
        <Breadcrumb screen="dashboard" />
        <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-5xl text-foreground">{workspaceName(user?.email)}</h1>
            <p className="text-sm text-muted-foreground mt-2">AI-ready saha verisi, veri kalitesi ve kullanım performansı.</p>
          </div>
          <div className="inline-flex border border-border rounded-md overflow-hidden text-sm bg-card">
            {(["7d", "14d", "30d", "90d"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 transition-colors ${period === p ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
      <section className="rounded-lg border border-border bg-card p-8">
        <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Operasyon Performansı ({period})</div>
        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <Metric
            value={loading || !stats ? <Skeleton className="h-9 w-20" /> : fmt(stats.totalRecords)}
            label="AI-ready kayıt"
          />
          <Metric
            value={
              loading || !stats ? <Skeleton className="h-9 w-20" /> : stats.avgQuality === null ? "—" : `${stats.avgQuality}%`
            }
            label="Data quality score"
          />
          <Metric
            value={loading || !stats ? <Skeleton className="h-9 w-20" /> : fmt(stats.evidencedClosed)}
            label="Kanıtlı kapanış"
          />
          <Metric
            value={loading || !stats ? <Skeleton className="h-9 w-20" /> : fmt(stats.queriesInPeriod)}
            label="Sorgu bu dönem"
          />
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-5 text-xs text-muted-foreground mb-3">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Kayıt</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-600" /> Sorgu</span>
          </div>
          <DashboardChart loading={loading} series={stats?.series ?? []} totalRecords={stats?.totalRecords ?? 0} />
        </div>
      </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallCard icon={Sparkles} title="AI Clients" text="Claude, ChatGPT, Copilot veya local LLM bağlantısı kurun." />
        <SmallCard icon={Database} title="Data Sources" text="WhatsApp, servis formu, doküman, fotoğraf ve ERP verilerini bağlayın." />
        <SmallCard icon={Code2} title="API Keys" text="Kurumsal AI ajanları için güvenli API ve MCP erişimi oluşturun." />
        <SmallCard icon={ShieldCheck} title="Quality Score" text="Eksik kök neden, kanıtsız kapanış ve eşleşmeyen kayıtları görün." />
      </div>
    </div>
  );
}

function Metric({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div>
      <div className="font-serif text-4xl text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-1.5">{label}</div>
    </div>
  );
}

function SmallCard({ icon: Icon, title, text }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 hover:border-foreground/20 transition-colors">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="font-serif text-xl text-foreground mt-3">{title}</div>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{text}</p>
    </div>
  );
}

function DashboardChart({
  loading,
  series,
  totalRecords,
}: {
  loading: boolean;
  series: { date: string; records: number; queries: number }[];
  totalRecords: number;
}) {
  if (loading) {
    return <Skeleton className="h-56 w-full" />;
  }
  if (totalRecords === 0) {
    return (
      <div className="h-56 w-full rounded-md border border-dashed border-border flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Henüz kayıt yok — ilk saha verisini ekleyin</p>
      </div>
    );
  }
  const data = series.map((p) => ({
    ...p,
    label: new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  }));
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Line type="monotone" dataKey="records" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} name="Kayıt" />
          <Line type="monotone" dataKey="queries" stroke="rgb(5, 150, 105)" strokeWidth={1.5} dot={false} name="Sorgu" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* -------- DATA SOURCES -------- */

function DataSourcesScreen() {
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingDismissed(ONBOARDING_DATASOURCES_KEY));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { orgId } = useUserOrg();
  const { records, loading: recordsLoading, error: recordsError, reload: reloadRecords } = useRecentFieldRecords(orgId, refreshKey);
  const [selected, setSelected] = useState<FieldRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <div className="space-y-12">
      {showOnboarding && (
        <section className="rounded-lg border border-border bg-card p-8 relative">
          <button onClick={() => { dismissOnboarding(ONBOARDING_DATASOURCES_KEY); setShowOnboarding(false); }} className="absolute top-5 right-5 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
          <h2 className="font-serif text-3xl text-foreground">Welcome to saha.team</h2>
          <p className="text-sm text-muted-foreground mt-1">0 / 5 free queries used · No credit card required</p>

          <div className="mt-8">
            <div className="flex items-start gap-4">
              <span className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded bg-muted text-xs border border-border">1</span>
              <div className="flex-1 min-w-0">
                <div className="text-foreground font-medium">Connect an AI client</div>
                <p className="text-sm text-muted-foreground mt-1 mb-5">
                  Connect your AI assistant to access your organization's field data through saha.team.
                </p>
                <AIClientPanel />
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-start gap-4">
            <span className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded bg-muted text-xs border border-border">2</span>
            <div className="flex-1 min-w-0">
              <div className="text-foreground font-medium">Choose a workflow</div>
              <p className="text-sm text-muted-foreground mt-1 mb-5">
                Select how your AI client should use your field memory.
              </p>
              <WorkflowPanel />
            </div>
          </div>
        </section>
      )}

      <div>
        <Breadcrumb screen="data-sources" />
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-5xl text-foreground">Data Sources</h1>
            <p className="text-sm text-muted-foreground mt-2">Saha verisi ve operasyon kaynaklarınızı bağlayın.</p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Add source
          </button>
        </div>
      </div>

      <AddFieldRecordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        orgId={orgId}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />

      <section>
        <h3 className="text-sm font-medium text-foreground mb-4">Field Operations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SourceCard title="WhatsApp İş Mesajları" text="Bakım şefi, operatör ve saha ekiplerinden gelen görev mesajları." status="Setup" />
          <SourceCard title="Mobil Kanıt Akışı" text="Fotoğraf, ses, video, ölçüm, QR ve kapanış notları." status="Setup" />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-foreground mb-4">Business Systems</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SourceCard title="Servis Formları & Excel" text="Eski servis formları, kontrol listeleri ve kapanış kayıtları." status="Setup" />
          <SourceCard title="ERP / CMMS Export" text="SAP, Maximo, Logo, Excel veya özel bakım sistemi exportları." status="Setup" />
          <SourceCard title="Teknik Dokümanlar" text="OEM kılavuzları, HSE prosedürleri, bakım talimatları ve PDF arşivi." status="Setup" />
          <SourceCard title="Ekipman Listesi" text="Ekipman kodları, lokasyonlar, parçalar ve varlık hiyerarşisi." status="Setup" />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-foreground mb-4">Son Saha Kayıtları</h3>
        {recordsError ? (
          <ErrorState message={recordsError} onRetry={reloadRecords} />
        ) : (
          <RecentRecordsList
            records={records}
            loading={recordsLoading}
            onAdd={() => setDialogOpen(true)}
            onSelect={(r) => { setSelected(r); setDetailOpen(true); }}
          />
        )}
        <FieldRecordDetailSheet
          record={selected}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onUpdated={() => { setRefreshKey((k) => k + 1); reloadRecords(); }}
        />
      </section>

      <section className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 blur-sm select-none pointer-events-none">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5 h-32">
              <div className="h-3 w-24 bg-muted rounded mb-3" />
              <div className="h-2 w-full bg-muted rounded mb-2" />
              <div className="h-2 w-3/4 bg-muted rounded" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-md bg-card/80 backdrop-blur p-6 rounded-lg">
            <Lock className="h-5 w-5 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-serif text-2xl text-foreground">Contact us for more access</h4>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              HSE, kalite denetim, lojistik, inşaat ve saha satış veri kaynakları için enterprise erişim açılabilir.
            </p>
            <button className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90">
              <Mail className="h-4 w-4" /> Contact us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function RecentRecordsList({ records, loading, onAdd, onSelect }: { records: FieldRecord[]; loading: boolean; onAdd?: () => void; onSelect?: (r: FieldRecord) => void }) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        {[0, 1, 2].map((i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-24 ml-auto" />
          </div>
        ))}
      </div>
    );
  }
  if (records.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Henüz saha kaydı yok"
        description='"Add source" ile ilk saha kaydınızı ekleyin — anında AI sorgularına dahil olur.'
        action={onAdd && (
          <button onClick={onAdd} className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs hover:opacity-90">
            <Plus className="h-3.5 w-3.5" /> Add source
          </button>
        )}
      />
    );
  }
  const statusLabel: Record<string, string> = { open: "Açık", closed: "Kapandı", pending: "Beklemede" };
  const statusClass: Record<string, string> = {
    open: "bg-amber-100 text-amber-800",
    closed: "bg-emerald-100 text-emerald-800",
    pending: "bg-muted text-muted-foreground",
  };
  return (
    <div className="rounded-lg border border-border bg-card divide-y divide-border">
      {records.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onSelect?.(r)}
          className="w-full text-left px-5 py-4 flex items-center gap-4 text-sm hover:bg-muted/50 transition-colors"
        >
          <span className="font-mono text-[11px] text-muted-foreground w-16 shrink-0">{r.id.slice(0, 8)}</span>
          <div className="min-w-0 flex-1">
            <div className="text-foreground truncate">{r.topic || "—"}</div>
            <div className="text-xs text-muted-foreground truncate">{r.location || "Lokasyon belirtilmedi"}</div>
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded ${statusClass[r.status] ?? statusClass.pending}`}>
            {statusLabel[r.status] ?? r.status}
          </span>
          <span className="text-xs text-muted-foreground w-24 text-right shrink-0">{relativeTime(r.created_at)}</span>
        </button>
      ))}
    </div>
  );
}

function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "şimdi";
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
  return new Date(iso).toLocaleDateString();
}

function SourceCard({ title, text, status }: { title: string; text: string; status: "Connected" | "Syncing" | "Setup" }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 flex items-start justify-between gap-4 hover:border-foreground/20 transition-colors">
      <div className="flex items-start gap-4 min-w-0">
        <div className="h-9 w-9 rounded-md bg-muted border border-border flex items-center justify-center shrink-0">
          <Database className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="font-serif text-lg text-foreground">{title}</div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{text}</p>
        </div>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

/* -------- AI CLIENTS -------- */

function AIClientsScreen() {
  return (
    <div className="space-y-12">
      <div>
        <Breadcrumb screen="ai-clients" />
        <h1 className="font-serif text-5xl text-foreground mt-4">AI Clients</h1>
        <p className="text-sm text-muted-foreground mt-2">
          AI-ready saha hafızanızı istediğiniz yapay zekâ ile güvenli şekilde kullanın.
        </p>
      </div>

      <section className="rounded-lg border border-border bg-card p-8">
        <h2 className="font-serif text-2xl text-foreground mb-6">Connect an AI client</h2>
        <AIClientPanel compact />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallCard icon={Sparkles} title="Claude" text="MCP üzerinden saha hafızasına kaynaklı erişim." />
        <SmallCard icon={Sparkles} title="ChatGPT" text="Enterprise connector veya API gateway ile sorgulama." />
        <SmallCard icon={Sparkles} title="Copilot" text="Microsoft ortamında izinli saha verisi erişimi." />
        <SmallCard icon={Sparkles} title="Local LLM" text="Veri dışarı çıkmadan kendi sunucunuzdaki modele bağlanın." />
      </div>
    </div>
  );
}

/* -------- DATA QUALITY -------- */

function DataQualityScreen() {
  const { orgId } = useUserOrg();
  const { data, loading, error, reload } = useDataQuality(orgId);

  const fmt = (n: number | null | undefined, suffix = "") =>
    loading || data === null ? "…" : n === null || n === undefined ? "—" : `${n}${suffix}`;

  return (
    <div className="space-y-10">
      <div>
        <Breadcrumb screen="data-quality" />
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-5xl text-foreground">Data Quality</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Sahadan gelen verinin AI tarafından güvenilir kullanılabilirliğini ölçün.
            </p>
          </div>
          <button
            onClick={() => {
              reload();
              logAIQuery({
                orgId,
                query_text: "Manual data quality audit run",
                sources_accessed: ["field_records"],
              });
              toast.success("Analiz güncellendi");
            }}
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90"
          >
            Run audit
          </button>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QualityCard value={loading ? <Skeleton className="h-12 w-20" /> : fmt(data?.qualityScore ?? null, "%")} label="Quality Score" text="Genel AI-ready veri kalitesi." />
            <QualityCard value={loading ? <Skeleton className="h-12 w-20" /> : fmt(data?.evidencedClosed ?? 0)} label="Kanıtlı Kapanış" text="Fotoğraf, ses veya ölçümle kapanan işler." />
            <QualityCard value={loading ? <Skeleton className="h-12 w-20" /> : fmt(data?.missingRootCause ?? 0)} label="Eksik Kök Neden" text="Kapanmış ama kök nedeni eksik işler." />
            <QualityCard value={loading ? <Skeleton className="h-12 w-20" /> : fmt(data?.unmatchedEvidence ?? 0)} label="Eşleşmeyen Kanıt" text="İş veya ekipmana bağlanmamış fotoğraf/ses kayıtları." />
          </div>

          <section className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-serif text-2xl text-foreground">Fix suggestions</h3>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : (data?.issues.length ?? 0) === 0 ? (
              <EmptyState icon={ShieldCheck} title="Tüm kayıtlar AI-ready" description="İyi iş — düzeltilecek bir kayıt bulunamadı." />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/50">
                    <th className="text-left font-medium px-6 py-3">Problem</th>
                    <th className="text-left font-medium px-6 py-3">Kayıt</th>
                    <th className="text-left font-medium px-6 py-3">Öneri</th>
                    <th className="text-left font-medium px-6 py-3">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.issues.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-6 py-4 text-foreground">{r.problem}</td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{r.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{r.suggestion}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full border border-border px-2.5 py-0.5 text-xs">{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function QualityCard({ value, label, text }: { value: React.ReactNode; label: string; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="font-serif text-5xl text-foreground">{value}</div>
      <div className="text-sm text-foreground mt-2">{label}</div>
      <p className="text-xs text-muted-foreground mt-1">{text}</p>
    </div>
  );
}

/* -------- API / MCP -------- */

function APIScreen() {
  const tools = [
    { t: "search_field_memory", d: "Ekipman, iş, denetim ve saha kayıtlarında kaynaklı arama", a: "Read" },
    { t: "get_asset_history", d: "Ekipman geçmişi, tekrar eden arıza ve kapanış kayıtları", a: "Read" },
    { t: "list_missing_evidence", d: "Eksik kanıt, kök neden veya kapanış alanlarını listeler", a: "Read" },
    { t: "create_followup_task", d: "Eksik veri için saha ekibine takip görevi açar", a: "Write" },
  ];
  const { orgId } = useUserOrg();
  const { keys, loading: keysLoading, error: keysError, reload } = useApiKeys(orgId);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-10">
      <div>
        <Breadcrumb screen="api" />
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-5xl text-foreground">API / MCP</h1>
            <p className="text-sm text-muted-foreground mt-2">
              ToolA Data Layer'ı kurumsal agent'lara ve kendi uygulamalarınıza açın.
            </p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Create key
          </button>
        </div>
      </div>

      <CreateApiKeyDialog open={dialogOpen} onOpenChange={setDialogOpen} orgId={orgId} onCreated={reload} />

      <section className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-serif text-2xl text-foreground">MCP Endpoint</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Claude, Cursor, ChatGPT connector veya custom agent'lar için model-bağımsız erişim.
        </p>
        <CodeBlock>https://api.saha.team/mcp</CodeBlock>
      </section>

      {keysError ? (
        <ErrorState message={keysError} onRetry={reload} />
      ) : (
        <ApiKeysTable keys={keys} loading={keysLoading} onChange={reload} onCreate={() => setDialogOpen(true)} />
      )}

      <section className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-serif text-2xl text-foreground">Available tools</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/50">
              <th className="text-left font-medium px-6 py-3">Tool</th>
              <th className="text-left font-medium px-6 py-3">Açıklama</th>
              <th className="text-left font-medium px-6 py-3">Yetki</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((r) => (
              <tr key={r.t} className="border-t border-border">
                <td className="px-6 py-4 font-mono text-xs text-foreground">{r.t}</td>
                <td className="px-6 py-4 text-muted-foreground">{r.d}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs ${r.a === "Write" ? "border-primary/30 text-primary bg-primary/5" : "border-border text-muted-foreground"}`}>
                    {r.a}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function ApiKeysTable({ keys, loading, onChange, onCreate }: { keys: ApiKey[]; loading: boolean; onChange: () => void; onCreate?: () => void }) {
  const [pendingDelete, setPendingDelete] = useState<ApiKey | null>(null);

  const toggleActive = async (k: ApiKey) => {
    const { error } = await supabase.from("api_keys").update({ is_active: !k.is_active }).eq("id", k.id);
    if (error) toast.error(error.message);
    else {
      toast.success(k.is_active ? "Anahtar pasifleştirildi" : "Anahtar etkinleştirildi");
      onChange();
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { error } = await supabase.from("api_keys").delete().eq("id", pendingDelete.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Anahtar silindi");
      onChange();
    }
    setPendingDelete(null);
  };

  return (
    <section className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-serif text-2xl text-foreground">API Anahtarları</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/50">
            <th className="text-left font-medium px-6 py-3">Name</th>
            <th className="text-left font-medium px-6 py-3">Preview</th>
            <th className="text-left font-medium px-6 py-3">Created</th>
            <th className="text-left font-medium px-6 py-3">Last used</th>
            <th className="text-left font-medium px-6 py-3">Active</th>
            <th className="text-right font-medium px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {loading && [0, 1, 2].map((i) => (
            <tr key={i} className="border-t border-border">
              <td colSpan={6} className="px-6 py-4"><Skeleton className="h-5 w-full" /></td>
            </tr>
          ))}
          {!loading && keys.length === 0 && (
            <tr><td colSpan={6} className="p-0">
              <EmptyState
                icon={KeyRound}
                title="Henüz API anahtarı yok"
                description="Kurumsal AI ajanları için ilk API anahtarınızı oluşturun."
                action={onCreate && (
                  <button onClick={onCreate} className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs hover:opacity-90">
                    <Plus className="h-3.5 w-3.5" /> Create key
                  </button>
                )}
              />
            </td></tr>
          )}
          {!loading && keys.map((k) => (
            <tr key={k.id} className="border-t border-border">
              <td className="px-6 py-4 text-foreground">{k.name}</td>
              <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{k.key_preview}</td>
              <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{relativeTime(k.created_at)}</td>
              <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                {k.last_used_at ? relativeTime(k.last_used_at) : "—"}
              </td>
              <td className="px-6 py-4">
                <Switch checked={k.is_active} onCheckedChange={() => toggleActive(k)} />
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => setPendingDelete(k)}
                  className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anahtarı sil?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.name}" anahtarı kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-primary text-primary-foreground hover:opacity-90">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

/* -------- AUDIT -------- */

function AuditScreen() {
  const { orgId } = useUserOrg();
  const { entries, loading, error, reload } = useAuditLog(orgId);
  const [search, setSearch] = useState("");
  const [client, setClient] = useState("Tümü");

  const filtered = entries.filter((e) => {
    if (client !== "Tümü" && (e.ai_client ?? "") !== client) return false;
    if (search && !(e.query_text ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-10">
      <div>
        <Breadcrumb screen="audit" />
        <h1 className="font-serif text-5xl text-foreground mt-4">Audit</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Hangi AI client, hangi saha verisine, hangi kaynak üzerinden erişti?
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sorgu içinde ara…"
          className="flex-1 h-10 px-3 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <select
          value={client}
          onChange={(e) => setClient(e.target.value)}
          className="h-10 px-3 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {["Tümü", "Platform", "Claude", "ChatGPT", "Copilot", "Local LLM"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
      <section className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title={entries.length === 0 ? "Henüz AI sorgusu yapılmadı" : "Filtreyle eşleşen sorgu yok"}
            description={entries.length === 0 ? "AI sorguları yapıldıkça burada görünür." : "Farklı bir client veya arama deneyin."}
          />
        ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/50">
              <th className="text-left font-medium px-6 py-3">Zaman</th>
              <th className="text-left font-medium px-6 py-3">Client</th>
              <th className="text-left font-medium px-6 py-3">Sorgu</th>
              <th className="text-left font-medium px-6 py-3">Kaynaklar</th>
              <th className="text-left font-medium px-6 py-3">Kullanıcı</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{relativeTime(r.created_at)}</td>
                <td className="px-6 py-4 text-foreground">{r.ai_client ?? "—"}</td>
                <td className="px-6 py-4 text-foreground">{r.query_text ?? "—"}</td>
                <td className="px-6 py-4 text-muted-foreground">{(r.sources_accessed ?? []).join(", ") || "—"}</td>
                <td className="px-6 py-4 text-xs text-muted-foreground">{r.user_email ? (r.user_email.length > 24 ? r.user_email.slice(0, 24) + "…" : r.user_email) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </section>
      )}
    </div>
  );
}

function BillingScreen() {
  return (
    <div className="space-y-8">
      <div>
        <Breadcrumb screen="billing" />
        <h1 className="font-serif text-5xl text-foreground mt-4">Billing</h1>
        <p className="text-sm text-muted-foreground mt-2">Kredi, kullanım ve fatura yönetimi.</p>
      </div>
      <section className="rounded-lg border border-border bg-card p-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Bakiye</div>
        <div className="font-serif text-5xl mt-2">$0.00</div>
        <button className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90">
          Kredi ekle
        </button>
      </section>
    </div>
  );
}

/* -------------------- SIDEBAR -------------------- */

function SidebarContents({ active, onNavigate }: { active: Screen; onNavigate?: () => void }) {
  const { user } = useAuth();
  const { orgId } = useUserOrg();
  const { count, loading: countLoading } = useOrgRecordCount(orgId);
  const navigate = useNavigate();
  const used = count ?? 0;
  const pct = Math.min(100, Math.round((used / RECORD_QUOTA) * 1000) / 10);
  const remaining = Math.max(0, RECORD_QUOTA - used);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6">
        <LogoFull className="h-8" />
      </div>

      <div className="px-6 pb-6 space-y-6">
        <button className="w-full flex items-center justify-between rounded-md border border-border bg-card px-3 py-2.5 text-left hover:border-foreground/20 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">
              {workspaceInitial(user?.email)}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-foreground truncate">{workspaceName(user?.email)}</div>
              <div className="text-[11px] text-muted-foreground truncate">ToolA Data Layer</div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">AI-ready kayıt</span>
            <span className="text-[11px] text-muted-foreground">
              {countLoading ? "…" : `${used.toLocaleString()} / ${RECORD_QUOTA.toLocaleString()}`}
            </span>
          </div>
          <div className="h-1 bg-muted rounded overflow-hidden">
            <div className="h-full bg-foreground transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">
            {countLoading ? "Yükleniyor…" : `${remaining.toLocaleString()} kayıt hakkı kaldı`}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Kredi</span>
            <button className="text-[11px] text-primary hover:underline">Kredi ekle</button>
          </div>
          <div className="font-serif text-3xl text-foreground mt-1">$0.00</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 border-t border-border overflow-y-auto">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground px-3 py-3">Organization</div>
        <div className="space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { navigate(SCREEN_TO_PATH[item.id]); onNavigate?.(); }}
                className={`relative w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                }`}
              >
                {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary" />}
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      <SidebarFooterUser />
    </div>
  );
}

function Sidebar({ active }: { active: Screen }) {
  return (
    <aside className="hidden lg:flex w-[284px] fixed inset-y-0 left-0 border-r border-sidebar-border bg-sidebar flex-col">
      <SidebarContents active={active} />
    </aside>
  );
}

function SidebarFooterUser() {
  const { user, signOut } = useAuth();
  const email = user?.email ?? "";
  const initial = workspaceInitial(email);
  return (
    <div className="p-4 border-t border-border flex items-center gap-3">
      <div className="h-8 w-8 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">{initial}</div>
      <div className="min-w-0 flex-1">
        <div className="text-sm text-foreground truncate">Account</div>
        <div className="text-[11px] text-muted-foreground truncate">{email}</div>
      </div>
      <button
        onClick={() => signOut()}
        title="Sign out"
        className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

function MobileTopBar({ active, onMenu }: { active: Screen; onMenu: () => void }) {
  return (
    <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 border-b border-border bg-background/95 backdrop-blur">
      <button onClick={onMenu} className="p-2 -ml-2 rounded-md hover:bg-accent" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>
      <LogoFull className="h-6" />
      <span className="ml-auto text-xs text-muted-foreground">{SCREEN_LABEL[active]}</span>
    </div>
  );
}

/* -------------------- ROOT -------------------- */

export default function Index() {
  const location = useLocation();
  const active: Screen = PATH_TO_SCREEN[location.pathname] ?? "dashboard";
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingDismissed(ONBOARDING_DASHBOARD_KEY));
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.title = `saha.team — ${SCREEN_LABEL[active]}`;
  }, [active]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar active={active} />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[284px] sm:max-w-[284px] bg-sidebar">
          <SidebarContents active={active} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="lg:ml-[284px]">
        <MobileTopBar active={active} onMenu={() => setMobileOpen(true)} />
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-10 lg:py-14">
          {active === "dashboard" && <DashboardScreen showOnboarding={showOnboarding} onClose={() => { dismissOnboarding(ONBOARDING_DASHBOARD_KEY); setShowOnboarding(false); }} />}
          {active === "data-sources" && <DataSourcesScreen />}
          {active === "ai-clients" && <AIClientsScreen />}
          {active === "data-quality" && <DataQualityScreen />}
          {active === "api" && <APIScreen />}
          {active === "audit" && <AuditScreen />}
          {active === "billing" && <BillingScreen />}
        </div>
      </main>
    </div>
  );
}

