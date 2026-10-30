/**
 * C-s8-06 — Idempotent import of legacy localStorage buckets → SoT.
 */

import { upsertBoard, materializeBoardSlideUrls } from "@/lib/db/boards-repository";
import { upsertDraft } from "@/lib/db/drafts-repository";
import {
  activateDesignSlot,
  upsertDesignSlot,
  DesignLibraryFullError,
} from "@/lib/db/design-slots-repository";
import { upsertScheduleSlot } from "@/lib/db/schedule-repository";

export type MigrateBucketCounts = {
  upserted: number;
  skipped: number;
  errors: string[];
};

export type MigrateLocalResult = {
  ok: boolean;
  migratedAt: string;
  drafts: MigrateBucketCounts;
  boards: MigrateBucketCounts;
  schedule: MigrateBucketCounts;
  designLibrary: MigrateBucketCounts;
  designActiveId: string | null;
  storeMode?: string;
};

function emptyCounts(): MigrateBucketCounts {
  return { upserted: 0, skipped: 0, errors: [] };
}

function unwrapZustandArray(raw: unknown, key: string): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj[key])) return obj[key] as unknown[];
    if (obj.state && typeof obj.state === "object") {
      const state = obj.state as Record<string, unknown>;
      if (Array.isArray(state[key])) return state[key] as unknown[];
    }
  }
  return [];
}

function unwrapScheduleSlots(raw: unknown): unknown[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.slots)) return obj.slots;
  if (Array.isArray(raw)) return raw as unknown[];
  return [];
}

export async function migrateLocalPayload(
  userId: string,
  body: {
    drafts?: unknown;
    boards?: unknown;
    schedule?: unknown;
    designLibrary?: unknown;
    designActiveId?: unknown;
  },
): Promise<MigrateLocalResult> {
  const drafts = emptyCounts();
  const boards = emptyCounts();
  const schedule = emptyCounts();
  const designLibrary = emptyCounts();
  let designActiveId: string | null =
    typeof body.designActiveId === "string" && body.designActiveId.trim()
      ? body.designActiveId.trim()
      : null;

  // --- Drafts ---
  for (const item of unwrapZustandArray(body.drafts, "drafts")) {
    if (!item || typeof item !== "object") {
      drafts.skipped += 1;
      continue;
    }
    const d = item as Record<string, unknown>;
    if (typeof d.id !== "string" || !d.id.trim()) {
      drafts.skipped += 1;
      continue;
    }
    try {
      await upsertDraft(userId, {
        id: d.id,
        moduleId:
          typeof d.moduleId === "string" ? d.moduleId : "carousel-engine",
        title: typeof d.title === "string" ? d.title : "Без названия",
        slides: d.slides,
        scenario:
          typeof d.scenario === "string" || d.scenario === null
            ? (d.scenario as string | null)
            : undefined,
        status: d.status,
        sourceCompetitorId: d.sourceCompetitorId,
        competitorId: d.competitorId,
        brand: d.brand,
        payload: d.payload,
        contentJobId:
          typeof d.contentJobId === "string" || d.contentJobId === null
            ? (d.contentJobId as string | null)
            : undefined,
        createdAt: typeof d.createdAt === "string" ? d.createdAt : undefined,
        updatedAt: typeof d.updatedAt === "string" ? d.updatedAt : undefined,
      });
      drafts.upserted += 1;
    } catch (err) {
      drafts.errors.push(
        `${d.id}:${err instanceof Error ? err.message : "error"}`,
      );
    }
  }

  // --- Boards ---
  for (const item of unwrapZustandArray(body.boards, "boards")) {
    if (!item || typeof item !== "object") {
      boards.skipped += 1;
      continue;
    }
    const b = item as Record<string, unknown>;
    if (typeof b.id !== "string" || !b.id.trim()) {
      boards.skipped += 1;
      continue;
    }
    try {
      const rawUrls = Array.isArray(b.slideUrls)
        ? (b.slideUrls as string[]).filter((u) => typeof u === "string")
        : [];
      const materialized = await materializeBoardSlideUrls(userId, rawUrls);
      await upsertBoard(userId, {
        id: b.id,
        title: typeof b.title === "string" ? b.title : "Новая доска",
        slideUrls: materialized.urls,
        createdAt:
          typeof b.createdAt === "number" || typeof b.createdAt === "string"
            ? (b.createdAt as number | string)
            : undefined,
      });
      boards.upserted += 1;
    } catch (err) {
      boards.errors.push(
        `${b.id}:${err instanceof Error ? err.message : "error"}`,
      );
    }
  }

  // --- Schedule ---
  for (const item of unwrapScheduleSlots(body.schedule)) {
    if (!item || typeof item !== "object") {
      schedule.skipped += 1;
      continue;
    }
    const s = item as Record<string, unknown>;
    if (typeof s.postId !== "string" || typeof s.startsAt !== "string") {
      schedule.skipped += 1;
      continue;
    }
    try {
      await upsertScheduleSlot(userId, {
        id: typeof s.id === "string" ? s.id : undefined,
        postId: s.postId,
        moduleId: typeof s.moduleId === "string" ? s.moduleId : undefined,
        startsAt: s.startsAt,
        platformId:
          typeof s.platformId === "string" || s.platformId === null
            ? (s.platformId as string | null)
            : undefined,
        draftId:
          typeof s.draftId === "string" || s.draftId === null
            ? (s.draftId as string | null)
            : undefined,
        contentJobId:
          typeof s.contentJobId === "string" || s.contentJobId === null
            ? (s.contentJobId as string | null)
            : undefined,
        status: s.status,
      });
      schedule.upserted += 1;
    } catch (err) {
      schedule.errors.push(
        `${s.postId}:${err instanceof Error ? err.message : "error"}`,
      );
    }
  }

  // --- Design library ---
  const designItems = Array.isArray(body.designLibrary)
    ? body.designLibrary
    : unwrapZustandArray(body.designLibrary, "library");
  for (const item of designItems) {
    if (!item || typeof item !== "object") {
      designLibrary.skipped += 1;
      continue;
    }
    const d = item as Record<string, unknown>;
    if (typeof d.id !== "string" || !d.id.trim()) {
      designLibrary.skipped += 1;
      continue;
    }
    try {
      await upsertDesignSlot(userId, {
        id: d.id,
        name: typeof d.name === "string" ? d.name : undefined,
        label: typeof d.label === "string" ? d.label : undefined,
        markdown: typeof d.markdown === "string" ? d.markdown : "",
        html:
          typeof d.html === "string" || d.html === null
            ? (d.html as string | null)
            : undefined,
        previewUrl:
          typeof d.previewUrl === "string" || d.previewUrl === null
            ? (d.previewUrl as string | null)
            : undefined,
        presetFile: d.presetFile,
        colors: d.colors,
        cssVarOverrides: d.cssVarOverrides,
        presetId: d.presetId,
        brandbook: d.brandbook,
        createdAt: typeof d.createdAt === "string" ? d.createdAt : undefined,
        isActive: designActiveId ? d.id === designActiveId : undefined,
      });
      designLibrary.upserted += 1;
    } catch (err) {
      if (err instanceof DesignLibraryFullError) {
        designLibrary.errors.push(`${d.id}:design_library_full`);
        designLibrary.skipped += 1;
      } else {
        designLibrary.errors.push(
          `${d.id}:${err instanceof Error ? err.message : "error"}`,
        );
      }
    }
  }

  if (designActiveId) {
    try {
      const activated = await activateDesignSlot({
        userId,
        id: designActiveId,
      });
      if (!activated) designActiveId = null;
    } catch {
      designActiveId = null;
    }
  }

  return {
    ok: true,
    migratedAt: new Date().toISOString(),
    drafts,
    boards,
    schedule,
    designLibrary,
    designActiveId,
  };
}
