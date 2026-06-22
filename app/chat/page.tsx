"use client";

import { useState } from "react";
import type { ChatMessage, Language, Report } from "@/lib/types";
import { ReportView } from "@/components/ReportView";

const KICKOFF: Record<Language, string> = {
  uk: "Почати",
  ru: "Начать",
  en: "Start",
  de: "Starten",
};

export default function ChatPage() {
  const [language, setLanguage] = useState<Language>("uk");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

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

  async function send(history: ChatMessage[]) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language, messages: history }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data?.error === "llm_error"
            ? "Помилка виклику AI. Найімовірніше не заданий ANTHROPIC_API_KEY у .env.local (і перезапусти dev-сервер)."
            : `Помилка ${res.status}: ${data?.error ?? "unknown"}`
        );
        return;
      }
      if (data.reply) {
        setMessages([...history, { role: "assistant", content: data.reply }]);
      }
      setDone(Boolean(data.done));
    } catch {
      setError("Не вдалося звʼязатися із сервером.");
    } finally {
      setLoading(false);
    }
  }

  function start() {
    const history: ChatMessage[] = [{ role: "user", content: KICKOFF[language] }];
    setMessages(history);
    setDone(false);
    setReport(null);
    void send(history);
  }

  function submit() {
    if (!input.trim() || loading) return;
    const history: ChatMessage[] = [
      ...messages,
      { role: "user", content: input.trim() },
    ];
    setMessages(history);
    setInput("");
    void send(history);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Діагностика — тестовий екран</h1>
        <p className="text-sm text-gray-400">
          Обери мову → натисни <b>Start</b>. AI почне інтервʼю про твій бізнес.
          Це чорновий екран для перевірки (дизайн — пізніше). Потрібен{" "}
          <code>ANTHROPIC_API_KEY</code>.
        </p>
      </header>

      <div className="flex items-center gap-3">
        <select
          aria-label="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="rounded border border-gray-600 bg-transparent px-2 py-1"
        >
          <option value="uk">UK</option>
          <option value="ru">RU</option>
          <option value="en">EN</option>
          <option value="de">DE</option>
        </select>
        <button
          type="button"
          onClick={start}
          disabled={loading}
          className="rounded bg-white px-4 py-1 font-medium text-black disabled:opacity-50"
        >
          Start
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex min-h-[300px] flex-1 flex-col gap-3 overflow-y-auto rounded border border-gray-700 p-4">
        {messages.length === 0 && !loading && (
          <p className="m-auto text-sm text-gray-500">
            Натисни <b>Start</b>, щоб почати діалог.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={
                "inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm " +
                (m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-100")
              }
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && <div className="text-gray-400">AI друкує…</div>}
        {done && (
          <div className="text-sm font-medium text-green-400">
            ✓ Інтервʼю завершено — готово до звіту (Фаза 2)
          </div>
        )}
      </div>

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

      <div className="flex gap-2">
        <input
          aria-label="message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          disabled={loading || messages.length === 0}
          className="flex-1 rounded border border-gray-600 bg-transparent px-3 py-2 disabled:opacity-50"
          placeholder={
            messages.length === 0 ? "Спершу натисни Start…" : "Твоя відповідь…"
          }
        />
        <button
          type="button"
          onClick={submit}
          disabled={loading || messages.length === 0}
          className="rounded bg-white px-4 py-2 font-medium text-black disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </main>
  );
}
