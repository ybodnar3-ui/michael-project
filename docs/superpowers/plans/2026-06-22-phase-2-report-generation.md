# Phase 2 — Report Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** З діалогу-інтерв'ю згенерувати **структурований аудит автоматизації** (JSON за схемою) обраною мовою, віддати через `POST /api/report`, і показати його в `/chat` після завершення інтерв'ю (базовий рендер; краса — Фаза 3).

**Architecture:** Окремий endpoint `POST /api/report` приймає `{language, messages}` (транскрипт), додає тригер-меседж користувача (щоб не було prefill на assistant), викликає Claude зі **structured output** (`output_config.format` = json_schema), повертає типізований `Report`. Звіт малює чистий компонент `ReportView`. Окремий промпт `buildReportPrompt` — інструкція генерації аудиту.

**Tech Stack:** Claude Sonnet 4.6 structured outputs (`output_config.format` json_schema), Next.js route handlers, Vitest (мок адаптера).

**Передумова:** Фаза 1 завершена (працює `/api/chat`, інтерв'ю завершується `<<READY>>`).

---

## Дані звіту

```ts
interface AutomationOpportunity {
  title: string;
  problem: string;
  solution: string;
  ai_capability: string;
  estimated_impact: string;
  request_to_specialist: string;
}
interface Report {
  business_summary: string;
  automation_opportunities: AutomationOpportunity[];
  priority_recommendation: string;
  next_step: string;
}
```

---

## File Structure (Фаза 2)

| Шлях | Відповідальність |
|---|---|
| `lib/types.ts` | + `AutomationOpportunity`, `Report` |
| `lib/reportSchema.ts` | JSON-schema для structured output |
| `lib/prompt.ts` | + `buildReportPrompt(language)` |
| `lib/claude.ts` | + `runReport(system, messages)` → `Report` |
| `app/api/report/route.ts` | POST: валідація → промпт → Claude(JSON) → `{report}` |
| `components/ReportView.tsx` | Чистий рендер звіту |
| `app/chat/page.tsx` | Кнопка «Згенерувати звіт» після `done` + показ `ReportView` |
| `tests/lib/report-prompt.test.ts` | Тест промпта звіту |
| `tests/api/report.test.ts` | Тест роута (мок `runReport`) |
| `tests/components/report-view.test.tsx` | Тест рендера звіту |

---

## Task 1: Типи + JSON-схема звіту

**Files:**
- Modify: `lib/types.ts`
- Create: `lib/reportSchema.ts`

- [ ] **Step 1: Додати типи в `lib/types.ts`** (в кінець файлу)

```typescript
export interface AutomationOpportunity {
  title: string;
  problem: string;
  solution: string;
  ai_capability: string;
  estimated_impact: string;
  request_to_specialist: string;
}

export interface Report {
  business_summary: string;
  automation_opportunities: AutomationOpportunity[];
  priority_recommendation: string;
  next_step: string;
}
```

- [ ] **Step 2: Створити `lib/reportSchema.ts`**

```typescript
// Файл: lib/reportSchema.ts
export const REPORT_SCHEMA = {
  type: "object",
  properties: {
    business_summary: { type: "string" },
    automation_opportunities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          problem: { type: "string" },
          solution: { type: "string" },
          ai_capability: { type: "string" },
          estimated_impact: { type: "string" },
          request_to_specialist: { type: "string" },
        },
        required: [
          "title",
          "problem",
          "solution",
          "ai_capability",
          "estimated_impact",
          "request_to_specialist",
        ],
        additionalProperties: false,
      },
    },
    priority_recommendation: { type: "string" },
    next_step: { type: "string" },
  },
  required: [
    "business_summary",
    "automation_opportunities",
    "priority_recommendation",
    "next_step",
  ],
  additionalProperties: false,
} as const;
```

- [ ] **Step 3: Перевірити компіляцію**

Run: `npx tsc --noEmit`
Expected: без помилок.

- [ ] **Step 4: Commit**

```bash
git add lib/types.ts lib/reportSchema.ts
git commit -m "feat: add Report types and JSON schema"
git push origin main
```

---

## Task 2: Промпт генерації звіту (TDD)

**Files:**
- Create: `tests/lib/report-prompt.test.ts`
- Modify: `lib/prompt.ts`

- [ ] **Step 1: Написати падаючий тест**

```typescript
// Файл: tests/lib/report-prompt.test.ts
import { describe, it, expect } from "vitest";
import { buildReportPrompt } from "@/lib/prompt";

describe("buildReportPrompt", () => {
  it("injects the language name", () => {
    expect(buildReportPrompt("de")).toContain("German");
    expect(buildReportPrompt("uk")).toContain("Ukrainian");
  });

  it("asks for concrete automation opportunities", () => {
    expect(buildReportPrompt("en").toLowerCase()).toContain("automation");
    expect(buildReportPrompt("en")).toContain("request_to_specialist");
  });
});
```

- [ ] **Step 2: Запустити — має впасти**

Run: `npm test -- tests/lib/report-prompt.test.ts`
Expected: FAIL (`buildReportPrompt` не існує).

- [ ] **Step 3: Додати `buildReportPrompt` у `lib/prompt.ts`** (в кінець файлу)

```typescript
export function buildReportPrompt(language: Language): string {
  const lang = LANGUAGE_NAMES[language];
  return `You are an AI automation diagnostician. You have just interviewed a business owner; the full transcript is the conversation so far. Produce a concise, concrete automation audit for THIS specific business.

LANGUAGE: All human-readable text in the output must be written ONLY in ${lang}.

Identify 3-6 concrete, realistic automation opportunities grounded in what the person actually told you. For each opportunity provide:
- title: short name of the automation.
- problem: the specific pain or inefficiency it removes, referencing their situation.
- solution: what exactly gets automated.
- ai_capability: which AI capability makes it work (e.g. conversational assistant, document extraction, lead scoring, voice agent).
- estimated_impact: a rough, honest effect on time or money - no fake precision.
- request_to_specialist: a ready-to-send request the owner can bring to an automation specialist, written in first person (e.g. "I want to automate ...").

Also provide:
- business_summary: 1-2 sentences capturing what the business is and its main bottleneck.
- priority_recommendation: which opportunity to start with and why.
- next_step: a short call-to-action inviting them to discuss implementation.

Be concrete and specific to this business. No generic filler. Output must conform exactly to the provided JSON schema.`;
}
```

- [ ] **Step 4: Запустити — має пройти**

Run: `npm test -- tests/lib/report-prompt.test.ts`
Expected: PASS (2 тести).

- [ ] **Step 5: Commit**

```bash
git add lib/prompt.ts tests/lib/report-prompt.test.ts
git commit -m "feat: add report generation prompt"
git push origin main
```

---

## Task 3: Адаптер `runReport` (`lib/claude.ts`)

Тонкий адаптер (мокається в тесті роута; реально перевіряється в Task 7).

**Files:**
- Modify: `lib/claude.ts`

- [ ] **Step 1: Додати `runReport` у `lib/claude.ts`**

Додати імпорти зверху (до існуючих):
```typescript
import type { ChatMessage, Report } from "./types";
import { REPORT_SCHEMA } from "./reportSchema";
```
(Якщо `ChatMessage` вже імпортований — просто додай `Report` у той самий import і додай рядок з `REPORT_SCHEMA`.)

Додати функцію в кінець файлу:
```typescript
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
```

- [ ] **Step 2: Перевірити компіляцію**

Run: `npx tsc --noEmit`
Expected: без помилок. Якщо тип `output_config` свариться — лишити cast `as unknown as Record<string, unknown>` на schema (вже є); за потреби обгорнути весь `output_config` у `// @ts-expect-error` лише як крайній випадок і зафіксувати в коміті.

- [ ] **Step 3: Commit**

```bash
git add lib/claude.ts
git commit -m "feat: add runReport adapter (structured JSON output)"
git push origin main
```

---

## Task 4: Endpoint `POST /api/report` (TDD з моком)

**Files:**
- Create: `tests/api/report.test.ts`
- Create: `app/api/report/route.ts`

- [ ] **Step 1: Написати падаючий тест**

```typescript
// Файл: tests/api/report.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/claude", () => ({ runReport: vi.fn() }));

import { runReport } from "@/lib/claude";
import { POST } from "@/app/api/report/route";
import type { Report } from "@/lib/types";

function req(body: unknown): Request {
  return new Request("http://localhost/api/report", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const transcript = {
  language: "uk",
  messages: [
    { role: "user", content: "Почати" },
    { role: "assistant", content: "Чим займається ваш бізнес?" },
    { role: "user", content: "Стоматологія" },
  ],
};

const sample: Report = {
  business_summary: "Стоматологія на 3 крісла.",
  automation_opportunities: [
    {
      title: "Автозапис",
      problem: "Пацієнти не додзвонюються.",
      solution: "AI-бот для запису.",
      ai_capability: "conversational assistant",
      estimated_impact: "менше пропущених дзвінків",
      request_to_specialist: "Хочу автоматизувати запис пацієнтів.",
    },
  ],
  priority_recommendation: "Почати з автозапису.",
  next_step: "Обговорити впровадження.",
};

describe("POST /api/report", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the generated report", async () => {
    (runReport as ReturnType<typeof vi.fn>).mockResolvedValue(sample);
    const res = await POST(req(transcript));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.report).toEqual(sample);
  });

  it("appends a final user trigger so the model is not prefilled on assistant", async () => {
    (runReport as ReturnType<typeof vi.fn>).mockResolvedValue(sample);
    await POST(req(transcript));
    const passedMessages = (runReport as ReturnType<typeof vi.fn>).mock
      .calls[0][1];
    expect(passedMessages[passedMessages.length - 1].role).toBe("user");
  });

  it("rejects invalid input with 400", async () => {
    const res = await POST(req({ language: "fr", messages: [] }));
    expect(res.status).toBe(400);
    expect(runReport).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Запустити — має впасти**

Run: `npm test -- tests/api/report.test.ts`
Expected: FAIL (`@/app/api/report/route` не існує).

- [ ] **Step 3: Реалізувати `app/api/report/route.ts`**

```typescript
// Файл: app/api/report/route.ts
import { NextResponse } from "next/server";
import { buildReportPrompt } from "@/lib/prompt";
import { validateChatInput } from "@/lib/limits";
import { runReport } from "@/lib/claude";
import type { ChatRequest, ChatMessage } from "@/lib/types";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const validation = validateChatInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { language, messages } = body as ChatRequest;
  const system = buildReportPrompt(language);

  // Append a user trigger so the last turn is a user message
  // (Sonnet 4.6 rejects assistant-turn prefills).
  const withTrigger: ChatMessage[] = [
    ...messages,
    { role: "user", content: "Generate the automation audit now." },
  ];

  try {
    const report = await runReport(system, withTrigger);
    return NextResponse.json({ report });
  } catch {
    return NextResponse.json({ error: "llm_error" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Запустити — має пройти**

Run: `npm test -- tests/api/report.test.ts`
Expected: PASS (3 тести).

- [ ] **Step 5: Commit**

```bash
git add app/api/report/route.ts tests/api/report.test.ts
git commit -m "feat: add POST /api/report endpoint"
git push origin main
```

---

## Task 5: Компонент `ReportView` (TDD)

**Files:**
- Create: `tests/components/report-view.test.tsx`
- Create: `components/ReportView.tsx`

- [ ] **Step 1: Написати падаючий тест**

```tsx
// Файл: tests/components/report-view.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReportView } from "@/components/ReportView";
import type { Report } from "@/lib/types";

const report: Report = {
  business_summary: "Стоматологія на 3 крісла.",
  automation_opportunities: [
    {
      title: "Автозапис пацієнтів",
      problem: "Пацієнти не додзвонюються.",
      solution: "AI-бот для запису.",
      ai_capability: "conversational assistant",
      estimated_impact: "менше пропущених дзвінків",
      request_to_specialist: "Хочу автоматизувати запис пацієнтів.",
    },
  ],
  priority_recommendation: "Почати з автозапису.",
  next_step: "Обговорити впровадження.",
};

describe("ReportView", () => {
  it("renders the business summary", () => {
    render(<ReportView report={report} />);
    expect(screen.getByText(/Стоматологія на 3 крісла/)).toBeInTheDocument();
  });

  it("renders each opportunity with its request to specialist", () => {
    render(<ReportView report={report} />);
    expect(screen.getByText(/Автозапис пацієнтів/)).toBeInTheDocument();
    expect(
      screen.getByText(/Хочу автоматизувати запис пацієнтів/)
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Запустити — має впасти**

Run: `npm test -- tests/components/report-view.test.tsx`
Expected: FAIL (`@/components/ReportView` не існує).

- [ ] **Step 3: Реалізувати `components/ReportView.tsx`**

```tsx
// Файл: components/ReportView.tsx
import type { Report } from "@/lib/types";

export function ReportView({ report }: { report: Report }) {
  return (
    <section className="space-y-5 rounded border border-gray-700 p-5">
      <p className="text-base font-medium">{report.business_summary}</p>

      <div className="space-y-4">
        {report.automation_opportunities.map((o, i) => (
          <div key={i} className="rounded border border-gray-700 p-4">
            <h3 className="font-semibold">
              {i + 1}. {o.title}
            </h3>
            <p className="mt-1 text-sm text-gray-300">
              <b>Проблема:</b> {o.problem}
            </p>
            <p className="text-sm text-gray-300">
              <b>Рішення:</b> {o.solution}
            </p>
            <p className="text-sm text-gray-400">
              <b>AI:</b> {o.ai_capability} · <b>Ефект:</b> {o.estimated_impact}
            </p>
            <p className="mt-2 rounded bg-gray-800 px-3 py-2 text-sm">
              <b>Запит до спеціаліста:</b> {o.request_to_specialist}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-1 text-sm">
        <p>
          <b>З чого почати:</b> {report.priority_recommendation}
        </p>
        <p className="text-green-400">{report.next_step}</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Запустити — має пройти**

Run: `npm test -- tests/components/report-view.test.tsx`
Expected: PASS (2 тести).

- [ ] **Step 5: Commit**

```bash
git add components/ReportView.tsx tests/components/report-view.test.tsx
git commit -m "feat: add ReportView component"
git push origin main
```

---

## Task 6: Підключити звіт у `/chat`

Після `done` показуємо кнопку «Згенерувати звіт»; по кліку — `POST /api/report`, рендеримо `ReportView`.

**Files:**
- Modify: `app/chat/page.tsx`

- [ ] **Step 1: Додати імпорти у верх `app/chat/page.tsx`**

До наявних імпортів додати:
```tsx
import type { Report } from "@/lib/types";
import { ReportView } from "@/components/ReportView";
```

- [ ] **Step 2: Додати стан звіту** (поряд з іншими `useState`)

```tsx
  const [report, setReport] = useState<Report | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
```

- [ ] **Step 3: Додати функцію генерації звіту** (всередині компонента, перед `return`)

```tsx
  async function generateReport() {
    setReportLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language, messages }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(`Помилка звіту ${res.status}: ${data?.error ?? "unknown"}`);
        return;
      }
      setReport(data.report ?? null);
    } catch {
      setError("Не вдалося згенерувати звіт.");
    } finally {
      setReportLoading(false);
    }
  }
```

- [ ] **Step 4: Скинути звіт при `start()`** — у функції `start()` додати рядок:

```tsx
    setReport(null);
```
(поряд із `setDone(false);`)

- [ ] **Step 5: Додати кнопку + рендер звіту** — одразу **після** закриваючого `</div>` блоку повідомлень і **перед** блоком вводу (`<div className="flex gap-2">`), вставити:

```tsx
      {done && !report && (
        <button
          type="button"
          onClick={generateReport}
          disabled={reportLoading}
          className="rounded bg-green-600 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {reportLoading ? "Готую звіт…" : "Згенерувати звіт"}
        </button>
      )}

      {report && <ReportView report={report} />}
```

- [ ] **Step 6: Повний прогін + білд**

```bash
npm test
npm run build
```
Expected: усі тести PASS; білд успішний (роут `/api/report` у виводі).

- [ ] **Step 7: Commit**

```bash
git add app/chat/page.tsx
git commit -m "feat: wire report generation into /chat test UI"
git push origin main
```

---

## Task 7: Ручна live-перевірка (потрібен dev-сервер із ключем)

- [ ] **Step 1:** Перезапустити dev (`npm run dev`), відкрити `http://localhost:3100/chat`.
- [ ] **Step 2:** Пройти інтерв'ю до кінця (`✓ Інтерв'ю завершено`).
- [ ] **Step 3:** Натиснути **«Згенерувати звіт»** → переконатися, що з'являється звіт:
  - 3-6 можливостей, кожна з проблемою/рішенням/ефектом,
  - готовий «запит до спеціаліста» першою особою,
  - усе обраною мовою, конкретно під цей бізнес.
- [ ] **Step 4:** Перевірити іншою мовою (напр. EN/DE) — звіт тією ж мовою.
- [ ] **Step 5:** За потреби підкрутити `buildReportPrompt` (якість/конкретність). Кожна правка — коміт `chore: tune report prompt`.

---

## Definition of Done (Фаза 2)

- [ ] `npm test` — усі тести зелені (report-prompt, report route, ReportView + попередні).
- [ ] `npm run build` — успішний; роут `/api/report` присутній.
- [ ] (Live) Після інтерв'ю кнопка генерує конкретний звіт обраною мовою з 3-6 можливостями і запитами до спеціаліста.
- [ ] Усі коміти в `origin/main`.
