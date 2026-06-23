import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/components/LanguageProvider";
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

function setup() {
  return render(
    <LanguageProvider>
      <ReportView report={report} />
    </LanguageProvider>
  );
}

describe("ReportView", () => {
  it("renders the business summary", () => {
    setup();
    expect(screen.getByText(/Стоматологія на 3 крісла/)).toBeInTheDocument();
  });

  it("renders each opportunity with its request to specialist", () => {
    setup();
    expect(screen.getByText(/Автозапис пацієнтів/)).toBeInTheDocument();
    expect(
      screen.getByText(/Хочу автоматизувати запис пацієнтів/)
    ).toBeInTheDocument();
  });

  it("renders a contact CTA linking to the owner when configured", () => {
    process.env.NEXT_PUBLIC_OWNER_TELEGRAM = "https://t.me/example";
    setup();
    const link = screen.getByRole("link", { name: /telegram/i });
    expect(link).toHaveAttribute("href", "https://t.me/example");
    delete process.env.NEXT_PUBLIC_OWNER_TELEGRAM;
  });

  it("renders no contact CTA when the owner link is unset", () => {
    delete process.env.NEXT_PUBLIC_OWNER_TELEGRAM;
    setup();
    expect(screen.queryByRole("link", { name: /telegram/i })).toBeNull();
  });
});
