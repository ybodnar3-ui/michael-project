import { describe, it, expect, vi, beforeEach } from "vitest";

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: createMock };
  },
}));

import { runReport } from "@/lib/claude";
import type { Report } from "@/lib/types";

const validReport: Report = {
  business_summary: "Сводка",
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

const msgs = [{ role: "user" as const, content: "go" }];
const resWith = (text: string) => ({ content: [{ type: "text", text }] });

describe("runReport", () => {
  beforeEach(() => createMock.mockReset());

  it("parses and returns a valid report", async () => {
    createMock.mockResolvedValue(resWith(JSON.stringify(validReport)));
    expect(await runReport("sys", msgs)).toEqual(validReport);
  });

  it("throws on non-JSON model output", async () => {
    createMock.mockResolvedValue(resWith("sorry, I cannot do that"));
    await expect(runReport("sys", msgs)).rejects.toThrow("report_parse_failed");
  });

  it("throws when required top-level fields are missing", async () => {
    createMock.mockResolvedValue(resWith(JSON.stringify({ business_summary: "x" })));
    await expect(runReport("sys", msgs)).rejects.toThrow("report_invalid_shape");
  });

  it("throws when an opportunity element is malformed", async () => {
    createMock.mockResolvedValue(
      resWith(JSON.stringify({ ...validReport, automation_opportunities: [{}] }))
    );
    await expect(runReport("sys", msgs)).rejects.toThrow("report_invalid_shape");
  });

  it("throws when automation_opportunities is empty", async () => {
    createMock.mockResolvedValue(
      resWith(JSON.stringify({ ...validReport, automation_opportunities: [] }))
    );
    await expect(runReport("sys", msgs)).rejects.toThrow("report_invalid_shape");
  });
});
