import { NextRequest, NextResponse } from "next/server";
import { addLead, leadCount, validateLead, type LeadInput } from "@/lib/leads-store";

// Run on the Node.js runtime so the in-memory store is shared per instance.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: LeadInput;

  try {
    body = (await req.json()) as LeadInput;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Malformed JSON body." },
      { status: 400 }
    );
  }

  const result = validateLead(body);
  if (!result.ok || !result.value) {
    return NextResponse.json(
      { ok: false, message: "Please fix the highlighted fields.", errors: result.errors },
      { status: 422 }
    );
  }

  const lead = addLead(result.value);

  return NextResponse.json(
    {
      ok: true,
      message: "You're on the list. We'll be in touch shortly.",
      id: lead.id,
    },
    { status: 201 }
  );
}

// A lightweight read endpoint, handy for confirming the backend is wired up.
export async function GET() {
  return NextResponse.json({ ok: true, count: leadCount() });
}
