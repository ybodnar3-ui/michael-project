import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "@/lib/prompt";

describe("buildSystemPrompt", () => {
  it("injects the full language name for each locale", () => {
    expect(buildSystemPrompt("uk")).toContain("Ukrainian");
    expect(buildSystemPrompt("ru")).toContain("Russian");
    expect(buildSystemPrompt("en")).toContain("English");
    expect(buildSystemPrompt("de")).toContain("German");
  });

  it("instructs the model to emit the readiness token", () => {
    expect(buildSystemPrompt("en")).toContain("<<READY>>");
  });

  it("tells the model to ask one question at a time", () => {
    expect(buildSystemPrompt("en").toLowerCase()).toContain("one question");
  });
});
