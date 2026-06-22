import { log } from "./log";

export async function verifyTurnstile(
  token: string | undefined,
  ip?: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Fail-OPEN: allows local/dev without keys, but also means bot protection
    // is fully bypassed in prod if this env var is ever dropped. Logged so the
    // misconfiguration is visible.
    log.warn("turnstile.disabled", { reason: "no_secret" });
    return true;
  }
  if (!token) return false;
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ secret, response: token, remoteip: ip }),
      }
    );
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (e) {
    // Fail-CLOSED on infra error, but log so a Cloudflare outage is
    // distinguishable from a genuine bot block at the route level.
    log.error("turnstile.verify_error", { error: String(e) });
    return false;
  }
}
