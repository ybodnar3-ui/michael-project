# Phase 5 — Abuse Protection & Cost Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Зробити безпечним масове поширення посилання: rate-limit по IP на всі API, Cloudflare Turnstile проти ботів (graceful), і документований бюджетний cap. Без секретів усе працює як раніше.

**Architecture:** `lib/rateLimit.ts` (in-memory, на ключ=IP, інжектиться `now` для тестів) застосовується у `/api/chat`, `/api/report`, `/api/lead` → 429 при перевищенні. `lib/turnstile.ts` (`verifyTurnstile` — no-op без `TURNSTILE_SECRET_KEY`) гейтить `/api/lead`. Фронт: компонент `Turnstile` рендериться лише якщо є `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; токен іде в сабміт ліда. Caps повідомлень/довжини вже діють (Фаза 1).

**Tech Stack:** Next.js route handlers, Cloudflare Turnstile (siteverify через fetch), Vitest.

**Передумова:** Фаза 4 завершена.

> ⚠️ **Serverless-нюанс rate-limit:** in-memory лічильник надійний на одному інстансі/в dev; на Vercel із багатьма інстансами він частковий. Це базовий запобіжник + фундамент; продакшн-grade розподілений ліміт (Upstash/Vercel KV) — у беклог. Головний «жорсткий стелаж» витрат — бюджетний cap у консолі Anthropic (Task 5).

---

## File Structure (Фаза 5)

| Шлях | Відповідальність |
|---|---|
| `lib/rateLimit.ts` | `rateLimit(key, limit, windowMs, now?)` + `clientIp(req)` |
| `lib/turnstile.ts` | `verifyTurnstile(token, ip?)` — graceful no-op без секрету |
| `components/Turnstile.tsx` | Віджет (рендериться лише з site key) |
| `app/api/chat/route.ts` | + rate-limit |
| `app/api/report/route.ts` | + rate-limit |
| `app/api/lead/route.ts` | + rate-limit + turnstile gate |
| `app/chat/page.tsx` | Turnstile у lead-формі, токен у сабміт |
| `docs/deployment.md` | + бюджетний cap + Turnstile env |
| `tests/lib/rate-limit.test.ts`, `tests/lib/turnstile.test.ts` | тести |

---

## Task 1: Rate limiter (TDD)

**Files:** Create `lib/rateLimit.ts`, `tests/lib/rate-limit.test.ts`

- [ ] **Step 1:** Тест: `rateLimit("k",2,1000,now)` — перші 2 виклики `ok:true`, 3-й `ok:false`; після `now+1001` — знову `ok:true` (вікно скинулось).
- [ ] **Step 2:** fail.
- [ ] **Step 3:** Реалізувати:
```typescript
// lib/rateLimit.ts
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): { ok: boolean; remaining: number } {
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (b.count >= limit) return { ok: false, remaining: 0 };
  b.count++;
  return { ok: true, remaining: limit - b.count };
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
```
- [ ] **Step 4:** pass → **Step 5:** Commit `feat: add in-memory rate limiter`.

---

## Task 2: Turnstile verify (TDD)

**Files:** Create `lib/turnstile.ts`, `tests/lib/turnstile.test.ts`

- [ ] **Step 1:** Тест: без `TURNSTILE_SECRET_KEY` у env → `verifyTurnstile("anything")` повертає `true` (graceful).
- [ ] **Step 2:** fail.
- [ ] **Step 3:** Реалізувати:
```typescript
// lib/turnstile.ts
export async function verifyTurnstile(
  token: string | undefined,
  ip?: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured -> skip (graceful)
  if (!token) return false;
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ secret, response: token, remoteip: ip }),
      }
    );
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}
```
- [ ] **Step 4:** pass → **Step 5:** Commit `feat: add Turnstile verification (graceful)`.

---

## Task 3: Застосувати rate-limit у роутах

**Files:** Modify `app/api/chat/route.ts`, `app/api/report/route.ts`, `app/api/lead/route.ts`

- [ ] **Step 1:** На початку кожного `POST` (після parse, до виклику моделі) додати:
```typescript
import { rateLimit, clientIp } from "@/lib/limits-rate"; // see note
// ...
const ip = clientIp(req);
const rl = rateLimit(`chat:${ip}`, 30, 60_000); // report: 10, lead: 10
if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
```
(імпорт із `@/lib/rateLimit`; ключі `chat:`/`report:`/`lead:`; ліміти: chat 30/хв, report 10/хв, lead 10/хв.)
- [ ] **Step 2:** `npm test` — існуючі route-тести зелені (≤3 виклики < ліміти).
- [ ] **Step 3:** Commit `feat: rate-limit chat/report/lead per IP`.

---

## Task 4: Turnstile у `/api/lead` + фронт-віджет

**Files:** Modify `app/api/lead/route.ts`; Create `components/Turnstile.tsx`; Modify `app/chat/page.tsx`

- [ ] **Step 1:** У `/api/lead` після валідації: прочитати `turnstileToken` з body, `verifyTurnstile(token, ip)`; якщо `false` → 403 `{error:"turnstile"}`. (Без секрету — проходить, існуючий тест лишається зеленим.)
- [ ] **Step 2:** `components/Turnstile.tsx`: якщо `NEXT_PUBLIC_TURNSTILE_SITE_KEY` відсутній — одразу `onToken("")` і нічого не рендерить; інакше підвантажити скрипт Cloudflare і відрендерити віджет, віддаючи токен через `onToken`.
- [ ] **Step 3:** У lead-формі `app/chat/page.tsx`: додати `<Turnstile onToken={setTsToken}/>`, стан `tsToken`, і слати `turnstileToken: tsToken` у `/api/lead`.
- [ ] **Step 4:** `npm test` + `npm run build` — зелено.
- [ ] **Step 5:** Commit `feat: gate lead submit with Turnstile (graceful)`.

---

## Task 5: Human actions — бюджетний cap + Turnstile ключі (документ)

**Files:** Modify `docs/deployment.md`

- [ ] **Step 1:** Дописати в `docs/deployment.md` розділ:
  - **Бюджетний cap (обов'язково):** console.anthropic.com → Limits → місячний ліміт витрат (головний стоп-кран).
  - **Turnstile (рекомендовано):** dash.cloudflare.com → Turnstile → створити віджет → `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (site) + `TURNSTILE_SECRET_KEY` (secret) у `.env.local`/Vercel env.
- [ ] **Step 2:** Commit `docs: add budget cap & Turnstile setup`.

---

## Backlog (з Фази 5)

- Розподілений rate-limit (Upstash/Vercel KV) замість in-memory для надійності на serverless.

---

## Definition of Done (Фаза 5)

- [ ] Rate-limit діє на всіх 3 API (429 при перевищенні).
- [ ] Turnstile гейтить лід; без ключів — graceful (усе працює).
- [ ] Бюджетний cap і Turnstile задокументовані як human actions.
- [ ] `npm test` зелений, `npm run build` успішний. Усі коміти в `origin/main`.
