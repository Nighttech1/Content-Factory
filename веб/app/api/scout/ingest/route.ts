/**
 * POST /api/scout/ingest — Scout (облако, через Apify MCP) пушит спарсенные посты.
 * Тело: { moduleId, ours?: ScoutPost[], competitors?: ScoutPost[] }
 * ScoutPost: { id?, title, thumbUrl?, username?, followers?, likes?, views? }
 *
 * Auth: x-ingest-secret / Bearer == INGEST_SECRET (dev-open без секрета).
 */
import { NextResponse } from "next/server";

import {
  normalizeScoutPost,
  readScoutFeed,
  setScoutFeed,
  type ScoutPostInput,
} from "@/lib/studio/scout-feed-store";
import type { FeedPost } from "@/lib/studio/feed-types";

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
  return process.env.NODE_ENV !== "production";
}

function mapSide(raw: unknown, side: "ours" | "competitor"): FeedPost[] {
  if (!Array.isArray(raw)) return [];
  const out: FeedPost[] = [];
  for (const item of raw) {
    const post = normalizeScoutPost((item ?? {}) as ScoutPostInput, side);
    if (post) out.push(post);
  }
  return out;
}

export async function POST(req: Request): Promise<Response> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { moduleId?: unknown; ours?: unknown; competitors?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const moduleId =
    typeof body.moduleId === "string" ? body.moduleId.trim() : "";
  if (!moduleId) {
    return NextResponse.json(
      { error: "invalid_input", detail: "moduleId required" },
      { status: 422 },
    );
  }
  try {
    const ours = mapSide(body.ours, "ours");
    const competitors = mapSide(body.competitors, "competitor");
    const entry = await setScoutFeed(moduleId, { ours, competitors });
    return NextResponse.json({
      ok: true,
      moduleId,
      ours: entry.ours.length,
      competitors: entry.competitors.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "scout ingest failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/scout/ingest]", message);
    return NextResponse.json({ ok: false, error: "scout_ingest_failed" }, { status: 500 });
  }
}

export async function GET(req: Request): Promise<Response> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const moduleId = url.searchParams.get("moduleId")?.trim() ?? "";
  if (!moduleId) {
    return NextResponse.json({ error: "moduleId required" }, { status: 422 });
  }
  const entry = await readScoutFeed(moduleId);
  return NextResponse.json({ ok: true, moduleId, entry: entry ?? null });
}
