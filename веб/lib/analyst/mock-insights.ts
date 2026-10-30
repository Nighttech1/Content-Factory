/**
 * Deterministic mock insights from PostAnalytics aggregates (no LLM).
 * Always returns ≥3 cards with varied tones.
 */

import type { AnalystAggregatesPayload, AnalystInsight } from "./types";

function fmtPct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

function insufficientCards(generatedAt: string): AnalystInsight[] {
  const day = generatedAt.slice(0, 10);
  return [
    {
      id: "ins-mock-insufficient-green",
      tone: "green",
      badge: "NO LIFT YET",
      targetLabel: "Awaiting metrics",
      body: "PostAnalytics store has no usable snapshots yet. Wins will appear here after ingest (C-17) writes views/saves.",
      footer: `Insufficient metrics · ${day}`,
    },
    {
      id: "ins-mock-insufficient-blue",
      tone: "blue",
      badge: "MODULE SPLIT PENDING",
      targetLabel: "Module comparison",
      body: "Cannot segment carousel vs HeyGen vs cartoon until published jobs and snapshots are linked.",
      footer: `Insufficient metrics · ${day}`,
    },
    {
      id: "ins-mock-insufficient-terracotta",
      tone: "terracotta",
      badge: "NO NEGATIVE SIGNAL",
      targetLabel: "Risk scan",
      body: "Underperformance patterns are unavailable without aggregate volume. No invented platform API claims.",
      footer: `Insufficient metrics · ${day}`,
    },
  ];
}

/**
 * Build ≥3 deterministic insight cards from aggregates.
 * Pure function of payload numbers (stable ids for same shape).
 */
export function buildMockInsightsFromAggregates(
  agg: AnalystAggregatesPayload,
): AnalystInsight[] {
  const day = agg.generatedAt.slice(0, 10);

  if (agg.kpi.snapshotCount < 1 || agg.topBySaves.length < 1) {
    return insufficientCards(agg.generatedAt);
  }

  const topSave = agg.topBySaves[0]!;
  const topView = agg.topByViews[0] ?? topSave;
  const weak = agg.lowestSaveRate[0] ?? topSave;
  const topModule = agg.byModule[0];
  const topPlatform = agg.byPlatform[0];

  const cards: AnalystInsight[] = [
    {
      id: "ins-mock-saves-green",
      tone: "green",
      badge: `TOP SAVES ${fmtNum(topSave.saves)}`,
      targetLabel: topSave.moduleId
        ? `Module ${topSave.moduleId}`
        : `Post ${topSave.postId}`,
      body: `Highest saves: post ${topSave.postId} on ${topSave.platform} with ${fmtNum(topSave.saves)} saves (${fmtPct(topSave.saveRate)} save rate) from ${fmtNum(topSave.views)} views${topSave.topic ? ` — topic “${topSave.topic}”` : ""}.`,
      footer: `Derived from PostAnalytics · ${day}`,
    },
    {
      id: "ins-mock-views-blue",
      tone: "blue",
      badge: `REACH ${fmtNum(topView.views)}`,
      targetLabel: topView.moduleId
        ? `Module ${topView.moduleId}`
        : `Platform ${topView.platform}`,
      body: `Highest views: ${topView.postId} on ${topView.platform} reached ${fmtNum(topView.views)} views with ${fmtNum(topView.saves)} saves${topModule ? `. Leading module bucket: ${topModule.moduleId} (${fmtNum(topModule.views)} views across ${topModule.count} snapshots)` : ""}.`,
      footer: `Derived from PostAnalytics · ${day}`,
    },
    {
      id: "ins-mock-weak-terracotta",
      tone: "terracotta",
      badge: `LOW SAVE ${fmtPct(weak.saveRate)}`,
      targetLabel: weak.moduleId
        ? `Review ${weak.moduleId}`
        : `Review ${weak.platform}`,
      body: `Weakest save rate among ranked posts: ${weak.postId} on ${weak.platform} at ${fmtPct(weak.saveRate)} (${fmtNum(weak.saves)}/${fmtNum(weak.views)}). Treat as a negative learning signal — do not auto-change prod prompts.`,
      footer: `Derived from PostAnalytics · ${day}`,
    },
  ];

  if (topPlatform && agg.kpi.views > 0) {
    const share = topPlatform.views / agg.kpi.views;
    cards.push({
      id: "ins-mock-platform-gold",
      tone: "gold",
      badge: `${topPlatform.platform.toUpperCase()} ${fmtPct(share)}`,
      targetLabel: "Platform mix",
      body: `${topPlatform.platform} holds ${fmtPct(share)} of window views (${fmtNum(topPlatform.views)} / ${fmtNum(agg.kpi.views)}) with ${fmtNum(topPlatform.saves)} saves across ${topPlatform.count} snapshots.`,
      footer: `Derived from PostAnalytics · ${day}`,
    });
  } else {
    cards.push({
      id: "ins-mock-kpi-gold",
      tone: "gold",
      badge: `WINDOW ${fmtNum(agg.kpi.views)} VIEWS`,
      targetLabel: "KPI rollup",
      body: `L${agg.windowDays}D rollup: ${fmtNum(agg.kpi.views)} views, ${fmtNum(agg.kpi.saves)} saves, ${fmtNum(agg.kpi.shares)} shares across ${agg.kpi.snapshotCount} snapshots.`,
      footer: `Derived from PostAnalytics · ${day}`,
    });
  }

  return cards.slice(0, 6);
}
