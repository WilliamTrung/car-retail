export type RateLimitOptions = {
  /** Max tokens the bucket can hold (burst size). */
  capacity: number;
  /** Tokens added per second. */
  refillPerSecond: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Hint for 429 Retry-After when denied. */
  retryAfterMs?: number;
};

type Bucket = {
  tokens: number;
  updatedAtMs: number;
};

/**
 * In-memory token-bucket rate limiter keyed by string (typically client IP).
 * Single-instance only — fine for one Node process.
 */
export function createTokenBucketRateLimiter(options: RateLimitOptions) {
  const { capacity, refillPerSecond } = options;
  if (capacity < 1) {
    throw new Error("capacity must be >= 1");
  }
  if (refillPerSecond <= 0) {
    throw new Error("refillPerSecond must be > 0");
  }

  const buckets = new Map<string, Bucket>();

  function refill(bucket: Bucket, now: number): void {
    const elapsedSec = (now - bucket.updatedAtMs) / 1000;
    if (elapsedSec > 0) {
      bucket.tokens = Math.min(
        capacity,
        bucket.tokens + elapsedSec * refillPerSecond,
      );
      bucket.updatedAtMs = now;
    }
  }

  function take(key: string): RateLimitResult {
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { tokens: capacity, updatedAtMs: now };
      buckets.set(key, bucket);
    } else {
      refill(bucket, now);
    }

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
      };
    }

    const need = 1 - bucket.tokens;
    const retryAfterMs = Math.ceil((need / refillPerSecond) * 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs,
    };
  }

  function reset(key?: string): void {
    if (key === undefined) {
      buckets.clear();
    } else {
      buckets.delete(key);
    }
  }

  return { take, reset };
}

/**
 * Default limiter for `POST /api/leads`: burst of 5, refill ~1 token / 12s
 * (~5 per minute steady-state).
 */
export const leadIpRateLimiter = createTokenBucketRateLimiter({
  capacity: 5,
  refillPerSecond: 5 / 60,
});

/** Convenience: check whether `ip` may submit a lead. */
export function checkLeadRateLimit(ip: string): RateLimitResult {
  return leadIpRateLimiter.take(ip);
}
