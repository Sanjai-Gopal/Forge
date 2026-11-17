import fs from "fs";
import path from "path";
import type { Lead } from "./leads-store";

/**
 * Storage adapter interface for lead persistence.
 * Implementations can be configured via environment variables.
 */
export interface LeadsStorageAdapter {
  addLead(value: Omit<Lead, "id" | "createdAt">): Promise<Lead>;
  listLeads(): Promise<Lead[]>;
  leadCount(): Promise<number>;
  findLeadByEmail(email: string): Promise<Lead | undefined>;
  clear(): Promise<void>;
}

export class MemoryLeadsAdapter implements LeadsStorageAdapter {
  private leads: Lead[] = [];

  async addLead(value: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
    const lead: Lead = {
      ...value,
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    this.leads.unshift(lead);
    return lead;
  }

  async listLeads(): Promise<Lead[]> {
    return [...this.leads];
  }

  async leadCount(): Promise<number> {
    return this.leads.length;
  }

  async findLeadByEmail(email: string): Promise<Lead | undefined> {
    const normalized = email.toLowerCase().trim();
    return this.leads.find((l) => l.email.toLowerCase() === normalized);
  }

  async clear(): Promise<void> {
    this.leads = [];
  }
}

export class FileLeadsAdapter implements LeadsStorageAdapter {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), ".data", "leads.json");
    this.ensureFileExists();
  }

  private ensureFileExists() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), "utf-8");
      }
    } catch {
      // In read-only or restricted environments, fail gracefully
    }
  }

  private readLeads(): Lead[] {
    try {
      if (!fs.existsSync(this.filePath)) return [];
      const content = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(content) as Lead[];
    } catch {
      return [];
    }
  }

  private writeLeads(leads: Lead[]) {
    try {
      this.ensureFileExists();
      fs.writeFileSync(this.filePath, JSON.stringify(leads, null, 2), "utf-8");
    } catch {
      // Fail gracefully
    }
  }

  async addLead(value: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
    const leads = this.readLeads();
    const lead: Lead = {
      ...value,
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    leads.unshift(lead);
    this.writeLeads(leads);
    return lead;
  }

  async listLeads(): Promise<Lead[]> {
    return this.readLeads();
  }

  async leadCount(): Promise<number> {
    return this.readLeads().length;
  }

  async findLeadByEmail(email: string): Promise<Lead | undefined> {
    const normalized = email.toLowerCase().trim();
    return this.readLeads().find((l) => l.email.toLowerCase() === normalized);
  }

  async clear(): Promise<void> {
    this.writeLeads([]);
  }
}

export function createDefaultStorageAdapter(): LeadsStorageAdapter {
  if (process.env.LEADS_STORAGE_ADAPTER === "file") {
    return new FileLeadsAdapter();
  }
  return new MemoryLeadsAdapter();
}
