# Phase 3 — Product Design & i18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перетворити чорнові екрани на справжній продукт: брендований лендинг, полірований чат-досвід і красивий звіт — у світлому, чистому, діловому стилі, з повноцінним i18n (UK/RU/EN/DE).

**Architecture:** Дизайн-токени + шрифт Manrope у `globals.css` (Tailwind v4, CSS-first). Легкий клієнтський i18n: словники + `LanguageProvider` (контекст, localStorage) + `useI18n()` + перемикач. Лендинг, чат і звіт використовують `t()` та токени. Логіка з Фаз 1-2 (`/api/chat`, `/api/report`, `ReportView`) зберігається, змінюється лише вигляд + локалізація.

**Tech Stack:** Next.js App Router, Tailwind v4, Manrope (Google Fonts), React Context i18n, Vitest.

---

## Дизайн-система (зафіксовано)

**Палітра (світла, ділова, довіра):**
```
--bg:        #FBFBFD   (м'який білий фон)
--surface:   #FFFFFF   (картки)
--ink:       #0B1220   (основний текст, near-black slate)
--muted:     #5B6472   (вторинний текст)
--border:    #E7E9EF   (хайрлайн-бордери)
--accent:    #2563EB   (впевнений синій — довіра, tech)
--accent-2:  #4338CA   (індиго для градієнтів)
--accent-soft: #EEF2FF (м'який фон акценту)
--success:   #059669   (зелений — «готово»/успіх)
```
**Шрифт:** Manrope (300/400/500/600/700/800) — кирилиця + латиниця + німецька.
**Радіуси:** картки 16px, кнопки 12px (primary — pill 9999px). **Тіні:** м'які, фізичні.
**Сигнатура (стримана, преміальна):** fade-up при завантаженні (стаггер), scroll-reveal секцій, делікатний синій ауро-градієнт за героєм, hairline-бордери, багато повітря, кастомний скролбар, smooth-scroll, `-webkit-font-smoothing: antialiased`.

---

## File Structure (Фаза 3)

| Шлях | Відповідальність |
|---|---|
| `app/globals.css` | Дизайн-токени, Manrope, база, анімації, скролбар |
| `lib/i18n.ts` | Тип `Lang`, словники UK/RU/EN/DE, `translate(lang, key)` |
| `components/LanguageProvider.tsx` | Контекст мови + `useI18n()` (localStorage, дефолт із браузера) |
| `components/LanguageSwitcher.tsx` | Перемикач 4 мов |
| `app/layout.tsx` | Обгортка в `LanguageProvider`, метадані, шрифт |
| `app/page.tsx` | Полірований лендинг (hero / як працює / що отримаєш / CTA / футер) |
| `app/chat/page.tsx` | Полірований чат + інтеграція i18n + гарний звіт |
| `components/ReportView.tsx` | Полірований аудит (картки можливостей, акценти) |
| `tests/lib/i18n.test.ts` | Тест словників/фолбеку |
| `tests/components/language-switcher.test.tsx` | Тест перемикача |
| (оновити) `tests/app/page.test.tsx`, `tests/components/report-view.test.tsx` | Під нову розмітку |

---

## Task 1: Дизайн-система — токени + Manrope у `globals.css`

**Files:** Modify `app/globals.css`

- [ ] **Step 1:** Замінити `app/globals.css` на дизайн-систему: імпорт Manrope, `@theme`/CSS-змінні з палітрою вище, базові стилі (`body` фон/текст/шрифт, antialiasing), `@keyframes fadeUp`, утиліти `.animate-in`/`.delay-*`, scroll-reveal, кастомний скролбар, `scroll-behavior: smooth`. (Повний CSS — у кроці виконання.)
- [ ] **Step 2:** `npm run build` — успішно.
- [ ] **Step 3:** Commit `feat: add light professional design system (tokens, Manrope)`.

---

## Task 2: i18n — словники + `translate` (TDD)

**Files:** Create `lib/i18n.ts`, `tests/lib/i18n.test.ts`

- [ ] **Step 1:** Тест: `translate("uk","hero.title")` повертає укр. рядок; невідомий ключ → сам ключ; відсутній переклад → фолбек на `en`.
- [ ] **Step 2:** Запустити — fail.
- [ ] **Step 3:** Реалізувати `lib/i18n.ts`: `export type Lang = "uk"|"ru"|"en"|"de"`; `messages: Record<Lang, Record<string,string>>` з усіма ключами лендингу/чату/звіту 4 мовами; `translate(lang, key)` з фолбеком на `en`, потім на сам ключ.
- [ ] **Step 4:** Запустити — pass. **Step 5:** Commit.

---

## Task 3: LanguageProvider + useI18n (контекст)

**Files:** Create `components/LanguageProvider.tsx`

- [ ] **Step 1:** Реалізувати контекст: стан `lang` (дефолт: `localStorage` → мова браузера → `uk`), `setLang` (пише в localStorage), `t(key)` = `translate(lang, key)`. Хук `useI18n()`.
- [ ] **Step 2:** `npx tsc --noEmit` — ок. **Step 3:** Commit.

---

## Task 4: LanguageSwitcher (TDD)

**Files:** Create `components/LanguageSwitcher.tsx`, `tests/components/language-switcher.test.tsx`

- [ ] **Step 1:** Тест: рендериться 4 опції (UK/RU/EN/DE) у провайдері; клік міняє активну.
- [ ] **Step 2:** fail → **Step 3:** реалізувати сегментований перемикач (use `useI18n`). **Step 4:** pass. **Step 5:** Commit.

---

## Task 5: layout.tsx — провайдер + метадані

**Files:** Modify `app/layout.tsx`

- [ ] **Step 1:** Обгорнути `children` у `<LanguageProvider>`; оновити `<title>`/опис; lang атрибут. (Provider — клієнтський; layout лишається серверним, provider як клієнт-компонент усередині.)
- [ ] **Step 2:** build — ок. **Step 3:** Commit.

---

## Task 6: Полірований лендинг

**Files:** Modify `app/page.tsx`; update `tests/app/page.test.tsx`

- [ ] **Step 1:** Оновити тест лендингу під нову структуру (перевіряти ключовий headline через i18n-провайдер + наявність CTA-лінка на `/chat`).
- [ ] **Step 2:** Побудувати лендинг (клієнт-компонент, `useI18n`): sticky-хедер (лого «AI Automation Diagnostic» + LanguageSwitcher + CTA), hero (делікатний ауро-фон, headline з акцентним словом, субхед, кнопка «Почати діагностику» → `/chat`, рядок довіри), секція «Як це працює» (3 кроки), «Що ти отримаєш» (3-4 переваги-картки), CTA-секція, футер. Анімації fade-up/scroll-reveal. Усе через `t()`.
- [ ] **Step 3:** Тести + build — зелено. **Step 4:** Commit.

---

## Task 7: Полірований чат + звіт

**Files:** Modify `app/chat/page.tsx`; modify `components/ReportView.tsx`; update `tests/components/report-view.test.tsx`

- [ ] **Step 1:** Перебудувати `/chat`: брати мову з `useI18n` (з лендингу), прибрати «тестові» написи, зробити чистий чат — картка-контейнер, бабли (AI ліворуч / користувач праворуч), аватар/типінг-індикатор «AI друкує…» з анімацією крапок, кнопка генерації звіту акцентна. Усі підписи через `t()`. Помилки лишити інформативними.
- [ ] **Step 2:** Полірувати `ReportView`: заголовок-резюме, нумеровані картки можливостей з іконкою, виділений блок «запит до спеціаліста», callout «з чого почати», CTA. Зберегти ключі даних. Оновити тест під нову розмітку (ті самі тексти присутні).
- [ ] **Step 3:** Повний `npm test` + `npm run build` — зелено. **Step 4:** Commit.

---

## Task 8: Жива перевірка + поліровка

- [ ] **Step 1:** `npm run dev`, відкрити `localhost:3100` (лендинг) і `/chat`.
- [ ] **Step 2:** Перевірити 4 мови (перемикач), адаптивність desktop→mobile, анімації, повний флоу до звіту.
- [ ] **Step 3:** Дрібні візуальні правки за фідбеком — окремі коміти `style: ...`.

---

## Definition of Done (Фаза 3)

- [ ] Лендинг виглядає як справжній преміальний продукт (світлий, чистий, діловий), не «AI-шаблон».
- [ ] Чат і звіт поліровані й зрозумілі.
- [ ] i18n працює: перемикач міняє всі тексти UK/RU/EN/DE; обрана мова йде і в діалог, і у звіт.
- [ ] `npm test` зелений, `npm run build` успішний.
- [ ] Адаптивно (desktop + mobile). Усі коміти в `origin/main`.
