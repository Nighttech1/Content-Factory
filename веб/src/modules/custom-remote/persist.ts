/**
 * Persist custom (plugin) modules to gitignored JSON.
 * Path: data/local/custom-modules.json
 * Server-only — never import from client / manifests.ts.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import type { ModuleOutputFormat } from "@/types/module";
import {
  CUSTOM_MODULE_DESCRIPTION_FALLBACK,
  type RemoteModuleRecord,
} from "@/modules/custom-remote/factory";

const STORE_DIR = path.join(process.cwd(), "data", "local");
const STORE_FILE = path.join(STORE_DIR, "custom-modules.json");

const OUTPUT_FORMATS: readonly ModuleOutputFormat[] = [
  "carousel_4_5",
  "video_9_16",
  "single_image",
];

type StoreFile = {
  version: 1;
  modules: RemoteModuleRecord[];
};

function emptyStore(): StoreFile {
  return { version: 1, modules: [] };
}

function isOutputFormat(v: unknown): v is ModuleOutputFormat {
  return (
    typeof v === "string" &&
    (OUTPUT_FORMATS as readonly string[]).includes(v)
  );
}

function parseRecord(raw: unknown): RemoteModuleRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" || !r.id.startsWith("custom-")) return null;
  if (typeof r.title !== "string" || !r.title.trim()) return null;
  if (!isOutputFormat(r.outputFormat)) return null;
  if (typeof r.workerEndpoint !== "string" || !r.workerEndpoint.trim()) {
    return null;
  }
  return {
    id: r.id,
    title: r.title.trim(),
    description:
      typeof r.description === "string" && r.description.trim()
        ? r.description.trim()
        : CUSTOM_MODULE_DESCRIPTION_FALLBACK,
    version: typeof r.version === "string" ? r.version : "0.1.0",
    outputFormat: r.outputFormat,
    icon: typeof r.icon === "string" ? r.icon : "Puzzle",
    workerEndpoint: r.workerEndpoint.trim(),
  };
}

export async function readCustomModuleRecords(): Promise<RemoteModuleRecord[]> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreFile>;
    const list = Array.isArray(parsed.modules) ? parsed.modules : [];
    return list
      .map(parseRecord)
      .filter((m): m is RemoteModuleRecord => m !== null);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    // eslint-disable-next-line no-console -- operational; no secrets
    console.warn("[custom-modules-store] read failed", code ?? "unknown");
    return [];
  }
}

export async function writeCustomModuleRecords(
  modules: RemoteModuleRecord[],
): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  const payload: StoreFile = { version: 1, modules };
  const tmp = `${STORE_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(payload, null, 2), "utf8");
  await fs.rename(tmp, STORE_FILE);
}

/** Upsert one record by id; returns the full list after write. */
export async function upsertCustomModuleRecord(
  record: RemoteModuleRecord,
): Promise<RemoteModuleRecord[]> {
  const existing = await readCustomModuleRecords();
  const idx = existing.findIndex((m) => m.id === record.id);
  if (idx >= 0) {
    existing[idx] = record;
  } else {
    existing.push(record);
  }
  await writeCustomModuleRecords(existing);
  return existing;
}

export function customModulesStorePath(): string {
  return STORE_FILE;
}

export { OUTPUT_FORMATS };
