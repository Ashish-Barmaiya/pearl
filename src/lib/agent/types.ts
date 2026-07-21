import type { UIMessage } from "ai";

// ─── Thread ──────────────────────────────────────────────────────────────────

export interface Thread {
  id: string;
  title: string;
  messages: UIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Agent State ─────────────────────────────────────────────────────────────

export interface AgentState {
  threads: Thread[];
  activeThreadId: string | null;
}

// ─── Agent Actions ───────────────────────────────────────────────────────────

export type AgentAction =
  | { type: "CREATE_THREAD"; thread: Thread }
  | { type: "SET_ACTIVE_THREAD"; threadId: string }
  | { type: "DELETE_THREAD"; threadId: string }
  | { type: "RENAME_THREAD"; threadId: string; title: string }
  | { type: "SYNC_MESSAGES"; threadId: string; messages: UIMessage[] };

// ─── Agent Context ───────────────────────────────────────────────────────────

export interface AgentContextValue {
  threads: Thread[];
  activeThread: Thread | null;
  createThread: () => string;
  setActiveThread: (id: string) => void;
  deleteThread: (id: string) => void;
  renameThread: (id: string, title: string) => void;
  syncMessages: (id: string, messages: UIMessage[]) => void;
}
