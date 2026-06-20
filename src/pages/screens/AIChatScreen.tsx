import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Plus,
  Send,
  Square,
  History,
  Sparkles,
  Search,
  ShieldCheck,
  FileCheck,
  ScrollText,
  MapPin,
  CalendarRange,
  Database,
  Copy,
  RotateCw,
  FolderOpen,
  Check,
  AlertTriangle,
  FileText,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Breadcrumb } from "@/pages/Index";
import { useUserOrg } from "@/hooks/useUserOrg";
import { useAIChat, type ChatMessage } from "@/hooks/useAIChat";
import type { WorkflowId } from "@/lib/aiChatDemo";

/* -------------------- MODES -------------------- */

const MODES: {
  id: WorkflowId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  prompts: string[];
}[] = [
  {
    id: "general",
    label: "General Search",
    description: "Search and summarise operational records",
    icon: Search,
    placeholder: "Ask about records, returns, stock, complaints or past cases…",
    prompts: [
      "Which stores receive the most return-related questions?",
      "What are the most recurring customer complaints this month?",
      "Summarize this week's biggest operational risks.",
    ],
  },
  {
    id: "quality",
    label: "Quality Review",
    description: "Find incomplete, inconsistent or low-quality records",
    icon: ShieldCheck,
    placeholder: "Ask about missing fields, weak records or data quality…",
    prompts: [
      "Find cases closed without photo evidence.",
      "Which stores have the lowest closure quality?",
      "Which records are missing root cause?",
    ],
  },
  {
    id: "compliance",
    label: "Compliance Check",
    description: "Check records against procedures and mandatory fields",
    icon: FileCheck,
    placeholder: "Ask about SOP adherence, mandatory evidence or non-compliance…",
    prompts: [
      "Which closures are not SOP-compliant?",
      "Show records missing mandatory photo evidence.",
      "Find non-compliant cases this month.",
    ],
  },
  {
    id: "audit",
    label: "Audit Trail",
    description: "Review who changed what and when",
    icon: ScrollText,
    placeholder: "Ask who changed what, when and why…",
    prompts: [
      "Which procedures create the greatest training need?",
      "Which records were reopened after closing?",
      "Who edited closed records last week?",
    ],
  },
];

/* -------------------- FILTERS -------------------- */

const LOCATION_OPTIONS = [
  "All locations",
  "Kadıköy Mağazası",
  "Bağdat Caddesi Mağazası",
  "Ataşehir Mağazası",
  "İstinyePark Mağazası",
  "Cevahir Mağazası",
];
const TIME_OPTIONS = ["Last 90 days", "Last 7 days", "Last 30 days", "Last 12 months", "All time"];
const SOURCE_OPTIONS = ["All data sources", "WhatsApp", "POS / Kasa", "Documents", "CRM", "Drive", "Sheets"];

/* -------------------- MODELS -------------------- */

type ModelDef = { label: string; note: string; available: boolean };

function useModels(orgId: string | null): ModelDef[] {
  const [localConfigured, setLocalConfigured] = useState(false);
  useEffect(() => {
    if (!orgId) return;
    setLocalConfigured(!!localStorage.getItem(`saha:localLLM:${orgId}`));
  }, [orgId]);
  return [
    { label: "Auto", note: "Recommended", available: true },
    { label: "Fast", note: "Quick & economical", available: true },
    { label: "Deep Analysis", note: "Slower, thorough", available: true },
    { label: "Private / Local", note: localConfigured ? "On-prem" : "Not connected", available: localConfigured },
    { label: "Claude", note: "Not connected", available: false },
    { label: "GPT", note: "Not connected", available: false },
    { label: "Custom Agent", note: "Not connected", available: false },
  ];
}

/* -------------------- COMPOSER -------------------- */

function Composer({
  placeholder,
  models,
  model,
  setModel,
  query,
  setQuery,
  onSend,
  onStop,
  streaming,
  compact,
}: {
  placeholder: string;
  models: ModelDef[];
  model: string;
  setModel: (m: string) => void;
  query: string;
  setQuery: (q: string) => void;
  onSend: () => void;
  onStop: () => void;
  streaming: boolean;
  compact?: boolean;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!streaming) taRef.current?.focus();
  }, [streaming]);

  return (
    <div className="rounded-2xl border-[1.5px] border-border bg-card shadow-sm focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/10 transition-all">
      <textarea
        ref={taRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!streaming) onSend();
          }
        }}
        rows={compact ? 1 : 3}
        disabled={streaming}
        placeholder={streaming ? "Generating answer…" : placeholder}
        className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
      />
      <div className="flex items-center justify-end gap-2 px-3 pb-3 pt-1">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            {model} <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {models.map((m) => (
              <DropdownMenuItem
                key={m.label}
                disabled={!m.available}
                onClick={() => m.available && setModel(m.label)}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-foreground">{m.label}</span>
                <span className="text-[11px] text-muted-foreground">{m.note}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {streaming ? (
          <button
            onClick={onStop}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            title="Stop generating"
          >
            <Square className="h-3.5 w-3.5 fill-current" /> Stop
          </button>
        ) : (
          <button
            onClick={onSend}
            disabled={!query.trim()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
            title="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------- MESSAGE BUBBLES -------------------- */

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground whitespace-pre-wrap break-words">
        {text}
      </div>
    </div>
  );
}

function StatusLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="inline-flex gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" />
      </span>
      {label}
    </div>
  );
}

function AssistantBubble({
  msg,
  streaming,
  onRetry,
}: {
  msg: ChatMessage;
  streaming: boolean;
  onRetry: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const isActive = streaming && (msg.status === "generating" || msg.status === "retrieving" || msg.status === "queued");
  const showCursor = streaming && msg.status === "generating";

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 border border-primary/20">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">saha.team</span>
          {msg.demo && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 border border-amber-200">
              Demo data
            </span>
          )}
        </div>

        {/* status / content */}
        {(msg.status === "retrieving" || msg.status === "queued") && msg.statusLabel ? (
          <div className="mt-2">
            <StatusLine label={msg.statusLabel} />
          </div>
        ) : msg.status === "error" ? (
          <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{msg.content}</p>
              <button
                onClick={onRetry}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100"
              >
                <RotateCw className="h-3 w-3" /> Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            {msg.statusLabel && !msg.content && (
              <div className="mt-2">
                <StatusLine label={msg.statusLabel} />
              </div>
            )}
            <div className="mt-1.5 text-sm text-foreground leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-headings:font-serif prose-headings:text-base prose-headings:mt-4 prose-headings:mb-1.5 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-table:text-xs prose-code:text-xs">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              {showCursor && <span className="inline-block w-1.5 h-4 bg-primary align-middle animate-pulse ml-0.5" />}
            </div>
          </>
        )}

        {/* footer meta + actions */}
        {msg.status === "completed" && (
          <>
            {msg.meta && (
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> {msg.meta.model}
                </span>
                {!!msg.meta.recordsAnalysed && (
                  <span className="inline-flex items-center gap-1">
                    <Database className="h-3 w-3" /> {msg.meta.recordsAnalysed} records
                  </span>
                )}
                {msg.meta.range && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarRange className="h-3 w-3" /> {msg.meta.range}
                  </span>
                )}
                {!!msg.meta.sources?.length && (
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-3 w-3" /> {msg.meta.sources.join(", ")}
                  </span>
                )}
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <MiniAction icon={copied ? Check : Copy} onClick={copy}>
                {copied ? "Copied" : "Copy"}
              </MiniAction>
              <MiniAction icon={RotateCw} onClick={onRetry}>
                Retry
              </MiniAction>
              <MiniAction icon={FolderOpen} onClick={() => toast.info("Opening sources…")}>
                Open sources
              </MiniAction>
            </div>
          </>
        )}

        {msg.status === "stopped" && (
          <p className="mt-2 text-xs italic text-muted-foreground">Stopped.</p>
        )}
      </div>
    </div>
  );
}

function MiniAction({
  icon: Icon,
  children,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
    >
      <Icon className="h-3 w-3" /> {children}
    </button>
  );
}

/* -------------------- FILTER DROPDOWN -------------------- */

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

/* -------------------- SCREEN -------------------- */

export function AIChatScreen() {
  const { orgId } = useUserOrg();
  const models = useModels(orgId);
  const { messages, conversations, streaming, send, stop, retry, newChat, openConversation } =
    useAIChat(orgId);

  const [mode, setMode] = useState<WorkflowId>("general");
  const [model, setModel] = useState("Auto");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(LOCATION_OPTIONS[0]);
  const [time, setTime] = useState(TIME_OPTIONS[0]);
  const [source, setSource] = useState(SOURCE_OPTIONS[0]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const current = MODES.find((m) => m.id === mode)!;
  const started = messages.length > 0;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new content
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const doSend = () => {
    const q = query.trim();
    if (!q || streaming) return;
    send({
      query: q,
      workflow: mode,
      model,
      location,
      timeRange: time,
      dataSource: source,
    });
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
            <DropdownMenuItem key={m.id} onClick={() => setMode(m.id)} className="flex items-start gap-3 py-2.5">
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
              placeholder={current.placeholder}
              models={models}
              model={model}
              setModel={setModel}
              query={query}
              setQuery={setQuery}
              onSend={doSend}
              onStop={stop}
              streaming={streaming}
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
          <div className="mx-auto max-w-3xl pt-8 pb-44 space-y-6">
            {messages.map((m) =>
              m.role === "user" ? (
                <UserBubble key={m.id} text={m.content} />
              ) : (
                <AssistantBubble key={m.id} msg={m} streaming={streaming} onRetry={() => retry(m.id)} />
              ),
            )}
            <div ref={scrollRef} />
          </div>

          {/* sticky composer */}
          <div className="fixed bottom-0 inset-x-0 lg:left-[284px] bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4 px-6 lg:px-12 z-20">
            <div className="mx-auto max-w-3xl">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {ModeDropdown}
                {Filters}
              </div>
              <Composer
                placeholder={current.placeholder}
                models={models}
                model={model}
                setModel={setModel}
                query={query}
                setQuery={setQuery}
                onSend={doSend}
                onStop={stop}
                streaming={streaming}
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
            {conversations.length === 0 && (
              <p className="text-sm text-muted-foreground px-3">No conversations yet.</p>
            )}
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  openConversation(c);
                  setHistoryOpen(false);
                }}
                className="w-full text-left rounded-md px-3 py-2.5 hover:bg-muted transition-colors"
              >
                <div className="text-sm text-foreground truncate">{c.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {new Date(c.updatedAt).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
