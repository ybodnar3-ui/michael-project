import { NextResponse } from "next/server";
import { buildReportPrompt } from "@/lib/prompt";
import { validateLeadInput } from "@/lib/lead";
import { runReport } from "@/lib/claude";
import { notifyLead } from "@/lib/notify";
import type { LeadRequest, ChatMessage } from "@/lib/types";

export async function POST(req: Request) {
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

  const { name, contact, channel, language, messages } = body as LeadRequest;
  const system = buildReportPrompt(language);
  const withTrigger: ChatMessage[] = [
    ...messages,
    { role: "user", content: "Generate the automation audit now." },
  ];

  try {
    const report = await runReport(system, withTrigger);
    await notifyLead({ name, contact, channel, language }, report);
    return NextResponse.json({ report });
  } catch {
    return NextResponse.json({ error: "llm_error" }, { status: 500 });
  }
}
