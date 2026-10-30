/**
 * GET /api/intake/sheet/rows?mode=meetings|useful&pickable=1
 * Default mode = useful (meetings only when explicitly requested).
 */

import { NextResponse } from "next/server";

import { DEFAULT_SHEET_INTAKE_MODE, parseSheetModeOrDefault } from "@/lib/intake/sheet-config";
import { listNormalizedRows } from "@/lib/intake/sheet-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const mode = parseSheetModeOrDefault(
      url.searchParams.get("mode") ?? DEFAULT_SHEET_INTAKE_MODE,
    );
    const pickableOnly =
      url.searchParams.get("pickable") === "1" ||
      url.searchParams.get("pickable") === "true";
    const rows = await listNormalizedRows(mode, { pickableOnly });
    return NextResponse.json({
      ok: true,
      mode,
      rows,
      count: rows.length,
      pickableCount: rows.filter((r) => r.pickable).length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "list_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/intake/sheet/rows]", message);
    return NextResponse.json({ error: "list_failed", message }, { status: 500 });
  }
}
