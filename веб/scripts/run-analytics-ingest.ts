/**
 * CLI: run analytics ingest once (no Docker / Redis / API keys required).
 *
 *   npm run analytics:ingest
 *   npx tsx scripts/run-analytics-ingest.ts
 */
import { runAnalyticsIngest } from "../lib/analytics/ingest-post-metrics";

async function main(): Promise<void> {
  const result = await runAnalyticsIngest();
  // eslint-disable-next-line no-console
  console.info(
    `[cli] ingest done store=${result.storeKind} written=${result.written} modes=${JSON.stringify(result.modes)}`,
  );
  for (const s of result.snapshots) {
    // eslint-disable-next-line no-console
    console.info(`  - ${s.id} ${s.platform} ${s.postId} views=${s.views}`);
  }
}

main().catch((err) => {
  console.error("[cli] ingest failed", err);
  process.exitCode = 1;
});
