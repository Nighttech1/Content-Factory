/**
 * Sprint 8 C-s8-05 — DesignSlot library ≤10 + active.
 */

import {
  type DesignSlotApi,
  buildDesignBrandbook,
  designSlotToApi,
} from "@/lib/db/sprint8-mappers";

/** Cap ≤10 per user (Architect D-s8-05-cap). Keep local to avoid client-store imports. */
const DESIGN_LIBRARY_MAX = 10;
import { resolveSprint8Db } from "@/lib/db/sprint8-db";
import {
  newFallbackId,
  readSprint8Fallback,
  writeSprint8Fallback,
  type FallbackDesignSlotRecord,
} from "@/lib/db/sprint8-fallback";
import {
  writeSyncedActiveDesign,
  type ActiveDesignStore,
} from "@/lib/settings/design-active-server";
import { parseDesignPresetFile } from "@/lib/settings/design-preset";

export type DesignSlotUpsertInput = {
  id?: string;
  name?: string;
  label?: string;
  markdown?: string;
  html?: string | null;
  previewUrl?: string | null;
  presetFile?: unknown;
  colors?: unknown;
  cssVarOverrides?: unknown;
  presetId?: unknown;
  brandbook?: unknown;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
};

export class DesignLibraryFullError extends Error {
  code = "design_library_full" as const;
  constructor() {
    super("design_library_full");
    this.name = "DesignLibraryFullError";
  }
}

export async function listDesignSlots(userId: string): Promise<{
  slots: DesignSlotApi[];
  activeId: string | null;
}> {
  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const rows = await prisma.designSlot.findMany({
      where: { userId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    const slots = rows.map(designSlotToApi);
    const active = rows.find((r) => r.isActive);
    return { slots, activeId: active?.id ?? slots[0]?.id ?? null };
  }
  const store = await readSprint8Fallback();
  const rows = store.designSlots
    .filter((s) => s.userId === userId)
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt),
    );
  const slots = rows.map(designSlotToApi);
  const active = rows.find((r) => r.isActive);
  return { slots, activeId: active?.id ?? slots[0]?.id ?? null };
}

export async function getDesignSlot(opts: {
  userId: string;
  id: string;
}): Promise<DesignSlotApi | null> {
  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const row = await prisma.designSlot.findFirst({
      where: { id: opts.id, userId: opts.userId },
    });
    return row ? designSlotToApi(row) : null;
  }
  const store = await readSprint8Fallback();
  const row = store.designSlots.find(
    (s) => s.id === opts.id && s.userId === opts.userId,
  );
  return row ? designSlotToApi(row) : null;
}

export async function countDesignSlots(userId: string): Promise<number> {
  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    return prisma.designSlot.count({ where: { userId } });
  }
  const store = await readSprint8Fallback();
  return store.designSlots.filter((s) => s.userId === userId).length;
}

export async function upsertDesignSlot(
  userId: string,
  input: DesignSlotUpsertInput,
  opts?: { allowCreate?: boolean },
): Promise<DesignSlotApi> {
  const allowCreate = opts?.allowCreate !== false;
  const id =
    typeof input.id === "string" && input.id.trim()
      ? input.id.trim()
      : newFallbackId("design");
  const now = new Date();
  const nowIso = now.toISOString();
  const label =
    (typeof input.label === "string" && input.label.trim()
      ? input.label.trim()
      : null) ||
    (typeof input.name === "string" && input.name.trim()
      ? input.name.trim()
      : null) ||
    "DESIGN.md";
  const markdown =
    typeof input.markdown === "string" ? input.markdown : "";
  const brandbook = buildDesignBrandbook(input);
  const html =
    typeof input.html === "string"
      ? input.html
      : input.html === null
        ? null
        : undefined;
  const previewUrl =
    typeof input.previewUrl === "string"
      ? input.previewUrl
      : input.previewUrl === null
        ? null
        : undefined;
  const sortOrder =
    typeof input.sortOrder === "number" && Number.isFinite(input.sortOrder)
      ? Math.floor(input.sortOrder)
      : undefined;

  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const existing = await prisma.designSlot.findUnique({ where: { id } });
    if (existing && existing.userId !== userId) {
      const err = new Error("forbidden");
      (err as Error & { code: string }).code = "forbidden";
      throw err;
    }
    let createSortOrder = sortOrder ?? 0;
    if (!existing) {
      if (!allowCreate) {
        const err = new Error("not_found");
        (err as Error & { code: string }).code = "not_found";
        throw err;
      }
      const count = await prisma.designSlot.count({ where: { userId } });
      if (count >= DESIGN_LIBRARY_MAX) throw new DesignLibraryFullError();
      createSortOrder = sortOrder ?? count;
    }

    const createdAt =
      input.createdAt && Number.isFinite(Date.parse(input.createdAt))
        ? new Date(input.createdAt)
        : existing?.createdAt ?? now;

    const row = await prisma.designSlot.upsert({
      where: { id },
      create: {
        id,
        userId,
        label,
        markdown,
        html: html ?? null,
        previewUrl: previewUrl ?? null,
        brandbook: brandbook as object | undefined,
        isActive: Boolean(input.isActive),
        sortOrder: createSortOrder,
        createdAt,
        updatedAt: now,
      },
      update: {
        label,
        markdown,
        ...(html !== undefined ? { html } : {}),
        ...(previewUrl !== undefined ? { previewUrl } : {}),
        ...(brandbook !== null ? { brandbook: brandbook as object } : {}),
        ...(typeof input.isActive === "boolean"
          ? { isActive: input.isActive }
          : {}),
        ...(sortOrder !== undefined ? { sortOrder } : {}),
        updatedAt: now,
      },
    });
    return designSlotToApi(row);
  }

  const store = await readSprint8Fallback();
  const idx = store.designSlots.findIndex((s) => s.id === id);
  if (idx >= 0 && store.designSlots[idx]!.userId !== userId) {
    const err = new Error("forbidden");
    (err as Error & { code: string }).code = "forbidden";
    throw err;
  }
  if (idx < 0) {
    if (!allowCreate) {
      const err = new Error("not_found");
      (err as Error & { code: string }).code = "not_found";
      throw err;
    }
    const count = store.designSlots.filter((s) => s.userId === userId).length;
    if (count >= DESIGN_LIBRARY_MAX) throw new DesignLibraryFullError();
  }
  const prev = idx >= 0 ? store.designSlots[idx]! : null;
  const row: FallbackDesignSlotRecord = {
    id,
    userId,
    label,
    markdown,
    html: html !== undefined ? html : (prev?.html ?? null),
    previewUrl:
      previewUrl !== undefined ? previewUrl : (prev?.previewUrl ?? null),
    brandbook: brandbook ?? prev?.brandbook ?? null,
    isActive:
      typeof input.isActive === "boolean"
        ? input.isActive
        : (prev?.isActive ?? false),
    sortOrder: sortOrder ?? prev?.sortOrder ?? 0,
    createdAt:
      input.createdAt && Number.isFinite(Date.parse(input.createdAt))
        ? input.createdAt
        : (prev?.createdAt ?? nowIso),
    updatedAt: nowIso,
  };
  if (idx >= 0) store.designSlots[idx] = row;
  else store.designSlots.push(row);
  await writeSprint8Fallback(store);
  return designSlotToApi(row);
}

export async function patchDesignSlot(opts: {
  userId: string;
  id: string;
  patch: DesignSlotUpsertInput;
}): Promise<DesignSlotApi | null> {
  const existing = await getDesignSlot({ userId: opts.userId, id: opts.id });
  if (!existing) return null;
  return upsertDesignSlot(
    opts.userId,
    {
      id: opts.id,
      name: opts.patch.name ?? existing.name,
      markdown: opts.patch.markdown ?? existing.markdown,
      html:
        opts.patch.html !== undefined ? opts.patch.html : existing.html,
      previewUrl:
        opts.patch.previewUrl !== undefined
          ? opts.patch.previewUrl
          : existing.previewUrl,
      presetFile:
        opts.patch.presetFile !== undefined
          ? opts.patch.presetFile
          : existing.presetFile,
      colors:
        opts.patch.colors !== undefined ? opts.patch.colors : existing.colors,
      cssVarOverrides:
        opts.patch.cssVarOverrides !== undefined
          ? opts.patch.cssVarOverrides
          : existing.cssVarOverrides,
      presetId:
        opts.patch.presetId !== undefined
          ? opts.patch.presetId
          : existing.presetId,
      brandbook: opts.patch.brandbook,
      isActive: opts.patch.isActive,
      sortOrder: opts.patch.sortOrder,
      createdAt: existing.createdAt,
    },
    { allowCreate: false },
  );
}

export async function deleteDesignSlot(opts: {
  userId: string;
  id: string;
}): Promise<boolean> {
  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const row = await prisma.designSlot.findFirst({
      where: { id: opts.id, userId: opts.userId },
    });
    if (!row) return false;
    await prisma.designSlot.delete({ where: { id: opts.id } });
    return true;
  }
  const store = await readSprint8Fallback();
  const before = store.designSlots.length;
  store.designSlots = store.designSlots.filter(
    (s) => !(s.id === opts.id && s.userId === opts.userId),
  );
  if (store.designSlots.length === before) return false;
  await writeSprint8Fallback(store);
  return true;
}

/**
 * Atomically set one active slot; unset others for user.
 * Also writes JSON cache (design-active.json) for dual-read transition.
 */
export async function activateDesignSlot(opts: {
  userId: string;
  id: string;
}): Promise<DesignSlotApi | null> {
  const slot = await getDesignSlot({ userId: opts.userId, id: opts.id });
  if (!slot) return null;

  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    await prisma.$transaction([
      prisma.designSlot.updateMany({
        where: { userId: opts.userId, isActive: true },
        data: { isActive: false },
      }),
      prisma.designSlot.update({
        where: { id: opts.id },
        data: { isActive: true, updatedAt: new Date() },
      }),
    ]);
  } else {
    const store = await readSprint8Fallback();
    for (const s of store.designSlots) {
      if (s.userId !== opts.userId) continue;
      s.isActive = s.id === opts.id;
      if (s.id === opts.id) s.updatedAt = new Date().toISOString();
    }
    await writeSprint8Fallback(store);
  }

  const active = await getDesignSlot({ userId: opts.userId, id: opts.id });
  if (active) {
    await syncActiveDesignCache(active);
  }
  return active;
}

export async function getActiveDesignSlot(
  userId: string,
): Promise<DesignSlotApi | null> {
  const { slots, activeId } = await listDesignSlots(userId);
  if (!activeId) return null;
  return slots.find((s) => s.id === activeId) ?? null;
}

/** Write optional JSON cache used by legacy draw path. */
export async function syncActiveDesignCache(
  slot: DesignSlotApi,
): Promise<ActiveDesignStore | { error: string } | null> {
  if (!slot.markdown?.trim()) return null;
  const presetFile = parseDesignPresetFile(slot.presetFile);
  return writeSyncedActiveDesign({
    markdown: slot.markdown,
    name: slot.name,
    presetFile: presetFile ?? null,
  });
}

/**
 * Resolve active design for draw: Postgres first, then JSON file fallback.
 */
export async function resolveActiveDesignDual(opts: {
  userId: string;
}): Promise<{
  markdown: string;
  name: string | null;
  updatedAt: string | null;
  presetFile: unknown | null;
  source: "postgres" | "sync" | "empty";
  activeId: string | null;
}> {
  const active = await getActiveDesignSlot(opts.userId);
  if (active?.markdown?.trim()) {
    return {
      markdown: active.markdown,
      name: active.name ?? null,
      updatedAt: active.updatedAt ?? active.createdAt,
      presetFile: active.presetFile ?? null,
      source: "postgres",
      activeId: active.id,
    };
  }

  const { readSyncedActiveDesign } = await import(
    "@/lib/settings/design-active-server"
  );
  const synced = await readSyncedActiveDesign();
  if (synced) {
    return {
      markdown: synced.markdown,
      name: synced.name ?? null,
      updatedAt: synced.updatedAt,
      presetFile: synced.presetFile ?? null,
      source: "sync",
      activeId: null,
    };
  }

  return {
    markdown: "",
    name: null,
    updatedAt: null,
    presetFile: null,
    source: "empty",
    activeId: null,
  };
}
