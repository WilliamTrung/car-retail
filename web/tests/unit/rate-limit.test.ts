import { describe, expect, it } from "vitest";
import { createTokenBucketRateLimiter } from "@/server/rate-limit";

describe("createTokenBucketRateLimiter", () => {
  it("allows requests within capacity", () => {
    const limiter = createTokenBucketRateLimiter({
      capacity: 5,
      refillPerSecond: 0.001,
    });

    for (let i = 0; i < 5; i++) {
      const result = limiter.take("1.2.3.4");
      expect(result.allowed).toBe(true);
    }
  });

  it("rejects a burst over the threshold", () => {
    const limiter = createTokenBucketRateLimiter({
      capacity: 5,
      refillPerSecond: 0.001,
    });
    const ip = "10.0.0.1";

    for (let i = 0; i < 5; i++) {
      expect(limiter.take(ip).allowed).toBe(true);
    }

    const denied = limiter.take(ip);
    expect(denied.allowed).toBe(false);
    expect(denied.remaining).toBe(0);
    expect(denied.retryAfterMs).toBeGreaterThan(0);
  });

  it("isolates buckets by key", () => {
    const limiter = createTokenBucketRateLimiter({
      capacity: 1,
      refillPerSecond: 0.001,
    });

    expect(limiter.take("a").allowed).toBe(true);
    expect(limiter.take("a").allowed).toBe(false);
    expect(limiter.take("b").allowed).toBe(true);
  });
});
