import { describe, it, expect, beforeEach } from "vitest";
import { loadSession, saveSession, clearSession } from "@/lib/sessionStore";

beforeEach(() => localStorage.clear());

describe("sessionStore", () => {
  it("returns null when nothing is saved", () => {
    expect(loadSession()).toBeNull();
  });

  it("round-trips a saved session", () => {
    const s = {
      messages: [{ role: "user" as const, content: "hi" }],
      done: true,
      report: null,
    };
    saveSession(s);
    expect(loadSession()).toEqual(s);
  });

  it("clears a saved session", () => {
    saveSession({
      messages: [{ role: "user", content: "x" }],
      done: false,
      report: null,
    });
    clearSession();
    expect(loadSession()).toBeNull();
  });

  it("returns null on corrupt data", () => {
    localStorage.setItem("mp_session_v1", "{not json");
    expect(loadSession()).toBeNull();
  });
});
