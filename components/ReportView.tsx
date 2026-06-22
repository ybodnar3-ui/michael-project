"use client";

import { useState } from "react";
import type { AutomationOpportunity, Report } from "@/lib/types";
import { useI18n } from "@/components/LanguageProvider";

function OpportunityCard({
  o,
  index,
}: {
  o: AutomationOpportunity;
  index: number;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(o.request_to_specialist);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accentsoft text-sm font-extrabold text-accent">
          {index + 1}
        </span>
        <h3 className="text-base font-bold leading-snug">{o.title}</h3>
      </div>

      <div className="mt-4 space-y-2.5 text-sm leading-relaxed">
        <p>
          <span className="font-semibold text-ink">{t("report.problem")}:</span>{" "}
          <span className="text-muted">{o.problem}</span>
        </p>
        <p>
          <span className="font-semibold text-ink">{t("report.solution")}:</span>{" "}
          <span className="text-muted">{o.solution}</span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-bg px-2.5 py-1 text-xs font-medium text-muted ring-1 ring-border">
          {t("report.ai")}: {o.ai_capability}
        </span>
        <span className="rounded-full bg-bg px-2.5 py-1 text-xs font-medium text-success ring-1 ring-border">
          {t("report.impact")}: {o.estimated_impact}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-accentsoft/70 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wide text-accent">
            {t("report.request")}
          </span>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-accent ring-1 ring-border transition hover:bg-accent hover:text-white"
          >
            {copied ? t("report.copied") : t("report.copy")}
          </button>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-ink">
          {o.request_to_specialist}
        </p>
      </div>
    </div>
  );
}

export function ReportView({ report }: { report: Report }) {
  const { t } = useI18n();
  return (
    <section className="animate-in space-y-5">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-lg font-extrabold tracking-tight">
          {t("report.title")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {report.business_summary}
        </p>
      </div>

      <div className="space-y-4">
        {report.automation_opportunities.map((o, i) => (
          <OpportunityCard key={i} o={o} index={i} />
        ))}
      </div>

      <div className="rounded-2xl border border-accent/20 bg-accentsoft/60 p-5">
        <span className="text-xs font-bold uppercase tracking-wide text-accent">
          {t("report.priority")}
        </span>
        <p className="mt-1.5 text-sm leading-relaxed text-ink">
          {report.priority_recommendation}
        </p>
      </div>

      <p className="rounded-2xl bg-ink px-5 py-4 text-center text-sm font-semibold text-white">
        {report.next_step}
      </p>
    </section>
  );
}
