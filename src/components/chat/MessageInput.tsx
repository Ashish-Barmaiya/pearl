"use client";

import { useRef, useEffect } from "react";
import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e?: { preventDefault?: () => void }) => void;
  status: "submitted" | "streaming" | "ready" | "error";
  stop: () => void;
}

export function MessageInput({
  input,
  handleInputChange,
  handleSubmit,
  status,
  stop,
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isGenerating = status === "submitted" || status === "streaming";

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isGenerating) {
        handleSubmit();
      }
    }
  };

  return (
    <div className="border-t bg-background px-4 py-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-2xl border bg-muted/30 p-2 transition-all focus-within:border-ring/50 focus-within:ring-2 focus-within:ring-ring/20">
          <textarea
            ref={textareaRef}
            id="chat-message-input"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask MicroManus anything..."
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            disabled={isGenerating}
          />
          {isGenerating ? (
            <Button
              id="chat-stop-button"
              type="button"
              size="icon"
              variant="ghost"
              onClick={stop}
              className="shrink-0"
              aria-label="Stop generating"
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              id="chat-send-button"
              type="button"
              size="icon"
              onClick={() => handleSubmit()}
              disabled={!input}
              className="shrink-0"
              aria-label="Send message"
            >
              <Send className="size-4" />
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          MicroManus may produce inaccurate information. Verify important
          details.
        </p>
      </div>
    </div>
  );
}
