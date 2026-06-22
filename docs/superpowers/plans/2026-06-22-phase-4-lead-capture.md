# Phase 4 — Lead Capture & Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Після завершення інтерв'ю показати **lead-gate** (контакт), і по сабміту: згенерувати звіт, **надіслати лід + звіт власнику (Telegram, email опційно)** і показати звіт користувачу.

**Architecture:** Lead-gate замінює пряму кнопку «Згенерувати звіт». Сабміт → `POST /api/lead` з `{name, contact, channel, language, messages}`. Сервер: валідація → `runReport` (звіт) → `notifyLead` (Telegram + email, **graceful** — без креденшелів просто пропускає, не падає) → повертає `{report}` для показу. **БД-історія — у беклог** (Telegram-повідомлення = надійний запис ліда для MVP).

**Tech Stack:** Next.js route handler, Telegram Bot API (fetch), Resend (опційно, fetch), Vitest (мок `runReport` + `notify`).

**Передумова:** Фаза 3 завершена (флоу до звіту працює, i18n).

---

## Дані

```ts
type Channel = "email" | "phone" | "telegram";
interface LeadRequest {
  name: string;
  contact: string;
  channel: Channel;
  language: Language;
  messages: ChatMessage[];
}
interface LeadInfo { name: string; contact: string; channel: Channel; language: Language; }
```

---

## File Structure (Фаза 4)

| Шлях | Відповідальність |
|---|---|
| `lib/types.ts` | + `Channel`, `LeadRequest`, `LeadInfo` |
| `lib/lead.ts` | `validateLeadInput(body)` |
| `lib/notify.ts` | `formatLeadMessage(lead, report)` (pure) + `notifyLead` (Telegram/email, graceful) |
| `app/api/lead/route.ts` | POST: валідація → звіт → notify → `{report}` |
| `lib/i18n.ts` | + ключі lead-форми (4 мови) |
| `app/chat/page.tsx` | lead-gate форма замість прямої кнопки звіту |
| `tests/lib/lead.test.ts` | валідація ліда |
| `tests/lib/notify.test.ts` | формат повідомлення |
| `tests/api/lead.test.ts` | роут (мок `runReport` + `notifyLead`) |

---

## Task 1: Типи + валідація ліда (TDD)

**Files:** Modify `lib/types.ts`; Create `lib/lead.ts`, `tests/lib/lead.test.ts`

- [ ] **Step 1:** Додати в `lib/types.ts`: `Channel`, `LeadRequest`, `LeadInfo`.
- [ ] **Step 2:** Тест `tests/lib/lead.test.ts`: валідний лід → `{ok:true}`; пусте ім'я → false; пустий контакт → false; невідомий channel → false; невідома мова → false; занадто довге ім'я (>100) → false.
- [ ] **Step 3:** Запустити — fail.
- [ ] **Step 4:** Реалізувати `lib/lead.ts`:
```typescript
import type { Channel, Language } from "./types";
import { validateChatInput } from "./limits";

const CHANNELS: Channel[] = ["email", "phone", "telegram"];
export type LeadValidation = { ok: true } | { ok: false; error: string };

export function validateLeadInput(body: unknown): LeadValidation {
  if (!body || typeof body !== "object") return { ok: false, error: "bad body" };
  const b = body as Record<string, unknown>;
  if (typeof b.name !== "string" || b.name.trim().length === 0 || b.name.length > 100)
    return { ok: false, error: "bad name" };
  if (typeof b.contact !== "string" || b.contact.trim().length === 0 || b.contact.length > 200)
    return { ok: false, error: "bad contact" };
  if (!CHANNELS.includes(b.channel as Channel)) return { ok: false, error: "bad channel" };
  // reuse language + messages validation
  const base = validateChatInput({ language: b.language, messages: b.messages });
  if (!base.ok) return base;
  return { ok: true };
}
```
- [ ] **Step 5:** pass → **Step 6:** Commit `feat: add lead types and validation`.

---

## Task 2: Notification module (TDD на форматтері)

**Files:** Create `lib/notify.ts`, `tests/lib/notify.test.ts`

- [ ] **Step 1:** Тест `tests/lib/notify.test.ts`: `formatLeadMessage(lead, report)` містить ім'я, контакт, `business_summary` і перший `request_to_specialist`.
- [ ] **Step 2:** fail.
- [ ] **Step 3:** Реалізувати `lib/notify.ts`:
```typescript
import type { LeadInfo, Report } from "./types";

export function formatLeadMessage(lead: LeadInfo, report: Report): string {
  const opps = report.automation_opportunities
    .map((o, i) => `${i + 1}. ${o.title}\n   → ${o.request_to_specialist}`)
    .join("\n");
  return [
    "🔥 Новий лід — AI Automation Diagnostic",
    "",
    `👤 Ім'я: ${lead.name}`,
    `📞 Контакт: ${lead.contact} (${lead.channel})`,
    `🌐 Мова: ${lead.language}`,
    "",
    `📋 Бізнес: ${report.business_summary}`,
    "",
    "Можливості:",
    opps,
    "",
    `▶️ З чого почати: ${report.priority_recommendation}`,
  ].join("\n");
}

async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text }),
  });
}

async function sendEmail(text: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_EMAIL_TO;
  const from = process.env.LEAD_EMAIL_FROM;
  if (!key || !to || !from) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ from, to, subject: "Новий лід — AI Automation Diagnostic", text }),
  });
}

export async function notifyLead(lead: LeadInfo, report: Report): Promise<void> {
  const text = formatLeadMessage(lead, report);
  await Promise.allSettled([sendTelegram(text), sendEmail(text)]);
}
```
- [ ] **Step 4:** pass → **Step 5:** Commit `feat: add lead notification (Telegram + optional email)`.

---

## Task 3: Endpoint `POST /api/lead` (TDD з моками)

**Files:** Create `app/api/lead/route.ts`, `tests/api/lead.test.ts`

- [ ] **Step 1:** Тест (мок `@/lib/claude` `runReport` + `@/lib/notify` `notifyLead`):
  - валідний лід → 200, `body.report` = звіт, `notifyLead` викликано з `(leadInfo, report)`;
  - невалідний (пусте ім'я) → 400, `runReport` не викликано.
- [ ] **Step 2:** fail.
- [ ] **Step 3:** Реалізувати `app/api/lead/route.ts`:
```typescript
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
```
- [ ] **Step 4:** pass → **Step 5:** Commit `feat: add POST /api/lead (generate report + notify owner)`.

---

## Task 4: i18n ключі lead-форми

**Files:** Modify `lib/i18n.ts`

- [ ] **Step 1:** Додати в усі 4 словники ключі:
  `lead.title`, `lead.subtitle`, `lead.name`, `lead.contact`, `lead.channel.email`, `lead.channel.phone`, `lead.channel.telegram`, `lead.submit`, `lead.submitting`, `lead.errorName`, `lead.errorContact`.
  (Тексти — у кроці виконання, 4 мовами.)
- [ ] **Step 2:** `npm test` (i18n) ок → **Step 3:** Commit.

---

## Task 5: Lead-gate у `/chat`

**Files:** Modify `app/chat/page.tsx`

- [ ] **Step 1:** Замінити блок `done && !report` (кнопка «Згенерувати звіт») на **форму**: заголовок `lead.title` + субтайтл, поле `name`, поле `contact`, селект каналу (telegram/phone/email), кнопка `lead.submit`. Клієнтська валідація (ім'я+контакт непусті → інакше показати `lead.errorName`/`lead.errorContact`).
- [ ] **Step 2:** Додати `submitLead()`: POST `/api/lead` з `{name, contact, channel, language: lang, messages}` → на 200 `setReport(data.report)`; на помилку — `setError(t("chat.errorReport"))`. Стан `leadLoading`, поля `name/contact/channel`.
- [ ] **Step 3:** Прибрати стару `generateReport` (більше не потрібна). `ReportView` показується так само після отримання `report`.
- [ ] **Step 4:** `npm test` + `npm run build` — зелено (роут `/api/lead` присутній).
- [ ] **Step 5:** Commit `feat: add lead-gate form before report in /chat`.

---

## Task 6: Жива перевірка (human action — Telegram-бот)

- [ ] **Step 1:** Створити Telegram-бота: написати **@BotFather** → `/newbot` → отримати **TELEGRAM_BOT_TOKEN**.
- [ ] **Step 2:** Дізнатися **TELEGRAM_CHAT_ID**: написати своєму боту будь-що, потім відкрити `https://api.telegram.org/bot<TOKEN>/getUpdates` → знайти `chat.id`.
- [ ] **Step 3:** Додати в `.env.local`:
  ```dotenv
  TELEGRAM_BOT_TOKEN=...
  TELEGRAM_CHAT_ID=...
  ```
  (Email опційно: `RESEND_API_KEY`, `LEAD_EMAIL_TO`, `LEAD_EMAIL_FROM`.)
- [ ] **Step 4:** Перезапустити `npm run dev`, пройти флоу до кінця, заповнити lead-форму → переконатися: звіт показано користувачу **і** лід+звіт прилетіли в Telegram.

---

## Backlog (винесено з Фази 4)

- **БД-історія лідів** (hosted Postgres): зберігати сесії/ліди/звіти для дашборду й аналітики. Зараз надійний запис ліда = Telegram-повідомлення.

---

## Definition of Done (Фаза 4)

- [ ] Після інтерв'ю показується lead-gate; без контакту звіт не видно.
- [ ] Сабміт → звіт показано користувачу.
- [ ] (Live) Лід + звіт прилітають власнику в Telegram.
- [ ] Без креденшелів нотифікації нічого не падає (graceful), звіт усе одно показується.
- [ ] `npm test` зелений, `npm run build` успішний. Усі коміти в `origin/main`.
