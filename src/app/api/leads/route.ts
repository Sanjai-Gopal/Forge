import { NextRequest, NextResponse } from "next/server";
import { addLead, leadCount, validateLead, type LeadInput } from "@/lib/leads-store";
import { rateLimit, getClientIp } from "@/lib/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // 1. IP Rate Limiting (5 requests per 60 seconds)
  const ip = getClientIp(req);
  const limiter = rateLimit(ip, 5, 60 * 1000);

  if (!limiter.success) {
    const errorMsg = "Too many requests. Please slow down and try again shortly.";
    return NextResponse.json(
      {
        ok: false,
        error: errorMsg,
        message: errorMsg,
      },
      {
        status: 429,
        headers: {
          "Retry-After": limiter.retryAfter.toString(),
          "X-RateLimit-Limit": limiter.limit.toString(),
          "X-RateLimit-Remaining": limiter.remaining.toString(),
          "X-RateLimit-Reset": limiter.reset.toString(),
        },
      }
    );
  }

  // 2. Request body size limit (max 10KB to prevent DoS)
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 10 * 1024) {
    return NextResponse.json(
      {
        ok: false,
        error: "Payload too large. Maximum allowed size is 10KB.",
        message: "Payload too large",
      },
      { status: 413 }
    );
  }

  let body: LeadInput & { hp?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload", message: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  // 3. Honeypot spam defense: if bot fills hidden field, return indistinguishable 201 without saving
  if (typeof body.hp === "string" && body.hp.trim().length > 0) {
    const fakeId = `ld_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`;
    return NextResponse.json(
      { ok: true, leadId: fakeId },
      {
        status: 201,
        headers: {
          "X-RateLimit-Limit": limiter.limit.toString(),
          "X-RateLimit-Remaining": limiter.remaining.toString(),
        },
      }
    );
  }

  // 3. Payload validation
  const result = validateLead(body);
  if (!result.ok || !result.value) {
    return NextResponse.json(
      { ok: false, errors: result.errors },
      { status: 422 }
    );
  }

  // 4. Persistence via active storage adapter
  const lead = await addLead(result.value);

  return NextResponse.json(
    { ok: true, leadId: lead.id },
    {
      status: 201,
      headers: {
        "X-RateLimit-Limit": limiter.limit.toString(),
        "X-RateLimit-Remaining": limiter.remaining.toString(),
      },
    }
  );
}

export async function GET() {
  const count = await leadCount();
  return NextResponse.json({ ok: true, count });
}
