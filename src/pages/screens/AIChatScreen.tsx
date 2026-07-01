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
  Image as ImageIcon,
  FileType,
  Store,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Breadcrumb } from "@/pages/Index";
import { useUserOrg } from "@/hooks/useUserOrg";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAIChat, type ChatMessage } from "@/hooks/useAIChat";
import { SourcePreviewPanel } from "@/components/chat/SourcePreviewPanel";
import type { ChatSource, ChatSourceType } from "@/lib/chatSources";
import type { WorkflowId } from "@/lib/aiChatDemo";
import { useLanguage } from "@/hooks/useLanguage";
import { MODE_PROMPTS, MODE_PLACEHOLDER, MODE_DESCRIPTION } from "@/lib/i18n";

const SOURCE_ICON: Record<ChatSourceType, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  pdf: FileText,
  document: FileType,
  record: Database,
};

/* -------------------- MODES -------------------- */

const MODE_META: { id: WorkflowId; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "general", icon: Search },
  { id: "storefile", icon: Store },
  { id: "quality", icon: ShieldCheck },
  { id: "compliance", icon: FileCheck },
  { id: "audit", icon: ScrollText },
];

/* -------------------- FILTERS -------------------- */

const buildLocationOptions = (tr: boolean) => [
  tr ? "Tüm lokasyonlar" : "All locations",
  "Kadıköy Mağazası",
  "Bağdat Caddesi Mağazası",
  "Ataşehir Mağazası",
  "İstinyePark Mağazası",
  "Cevahir Mağazası",
];
const buildTimeOptions = (tr: boolean) => [
  tr ? "Son 90 gün" : "Last 90 days",
  tr ? "Son 7 gün" : "Last 7 days",
  tr ? "Son 30 gün" : "Last 30 days",
  tr ? "Son 12 ay" : "Last 12 months",
  tr ? "Tüm zamanlar" : "All time",
];
const buildSourceOptions = (tr: boolean) => [
  tr ? "Tüm veri kaynakları" : "All data sources",
  "WhatsApp",
  tr ? "POS / Kasa" : "POS / Register",
  tr ? "Dokümanlar" : "Documents",
  "CRM",
  "Drive",
  "Sheets",
  tr ? "Mağaza Dosyaları" : "Store Files",
];

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
  disabled,
  disabledPlaceholder,
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
  disabled?: boolean;
  disabledPlaceholder?: string;
}) {
  const { t } = useLanguage();
  const taRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!streaming && !disabled) taRef.current?.focus();
  }, [streaming, disabled]);

  const inputDisabled = streaming || !!disabled;

  return (
    <div className="rounded-2xl border-[1.5px] border-border bg-card shadow-sm focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/10 transition-all">
      <textarea
        ref={taRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!inputDisabled) onSend();
          }
        }}
        rows={compact ? 1 : 3}
        disabled={inputDisabled}
        placeholder={disabled ? disabledPlaceholder ?? placeholder : streaming ? t("ai.generating") : placeholder}
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
            title={t("ai.stop")}
          >
            <Square className="h-3.5 w-3.5 fill-current" /> {t("ai.stop")}
          </button>
        ) : (
          <button
            onClick={() => {
              if (!query.trim()) {
                taRef.current?.focus();
              } else {
                onSend();
              }
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            title={t("ai.send")}
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
  onOpenSources,
}: {
  msg: ChatMessage;
  streaming: boolean;
  onRetry: () => void;
  onOpenSources: (sources: ChatSource[], index: number) => void;
}) {
  const { t } = useLanguage();
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
              {t("ai.demoData")}
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
                <RotateCw className="h-3 w-3" /> {t("ai.retry")}
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
                    <Database className="h-3 w-3" /> {msg.meta.recordsAnalysed} {t("ai.records")}
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
            {!!msg.sources?.length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {msg.sources.map((s, i) => (
                  <SourceCard key={s.id} source={s} onClick={() => onOpenSources(msg.sources!, i)} />
                ))}
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <MiniAction icon={copied ? Check : Copy} onClick={copy}>
                {copied ? t("ai.copied") : t("ai.copy")}
              </MiniAction>
              <MiniAction icon={RotateCw} onClick={onRetry}>
                {t("ai.retry")}
              </MiniAction>
              {!!msg.sources?.length && (
                <MiniAction
                  icon={FolderOpen}
                  onClick={() => onOpenSources(msg.sources!, 0)}
                >
                  {t("ai.openSources")}
                </MiniAction>
              )}
            </div>
          </>
        )}

        {msg.status === "stopped" && (
          <p className="mt-2 text-xs italic text-muted-foreground">{t("ai.stopped")}</p>
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

function SourceCard({ source, onClick }: { source: ChatSource; onClick: () => void }) {
  const Icon = SOURCE_ICON[source.type];
  const meta = [source.location, source.createdAt].filter(Boolean).join(" · ");
  return (
    <button
      onClick={onClick}
      className="group flex max-w-[260px] items-start gap-2.5 rounded-lg border border-border bg-background px-3 py-2 text-left hover:border-primary hover:bg-primary/5 transition-colors"
    >
      <div className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted group-hover:bg-primary/10">
        {source.type === "image" && source.thumbnailUrl ? (
          <img
            src={source.thumbnailUrl}
            alt={source.label}
            loading="lazy"
            className="h-7 w-7 rounded-md object-cover"
          />
        ) : (
          <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate text-xs font-medium text-foreground">
          <span className="text-primary">{source.id}</span> · {source.label}
          {source.pageNumber ? ` · Page ${source.pageNumber}` : ""}
        </div>
        {meta && <div className="truncate text-[11px] text-muted-foreground">{meta}</div>}
      </div>
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
      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:border-foreground/20 transition-colors">
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
  const { orgId, loading } = useUserOrg();
  const { t, lang } = useLanguage();
  const isMobile = useIsMobile();
  const models = useModels(orgId);
  const { messages, conversations, streaming, send, stop, retry, newChat, openConversation } =
    useAIChat(orgId);

  const MODES = MODE_META.map((m) => ({
    id: m.id,
    icon: m.icon,
    label: t(`mode.${m.id}`),
    description: MODE_DESCRIPTION[lang][m.id],
    placeholder: MODE_PLACEHOLDER[lang][m.id],
    prompts: MODE_PROMPTS[lang][m.id],
  }));


  const isTr = lang === "tr";
  const LOCATION_OPTIONS = buildLocationOptions(isTr);
  const TIME_OPTIONS = buildTimeOptions(isTr);
  const SOURCE_OPTIONS = buildSourceOptions(isTr);

  const [mode, setMode] = useState<WorkflowId>("general");
  const [model, setModel] = useState("Auto");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(LOCATION_OPTIONS[0]);
  const [time, setTime] = useState(TIME_OPTIONS[0]);
  const [source, setSource] = useState(SOURCE_OPTIONS[0]);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Source preview panel state
  const [panelSources, setPanelSources] = useState<ChatSource[] | null>(null);
  const [panelIndex, setPanelIndex] = useState(0);
  const autoOpenedRef = useRef<string | null>(null);

  const current = MODES.find((m) => m.id === mode)!;
  const started = messages.length > 0;
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelOpen = !!panelSources?.length;

  // Auto-scroll on new content
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const openSources = (sources: ChatSource[], index: number) => {
    if (!sources.length) return;
    setPanelSources(sources);
    setPanelIndex(Math.min(index, sources.length - 1));
  };
  const closePanel = () => setPanelSources(null);

  // Auto-open a single high-confidence image source for the latest answer.
  useEffect(() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant" && m.status === "completed");
    if (!last || !last.sources?.length) return;
    if (autoOpenedRef.current === last.id) return;
    autoOpenedRef.current = last.id;
    const imageSources = last.sources.filter((s) => s.type === "image");
    if (last.sources.length === 1 && imageSources.length === 1) {
      openSources(last.sources, 0);
    }
  }, [messages]);

  const doSend = () => {
    const q = query.trim();
    if (!q || streaming || loading) return;
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
      <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:border-foreground/20 transition-colors">
        <current.icon className="h-3.5 w-3.5 text-primary" />
        {current.label}
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
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

  const composer = (
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
      compact={started}
      disabled={loading}
      disabledPlaceholder={t("ai.preparing")}
    />
  );

  const emptyState = (
    <div className="mx-auto max-w-3xl pt-12 lg:pt-20 pb-24 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <h1 className="font-serif text-5xl text-foreground">{t("ai.askTitle")}</h1>
      <p className="text-sm text-muted-foreground mt-3">
        {t("ai.askSubtitle")}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {ModeDropdown}
        {Filters}
      </div>

      <div className="mt-6 text-left">{composer}</div>

      {loading && <p className="mt-3 text-xs text-muted-foreground">{t("ai.preparing")}</p>}

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
  );

  const conversationInner = (split: boolean) => (
    <div className="mx-auto flex h-full min-h-0 max-w-3xl flex-col">
      <div
        className={
          split
            ? "flex-1 min-h-0 overflow-y-auto overscroll-contain pt-8 pb-6 space-y-6"
            : "flex-1 pt-8 pb-6 space-y-6"
        }
      >
        {messages.map((m) =>
          m.role === "user" ? (
            <UserBubble key={m.id} text={m.content} />
          ) : (
            <AssistantBubble
              key={m.id}
              msg={m}
              streaming={streaming}
              onRetry={() => retry(m.id)}
              onOpenSources={openSources}
            />
          ),
        )}
        <div ref={scrollRef} />
      </div>

      {/* composer: fixed at bottom of pane in split view, sticky otherwise */}
      <div
        className={
          split
            ? "shrink-0 border-t border-border bg-background pt-4 pb-4"
            : "sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4"
        }
      >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {ModeDropdown}
          {Filters}
        </div>
        {composer}
      </div>
    </div>
  );

  const conversation = conversationInner(false);

  const mainContent = started ? conversation : emptyState;

  const sourcePanelNode = panelSources ? (
    <SourcePreviewPanel
      sources={panelSources}
      index={panelIndex}
      onIndexChange={setPanelIndex}
      onClose={closePanel}
    />
  ) : null;

  const showSplit = panelOpen && !isMobile;

  return (
    <div className="relative min-h-[70vh]">
      {/* header */}
      <div className="flex shrink-0 items-start justify-between gap-4">
        <Breadcrumb screen="ai-chat" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistoryOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <History className="h-3.5 w-3.5" /> {t("ai.history")}
          </button>
          <button
            onClick={newChat}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> {t("ai.newChat")}
          </button>
        </div>
      </div>

      {showSplit ? (
        <div className="mt-2 flex h-[calc(100vh-8rem)] min-h-0 flex-col overflow-hidden">
          <PanelGroup direction="horizontal" className="flex-1 min-h-0 overflow-hidden">
            <Panel defaultSize={65} minSize={50} order={1}>
              <div className="h-full min-h-0 overflow-hidden pr-2">
                {started ? (
                  conversationInner(true)
                ) : (
                  <div className="h-full min-h-0 overflow-y-auto overscroll-contain">{emptyState}</div>
                )}
              </div>
            </Panel>
            <PanelResizeHandle className="w-1.5 rounded-full bg-border transition-colors data-[resize-handle-state=hover]:bg-primary/40 data-[resize-handle-state=drag]:bg-primary" />
            <Panel defaultSize={35} minSize={28} maxSize={50} order={2}>
              <div className="h-full min-h-0 overflow-hidden pl-1">{sourcePanelNode}</div>
            </Panel>
          </PanelGroup>
        </div>
      ) : (
        mainContent
      )}

      {/* history drawer */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="right" className="w-[360px] sm:max-w-[360px]">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl">{t("ai.chatHistory")}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-1">
            {conversations.length === 0 && (
              <p className="text-sm text-muted-foreground px-3">{t("ai.noConversations")}</p>
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

      {/* mobile / tablet source drawer */}
      <Sheet open={panelOpen && isMobile} onOpenChange={(o) => !o && closePanel()}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-[420px]">
          {sourcePanelNode}
        </SheetContent>
      </Sheet>
    </div>
  );
}

