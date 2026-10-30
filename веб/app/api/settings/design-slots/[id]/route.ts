/**
 * C-s8-05 — PATCH/DELETE /api/settings/design-slots/[id]
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import {
  deleteDesignSlot,
  getDesignSlot,
  patchDesignSlot,
} from "@/lib/db/design-slots-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { id } = await ctx.params;
    const slot = await getDesignSlot({ userId: actor.userId, id });
    if (!slot) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ slot });
  } catch (err) {
    const message = err instanceof Error ? err.message : "get_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/settings/design-slots/[id]] GET", message);
    return NextResponse.json({ error: "get_failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: Ctx): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { id } = await ctx.params;
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const slot = await patchDesignSlot({
      userId: actor.userId,
      id,
      patch: {
        name: typeof body.name === "string" ? body.name : undefined,
        label: typeof body.label === "string" ? body.label : undefined,
        markdown:
          typeof body.markdown === "string" ? body.markdown : undefined,
        html:
          typeof body.html === "string" || body.html === null
            ? (body.html as string | null)
            : undefined,
        previewUrl:
          typeof body.previewUrl === "string" || body.previewUrl === null
            ? (body.previewUrl as string | null)
            : undefined,
        presetFile: body.presetFile,
        colors: body.colors,
        cssVarOverrides: body.cssVarOverrides,
        presetId: body.presetId,
        brandbook: body.brandbook,
        isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
        sortOrder:
          typeof body.sortOrder === "number" ? body.sortOrder : undefined,
      },
    });
    if (!slot) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ slot, ok: true });
  } catch (err) {
    const code = (err as Error & { code?: string }).code;
    if (code === "forbidden") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "patch_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/settings/design-slots/[id]] PATCH", message);
    return NextResponse.json({ error: "patch_failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: Ctx): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { id } = await ctx.params;
    const ok = await deleteDesignSlot({ userId: actor.userId, id });
    if (!ok) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, deleted: id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "delete_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/settings/design-slots/[id]] DELETE", message);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
