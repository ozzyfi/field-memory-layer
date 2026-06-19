import { useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Paperclip,
  Plus,
  Send,
  History,
  Sparkles,
  Search,
  ShieldCheck,
  FileCheck,
  ScrollText,
  MapPin,
  CalendarRange,
  Database,
  FileText,
  FolderOpen,
  FilePlus2,
  LayoutDashboard,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Breadcrumb } from "@/pages/Index";

/* -------------------- MODES -------------------- */

type ModeId = "general" | "quality" | "compliance" | "audit";

const MODES: {
  id: ModeId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  prompts: string[];
}[] = [
  {
    id: "general",
    label: "General Search",
    description: "Search records, assets, work orders and past cases",
    icon: Search,
    placeholder: "Ask about records, assets, work orders or past cases…",
    prompts: [
      "Which issues are recurring across multiple locations?",
      "Which work orders have been open longest?",
      "Summarize the biggest operational risks this week.",
    ],
  },
  {
    id: "quality",
    label: "Quality Review",
    description: "Find incomplete or low-quality records",
    icon: ShieldCheck,
    placeholder: "Ask about missing fields, weak records or data quality…",
    prompts: [
      "Which records are missing root-cause information?",
      "Find work orders closed without evidence.",
      "Which locations have the lowest closure quality?",
    ],
  },
  {
    id: "compliance",
    label: "Compliance Check",
    description: "Check records against procedures and rules",
    icon: FileCheck,
    placeholder: "Ask about SOP adherence, mandatory evidence or non-compliance…",
    prompts: [
      "Which closures are not SOP-compliant?",
      "Show records missing mandatory photo evidence.",
      "Find non-compliant interventions this month.",
    ],
  },
  {
    id: "audit",
    label: "Audit Trail",
    description: "Review who changed what and when",
    icon: ScrollText,
    placeholder: "Ask who changed what, when and why…",
    prompts: [
      "Who edited closed work orders last week?",
      "Show all status changes for Pump P-204.",
      "Which records were reopened after closing?",
    ],
  },
];

/* -------------------- FILTERS -------------------- */

const LOCATION_OPTIONS = ["All locations", "Plant A — Gebze", "Plant B — Izmir", "Plant C — Adana"];
const TIME_OPTIONS = ["Last 90 days", "Last 7 days", "Last 30 days", "Last 12 months", "All time"];
const SOURCE_OPTIONS = ["All data sources", "WhatsApp", "Documents", "CRM", "ERP / CMMS", "Drive", "Sheets"];

/* -------------------- MODELS -------------------- */

const MODELS = [
  { label: "Auto", note: "Recommended" },
  { label: "Fast", note: "Quick answers" },
  { label: "Deep Analysis", note: "Slower, thorough" },
  { label: "Private / Local", note: "Stays on-prem" },
  { label: "Claude", note: "Anthropic" },
  { label: "GPT", note: "OpenAI" },
  { label: "Custom Agent", note: "Your agent" },
];

/* -------------------- TYPES -------------------- */

type StructuredAnswer = {
  summary: string;
  findings: string[];
  records: { id: string; topic: string; location: string }[];
  sources: string[];
  actions: string[];
  scope: { records: number; locations: number; range: string };
  dataGap?: string;
};

type ChatTurn = { id: string; question: string; mode: ModeId; answer: StructuredAnswer };
type Conversation = { id: string; title: string; when: string; turns: ChatTurn[] };

/* -------------------- MOCK ANSWER -------------------- */

function buildMockAnswer(q: string, mode: ModeId): StructuredAnswer {
  const base: Record<ModeId, StructuredAnswer> = {
    general: {
      summary:
        "Recurring conveyor bearing failures and prolonged open work orders are the dominant operational risks this week, concentrated across two plants.",
      findings: [
        "3 sites report the same conveyor bearing failure pattern in the last 30 days.",
        "12 work orders are open longer than 14 days, 4 of them critical.",
        "Spare-part delays are the most common closure blocker.",
      ],
      records: [
        { id: "REC-10428", topic: "Conveyor bearing failure", location: "Plant A — Gebze" },
        { id: "REC-10391", topic: "Open WO — gearbox vibration", location: "Plant B — Izmir" },
        { id: "REC-10355", topic: "Recurring belt misalignment", location: "Plant C — Adana" },
      ],
      sources: ["WhatsApp İş Mesajları", "ERP / CMMS Export", "Mobil Kanıt Akışı"],
      actions: [
        "Schedule a cross-plant bearing inspection.",
        "Escalate the 4 critical open work orders.",
        "Pre-order high-failure spare parts.",
      ],
      scope: { records: 142, locations: 3, range: "Last 90 days" },
    },
    quality: {
      summary:
        "Roughly a fifth of recent closures lack root-cause data, and several were closed without evidence — Plant C has the weakest closure quality.",
      findings: [
        "28 records are missing root-cause information.",
        "9 work orders were closed without any photo or measurement evidence.",
        "Plant C — Adana has the lowest average closure quality score (62%).",
      ],
      records: [
        { id: "REC-10402", topic: "Closed without root cause", location: "Plant C — Adana" },
        { id: "REC-10377", topic: "No evidence attached", location: "Plant C — Adana" },
        { id: "REC-10360", topic: "Incomplete closure note", location: "Plant A — Gebze" },
      ],
      sources: ["Servis Formları & Excel", "Mobil Kanıt Akışı"],
      actions: [
        "Require root-cause field before closing.",
        "Re-open the 9 evidence-less work orders.",
        "Run a closure-quality coaching session at Plant C.",
      ],
      scope: { records: 96, locations: 3, range: "Last 30 days" },
      dataGap: "Evidence metadata is missing for 9 records, so quality scores may be understated.",
    },
    compliance: {
      summary:
        "Most closures follow SOPs, but a cluster of high-risk interventions is missing mandatory evidence and signatures.",
      findings: [
        "7 closures do not meet the mandatory photo-evidence rule.",
        "3 high-risk interventions are missing supervisor sign-off.",
        "All LOTO-required tasks were compliant this month.",
      ],
      records: [
        { id: "REC-10415", topic: "Missing photo evidence", location: "Plant B — Izmir" },
        { id: "REC-10399", topic: "No supervisor sign-off", location: "Plant A — Gebze" },
      ],
      sources: ["Teknik Dokümanlar (SOP)", "Mobil Kanıt Akışı"],
      actions: [
        "Flag the 7 non-compliant closures for review.",
        "Request supervisor sign-off on 3 interventions.",
        "Notify compliance lead of the gap.",
      ],
      scope: { records: 64, locations: 2, range: "This month" },
    },
    audit: {
      summary:
        "Several closed work orders were edited after closing last week, and two records were reopened — all changes are attributable.",
      findings: [
        "5 closed work orders were edited within 48h of closing.",
        "2 records were reopened after being marked closed.",
        "All edits have an identified user and timestamp.",
      ],
      records: [
        { id: "REC-10428", topic: "Edited after close (status)", location: "Plant A — Gebze" },
        { id: "REC-10391", topic: "Reopened — gearbox vibration", location: "Plant B — Izmir" },
      ],
      sources: ["Audit Log", "ERP / CMMS Export"],
      actions: [
        "Review post-close edits with shift leads.",
        "Confirm reopen reasons are documented.",
        "Export the change log for the auditor.",
      ],
      scope: { records: 38, locations: 2, range: "Last 7 days" },
    },
  };
  return base[mode];
}

/* -------------------- COMPOSER -------------------- */

function Composer({
  mode,
  setMode,
  model,
  setModel,
  query,
  setQuery,
  onSend,
  compact,
}: {
  mode: ModeId;
  setMode: (m: ModeId) => void;
  model: string;
  setModel: (m: string) => void;
  query: string;
  setQuery: (q: string) => void;
  onSend: () => void;
  compact?: boolean;
}) {
  const current = MODES.find((m) => m.id === mode)!;
  const taRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="rounded-2xl border-[1.5px] border-border bg-card shadow-sm focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/10 transition-all">
      <textarea
        ref={taRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        rows={compact ? 1 : 3}
        placeholder={current.placeholder}
        className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-1">
        <div className="flex items-center gap-1">
          <button
            title="Attach file"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <button
            title="Add context"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              {model} <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {MODELS.map((m) => (
                <DropdownMenuItem key={m.label} onClick={() => setModel(m.label)} className="flex items-center justify-between gap-3">
                  <span className="text-foreground">{m.label}</span>
                  <span className="text-[11px] text-muted-foreground">{m.note}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={onSend}
            disabled={!query.trim()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
            title="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- ANSWER BLOCK -------------------- */

function AnswerCard({ turn }: { turn: ChatTurn }) {
  const a = turn.answer;
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted border border-border">
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="text-base text-foreground font-medium leading-relaxed pt-0.5">{turn.question}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        {/* scope */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Chip icon={Database}>{a.scope.records} records analysed</Chip>
          <Chip icon={MapPin}>{a.scope.locations} locations</Chip>
          <Chip icon={CalendarRange}>{a.scope.range}</Chip>
        </div>

        {a.dataGap && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{a.dataGap}</span>
          </div>
        )}

        <Section label="Executive summary">
          <p className="text-sm text-foreground leading-relaxed">{a.summary}</p>
        </Section>

        <Section label="Key findings">
          <ul className="space-y-1.5">
            {a.findings.map((f) => (
              <li key={f} className="flex gap-2 text-sm text-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                {f}
              </li>
            ))}
          </ul>
        </Section>

        <Section label="Relevant records">
          <div className="rounded-md border border-border divide-y divide-border">
            {a.records.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors">
                <span className="font-mono text-[11px] text-muted-foreground w-20 shrink-0">{r.id}</span>
                <span className="text-foreground truncate flex-1">{r.topic}</span>
                <span className="text-xs text-muted-foreground hidden sm:block">{r.location}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Sources">
          <div className="flex flex-wrap gap-2">
            {a.sources.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" /> {s}
              </span>
            ))}
          </div>
        </Section>

        <Section label="Recommended actions">
          <ol className="space-y-1.5">
            {a.actions.map((act, i) => (
              <li key={act} className="flex gap-2.5 text-sm text-foreground">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-[11px] border border-border">{i + 1}</span>
                {act}
              </li>
            ))}
          </ol>
        </Section>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <ActionButton icon={FolderOpen}>Open records</ActionButton>
          <ActionButton icon={FilePlus2}>Create report</ActionButton>
          <ActionButton icon={LayoutDashboard}>Save to dashboard</ActionButton>
        </div>
      </div>
    </div>
  );
}

function Chip({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
      <Icon className="h-3 w-3" /> {children}
    </span>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2">{label}</div>
      {children}
    </div>
  );
}

function ActionButton({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors">
      <Icon className="h-3.5 w-3.5" /> {children}
    </button>
  );
}

/* -------------------- HISTORY (mock) -------------------- */

const MOCK_HISTORY: Conversation[] = [
  { id: "h1", title: "Recurring conveyor failures across plants", when: "2 hours ago", turns: [] },
  { id: "h2", title: "Work orders open longest", when: "Yesterday", turns: [] },
  { id: "h3", title: "Records missing root cause", when: "2 days ago", turns: [] },
  { id: "h4", title: "Non-compliant closures this month", when: "Last week", turns: [] },
];

/* -------------------- SCREEN -------------------- */

export function AIChatScreen() {
  const [mode, setMode] = useState<ModeId>("general");
  const [model, setModel] = useState("Auto");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(LOCATION_OPTIONS[0]);
  const [time, setTime] = useState(TIME_OPTIONS[0]);
  const [source, setSource] = useState(SOURCE_OPTIONS[0]);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const current = MODES.find((m) => m.id === mode)!;
  const started = turns.length > 0;

  const send = () => {
    const q = query.trim();
    if (!q) return;
    setTurns((prev) => [
      ...prev,
      { id: `${Date.now()}`, question: q, mode, answer: buildMockAnswer(q, mode) },
    ]);
    setQuery("");
  };

  const newChat = () => {
    setTurns([]);
    setQuery("");
  };

  const ModeDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:border-foreground/20 transition-colors">
        <current.icon className="h-4 w-4 text-primary" />
        {current.label}
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        {MODES.map((m) => {
          const Icon = m.icon;
          return (
            <DropdownMenuItem
              key={m.id}
              onClick={() => { setMode(m.id); }}
              className="flex items-start gap-3 py-2.5"
            >
              <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-sm text-foreground">{m.label}</div>
                <div className="text-xs text-muted-foreground">{m.description}</div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const Filters = (
    <div className="flex flex-wrap items-center gap-2">
      <FilterDropdown icon={MapPin} value={location} options={LOCATION_OPTIONS} onChange={setLocation} />
      <FilterDropdown icon={CalendarRange} value={time} options={TIME_OPTIONS} onChange={setTime} />
      <FilterDropdown icon={Database} value={source} options={SOURCE_OPTIONS} onChange={setSource} />
    </div>
  );

  return (
    <div className="relative min-h-[70vh]">
      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <Breadcrumb screen="ai-chat" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistoryOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <History className="h-3.5 w-3.5" /> History
          </button>
          <button
            onClick={newChat}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> New chat
          </button>
        </div>
      </div>

      {!started ? (
        /* ---------- EMPTY STATE ---------- */
        <div className="mx-auto max-w-3xl pt-12 lg:pt-20 pb-24 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-serif text-5xl text-foreground">Ask saha.team</h1>
          <p className="text-sm text-muted-foreground mt-3">
            Search, analyse and review your operational memory.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {ModeDropdown}
            {Filters}
          </div>

          <div className="mt-6 text-left">
            <Composer
              mode={mode}
              setMode={setMode}
              model={model}
              setModel={setModel}
              query={query}
              setQuery={setQuery}
              onSend={send}
            />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {current.prompts.map((p) => (
              <button
                key={p}
                onClick={() => setQuery(p)}
                className="inline-flex items-center rounded-full border border-border bg-background px-3.5 py-1.5 text-xs text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ---------- CONVERSATION STATE ---------- */
        <>
          <div className="mx-auto max-w-3xl pt-8 pb-40 space-y-10">
            {turns.map((t) => (
              <AnswerCard key={t.id} turn={t} />
            ))}
          </div>

          {/* sticky composer */}
          <div className="fixed bottom-0 inset-x-0 lg:left-[284px] bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4 px-6 lg:px-12 z-20">
            <div className="mx-auto max-w-3xl">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {ModeDropdown}
                {Filters}
              </div>
              <Composer
                mode={mode}
                setMode={setMode}
                model={model}
                setModel={setModel}
                query={query}
                setQuery={setQuery}
                onSend={send}
                compact
              />
            </div>
          </div>
        </>
      )}

      {/* history drawer */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="right" className="w-[360px] sm:max-w-[360px]">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl">Chat history</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-1">
            {MOCK_HISTORY.map((c) => (
              <button
                key={c.id}
                onClick={() => setHistoryOpen(false)}
                className="w-full text-left rounded-md px-3 py-2.5 hover:bg-muted transition-colors"
              >
                <div className="text-sm text-foreground truncate">{c.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.when}</div>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterDropdown({
  icon: Icon,
  value,
  options,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
        <Icon className="h-3.5 w-3.5" />
        {value}
        <ChevronDown className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {options.map((o) => (
          <DropdownMenuItem key={o} onClick={() => onChange(o)} className="text-sm">
            {o}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
