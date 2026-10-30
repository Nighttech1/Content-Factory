/**
 * Sprint 8 C-s8-02 — Drafts SoT (Prisma preferred, JSON fallback).
 */

import {
  type DraftApi,
  buildDraftPayload,
  draftStatusFromApi,
  draftToApi,
} from "@/lib/db/sprint8-mappers";
import { resolveSprint8Db } from "@/lib/db/sprint8-db";
import {
  newFallbackId,
  readSprint8Fallback,
  writeSprint8Fallback,
  type FallbackDraftRecord,
} from "@/lib/db/sprint8-fallback";

export type DraftUpsertInput = {
  id?: string;
  moduleId?: string;
  title?: string;
  slides?: unknown;
  scenario?: string | null;
  status?: unknown;
  sourceCompetitorId?: unknown;
  competitorId?: unknown;
  brand?: unknown;
  payload?: unknown;
  contentJobId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function normalizeSlides(slides: unknown): unknown {
  return Array.isArray(slides) ? slides : [];
}

export async function listDrafts(opts: {
  userId: string;
  moduleId?: string | null;
}): Promise<DraftApi[]> {
  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const rows = await prisma.draft.findMany({
      where: {
        userId: opts.userId,
        ...(opts.moduleId ? { moduleId: opts.moduleId } : {}),
      },
      orderBy: { updatedAt: "desc" },
    });
    return rows.map(draftToApi);
  }

  const store = await readSprint8Fallback();
  return store.drafts
    .filter(
      (d) =>
        d.userId === opts.userId &&
        (!opts.moduleId || d.moduleId === opts.moduleId),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(draftToApi);
}

export async function getDraft(opts: {
  userId: string;
  id: string;
}): Promise<DraftApi | null> {
  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const row = await prisma.draft.findFirst({
      where: { id: opts.id, userId: opts.userId },
    });
    return row ? draftToApi(row) : null;
  }
  const store = await readSprint8Fallback();
  const row = store.drafts.find(
    (d) => d.id === opts.id && d.userId === opts.userId,
  );
  return row ? draftToApi(row) : null;
}

/** True if draft exists but belongs to another user. */
export async function draftOwnedByOther(opts: {
  userId: string;
  id: string;
}): Promise<boolean> {
  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const row = await prisma.draft.findUnique({ where: { id: opts.id } });
    return Boolean(row && row.userId !== opts.userId);
  }
  const store = await readSprint8Fallback();
  const row = store.drafts.find((d) => d.id === opts.id);
  return Boolean(row && row.userId !== opts.userId);
}

export async function upsertDraft(
  userId: string,
  input: DraftUpsertInput,
): Promise<DraftApi> {
  const id =
    typeof input.id === "string" && input.id.trim()
      ? input.id.trim()
      : newFallbackId("draft");
  const now = new Date();
  const nowIso = now.toISOString();
  const payload = buildDraftPayload(input);
  const status = draftStatusFromApi(input.status);
  const moduleId =
    typeof input.moduleId === "string" && input.moduleId.trim()
      ? input.moduleId.trim()
      : "carousel-engine";
  const title =
    typeof input.title === "string" ? input.title : "Без названия";
  const slides = normalizeSlides(input.slides);
  const scenario =
    typeof input.scenario === "string"
      ? input.scenario
      : input.scenario === null
        ? null
        : undefined;
  const contentJobId =
    typeof input.contentJobId === "string"
      ? input.contentJobId
      : input.contentJobId === null
        ? null
        : undefined;

  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const existing = await prisma.draft.findUnique({ where: { id } });
    if (existing && existing.userId !== userId) {
      const err = new Error("forbidden");
      (err as Error & { code: string }).code = "forbidden";
      throw err;
    }
    const createdAt =
      input.createdAt && Number.isFinite(Date.parse(input.createdAt))
        ? new Date(input.createdAt)
        : existing?.createdAt ?? now;
    const row = await prisma.draft.upsert({
      where: { id },
      create: {
        id,
        userId,
        moduleId,
        status,
        title,
        slides: slides as object,
        scenario: scenario ?? null,
        payload: payload as object | undefined,
        contentJobId: contentJobId ?? null,
        createdAt,
        updatedAt: now,
      },
      update: {
        moduleId,
        status,
        title,
        slides: slides as object,
        ...(scenario !== undefined ? { scenario } : {}),
        ...(payload !== null ? { payload: payload as object } : {}),
        ...(contentJobId !== undefined ? { contentJobId } : {}),
        updatedAt: now,
      },
    });
    return draftToApi(row);
  }

  const store = await readSprint8Fallback();
  const idx = store.drafts.findIndex((d) => d.id === id);
  if (idx >= 0 && store.drafts[idx]!.userId !== userId) {
    const err = new Error("forbidden");
    (err as Error & { code: string }).code = "forbidden";
    throw err;
  }
  const prev = idx >= 0 ? store.drafts[idx]! : null;
  const row: FallbackDraftRecord = {
    id,
    userId,
    moduleId,
    status,
    title,
    slides,
    scenario:
      scenario !== undefined ? scenario : (prev?.scenario ?? null),
    payload: payload ?? prev?.payload ?? null,
    contentJobId:
      contentJobId !== undefined
        ? contentJobId
        : (prev?.contentJobId ?? null),
    createdAt:
      input.createdAt && Number.isFinite(Date.parse(input.createdAt))
        ? input.createdAt
        : (prev?.createdAt ?? nowIso),
    updatedAt: nowIso,
  };
  if (idx >= 0) store.drafts[idx] = row;
  else store.drafts.unshift(row);
  await writeSprint8Fallback(store);
  return draftToApi(row);
}

export async function patchDraft(opts: {
  userId: string;
  id: string;
  patch: DraftUpsertInput;
}): Promise<DraftApi | null> {
  const existing = await getDraft({ userId: opts.userId, id: opts.id });
  if (!existing) return null;
  return upsertDraft(opts.userId, {
    ...existing,
    ...opts.patch,
    id: opts.id,
    sourceCompetitorId:
      opts.patch.sourceCompetitorId ?? existing.sourceCompetitorId,
    competitorId: opts.patch.competitorId ?? existing.competitorId,
    brand: opts.patch.brand !== undefined ? opts.patch.brand : existing.brand,
    payload: opts.patch.payload ?? existing.payload,
  });
}

export async function deleteDraft(opts: {
  userId: string;
  id: string;
}): Promise<boolean> {
  const { mode, prisma } = await resolveSprint8Db();
  if (mode === "prisma" && prisma) {
    const row = await prisma.draft.findFirst({
      where: { id: opts.id, userId: opts.userId },
    });
    if (!row) return false;
    await prisma.draft.delete({ where: { id: opts.id } });
    return true;
  }
  const store = await readSprint8Fallback();
  const before = store.drafts.length;
  store.drafts = store.drafts.filter(
    (d) => !(d.id === opts.id && d.userId === opts.userId),
  );
  if (store.drafts.length === before) return false;
  await writeSprint8Fallback(store);
  return true;
}
