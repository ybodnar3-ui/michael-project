import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/components/LanguageProvider";
import ChatPage from "@/app/chat/page";

function setup() {
  return render(
    <LanguageProvider>
      <ChatPage />
    </LanguageProvider>
  );
}

describe("ChatPage", () => {
  it("renders a message input", () => {
    setup();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders a send control", () => {
    setup();
    expect(
      screen.getByRole("button", { name: /send|надіслати|отправить|senden/i })
    ).toBeInTheDocument();
  });

  it("renders the language switcher", () => {
    setup();
    expect(screen.getByRole("button", { name: "DE" })).toBeInTheDocument();
  });
});
