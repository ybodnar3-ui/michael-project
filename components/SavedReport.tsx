"use client";

import Link from "next/link";
import type { Report } from "@/lib/types";
import { ReportView } from "./ReportView";
import { useI18n } from "./LanguageProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

function LogoMark() {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-gradient-to-br from-accent to-accent2 shadow-sm">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="white" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function SavedReport({ report }: { report: Report | null }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-sm font-extrabold tracking-tight">
              {t("brand")}
            </span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {report ? (
          <ReportView report={report} />
        ) : (
          <p className="mt-20 text-center text-sm text-muted">
            {t("saved.notFound")}
          </p>
        )}
      </main>
    </div>
  );
}
