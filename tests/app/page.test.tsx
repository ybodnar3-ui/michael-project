import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/components/LanguageProvider";
import Home from "@/app/page";

function setup() {
  return render(
    <LanguageProvider>
      <Home />
    </LanguageProvider>
  );
}

describe("Home (landing)", () => {
  it("renders a hero headline", () => {
    setup();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("links to the diagnostic chat", () => {
    setup();
    const links = screen.getAllByRole("link");
    expect(links.some((l) => l.getAttribute("href") === "/chat")).toBe(true);
  });
});
