# Resume Link (DB-backed sessions) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use `- [ ]`.

**Goal:** Variant A — persist each completed diagnostic (conversation + report) to a Postgres DB and give the user a unique **resume link** (`/s/<id>`) they can open from any device to view their analysis. No login. localStorage stays as the instant per-device cache.

**Architecture:** Neon serverless Postgres (`@neondatabase/serverless`). On lead submit, after the report is generated and the owner is notified, persist the session and return its `id`. A server component page `/s/[id]` fetches the stored report and renders it via `ReportView`. Everything degrades gracefully: with no `DATABASE_URL`, persistence is skipped and the app behaves as today (localStorage only).

**Tech Stack:** Next.js App Router (server component page + route), Neon serverless driver, Postgres `jsonb`.

**Human action:** create a Neon Postgres via Vercel Storage → `DATABASE_URL` auto-added to the project. Pull locally via `vercel env pull` for init/testing.

---

## Data model

Table `sessions`:
| column | type | note |
|---|---|---|
| id | text PK | random url-safe id (the resume token) |
| created_at | timestamptz default now() | |
| language | text | |
| messages | jsonb | full transcript |
| report | jsonb | the generated Report |
| lead_name | text null | |
| lead_contact | text null | |
| lead_channel | text null | |

---

## File Structure

| Path | Responsibility |
|---|---|
| `lib/db.ts` | Neon client + `initDb()`, `saveSession()`, `getSession()` (no-op when no DATABASE_URL) |
| `scripts/init-db.mjs` | One-off `CREATE TABLE IF NOT EXISTS` runner |
| `app/api/lead/route.ts` | After report+notify, persist session → return `{ report, sessionId }`; include link in owner Telegram |
| `app/s/[id]/page.tsx` | Server component: fetch stored report by id → render `ReportView`; 404-friendly if missing |
| `app/chat/page.tsx` | On lead success, show the resume link (copyable) |
| `lib/i18n.ts` | keys: `report.savedLink`, `report.copyLink`, `report.linkCopied`, `saved.title`, `saved.notFound` |
| `tests/lib/db.test.ts` | save/get are no-ops returning null when DATABASE_URL unset |

---

## Tasks

### Task 1: DB layer
- [ ] Install `@neondatabase/serverless`.
- [ ] `lib/db.ts`: lazy Neon client from `DATABASE_URL || POSTGRES_URL`; `hasDb()`; `initDb()` (CREATE TABLE IF NOT EXISTS); `saveSession(data): Promise<string|null>` (generate `crypto.randomUUID()`, INSERT, return id; null if no DB or on error — logged); `getSession(id): Promise<StoredSession|null>`.
- [ ] `scripts/init-db.mjs` to run `initDb()` once.
- [ ] Test: with no DATABASE_URL, `saveSession`/`getSession` return null (graceful).

### Task 2: Persist on lead + return id
- [ ] In `/api/lead`, after `notifyLead`, call `saveSession({language, messages, report, name, contact, channel})`; append the resume link to the owner Telegram message; return `{ report, sessionId }`.
- [ ] Keep the `notify_failed` warning path intact.

### Task 3: Resume page `/s/[id]`
- [ ] `app/s/[id]/page.tsx` (server component): `getSession(id)` → if found render header + `ReportView`; else a friendly "not found" message. i18n.

### Task 4: Show resume link in chat
- [ ] After lead success, if `sessionId` present, show "your report link: <abs url>/s/<id>" with a copy button. i18n.

### Task 5: Live wiring
- [ ] `vercel env pull` DATABASE_URL locally; `node scripts/init-db.mjs`; live test save+open `/s/<id>`; deploy.

---

## Definition of Done
- [ ] Completing a diagnostic yields a resume link openable on any device showing the report.
- [ ] Owner Telegram message includes the link.
- [ ] No DATABASE_URL → app still works (localStorage only), no errors.
- [ ] `npm test`/`lint`/`build` green; deployed.
