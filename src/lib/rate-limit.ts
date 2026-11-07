import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  limited: boolean;
  /** Seconds until the next request is allowed (0 when not limited). */
  retryAfter: number;
}

/* ---------- In-memory limiter (fallback) ---------- */

/** Caps memory: the oldest keys are dropped when this many are tracked. */
const MAX_KEYS = 10_000;

/**
 * Sliding-window limiter kept in this server instance's memory. Counts are not
 * shared between instances and reset on restart, so it is only used when Upstash
 * isn't configured or can't be reached.
 */
export function createMemoryRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();

  function prune(now: number) {
    for (const [key, times] of hits) {
      if (times[times.length - 1] <= now - windowMs) hits.delete(key);
    }
  }

  return {
    check(key: string): RateLimitResult {
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

/* ---------- Shared limiters: Upstash Redis, with in-memory fallback ---------- */

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

let warnedMissingConfig = false;
let lastErrorLog = 0;
let suppressedErrors = 0;

/** Logs Upstash failures at most once a minute so an outage doesn't flood the logs. */
function logUpstashError(error: unknown) {
  const now = Date.now();
  if (now - lastErrorLog < 60_000) {
    suppressedErrors++;
    return;
  }
  const extra = suppressedErrors ? ` (${suppressedErrors} similar errors in the last minute)` : "";
  console.error(`[rate-limit] Upstash request failed; using the in-memory limiters${extra}.`, error);
  lastErrorLog = now;
  suppressedErrors = 0;
}

type Minutes = number;

/**
 * Creates a named limit of `limit` requests per `minutes` per key (client IP).
 * Counts are shared across all server instances when UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN are set. Without them, or if Upstash times out or
 * errors, it falls back to a per-instance limiter so some limit always applies.
 *
 * Call at module scope (not per request) so Upstash's ephemeral cache can skip
 * Redis calls for clients that are already blocked while the instance is warm.
 */
function createSharedRateLimiter({ name, limit, minutes }: { name: string; limit: number; minutes: Minutes }) {
  const memory = createMemoryRateLimiter({ limit, windowMs: minutes * 60 * 1000 });
  const upstash = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${minutes} m`),
        prefix: `stockroom:${name}`,
        // Give up on Redis after 2s; we then fall back to the in-memory limiter.
        timeout: 2000,
        analytics: false,
      })
    : null;

  return async function check(key: string): Promise<RateLimitResult> {
    if (!upstash) {
      if (process.env.NODE_ENV === "production" && !warnedMissingConfig) {
        warnedMissingConfig = true;
        console.warn("[rate-limit] Upstash is not configured; using per-instance in-memory limiters.");
      }
      return memory.check(key);
    }
    try {
      const { success, reset, reason } = await upstash.limit(key);
      // On timeout Upstash lets the request through; apply the local limit instead.
      if (reason === "timeout") return memory.check(key);
      return {
        limited: !success,
        retryAfter: success ? 0 : Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
      };
    } catch (error) {
      logUpstashError(error);
      return memory.check(key);
    }
  };
}

/** Checkout: 10 order attempts per client IP per 10 minutes. */
export const checkOrderRateLimit = createSharedRateLimiter({ name: "place-order", limit: 10, minutes: 10 });

/** Contact form: 5 messages per client IP per hour. */
export const checkContactRateLimit = createSharedRateLimiter({ name: "contact", limit: 5, minutes: 60 });

/** "Try again in 3 minutes" style wording for a retry delay in seconds. */
export function retryMessage(retryAfter: number): string {
  const minutes = Math.ceil(retryAfter / 60);
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}

/* ---------- Client identification ---------- */

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
