import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, Report } from "./types";
import { REPORT_SCHEMA } from "./reportSchema";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) client = new Anthropic(); // reads ANTHROPIC_API_KEY from env
  return client;
}

export async function runChat(
  system: string,
  messages: ChatMessage[]
): Promise<string> {
  const res = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

export async function runReport(
  system: string,
  messages: ChatMessage[]
): Promise<Report> {
  const res = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    output_config: {
      format: {
        type: "json_schema",
        schema: REPORT_SCHEMA as unknown as Record<string, unknown>,
      },
    },
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  return JSON.parse(text) as Report;
}
