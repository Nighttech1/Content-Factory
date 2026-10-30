import { NextResponse } from "next/server";

import { createJobWithMockStream } from "@/lib/jobs";
import {
  ModuleNotFoundError,
  runGenerateAndMaybeRender,
} from "@/lib/modules/run-module";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ moduleId: string }> };

/**
 * POST /api/modules/[moduleId]/generate
 * Body: { topic: string, options?: object, render?: boolean }
 * Mock-first — no HeyGen key / GPU / Redis required.
 * C-23: success JSON includes `jobId` and starts in-memory mock SSE timeline.
 */
export async function POST(
  req: Request,
  ctx: RouteCtx,
): Promise<Response> {
  const { moduleId } = await ctx.params;

  let body: {
    topic?: unknown;
    options?: Record<string, unknown>;
    render?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  if (!topic) {
    return NextResponse.json(
      { ok: false, error: "topic_required" },
      { status: 400 },
    );
  }

  const render = body.render === true;
  const options =
    body.options && typeof body.options === "object" && !Array.isArray(body.options)
      ? body.options
      : undefined;

  try {
    const result = await runGenerateAndMaybeRender(
      moduleId,
      topic,
      options,
      render,
    );
    // Register job + mock stream before response so EventSource is not empty.
    const jobId = createJobWithMockStream();
    return NextResponse.json({
      ok: true,
      moduleId,
      jobId,
      draft: result.draft,
      ...(result.render ? { render: result.render } : {}),
    });
  } catch (err) {
    if (err instanceof ModuleNotFoundError) {
      return NextResponse.json(
        { ok: false, error: "module_not_found", moduleId: err.moduleId },
        { status: 404 },
      );
    }
    const message = err instanceof Error ? err.message : "generate_failed";
    // eslint-disable-next-line no-console
    console.error(`[api/modules/${moduleId}/generate]`, message);
    return NextResponse.json(
      { ok: false, error: "generate_failed" },
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
    hint: "POST { topic, options?, render? } — mock-first draft (+ optional render).",
  });
}
