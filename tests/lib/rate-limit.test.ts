import { describe, it, expect } from "vitest";
import { rateLimit, clientIp } from "@/lib/rateLimit";

describe("rateLimit", () => {
  it("allows up to the limit, then blocks", () => {
    const k = "test-a";
    expect(rateLimit(k, 2, 1000, 0).ok).toBe(true);
    expect(rateLimit(k, 2, 1000, 10).ok).toBe(true);
    expect(rateLimit(k, 2, 1000, 20).ok).toBe(false);
  });

  it("resets after the window passes", () => {
    const k = "test-b";
    expect(rateLimit(k, 1, 1000, 0).ok).toBe(true);
    expect(rateLimit(k, 1, 1000, 500).ok).toBe(false);
    expect(rateLimit(k, 1, 1000, 1001).ok).toBe(true);
  });
});

describe("clientIp", () => {
  it("reads the first x-forwarded-for entry", () => {
    const req = new Request("http://x", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(clientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to 'unknown' with no headers", () => {
    expect(clientIp(new Request("http://x"))).toBe("unknown");
  });
});
