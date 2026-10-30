/**
 * PATCH /api/intake/sheet/rows/:key/status
 * Body: { mode, status, topic? } — local mirror + optional Sheet write-back.
 */

import { NextResponse } from "next/server";

import { appendAgentLog } from "@/lib/agents/agent-run-log-store";
import { resolveActor } from "@/lib/db/actor";
import { updateSheetRowStatus } from "@/lib/intake/sheet-client";
import type { SheetMode } from "@/lib/intake/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ key: string }> };

export async function PATCH(req: Request, ctx: Ctx): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { key: rawKey } = await ctx.params;
    const sheetRowKey = decodeURIComponent(rawKey || "").trim();
    if (!sheetRowKey) {
      return NextResponse.json({ error: "key_required" }, { status: 400 });
    }

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const mode =
      body.mode === "meetings" || body.mode === "useful"
        ? (body.mode as SheetMode)
        : null;
    const status = typeof body.status === "string" ? body.status.trim() : "";
    if (!mode || !status) {
      return NextResponse.json(
        { error: "mode_and_status_required" },
        { status: 400 },
      );
    }

    const result = await updateSheetRowStatus({
      mode,
      sheetRowKey,
      status,
      topic: typeof body.topic === "string" ? body.topic : undefined,
    });

    if (result.writeSkipped) {
      await appendAgentLog({
        userId: actor.userId,
        agentId: "scout",
        agentRole: "intake",
        level: "red",
        message: `sheet write skipped: ${result.writeSkippedReason}`,
        meta: { sheetRowKey, mode, status },
      });
    }

    return NextResponse.json({
      ok: result.ok,
      sheetRowKey,
      mode,
      status,
      mirrored: result.mirrored,
      sheetWritten: result.sheetWritten,
      writeSkipped: result.writeSkipped,
      writeSkippedReason: result.writeSkippedReason,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "status_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/intake/sheet/rows/status]", message);
    return NextResponse.json(
      { error: "status_failed", message },
      { status: 500 },
    );
  }
}
