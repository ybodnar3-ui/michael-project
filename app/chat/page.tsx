"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ChatMessage, Channel, Report } from "@/lib/types";
import { ReportView } from "@/components/ReportView";
import { useI18n } from "@/components/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function LogoMark() {
  return (
    <span className="grid h-7 w-7 place-items-center rounded-[9px] bg-gradient-to-br from-accent to-accent2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="white" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Typing({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted"
            style={{ animation: "blink 1.2s infinite", animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </span>
      {label}…
    </div>
  );
}

export default function ChatPage() {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [leadLoading, setLeadLoading] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [channel, setChannel] = useState<Channel>("telegram");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const started = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, report]);

  async function send(history: ChatMessage[]) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language: lang, messages: history }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error === "llm_error" ? t("chat.errorKey") : t("chat.errorServer"));
        return;
      }
      if (data.reply) {
        setMessages([...history, { role: "assistant", content: data.reply }]);
      }
      setDone(Boolean(data.done));
    } catch {
      setError(t("chat.errorServer"));
    } finally {
      setLoading(false);
    }
  }

  function start() {
    const history: ChatMessage[] = [{ role: "user", content: t("chat.start") }];
    setMessages(history);
    setDone(false);
    setReport(null);
    void send(history);
  }

  function submit() {
    if (!input.trim() || loading || done) return;
    const history: ChatMessage[] = [...messages, { role: "user", content: input.trim() }];
    setMessages(history);
    setInput("");
    void send(history);
  }

  async function submitLead() {
    if (!name.trim()) {
      setFieldError(t("lead.errorName"));
      return;
    }
    if (!contact.trim()) {
      setFieldError(t("lead.errorContact"));
      return;
    }
    setFieldError(null);
    setLeadLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, contact, channel, language: lang, messages }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(t("chat.errorReport"));
        return;
      }
      setReport(data.report ?? null);
    } catch {
      setError(t("chat.errorReport"));
    } finally {
      setLeadLoading(false);
    }
  }

  // hide the synthetic kickoff message (first user turn)
  const visible = messages.filter((m, i) => !(i === 0 && m.role === "user"));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-sm font-extrabold tracking-tight">{t("brand")}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6">
          {!started ? (
            <div className="animate-in mx-auto mt-10 max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="white" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-muted">{t("chat.intro")}</p>
              <button
                type="button"
                onClick={start}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-95"
              >
                {t("chat.start")}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {visible.map((m, i) =>
                m.role === "assistant" ? (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 shrink-0">
                      <LogoMark />
                    </span>
                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-2.5 text-sm leading-relaxed shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-accent px-4 py-2.5 text-sm leading-relaxed text-white">
                      {m.content}
                    </div>
                  </div>
                )
              )}

              {loading && (
                <div className="flex items-center gap-2.5">
                  <LogoMark />
                  <div className="rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-3">
                    <Typing label={t("chat.typing")} />
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                  {error}
                </div>
              )}

              {done && !report && (
                <div className="animate-in rounded-3xl border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-success">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t("chat.done")}
                  </div>

                  <h3 className="text-base font-extrabold tracking-tight">
                    {t("lead.title")}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{t("lead.subtitle")}</p>

                  <div className="mt-4 space-y-3">
                    <input
                      aria-label="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("lead.name")}
                      className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                    />
                    <div className="flex gap-2">
                      <input
                        aria-label="contact"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder={t("lead.contact")}
                        className="flex-1 rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                      />
                      <select
                        aria-label="channel"
                        value={channel}
                        onChange={(e) => setChannel(e.target.value as Channel)}
                        className="rounded-xl border border-border bg-bg px-2.5 py-2.5 text-sm outline-none focus:border-accent"
                      >
                        <option value="telegram">{t("lead.channel.telegram")}</option>
                        <option value="phone">{t("lead.channel.phone")}</option>
                        <option value="email">{t("lead.channel.email")}</option>
                      </select>
                    </div>

                    {fieldError && (
                      <p className="text-sm text-red-600">{fieldError}</p>
                    )}

                    <button
                      type="button"
                      onClick={submitLead}
                      disabled={leadLoading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent2 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.25)] transition hover:-translate-y-0.5 disabled:opacity-60"
                    >
                      {leadLoading ? t("lead.submitting") : t("lead.submit")}
                    </button>
                  </div>
                </div>
              )}

              {report && <ReportView report={report} />}

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* input bar */}
      <div className="sticky bottom-0 border-t border-border/70 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3">
          <input
            aria-label="message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            disabled={loading || !started || done}
            className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-50"
            placeholder={started ? t("chat.placeholder") : t("chat.placeholderStart")}
          />
          <button
            type="button"
            onClick={submit}
            disabled={loading || !started || done || !input.trim()}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {t("chat.send")}
          </button>
        </div>
      </div>
    </div>
  );
}
