import { describe, it, expect } from "vitest";
import { buildReportPrompt } from "@/lib/prompt";

describe("buildReportPrompt", () => {
  it("injects the language name", () => {
    expect(buildReportPrompt("de")).toContain("German");
    expect(buildReportPrompt("uk")).toContain("Ukrainian");
  });

  it("asks for concrete automation opportunities", () => {
    expect(buildReportPrompt("en").toLowerCase()).toContain("automation");
    expect(buildReportPrompt("en")).toContain("request_to_specialist");
  });
});
