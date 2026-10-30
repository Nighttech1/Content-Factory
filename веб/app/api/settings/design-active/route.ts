/**
 * C-settings-design-md-carousel + C-s8-05 —
 * Active DESIGN.md for Brand Kit / draw.
 *
 * GET: Postgres active DesignSlot first, fallback data/local/design-active.json
 * POST: upsert/sync active slot in Postgres (+ JSON cache)
 * DELETE: clear JSON cache only (does not wipe design library)
 *
 * Soft-fail: never wipe client library; no secrets; no DDL.
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import {
  activateDesignSlot,
  listDesignSlots,
  resolveActiveDesignDual,
  syncActiveDesignCache,
  upsertDesignSlot,
} from "@/lib/db/design-slots-repository";
import {
  clearSyncedActiveDesign,
  writeSyncedActiveDesign,
} from "@/lib/settings/design-active-server";
import {
  ensurePresetTypographyScale,
  parseDesignPresetFile,
} from "@/lib/settings/design-preset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const resolved = await resolveActiveDesignDual({ userId: actor.userId });
    return NextResponse.json({
      markdown: resolved.markdown,
      name: resolved.name,
      updatedAt: resolved.updatedAt,
      presetFile: resolved.presetFile,
      source: resolved.source,
      activeId: resolved.activeId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "get_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/settings/design-active] GET", message);
    return NextResponse.json({
      markdown: "",
      name: null,
      updatedAt: null,
      presetFile: null,
      source: "empty" as const,
      activeId: null,
    });
  }
}

export async function POST(req: Request): Promise<Response> {
  let body: {
    markdown?: unknown;
    name?: unknown;
    presetFile?: unknown;
    id?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const markdown = typeof body.markdown === "string" ? body.markdown : "";
  const name = typeof body.name === "string" ? body.name : undefined;
  const parsedPreset = parseDesignPresetFile(body.presetFile);
  const presetFile = parsedPreset
    ? ensurePresetTypographyScale(parsedPreset)
    : null;
  const slotId = typeof body.id === "string" ? body.id.trim() : "";

  try {
    const actor = await resolveActor(req);

    // Prefer updating existing active / named slot in Postgres
    const { slots, activeId } = await listDesignSlots(actor.userId);
    const targetId =
      slotId ||
      activeId ||
      slots[0]?.id ||
      `design-active-${actor.userId}`;

    const slot = await upsertDesignSlot(actor.userId, {
      id: targetId,
      name: name ?? slots.find((s) => s.id === targetId)?.name ?? "Active design",
      markdown,
      presetFile: body.presetFile === null ? null : presetFile,
    });
    await activateDesignSlot({ userId: actor.userId, id: slot.id });
    await syncActiveDesignCache(slot);

    return NextResponse.json({
      ok: true,
      markdown: slot.markdown,
      name: slot.name ?? null,
      updatedAt: slot.updatedAt ?? slot.createdAt,
      presetFile: slot.presetFile ?? null,
      source: "postgres" as const,
      activeId: slot.id,
    });
  } catch {
    // Soft-fail: keep legacy JSON write so draw path still works without DB
    const result = await writeSyncedActiveDesign({
      markdown,
      name,
      presetFile: body.presetFile === null ? null : presetFile,
    });
    if ("error" in result) {
      const status = result.error === "markdown_too_large" ? 413 : 400;
      return NextResponse.json({ ok: false, error: result.error }, { status });
    }
    return NextResponse.json({
      ok: true,
      markdown: result.markdown,
      name: result.name ?? null,
      updatedAt: result.updatedAt,
      presetFile: result.presetFile ?? null,
      source: "sync" as const,
      activeId: null,
    });
  }
}

export async function DELETE(): Promise<Response> {
  await clearSyncedActiveDesign();
  return NextResponse.json({ ok: true, cleared: true });
}
