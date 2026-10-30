/**
 * GET/POST /api/agents/logs — append/list for Team «Логи» tab.
 * GET ?agentId=&limit=  also returns errorFlags for RED perimeter.
 */

import { NextResponse } from "next/server";

import {
  appendAgentLog,
  listAgentErrorFlags,
  listAgentLogs,
  type AgentLogLevel,
} from "@/lib/agents/agent-run-log-store";
import { resolveActor } from "@/lib/db/actor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LEVELS = new Set(["info", "warn", "error", "red"]);

export async function GET(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const url = new URL(req.url);
    const agentId = url.searchParams.get("agentId");
    const levelRaw = url.searchParams.get("level");
    const level =
      levelRaw && LEVELS.has(levelRaw)
        ? (levelRaw as AgentLogLevel)
        : null;
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "100", 10);

    const logs = await listAgentLogs({
      userId: actor.userId,
      agentId: agentId?.trim() || null,
      level,
      limit: Number.isFinite(limit) ? limit : 100,
    });
    const errorFlags = await listAgentErrorFlags({ userId: actor.userId });

    return NextResponse.json({
      ok: true,
      logs,
      errorFlags,
      /** Convenience: any agent with last error/red → Frontend RED perimeter */
      hasAnyError: Object.values(errorFlags).some(Boolean),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "logs_list_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/agents/logs] GET", message);
    return NextResponse.json({ error: "logs_list_failed" }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const agentId =
      typeof body.agentId === "string" ? body.agentId.trim() : "";
    const message =
      typeof body.message === "string" ? body.message.trim() : "";
    const levelRaw =
      typeof body.level === "string" ? body.level.trim() : "info";
    if (!agentId || !message) {
      return NextResponse.json(
        { error: "agentId_and_message_required" },
        { status: 400 },
      );
    }
    const level: AgentLogLevel = LEVELS.has(levelRaw)
      ? (levelRaw as AgentLogLevel)
      : "info";

    const line = await appendAgentLog({
      userId: actor.userId,
      agentId,
      agentRole:
        typeof body.agentRole === "string" ? body.agentRole : undefined,
      jobId: typeof body.jobId === "string" ? body.jobId : undefined,
      level,
      message,
      meta:
        body.meta && typeof body.meta === "object" && !Array.isArray(body.meta)
          ? (body.meta as Record<string, unknown>)
          : undefined,
    });

    return NextResponse.json({ ok: true, log: line });
  } catch (err) {
    const message = err instanceof Error ? err.message : "logs_append_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/agents/logs] POST", message);
    return NextResponse.json({ error: "logs_append_failed" }, { status: 500 });
  }
}
