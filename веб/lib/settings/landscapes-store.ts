/**
 * Settings Landscapes (character catalog) — JSON SoT.
 * Sheet `hero` number → catalog entry for {{CHARACTER_CATALOG}}.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const STORE_DIR = path.join(process.cwd(), "data", "local");
const STORE_FILE = path.join(STORE_DIR, "landscapes-catalog.json");

export type LandscapeCharacter = {
  number: number;
  name: string;
  photoUrls: string[];
  updatedAt: string;
};

type LandscapesFile = {
  byUser: Record<string, LandscapeCharacter[]>;
};

function empty(): LandscapesFile {
  return { byUser: {} };
}

async function readFile(): Promise<LandscapesFile> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<LandscapesFile>;
    return { byUser: parsed.byUser ?? {} };
  } catch {
    return empty();
  }
}

async function writeFile(data: LandscapesFile): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function listLandscapes(
  userId: string,
): Promise<LandscapeCharacter[]> {
  const file = await readFile();
  const list = file.byUser[userId] ?? [];
  return [...list].sort((a, b) => a.number - b.number);
}

export async function getLandscape(
  userId: string,
  number: number,
): Promise<LandscapeCharacter | null> {
  const list = await listLandscapes(userId);
  return list.find((c) => c.number === number) ?? null;
}

/** Full replace catalog (Frontend PUT). Numbers must be unique positive ints. */
export async function putLandscapes(
  userId: string,
  characters: Array<{
    number?: number;
    name: string;
    photoUrls?: string[];
  }>,
): Promise<LandscapeCharacter[]> {
  const now = new Date().toISOString();
  const next: LandscapeCharacter[] = [];
  const used = new Set<number>();
  let auto = 1;
  for (const c of characters) {
    let n =
      typeof c.number === "number" && Number.isFinite(c.number) && c.number > 0
        ? Math.floor(c.number)
        : 0;
    if (!n || used.has(n)) {
      while (used.has(auto)) auto += 1;
      n = auto;
      auto += 1;
    }
    used.add(n);
    const name = typeof c.name === "string" ? c.name.trim() : "";
    if (!name) continue;
    next.push({
      number: n,
      name,
      photoUrls: Array.isArray(c.photoUrls)
        ? c.photoUrls.filter((u) => typeof u === "string" && u.trim())
        : [],
      updatedAt: now,
    });
  }
  next.sort((a, b) => a.number - b.number);
  const file = await readFile();
  file.byUser[userId] = next;
  await writeFile(file);
  return next;
}

export async function upsertLandscape(
  userId: string,
  input: {
    number?: number;
    name: string;
    photoUrls?: string[];
  },
): Promise<LandscapeCharacter> {
  const list = await listLandscapes(userId);
  const name = input.name.trim();
  if (!name) {
    const err = new Error("name_required");
    (err as Error & { code: string }).code = "name_required";
    throw err;
  }
  let number = input.number;
  if (!number || number < 1) {
    const max = list.reduce((m, c) => Math.max(m, c.number), 0);
    number = max + 1;
  }
  const now = new Date().toISOString();
  const idx = list.findIndex((c) => c.number === number);
  const row: LandscapeCharacter = {
    number,
    name,
    photoUrls: Array.isArray(input.photoUrls)
      ? input.photoUrls.filter((u) => typeof u === "string" && u.trim())
      : idx >= 0
        ? list[idx]!.photoUrls
        : [],
    updatedAt: now,
  };
  if (idx >= 0) list[idx] = row;
  else list.push(row);
  await putLandscapes(
    userId,
    list.map((c) => ({
      number: c.number,
      name: c.name,
      photoUrls: c.photoUrls,
    })),
  );
  return row;
}

export async function deleteLandscape(
  userId: string,
  number: number,
): Promise<boolean> {
  const list = await listLandscapes(userId);
  const next = list.filter((c) => c.number !== number);
  if (next.length === list.length) return false;
  await putLandscapes(
    userId,
    next.map((c) => ({
      number: c.number,
      name: c.name,
      photoUrls: c.photoUrls,
    })),
  );
  return true;
}

/** Strip data-URLs from catalog — binary in LLM prompts → aggregator 400. */
function sanitizePhotoUrlForLlm(url: string): string {
  const u = url.trim();
  if (!u) return "";
  if (/^data:image\//i.test(u)) {
    const mime = u.slice(5, u.indexOf(";")) || "image";
    return `[photo ${mime}; binary omitted]`;
  }
  if (u.length > 300) return `${u.slice(0, 120)}…[truncated]`;
  return u;
}

/** JSON string for {{CHARACTER_CATALOG}}; optional filter by hero number. */
export function formatCharacterCatalogJson(
  characters: LandscapeCharacter[],
  hero?: number | null,
): string {
  const filtered =
    hero != null && hero > 0
      ? characters.filter((c) => c.number === hero)
      : characters;
  return JSON.stringify(
    filtered.map((c) => ({
      id: c.number,
      name: c.name,
      photoUrls: c.photoUrls.map(sanitizePhotoUrlForLlm).filter(Boolean),
    })),
  );
}
