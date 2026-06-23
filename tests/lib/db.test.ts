import { describe, it, expect } from "vitest";
import { hasDb, saveSession, getSession } from "@/lib/db";
import type { Report } from "@/lib/types";

const report: Report = {
  business_summary: "x",
  automation_opportunities: [
    {
      title: "t",
      problem: "p",
      solution: "s",
      ai_capability: "a",
      estimated_impact: "e",
      request_to_specialist: "r",
    },
  ],
  priority_recommendation: "pr",
  next_step: "ns",
};

// No DATABASE_URL in the test env -> the DB layer is a graceful no-op.
describe("db (no DATABASE_URL)", () => {
  it("reports no database configured", () => {
    expect(hasDb()).toBe(false);
  });

  it("saveSession returns null", async () => {
    const id = await saveSession({ language: "uk", messages: [], report });
    expect(id).toBeNull();
  });

  it("getSession returns null", async () => {
    expect(await getSession("anything")).toBeNull();
  });
});
