import "server-only";

/**
 * Sliding-window rate limiter kept in server memory.
 *
 * Limits apply per server instance: on serverless or multi-instance hosting
 * each instance counts separately and restarts reset the counts. Pair this
 * with your host's rate limiting, or back it with a shared store (such as
 * Redis) when the demo starts handling real orders.
 */

export interface RateLimitResult {
  limited: boolean;
  /** Seconds until the next request is allowed (0 when not limited). */
  retryAfter: number;
}

interface Limiter {
  check(key: string): RateLimitResult;
}

/** Caps memory: the oldest keys are dropped when this many are tracked. */
const MAX_KEYS = 10_000;

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }): Limiter {
  const hits = new Map<string, number[]>();

  function prune(now: number) {
    for (const [key, times] of hits) {
      if (times[times.length - 1] <= now - windowMs) hits.delete(key);
    }
  }

  return {
    check(key) {
      const now = Date.now();
      const recent = (hits.get(key) ?? []).filter((t) => t > now - windowMs);

      if (recent.length >= limit) {
        hits.set(key, recent);
        return { limited: true, retryAfter: Math.ceil((recent[0] + windowMs - now) / 1000) };
      }

      recent.push(now);
      // Re-insert so Map order tracks recent activity, oldest first.
      hits.delete(key);
      hits.set(key, recent);

      if (hits.size > MAX_KEYS) {
        prune(now);
        for (const oldest of hits.keys()) {
          if (hits.size <= MAX_KEYS) break;
          hits.delete(oldest);
        }
      }
      return { limited: false, retryAfter: 0 };
    },
  };
}

/**
 * Best-effort client IP. Uses the last x-forwarded-for entry, which is the one
 * added by the proxy closest to this server (Vercel, nginx), so a client can't
 * choose it by sending its own header. Without a proxy in front, these headers
 * come straight from the client and can be spoofed.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const last = forwarded?.split(",").map((s) => s.trim()).filter(Boolean).pop();
  return last || headers.get("x-real-ip")?.trim() || "unknown";
}
