import { NextResponse } from "next/server";

import {
  isInsightsRefreshAuthorized,
  resolveAnalystInsights,
} from "@/lib/analytics/resolve-insights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/analytics/insights
 * → { cycleLabel, insights, source: "llm"|"mock"|"cache", generatedAt }
 *
 * Optional `?refresh=1` re-runs Analyst (auth: secret in prod; open in development).
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const refresh =
    url.searchParams.get("refresh") === "1" ||
    url.searchParams.get("refresh") === "true";

  if (refresh && !isInsightsRefreshAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const forceMock =
      url.searchParams.get("forceMock") === "1" ||
      url.searchParams.get("forceMock") === "true";

    const body = await resolveAnalystInsights({
      refresh,
      forceMock: forceMock || undefined,
      signal: req.signal,
    });

    return NextResponse.json(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "insights_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/analytics/insights]", message);
    return NextResponse.json(
      { error: "insights_failed" },
      { status: 500 },
    );
  }
}
