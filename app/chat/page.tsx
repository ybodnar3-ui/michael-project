"use client";

import { useState } from "react";
import type { ChatMessage, Language } from "@/lib/types";

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

  async function send(history: ChatMessage[]) {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language, messages: history }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages([...history, { role: "assistant", content: data.reply }]);
      }
      setDone(Boolean(data.done));
    } finally {
      setLoading(false);
    }
  }

  function start() {
    const history: ChatMessage[] = [
      { role: "user", content: KICKOFF[language] },
    ];
    setMessages(history);
    setDone(false);
    void send(history);
  }

  function submit() {
    if (!input.trim()) return;
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
      <div className="flex items-center gap-3">
        <select
          aria-label="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="rounded border px-2 py-1"
        >
          <option value="uk">UK</option>
          <option value="ru">RU</option>
          <option value="en">EN</option>
          <option value="de">DE</option>
        </select>
        <button
          type="button"
          onClick={start}
          className="rounded bg-black px-3 py-1 text-white"
        >
          Start
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded border p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "text-right" : "text-left"}
          >
            <span className="inline-block rounded-lg bg-gray-100 px-3 py-2">
              {m.content}
            </span>
          </div>
        ))}
        {loading && <div className="text-gray-400">…</div>}
        {done && <div className="text-green-600">[READY for report]</div>}
      </div>

      <div className="flex gap-2">
        <input
          aria-label="message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="flex-1 rounded border px-3 py-2"
          placeholder="..."
        />
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </main>
  );
}
