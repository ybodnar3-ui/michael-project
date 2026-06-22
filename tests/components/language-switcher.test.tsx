import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/components/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function setup() {
  return render(
    <LanguageProvider>
      <LanguageSwitcher />
    </LanguageProvider>
  );
}

describe("LanguageSwitcher", () => {
  it("renders all four language buttons", () => {
    setup();
    ["UK", "RU", "EN", "DE"].forEach((l) =>
      expect(screen.getByRole("button", { name: l })).toBeInTheDocument()
    );
  });

  it("activates a language on click", () => {
    setup();
    const de = screen.getByRole("button", { name: "DE" });
    fireEvent.click(de);
    expect(de).toHaveAttribute("aria-pressed", "true");
  });
});
