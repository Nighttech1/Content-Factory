/**
 * GET /api/intake/sheet/preflight — Sheet visibility (default useful-only).
 * Optional ?mode=meetings|useful — meetings only when explicitly requested.
 */

import { NextResponse } from "next/server";

import { parseSheetModeOrDefault } from "@/lib/intake/sheet-config";
import { runSheetPreflight } from "@/lib/intake/sheet-client";
import type { SheetMode } from "@/lib/intake/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const raw = url.searchParams.get("mode");
    // Unset → useful default. Explicit meetings|useful honored.
    const mode: SheetMode | undefined =
      raw === null || raw === ""
        ? undefined
        : parseSheetModeOrDefault(raw);
    const result = await runSheetPreflight(mode);
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "preflight_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/intake/sheet/preflight]", message);
    return NextResponse.json(
      { ok: false, error: "preflight_failed", message },
      { status: 500 },
    );
  }
}
