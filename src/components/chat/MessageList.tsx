"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { Sparkles } from "lucide-react";
import { Message } from "./Message";
import { TypingIndicator } from "./TypingIndicator";

import { ErrorMessage } from "./ErrorMessage";

interface MessageListProps {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  error?: Error;
  reload?: () => void;
}

export function MessageList({
  messages,
  status,
  error,
  reload,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const prevLenRef = useRef<number>(messages.length);
  const prevStatusRef = useRef<typeof status>(status);

  useEffect(() => {
    const prevLen = prevLenRef.current;
    const prevStatus = prevStatusRef.current;

    const lenChanged = messages.length !== prevLen;
    const statusChanged = status !== prevStatus;

    if (lenChanged || statusChanged) {
      // Scroll only on new message or status transitions (submitted/streaming/ready/error)
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevLenRef.current = messages.length;
    prevStatusRef.current = status;
    // Only depend on messages.length and status to avoid frequent runs during streaming token updates
  }, [messages.length, status]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="size-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">MicroManus</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Your AI research assistant. Ask me anything.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {(status === "submitted" || status === "streaming") && (
          <TypingIndicator />
        )}
        {error && <ErrorMessage error={error} onRetry={reload} />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
