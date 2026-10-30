/**
 * GET/POST /api/marketing/search — Marketing Director app_search (read-only).
 * Soft-fail empty JSON when no hits / no DB.
 */

import { NextResponse } from "next/server";
import { runMarketingSearch } from "@/lib/marketing/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q") ?? url.searchParams.get("query") ?? "";
  const limitRaw = Number(url.searchParams.get("limit") ?? "12");
  const limit = Number.isFinite(limitRaw) ? limitRaw : 12;
  const result = await runMarketingSearch(query, limit);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  let body: { query?: string; q?: string; limit?: number } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }
  const query = (body.query ?? body.q ?? "").trim();
  const limit =
    typeof body.limit === "number" && Number.isFinite(body.limit)
      ? body.limit
      : 12;
  const result = await runMarketingSearch(query, limit);
  return NextResponse.json(result);
}
