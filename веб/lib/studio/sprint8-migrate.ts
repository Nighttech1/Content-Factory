/**
 * C-s8-06 — One-shot localStorage → POST /api/studio/migrate-local.
 * Flag: cf.sprint8.migrated.v1 — runs once per browser profile.
 */

import { apiMigrateLocal } from "@/lib/studio/sprint8-client";

export const SPRINT8_MIGRATED_KEY = "cf.sprint8.migrated.v1";
export const SELECTED_DRAFT_ID_KEY = "cf.carousel.selectedDraftId";

/** Legacy SoT keys (chrome keys intentionally omitted). */
export const LEGACY_DRAFTS_KEY = "cf.carousel.drafts.v1";
export const LEGACY_BOARDS_KEY = "cf.studio.boards.v1";
export const LEGACY_SCHEDULE_KEY = "cf.schedule.v1";
export const LEGACY_DESIGN_LIBRARY_KEY = "cf.settings.design.library.v1";
export const LEGACY_DESIGN_ACTIVE_KEY = "cf.settings.design.activeId";

export type Sprint8MigratedFlag = {
  at: string;
  counts?: Record<string, unknown>;
};

let migratePromise: Promise<boolean> | null = null;

function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function readSelectedDraftIdFromDraftsPersist(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const state =
    obj.state && typeof obj.state === "object"
      ? (obj.state as Record<string, unknown>)
      : obj;
  return typeof state.selectedDraftId === "string"
    ? state.selectedDraftId
    : null;
}

/** Collect legacy buckets from localStorage (zustand unwrap handled server-side). */
export function collectLegacyLocalBuckets(): {
  drafts: unknown;
  boards: unknown;
  schedule: unknown;
  designLibrary: unknown;
  designActiveId: string | null;
} {
  if (typeof window === "undefined") {
    return {
      drafts: null,
      boards: null,
      schedule: null,
      designLibrary: null,
      designActiveId: null,
    };
  }

  const draftsRaw = safeParse(window.localStorage.getItem(LEGACY_DRAFTS_KEY));
  const selected = readSelectedDraftIdFromDraftsPersist(draftsRaw);
  if (selected) {
    try {
      window.localStorage.setItem(SELECTED_DRAFT_ID_KEY, selected);
    } catch {
      /* quota */
    }
  }

  const designActiveRaw = window.localStorage.getItem(LEGACY_DESIGN_ACTIVE_KEY);
  const designLibrary = safeParse(
    window.localStorage.getItem(LEGACY_DESIGN_LIBRARY_KEY),
  );

  return {
    drafts: draftsRaw,
    boards: safeParse(window.localStorage.getItem(LEGACY_BOARDS_KEY)),
    schedule: safeParse(window.localStorage.getItem(LEGACY_SCHEDULE_KEY)),
    designLibrary,
    designActiveId:
      designActiveRaw && designActiveRaw.trim()
        ? designActiveRaw.trim()
        : null,
  };
}

function clearLegacySoTKeys(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEGACY_DRAFTS_KEY);
    window.localStorage.removeItem(LEGACY_BOARDS_KEY);
    window.localStorage.removeItem(LEGACY_SCHEDULE_KEY);
    window.localStorage.removeItem(LEGACY_DESIGN_LIBRARY_KEY);
    window.localStorage.removeItem(LEGACY_DESIGN_ACTIVE_KEY);
  } catch {
    /* ignore */
  }
}

export function isSprint8Migrated(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return Boolean(window.localStorage.getItem(SPRINT8_MIGRATED_KEY));
  } catch {
    return false;
  }
}

export function readSprint8MigratedFlag(): Sprint8MigratedFlag | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SPRINT8_MIGRATED_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Sprint8MigratedFlag;
    return parsed && typeof parsed.at === "string" ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Idempotent one-shot import. Safe to call from every store on init.
 * On success: set flag + clear legacy SoT keys (selectedDraftId kept separately).
 */
export function ensureSprint8Migrated(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(true);
  if (isSprint8Migrated()) return Promise.resolve(true);
  if (migratePromise) return migratePromise;

  migratePromise = (async () => {
    if (isSprint8Migrated()) return true;
    const buckets = collectLegacyLocalBuckets();
    const hasAnything =
      buckets.drafts != null ||
      buckets.boards != null ||
      buckets.schedule != null ||
      buckets.designLibrary != null ||
      Boolean(buckets.designActiveId);

    try {
      // Empty body still marks success — nothing to import, SoT = API lists.
      const result = hasAnything
        ? await apiMigrateLocal(buckets)
        : await apiMigrateLocal({});

      if (!result || result.ok === false) {
        migratePromise = null;
        return false;
      }

      const flag: Sprint8MigratedFlag = {
        at: result.migratedAt ?? new Date().toISOString(),
        counts: {
          drafts: result.drafts,
          boards: result.boards,
          schedule: result.schedule,
          designLibrary: result.designLibrary,
        },
      };
      window.localStorage.setItem(
        SPRINT8_MIGRATED_KEY,
        JSON.stringify(flag),
      );
      clearLegacySoTKeys();
      return true;
    } catch {
      migratePromise = null;
      return false;
    }
  })();

  return migratePromise;
}

/** Notify sync UI helpers that SoT cache was refreshed from API. */
export function emitSprint8Hydrated(source: string): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("cf-sprint8-hydrated", { detail: { source } }),
    );
    window.dispatchEvent(new Event("focus"));
  } catch {
    /* ignore */
  }
}
