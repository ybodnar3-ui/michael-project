import { neon } from "@neondatabase/serverless";
import type { ChatMessage, Report, Channel, Language } from "./types";
import { log } from "./log";

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sql = url ? neon(url) : null;

export function hasDb(): boolean {
  return sql !== null;
}

export interface StoredSession {
  id: string;
  language: Language;
  messages: ChatMessage[];
  report: Report;
  created_at: string;
}

export async function initDb(): Promise<void> {
  if (!sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id text PRIMARY KEY,
      created_at timestamptz NOT NULL DEFAULT now(),
      language text NOT NULL,
      messages jsonb NOT NULL,
      report jsonb NOT NULL,
      lead_name text,
      lead_contact text,
      lead_channel text
    )
  `;
}

export async function saveSession(data: {
  language: Language;
  messages: ChatMessage[];
  report: Report;
  name?: string;
  contact?: string;
  channel?: Channel;
}): Promise<string | null> {
  if (!sql) return null;
  try {
    const id = crypto.randomUUID();
    await sql`
      INSERT INTO sessions (id, language, messages, report, lead_name, lead_contact, lead_channel)
      VALUES (
        ${id},
        ${data.language},
        ${JSON.stringify(data.messages)}::jsonb,
        ${JSON.stringify(data.report)}::jsonb,
        ${data.name ?? null},
        ${data.contact ?? null},
        ${data.channel ?? null}
      )
    `;
    return id;
  } catch (e) {
    log.error("db.save_failed", { error: String(e) });
    return null;
  }
}

export async function getSession(id: string): Promise<StoredSession | null> {
  if (!sql) return null;
  try {
    const rows = (await sql`
      SELECT id, language, messages, report, created_at
      FROM sessions WHERE id = ${id} LIMIT 1
    `) as Array<{
      id: string;
      language: Language;
      messages: ChatMessage[];
      report: Report;
      created_at: string | Date;
    }>;
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      language: r.language,
      messages: r.messages,
      report: r.report,
      created_at: String(r.created_at),
    };
  } catch (e) {
    log.error("db.get_failed", { error: String(e) });
    return null;
  }
}
