import { NextResponse } from "next/server";

import {
  isInsightsRefreshAuthorized,
  resolveAnalystInsights,
} from "@/lib/analytics/resolve-insights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/analytics/insights/refresh
 * Re-run Analyst and refresh JSON cache.
 * Auth: x-analyst-refresh-secret / Bearer == ANALYST_REFRESH_SECRET|INGEST_SECRET,
 * or NODE_ENV=development when unset.
 */
export async function POST(req: Request): Promise<Response> {
  if (!isInsightsRefreshAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    let forceMock = false;
    try {
      const json = (await req.json()) as { forceMock?: boolean };
      forceMock = Boolean(json?.forceMock);
    } catch {
      // empty body OK
    }

    const body = await resolveAnalystInsights({
      refresh: true,
      forceMock: forceMock || undefined,
      signal: req.signal,
    });

    return NextResponse.json({ ok: true, ...body });
  } catch (err) {
    const message = err instanceof Error ? err.message : "refresh_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/analytics/insights/refresh]", message);
    return NextResponse.json(
      { ok: false, error: "refresh_failed" },
      { status: 500 },
    );
  }
}

export async function GET(): Promise<Response> {
  return NextResponse.json({
    ok: true,
    hint: "POST to re-run Analyst. Auth: x-analyst-refresh-secret or development mode.",
  });
}
