import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { Reveal } from "@/components/Reveal";

beforeAll(() => {
  // jsdom has no IntersectionObserver
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    }
  );
});

describe("Reveal", () => {
  it("renders its children", () => {
    render(<Reveal>hello reveal</Reveal>);
    expect(screen.getByText("hello reveal")).toBeInTheDocument();
  });
});
