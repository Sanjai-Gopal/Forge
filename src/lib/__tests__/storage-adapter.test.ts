import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { MemoryLeadsAdapter, FileLeadsAdapter } from "../storage-adapter";
import fs from "fs";
import path from "path";

describe("storage adapters", () => {
  const testFilePath = path.join(process.cwd(), ".data", "test-leads.json");

  beforeEach(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  describe("MemoryLeadsAdapter", () => {
    it("adds and retrieves leads in memory", async () => {
      const adapter = new MemoryLeadsAdapter();
      expect(await adapter.leadCount()).toBe(0);

      const lead = await adapter.addLead({
        name: "Test Builder",
        email: "builder@test.com",
        organization: "Builder Inc",
        intent: "builder",
      });

      expect(lead.id).toBeDefined();
      expect(await adapter.leadCount()).toBe(1);

      const found = await adapter.findLeadByEmail("builder@test.com");
      expect(found).toBeDefined();
      expect(found?.name).toBe("Test Builder");

      await adapter.clear();
      expect(await adapter.leadCount()).toBe(0);
    });
  });

  describe("FileLeadsAdapter", () => {
    it("persists leads to filesystem", async () => {
      const adapter = new FileLeadsAdapter(testFilePath);
      expect(await adapter.leadCount()).toBe(0);

      await adapter.addLead({
        name: "Persisted Lead",
        email: "persist@test.com",
        organization: "Persistence Co",
        intent: "company",
      });

      expect(await adapter.leadCount()).toBe(1);

      // Verify file was written
      expect(fs.existsSync(testFilePath)).toBe(true);

      // Load new instance pointing to same file
      const adapter2 = new FileLeadsAdapter(testFilePath);
      expect(await adapter2.leadCount()).toBe(1);
      const found = await adapter2.findLeadByEmail("persist@test.com");
      expect(found?.organization).toBe("Persistence Co");
    });
  });
});
