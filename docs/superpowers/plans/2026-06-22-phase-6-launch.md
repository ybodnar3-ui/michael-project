# Phase 6 — Polish & Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Довести до продакшн-готовності (плавніші анімації, метадані/favicon, чистий lint, фінальний QA) і вивести живим на Vercel.

**Architecture:** Заміна потенційно «смикучих» scroll-driven CSS-анімацій на надійний IntersectionObserver-компонент `Reveal` (плавні transition). Метадані + `app/icon.svg` (Next App Router авто-favicon) + OpenGraph. Деплой — human action на Vercel (env-ключі з `.env.local`).

**Tech Stack:** Next.js App Router metadata API, IntersectionObserver, ESLint, Vercel.

**Передумова:** Фази 0–5 завершені.

---

## File Structure (Фаза 6)

| Шлях | Відповідальність |
|---|---|
| `components/Reveal.tsx` | Плавний reveal на скролі (IntersectionObserver) |
| `app/page.tsx` | Використати `Reveal` замість CSS `.reveal` |
| `app/globals.css` | Прибрати/нейтралізувати scroll-timeline `.reveal`; згладити easing |
| `app/icon.svg` | Favicon (логотип) |
| `app/layout.tsx` | Розширені метадані + OpenGraph |
| `tests/components/reveal.test.tsx` | Reveal рендерить дітей |

---

## Task 1: Reveal-компонент (плавні анімації) — TDD

**Files:** Create `components/Reveal.tsx`, `tests/components/reveal.test.tsx`

- [ ] **Step 1:** Тест: `<Reveal>дитина</Reveal>` рендерить вміст (`getByText`).
- [ ] **Step 2:** fail.
- [ ] **Step 3:** Реалізувати `components/Reveal.tsx`:
```tsx
"use client";
import { useEffect, useRef, useState } from "react";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition:
          "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
        transitionDelay: `${delay}ms`,
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(22px)",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
```
- [ ] **Step 4:** pass → **Step 5:** Commit `feat: add IntersectionObserver Reveal component`.

---

## Task 2: Застосувати Reveal на лендингу

**Files:** Modify `app/page.tsx`, `app/globals.css`

- [ ] **Step 1:** У `app/page.tsx`: імпортувати `Reveal`; прибрати клас `reveal` зі `StepCard`/`BenefitCard`/заголовків; обгорнути заголовки секцій і кожну картку в `<Reveal delay={...}>` (стаггер 80–120ms). CTA-блок теж у `Reveal`.
- [ ] **Step 2:** У `app/globals.css`: прибрати scroll-timeline блок `.reveal` (більше не потрібен).
- [ ] **Step 3:** `npm test` + `npm run build` — зелено.
- [ ] **Step 4:** Commit `feat: smoother scroll reveals on landing`.

---

## Task 3: Favicon + метадані

**Files:** Create `app/icon.svg`; Modify `app/layout.tsx`

- [ ] **Step 1:** `app/icon.svg` — квадрат із градієнтом accent→accent2 + білий «spark» (як LogoMark).
- [ ] **Step 2:** Розширити `metadata` у `layout.tsx`: `title` (template + default), `description`, `metadataBase`, `openGraph` (title/description/type), `applicationName`.
- [ ] **Step 3:** `npm run build` — favicon і метадані без помилок.
- [ ] **Step 4:** Commit `feat: add favicon and rich metadata`.

---

## Task 4: Фінальний QA

**Files:** —

- [ ] **Step 1:** `npm run lint` — без помилок (виправити, якщо є).
- [ ] **Step 2:** `npm test` — усі зелені.
- [ ] **Step 3:** `npm run build` — успішний.
- [ ] **Step 4:** Підняти dev, перевірити, що `/` і `/chat` віддаються (200) усіма мовами (перемикач).
- [ ] **Step 5:** Commit (якщо були правки) `chore: final QA fixes`.

---

## Task 5: Деплой на Vercel (human action — провід разом)

- [ ] **Step 1:** vercel.com → увійти через GitHub (`ybodnar3-ui`) → Add New Project → імпорт `michael-project`.
- [ ] **Step 2:** Environment Variables (з `.env.local`): `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (+ опційно Turnstile/email).
- [ ] **Step 3:** Deploy.
- [ ] **Step 4:** Перевірити прод: `/api/health` → `{"status":"ok"}`; пройти флоу → лід прилітає в Telegram.
- [ ] **Step 5:** (Опційно) підключити власний домен.
- [ ] **Step 6:** Виставити бюджетний cap у console.anthropic.com (якщо ще ні).

---

## Definition of Done (Фаза 6)

- [ ] Анімації плавні (IntersectionObserver).
- [ ] Favicon + метадані/OpenGraph на місці.
- [ ] `npm run lint`, `npm test`, `npm run build` — усе чисто.
- [ ] (Live) Сайт на Vercel, флоу працює, лід прилітає в Telegram.
- [ ] Усі коміти в `origin/main`.
