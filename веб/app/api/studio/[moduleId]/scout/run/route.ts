import { NextResponse } from "next/server";

import { runScoutApify, type ScoutRunFilters } from "@/lib/studio/scout-run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Apify sync can take minutes — allow long serverless timeout when hosted. */
export const maxDuration = 300;

type RouteCtx = { params: Promise<{ moduleId: string }> };

/**
 * POST /api/studio/[moduleId]/scout/run
 * S52 — only Scout entrypoint that may call Apify.
 * Soft-fail JSON; never returns scraper token.
 */
export async function POST(req: Request, ctx: RouteCtx): Promise<Response> {
  const { moduleId } = await ctx.params;

  let body: ScoutRunFilters = {};
  try {
    const json: unknown = await req.json();
    if (json && typeof json === "object") {
      const o = json as Record<string, unknown>;
      body = {
        topic: typeof o.topic === "string" ? o.topic : undefined,
        minViews: typeof o.minViews === "number" ? o.minViews : undefined,
        minLikes: typeof o.minLikes === "number" ? o.minLikes : undefined,
        minVirality:
          typeof o.minVirality === "number" ? o.minVirality : undefined,
        lookbackDays:
          typeof o.lookbackDays === "number" ? o.lookbackDays : undefined,
      };
    }
  } catch {
    body = {};
  }

  const result = await runScoutApify(moduleId, body);

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        competitorsCount: 0,
      },
      { status: 200 },
    );
  }

  return NextResponse.json({
    ok: true,
    competitorsCount: result.competitorsCount,
    filteredOut: result.filteredOut,
    updatedAt: result.snapshot.updatedAt,
    topic: result.snapshot.topic ?? null,
  });
}
