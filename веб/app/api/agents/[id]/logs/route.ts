/**
 * GET /api/agents/:id/logs — logs for one agent + RED error flag.
 */

import { NextResponse } from "next/server";

import {
  getAgentErrorFlag,
  listAgentLogs,
} from "@/lib/agents/agent-run-log-store";
import { resolveActor } from "@/lib/db/actor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { id } = await ctx.params;
    const agentId = decodeURIComponent(id || "").trim();
    if (!agentId) {
      return NextResponse.json({ error: "id_required" }, { status: 400 });
    }

    const url = new URL(req.url);
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "100", 10);

    const logs = await listAgentLogs({
      userId: actor.userId,
      agentId,
      limit: Number.isFinite(limit) ? limit : 100,
    });
    const flag = await getAgentErrorFlag({
      userId: actor.userId,
      agentId,
    });

    return NextResponse.json({
      ok: true,
      agentId,
      logs,
      hasError: flag.hasError,
      lastError: flag.lastError,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "logs_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/agents/id/logs]", message);
    return NextResponse.json({ error: "logs_failed" }, { status: 500 });
  }
}
