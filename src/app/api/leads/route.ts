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
    return NextResponse.json(
      {
        ok: false,
        error: "Too many requests. Please slow down and try again shortly.",
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

  let body: LeadInput & { hp?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  // 2. Honeypot spam defense: if bot fills hidden field, return benign 200 without saving
  if (typeof body.hp === "string" && body.hp.trim().length > 0) {
    return NextResponse.json(
      { ok: true, leadId: "mock_lead_ack" },
      { status: 200 }
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
