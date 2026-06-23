import type { LeadInfo, Report } from "./types";
import { log } from "./log";
import { fetchWithTimeout } from "./fetchTimeout";

const TELEGRAM_LIMIT = 3900; // Telegram hard limit is 4096; keep margin.

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

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

async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) {
    log.warn("notify.telegram.skipped", { reason: "no_creds" });
    return false;
  }
  try {
    const res = await fetchWithTimeout(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chat,
          text: truncate(text, TELEGRAM_LIMIT),
          disable_web_page_preview: true,
        }),
      }
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      log.error("notify.telegram.failed", {
        status: res.status,
        body: body.slice(0, 300),
      });
      return false;
    }
    return true;
  } catch (e) {
    log.error("notify.telegram.error", { error: String(e) });
    return false;
  }
}

async function sendEmail(text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_EMAIL_TO;
  const from = process.env.LEAD_EMAIL_FROM;
  if (!key || !to || !from) {
    log.warn("notify.email.skipped", { reason: "no_creds" });
    return false;
  }
  try {
    const res = await fetchWithTimeout("https://api.resend.com/emails", {
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
    if (!res.ok) {
      log.error("notify.email.failed", { status: res.status });
      return false;
    }
    return true;
  } catch (e) {
    log.error("notify.email.error", { error: String(e) });
    return false;
  }
}

export async function notifyOwner(
  text: string
): Promise<{ telegram: boolean; email: boolean }> {
  const [telegram, email] = await Promise.all([
    sendTelegram(text),
    sendEmail(text),
  ]);
  if (!telegram && !email) {
    log.error("notify.all_failed", {});
  }
  return { telegram, email };
}

export async function notifyLead(
  lead: LeadInfo,
  report: Report,
  link?: string | null
): Promise<{ telegram: boolean; email: boolean }> {
  const base = formatLeadMessage(lead, report);
  const text = link
    ? `${base}\n\n🔗 Звіт (відкриється з будь-якого пристрою): ${link}`
    : base;
  return notifyOwner(text);
}
