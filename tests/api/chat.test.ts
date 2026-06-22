import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/claude", () => ({ runChat: vi.fn() }));

import { runChat } from "@/lib/claude";
import { POST } from "@/app/api/chat/route";

function req(body: unknown): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const valid = {
  language: "uk",
  messages: [{ role: "user", content: "Почати" }],
};

describe("POST /api/chat", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the assistant reply with done=false", async () => {
    (runChat as ReturnType<typeof vi.fn>).mockResolvedValue(
      "Вітаю! Яка у вас сфера бізнесу?"
    );
    const res = await POST(req(valid));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.reply).toContain("сфера");
    expect(body.done).toBe(false);
  });

  it("sets done=true and strips the readiness token", async () => {
    (runChat as ReturnType<typeof vi.fn>).mockResolvedValue(
      "Дякую, все маю. Готую звіт.\n<<READY>>"
    );
    const res = await POST(req(valid));
    const body = await res.json();
    expect(body.done).toBe(true);
    expect(body.reply).not.toContain("<<READY>>");
  });

  it("rejects invalid input with 400 and does not call the model", async () => {
    const res = await POST(req({ language: "fr", messages: [] }));
    expect(res.status).toBe(400);
    expect(runChat).not.toHaveBeenCalled();
  });
});
