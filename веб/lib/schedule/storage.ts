/**
 * C-54 / C-s8-06 — Publishing slots.
 * SoT = /api/schedule/slots; localStorage = offline cache only.
 * Slot ≠ social publish. No secrets.
 */

import {
  apiDeleteScheduleSlotByPostId,
  apiListScheduleSlots,
  apiUpsertScheduleSlot,
} from "@/lib/studio/sprint8-client";
import {
  ensureSprint8Migrated,
  emitSprint8Hydrated,
} from "@/lib/studio/sprint8-migrate";

export const SCHEDULE_STORAGE_KEY = "cf.schedule.v1";

export type ScheduleSlotV1 = {
  postId: string;
  moduleId: string;
  startsAt: string; // ISO-8601
  /** C-79 — publish platform id from Settings platforms catalog. */
  platformId?: string;
};

export type ScheduleFileV1 = {
  version: 1;
  slots: ScheduleSlotV1[];
};

let memoryFile: ScheduleFileV1 | null = null;
let hydratedFromApi = false;
let hydratePromise: Promise<void> | null = null;

export function emptyScheduleFile(): ScheduleFileV1 {
  return { version: 1, slots: [] };
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") return false;
  const t = Date.parse(value);
  return Number.isFinite(t);
}

function isSlot(value: unknown): value is ScheduleSlotV1 {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.postId === "string" &&
    s.postId.length > 0 &&
    typeof s.moduleId === "string" &&
    s.moduleId.length > 0 &&
    isIsoDate(s.startsAt)
  );
}

/** Corrupt JSON → empty file. One slot per postId (last write wins). */
export function parseScheduleFile(raw: unknown): ScheduleFileV1 {
  if (!raw || typeof raw !== "object") return emptyScheduleFile();
  const src = raw as Record<string, unknown>;
  if (src.version !== 1 || !Array.isArray(src.slots)) {
    return emptyScheduleFile();
  }
  const byPost = new Map<string, ScheduleSlotV1>();
  for (const item of src.slots) {
    if (!isSlot(item)) continue;
    byPost.set(item.postId, item);
  }
  return { version: 1, slots: [...byPost.values()] };
}

function readCacheFromLocalStorage(): ScheduleFileV1 {
  if (typeof window === "undefined") return emptyScheduleFile();
  try {
    const raw = window.localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (!raw) return emptyScheduleFile();
    return parseScheduleFile(JSON.parse(raw) as unknown);
  } catch {
    return emptyScheduleFile();
  }
}

function writeCacheToLocalStorage(file: ScheduleFileV1): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SCHEDULE_STORAGE_KEY,
      JSON.stringify(parseScheduleFile(file)),
    );
  } catch {
    /* quota */
  }
}

function setMemory(file: ScheduleFileV1): void {
  memoryFile = parseScheduleFile(file);
  writeCacheToLocalStorage(memoryFile);
}

/** Load SoT from API into memory + cache (after one-shot migrate). */
export async function hydrateScheduleFromApi(): Promise<void> {
  if (typeof window === "undefined") return;
  if (hydratePromise) return hydratePromise;
  hydratePromise = (async () => {
    await ensureSprint8Migrated();
    const slots = await apiListScheduleSlots();
    if (!slots) {
      if (!memoryFile) memoryFile = readCacheFromLocalStorage();
      hydratedFromApi = true;
      return;
    }
    setMemory({ version: 1, slots });
    hydratedFromApi = true;
    emitSprint8Hydrated("schedule");
  })().finally(() => {
    hydratePromise = null;
  });
  return hydratePromise;
}

export function readScheduleFromStorage(): ScheduleFileV1 {
  if (typeof window === "undefined") return emptyScheduleFile();
  if (!memoryFile) {
    memoryFile = readCacheFromLocalStorage();
  }
  if (!hydratedFromApi) {
    void hydrateScheduleFromApi();
  }
  return memoryFile ?? emptyScheduleFile();
}

export function writeScheduleToStorage(file: ScheduleFileV1): void {
  if (typeof window === "undefined") return;
  const prev = memoryFile ?? readCacheFromLocalStorage();
  const next = parseScheduleFile(file);
  setMemory(next);

  const prevIds = new Set(prev.slots.map((s) => s.postId));
  const nextIds = new Set(next.slots.map((s) => s.postId));

  void (async () => {
    await ensureSprint8Migrated();
    for (const slot of next.slots) {
      await apiUpsertScheduleSlot(slot);
    }
    for (const postId of prevIds) {
      if (!nextIds.has(postId)) {
        await apiDeleteScheduleSlotByPostId(postId);
      }
    }
  })();
}

export function upsertSlot(
  file: ScheduleFileV1,
  slot: ScheduleSlotV1,
): ScheduleFileV1 {
  const slots = file.slots.filter((s) => s.postId !== slot.postId);
  slots.push(slot);
  return { version: 1, slots };
}

export function removeSlot(
  file: ScheduleFileV1,
  postId: string,
): ScheduleFileV1 {
  return {
    version: 1,
    slots: file.slots.filter((s) => s.postId !== postId),
  };
}

export function slotForPost(
  file: ScheduleFileV1,
  postId: string,
): ScheduleSlotV1 | undefined {
  return file.slots.find((s) => s.postId === postId);
}

/**
 * C-78 — move slot to another calendar day, keep clock time from old ISO.
 */
export function moveSlotDay(
  file: ScheduleFileV1,
  postId: string,
  nextDay: Date,
): ScheduleFileV1 {
  const slot = slotForPost(file, postId);
  if (!slot) return file;
  const prev = new Date(slot.startsAt);
  if (Number.isNaN(prev.getTime())) return file;
  const next = new Date(
    nextDay.getFullYear(),
    nextDay.getMonth(),
    nextDay.getDate(),
    prev.getHours(),
    prev.getMinutes(),
    0,
    0,
  );
  return upsertSlot(file, {
    ...slot,
    startsAt: next.toISOString(),
  });
}

export function formatSlotLabelRu(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

if (typeof window !== "undefined") {
  queueMicrotask(() => {
    void hydrateScheduleFromApi();
  });
}
