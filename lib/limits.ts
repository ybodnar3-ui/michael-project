import type { Language } from "./types";

export const MAX_MESSAGES = 40; // ~20 exchanges
export const MAX_INPUT_CHARS = 2000;

const LANGS: Language[] = ["uk", "ru", "en", "de"];

export type ValidationResult = { ok: true } | { ok: false; error: string };

type ChatLike = { role?: unknown; content?: unknown };

export function validateChatInput(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") return { ok: false, error: "bad body" };
  const b = body as Record<string, unknown>;

  if (!LANGS.includes(b.language as Language)) {
    return { ok: false, error: "bad language" };
  }
  if (!Array.isArray(b.messages) || b.messages.length === 0) {
    return { ok: false, error: "no messages" };
  }
  if (b.messages.length > MAX_MESSAGES) {
    return { ok: false, error: "too many messages" };
  }
  if ((b.messages[0] as ChatLike)?.role !== "user") {
    return { ok: false, error: "first message must be user" };
  }
  for (const m of b.messages as ChatLike[]) {
    if (m?.role !== "user" && m?.role !== "assistant") {
      return { ok: false, error: "bad role" };
    }
    if (typeof m?.content !== "string") {
      return { ok: false, error: "bad content" };
    }
    if (m.content.length > MAX_INPUT_CHARS) {
      return { ok: false, error: "message too long" };
    }
  }
  return { ok: true };
}
