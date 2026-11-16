import { describe, it, expect } from "vitest";
import { getPlatformTelemetry } from "../telemetry";
import { addLead, leadCount } from "../leads-store";

describe("telemetry: getPlatformTelemetry", () => {
  it("streams dynamic platform telemetry metrics accurately", async () => {
    const baselineLeads = leadCount();
    const telemetry = await getPlatformTelemetry();

    expect(telemetry).toHaveProperty("activeChallenges");
    expect(telemetry.activeChallenges).toBeGreaterThan(0);
    expect(telemetry.totalBuilders).toBe(3840 + baselineLeads);
    expect(telemetry.codeEvalsCompleted).toBe(24190 + baselineLeads * 3);
    expect(telemetry.avgP95LatencyMs).toBe(64);
    expect(telemetry.waitlistCount).toBe(baselineLeads);
    expect(new Date(telemetry.timestamp).getTime()).not.toBeNaN();
  });

  it("updates platform telemetry when new leads register", async () => {
    addLead({
      name: "Barbara Liskov",
      email: "liskov@mit.edu",
      organization: "MIT",
      intent: "builder",
    });

    const updatedTelemetry = await getPlatformTelemetry();
    expect(updatedTelemetry.waitlistCount).toBe(leadCount());
    expect(updatedTelemetry.totalBuilders).toBe(3840 + leadCount());
  });
});
