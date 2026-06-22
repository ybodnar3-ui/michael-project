import type { Channel } from "./types";
import { validateChatInput, type ValidationResult } from "./limits";

const CHANNELS: Channel[] = ["email", "phone", "telegram"];

export function validateLeadInput(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") return { ok: false, error: "bad body" };
  const b = body as Record<string, unknown>;

  if (
    typeof b.name !== "string" ||
    b.name.trim().length === 0 ||
    b.name.length > 100
  ) {
    return { ok: false, error: "bad name" };
  }
  if (
    typeof b.contact !== "string" ||
    b.contact.trim().length === 0 ||
    b.contact.length > 200
  ) {
    return { ok: false, error: "bad contact" };
  }
  if (!CHANNELS.includes(b.channel as Channel)) {
    return { ok: false, error: "bad channel" };
  }

  // Reuse language + messages validation from the chat validator.
  const base = validateChatInput({ language: b.language, messages: b.messages });
  if (!base.ok) return base;

  return { ok: true };
}
