/**
 * Backend aggregates helper for Analyst / snapshot API (C-18).
 * Reuses AI Bridge `loadAnalystAggregates` — no Prisma in route handlers.
 */

import {
  loadAnalystAggregates,
  type AnalystAggregatesPayload,
} from "@/lib/analyst";
import {
  ANALYTICS_SNAPSHOT,
  type AnalyticsSnapshot,
  type KpiCard,
  type RetentionSeries,
} from "@/lib/analytics-mock";

export type AggregateForAnalystOptions = {
  windowDays?: number;
  now?: Date;
};

export type SnapshotSource = "live" | "mixed" | "mock";

export type AnalyticsSnapshotApiResponse = {
  cycleLabel: string;
  versionLabel: string;
  lastSyncedAgo: string;
  kpis: KpiCard[];
  retention: RetentionSeries[];
  insights: AnalyticsSnapshot["insights"];
  source: SnapshotSource;
  /** Which sections were filled from mock seed when live data thin. */
  filledFromMock: Array<"kpis" | "retention" | "insights">;
  generatedAt: string;
};

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

function formatPct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

function relativeAgo(iso: string, now: Date): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "just now";
  const sec = Math.max(0, Math.floor((now.getTime() - t) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

/**
 * Load PostAnalytics rollups for Analyst / snapshot (repository via AI Bridge loader).
 */
export async function aggregateForAnalyst(
  options: AggregateForAnalystOptions = {},
): Promise<AnalystAggregatesPayload> {
  return loadAnalystAggregates({
    windowDays: options.windowDays,
    now: options.now,
  });
}

function buildLiveKpis(agg: AnalystAggregatesPayload): KpiCard[] | null {
  if (agg.kpi.snapshotCount < 1) return null;

  const saveRate =
    agg.kpi.views > 0 ? agg.kpi.saves / agg.kpi.views : 0;
  const seed = ANALYTICS_SNAPSHOT.kpis;

  return [
    {
      ...seed[0],
      id: "views",
      value: formatCompact(agg.kpi.views),
      footnote: `${agg.kpi.snapshotCount} snapshots · L${agg.windowDays}D`,
      badge: `L${agg.windowDays}D`,
    },
    {
      ...seed[1],
      id: "save_rate",
      value: formatPct(saveRate),
      progressPct: Math.min(100, Math.round(saveRate * 1000) / 10),
      footnote: `${formatCompact(agg.kpi.saves)} saves / ${formatCompact(agg.kpi.views)} views`,
    },
    {
      ...seed[2],
      // Followers / yield not in PostAnalytics — keep seed with honesty note.
      footnote: "Yield not in PostAnalytics — seed gap fill",
    },
    {
      ...seed[3],
      footnote: "Agent health not derived from PostAnalytics — seed gap fill",
    },
  ];
}

function buildLiveRetention(
  agg: AnalystAggregatesPayload,
): RetentionSeries[] | null {
  // Retention curves live on snapshots but are not rolled up yet —
  // return null so caller fills from mock with source flag.
  void agg;
  return null;
}

/**
 * Build AnalyticsSnapshot-shaped payload from aggregates + insights.
 * Thin / missing sections filled from ANALYTICS_SNAPSHOT with `filledFromMock`.
 */
export function buildSnapshotFromAggregates(input: {
  aggregates: AnalystAggregatesPayload;
  insights: AnalyticsSnapshot["insights"];
  cycleLabel: string;
  insightsSource: "llm" | "mock" | "cache";
  now?: Date;
}): AnalyticsSnapshotApiResponse {
  const now = input.now ?? new Date();
  const filledFromMock: AnalyticsSnapshotApiResponse["filledFromMock"] = [];

  const liveKpis = buildLiveKpis(input.aggregates);
  const kpis = liveKpis ?? ANALYTICS_SNAPSHOT.kpis;
  // Live path still gap-fills conversion / agent-health cards from seed.
  filledFromMock.push("kpis");

  const liveRetention = buildLiveRetention(input.aggregates);
  const retention = liveRetention ?? ANALYTICS_SNAPSHOT.retention;
  if (!liveRetention) filledFromMock.push("retention");

  if (input.insightsSource === "mock" && input.aggregates.kpi.snapshotCount < 1) {
    filledFromMock.push("insights");
  }

  const uniqueGaps = [...new Set(filledFromMock)];
  const fullyMock =
    !liveKpis &&
    !liveRetention &&
    input.insightsSource === "mock" &&
    input.aggregates.kpi.snapshotCount < 1;
  const source: SnapshotSource = fullyMock
    ? "mock"
    : uniqueGaps.length === 0
      ? "live"
      : "mixed";

  return {
    cycleLabel: input.cycleLabel,
    versionLabel: ANALYTICS_SNAPSHOT.versionLabel,
    lastSyncedAgo: relativeAgo(input.aggregates.generatedAt, now),
    kpis,
    retention,
    insights: input.insights,
    source,
    filledFromMock: uniqueGaps,
    generatedAt: now.toISOString(),
  };
}

export { loadAnalystAggregates };
