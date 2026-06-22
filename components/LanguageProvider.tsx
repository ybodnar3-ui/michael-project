"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Language } from "@/lib/types";
import { translate } from "@/lib/i18n";

interface I18nCtx {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

const SUPPORTED: Language[] = ["uk", "ru", "en", "de"];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("uk");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("lang") as Language | null;
    const nav = navigator.language.slice(0, 2) as Language;
    const next =
      stored && SUPPORTED.includes(stored)
        ? stored
        : SUPPORTED.includes(nav)
          ? nav
          : null;
    // Reading a client-only persisted preference on mount; intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (next) setLangState(next);
  }, []);

  function setLang(l: Language) {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  }

  const t = (key: string) => translate(lang, key);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
