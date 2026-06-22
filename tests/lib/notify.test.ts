import { describe, it, expect } from "vitest";
import { formatLeadMessage, notifyOwner } from "@/lib/notify";
import type { LeadInfo, Report } from "@/lib/types";

const lead: LeadInfo = {
  name: "Іван",
  contact: "@ivan",
  channel: "telegram",
  language: "uk",
};

const report: Report = {
  business_summary: "Доставка води.",
  automation_opportunities: [
    {
      title: "Чат-бот",
      problem: "Ручний прийом.",
      solution: "Бот.",
      ai_capability: "assistant",
      estimated_impact: "−2 год/день",
      request_to_specialist: "Хочу чат-бота для замовлень.",
    },
  ],
  priority_recommendation: "Почати з бота.",
  next_step: "Напишіть нам.",
};

describe("formatLeadMessage", () => {
  it("includes the lead name and contact", () => {
    const msg = formatLeadMessage(lead, report);
    expect(msg).toContain("Іван");
    expect(msg).toContain("@ivan");
  });

  it("includes the business summary and a request to specialist", () => {
    const msg = formatLeadMessage(lead, report);
    expect(msg).toContain("Доставка води.");
    expect(msg).toContain("Хочу чат-бота для замовлень.");
  });
});

describe("notifyOwner", () => {
  it("returns false for all channels when no credentials are configured", async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    delete process.env.RESEND_API_KEY;
    const result = await notifyOwner("test");
    expect(result).toEqual({ telegram: false, email: false });
  });
});
