import type { UIMessage } from "ai";

let updateSeq = 0;

function summarizeMessage(m: UIMessage, index: number) {
  const anyMsg = m as UIMessage & {
    toolInvocations?: unknown;
    status?: unknown;
  };

  return {
    index,
    id: m.id,
    role: m.role,
    parts: m.parts,
    toolInvocations: anyMsg.toolInvocations ?? undefined,
    metadata: m.metadata ?? undefined,
    status: anyMsg.status ?? undefined,
  };
}

export function logChatState(
  source: string,
  payload: {
    threadId?: string;
    activeThreadId?: string | null;
    status?: string;
    messages: UIMessage[];
    initialMessagesLen?: number;
    prevSyncLen?: number | null;
    prevStoreLen?: number | null;
    extra?: Record<string, unknown>;
  },
) {
  const seq = ++updateSeq;
  const header = `[chat-state #${seq}] ${source}`;

  console.groupCollapsed(
    `${header} | len=${payload.messages.length} status=${payload.status ?? "—"} thread=${payload.threadId ?? "—"} active=${payload.activeThreadId ?? "—"}`,
  );
  console.log("seq", seq);
  console.log("source", source);
  console.log("threadId", payload.threadId);
  console.log("activeThreadId", payload.activeThreadId);
  console.log("useChat.status", payload.status);
  console.log("messages.length", payload.messages.length);
  if (payload.initialMessagesLen !== undefined) {
    console.log("initialMessages.length", payload.initialMessagesLen);
  }
  if (payload.prevSyncLen != null) {
    console.log("prevSyncLen", payload.prevSyncLen, "delta", payload.messages.length - payload.prevSyncLen);
  }
  if (payload.prevStoreLen != null) {
    console.log("prevStoreLen", payload.prevStoreLen, "delta", payload.messages.length - payload.prevStoreLen);
  }
  if (payload.extra) {
    console.log("extra", payload.extra);
  }
  console.log(
    "messages",
    payload.messages.map((m, i) => summarizeMessage(m, i)),
  );
  console.groupEnd();

  return seq;
}
