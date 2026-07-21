"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAgent } from "@/lib/agent";
import {
  Plus,
  MessageSquare,
  Pencil,
  Trash2,
  Check,
  X,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Relative time helper ────────────────────────────────────────────────────

function relativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// ─── Thread Item ─────────────────────────────────────────────────────────────

interface ThreadItemProps {
  id: string;
  title: string;
  updatedAt: Date;
  messageCount: number;
  isActive: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}

function ThreadItem({
  title,
  updatedAt,
  messageCount,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: ThreadItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      onRename(trimmed);
    } else {
      setEditValue(title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRename();
    if (e.key === "Escape") {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      className={cn(
        "group relative flex cursor-pointer items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
        isActive
          ? "bg-accent text-accent-foreground shadow-sm"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      )}
    >
      <MessageSquare
        className={cn(
          "mt-0.5 size-4 shrink-0 transition-colors",
          isActive ? "text-foreground" : "text-muted-foreground/70",
        )}
      />

      <div className="min-w-0 flex-1">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleRename}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-md border bg-background px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRename();
              }}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <Check className="size-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditValue(title);
                setIsEditing(false);
              }}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <p className="truncate font-medium leading-tight">{title}</p>
        )}
        <p className="mt-0.5 text-[11px] text-muted-foreground/70">
          {messageCount === 0
            ? "No messages"
            : `${messageCount} msg${messageCount !== 1 ? "s" : ""}`}
          {" · "}
          {relativeTime(updatedAt)}
        </p>
      </div>

      {/* Action buttons — visible on hover or when active */}
      {!isEditing && (
        <div
          className={cn(
            "flex shrink-0 items-center gap-0.5 transition-opacity",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditValue(title);
              setIsEditing(true);
            }}
            className="rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
            aria-label="Rename thread"
          >
            <Pencil className="size-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete thread"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Thread Sidebar ──────────────────────────────────────────────────────────

interface ThreadSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function ThreadSidebar({ collapsed, onToggle }: ThreadSidebarProps) {
  const { threads, activeThread, createThread, setActiveThread, deleteThread, renameThread } =
    useAgent();

  const handleNewChat = () => {
    createThread();
  };

  if (collapsed) {
    return (
      <div className="flex w-12 shrink-0 flex-col items-center border-r bg-muted/20 py-3">
        <Button
          id="sidebar-toggle-expand"
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="mb-2 size-8"
          aria-label="Expand sidebar"
        >
          <PanelLeft className="size-4" />
        </Button>
        <Button
          id="sidebar-new-chat-collapsed"
          variant="ghost"
          size="icon"
          onClick={handleNewChat}
          className="size-8"
          aria-label="New chat"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-64 shrink-0 flex-col border-r bg-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Threads
        </h2>
        <Button
          id="sidebar-toggle-collapse"
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="size-7"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 py-2">
        <Button
          id="sidebar-new-chat"
          variant="outline"
          onClick={handleNewChat}
          className="w-full justify-start gap-2 text-sm"
        >
          <Plus className="size-4" />
          New Chat
        </Button>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {threads.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <MessageSquare className="mx-auto mb-2 size-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground/60">
              No conversations yet
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {threads.map((thread) => (
              <ThreadItem
                key={thread.id}
                id={thread.id}
                title={thread.title}
                updatedAt={thread.updatedAt}
                messageCount={thread.messages.length}
                isActive={activeThread?.id === thread.id}
                onSelect={() => setActiveThread(thread.id)}
                onRename={(title) => renameThread(thread.id, title)}
                onDelete={() => deleteThread(thread.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
