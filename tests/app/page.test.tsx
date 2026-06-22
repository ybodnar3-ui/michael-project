import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home (landing placeholder)", () => {
  it("renders the product heading", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /automation/i })
    ).toBeInTheDocument();
  });

  it("renders a start button", () => {
    render(<Home />);
    expect(
      screen.getByRole("button", { name: /start|почати|начать|starten/i })
    ).toBeInTheDocument();
  });
});
