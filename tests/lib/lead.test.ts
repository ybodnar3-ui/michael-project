import { describe, it, expect } from "vitest";
import { validateLeadInput } from "@/lib/lead";

const ok = {
  name: "Іван",
  contact: "@ivan",
  channel: "telegram",
  language: "uk",
  messages: [{ role: "user", content: "Почати" }],
};

describe("validateLeadInput", () => {
  it("accepts a valid lead", () => {
    expect(validateLeadInput(ok)).toEqual({ ok: true });
  });

  it("rejects an empty name", () => {
    expect(validateLeadInput({ ...ok, name: "  " }).ok).toBe(false);
  });

  it("rejects an empty contact", () => {
    expect(validateLeadInput({ ...ok, contact: "" }).ok).toBe(false);
  });

  it("rejects an unknown channel", () => {
    expect(validateLeadInput({ ...ok, channel: "fax" }).ok).toBe(false);
  });

  it("rejects an unknown language", () => {
    expect(validateLeadInput({ ...ok, language: "fr" }).ok).toBe(false);
  });

  it("rejects an over-long name", () => {
    expect(validateLeadInput({ ...ok, name: "a".repeat(101) }).ok).toBe(false);
  });
});
