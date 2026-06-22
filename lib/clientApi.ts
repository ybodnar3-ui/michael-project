export async function postJson(
  url: string,
  body: unknown,
  timeoutMs = 75000
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const data = (await res.json().catch((e) => {
      // Non-JSON error body (gateway/HTML error page). Keep the UI alive but
      // log what was lost so field reports are debuggable.
      console.error("postJson.non_json_response", url, res.status, String(e));
      return {};
    })) as Record<string, unknown>;
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

export function statusErrorKey(status: number, apiError?: unknown): string {
  if (status === 429) return "chat.errorRate";
  if (status === 403) return "chat.errorBot";
  if (apiError === "llm_error") return "chat.errorKey";
  return "chat.errorServer";
}
