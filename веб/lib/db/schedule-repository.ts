/**
 * Sprint 8 C-s8-04 — ScheduleSlot SoT.
 * HITL approve → SCHEDULED only. No Instagram/Telegram/social publish clients.
 */

import {
  type ScheduleSlotApi,
  scheduleStatusFromApi,
  scheduleSlotToApi,
} from "@/lib/db/sprint8-mappers";
import { resolveSprint8Db } from "@/lib/db/sprint8-db";
import {
  newFallbackId,
  readSprint8Fallback,
  writeSprint8Fallback,
  type FallbackScheduleSlotRecord,
} from "@/lib/db/sprint8-fallback";

export type ScheduleUpsertInput = {
  id?: string;
  postId: string;
  moduleId?: string;
  startsAt: string;
  platformId?: string | null;
  draftId?: string | null;
  contentJobId?: string | null;
  status?: unknown;
};

function parseStartsAt(raw: string): Date {
  const t = Date.parse(raw);
  if (!Number.isFinite(t)) {
    const err = new Error("invalid_startsAt");
    (err as Error & { code: string }).code = "invalid_startsAt";
    throw err;
  }
  return new Date(t);
}

async function resolveDraftId(
  userId: string,
  postId: string,
  explicit?: string | null,
): Promise<string | null> {
  if (typeof explicit === "string" && explicit.trim()) return explicit.trim();
  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const draft = await prisma.draft.findFirst({
      where: { id: postId, userId },
      select: { id: true },
    });
    return draft?.id ?? null;
  }
  const store = await readSprint8Fallback();
  const draft = store.drafts.find((d) => d.id === postId && d.userId === userId);
  return draft?.id ?? null;
}

export async function listScheduleSlots(opts: {
  userId: string;
  from?: string | null;
  to?: string | null;
}): Promise<ScheduleSlotApi[]> {
  const fromMs = opts.from ? Date.parse(opts.from) : NaN;
  const toMs = opts.to ? Date.parse(opts.to) : NaN;

  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const rows = await prisma.scheduleSlot.findMany({
      where: {
        userId: opts.userId,
        ...(Number.isFinite(fromMs) || Number.isFinite(toMs)
          ? {
              startsAt: {
                ...(Number.isFinite(fromMs) ? { gte: new Date(fromMs) } : {}),
                ...(Number.isFinite(toMs) ? { lte: new Date(toMs) } : {}),
              },
            }
          : {}),
      },
      orderBy: { startsAt: "asc" },
    });
    return rows.map(scheduleSlotToApi);
  }

  const store = await readSprint8Fallback();
  return store.scheduleSlots
    .filter((s) => {
      if (s.userId !== opts.userId) return false;
      const t = Date.parse(s.startsAt);
      if (Number.isFinite(fromMs) && t < fromMs) return false;
      if (Number.isFinite(toMs) && t > toMs) return false;
      return true;
    })
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map(scheduleSlotToApi);
}

export async function getScheduleSlot(opts: {
  userId: string;
  id: string;
}): Promise<ScheduleSlotApi | null> {
  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const row = await prisma.scheduleSlot.findFirst({
      where: { id: opts.id, userId: opts.userId },
    });
    return row ? scheduleSlotToApi(row) : null;
  }
  const store = await readSprint8Fallback();
  const row = store.scheduleSlots.find(
    (s) => s.id === opts.id && s.userId === opts.userId,
  );
  return row ? scheduleSlotToApi(row) : null;
}

export async function upsertScheduleSlot(
  userId: string,
  input: ScheduleUpsertInput,
): Promise<ScheduleSlotApi> {
  const postId = input.postId.trim();
  if (!postId) {
    const err = new Error("postId_required");
    (err as Error & { code: string }).code = "postId_required";
    throw err;
  }
  const startsAt = parseStartsAt(input.startsAt);
  const moduleId =
    typeof input.moduleId === "string" && input.moduleId.trim()
      ? input.moduleId.trim()
      : "carousel-engine";
  const status = scheduleStatusFromApi(input.status);
  const draftId = await resolveDraftId(userId, postId, input.draftId);
  const contentJobId =
    typeof input.contentJobId === "string"
      ? input.contentJobId
      : input.contentJobId === null
        ? null
        : undefined;
  const platformId =
    typeof input.platformId === "string"
      ? input.platformId
      : input.platformId === null
        ? null
        : undefined;
  const now = new Date();
  const nowIso = now.toISOString();

  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const existing = await prisma.scheduleSlot.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (
      input.id &&
      existing &&
      existing.id !== input.id &&
      existing.userId === userId
    ) {
      // Prefer unique (userId, postId) — update existing
    }
    const row = await prisma.scheduleSlot.upsert({
      where: { userId_postId: { userId, postId } },
      create: {
        id:
          typeof input.id === "string" && input.id.trim()
            ? input.id.trim()
            : undefined,
        userId,
        moduleId,
        startsAt,
        postId,
        draftId,
        contentJobId: contentJobId ?? null,
        platformId: platformId ?? null,
        status,
      },
      update: {
        moduleId,
        startsAt,
        draftId,
        ...(contentJobId !== undefined ? { contentJobId } : {}),
        ...(platformId !== undefined ? { platformId } : {}),
        status,
        updatedAt: now,
      },
    });
    return scheduleSlotToApi(row);
  }

  const store = await readSprint8Fallback();
  const idx = store.scheduleSlots.findIndex(
    (s) => s.userId === userId && s.postId === postId,
  );
  const prev = idx >= 0 ? store.scheduleSlots[idx]! : null;
  const row: FallbackScheduleSlotRecord = {
    id:
      (typeof input.id === "string" && input.id.trim()
        ? input.id.trim()
        : null) ||
      prev?.id ||
      newFallbackId("slot"),
    userId,
    moduleId,
    startsAt: startsAt.toISOString(),
    postId,
    draftId,
    contentJobId:
      contentJobId !== undefined
        ? contentJobId
        : (prev?.contentJobId ?? null),
    platformId:
      platformId !== undefined ? platformId : (prev?.platformId ?? null),
    status,
    createdAt: prev?.createdAt ?? nowIso,
    updatedAt: nowIso,
  };
  if (idx >= 0) store.scheduleSlots[idx] = row;
  else store.scheduleSlots.push(row);
  await writeSprint8Fallback(store);
  return scheduleSlotToApi(row);
}

export async function patchScheduleSlot(opts: {
  userId: string;
  id: string;
  patch: Partial<ScheduleUpsertInput> & {
    startsAt?: string;
    status?: unknown;
  };
}): Promise<ScheduleSlotApi | null> {
  const existing = await getScheduleSlot({
    userId: opts.userId,
    id: opts.id,
  });
  if (!existing) return null;
  return upsertScheduleSlot(opts.userId, {
    id: opts.id,
    postId: opts.patch.postId ?? existing.postId,
    moduleId: opts.patch.moduleId ?? existing.moduleId,
    startsAt: opts.patch.startsAt ?? existing.startsAt,
    platformId:
      opts.patch.platformId !== undefined
        ? opts.patch.platformId
        : existing.platformId,
    draftId:
      opts.patch.draftId !== undefined ? opts.patch.draftId : existing.draftId,
    contentJobId:
      opts.patch.contentJobId !== undefined
        ? opts.patch.contentJobId
        : existing.contentJobId,
    status: opts.patch.status ?? existing.status,
  });
}

export async function deleteScheduleSlot(opts: {
  userId: string;
  id?: string | null;
  postId?: string | null;
}): Promise<boolean> {
  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    if (opts.id) {
      const row = await prisma.scheduleSlot.findFirst({
        where: { id: opts.id, userId: opts.userId },
      });
      if (!row) return false;
      await prisma.scheduleSlot.delete({ where: { id: opts.id } });
      return true;
    }
    if (opts.postId) {
      const row = await prisma.scheduleSlot.findUnique({
        where: {
          userId_postId: { userId: opts.userId, postId: opts.postId },
        },
      });
      if (!row) return false;
      await prisma.scheduleSlot.delete({ where: { id: row.id } });
      return true;
    }
    return false;
  }

  const store = await readSprint8Fallback();
  const before = store.scheduleSlots.length;
  store.scheduleSlots = store.scheduleSlots.filter((s) => {
    if (s.userId !== opts.userId) return true;
    if (opts.id && s.id === opts.id) return false;
    if (opts.postId && s.postId === opts.postId) return false;
    return true;
  });
  if (store.scheduleSlots.length === before) return false;
  await writeSprint8Fallback(store);
  return true;
}

/**
 * HITL approve → status SCHEDULED (+ linked Draft SCHEDULED).
 * Explicitly does NOT call any social network publish client.
 */
export async function approveScheduleSlot(opts: {
  userId: string;
  id?: string | null;
  postId?: string | null;
}): Promise<ScheduleSlotApi | null> {
  let slot: ScheduleSlotApi | null = null;
  if (opts.id) {
    slot = await getScheduleSlot({ userId: opts.userId, id: opts.id });
  } else if (opts.postId) {
    const all = await listScheduleSlots({ userId: opts.userId });
    slot = all.find((s) => s.postId === opts.postId) ?? null;
  }
  if (!slot) return null;

  const updated = await upsertScheduleSlot(opts.userId, {
    id: slot.id,
    postId: slot.postId,
    moduleId: slot.moduleId,
    startsAt: slot.startsAt,
    platformId: slot.platformId,
    draftId: slot.draftId,
    contentJobId: slot.contentJobId,
    status: "SCHEDULED",
  });

  // Mirror Draft.status when linked
  const draftId = updated.draftId ?? updated.postId;
  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const draft = await prisma.draft.findFirst({
      where: { id: draftId, userId: opts.userId },
    });
    if (draft) {
      await prisma.draft.update({
        where: { id: draft.id },
        data: { status: "SCHEDULED", updatedAt: new Date() },
      });
    }
  } else {
    const store = await readSprint8Fallback();
    const idx = store.drafts.findIndex(
      (d) => d.id === draftId && d.userId === opts.userId,
    );
    if (idx >= 0) {
      store.drafts[idx] = {
        ...store.drafts[idx]!,
        status: "SCHEDULED",
        updatedAt: new Date().toISOString(),
      };
      await writeSprint8Fallback(store);
    }
  }

  // Guard comment for Tester: no Meta / Instagram / Telegram / social publish.
  return updated;
}
