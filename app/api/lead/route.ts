import { NextResponse } from "next/server";
import { buildReportPrompt } from "@/lib/prompt";
import { validateLeadInput } from "@/lib/lead";
import { runReport } from "@/lib/claude";
import { notifyLead, notifyOwner } from "@/lib/notify";
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
    await notifyOwner(
      `⚠️ Лід отримано, але звіт не згенерувався.\n\n👤 ${name}\n📞 ${contact} (${channel})\n🌐 ${language}\n\nЗвернись до людини вручну.`
    ).catch(() => {});
    return NextResponse.json({ error: "llm_error" }, { status: 500 });
  }

  const result = await notifyLead(lead, report);
  log.info("lead.captured", {
    name,
    channel,
    language,
    telegram: Boolean(result?.telegram),
    email: Boolean(result?.email),
  });

  return NextResponse.json({ report });
}
