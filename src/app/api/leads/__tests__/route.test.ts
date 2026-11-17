import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "../route";
import { leadCount, setStorageAdapter, _resetLeadsForTesting } from "@/lib/leads-store";
import { MemoryLeadsAdapter } from "@/lib/storage-adapter";
import { _resetRateLimiter } from "@/lib/rate-limiter";

describe("/api/leads route handler", () => {
  beforeEach(async () => {
    setStorageAdapter(new MemoryLeadsAdapter());
    await _resetLeadsForTesting();
    _resetRateLimiter();
  });

  it("GET returns current submission count matching the store", async () => {
    const expectedCount = await leadCount();
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.count).toBe(expectedCount);
  });

  it("POST stores new lead, returns 201, and increments lead count by one", async () => {
    const beforeCount = await leadCount();
    const uniqueEmail = `rosalind_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@dna.ac.uk`;

    const req = new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "198.51.100.1",
      },
      body: JSON.stringify({
        name: "Rosalind Franklin",
        email: uniqueEmail,
        organization: "King's College London",
        intent: "builder",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.leadId).toBeDefined();

    const afterCount = await leadCount();
    expect(afterCount).toBe(beforeCount + 1);
  });

  it("POST returns 422 with field errors on invalid submission", async () => {
    const req = new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "198.51.100.2",
      },
      body: JSON.stringify({
        name: "R",
        email: "not-valid-email",
        organization: "",
        intent: "invalid",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.errors).toHaveProperty("name");
    expect(data.errors).toHaveProperty("email");
    expect(data.errors).toHaveProperty("organization");
    expect(data.errors).toHaveProperty("intent");
  });

  it("POST returns 400 on malformed JSON", async () => {
    const req = new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "198.51.100.3",
      },
      body: "invalid-json-string{",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Invalid JSON payload");
  });

  it("POST returns 200 without saving when honeypot field is filled", async () => {
    const beforeCount = await leadCount();
    const req = new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "198.51.100.4",
      },
      body: JSON.stringify({
        name: "Bot Spammer",
        email: "spambot@auto.io",
        organization: "BotNet LLC",
        intent: "company",
        hp: "https://spam-link.com",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);

    const afterCount = await leadCount();
    expect(afterCount).toBe(beforeCount); // Verifies bot lead was not persisted
  });

  it("POST enforces rate limit and returns 429 when client exceeds threshold", async () => {
    const testIp = "203.0.113.88";

    // Exhaust 5 allowed requests
    for (let i = 0; i < 5; i++) {
      const req = new NextRequest("http://localhost:3000/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": testIp,
        },
        body: JSON.stringify({
          name: `User ${i}`,
          email: `user${i}@rate.test`,
          organization: "Rate Corp",
          intent: "builder",
        }),
      });
      const r = await POST(req);
      expect(r.status).toBe(201);
    }

    // 6th request must be rejected with 429
    const reqExceeded = new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": testIp,
      },
      body: JSON.stringify({
        name: "Exceeded User",
        email: "exceeded@rate.test",
        organization: "Rate Corp",
        intent: "builder",
      }),
    });

    const resBlocked = await POST(reqExceeded);
    expect(resBlocked.status).toBe(429);
    expect(resBlocked.headers.get("Retry-After")).toBeDefined();
    expect(resBlocked.headers.get("X-RateLimit-Remaining")).toBe("0");
  });
});
