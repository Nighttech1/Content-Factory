/**
 * Thin client for Analytics / Analyst feed (C-18 Frontend).
 * Browser-only fetch — no Prisma, no worker imports.
 */

import type {
  AnalystInsight,
  InsightTone,
  KpiCard,
  RetentionSeries,
} from "@/lib/analytics-mock";

export type InsightsApiSource = "llm" | "mock" | "cache";

export type InsightsApiResponse = {
  cycleLabel: string;
  insights: AnalystInsight[];
  source: InsightsApiSource;
  generatedAt: string;
};

export type SnapshotApiSource = "live" | "mixed" | "mock";

export type SnapshotApiResponse = {
  cycleLabel: string;
  versionLabel: string;
  lastSyncedAgo: string;
  kpis: KpiCard[];
  retention: RetentionSeries[];
  insights: AnalystInsight[];
  source: SnapshotApiSource;
  filledFromMock: Array<"kpis" | "retention" | "insights">;
  generatedAt: string;
};

/** Alias used by analytics-store hydrate. */
export type AnalyticsSnapshotApiResponse = SnapshotApiResponse;

const INSIGHT_TONES: ReadonlySet<InsightTone> = new Set([
  "green",
  "blue",
  "gold",
  "terracotta",
]);

const INSIGHT_SOURCES: ReadonlySet<InsightsApiSource> = new Set([
  "llm",
  "mock",
  "cache",
]);

function isInsight(row: unknown): row is AnalystInsight {
  if (!row || typeof row !== "object") return false;
  const r = row as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.tone === "string" &&
    INSIGHT_TONES.has(r.tone as InsightTone) &&
    typeof r.badge === "string" &&
    typeof r.targetLabel === "string" &&
    typeof r.body === "string" &&
    typeof r.footer === "string"
  );
}

function parseInsightsBody(data: unknown): InsightsApiResponse | null {
  if (!data || typeof data !== "object") return null;
  const body = data as Record<string, unknown>;
  if (typeof body.cycleLabel !== "string") return null;
  if (typeof body.source !== "string" || !INSIGHT_SOURCES.has(body.source as InsightsApiSource)) {
    return null;
  }
  if (typeof body.generatedAt !== "string") return null;
  if (!Array.isArray(body.insights)) return null;
  const insights = body.insights.filter(isInsight);
  if (insights.length < 3) return null;
  return {
    cycleLabel: body.cycleLabel,
    insights,
    source: body.source as InsightsApiSource,
    generatedAt: body.generatedAt,
  };
}

function parseSnapshotBody(data: unknown): SnapshotApiResponse | null {
  if (!data || typeof data !== "object") return null;
  const body = data as Record<string, unknown>;
  if (typeof body.cycleLabel !== "string") return null;
  if (typeof body.versionLabel !== "string") return null;
  if (typeof body.lastSyncedAgo !== "string") return null;
  if (!Array.isArray(body.kpis) || body.kpis.length < 1) return null;
  if (!Array.isArray(body.retention) || body.retention.length < 1) return null;
  if (!Array.isArray(body.insights)) return null;
  if (typeof body.source !== "string") return null;
  if (typeof body.generatedAt !== "string") return null;

  const insights = body.insights.filter(isInsight);
  const filledFromMock = Array.isArray(body.filledFromMock)
    ? (body.filledFromMock.filter(
        (x): x is "kpis" | "retention" | "insights" =>
          x === "kpis" || x === "retention" || x === "insights",
      ) as Array<"kpis" | "retention" | "insights">)
    : [];

  return {
    cycleLabel: body.cycleLabel,
    versionLabel: body.versionLabel,
    lastSyncedAgo: body.lastSyncedAgo,
    kpis: body.kpis as KpiCard[],
    retention: body.retention as RetentionSeries[],
    insights,
    source: body.source as SnapshotApiSource,
    filledFromMock,
    generatedAt: body.generatedAt,
  };
}

/**
 * GET /api/analytics/insights — null on network/HTTP/parse/empty failure.
 */
export async function fetchAnalyticsInsights(
  signal?: AbortSignal,
): Promise<InsightsApiResponse | null> {
  try {
    const res = await fetch("/api/analytics/insights", {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal,
    });
    if (!res.ok) return null;
    return parseInsightsBody(await res.json());
  } catch {
    return null;
  }
}

/**
 * GET /api/analytics/snapshot — optional KPI/retention hydrate; null on failure.
 */
export async function fetchAnalyticsSnapshot(
  signal?: AbortSignal,
): Promise<SnapshotApiResponse | null> {
  try {
    const res = await fetch("/api/analytics/snapshot", {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal,
    });
    if (!res.ok) return null;
    return parseSnapshotBody(await res.json());
  } catch {
    return null;
  }
}
