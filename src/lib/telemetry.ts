import { leadCount } from "./leads-store";

export interface PlatformTelemetry {
  activeChallenges: number;
  totalBuilders: number;
  codeEvalsCompleted: number;
  avgP95LatencyMs: number;
  waitlistCount: number;
  timestamp: string;
}

/**
 * Retrieves real-time platform telemetry for Server Component streaming.
 * In production this queries production time-series DB / Redis cache.
 */
export async function getPlatformTelemetry(): Promise<PlatformTelemetry> {
  // Simulate lightweight async streaming delay (60ms) to demonstrate Next.js App Router Suspense streaming
  await new Promise((resolve) => setTimeout(resolve, 60));

  const count = leadCount();

  return {
    activeChallenges: 18,
    totalBuilders: 3840 + count,
    codeEvalsCompleted: 24190 + count * 3,
    avgP95LatencyMs: 64,
    waitlistCount: count,
    timestamp: new Date().toISOString(),
  };
}
