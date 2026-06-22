import { describe, it, expect } from "vitest";
import { statusErrorKey } from "@/lib/clientApi";

describe("statusErrorKey", () => {
  it("maps 429 to the rate-limit message", () => {
    expect(statusErrorKey(429)).toBe("chat.errorRate");
  });

  it("maps 403 to the bot/verification message", () => {
    expect(statusErrorKey(403)).toBe("chat.errorBot");
  });

  it("maps llm_error to the API-key message", () => {
    expect(statusErrorKey(500, "llm_error")).toBe("chat.errorKey");
  });

  it("falls back to the generic server message", () => {
    expect(statusErrorKey(500)).toBe("chat.errorServer");
    expect(statusErrorKey(404, "something_else")).toBe("chat.errorServer");
  });
});
