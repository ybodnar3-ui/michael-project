// One-off: create the sessions table. Run with DATABASE_URL in env:
//   set -a; . ./.env.local; set +a; node scripts/init-db.mjs
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("No DATABASE_URL / POSTGRES_URL in env");
  process.exit(1);
}

const sql = neon(url);
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
console.log("✓ sessions table ready");
