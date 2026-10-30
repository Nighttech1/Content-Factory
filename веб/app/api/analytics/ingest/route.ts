import { NextResponse } from "next/server";

import { runAnalyticsIngest } from "@/lib/analytics/ingest-post-metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: Request): boolean {
  const secret = process.env.INGEST_SECRET?.trim();
  if (secret) {
    const header =
      req.headers.get("x-ingest-secret") ??
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    return header === secret;
  }
  // Dev-only open when no secret configured
  return process.env.NODE_ENV !== "production";
}

/**
 * Manual analytics ingest trigger (C-17 QA).
 * Auth: `x-ingest-secret` / Bearer == INGEST_SECRET, or NODE_ENV=development when unset.
 * Response never includes tokens.
 */
export async function POST(req: Request): Promise<Response> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await runAnalyticsIngest();
    return NextResponse.json({
      ok: true,
      storeKind: result.storeKind,
      modes: result.modes,
      targets: result.targets,
      written: result.written,
      snapshots: result.snapshots,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "ingest failed";
    // eslint-disable-next-line no-console
    console.error("[api/analytics/ingest]", message);
    return NextResponse.json({ ok: false, error: "ingest_failed" }, { status: 500 });
  }
}

export async function GET(): Promise<Response> {
  return NextResponse.json({
    ok: true,
    hint: "POST to run ingest. Auth: x-ingest-secret or development mode.",
  });
}
