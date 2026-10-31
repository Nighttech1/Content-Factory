/**
 * POST /api/content/ingest — приём готовой единицы контента от агентов фабрики.
 *
 * Поток (Вариант 4, прямой push): облачный агент после апрува человека в чате
 * шлёт сюда готовую карусель/рилс/статью → веб кладёт в стор «Опубликовано»
 * (ячейка дашборда). Назад к Claude ничего не звонит.
 *
 * Auth: заголовок `x-ingest-secret` ИЛИ `Authorization: Bearer <...>` == INGEST_SECRET.
 * Когда секрет не задан — открыто только вне production (dev). Ответ НЕ содержит секретов.
 *
 * Идемпотентность: повтор того же `id` перезаписывает единицу, не плодит дубли
 * (безопасно для ретраев агента при недоступном VPS).
 */

import { NextResponse } from "next/server";

import {
  normalizeIngest,
  readPublished,
  upsertPublished,
  type PublishedIngestInput,
} from "@/lib/content/published-store";

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

export async function POST(req: Request): Promise<Response> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: PublishedIngestInput;
  try {
    body = (await req.json()) as PublishedIngestInput;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const normalized = normalizeIngest(body);
  if (!normalized.ok) {
    return NextResponse.json({ error: "invalid_input", detail: normalized.error }, { status: 422 });
  }

  try {
    const all = await upsertPublished(normalized.unit);
    return NextResponse.json({
      ok: true,
      id: normalized.unit.id,
      type: normalized.unit.type,
      status: normalized.unit.status,
      count: all.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "ingest failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/content/ingest]", message);
    return NextResponse.json({ ok: false, error: "ingest_failed" }, { status: 500 });
  }
}

export async function GET(req: Request): Promise<Response> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    let items = await readPublished();
    if (type) items = items.filter((u) => u.type === type);
    return NextResponse.json({ ok: true, count: items.length, items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "list failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/content/ingest] GET", message);
    return NextResponse.json({ ok: false, error: "list_failed" }, { status: 500 });
  }
}
