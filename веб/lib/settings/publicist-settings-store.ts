/**
 * Publicist auto|manual schedule settings — JSON SoT.
 * No silent social publish — only ScheduleSlot DRAFT|SCHEDULED.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const STORE_DIR = path.join(process.cwd(), "data", "local");
const STORE_FILE = path.join(STORE_DIR, "publicist-settings.json");

export type PublicistMode = "auto" | "manual";

export type PublicistSettings = {
  userId: string;
  /** auto = use defaultPublishHour / defaultPublishMinute + weekday cadence */
  mode: PublicistMode;
  /** Local hour 0–23 for auto schedule */
  defaultPublishHour: number;
  defaultPublishMinute: number;
  /** Days ahead to place next auto slot */
  daysAhead: number;
  platformId?: string | null;
  updatedAt: string;
};

type PublicistFile = {
  byUser: Record<string, PublicistSettings>;
};

function empty(): PublicistFile {
  return { byUser: {} };
}

export function defaultPublicistSettings(userId: string): PublicistSettings {
  return {
    userId,
    mode: "manual",
    defaultPublishHour: 18,
    defaultPublishMinute: 0,
    daysAhead: 1,
    platformId: null,
    updatedAt: new Date().toISOString(),
  };
}

async function readFile(): Promise<PublicistFile> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<PublicistFile>;
    return { byUser: parsed.byUser ?? {} };
  } catch {
    return empty();
  }
}

async function writeFile(data: PublicistFile): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function getPublicistSettings(
  userId: string,
): Promise<PublicistSettings> {
  const file = await readFile();
  return file.byUser[userId] ?? defaultPublicistSettings(userId);
}

export async function putPublicistSettings(
  userId: string,
  patch: Partial<Omit<PublicistSettings, "userId" | "updatedAt">>,
): Promise<PublicistSettings> {
  const file = await readFile();
  const prev = file.byUser[userId] ?? defaultPublicistSettings(userId);
  const mode: PublicistMode =
    patch.mode === "auto" || patch.mode === "manual" ? patch.mode : prev.mode;
  const hour =
    typeof patch.defaultPublishHour === "number" &&
    Number.isFinite(patch.defaultPublishHour)
      ? Math.min(23, Math.max(0, Math.floor(patch.defaultPublishHour)))
      : prev.defaultPublishHour;
  const minute =
    typeof patch.defaultPublishMinute === "number" &&
    Number.isFinite(patch.defaultPublishMinute)
      ? Math.min(59, Math.max(0, Math.floor(patch.defaultPublishMinute)))
      : prev.defaultPublishMinute;
  const daysAhead =
    typeof patch.daysAhead === "number" && Number.isFinite(patch.daysAhead)
      ? Math.min(30, Math.max(0, Math.floor(patch.daysAhead)))
      : prev.daysAhead;

  const next: PublicistSettings = {
    userId,
    mode,
    defaultPublishHour: hour,
    defaultPublishMinute: minute,
    daysAhead,
    platformId:
      patch.platformId !== undefined ? patch.platformId : prev.platformId,
    updatedAt: new Date().toISOString(),
  };
  file.byUser[userId] = next;
  await writeFile(file);
  return next;
}

/** Compute next auto publishAt ISO from settings. */
export function computeAutoPublishAt(
  settings: PublicistSettings,
  from: Date = new Date(),
): string {
  const d = new Date(from.getTime());
  d.setDate(d.getDate() + settings.daysAhead);
  d.setHours(settings.defaultPublishHour, settings.defaultPublishMinute, 0, 0);
  if (d.getTime() <= from.getTime()) {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString();
}
