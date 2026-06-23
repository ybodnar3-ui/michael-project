const buckets = new Map<string, { count: number; reset: number }>();

// Bound memory: when the map grows large, drop entries whose window has
// already elapsed. (In-memory limiter is per-instance / best-effort — a
// distributed store is the real fix, tracked in the backlog.)
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, b] of buckets) {
    if (now > b.reset) buckets.delete(key);
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): { ok: boolean; remaining: number } {
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    sweep(now);
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (b.count >= limit) return { ok: false, remaining: 0 };
  b.count++;
  return { ok: true, remaining: limit - b.count };
}

export function clientIp(req: Request): string {
  // Prefer x-real-ip over the user-influenceable x-forwarded-for chain.
  // Assumes the hosting platform sets x-real-ip to the true client and strips
  // any client-supplied value (Vercel does); behind a proxy that doesn't, the
  // limit is best-effort only.
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}
