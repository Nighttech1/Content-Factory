/**
 * Local SoT for Sheet row status when Google write-back unavailable.
 * Path: data/local/sheet-row-mirror.json
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import type { NormalizedSheetRow, SheetMode } from "@/lib/intake/types";

const STORE_DIR = path.join(process.cwd(), "data", "local");
const STORE_FILE = path.join(STORE_DIR, "sheet-row-mirror.json");

export type SheetMirrorRecord = {
  mode: SheetMode;
  sheetRowKey: string;
  topic: string;
  /** Effective status (local override wins). */
  status: string;
  statusFromSheet?: string;
  updatedAt: string;
  snapshot?: NormalizedSheetRow;
};

type MirrorStore = {
  rows: SheetMirrorRecord[];
};

function empty(): MirrorStore {
  return { rows: [] };
}

async function readStore(): Promise<MirrorStore> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<MirrorStore>;
    return { rows: Array.isArray(parsed.rows) ? parsed.rows : [] };
  } catch {
    return empty();
  }
}

async function writeStore(store: MirrorStore): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function listMirroredStatuses(
  mode?: SheetMode,
): Promise<Record<string, SheetMirrorRecord>> {
  const store = await readStore();
  const map: Record<string, SheetMirrorRecord> = {};
  for (const row of store.rows) {
    if (mode && row.mode !== mode) continue;
    map[row.sheetRowKey] = row;
  }
  return map;
}

export async function getMirroredStatus(
  mode: SheetMode,
  sheetRowKey: string,
): Promise<SheetMirrorRecord | null> {
  const store = await readStore();
  return (
    store.rows.find(
      (r) => r.mode === mode && r.sheetRowKey === sheetRowKey,
    ) ?? null
  );
}

export async function upsertSheetMirror(input: {
  mode: SheetMode;
  sheetRowKey: string;
  topic: string;
  localStatus?: string;
  statusFromSheet?: string;
  snapshot?: NormalizedSheetRow;
}): Promise<SheetMirrorRecord> {
  const store = await readStore();
  const idx = store.rows.findIndex(
    (r) => r.mode === input.mode && r.sheetRowKey === input.sheetRowKey,
  );
  const prev = idx >= 0 ? store.rows[idx]! : null;
  const status =
    (input.localStatus?.trim() ||
      prev?.status ||
      input.statusFromSheet?.trim() ||
      "") || "";
  const record: SheetMirrorRecord = {
    mode: input.mode,
    sheetRowKey: input.sheetRowKey,
    topic: input.topic || prev?.topic || "",
    status,
    statusFromSheet:
      input.statusFromSheet ?? prev?.statusFromSheet ?? undefined,
    updatedAt: new Date().toISOString(),
    snapshot: input.snapshot ?? prev?.snapshot,
  };
  if (idx >= 0) store.rows[idx] = record;
  else store.rows.push(record);
  await writeStore(store);
  return record;
}
