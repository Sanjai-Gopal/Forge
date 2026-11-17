import { NextRequest } from "next/server";

interface RateLimitRecord {
  timestamps: number[];
}

const ipRequestMap = new Map<string, RateLimitRecord>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleRecords(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const threshold = now - windowMs;
  ipRequestMap.forEach((record, ip) => {
    record.timestamps = record.timestamps.filter((t: number) => t > threshold);
    if (record.timestamps.length === 0) {
      ipRequestMap.delete(ip);
    }
  });
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
  retryAfter: number; // seconds
}

/**
 * Applies a sliding-window rate limit based on client IP.
 * Default: 5 requests per 60 seconds.
 */
export function rateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  cleanupStaleRecords(windowMs);

  let record = ipRequestMap.get(ip);
  if (!record) {
    record = { timestamps: [] };
    ipRequestMap.set(ip, record);
  }

  // Remove timestamps outside the sliding window
  const windowStart = now - windowMs;
  record.timestamps = record.timestamps.filter((t: number) => t > windowStart);

  const resetTimeSeconds = Math.ceil((now + windowMs) / 1000);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

    return {
      success: false,
      limit,
      remaining: 0,
      reset: resetTimeSeconds,
      retryAfter,
    };
  }

  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);

  return {
    success: true,
    limit,
    remaining,
    reset: resetTimeSeconds,
    retryAfter: 0,
  };
}

/**
 * Extracts client IP from request headers or fallbacks.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * For testing purposes only: resets the in-memory rate limit table.
 */
export function _resetRateLimiter() {
  ipRequestMap.clear();
  lastCleanup = Date.now();
}
