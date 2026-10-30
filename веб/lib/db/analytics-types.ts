/**
 * Shared types for PostAnalytics repository (C-16).
 * C-17 writes snapshots; C-18 reads aggregates — both via this contract.
 */

export type RetentionCurvePoint = {
  t: number;
  value: number;
};

export type PostAnalyticsWrite = {
  /** Stable id for idempotent upsert (seed / re-ingest). */
  id?: string;
  postId: string;
  platform: string;
  views?: number;
  saves?: number;
  shares?: number;
  retentionCurve?: RetentionCurvePoint[] | null;
  capturedAt?: Date | string;
  contentJobId?: string | null;
};

export type PostAnalyticsRow = {
  id: string;
  postId: string;
  platform: string;
  views: number;
  saves: number;
  shares: number;
  retentionCurve: RetentionCurvePoint[] | null;
  capturedAt: Date;
  contentJobId: string | null;
};

export type AnalyticsKpiAggregate = {
  views: number;
  saves: number;
  shares: number;
  snapshotCount: number;
};

export type SeedUserInput = {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "ADMIN";
};

export type SeedJobInput = {
  id: string;
  moduleId: string;
  topic: string;
  status: "PUBLISHED";
  userId: string;
  rawScript: unknown;
  publishedAt?: Date | string;
};

export type PublishedJobRow = {
  id: string;
  moduleId: string;
  topic: string;
  publishedAt: Date | null;
};

export interface AnalyticsRepository {
  readonly storeKind: "prisma" | "fallback";

  upsertSnapshot(input: PostAnalyticsWrite): Promise<PostAnalyticsRow>;
  listByPost(postId: string, platform?: string): Promise<PostAnalyticsRow[]>;
  listLatest(limit: number): Promise<PostAnalyticsRow[]>;
  aggregateForKpi(since: Date): Promise<AnalyticsKpiAggregate>;
  /** PUBLISHED ContentJobs for C-17 ingest target resolution. */
  listPublishedJobs(): Promise<PublishedJobRow[]>;

  /** Idempotent fixtures for local / seed (stable ids). */
  ensureSeedFixtures(input: {
    user: SeedUserInput;
    jobs: SeedJobInput[];
    snapshots: PostAnalyticsWrite[];
  }): Promise<void>;
}

export function normalizeCapturedAt(value?: Date | string): Date {
  if (!value) return new Date();
  return value instanceof Date ? value : new Date(value);
}

/** UTC calendar day key `YYYY-MM-DD` for ingest idempotency. */
export function utcDayKey(value?: Date | string): string {
  const d = normalizeCapturedAt(value);
  return d.toISOString().slice(0, 10);
}

/**
 * Stable snapshot id: one row per (postId, platform, UTC day).
 * Used by C-17 re-ingest so the same day overwrites instead of stacking.
 */
export function dayBucketSnapshotId(
  postId: string,
  platform: string,
  capturedAt?: Date | string,
): string {
  const safePost = postId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
  const safePlatform = platform.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 32);
  return `pa_${safePlatform}_${safePost}_${utcDayKey(capturedAt)}`;
}

export function asRetentionCurve(
  value: unknown,
): RetentionCurvePoint[] | null {
  if (value == null) return null;
  if (!Array.isArray(value)) return null;
  return value as RetentionCurvePoint[];
}
