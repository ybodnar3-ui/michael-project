import type { LeadInfo, Report } from "./types";

export function formatLeadMessage(lead: LeadInfo, report: Report): string {
  const opps = report.automation_opportunities
    .map((o, i) => `${i + 1}. ${o.title}\n   → ${o.request_to_specialist}`)
    .join("\n");
  return [
    "🔥 Новий лід — AI Automation Diagnostic",
    "",
    `👤 Ім'я: ${lead.name}`,
    `📞 Контакт: ${lead.contact} (${lead.channel})`,
    `🌐 Мова: ${lead.language}`,
    "",
    `📋 Бізнес: ${report.business_summary}`,
    "",
    "Можливості:",
    opps,
    "",
    `▶️ З чого почати: ${report.priority_recommendation}`,
  ].join("\n");
}

async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text }),
  });
}

async function sendEmail(text: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_EMAIL_TO;
  const from = process.env.LEAD_EMAIL_FROM;
  if (!key || !to || !from) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Новий лід — AI Automation Diagnostic",
      text,
    }),
  });
}

export async function notifyLead(lead: LeadInfo, report: Report): Promise<void> {
  const text = formatLeadMessage(lead, report);
  await Promise.allSettled([sendTelegram(text), sendEmail(text)]);
}
