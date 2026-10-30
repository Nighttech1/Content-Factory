/**
 * Analyst worker entry (C-18).
 * Thin CLI/wrapper around `lib/analyst/run-insights`.
 *
 * Usage (local smoke):
 *   npx tsx workers/analyst/run.ts
 *   npx tsx workers/analyst/run.ts --force-mock
 *
 * Backend production path: import `runAnalystInsights` from `@/lib/analyst/run-insights`.
 */

import { runAnalystInsights } from "../../lib/analyst/run-insights";

async function main(): Promise<void> {
  const forceMock = process.argv.includes("--force-mock");
  const result = await runAnalystInsights({ forceMock });

  // Safe summary only — never dump env or keys.
  const summary = {
    promptVersion: result.promptVersion,
    source: result.source,
    cycleLabel: result.cycleLabel,
    generatedAt: result.generatedAt,
    insightCount: result.insights.length,
    tones: result.insights.map((i) => i.tone),
    promptHintCount: result.promptHints.length,
    // Bodies truncated for CLI readability
    insights: result.insights.map((i) => ({
      id: i.id,
      tone: i.tone,
      badge: i.badge,
      targetLabel: i.targetLabel,
      body: i.body.slice(0, 120) + (i.body.length > 120 ? "…" : ""),
      footer: i.footer,
    })),
  };

  // eslint-disable-next-line no-console -- CLI entrypoint
  console.log(JSON.stringify(summary, null, 2));

  if (result.insights.length < 3) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console -- CLI entrypoint
  console.error("[analyst] run failed:", err instanceof Error ? err.message : "unknown");
  process.exitCode = 1;
});
