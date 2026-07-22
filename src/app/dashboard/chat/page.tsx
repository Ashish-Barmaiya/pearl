"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
// toast removed — unused
import { Toaster } from "@/components/ui/sonner";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { SettingsGate } from "@/components/chat/SettingsGate";
import { ProviderBadge } from "@/components/chat/ProviderBadge";
import { ThreadSidebar } from "@/components/chat/ThreadSidebar";
import {
  loadSettings,
  isSettingsConfigured,
  type ApiSettings,
} from "@/lib/settings";
import { AgentProvider, useAgent, generateThreadTitle } from "@/lib/agent";
// debug logger removed — avoid noisy logs during streaming

// ─── Chat Conversation (re-mounts per thread via React key) ──────────────────

interface ChatConversationProps {
  threadId: string;
  initialMessages: import("ai").UIMessage[];
  settings: ApiSettings;
  onMessagesChange: (
    threadId: string,
    messages: import("ai").UIMessage[],
  ) => void;
  onAutoTitle: (threadId: string, firstMessage: string) => void;
  onStatusChange: (statusText: string) => void;
}

function ChatConversation({
  threadId,
  initialMessages,
  settings,
  onMessagesChange,
  onAutoTitle,
  onStatusChange,
}: ChatConversationProps) {
  const [input, setInput] = useState("");
  const titleGeneratedRef = useRef(false);
  const { messages, sendMessage, status, stop, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        apiKey: settings.apiKey,
        baseURL: settings.baseURL,
        model: settings.model,
      },
    }),
  });

  // Call onStatusChange whenever status/messages changes
  useEffect(() => {
    if (status === "ready" || status === "error") {
      onStatusChange("");
      return;
    }

    const assistantMessages = messages.filter((m) => m.role === "assistant");
    if (assistantMessages.length === 0) {
      onStatusChange("Thinking...");
      return;
    }

    const lastMsg = assistantMessages[assistantMessages.length - 1];

    // Check tool invocations first
    if (
      Array.isArray((lastMsg as any).toolInvocations) &&
      (lastMsg as any).toolInvocations.length > 0
    ) {
      const lastTool = (lastMsg as any).toolInvocations[
        (lastMsg as any).toolInvocations.length - 1
      ];
      const rawName = lastTool.toolName;
      if (rawName === "tavilySearch") {
        if ("result" in lastTool || lastTool.state === "result") {
          onStatusChange("Analyzing search results...");
        } else {
          onStatusChange("Searching the web...");
        }
        return;
      }

      const toolName = rawName
        .replace(/([A-Z])/g, " $1")
        .replace(/-+/g, " ")
        .trim()
        .replace(/^./, (str: string) => str.toUpperCase());

      if ("result" in lastTool || lastTool.state === "result") {
        onStatusChange(`Tool ${toolName} finished...`);
      } else {
        onStatusChange(`Calling ${toolName}...`);
      }
      return;
    }

    // Check parts
    if (Array.isArray(lastMsg.parts) && lastMsg.parts.length > 0) {
      const lastPart = lastMsg.parts[lastMsg.parts.length - 1];
      if (
        lastPart.type.startsWith("tool-") ||
        lastPart.type === "dynamic-tool"
      ) {
        const rawName =
          (lastPart as any).toolName || lastPart.type.replace("tool-", "");
        if (rawName === "tavilySearch") {
          if (
            (lastPart as any).state === "output-available" ||
            (lastPart as any).state === "output-error"
          ) {
            onStatusChange("Analyzing search results...");
          } else {
            onStatusChange("Searching the web...");
          }
          return;
        }

        const toolName = rawName
          .replace(/([A-Z])/g, " $1")
          .replace(/-+/g, " ")
          .trim()
          .replace(/^./, (str: string) => str.toUpperCase());

        if (
          (lastPart as any).state === "output-available" ||
          (lastPart as any).state === "output-error"
        ) {
          onStatusChange(`Tool ${toolName} finished...`);
        } else {
          onStatusChange(`Calling ${toolName}...`);
        }
        return;
      }

      if (lastPart.type === "text" && lastPart.text) {
        onStatusChange("Generating response...");
        return;
      }
    }

    onStatusChange("Thinking...");

    return () => {
      onStatusChange("");
    };
  }, [status, messages, onStatusChange]);

  // Sync messages back to the agent thread store
  useEffect(() => {
    // Persist to thread store only after generation completes (ready/error)
    if (status !== "ready" && status !== "error") return;
    if (messages.length === 0) return;

    onMessagesChange(threadId, messages);

    if (!titleGeneratedRef.current) {
      const firstUser = messages.find((m) => m.role === "user");
      if (firstUser) {
        const text = (firstUser.parts ?? [])
          .filter((p) => p.type === "text")
          .map((p: any) => p.text)
          .join("");

        if (text) {
          titleGeneratedRef.current = true;
          onAutoTitle(threadId, text);
        }
      }
    }
    // Intentionally only depend on final-status and messages from useChat
  }, [status, messages, threadId, onMessagesChange, onAutoTitle]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <>
      {/* Messages */}
      <MessageList messages={messages} status={status} error={error} />

      {/* Input */}
      <MessageInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        status={status}
        stop={stop}
      />
    </>
  );
}

// ─── Inner Chat (consumes AgentProvider context) ─────────────────────────────

function ChatInner() {
  const initialSettings = loadSettings();
  const [settings, setSettings] = useState<ApiSettings | null>(initialSettings);
  const [configured, setConfigured] = useState(
    isSettingsConfigured(initialSettings),
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [statusText, setStatusText] = useState("");

  const { threads, activeThread, createThread, syncMessages, renameThread } =
    useAgent();
  // No synchronization bookkeeping refs — keep agent store as the single source of truth

  // Load settings on mount and when window regains focus
  const refreshSettings = useCallback(() => {
    const s = loadSettings();
    setSettings(s);
    setConfigured(isSettingsConfigured(s));
  }, []);

  useEffect(() => {
    // Do not call refreshSettings synchronously here to avoid setState during effect;
    // initial settings are applied via the lazy initialization above.
    window.addEventListener("focus", refreshSettings);
    return () => window.removeEventListener("focus", refreshSettings);
  }, [refreshSettings]);

  // Auto-create a thread if none exist and settings are configured
  useEffect(() => {
    if (configured && threads.length === 0) {
      createThread();
    }
  }, [configured, threads.length, createThread]);

  // Stable callbacks for ChatConversation
  const handleMessagesChange = useCallback(
    (threadId: string, messages: import("ai").UIMessage[]) => {
      syncMessages(threadId, messages);
    },
    [syncMessages],
  );

  const handleAutoTitle = useCallback(
    (threadId: string, firstMessage: string) => {
      renameThread(threadId, generateThreadTitle(firstMessage));
    },
    [renameThread],
  );

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex h-full">
        {/* Thread Sidebar */}
        {configured && (
          <ThreadSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((c) => !c)}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex items-center justify-between border-b px-6 py-3">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight">
                {activeThread?.title ?? "Pearl"}
              </h1>
              <p className="text-xs text-muted-foreground">
                AI Research Assistant
              </p>
            </div>

            <div className="flex items-center gap-3">
              {settings && configured && <ProviderBadge settings={settings} />}
              {statusText && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in duration-300">
                  <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                  {statusText}
                </div>
              )}
            </div>
          </header>

          {/* Content */}
          {!configured ? (
            <SettingsGate />
          ) : activeThread && settings ? (
            <ChatConversation
              key={activeThread.id}
              threadId={activeThread.id}
              initialMessages={activeThread.messages}
              settings={settings}
              onMessagesChange={handleMessagesChange}
              onAutoTitle={handleAutoTitle}
              onStatusChange={setStatusText}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

// ─── Page (wraps with AgentProvider) ─────────────────────────────────────────

export default function ChatPage() {
  return (
    <AgentProvider>
      <ChatInner />
    </AgentProvider>
  );
}
