import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/claude", () => ({ runReport: vi.fn() }));
vi.mock("@/lib/notify", () => ({ notifyLead: vi.fn() }));

import { runReport } from "@/lib/claude";
import { notifyLead } from "@/lib/notify";
import { POST } from "@/app/api/lead/route";
import type { Report } from "@/lib/types";

function req(body: unknown): Request {
  return new Request("http://localhost/api/lead", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const lead = {
  name: "Іван",
  contact: "@ivan",
  channel: "telegram",
  language: "uk",
  messages: [
    { role: "user", content: "Почати" },
    { role: "assistant", content: "Чим займається ваш бізнес?" },
    { role: "user", content: "Доставка води" },
  ],
};

const sample: Report = {
  business_summary: "Доставка води.",
  automation_opportunities: [
    {
      title: "Чат-бот",
      problem: "Ручний прийом.",
      solution: "Бот.",
      ai_capability: "assistant",
      estimated_impact: "−2 год/день",
      request_to_specialist: "Хочу чат-бота.",
    },
  ],
  priority_recommendation: "Почати з бота.",
  next_step: "Напишіть нам.",
};

describe("POST /api/lead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("generates the report, notifies the owner, and returns the report", async () => {
    (runReport as ReturnType<typeof vi.fn>).mockResolvedValue(sample);
    const res = await POST(req(lead));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.report).toEqual(sample);
    expect(notifyLead).toHaveBeenCalledTimes(1);
    const [leadInfo, report] = (notifyLead as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(leadInfo).toMatchObject({ name: "Іван", channel: "telegram" });
    expect(report).toEqual(sample);
  });

  it("rejects an invalid lead with 400 and does not call the model", async () => {
    const res = await POST(req({ ...lead, name: "" }));
    expect(res.status).toBe(400);
    expect(runReport).not.toHaveBeenCalled();
    expect(notifyLead).not.toHaveBeenCalled();
  });
});
