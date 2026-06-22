import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns status ok", async () => {
    const res = GET();
    const body = await res.json();
    expect(body).toEqual({ status: "ok" });
  });
});
