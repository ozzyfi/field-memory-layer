import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { buildDemoAnswer, streamText, type WorkflowId } from "@/lib/aiChatDemo";

export type TurnStatus =
  | "queued"
  | "retrieving"
  | "generating"
  | "completed"
  | "error"
  | "stopped";

export type ChatMeta = {
  model: string;
  recordsAnalysed?: number;
  range?: string;
  sources?: string[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: TurnStatus;
  statusLabel?: string;
  demo?: boolean;
  meta?: ChatMeta;
  // request context kept for retry
  req?: SendArgs;
};

export type Conversation = {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
};

export type SendArgs = {
  query: string;
  workflow: WorkflowId;
  model: string;
  location: string;
  timeRange: string;
  dataSource: string;
};

const HISTORY_KEY = (orgId: string | null) => `saha:aichat:${orgId ?? "anon"}`;
const STATUS_STEPS = [
  "Searching operational memory…",
  "Reviewing relevant records…",
  "Preparing answer…",
];
const MAX_HISTORY_MESSAGES = 8; // context sent to backend

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useAIChat(orgId: string | null) {
  const [conversationId, setConversationId] = useState<string>(() => uid());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY(orgId));
      if (raw) setConversations(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [orgId]);

  const persist = useCallback(
    (convId: string, msgs: ChatMessage[]) => {
      if (!msgs.length) return;
      setConversations((prev) => {
        const title = msgs.find((m) => m.role === "user")?.content.slice(0, 60) ?? "New chat";
        const existing = prev.filter((c) => c.id !== convId);
        const next = [
          { id: convId, title, updatedAt: Date.now(), messages: msgs },
          ...existing,
        ].slice(0, 30);
        try {
          localStorage.setItem(HISTORY_KEY(orgId), JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [orgId],
  );

  const updateAssistant = useCallback(
    (id: string, patch: Partial<ChatMessage>) => {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    },
    [],
  );

  const runDemo = useCallback(
    async (assistantId: string, args: SendArgs, signal: AbortSignal) => {
      const { markdown, meta } = buildDemoAnswer(args.query, args.workflow, args.timeRange);
      updateAssistant(assistantId, {
        status: "generating",
        statusLabel: undefined,
        demo: true,
        content: "",
        meta: {
          model: args.model === "Auto" ? "Demo (Gemini Flash)" : `${args.model} · Demo`,
          recordsAnalysed: meta.recordsAnalysed,
          range: meta.range,
          sources: meta.sources,
        },
      });
      await streamText(
        markdown,
        (chunk) =>
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
          ),
        signal,
      );
    },
    [updateAssistant],
  );

  const send = useCallback(
    async (args: SendArgs) => {
      const q = args.query.trim();
      if (!q || streaming) return;

      const convId = conversationId;
      const userMsg: ChatMessage = { id: uid(), role: "user", content: q };
      const assistantId = uid();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        status: "queued",
        statusLabel: STATUS_STEPS[0],
        req: args,
      };

      const history = messages
        .slice(-MAX_HISTORY_MESSAGES)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStreaming(true);

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      // Animated status phases
      updateAssistant(assistantId, { status: "retrieving", statusLabel: STATUS_STEPS[0] });
      await new Promise((r) => setTimeout(r, 450));
      if (ctrl.signal.aborted) return finishStopped(assistantId, convId);
      updateAssistant(assistantId, { statusLabel: STATUS_STEPS[1] });
      await new Promise((r) => setTimeout(r, 450));
      if (ctrl.signal.aborted) return finishStopped(assistantId, convId);
      updateAssistant(assistantId, { status: "generating", statusLabel: STATUS_STEPS[2] });

      try {
        if (!orgId) throw new Error("ORG_NOT_READY");
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("NO_SESSION");

        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-field-memory`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            query: q,
            orgId,
            workflow: args.workflow,
            model: args.model,
            location: args.location,
            timeRange: args.timeRange,
            dataSource: args.dataSource,
            conversationHistory: history,
          }),
          signal: ctrl.signal,
        });

        if (!res.ok || !res.body) {
          // Rate limit / credit / server error → demo fallback
          if (res.status === 429 || res.status === 402 || res.status >= 500) {
            await runDemo(assistantId, args, ctrl.signal);
            finishCompleted(assistantId, convId);
            return;
          }
          const txt = await res.text();
          throw new Error(txt || `Request failed (${res.status})`);
        }

        const usedModel = res.headers.get("X-Model-Used") || resolveModelLabel(args.model);
        const usedRecords = Number(res.headers.get("X-Records-Analysed") || "0");
        updateAssistant(assistantId, {
          status: "generating",
          statusLabel: undefined,
          meta: { model: usedModel, recordsAnalysed: usedRecords, range: args.timeRange, sources: ["field_records"] },
        });

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let got = false;
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          got = true;
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
          );
        }
        if (!got) {
          // empty response → demo fallback
          await runDemo(assistantId, args, ctrl.signal);
        }
        finishCompleted(assistantId, convId);
      } catch (e) {
        if (ctrl.signal.aborted || (e instanceof Error && e.name === "AbortError")) {
          finishStopped(assistantId, convId);
          return;
        }
        const code = e instanceof Error ? e.message : "UNKNOWN";
        const friendly = errorMessage(code);
        updateAssistant(assistantId, { status: "error", statusLabel: undefined, content: friendly });
        setStreaming(false);
        abortRef.current = null;
        setMessages((cur) => {
          persist(convId, cur);
          return cur;
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [streaming, conversationId, messages, orgId, updateAssistant, runDemo, persist],
  );

  const finishCompleted = useCallback(
    (assistantId: string, convId: string) => {
      updateAssistant(assistantId, { status: "completed", statusLabel: undefined });
      setStreaming(false);
      abortRef.current = null;
      setMessages((cur) => {
        persist(convId, cur);
        return cur;
      });
    },
    [updateAssistant, persist],
  );

  const finishStopped = useCallback(
    (assistantId: string, convId: string) => {
      updateAssistant(assistantId, { status: "stopped", statusLabel: undefined });
      setStreaming(false);
      abortRef.current = null;
      setMessages((cur) => {
        persist(convId, cur);
        return cur;
      });
    },
    [updateAssistant, persist],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const retry = useCallback(
    (assistantId: string) => {
      const idx = messages.findIndex((m) => m.id === assistantId);
      if (idx < 0) return;
      const target = messages[idx];
      const req = target.req;
      if (!req) return;
      // Drop the failed assistant message, keep the user message; re-send.
      setMessages((prev) => prev.slice(0, idx));
      // Defer to allow state flush
      setTimeout(() => send(req), 0);
    },
    [messages, send],
  );

  const newChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setConversationId(uid());
    setStreaming(false);
  }, []);

  const openConversation = useCallback((conv: Conversation) => {
    abortRef.current?.abort();
    setConversationId(conv.id);
    setMessages(conv.messages);
    setStreaming(false);
  }, []);

  return {
    conversationId,
    messages,
    conversations,
    streaming,
    send,
    stop,
    retry,
    newChat,
    openConversation,
  };
}

function resolveModelLabel(model: string): string {
  switch (model) {
    case "Deep Analysis":
      return "Gemini 2.5 Pro";
    case "Fast":
      return "Gemini 2.5 Flash";
    default:
      return "Gemini 2.5 Flash";
  }
}

function errorMessage(code: string): string {
  switch (code) {
    case "ORG_NOT_READY":
      return "Your workspace isn't ready yet. Please try again in a moment.";
    case "NO_SESSION":
      return "Your session has expired. Please sign in again.";
    default:
      if (code.includes("No records")) return "No relevant records were found for this question.";
      return "Couldn't reach the AI service. Please try again.";
  }
}
