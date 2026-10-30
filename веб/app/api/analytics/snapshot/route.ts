import { NextResponse } from "next/server";

import { buildSnapshotFromAggregates, aggregateForAnalyst } from "@/lib/analytics/aggregate-for-analyst";
import { resolveAnalystInsights } from "@/lib/analytics/resolve-insights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/analytics/snapshot
 * KPIs + retention + insights. Thin aggregates → mock gap-fill with `source` / `filledFromMock`.
 */
export async function GET(req: Request): Promise<Response> {
  try {
    const [aggregates, insights] = await Promise.all([
      aggregateForAnalyst(),
      resolveAnalystInsights({ signal: req.signal }),
    ]);

    const body = buildSnapshotFromAggregates({
      aggregates,
      insights: insights.insights,
      cycleLabel: insights.cycleLabel,
      insightsSource: insights.source,
    });

    return NextResponse.json(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "snapshot_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/analytics/snapshot]", message);
    return NextResponse.json(
      { error: "snapshot_failed" },
      { status: 500 },
    );
  }
}
