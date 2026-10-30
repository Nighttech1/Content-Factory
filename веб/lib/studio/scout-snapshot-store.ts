/**
 * S52 — Scout competitor snapshot SoT.
 * Feed GET reads this only; Apify writes only via Scout run.
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

import type { FeedPost } from "@/lib/studio/feed-types";

export type ScoutSnapshot = {
  moduleId: string;
  topic?: string;
  competitors: FeedPost[];
  updatedAt: string;
  source: "scout";
};

const memory = new Map<string, ScoutSnapshot>();

function dataDir(): string {
  return path.join(process.cwd(), "data", "scout-snapshots");
}

function filePath(moduleId: string): string {
  const safe = moduleId.replace(/[^a-zA-Z0-9._-]/g, "_");
  return path.join(dataDir(), `${safe}.json`);
}

function ensureDir(): void {
  const dir = dataDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function writeScoutSnapshot(
  moduleId: string,
  competitors: FeedPost[],
  topic?: string,
): ScoutSnapshot {
  const snap: ScoutSnapshot = {
    moduleId,
    topic: topic?.trim() || undefined,
    competitors,
    updatedAt: new Date().toISOString(),
    source: "scout",
  };
  memory.set(moduleId, snap);
  try {
    ensureDir();
    writeFileSync(filePath(moduleId), JSON.stringify(snap, null, 2), "utf8");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `[scout-snapshot] disk write failed module=${moduleId}: ${
        err instanceof Error ? err.message : "error"
      }`,
    );
  }
  return snap;
}

export function readScoutSnapshot(moduleId: string): ScoutSnapshot | null {
  const mem = memory.get(moduleId);
  if (mem) return mem;

  try {
    const fp = filePath(moduleId);
    if (!existsSync(fp)) return null;
    const raw = readFileSync(fp, "utf8");
    const parsed = JSON.parse(raw) as ScoutSnapshot;
    if (!parsed || !Array.isArray(parsed.competitors)) return null;
    const snap: ScoutSnapshot = {
      moduleId,
      topic: parsed.topic,
      competitors: parsed.competitors,
      updatedAt: parsed.updatedAt || new Date(0).toISOString(),
      source: "scout",
    };
    memory.set(moduleId, snap);
    return snap;
  } catch {
    return null;
  }
}

/** Test helper — clear memory (disk untouched). */
export function clearScoutSnapshotMemory(): void {
  memory.clear();
}
