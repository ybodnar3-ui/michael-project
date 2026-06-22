# Phase 0 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Підняти робочий скелет Next.js-застосунку з TypeScript, Tailwind, тестовим тулчейном і health-check API, готовий до деплою на Vercel.

**Architecture:** Next.js (App Router) у корені репозиторію. Серверні route handlers під `app/api/*`. Тести на Vitest (unit + React Testing Library). Production-build перевіряється локально; деплой на Vercel — окремий крок (потребує входу користувача).

**Tech Stack:** Next.js (latest, App Router), React, TypeScript, Tailwind CSS, Vitest, @testing-library/react, npm.

**Передумова:** репозиторій `ybodnar3-ui/michael-project` уже клоновано в робочу теку; гілка `main`. У корені вже є `README.md`, `.git/`, `.planning/`, `.claude/`, `docs/`.

---

## File Structure (що з'явиться у Фазі 0)

| Шлях | Відповідальність |
|---|---|
| `package.json`, `tsconfig.json`, `next.config.ts` | Конфіг проєкту (генерує create-next-app) |
| `app/layout.tsx` | Кореневий layout |
| `app/page.tsx` | Лендинг-плейсхолдер |
| `app/globals.css` | Tailwind-стилі |
| `app/api/health/route.ts` | Health-check endpoint |
| `lib/` | (порожня, під майбутню логіку) |
| `components/` | (порожня, під майбутні UI-компоненти) |
| `tests/setup.ts` | Налаштування Vitest (jest-dom матчери) |
| `tests/api/health.test.ts` | Тест health endpoint |
| `tests/app/page.test.tsx` | Тест лендинг-плейсхолдера |
| `vitest.config.ts` | Конфіг Vitest |
| `.env.example` | Шаблон env-змінних (з коментарями по фазах) |
| `README.md` | Оновлений опис проєкту + команди |

---

## Task 1: Scaffold Next.js у корінь репозиторію

`create-next-app` відмовляється стартувати в теці з конфліктними файлами (`README.md`), тому скафолдимо в тимчасову теку й переносимо в корінь, зберігаючи `.git`.

**Files:**
- Create: весь скелет Next.js у корені репо.

- [ ] **Step 1: Scaffold у тимчасову теку**

```bash
rm -rf /tmp/mp-scaffold
npx create-next-app@latest /tmp/mp-scaffold \
  --ts --tailwind --app --eslint \
  --no-src-dir --import-alias "@/*" --use-npm --no-turbopack --yes
```

Expected: тека `/tmp/mp-scaffold` з готовим Next.js-проєктом.

- [ ] **Step 2: Перенести файли в корінь репо (без перезапису README та git)**

```bash
cd /tmp/mp-scaffold
rm -f README.md            # лишаємо наш README
# перенести все, включно з дотфайлами, окрім .git
shopt -s dotglob
cp -R /tmp/mp-scaffold/* /Users/yura.mac/michael-project/
shopt -u dotglob
cd /Users/yura.mac/michael-project
```

- [ ] **Step 3: Створити порожні теки під майбутню логіку**

```bash
mkdir -p lib components
touch lib/.gitkeep components/.gitkeep
```

- [ ] **Step 4: Встановити залежності й перевірити dev-сервер**

```bash
cd /Users/yura.mac/michael-project
npm install
npm run build
```

Expected: `npm run build` завершується без помилок (`✓ Compiled successfully`).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app (TS, Tailwind, App Router)"
git push origin main
```

---

## Task 2: Project conventions — .env.example, .gitignore, README

**Files:**
- Create: `.env.example`
- Modify: `README.md`
- Verify: `.gitignore` ігнорує `.env*` (create-next-app додає `.env*` за замовчуванням — перевірити)

- [ ] **Step 1: Створити `.env.example`**

```bash
# Файл: .env.example
```

```dotenv
# ---- Phase 1: Claude API ----
ANTHROPIC_API_KEY=

# ---- Phase 4: Database (hosted Postgres) ----
DATABASE_URL=

# ---- Phase 4: Lead routing ----
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
RESEND_API_KEY=

# ---- Phase 5: Abuse protection ----
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

- [ ] **Step 2: Перевірити, що `.env*` у `.gitignore`**

Run: `grep -n "env" .gitignore`
Expected: рядок на кшталт `.env*` присутній. Якщо ні — додати `.env*` у `.gitignore`.

- [ ] **Step 3: Оновити README.md**

```markdown
# michael-project

AI Automation Diagnostic — веб-застосунок-воронка: бізнес спілкується з AI,
отримує персональний звіт «що можна автоматизувати», лід прилітає власнику.

Дизайн: `docs/superpowers/specs/2026-06-22-ai-automation-diagnostic-design.md`
Плани фаз: `docs/superpowers/plans/`

## Стек
Next.js (App Router) · TypeScript · Tailwind · Vitest · Claude API

## Розробка
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm test           # запустити тести
```

## Env
Скопіюй `.env.example` у `.env.local` і заповни ключі (по фазах).
```

- [ ] **Step 4: Commit**

```bash
git add .env.example README.md .gitignore
git commit -m "chore: add .env.example and project README"
git push origin main
```

---

## Task 3: Тестовий тулчейн (Vitest)

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `tests/smoke.test.ts`
- Modify: `package.json` (скрипт `test`)

- [ ] **Step 1: Встановити dev-залежності**

```bash
npm install -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Створити `vitest.config.ts`**

```typescript
// Файл: vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 3: Створити `tests/setup.ts`**

```typescript
// Файл: tests/setup.ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Додати скрипт `test` у `package.json`**

У секцію `"scripts"` додати:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Написати smoke-тест**

```typescript
// Файл: tests/smoke.test.ts
import { describe, it, expect } from "vitest";

describe("toolchain smoke", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Запустити тести — мають пройти**

Run: `npm test`
Expected: PASS (1 passed).

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts tests/setup.ts tests/smoke.test.ts package.json package-lock.json
git commit -m "test: set up Vitest + Testing Library toolchain"
git push origin main
```

---

## Task 4: Health-check API route (TDD)

**Files:**
- Create: `tests/api/health.test.ts`
- Create: `app/api/health/route.ts`

- [ ] **Step 1: Написати падаючий тест**

```typescript
// Файл: tests/api/health.test.ts
import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns status ok", async () => {
    const res = GET();
    const body = await res.json();
    expect(body).toEqual({ status: "ok" });
  });
});
```

- [ ] **Step 2: Запустити — має впасти**

Run: `npm test -- tests/api/health.test.ts`
Expected: FAIL (модуль `@/app/api/health/route` не існує).

- [ ] **Step 3: Реалізувати route handler**

```typescript
// Файл: app/api/health/route.ts
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok" });
}
```

- [ ] **Step 4: Запустити — має пройти**

Run: `npm test -- tests/api/health.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/health/route.ts tests/api/health.test.ts
git commit -m "feat: add /api/health endpoint"
git push origin main
```

---

## Task 5: Лендинг-плейсхолдер (TDD)

Замінюємо дефолтну сторінку create-next-app на мінімальний брендований плейсхолдер.

**Files:**
- Create: `tests/app/page.test.tsx`
- Modify: `app/page.tsx` (повна заміна)

- [ ] **Step 1: Написати падаючий тест**

```tsx
// Файл: tests/app/page.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home (landing placeholder)", () => {
  it("renders the product heading", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /automation/i })
    ).toBeInTheDocument();
  });

  it("renders a start button", () => {
    render(<Home />);
    expect(
      screen.getByRole("button", { name: /start|почати|начать|starten/i })
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Запустити — має впасти**

Run: `npm test -- tests/app/page.test.tsx`
Expected: FAIL (дефолтна сторінка не має такого heading/button).

- [ ] **Step 3: Замінити `app/page.tsx`**

```tsx
// Файл: app/page.tsx (повна заміна)
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-semibold sm:text-4xl">
        AI Automation Diagnostic
      </h1>
      <p className="max-w-md text-muted-foreground">
        Дізнайся за 5 хвилин, що у твоєму бізнесі можна автоматизувати.
      </p>
      <button
        type="button"
        className="rounded-lg bg-black px-6 py-3 text-white hover:opacity-90"
      >
        Почати
      </button>
    </main>
  );
}
```

- [ ] **Step 4: Запустити — має пройти**

Run: `npm test -- tests/app/page.test.tsx`
Expected: PASS (обидва тести).

- [ ] **Step 5: Перевірити повний прогін і білд**

```bash
npm test
npm run build
```
Expected: усі тести PASS; білд успішний.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx tests/app/page.test.tsx
git commit -m "feat: replace default page with branded landing placeholder"
git push origin main
```

---

## Task 6: Деплой на Vercel (готовність + інструкція)

Реальне підключення Vercel потребує входу користувача — це **human action**. Тут забезпечуємо production-готовність і документуємо кроки.

**Files:**
- Create: `docs/deployment.md`

- [ ] **Step 1: Підтвердити, що production-білд проходить**

Run: `npm run build`
Expected: `✓ Compiled successfully` без помилок.

- [ ] **Step 2: Створити `docs/deployment.md`**

```markdown
# Deployment (Vercel)

## Перший деплой (human action — потрібен вхід у Vercel)
1. Зайти на https://vercel.com, увійти через GitHub (акаунт ybodnar3-ui).
2. "Add New… → Project" → імпортувати репозиторій `ybodnar3-ui/michael-project`.
3. Framework Preset: Next.js (визначиться автоматично).
4. Environment Variables: поки нічого обов'язкового (Phase 0). Ключі додамо у фазах 1/4/5 зі `.env.example`.
5. Deploy.

## Подальші деплої
Кожен push у `main` тригерить автоматичний деплой Vercel.

## Перевірка
Після деплою відкрити `https://<project>.vercel.app/api/health` → має повернути `{"status":"ok"}`.
```

- [ ] **Step 3: Commit**

```bash
git add docs/deployment.md
git commit -m "docs: add Vercel deployment guide"
git push origin main
```

- [ ] **Step 4: HUMAN ACTION — підключити Vercel**

Користувач виконує кроки з `docs/deployment.md` (вхід у Vercel + імпорт репо). Після цього перевіряємо `/api/health` на проді.

---

## Definition of Done (Фаза 0)

- [ ] `npm run dev` піднімає застосунок локально, лендинг-плейсхолдер видно.
- [ ] `npm test` — усі тести зелені (smoke, health, page).
- [ ] `npm run build` — production-білд успішний.
- [ ] `/api/health` повертає `{"status":"ok"}`.
- [ ] Усі коміти запушено в `origin/main`.
- [ ] (Human) Vercel підключено, прод відповідає на `/api/health`.
