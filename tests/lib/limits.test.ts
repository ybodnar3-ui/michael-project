import { describe, it, expect } from "vitest";
import { validateChatInput, MAX_MESSAGES, MAX_INPUT_CHARS } from "@/lib/limits";

const ok = { language: "uk", messages: [{ role: "user", content: "привіт" }] };

describe("validateChatInput", () => {
  it("accepts a valid request", () => {
    expect(validateChatInput(ok)).toEqual({ ok: true });
  });

  it("rejects an unknown language", () => {
    const r = validateChatInput({ ...ok, language: "fr" });
    expect(r.ok).toBe(false);
  });

  it("rejects empty messages", () => {
    expect(validateChatInput({ ...ok, messages: [] }).ok).toBe(false);
  });

  it("rejects when first message is not from user", () => {
    const r = validateChatInput({
      ...ok,
      messages: [{ role: "assistant", content: "hi" }],
    });
    expect(r.ok).toBe(false);
  });

  it("rejects too many messages", () => {
    const many = Array.from({ length: MAX_MESSAGES + 1 }, () => ({
      role: "user" as const,
      content: "x",
    }));
    expect(validateChatInput({ ...ok, messages: many }).ok).toBe(false);
  });

  it("rejects an over-long message", () => {
    const big = "a".repeat(MAX_INPUT_CHARS + 1);
    const r = validateChatInput({
      ...ok,
      messages: [{ role: "user", content: big }],
    });
    expect(r.ok).toBe(false);
  });

  it("rejects an unknown role", () => {
    const r = validateChatInput({
      ...ok,
      messages: [{ role: "system", content: "hi" }],
    });
    expect(r.ok).toBe(false);
  });

  it("rejects non-string content", () => {
    const r = validateChatInput({
      ...ok,
      messages: [{ role: "user", content: 42 }],
    });
    expect(r.ok).toBe(false);
  });
});
