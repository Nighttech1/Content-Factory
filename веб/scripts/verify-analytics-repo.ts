/**
 * Smoke: repository upsert + list + aggregate without requiring Postgres.
 * Run: npm run db:verify
 */
import {
  getAnalyticsRepository,
  resetAnalyticsRepositoryCache,
} from "../lib/db/analytics-repository";

async function main(): Promise<void> {
  resetAnalyticsRepositoryCache();
  // Force fallback path for deterministic local smoke (no DATABASE_URL needed).
  delete process.env.DATABASE_URL;

  const repo = await getAnalyticsRepository();
  if (repo.storeKind !== "fallback") {
    throw new Error(`expected fallback store, got ${repo.storeKind}`);
  }

  const id = "pa_verify_smoke_c16";
  await repo.upsertSnapshot({
    id,
    postId: "post_verify_1",
    platform: "instagram",
    views: 10,
    saves: 2,
    shares: 1,
    capturedAt: new Date("2026-09-19T00:00:00.000Z"),
  });

  const byPost = await repo.listByPost("post_verify_1", "instagram");
  if (!byPost.some((r) => r.id === id && r.views === 10)) {
    throw new Error("listByPost missing upserted snapshot");
  }

  const kpi = await repo.aggregateForKpi(new Date("2026-09-01T00:00:00.000Z"));
  if (kpi.snapshotCount < 1 || kpi.views < 10) {
    throw new Error(`aggregateForKpi unexpected: ${JSON.stringify(kpi)}`);
  }

  // eslint-disable-next-line no-console
  console.info(
    `[verify] ok store=${repo.storeKind} byPost=${byPost.length} kpi=${JSON.stringify(kpi)}`,
  );
}

main().catch((err) => {
  console.error("[verify] failed", err);
  process.exitCode = 1;
});
