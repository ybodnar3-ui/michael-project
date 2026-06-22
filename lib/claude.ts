import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, Report } from "./types";
import { REPORT_SCHEMA } from "./reportSchema";
import { log } from "./log";

function isReport(x: unknown): x is Report {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.business_summary === "string" &&
    Array.isArray(r.automation_opportunities) &&
    r.automation_opportunities.length > 0 &&
    typeof r.priority_recommendation === "string" &&
    typeof r.next_step === "string"
  );
}

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

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    // Model output wasn't valid JSON (truncation at max_tokens, refusal,
    // preamble). Log the offending payload so it's diagnosable in prod.
    log.error("report.parse_failed", {
      error: String(e),
      sample: text.slice(0, 500),
      length: text.length,
    });
    throw new Error("report_parse_failed");
  }
  if (!isReport(parsed)) {
    // Valid JSON but wrong shape — fail here instead of crashing later in
    // the notifier (e.g. .map on a missing automation_opportunities).
    log.error("report.invalid_shape", { sample: text.slice(0, 500) });
    throw new Error("report_invalid_shape");
  }
  return parsed;
}
