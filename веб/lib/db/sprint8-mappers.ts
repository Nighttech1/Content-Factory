/**
 * Sprint 8 — map Prisma / fallback rows ↔ client API shapes.
 */

import type {
  Board,
  DesignSlot,
  Draft,
  DraftStatus,
  ScheduleSlot,
  ScheduleSlotStatus,
} from "@prisma/client";

import type {
  FallbackBoardRecord,
  FallbackDesignSlotRecord,
  FallbackDraftRecord,
  FallbackScheduleSlotRecord,
} from "@/lib/db/sprint8-fallback";

export type DraftApiStatus = "unpublished" | "scheduled";
export type ScheduleApiStatus = "draft" | "scheduled";

export type DraftPayload = {
  sourceCompetitorId?: string;
  competitorId?: string;
  brand?: unknown;
  [key: string]: unknown;
};

export type DraftApi = {
  id: string;
  moduleId: string;
  title: string;
  slides: unknown;
  scenario?: string;
  status: DraftApiStatus;
  sourceCompetitorId?: string;
  competitorId?: string;
  brand?: unknown;
  contentJobId?: string | null;
  createdAt: string;
  updatedAt: string;
  payload?: DraftPayload | null;
};

export type BoardApi = {
  id: string;
  title: string;
  slideUrls: string[];
  createdAt: number;
  updatedAt?: string;
};

export type ScheduleSlotApi = {
  id: string;
  postId: string;
  moduleId: string;
  startsAt: string;
  platformId?: string;
  draftId?: string | null;
  contentJobId?: string | null;
  status: ScheduleApiStatus;
  createdAt: string;
  updatedAt: string;
};

export type DesignBrandbook = {
  presetFile?: unknown;
  colors?: unknown;
  cssVarOverrides?: unknown;
  presetId?: string;
  [key: string]: unknown;
};

export type DesignSlotApi = {
  id: string;
  name: string;
  markdown: string;
  html?: string;
  previewUrl?: string;
  createdAt: string;
  updatedAt?: string;
  presetFile?: unknown;
  colors?: unknown;
  cssVarOverrides?: unknown;
  presetId?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export function draftStatusToApi(status: DraftStatus | string): DraftApiStatus {
  return status === "SCHEDULED" || status === "scheduled"
    ? "scheduled"
    : "unpublished";
}

export function draftStatusFromApi(
  status: unknown,
): DraftStatus {
  if (status === "scheduled" || status === "SCHEDULED") return "SCHEDULED";
  return "UNPUBLISHED";
}

export function scheduleStatusToApi(
  status: ScheduleSlotStatus | string,
): ScheduleApiStatus {
  return status === "SCHEDULED" || status === "scheduled"
    ? "scheduled"
    : "draft";
}

export function scheduleStatusFromApi(status: unknown): ScheduleSlotStatus {
  if (status === "scheduled" || status === "SCHEDULED") return "SCHEDULED";
  return "DRAFT";
}

function asPayload(raw: unknown): DraftPayload | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as DraftPayload;
}

function asSlideUrls(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === "string" && u.length > 0);
}

export function draftToApi(
  row: Draft | FallbackDraftRecord,
): DraftApi {
  const payload = asPayload(row.payload);
  const createdAt =
    row.createdAt instanceof Date
      ? row.createdAt.toISOString()
      : String(row.createdAt);
  const updatedAt =
    row.updatedAt instanceof Date
      ? row.updatedAt.toISOString()
      : String(row.updatedAt);

  return {
    id: row.id,
    moduleId: row.moduleId,
    title: row.title,
    slides: row.slides,
    scenario: row.scenario ?? undefined,
    status: draftStatusToApi(row.status),
    sourceCompetitorId:
      typeof payload?.sourceCompetitorId === "string"
        ? payload.sourceCompetitorId
        : undefined,
    competitorId:
      typeof payload?.competitorId === "string"
        ? payload.competitorId
        : undefined,
    brand: payload?.brand,
    contentJobId: row.contentJobId,
    createdAt,
    updatedAt,
    payload,
  };
}

export function boardToApi(row: Board | FallbackBoardRecord): BoardApi {
  const createdAt =
    row.createdAt instanceof Date
      ? row.createdAt.getTime()
      : Date.parse(String(row.createdAt)) || Date.now();
  const updatedAt =
    row.updatedAt instanceof Date
      ? row.updatedAt.toISOString()
      : String(row.updatedAt);
  return {
    id: row.id,
    title: row.title,
    slideUrls: asSlideUrls(row.slideUrls),
    createdAt,
    updatedAt,
  };
}

export function scheduleSlotToApi(
  row: ScheduleSlot | FallbackScheduleSlotRecord,
): ScheduleSlotApi {
  const startsAt =
    row.startsAt instanceof Date
      ? row.startsAt.toISOString()
      : String(row.startsAt);
  const createdAt =
    row.createdAt instanceof Date
      ? row.createdAt.toISOString()
      : String(row.createdAt);
  const updatedAt =
    row.updatedAt instanceof Date
      ? row.updatedAt.toISOString()
      : String(row.updatedAt);
  return {
    id: row.id,
    postId: row.postId,
    moduleId: row.moduleId,
    startsAt,
    platformId: row.platformId ?? undefined,
    draftId: row.draftId,
    contentJobId: row.contentJobId,
    status: scheduleStatusToApi(row.status),
    createdAt,
    updatedAt,
  };
}

export function designSlotToApi(
  row: DesignSlot | FallbackDesignSlotRecord,
): DesignSlotApi {
  const brandbook =
    row.brandbook && typeof row.brandbook === "object"
      ? (row.brandbook as DesignBrandbook)
      : null;
  const createdAt =
    row.createdAt instanceof Date
      ? row.createdAt.toISOString()
      : String(row.createdAt);
  const updatedAt =
    row.updatedAt instanceof Date
      ? row.updatedAt.toISOString()
      : String(row.updatedAt);

  return {
    id: row.id,
    name: row.label,
    markdown: row.markdown,
    html: row.html ?? undefined,
    previewUrl: row.previewUrl ?? undefined,
    createdAt,
    updatedAt,
    presetFile: brandbook?.presetFile,
    colors: brandbook?.colors,
    cssVarOverrides: brandbook?.cssVarOverrides,
    presetId:
      typeof brandbook?.presetId === "string" ? brandbook.presetId : undefined,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

export function buildDraftPayload(input: {
  sourceCompetitorId?: unknown;
  competitorId?: unknown;
  brand?: unknown;
  payload?: unknown;
}): DraftPayload | null {
  const base =
    input.payload && typeof input.payload === "object" && !Array.isArray(input.payload)
      ? { ...(input.payload as DraftPayload) }
      : {};
  if (typeof input.sourceCompetitorId === "string") {
    base.sourceCompetitorId = input.sourceCompetitorId;
  }
  if (typeof input.competitorId === "string") {
    base.competitorId = input.competitorId;
  }
  if (input.brand !== undefined) {
    base.brand = input.brand;
  }
  return Object.keys(base).length > 0 ? base : null;
}

export function buildDesignBrandbook(input: {
  presetFile?: unknown;
  colors?: unknown;
  cssVarOverrides?: unknown;
  presetId?: unknown;
  brandbook?: unknown;
}): DesignBrandbook | null {
  const base =
    input.brandbook &&
    typeof input.brandbook === "object" &&
    !Array.isArray(input.brandbook)
      ? { ...(input.brandbook as DesignBrandbook) }
      : {};
  if (input.presetFile !== undefined) base.presetFile = input.presetFile;
  if (input.colors !== undefined) base.colors = input.colors;
  if (input.cssVarOverrides !== undefined) {
    base.cssVarOverrides = input.cssVarOverrides;
  }
  if (typeof input.presetId === "string") base.presetId = input.presetId;
  return Object.keys(base).length > 0 ? base : null;
}
