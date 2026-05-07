import { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats, type Period } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

function LogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" aria-hidden>
      <rect x="1"    y="1"    width="10" height="10" fill="hsl(var(--foreground))" />
      <rect x="13.5" y="1.5"  width="9"  height="9"  fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.25" />
      <rect x="1.5"  y="13.5" width="9"  height="9"  fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.25" />
      <rect x="13"   y="13"   width="10" height="10" fill="hsl(var(--foreground))" />
    </svg>
  );
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
  return (
    <div className="text-sm text-muted-foreground">
      <span>Ozi's Workspace</span>
      <span className="mx-2">›</span>
      <span className="text-foreground">{SCREEN_LABEL[screen]}</span>
    </div>
  );
}

/* -------------------- AI CLIENT TABS -------------------- */

const AI_TABS = ["Claude", "ChatGPT", "Copilot", "Local LLM", "Custom Agent"] as const;
type AITab = (typeof AI_TABS)[number];

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
  const { data: stats, loading } = useDashboardStats(period);

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
            <h1 className="font-serif text-5xl text-foreground">Ozi's Workspace</h1>
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

      <section className="rounded-lg border border-border bg-card p-8">
        <div className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Operasyon Performansı</div>
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

function ChartPlaceholder() {
  return (
    <div className="relative h-56 w-full">
      <svg viewBox="0 0 800 200" className="w-full h-full" preserveAspectRatio="none">
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="0" y1={i * 50} x2="800" y2={i * 50} stroke="hsl(var(--border))" strokeDasharray="2 4" strokeWidth="1" />
        ))}
        <path
          d="M 0 170 L 100 168 L 200 165 L 300 160 L 400 158 L 500 152 L 600 148 L 700 145 L 800 140"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
        />
        <path
          d="M 0 180 L 100 178 L 200 176 L 300 174 L 400 172 L 500 170 L 600 168 L 700 166 L 800 164"
          stroke="rgb(5, 150, 105)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.7"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-muted-foreground pt-2">
        <span>Mar 30</span><span>Apr 4</span><span>Apr 9</span><span>Apr 14</span><span>Apr 19</span><span>Apr 24</span><span>Apr 29</span>
      </div>
    </div>
  );
}

/* -------- DATA SOURCES -------- */

function DataSourcesScreen() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <div className="space-y-12">
      {showOnboarding && (
        <section className="rounded-lg border border-border bg-card p-8 relative">
          <button onClick={() => setShowOnboarding(false)} className="absolute top-5 right-5 text-muted-foreground hover:text-foreground">
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
            <div className="text-foreground font-medium pt-0.5">Explore & query</div>
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
          <button className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" /> Add source
          </button>
        </div>
      </div>

      <section>
        <h3 className="text-sm font-medium text-foreground mb-4">Field Operations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SourceCard title="WhatsApp İş Mesajları" text="Bakım şefi, operatör ve saha ekiplerinden gelen görev mesajları." status="Connected" />
          <SourceCard title="Mobil Kanıt Akışı" text="Fotoğraf, ses, video, ölçüm, QR ve kapanış notları." status="Connected" />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-foreground mb-4">Business Systems</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SourceCard title="Servis Formları & Excel" text="Eski servis formları, kontrol listeleri ve kapanış kayıtları." status="Syncing" />
          <SourceCard title="ERP / CMMS Export" text="SAP, Maximo, Logo, Excel veya özel bakım sistemi exportları." status="Setup" />
          <SourceCard title="Teknik Dokümanlar" text="OEM kılavuzları, HSE prosedürleri, bakım talimatları ve PDF arşivi." status="Connected" />
          <SourceCard title="Ekipman Listesi" text="Ekipman kodları, lokasyonlar, parçalar ve varlık hiyerarşisi." status="Connected" />
        </div>
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
  const rows = [
    { p: "Kök neden eksik", k: "WO-1842", s: "Teknisyenden kapanış detayı iste", d: "Bekliyor" },
    { p: "Ekipman adı belirsiz", k: "WhatsApp #392", s: "\"Hat 2 pompa\" → P-204 olarak eşleştir", d: "Önerildi" },
    { p: "Fotoğraf bağlanmamış", k: "IMG_9042", s: "Son açık işe bağla", d: "Kontrol" },
  ];
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
          <button className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90">
            Run audit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QualityCard value="87" label="Quality Score" text="Genel AI-ready veri kalitesi." />
        <QualityCard value="312" label="Kanıtlı Kapanış" text="Fotoğraf, ses veya ölçümle kapanan işler." />
        <QualityCard value="49" label="Eksik Kök Neden" text="Kapanmış ama kök nedeni eksik işler." />
        <QualityCard value="18" label="Eşleşmeyen Kanıt" text="İş veya ekipmana bağlanmamış fotoğraf/ses kayıtları." />
      </div>

      <section className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-serif text-2xl text-foreground">Fix suggestions</h3>
        </div>
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
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-6 py-4 text-foreground">{r.p}</td>
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{r.k}</td>
                <td className="px-6 py-4 text-muted-foreground">{r.s}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full border border-border px-2.5 py-0.5 text-xs">{r.d}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function QualityCard({ value, label, text }: { value: string; label: string; text: string }) {
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
          <button className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90">
            <Plus className="h-4 w-4" /> Create key
          </button>
        </div>
      </div>

      <section className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-serif text-2xl text-foreground">MCP Endpoint</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Claude, Cursor, ChatGPT connector veya custom agent'lar için model-bağımsız erişim.
        </p>
        <CodeBlock>https://api.saha.team/mcp</CodeBlock>
      </section>

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

/* -------- AUDIT -------- */

function AuditScreen() {
  const rows = [
    { z: "Bugün 09:48", c: "Claude", s: "P-204 geçmiş arızaları", k: "12 iş, 3 foto, 1 OEM PDF", u: "ozgur@toola.co" },
    { z: "Bugün 09:32", c: "ChatGPT", s: "Eksik kapanış kayıtları", k: "49 iş kaydı", u: "maintenance.manager" },
    { z: "Dün 17:15", c: "Local LLM", s: "Kanıtsız kapanan işler", k: "Servis formları", u: "it.admin" },
  ];
  return (
    <div className="space-y-10">
      <div>
        <Breadcrumb screen="audit" />
        <h1 className="font-serif text-5xl text-foreground mt-4">Audit</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Hangi AI client, hangi saha verisine, hangi kaynak üzerinden erişti?
        </p>
      </div>

      <section className="rounded-lg border border-border bg-card overflow-hidden">
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
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{r.z}</td>
                <td className="px-6 py-4 text-foreground">{r.c}</td>
                <td className="px-6 py-4 text-foreground">{r.s}</td>
                <td className="px-6 py-4 text-muted-foreground">{r.k}</td>
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{r.u}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
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

function Sidebar({ active, setActive }: { active: Screen; setActive: (s: Screen) => void }) {
  return (
    <aside className="w-full lg:w-[284px] lg:fixed lg:inset-y-0 lg:left-0 border-b lg:border-b-0 lg:border-r border-sidebar-border bg-sidebar flex flex-col">
      <div className="p-6 flex items-center gap-2.5">
        <LogoMark />
        <span className="font-serif text-2xl text-foreground">saha.team</span>
      </div>

      <div className="px-6 pb-6 space-y-6">
        <button className="w-full flex items-center justify-between rounded-md border border-border bg-card px-3 py-2.5 text-left hover:border-foreground/20 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">O</div>
            <div className="min-w-0">
              <div className="text-sm text-foreground truncate">Ozi's Workspace</div>
              <div className="text-[11px] text-muted-foreground truncate">ToolA Data Layer</div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">AI-ready kayıt</span>
            <span className="text-[11px] text-muted-foreground">1,284 / 5,000</span>
          </div>
          <div className="h-1 bg-muted rounded overflow-hidden">
            <div className="h-full bg-foreground" style={{ width: "25.6%" }} />
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">3,716 kayıt hakkı kaldı</div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Kredi</span>
            <button className="text-[11px] text-primary hover:underline">Kredi ekle</button>
          </div>
          <div className="font-serif text-3xl text-foreground mt-1">$0.00</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 border-t border-border">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground px-3 py-3">Organization</div>
        <div className="space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
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
    </aside>
  );
}

function SidebarFooterUser() {
  const { user, signOut } = useAuth();
  const email = user?.email ?? "";
  const initial = (email[0] ?? "U").toUpperCase();
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

/* -------------------- ROOT -------------------- */

export default function Index() {
  const [active, setActive] = useState<Screen>("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar active={active} setActive={setActive} />
      <main className="lg:ml-[284px]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-10 lg:py-14">
          {active === "dashboard" && <DashboardScreen showOnboarding={showOnboarding} onClose={() => setShowOnboarding(false)} />}
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
