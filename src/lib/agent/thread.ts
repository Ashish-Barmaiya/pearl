import type { Thread } from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return crypto.randomUUID();
}

// ─── Thread Factories ────────────────────────────────────────────────────────

export function createThread(): Thread {
  const now = new Date();
  return {
    id: generateId(),
    title: "New Chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

// ─── Title Generation ────────────────────────────────────────────────────────

/**
 * Generate a thread title from the first user message.
 * Simple heuristic: first 40 characters, trimmed, with ellipsis if truncated.
 */
export function generateThreadTitle(firstMessage: string): string {
  const cleaned = firstMessage.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 40) return cleaned;
  return cleaned.slice(0, 40).trimEnd() + "…";
}
