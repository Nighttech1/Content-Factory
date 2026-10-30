/**
 * Analytics ingest handler (C-17).
 * Fetch platform metrics → write PostAnalytics via C-16 repository.
 * Idempotent: one snapshot per (postId, platform, UTC calendar day).
 */
import {
  dayBucketSnapshotId,
  getAnalyticsRepository,
  type AnalyticsRepository,
  type PostAnalyticsRow,
  type PublishedJobRow,
  type RetentionCurvePoint,
} from "@/lib/db";
import {
  resolvePlatformAdapters,
  type AdapterPostRef,
  type MetricsSnapshot,
  type PlatformId,
} from "./adapters";

export type IngestTarget = AdapterPostRef & {
  platforms?: PlatformId[];
};

export type IngestResult = {
  storeKind: AnalyticsRepository["storeKind"];
  modes: Record<PlatformId, "real" | "mock">;
  targets: number;
  written: number;
  snapshots: Array<Pick<PostAnalyticsRow, "id" | "postId" | "platform" | "views">>;
};

/** Known seed external ids from C-16 fixtures (used when jobs exist). */
const SEED_POST_MAP: Record<
  string,
  Partial<Record<PlatformId, string>>
> = {
  job_seed_carousel_01: {
    instagram: "ig_ext_carousel_01",
  },
  job_seed_heygen_02: {
    youtube: "yt_ext_heygen_02",
  },
  job_seed_infographic_03: {
    instagram: "ig_ext_info_03",
  },
};

/** Absolute fallback when no PUBLISHED jobs and no allowlist. */
const DEFAULT_TARGETS: IngestTarget[] = [
  {
    postId: "ig_ext_carousel_01",
    externalId: "ig_ext_carousel_01",
    contentJobId: "job_seed_carousel_01",
    platforms: ["instagram"],
  },
  {
    postId: "yt_ext_heygen_02",
    externalId: "yt_ext_heygen_02",
    contentJobId: "job_seed_heygen_02",
    platforms: ["youtube"],
  },
  {
    postId: "ig_ext_info_03",
    externalId: "ig_ext_info_03",
    contentJobId: "job_seed_infographic_03",
    platforms: ["instagram"],
  },
];

function mapRetention(
  curve?: MetricsSnapshot["retentionCurve"],
): RetentionCurvePoint[] | null {
  if (!curve?.length) return null;
  return curve.map((p) => ({
    t: p.tSec,
    value: p.retentionPct / 100,
  }));
}

function parseAllowlist(): IngestTarget[] | null {
  const raw = process.env.ANALYTICS_POST_ALLOWLIST?.trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as IngestTarget[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed.filter((p) => typeof p?.postId === "string");
  } catch {
    // eslint-disable-next-line no-console
    console.warn("[ingest] ANALYTICS_POST_ALLOWLIST is not valid JSON; ignoring");
    return null;
  }
}

function targetsFromJobs(jobs: PublishedJobRow[]): IngestTarget[] {
  const out: IngestTarget[] = [];
  for (const job of jobs) {
    const seedMap = SEED_POST_MAP[job.id];
    if (seedMap) {
      for (const platform of Object.keys(seedMap) as PlatformId[]) {
        const postId = seedMap[platform]!;
        out.push({
          postId,
          externalId: postId,
          contentJobId: job.id,
          platforms: [platform],
        });
      }
      continue;
    }
    // Generic: one IG + one YT synthetic id per published job
    out.push({
      postId: `ig_${job.id}`,
      externalId: `ig_${job.id}`,
      contentJobId: job.id,
      platforms: ["instagram"],
    });
    out.push({
      postId: `yt_${job.id}`,
      externalId: `yt_${job.id}`,
      contentJobId: job.id,
      platforms: ["youtube"],
    });
  }
  return out;
}

export async function resolveIngestTargets(
  repo: AnalyticsRepository,
): Promise<IngestTarget[]> {
  const allowlist = parseAllowlist();
  if (allowlist) return allowlist;

  const jobs = await repo.listPublishedJobs();
  if (jobs.length > 0) return targetsFromJobs(jobs);

  return DEFAULT_TARGETS;
}

function groupByPlatform(
  targets: IngestTarget[],
  platform: PlatformId,
): AdapterPostRef[] {
  return targets
    .filter((t) => !t.platforms || t.platforms.includes(platform))
    .map((t) => ({
      postId: t.postId,
      externalId: t.externalId,
      contentJobId: t.contentJobId,
    }));
}

/**
 * Main ingest entry used by CLI, API, BullMQ, and node-cron.
 */
export async function runAnalyticsIngest(): Promise<IngestResult> {
  const repo = await getAnalyticsRepository();
  const targets = await resolveIngestTargets(repo);
  const { adapters, modes } = resolvePlatformAdapters();

  const writtenRows: IngestResult["snapshots"] = [];

  for (const adapter of adapters) {
    const posts = groupByPlatform(targets, adapter.platform);
    if (posts.length === 0) continue;

    const snapshots = await adapter.fetchMetrics(posts);
    for (const snap of snapshots) {
      const capturedAt = snap.capturedAt ?? new Date();
      const id = dayBucketSnapshotId(snap.postId, snap.platform, capturedAt);
      const row = await repo.upsertSnapshot({
        id,
        postId: snap.postId,
        platform: snap.platform,
        views: snap.views,
        saves: snap.saves,
        shares: snap.shares,
        retentionCurve: mapRetention(snap.retentionCurve),
        capturedAt,
        contentJobId: snap.contentJobId ?? null,
      });
      writtenRows.push({
        id: row.id,
        postId: row.postId,
        platform: row.platform,
        views: row.views,
      });
    }
  }

  // eslint-disable-next-line no-console
  console.info(
    `[ingest] store=${repo.storeKind} modes=${JSON.stringify(modes)} targets=${targets.length} written=${writtenRows.length}`,
  );

  return {
    storeKind: repo.storeKind,
    modes,
    targets: targets.length,
    written: writtenRows.length,
    snapshots: writtenRows,
  };
}
