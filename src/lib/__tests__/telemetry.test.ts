import { describe, it, expect } from "vitest";
import { getPlatformTelemetry } from "../telemetry";
import { addLead, leadCount } from "../leads-store";

describe("telemetry: getPlatformTelemetry", () => {
  it("streams dynamic platform telemetry metrics accurately", async () => {
    const baselineLeads = leadCount();
    const telemetry = await getPlatformTelemetry();

    expect(telemetry).toHaveProperty("benchmarkP95LatencyMs");
    expect(telemetry.benchmarkP95LatencyMs).toBe(64);
    expect(telemetry.challengeTracks).toBe(4);
    expect(telemetry.simulatedTestCases).toBe(412);
    expect(telemetry.isPrototype).toBe(true);
    expect(telemetry.waitlistRegistrations).toBe(baselineLeads);
    expect(new Date(telemetry.timestamp).getTime()).not.toBeNaN();
  });

  it("updates platform telemetry when new leads register", async () => {
    const beforeCount = leadCount();
    const uniqueEmail = `telemetry_test_${Date.now()}@example.com`;

    addLead({
      name: "Barbara Liskov",
      email: uniqueEmail,
      organization: "MIT",
      intent: "builder",
    });

    const updatedTelemetry = await getPlatformTelemetry();
    expect(updatedTelemetry.waitlistRegistrations).toBe(beforeCount + 1);
  });
});
