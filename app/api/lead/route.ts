import { NextResponse } from "next/server";
import { buildReportPrompt } from "@/lib/prompt";
import { validateLeadInput } from "@/lib/lead";
import { runReport } from "@/lib/claude";
import { notifyLead, notifyOwner } from "@/lib/notify";
import { saveSession } from "@/lib/db";
import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { log } from "@/lib/log";
import type { LeadRequest, LeadInfo, ChatMessage } from "@/lib/types";

// Report generation is an LLM call that can take 10-30s — give the
// serverless function enough headroom (Vercel caps short by default).
export const maxDuration = 60;

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`lead:${ip}`, 10, 60_000).ok) {
    log.warn("lead.rate_limited", { ip });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const validation = validateLeadInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const token = (body as { turnstileToken?: string }).turnstileToken;
  if (!(await verifyTurnstile(token, ip))) {
    log.warn("lead.turnstile_blocked", { ip });
    return NextResponse.json({ error: "turnstile" }, { status: 403 });
  }

  const { name, contact, channel, language, messages } = body as LeadRequest;
  const lead: LeadInfo = { name, contact, channel, language };
  const system = buildReportPrompt(language);
  const withTrigger: ChatMessage[] = [
    ...messages,
    { role: "user", content: "Generate the automation audit now." },
  ];

  let report;
  try {
    report = await runReport(system, withTrigger);
  } catch (e) {
    // Report failed — but DON'T lose the lead. Alert the owner so they
    // can follow up manually.
    log.error("lead.report_failed", { error: String(e), name, channel, language });
    const alerted = await notifyOwner(
      `⚠️ Лід отримано, але звіт не згенерувався.\n\n👤 ${name}\n📞 ${contact} (${channel})\n🌐 ${language}\n\nЗвернись до людини вручну.`
    ).catch((err) => {
      log.error("lead.fallback_notify_threw", { error: String(err) });
      return { telegram: false, email: false };
    });
    if (!alerted.telegram && !alerted.email) {
      // Worst case: report failed AND owner couldn't be reached. Log the full
      // contact so the lead is at least recoverable from logs.
      log.error("lead.fallback_notify_failed", { name, contact, channel, language });
    }
    return NextResponse.json({ error: "llm_error" }, { status: 500 });
  }

  // Persist the session so the user gets a cross-device resume link.
  const sessionId = await saveSession({
    language,
    messages,
    report,
    name,
    contact,
    channel,
  });
  const host = req.headers.get("host");
  const link = sessionId && host ? `https://${host}/s/${sessionId}` : null;

  const result = await notifyLead(lead, report, link);
  if (!result.telegram && !result.email) {
    // Lead captured but the owner was not reached on any channel. Log the full
    // contact (recoverable) and tell the client so success isn't faked.
    log.error("lead.notify_all_failed", { name, contact, channel, language });
    return NextResponse.json(
      { report, sessionId, warning: "notify_failed" },
      { status: 200 }
    );
  }
  log.info("lead.captured", {
    name,
    channel,
    language,
    telegram: result.telegram,
    email: result.email,
    saved: Boolean(sessionId),
  });

  return NextResponse.json({ report, sessionId });
}
