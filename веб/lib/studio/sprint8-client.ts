/**
 * C-s8-06 — Thin browser fetch helpers for Sprint 8 SoT APIs.
 * No UI. No shell. Actor via cookie / x-cf-user-id / CF_DEV_USER_ID on server.
 * Call only from browser (stores / design-library client paths).
 */

import type { CarouselDraft } from "@/lib/studio/carousel-draft-types";

export type DraftApiRow = {
  id: string;
  moduleId?: string;
  title: string;
  slides: CarouselDraft["slides"];
  scenario?: string;
  status?: string;
  sourceCompetitorId?: string;
  competitorId?: string;
  brand?: CarouselDraft["brand"];
  createdAt: string;
  updatedAt: string;
};

export type BoardApiRow = {
  id: string;
  title: string;
  slideUrls: string[];
  createdAt: number;
  updatedAt?: string;
};

export type ScheduleSlotApiRow = {
  id: string;
  postId: string;
  moduleId: string;
  startsAt: string;
  platformId?: string;
  status?: string;
};

export type DesignSlotApiRow = {
  id: string;
  name: string;
  markdown: string;
  html?: string;
  previewUrl?: string;
  createdAt: string;
  presetFile?: unknown;
  colors?: unknown;
  cssVarOverrides?: unknown;
  presetId?: string;
  isActive?: boolean;
};

/** Minimal board shape for API ↔ store (avoids circular import with boards-store). */
export type BoardClientRow = {
  id: string;
  title: string;
  slideUrls: string[];
  createdAt: number;
};

/** Minimal schedule slot for API ↔ storage. */
export type ScheduleClientSlot = {
  postId: string;
  moduleId: string;
  startsAt: string;
  platformId?: string;
};

/** Minimal design slot for API ↔ design-library. */
export type DesignClientSlot = {
  id: string;
  name: string;
  markdown: string;
  html?: string;
  previewUrl?: string;
  createdAt: string;
  presetFile?: DesignSlotApiRow["presetFile"];
  colors?: DesignSlotApiRow["colors"];
  cssVarOverrides?: DesignSlotApiRow["cssVarOverrides"];
  presetId?: string;
};

async function parseJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function apiListDrafts(
  moduleId?: string,
): Promise<CarouselDraft[] | null> {
  try {
    const qs = moduleId
      ? `?moduleId=${encodeURIComponent(moduleId)}`
      : "";
    const res = await fetch(`/api/studio/drafts${qs}`, { method: "GET" });
    if (!res.ok) return null;
    const data = await parseJson<{ drafts?: DraftApiRow[] }>(res);
    const rows = Array.isArray(data?.drafts) ? data!.drafts : [];
    return rows.map(draftApiToClient);
  } catch {
    return null;
  }
}

export async function apiUpsertDraft(
  draft: CarouselDraft,
): Promise<CarouselDraft | null> {
  const res = await fetch("/api/studio/drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: draft.id,
      moduleId: "carousel-engine",
      title: draft.title,
      slides: draft.slides,
      scenario: draft.scenario,
      status: draft.status,
      sourceCompetitorId: draft.sourceCompetitorId,
      competitorId: draft.competitorId ?? draft.sourceCompetitorId,
      brand: draft.brand,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    }),
  });
  if (!res.ok) return null;
  const data = await parseJson<{ draft?: DraftApiRow }>(res);
  return data?.draft ? draftApiToClient(data.draft) : null;
}

export async function apiDeleteDraft(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/studio/drafts/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiPatchDraft(
  id: string,
  patch: Partial<Pick<CarouselDraft, "title" | "scenario" | "slides">>,
): Promise<CarouselDraft | null> {
  const res = await fetch(`/api/studio/drafts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  const data = await parseJson<{ draft?: DraftApiRow }>(res);
  return data?.draft ? draftApiToClient(data.draft) : null;
}

export async function apiListBoards(): Promise<BoardClientRow[] | null> {
  try {
    const res = await fetch("/api/studio/boards", { method: "GET" });
    if (!res.ok) return null;
    const data = await parseJson<{ boards?: BoardApiRow[] }>(res);
    const rows = Array.isArray(data?.boards) ? data!.boards : [];
    return rows.map(boardApiToClient);
  } catch {
    return null;
  }
}

export async function apiUpsertBoard(
  board: BoardClientRow,
): Promise<BoardClientRow | null> {
  const res = await fetch("/api/studio/boards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: board.id,
      title: board.title,
      slideUrls: board.slideUrls,
      createdAt: board.createdAt,
    }),
  });
  if (!res.ok) return null;
  const data = await parseJson<{ board?: BoardApiRow }>(res);
  return data?.board ? boardApiToClient(data.board) : null;
}

export async function apiPatchBoard(
  id: string,
  patch: { title?: string; slideUrls?: string[] },
): Promise<BoardClientRow | null> {
  const res = await fetch(`/api/studio/boards/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  const data = await parseJson<{ board?: BoardApiRow }>(res);
  return data?.board ? boardApiToClient(data.board) : null;
}

export async function apiDeleteBoard(id: string): Promise<boolean> {
  const res = await fetch(`/api/studio/boards/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return res.ok;
}

/** Upload data: / base64 slides → durable URLs. Pass-through http(s) paths. */
export async function apiUploadBoardSlides(
  slideUrls: string[],
): Promise<string[]> {
  const out: string[] = [];
  const toUpload: string[] = [];
  for (const url of slideUrls) {
    if (!url) continue;
    if (url.startsWith("data:") || looksLikeRawBase64(url)) {
      toUpload.push(url);
    } else if (url.startsWith("blob:")) {
      /* blob: cannot be re-read after revoke — skip */
    } else {
      out.push(url);
    }
  }
  if (toUpload.length === 0) return out;

  const res = await fetch("/api/studio/boards/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrls: toUpload }),
  });
  if (!res.ok) return out;
  const data = await parseJson<{ urls?: string[] }>(res);
  if (Array.isArray(data?.urls)) out.push(...data.urls);
  return out;
}

export async function apiListScheduleSlots(): Promise<
  ScheduleClientSlot[] | null
> {
  try {
    const res = await fetch("/api/schedule/slots", { method: "GET" });
    if (!res.ok) return null;
    const data = await parseJson<{ slots?: ScheduleSlotApiRow[] }>(res);
    const rows = Array.isArray(data?.slots) ? data!.slots : [];
    return rows.map((s) => ({
      postId: s.postId,
      moduleId: s.moduleId,
      startsAt: s.startsAt,
      platformId: s.platformId,
    }));
  } catch {
    return null;
  }
}

export async function apiUpsertScheduleSlot(
  slot: ScheduleClientSlot,
): Promise<boolean> {
  const res = await fetch("/api/schedule/slots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      postId: slot.postId,
      moduleId: slot.moduleId,
      startsAt: slot.startsAt,
      platformId: slot.platformId,
      status: "draft",
    }),
  });
  return res.ok;
}

export async function apiDeleteScheduleSlotByPostId(
  postId: string,
): Promise<boolean> {
  const res = await fetch(
    `/api/schedule/slots?postId=${encodeURIComponent(postId)}`,
    { method: "DELETE" },
  );
  return res.ok;
}

export async function apiListDesignSlots(): Promise<{
  slots: DesignClientSlot[];
  activeId: string | null;
} | null> {
  try {
    const res = await fetch("/api/settings/design-slots", { method: "GET" });
    if (!res.ok) return null;
    const data = await parseJson<{
      slots?: DesignSlotApiRow[];
      activeId?: string | null;
    }>(res);
    const rows = Array.isArray(data?.slots) ? data!.slots : [];
    return {
      slots: rows.map(designApiToClient),
      activeId:
        typeof data?.activeId === "string" && data.activeId.trim()
          ? data.activeId.trim()
          : null,
    };
  } catch {
    return null;
  }
}

export async function apiUpsertDesignSlot(
  slot: DesignClientSlot,
  isActive?: boolean,
): Promise<DesignClientSlot | null> {
  const res = await fetch("/api/settings/design-slots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: slot.id,
      name: slot.name,
      markdown: slot.markdown,
      html: slot.html,
      previewUrl: slot.previewUrl,
      presetFile: slot.presetFile,
      colors: slot.colors,
      cssVarOverrides: slot.cssVarOverrides,
      presetId: slot.presetId,
      createdAt: slot.createdAt,
      isActive,
    }),
  });
  if (!res.ok) return null;
  const data = await parseJson<{ slot?: DesignSlotApiRow }>(res);
  return data?.slot ? designApiToClient(data.slot) : null;
}

export async function apiPatchDesignSlot(
  id: string,
  patch: Partial<Omit<DesignClientSlot, "id" | "createdAt">>,
): Promise<DesignClientSlot | null> {
  const res = await fetch(
    `/api/settings/design-slots/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    },
  );
  if (!res.ok) return null;
  const data = await parseJson<{ slot?: DesignSlotApiRow }>(res);
  return data?.slot ? designApiToClient(data.slot) : null;
}

export async function apiActivateDesignSlot(id: string): Promise<boolean> {
  const res = await fetch(
    `/api/settings/design-slots/${encodeURIComponent(id)}/activate`,
    { method: "POST" },
  );
  return res.ok;
}

export async function apiDeleteDesignSlot(id: string): Promise<boolean> {
  const res = await fetch(
    `/api/settings/design-slots/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
  return res.ok;
}

export async function apiMigrateLocal(body: {
  drafts?: unknown;
  boards?: unknown;
  schedule?: unknown;
  designLibrary?: unknown;
  designActiveId?: unknown;
}): Promise<{
  ok: boolean;
  migratedAt?: string;
  drafts?: { upserted: number; skipped: number; errors: string[] };
  boards?: { upserted: number; skipped: number; errors: string[] };
  schedule?: { upserted: number; skipped: number; errors: string[] };
  designLibrary?: { upserted: number; skipped: number; errors: string[] };
} | null> {
  const res = await fetch("/api/studio/migrate-local", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return parseJson(res);
}

function draftApiToClient(row: DraftApiRow): CarouselDraft {
  const slides = Array.isArray(row.slides)
    ? (row.slides as CarouselDraft["slides"])
    : [];
  return {
    id: row.id,
    sourceCompetitorId:
      typeof row.sourceCompetitorId === "string"
        ? row.sourceCompetitorId
        : typeof row.competitorId === "string"
          ? row.competitorId
          : "",
    competitorId: row.competitorId,
    title: row.title || "Без названия",
    slides,
    scenario: row.scenario,
    status: "unpublished",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    brand: row.brand,
  };
}

function boardApiToClient(row: BoardApiRow): BoardClientRow {
  return {
    id: row.id,
    title: row.title || "Новая доска",
    slideUrls: Array.isArray(row.slideUrls)
      ? row.slideUrls.filter((u) => typeof u === "string")
      : [],
    createdAt:
      typeof row.createdAt === "number" && Number.isFinite(row.createdAt)
        ? row.createdAt
        : Date.now(),
  };
}

function designApiToClient(row: DesignSlotApiRow): DesignClientSlot {
  return {
    id: row.id,
    name: row.name || "DESIGN.md",
    markdown: row.markdown || "",
    html: row.html,
    previewUrl: row.previewUrl,
    createdAt: row.createdAt || new Date().toISOString(),
    presetFile: row.presetFile,
    presetId: row.presetId,
    colors: row.colors,
    cssVarOverrides: row.cssVarOverrides,
  };
}

function looksLikeRawBase64(value: string): boolean {
  if (value.length < 64) return false;
  if (value.includes("://") || value.startsWith("/")) return false;
  return /^[A-Za-z0-9+/=\s]+$/.test(value.slice(0, 80));
}
