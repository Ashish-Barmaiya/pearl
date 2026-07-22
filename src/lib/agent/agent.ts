"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import type { UIMessage } from "ai";
import React from "react";

import type {
  AgentState,
  AgentAction,
  AgentContextValue,
  Thread,
} from "./types";
import { createThread as createNewThread } from "./thread";
import { logChatState } from "@/lib/debug/chat-state-log";

// ─── Reducer ─────────────────────────────────────────────────────────────────

const initialState: AgentState = {
  threads: [],
  activeThreadId: null,
};

function agentReducer(state: AgentState, action: AgentAction): AgentState {
  switch (action.type) {
    case "CREATE_THREAD":
      return {
        threads: [action.thread, ...state.threads],
        activeThreadId: action.thread.id,
      };

    case "SET_ACTIVE_THREAD":
      return {
        ...state,
        activeThreadId: action.threadId,
      };

    case "DELETE_THREAD": {
      const filtered = state.threads.filter((t) => t.id !== action.threadId);
      let nextActiveId = state.activeThreadId;

      // If we deleted the active thread, switch to the first remaining one
      if (state.activeThreadId === action.threadId) {
        nextActiveId = filtered.length > 0 ? filtered[0].id : null;
      }

      return {
        threads: filtered,
        activeThreadId: nextActiveId,
      };
    }

    case "RENAME_THREAD":
      return {
        ...state,
        threads: state.threads.map((t) =>
          t.id === action.threadId
            ? { ...t, title: action.title, updatedAt: new Date() }
            : t,
        ),
      };

    case "SYNC_MESSAGES": {
      const index = state.threads.findIndex((t) => t.id === action.threadId);

      if (index === -1) {
        return state;
      }

      const existing = state.threads[index];

      if (existing.messages === action.messages) {
        return state;
      }

      const updatedThread = {
        ...existing,
        messages: action.messages,
        updatedAt: new Date(),
      };

      const threads = [...state.threads];
      threads[index] = updatedThread;

      return {
        ...state,
        threads,
      };
    }

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AgentContext = createContext<AgentContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

interface AgentProviderProps {
  children: ReactNode;
}

export function AgentProvider({ children }: AgentProviderProps) {
  const [state, dispatch] = useReducer(agentReducer, initialState);

  const createThread = useCallback((): string => {
    const thread = createNewThread();
    dispatch({ type: "CREATE_THREAD", thread });
    return thread.id;
  }, []);

  const setActiveThread = useCallback((id: string) => {
    dispatch({ type: "SET_ACTIVE_THREAD", threadId: id });
  }, []);

  const deleteThread = useCallback((id: string) => {
    dispatch({ type: "DELETE_THREAD", threadId: id });
  }, []);

  const renameThread = useCallback((id: string, title: string) => {
    dispatch({ type: "RENAME_THREAD", threadId: id, title });
  }, []);

  const syncMessages = useCallback((id: string, messages: UIMessage[]) => {
    dispatch({ type: "SYNC_MESSAGES", threadId: id, messages });
  }, []);

  const activeThread: Thread | null = useMemo(
    () => state.threads.find((t) => t.id === state.activeThreadId) ?? null,
    [state.threads, state.activeThreadId],
  );

  const value: AgentContextValue = useMemo(
    () => ({
      threads: state.threads,
      activeThread,
      createThread,
      setActiveThread,
      deleteThread,
      renameThread,
      syncMessages,
    }),
    [
      state.threads,
      activeThread,
      createThread,
      setActiveThread,
      deleteThread,
      renameThread,
      syncMessages,
    ],
  );

  return React.createElement(AgentContext.Provider, { value }, children);
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAgent(): AgentContextValue {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("useAgent must be used within an AgentProvider");
  }
  return context;
}
