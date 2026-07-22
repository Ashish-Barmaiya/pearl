"use client";

import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import type { UIMessage } from "ai";
import type { Components } from "react-markdown";

interface MessageProps {
  message: UIMessage;
}

type MessagePart =
  | { type: "text"; text: string }
  | {
      type: `tool-${string}`;
      toolName?: string;
      state?: string;
      result?: unknown;
    }
  | {
      type: "dynamic-tool";
      toolName?: string;
      state?: string;
      result?: unknown;
    }
  | { type: string; [key: string]: unknown };

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-4 mb-2 text-lg font-bold first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-3 mb-1.5 text-base font-semibold first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-2.5 mb-1 text-sm font-semibold first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-2 leading-relaxed last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  pre: ({ children }) => (
    <pre className="my-2.5 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-zinc-100 last:mb-0 [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code className="rounded-md bg-black/10 px-1.5 py-0.5 font-mono text-[0.85em] dark:bg-white/15">
      {children}
    </code>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-2 hover:text-primary/80"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-border pl-3 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-border" />,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
};

function ToolCard({
  part,
}: {
  part: Extract<
    MessagePart,
    { type: `tool-${string}` } | { type: "dynamic-tool" }
  >;
}) {
  const rawState = (part as any).state as string | undefined;
  const hasResult = Object.prototype.hasOwnProperty.call(part, "result");

  const statusText = rawState
    ? /(error|fail)/i.test(rawState)
      ? "Error"
      : hasResult || /output|result|finished|done/i.test(rawState)
        ? "Completed"
        : "Running"
    : hasResult
      ? "Completed"
      : "Running";

  // Render a compact preview of result without dumping full JSON
  const preview = useMemo(() => {
    const res = (part as any).result;
    if (res == null) return null;
    if (typeof res === "string") return res;
    if (Array.isArray(res)) {
      return (
        <ul className="ml-4 list-disc">
          {res.slice(0, 5).map((item, i) => (
            <li key={i} className="text-sm">
              {typeof item === "string"
                ? item
                : String(
                    (item as any).title ??
                      (item as any).name ??
                      JSON.stringify(item),
                  )}
            </li>
          ))}
        </ul>
      );
    }
    if (typeof res === "object") {
      // Prefer common fields
      const obj = res as Record<string, unknown>;
      if (Array.isArray(obj.items)) {
        return (
          <ul className="ml-4 list-disc">
            {(obj.items as any[]).slice(0, 5).map((it, i) => (
              <li key={i} className="text-sm">
                {String(
                  (it as any).title ??
                    (it as any).name ??
                    (it as any).text ??
                    JSON.stringify(it),
                )}
              </li>
            ))}
          </ul>
        );
      }
      if (typeof obj.text === "string") return obj.text;
      // Fallback summarization: show first-level keys with primitive values
      const entries = Object.entries(obj).slice(0, 5);
      return (
        <div className="grid gap-1 text-sm">
          {entries.map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <span className="font-medium text-xs text-muted-foreground">
                {k}:
              </span>
              <span className="truncate">
                {typeof v === "string" || typeof v === "number"
                  ? String(v)
                  : Array.isArray(v)
                    ? `Array(${v.length})`
                    : typeof v === "object"
                      ? "Object"
                      : String(v)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return String(res);
  }, [part]);

  return (
    <div className="mb-2 rounded-md border border-border/50 bg-muted/5 px-3 py-2 text-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {((part as any).toolName as string) ?? part.type ?? "Tool"}
        </div>
        <div className="text-xs font-medium">{statusText}</div>
      </div>
      {preview ? <div className="mt-2">{preview}</div> : null}
    </div>
  );
}

function renderPart(part: MessagePart, isUser: boolean, index: number) {
  if (part.type === "text") {
    const txt = (part as { text: string }).text;
    if (isUser)
      return (
        <p key={`text-${index}`} className="whitespace-pre-wrap">
          {txt}
        </p>
      );
    return (
      <div key={`text-${index}`} className="max-w-none">
        <ReactMarkdown components={markdownComponents}>{txt}</ReactMarkdown>
      </div>
    );
  }

  // Tool part or dynamic-tool
  if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
    return <ToolCard key={`tool-${index}`} part={part as any} />;
  }

  // Unknown part type: render safely
  const maybeText = (part as any).text;
  if (typeof maybeText === "string") {
    return (
      <p key={`unknown-${index}`} className="whitespace-pre-wrap">
        {maybeText}
      </p>
    );
  }

  return (
    <div key={`unknown-${index}`} className="text-sm text-muted-foreground">
      Unsupported content
    </div>
  );
}

function MessageComponent({ message }: MessageProps) {
  const isUser = message.role === "user";

  const parts = (message.parts ?? []) as MessagePart[];

  // Split parts: tools first (tool-*, dynamic-tool), then text parts (preserve relative ordering within groups)
  const toolParts = parts.filter(
    (p) => p.type.startsWith("tool-") || p.type === "dynamic-tool",
  );
  const textParts = parts.filter((p) => p.type === "text" || (p as any).text);

  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-muted text-foreground",
        )}
      >
        {/* Render tool parts first so tool output appears before assistant text */}
        {toolParts.length > 0 && (
          <div className="mb-2">
            {toolParts.map((p, i) => renderPart(p, isUser, i))}
          </div>
        )}

        {/* Render text parts (if any). User messages are plain text; assistant uses markdown */}
        {textParts.length > 0 ? (
          textParts.map((p, i) => renderPart(p, isUser, i + toolParts.length))
        ) : // If there is no text, still render any tool parts; otherwise render an empty placeholder for spacing
        toolParts.length === 0 ? (
          <div className="text-sm text-muted-foreground">(no content)</div>
        ) : null}
      </div>
    </div>
  );
}

export const Message = React.memo(MessageComponent);
