import { describe, it, expect, beforeEach } from "vitest";
import {
  validateLead,
  addLead,
  listLeads,
  leadCount,
  setStorageAdapter,
  _resetLeadsForTesting,
} from "../leads-store";
import { MemoryLeadsAdapter } from "../storage-adapter";

describe("leads-store: validateLead", () => {
  it("validates valid company lead input", () => {
    const result = validateLead({
      name: "Ada Lovelace",
      email: "ada@analytic.engine",
      organization: "Babbage Labs",
      intent: "company",
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.value).toEqual({
      name: "Ada Lovelace",
      email: "ada@analytic.engine",
      organization: "Babbage Labs",
      intent: "company",
    });
  });

  it("validates valid builder lead input and normalizes email", () => {
    const result = validateLead({
      name: "  Alan Turing  ",
      email: "  ALAN@Bletchley.UK  ",
      organization: "Cambridge",
      intent: "builder",
    });

    expect(result.ok).toBe(true);
    expect(result.value?.name).toBe("Alan Turing");
    expect(result.value?.email).toBe("alan@bletchley.uk");
    expect(result.value?.intent).toBe("builder");
  });

  it("fails when name is too short", () => {
    const result = validateLead({
      name: "A",
      email: "valid@email.com",
      organization: "Acme Corp",
      intent: "company",
    });

    expect(result.ok).toBe(false);
    expect(result.errors.name).toBe("Please enter your full name.");
  });

  it("fails when email format is invalid", () => {
    const result = validateLead({
      name: "Grace Hopper",
      email: "not-an-email",
      organization: "US Navy",
      intent: "builder",
    });

    expect(result.ok).toBe(false);
    expect(result.errors.email).toBe("Please enter a valid work email.");
  });

  it("fails when organization is missing", () => {
    const result = validateLead({
      name: "Margaret Hamilton",
      email: "margaret@mit.edu",
      organization: " ",
      intent: "builder",
    });

    expect(result.ok).toBe(false);
    expect(result.errors.organization).toBe("Tell us where you work.");
  });

  it("fails when intent is invalid", () => {
    const result = validateLead({
      name: "Katherine Johnson",
      email: "katherine@nasa.gov",
      organization: "NASA",
      intent: "other" as unknown,
    });

    expect(result.ok).toBe(false);
    expect(result.errors.intent).toBe("Choose how you'd like to use Forge.");
  });
});

describe("leads-store: storage and deduplication", () => {
  beforeEach(async () => {
    setStorageAdapter(new MemoryLeadsAdapter());
    await _resetLeadsForTesting();
  });

  it("stores new leads with generated IDs and ISO timestamps", async () => {
    const lead = await addLead({
      name: "Claude Shannon",
      email: "claude@bell-labs.com",
      organization: "Bell Labs",
      intent: "company",
    });

    expect(lead.id).toBeDefined();
    expect(lead.email).toBe("claude@bell-labs.com");
    expect(new Date(lead.createdAt).getTime()).not.toBeNaN();
  });

  it("deduplicates leads with identical emails", async () => {
    const initialCount = await leadCount();
    const lead1 = await addLead({
      name: "Tim Berners-Lee",
      email: "tim@w3.org",
      organization: "CERN",
      intent: "builder",
    });

    const lead2 = await addLead({
      name: "Tim BL",
      email: "tim@w3.org",
      organization: "W3C",
      intent: "company",
    });

    expect(lead1.id).toBe(lead2.id);
    expect(await leadCount()).toBe(initialCount + 1);
  });

  it("lists all submitted leads correctly in self-contained test", async () => {
    const uniqueEmail = `self_contained_${Date.now()}@unit-test.org`;
    const lead = await addLead({
      name: "John von Neumann",
      email: uniqueEmail,
      organization: "IAS Princeton",
      intent: "builder",
    });

    const leads = await listLeads();
    expect(Array.isArray(leads)).toBe(true);
    expect(leads).toContainEqual(lead);
  });
});
