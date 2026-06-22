import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/prompt";
import { validateChatInput } from "@/lib/limits";
import { runChat } from "@/lib/claude";
import type { ChatRequest } from "@/lib/types";

export async function POST(req: Request) {
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
  const system = buildSystemPrompt(language);

  let raw: string;
  try {
    raw = await runChat(system, messages);
  } catch {
    return NextResponse.json({ error: "llm_error" }, { status: 500 });
  }

  const done = raw.includes("<<READY>>");
  const reply = raw.replace("<<READY>>", "").trim();
  return NextResponse.json({ reply, done });
}
