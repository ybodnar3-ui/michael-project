// Outbound fetch with a hard timeout so a hung upstream (Telegram, Cloudflare,
// Resend) cannot hold a request open indefinitely on an always-on server.
// A timeout aborts the fetch, which rejects with an AbortError — callers
// already catch and log fetch failures.
export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 10000
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}
