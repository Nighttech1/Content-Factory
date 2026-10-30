/**
 * Read-only aggregate builder for Analyst (C-18).
 * Uses lib/db analytics repository — no Prisma in AI Bridge layer.
 */

import {
  getAnalyticsRepository,
  type PostAnalyticsRow,
  type PublishedJobRow,
} from "@/lib/db";

import type {
  AnalystAggregatePost,
  AnalystAggregatesPayload,
} from "./types";

const DEFAULT_WINDOW_DAYS = 30;
const LIST_LIMIT = 200;

function saveRate(views: number, saves: number): number {
  if (views <= 0) return 0;
  return saves / views;
}

function toAggregatePost(
  row: PostAnalyticsRow,
  jobById: Map<string, PublishedJobRow>,
): AnalystAggregatePost {
  const job =
    row.contentJobId != null ? jobById.get(row.contentJobId) : undefined;
  return {
    postId: row.postId,
    platform: row.platform,
    views: row.views,
    saves: row.saves,
    shares: row.shares,
    contentJobId: row.contentJobId,
    moduleId: job?.moduleId ?? null,
    topic: job?.topic ?? null,
    saveRate: saveRate(row.views, row.saves),
    capturedAt: row.capturedAt.toISOString(),
  };
}

function rollupByKey(
  rows: AnalystAggregatePost[],
  keyOf: (r: AnalystAggregatePost) => string | null,
): Array<{
  key: string;
  views: number;
  saves: number;
  shares: number;
  count: number;
}> {
  const map = new Map<
    string,
    { views: number; saves: number; shares: number; count: number }
  >();
  for (const r of rows) {
    const key = keyOf(r);
    if (!key) continue;
    const cur = map.get(key) ?? { views: 0, saves: 0, shares: 0, count: 0 };
    cur.views += r.views;
    cur.saves += r.saves;
    cur.shares += r.shares;
    cur.count += 1;
    map.set(key, cur);
  }
  return [...map.entries()]
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.views - a.views);
}

export type LoadAggregatesOptions = {
  windowDays?: number;
  now?: Date;
};

/**
 * Load KPI + ranked posts for the analyst prompt / mock path.
 */
export async function loadAnalystAggregates(
  options: LoadAggregatesOptions = {},
): Promise<AnalystAggregatesPayload> {
  const windowDays = options.windowDays ?? DEFAULT_WINDOW_DAYS;
  const now = options.now ?? new Date();
  const since = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

  const repo = await getAnalyticsRepository();
  const [kpi, latest, jobs] = await Promise.all([
    repo.aggregateForKpi(since),
    repo.listLatest(LIST_LIMIT),
    repo.listPublishedJobs(),
  ]);

  const jobById = new Map(jobs.map((j) => [j.id, j]));
  const inWindow = latest.filter((r) => r.capturedAt >= since);
  const posts = inWindow.map((r) => toAggregatePost(r, jobById));

  const bySaves = [...posts].sort((a, b) => b.saves - a.saves);
  const byViews = [...posts].sort((a, b) => b.views - a.views);
  const bySaveRateAsc = [...posts]
    .filter((p) => p.views >= 10)
    .sort((a, b) => a.saveRate - b.saveRate);

  const platformRollup = rollupByKey(posts, (r) => r.platform);
  const moduleRollup = rollupByKey(posts, (r) => r.moduleId);

  return {
    generatedAt: now.toISOString(),
    windowDays,
    kpi: {
      views: kpi.views,
      saves: kpi.saves,
      shares: kpi.shares,
      snapshotCount: kpi.snapshotCount,
    },
    byPlatform: platformRollup.map(({ key, ...rest }) => ({
      platform: key,
      ...rest,
    })),
    byModule: moduleRollup.map(({ key, ...rest }) => ({
      moduleId: key,
      ...rest,
    })),
    topBySaves: bySaves.slice(0, 5),
    topByViews: byViews.slice(0, 5),
    lowestSaveRate: bySaveRateAsc.slice(0, 3),
  };
}
