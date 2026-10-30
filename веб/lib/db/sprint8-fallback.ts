/**
 * Sprint 8 JSON fallback when DATABASE_URL is missing or Postgres unreachable.
 * Path: data/local/sprint8-sot.json (gitignored). Primary path remains Prisma.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const STORE_DIR = path.join(process.cwd(), "data", "local");
const STORE_FILE = path.join(STORE_DIR, "sprint8-sot.json");

export type FallbackUserRecord = {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "ADMIN";
  createdAt: string;
};

export type FallbackDraftRecord = {
  id: string;
  userId: string;
  moduleId: string;
  status: "UNPUBLISHED" | "SCHEDULED";
  title: string;
  slides: unknown;
  scenario: string | null;
  payload: unknown | null;
  contentJobId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FallbackBoardRecord = {
  id: string;
  userId: string;
  title: string;
  slideUrls: string[];
  createdAt: string;
  updatedAt: string;
};

export type FallbackScheduleSlotRecord = {
  id: string;
  userId: string;
  moduleId: string;
  startsAt: string;
  postId: string;
  draftId: string | null;
  contentJobId: string | null;
  platformId: string | null;
  status: "DRAFT" | "SCHEDULED";
  createdAt: string;
  updatedAt: string;
};

export type FallbackDesignSlotRecord = {
  id: string;
  userId: string;
  label: string;
  markdown: string;
  html: string | null;
  previewUrl: string | null;
  brandbook: unknown | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Sprint8FallbackStore = {
  users: FallbackUserRecord[];
  drafts: FallbackDraftRecord[];
  boards: FallbackBoardRecord[];
  scheduleSlots: FallbackScheduleSlotRecord[];
  designSlots: FallbackDesignSlotRecord[];
};

function emptyStore(): Sprint8FallbackStore {
  return {
    users: [],
    drafts: [],
    boards: [],
    scheduleSlots: [],
    designSlots: [],
  };
}

/** First complete `{…}` in file — tolerates accidental trailing junk after write races. */
function parseSprint8JsonSoft(raw: string): Partial<Sprint8FallbackStore> {
  try {
    return JSON.parse(raw) as Partial<Sprint8FallbackStore>;
  } catch {
    let depth = 0;
    let inString = false;
    let escape = false;
    let end = -1;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i]!;
      if (inString) {
        if (escape) escape = false;
        else if (ch === "\\") escape = true;
        else if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') {
        inString = true;
        continue;
      }
      if (ch === "{") depth++;
      if (ch === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end < 0) throw new SyntaxError("sprint8_sot_unrecoverable");
    return JSON.parse(raw.slice(0, end + 1)) as Partial<Sprint8FallbackStore>;
  }
}

export async function readSprint8Fallback(): Promise<Sprint8FallbackStore> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = parseSprint8JsonSoft(raw);
    return {
      users: parsed.users ?? [],
      drafts: parsed.drafts ?? [],
      boards: parsed.boards ?? [],
      scheduleSlots: parsed.scheduleSlots ?? [],
      designSlots: parsed.designSlots ?? [],
    };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return emptyStore();
    throw err;
  }
}

export async function writeSprint8Fallback(
  store: Sprint8FallbackStore,
): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  const tmp = `${STORE_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tmp, STORE_FILE);
}

export async function ensureFallbackUser(
  input: Omit<FallbackUserRecord, "createdAt"> & { createdAt?: string },
): Promise<FallbackUserRecord> {
  const store = await readSprint8Fallback();
  const existing = store.users.find((u) => u.id === input.id);
  if (existing) return existing;
  const row: FallbackUserRecord = {
    id: input.id,
    email: input.email,
    name: input.name,
    role: input.role,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  store.users.push(row);
  await writeSprint8Fallback(store);
  return row;
}

export function newFallbackId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
