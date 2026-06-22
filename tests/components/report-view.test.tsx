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
