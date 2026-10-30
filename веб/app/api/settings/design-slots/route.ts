/**
 * C-s8-05 — GET/POST /api/settings/design-slots
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import {
  DesignLibraryFullError,
  listDesignSlots,
  upsertDesignSlot,
} from "@/lib/db/design-slots-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { slots, activeId } = await listDesignSlots(actor.userId);
    return NextResponse.json({
      slots,
      activeId,
      userId: actor.userId,
      max: 10,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "list_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/settings/design-slots] GET", message);
    return NextResponse.json({ error: "list_failed" }, { status: 500 });
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

    const slot = await upsertDesignSlot(actor.userId, {
      id: typeof body.id === "string" ? body.id : undefined,
      name: typeof body.name === "string" ? body.name : undefined,
      label: typeof body.label === "string" ? body.label : undefined,
      markdown: typeof body.markdown === "string" ? body.markdown : "",
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
      createdAt: typeof body.createdAt === "string" ? body.createdAt : undefined,
    });

    return NextResponse.json({ slot, ok: true });
  } catch (err) {
    if (err instanceof DesignLibraryFullError) {
      return NextResponse.json(
        { error: "design_library_full", max: 10 },
        { status: 409 },
      );
    }
    const code = (err as Error & { code?: string }).code;
    if (code === "forbidden") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "create_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/settings/design-slots] POST", message);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
