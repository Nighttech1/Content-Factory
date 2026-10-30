/**
 * POST /api/intake/sheet/sync — CSV → local mirror normalize.
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import { syncSheetRows } from "@/lib/intake/sheet-client";
import type { SheetMode } from "@/lib/intake/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  try {
    await resolveActor(req);
    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }
    const mode =
      body.mode === "meetings" || body.mode === "useful"
        ? (body.mode as SheetMode)
        : undefined;
    const result = await syncSheetRows(mode);
    return NextResponse.json({
      ok: result.ok,
      modes: result.modes,
      mirrored: result.mirrored,
      pickable: result.pickable,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "sync_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/intake/sheet/sync]", message);
    return NextResponse.json({ error: "sync_failed", message }, { status: 500 });
  }
}
