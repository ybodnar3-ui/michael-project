import { describe, it, expect } from "vitest";
import { verifyTurnstile } from "@/lib/turnstile";

describe("verifyTurnstile", () => {
  it("skips (returns true) when no secret is configured", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    expect(await verifyTurnstile("anything")).toBe(true);
    expect(await verifyTurnstile(undefined)).toBe(true);
  });
});
