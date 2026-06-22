import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatPage from "@/app/chat/page";

describe("ChatPage (test UI)", () => {
  it("renders a message input and a send control", () => {
    render(<ChatPage />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send|надіслати|отправить|senden/i })
    ).toBeInTheDocument();
  });

  it("renders a language selector", () => {
    render(<ChatPage />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
