"use client";

import { useState, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { SettingsGate } from "@/components/chat/SettingsGate";
import { ProviderBadge } from "@/components/chat/ProviderBadge";
import {
  loadSettings,
  isSettingsConfigured,
  type ApiSettings,
} from "@/lib/settings";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [settings, setSettings] = useState<ApiSettings | null>(null);
  const [configured, setConfigured] = useState(false);

  // Load settings on mount and when window regains focus (user may return from settings page)
  const refreshSettings = useCallback(() => {
    const s = loadSettings();
    setSettings(s);
    setConfigured(isSettingsConfigured(s));
  }, []);

  useEffect(() => {
    refreshSettings();
    window.addEventListener("focus", refreshSettings);
    return () => window.removeEventListener("focus", refreshSettings);
  }, [refreshSettings]);

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: settings
        ? {
            apiKey: settings.apiKey,
            baseURL: settings.baseURL,
            model: settings.model,
          }
        : undefined,
    }),
    onError: (error) => {
      toast.error("Something went wrong", {
        description:
          error.message || "Failed to get a response. Please try again.",
      });
    },
  });

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
      <Toaster position="top-right" />
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b px-6 py-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">MicroManus</h1>
            <p className="text-xs text-muted-foreground">
              AI Research Assistant
            </p>
          </div>
          <div className="flex items-center gap-3">
            {settings && configured && <ProviderBadge settings={settings} />}
            {status !== "ready" && status !== "error" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in duration-300">
                <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                Generating…
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        {!configured ? (
          <SettingsGate />
        ) : (
          <>
            {/* Messages */}
            <MessageList messages={messages} status={status} />

            {/* Input */}
            <MessageInput
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
            />
          </>
        )}
      </div>
    </>
  );
}
