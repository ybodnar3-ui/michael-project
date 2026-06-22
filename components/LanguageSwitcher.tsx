"use client";

import { useI18n } from "./LanguageProvider";
import { LANGS } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="inline-flex rounded-full border border-border bg-surface p-0.5">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={
            "rounded-full px-2.5 py-1 text-xs font-bold transition-colors " +
            (lang === code
              ? "bg-ink text-white"
              : "text-muted hover:text-ink")
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
