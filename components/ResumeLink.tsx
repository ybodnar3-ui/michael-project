"use client";

import { useState } from "react";
import { useI18n } from "./LanguageProvider";

export function ResumeLink({ id }: { id: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/s/${id}`
      : `/s/${id}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-2xl border border-accent/20 bg-accentsoft/40 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-accent">
        {t("report.savedLink")}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <input
          readOnly
          value={url}
          aria-label="report link"
          className="min-w-0 flex-1 truncate rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
        >
          {copied ? t("report.linkCopied") : t("report.copyLink")}
        </button>
      </div>
    </div>
  );
}
