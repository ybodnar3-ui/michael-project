import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/claude", () => ({ runReport: vi.fn() }));

import { runReport } from "@/lib/claude";
import { POST } from "@/app/api/report/route";
import type { Report } from "@/lib/types";

function req(body: unknown): Request {
  return new Request("http://localhost/api/report", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const transcript = {
  language: "uk",
  messages: [
    { role: "user", content: "Почати" },
    { role: "assistant", content: "Чим займається ваш бізнес?" },
    { role: "user", content: "Стоматологія" },
  ],
};

const sample: Report = {
  business_summary: "Стоматологія на 3 крісла.",
  automation_opportunities: [
    {
      title: "Автозапис",
      problem: "Пацієнти не додзвонюються.",
      solution: "AI-бот для запису.",
      ai_capability: "conversational assistant",
      estimated_impact: "менше пропущених дзвінків",
      request_to_specialist: "Хочу автоматизувати запис пацієнтів.",
    },
  ],
  priority_recommendation: "Почати з автозапису.",
  next_step: "Обговорити впровадження.",
};

describe("POST /api/report", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the generated report", async () => {
    (runReport as ReturnType<typeof vi.fn>).mockResolvedValue(sample);
    const res = await POST(req(transcript));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.report).toEqual(sample);
  });

  it("appends a final user trigger so the model is not prefilled on assistant", async () => {
    (runReport as ReturnType<typeof vi.fn>).mockResolvedValue(sample);
    await POST(req(transcript));
    const passedMessages = (runReport as ReturnType<typeof vi.fn>).mock
      .calls[0][1];
    expect(passedMessages[passedMessages.length - 1].role).toBe("user");
  });

  it("rejects invalid input with 400", async () => {
    const res = await POST(req({ language: "fr", messages: [] }));
    expect(res.status).toBe(400);
    expect(runReport).not.toHaveBeenCalled();
  });
});
