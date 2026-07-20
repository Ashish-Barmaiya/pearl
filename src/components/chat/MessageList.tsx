"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { Sparkles } from "lucide-react";
import { Message } from "./Message";
import { TypingIndicator } from "./TypingIndicator";

interface MessageListProps {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
}

export function MessageList({ messages, status }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

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
        {status === "submitted" && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
