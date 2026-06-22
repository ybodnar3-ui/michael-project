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
