/**
 * GET/PUT /api/settings/brand — Brand fields + logo ref for placeholders.
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import {
  getBrandSettings,
  putBrandSettings,
} from "@/lib/settings/brand-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const brand = await getBrandSettings(actor.userId);
    return NextResponse.json({ ok: true, brand });
  } catch (err) {
    const message = err instanceof Error ? err.message : "brand_get_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/settings/brand] GET", message);
    return NextResponse.json({ error: "brand_get_failed" }, { status: 500 });
  }
}

export async function PUT(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    if (
      body.brandName !== undefined &&
      (typeof body.brandName !== "string" || !body.brandName.trim())
    ) {
      return NextResponse.json({ error: "brandName_required" }, { status: 400 });
    }

    const brand = await putBrandSettings(actor.userId, {
      brandName:
        typeof body.brandName === "string" ? body.brandName : undefined,
      logoRef: typeof body.logoRef === "string" ? body.logoRef : undefined,
      tagline: typeof body.tagline === "string" ? body.tagline : undefined,
      extras:
        body.extras && typeof body.extras === "object" && !Array.isArray(body.extras)
          ? (body.extras as Record<string, string>)
          : undefined,
    });

    return NextResponse.json({ ok: true, brand });
  } catch (err) {
    const message = err instanceof Error ? err.message : "brand_put_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/settings/brand] PUT", message);
    return NextResponse.json({ error: "brand_put_failed" }, { status: 500 });
  }
}
