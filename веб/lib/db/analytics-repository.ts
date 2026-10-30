import { createFallbackAnalyticsRepository } from "./analytics-fallback";
import { createPrismaAnalyticsRepository } from "./analytics-prisma-repo";
import type { AnalyticsRepository } from "./analytics-types";
import { getPrisma } from "./prisma";

export type {
  AnalyticsKpiAggregate,
  AnalyticsRepository,
  PostAnalyticsRow,
  PostAnalyticsWrite,
  PublishedJobRow,
  RetentionCurvePoint,
  SeedJobInput,
  SeedUserInput,
} from "./analytics-types";
export { dayBucketSnapshotId, utcDayKey } from "./analytics-types";

type StoreMode = "prisma" | "fallback";

let cached: AnalyticsRepository | null = null;
let bootLogged = false;
let resolveInFlight: Promise<AnalyticsRepository> | null = null;

function logStoreOnce(mode: StoreMode): void {
  if (bootLogged) return;
  bootLogged = true;
  const label =
    mode === "prisma" ? "analytics-store=prisma" : "analytics-store=fallback";
  // eslint-disable-next-line no-console -- intentional one-shot boot signal for C-16/C-17
  console.info(`[db] ${label}`);
}

async function tryPrismaRepository(): Promise<AnalyticsRepository | null> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;

  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
    return createPrismaAnalyticsRepository(prisma);
  } catch {
    return null;
  }
}

/**
 * Resolves Prisma when DATABASE_URL works; otherwise JSON fallback.
 * Always prefer this over raw Prisma in handlers (C-17 / C-18).
 */
export async function getAnalyticsRepository(): Promise<AnalyticsRepository> {
  if (cached) return cached;
  if (resolveInFlight) return resolveInFlight;

  resolveInFlight = (async () => {
    const prismaRepo = await tryPrismaRepository();
    if (prismaRepo) {
      logStoreOnce("prisma");
      cached = prismaRepo;
      return prismaRepo;
    }
    logStoreOnce("fallback");
    cached = createFallbackAnalyticsRepository();
    return cached;
  })();

  try {
    return await resolveInFlight;
  } finally {
    resolveInFlight = null;
  }
}

/** Test helper: clear singleton between smokes. */
export function resetAnalyticsRepositoryCache(): void {
  cached = null;
  bootLogged = false;
  resolveInFlight = null;
}

/** Sync fallback factory when caller already knows Postgres is unavailable. */
export function getFallbackAnalyticsRepository(): AnalyticsRepository {
  logStoreOnce("fallback");
  if (!cached || cached.storeKind !== "fallback") {
    cached = createFallbackAnalyticsRepository();
  }
  return cached;
}
