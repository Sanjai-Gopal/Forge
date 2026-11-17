import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, _resetRateLimiter, getClientIp } from "../rate-limiter";
import { NextRequest } from "next/server";

describe("rate-limiter", () => {
  beforeEach(() => {
    _resetRateLimiter();
  });

  it("allows requests under the specified limit", () => {
    const ip = "192.168.1.100";
    const res1 = rateLimit(ip, 3, 10000);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = rateLimit(ip, 3, 10000);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = rateLimit(ip, 3, 10000);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("blocks requests exceeding the limit with 429 semantics", () => {
    const ip = "10.0.0.1";
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(ip, 5, 10000).success).toBe(true);
    }

    const blocked = rateLimit(ip, 5, 10000);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("extracts client IP accurately from x-forwarded-for header", () => {
    const req = new NextRequest("http://localhost:3000/api/leads", {
      headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
    });
    expect(getClientIp(req)).toBe("203.0.113.195");
  });

  it("falls back to 127.0.0.1 when headers are missing", () => {
    const req = new NextRequest("http://localhost:3000/api/leads");
    expect(getClientIp(req)).toBe("127.0.0.1");
  });
});
