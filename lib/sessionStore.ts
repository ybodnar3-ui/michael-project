import type { ChatMessage, Report } from "./types";

const KEY = "mp_session_v1";

export interface SavedSession {
  messages: ChatMessage[];
  done: boolean;
  report: Report | null;
}

export function loadSession(): SavedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<SavedSession>;
    if (!s || !Array.isArray(s.messages)) return null;
    return {
      messages: s.messages,
      done: Boolean(s.done),
      report: s.report ?? null,
    };
  } catch {
    return null;
  }
}

export function saveSession(s: SavedSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // storage full / disabled — non-fatal, session just won't persist
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
