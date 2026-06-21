import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { buildDemoAnswer, streamText, type WorkflowId } from "@/lib/aiChatDemo";
import { buildDemoSources, type ChatSource } from "@/lib/chatSources";

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
  sources?: ChatSource[];
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

  const updateAssistant = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const appendContent = useCallback((id: string, chunk: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content: m.content + chunk } : m)),
    );
  }, []);

  const finishWith = useCallback(
    (assistantId: string, convId: string, status: TurnStatus) => {
      updateAssistant(assistantId, { status, statusLabel: undefined });
      setStreaming(false);
      abortRef.current = null;
      setMessages((cur) => {
        persist(convId, cur);
        return cur;
      });
    },
    [updateAssistant, persist],
  );

  const runDemo = useCallback(
    async (assistantId: string, args: SendArgs, signal: AbortSignal) => {
      const { markdown, meta } = buildDemoAnswer(args.query, args.workflow, args.timeRange);
      const sources = buildDemoSources(args.query, args.location);
      updateAssistant(assistantId, {
        status: "generating",
        statusLabel: undefined,
        demo: true,
        content: "",
        sources,
        meta: {
          model: args.model === "Auto" ? "Demo (Gemini Flash)" : `${args.model} · Demo`,
          recordsAnalysed: meta.recordsAnalysed,
          range: meta.range,
          sources: meta.sources,
        },
      });
      await streamText(markdown, (chunk) => appendContent(assistantId, chunk), signal);
    },
    [updateAssistant, appendContent],
  );

  /**
   * Core turn execution. Streams an assistant answer into an EXISTING assistant
   * message. Never adds a user message — callers own that. Used by both send
   * (fresh turn) and retry (regenerate only the assistant answer).
   */
  const executeTurn = useCallback(
    async (
      args: SendArgs,
      assistantId: string,
      convId: string,
      history: { role: string; content: string }[],
    ) => {
      const q = args.query.trim();
      setStreaming(true);
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      // Reset the assistant message for a clean (re)generation.
      updateAssistant(assistantId, {
        content: "",
        demo: false,
        sources: undefined,
        meta: undefined,
        status: "retrieving",
        statusLabel: STATUS_STEPS[0],
        req: args,
      });

      // Animated status phases
      await new Promise((r) => setTimeout(r, 450));
      if (ctrl.signal.aborted) return finishWith(assistantId, convId, "stopped");
      updateAssistant(assistantId, { statusLabel: STATUS_STEPS[1] });
      await new Promise((r) => setTimeout(r, 450));
      if (ctrl.signal.aborted) return finishWith(assistantId, convId, "stopped");
      updateAssistant(assistantId, { status: "generating", statusLabel: STATUS_STEPS[2] });

      try {
        if (!orgId) {
          // No workspace yet → retail demo mode (not an error).
          await runDemo(assistantId, args, ctrl.signal);
          return finishWith(assistantId, convId, ctrl.signal.aborted ? "stopped" : "completed");
        }
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
            return finishWith(assistantId, convId, ctrl.signal.aborted ? "stopped" : "completed");
          }
          const txt = await res.text();
          throw new Error(txt || `Request failed (${res.status})`);
        }

        const isSSE = (res.headers.get("Content-Type") || "").includes("event-stream");
        let usedModel = res.headers.get("X-Model-Used") || resolveModelLabel(args.model);
        let usedRecords = Number(res.headers.get("X-Records-Analysed") || "0");
        let collectedSources: ChatSource[] | undefined;
        updateAssistant(assistantId, {
          status: "generating",
          statusLabel: undefined,
          meta: { model: usedModel, recordsAnalysed: usedRecords, range: args.timeRange, sources: ["field_records"] },
        });

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let got = false;
        let buffer = "";

        const handleEvent = (event: string, dataRaw: string) => {
          if (!dataRaw) return;
          if (event === "delta") {
            let text = dataRaw;
            try {
              const parsed = JSON.parse(dataRaw);
              text = typeof parsed === "string" ? parsed : parsed.text ?? "";
            } catch {
              /* plain text data */
            }
            if (text) {
              got = true;
              appendContent(assistantId, text);
            }
          } else if (event === "sources") {
            try {
              const parsed = JSON.parse(dataRaw) as ChatSource[];
              if (Array.isArray(parsed) && parsed.length) {
                collectedSources = parsed;
                updateAssistant(assistantId, { sources: parsed });
              }
            } catch {
              /* ignore malformed sources */
            }
          } else if (event === "meta") {
            try {
              const parsed = JSON.parse(dataRaw);
              if (parsed.model) usedModel = parsed.model;
              if (typeof parsed.recordsAnalysed === "number") usedRecords = parsed.recordsAnalysed;
              updateAssistant(assistantId, {
                meta: {
                  model: usedModel,
                  recordsAnalysed: usedRecords,
                  range: args.timeRange,
                  sources: parsed.sources ?? ["field_records"],
                },
              });
            } catch {
              /* ignore */
            }
          }
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (isSSE) {
            buffer += chunk;
            const { events, rest } = parseSSE(buffer);
            buffer = rest;
            for (const ev of events) handleEvent(ev.event, ev.data);
          } else {
            // Plain text token stream
            got = true;
            appendContent(assistantId, chunk);
          }
        }

        updateAssistant(assistantId, {
          meta: { model: usedModel, recordsAnalysed: usedRecords, range: args.timeRange, sources: collectedSources?.length ? ["field_records", "evidence"] : ["field_records"] },
        });

        if (!got) {
          // empty response → demo fallback
          await runDemo(assistantId, args, ctrl.signal);
        }
        finishWith(assistantId, convId, ctrl.signal.aborted ? "stopped" : "completed");
      } catch (e) {
        if (ctrl.signal.aborted || (e instanceof Error && e.name === "AbortError")) {
          finishWith(assistantId, convId, "stopped");
          return;
        }
        const code = e instanceof Error ? e.message : "UNKNOWN";
        updateAssistant(assistantId, {
          status: "error",
          statusLabel: undefined,
          content: errorMessage(code),
        });
        setStreaming(false);
        abortRef.current = null;
        setMessages((cur) => {
          persist(convId, cur);
          return cur;
        });
      }
    },
    [orgId, runDemo, updateAssistant, appendContent, finishWith, persist],
  );

  const send = useCallback(
    (args: SendArgs) => {
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
      void executeTurn(args, assistantId, convId, history);
    },
    [streaming, conversationId, messages, executeTurn],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const retry = useCallback(
    (assistantId: string) => {
      if (streaming) return;
      const idx = messages.findIndex((m) => m.id === assistantId);
      if (idx < 0) return;
      const target = messages[idx];
      const req = target.req;
      if (!req) return;
      // Regenerate ONLY the assistant answer — do NOT add the user message again.
      const history = messages
        .slice(0, idx)
        .slice(-MAX_HISTORY_MESSAGES)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
      void executeTurn(req, assistantId, conversationId, history);
    },
    [streaming, messages, conversationId, executeTurn],
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
    case "NO_SESSION":
      return "Your session has expired. Please sign in again.";
    default:
      if (code.includes("No records")) return "No relevant records were found for this question.";
      return "Couldn't reach the AI service. Please try again.";
  }
}
