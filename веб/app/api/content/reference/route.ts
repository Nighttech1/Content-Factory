/**
 * POST /api/content/reference — владелец через агента присылает карусель-образец.
 * Образец показывается ПЕРВЫМ в колонке «Конкуренты» на экране Карусели.
 *
 * Auth: x-ingest-secret / Bearer == INGEST_SECRET (dev-open без секрета).
 * Идемпотентно по id. Ответ без секретов.
 */
import { NextResponse } from "next/server";

import {
  addCarouselReference,
  normalizeReference,
  readCarouselReferences,
  type ReferenceInput,
} from "@/lib/studio/carousel-references";

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

export async function POST(req: Request): Promise<Response> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: ReferenceInput;
  try {
    body = (await req.json()) as ReferenceInput;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const post = normalizeReference(body);
  if (!post) {
    return NextResponse.json(
      { error: "invalid_input", detail: "title or thumbUrl required" },
      { status: 422 },
    );
  }
  try {
    const all = await addCarouselReference(post);
    return NextResponse.json({ ok: true, id: post.id, count: all.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "reference failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/content/reference]", message);
    return NextResponse.json({ ok: false, error: "reference_failed" }, { status: 500 });
  }
}

export async function GET(req: Request): Promise<Response> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const items = await readCarouselReferences();
  return NextResponse.json({ ok: true, count: items.length, items });
}
