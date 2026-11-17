import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "../route";

describe("/api/leads route handler", () => {
  it("GET returns current submission count", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(typeof data.count).toBe("number");
  });

  it("POST returns 201 on valid submission", async () => {
    const req = new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Rosalind Franklin",
        email: `rosalind_${Date.now()}@dna.ac.uk`,
        organization: "King's College London",
        intent: "builder",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.id).toMatch(/^ld_/);
  });

  it("POST returns 422 with field errors on invalid submission", async () => {
    const req = new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
      body: "invalid-json-string{",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.message).toBe("Malformed JSON body.");
  });
});
