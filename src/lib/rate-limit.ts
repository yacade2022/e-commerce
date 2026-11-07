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

/* ---------- Order limiter: Upstash Redis, with in-memory fallback ---------- */

const ORDER_LIMIT = 10;
const ORDER_WINDOW = "10 m";
const ORDER_WINDOW_MS = 10 * 60 * 1000;

const memoryOrderLimiter = createMemoryRateLimiter({ limit: ORDER_LIMIT, windowMs: ORDER_WINDOW_MS });

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Created at module scope so Upstash's ephemeral cache can skip Redis calls for
// clients that are already blocked while this instance stays warm.
const upstashOrderLimiter =
  url && token
    ? new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(ORDER_LIMIT, ORDER_WINDOW),
        prefix: "stockroom:place-order",
        // Give up on Redis after 2s; we then fall back to the in-memory limiter below.
        timeout: 2000,
        analytics: false,
      })
    : null;

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
  console.error(`[rate-limit] Upstash request failed; using the in-memory limiter${extra}.`, error);
  lastErrorLog = now;
  suppressedErrors = 0;
}

/**
 * Limits order attempts per key (client IP) across all server instances when
 * UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set. Without them, or
 * if Upstash times out or errors, it falls back to the per-instance limiter so
 * there is always some limit in place.
 */
export async function checkOrderRateLimit(key: string): Promise<RateLimitResult> {
  if (!upstashOrderLimiter) {
    if (process.env.NODE_ENV === "production" && !warnedMissingConfig) {
      warnedMissingConfig = true;
      console.warn("[rate-limit] Upstash is not configured; using the per-instance in-memory limiter.");
    }
    return memoryOrderLimiter.check(key);
  }

  try {
    const { success, reset, reason } = await upstashOrderLimiter.limit(key);
    // On timeout Upstash lets the request through; apply the local limit instead.
    if (reason === "timeout") return memoryOrderLimiter.check(key);
    return {
      limited: !success,
      retryAfter: success ? 0 : Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  } catch (error) {
    logUpstashError(error);
    return memoryOrderLimiter.check(key);
  }
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
