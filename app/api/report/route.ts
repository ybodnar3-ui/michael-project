import { NextResponse } from "next/server";
import { buildReportPrompt } from "@/lib/prompt";
import { validateChatInput } from "@/lib/limits";
import { runReport } from "@/lib/claude";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { log } from "@/lib/log";
import type { ChatRequest, ChatMessage } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!rateLimit(`report:${clientIp(req)}`, 10, 60_000).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const validation = validateChatInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { language, messages } = body as ChatRequest;
  const system = buildReportPrompt(language);

  // Append a user trigger so the last turn is a user message
  // (Sonnet 4.6 rejects assistant-turn prefills).
  const withTrigger: ChatMessage[] = [
    ...messages,
    { role: "user", content: "Generate the automation audit now." },
  ];

  try {
    const report = await runReport(system, withTrigger);
    return NextResponse.json({ report });
  } catch (e) {
    log.error("report.llm_error", { error: String(e) });
    return NextResponse.json({ error: "llm_error" }, { status: 500 });
  }
}
