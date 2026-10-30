import { NextResponse } from "next/server";

import {
  ModuleNotFoundError,
  runRenderAsset,
} from "@/lib/modules/run-module";
import type { DraftOutput } from "@/types/module";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ moduleId: string }> };

function isDraftOutput(v: unknown): v is DraftOutput {
  if (!v || typeof v !== "object") return false;
  const d = v as Record<string, unknown>;
  return (
    typeof d.draftId === "string" &&
    typeof d.moduleId === "string" &&
    typeof d.topic === "string" &&
    Array.isArray(d.elements)
  );
}

/**
 * POST /api/modules/[moduleId]/render
 * Body: { draft: DraftOutput }
 */
export async function POST(
  req: Request,
  ctx: RouteCtx,
): Promise<Response> {
  const { moduleId } = await ctx.params;

  let body: { draft?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!isDraftOutput(body.draft)) {
    return NextResponse.json(
      { ok: false, error: "draft_required" },
      { status: 400 },
    );
  }

  try {
    const render = await runRenderAsset(moduleId, body.draft);
    return NextResponse.json({ ok: true, moduleId, render });
  } catch (err) {
    if (err instanceof ModuleNotFoundError) {
      return NextResponse.json(
        { ok: false, error: "module_not_found", moduleId: err.moduleId },
        { status: 404 },
      );
    }
    const message = err instanceof Error ? err.message : "render_failed";
    // eslint-disable-next-line no-console
    console.error(`[api/modules/${moduleId}/render]`, message);
    return NextResponse.json(
      { ok: false, error: "render_failed" },
      { status: 500 },
    );
  }
}

export async function GET(
  _req: Request,
  ctx: RouteCtx,
): Promise<Response> {
  const { moduleId } = await ctx.params;
  return NextResponse.json({
    ok: true,
    moduleId,
    hint: "POST { draft } — mock-first asset render.",
  });
}
