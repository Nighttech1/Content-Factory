/**
 * Приёмник данных Scout: наши (@mosarmclub) + конкуренты по модулю.
 * Scout (облачный агент) парсит через Apify (MCP) и пушит сюда; веб-лента
 * показывает реальные посты вместо пустоты. Без Prisma — JSON-стор.
 *
 * Хранилище: data/local/scout-feed.json (gitignored).
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import type { FeedPost } from "@/lib/studio/feed-types";

const STORE_DIR = path.join(process.cwd(), "data", "local");
const STORE_FILE = path.join(STORE_DIR, "scout-feed.json");
const MAX_PER_SIDE = 60;

export type ScoutFeedModule = {
  ours: FeedPost[];
  competitors: FeedPost[];
  updatedAt: string;
};

type ScoutFeedFile = Record<string, ScoutFeedModule>;

export type ScoutPostInput = {
  id?: unknown;
  title?: unknown;
  thumbUrl?: unknown;
  username?: unknown;
  followers?: unknown;
  likes?: unknown;
  views?: unknown;
};

function genId(side: string): string {
  return `${side}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export function normalizeScoutPost(
  input: ScoutPostInput,
  source: "ours" | "competitor",
): FeedPost | null {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const thumbUrl =
    typeof input.thumbUrl === "string" && input.thumbUrl.trim()
      ? input.thumbUrl.trim()
      : undefined;
  if (!title && !thumbUrl) return null;
  return {
    id: typeof input.id === "string" && input.id.trim() ? input.id.trim() : genId(source),
    source,
    title: title || "(без заголовка)",
    thumbUrl,
    metrics: { likes: num(input.likes), views: num(input.views) },
    sourceMode: "live",
    username:
      typeof input.username === "string" && input.username.trim()
        ? input.username.trim()
        : undefined,
    followers: input.followers != null ? num(input.followers) : undefined,
  };
}

async function readFile(): Promise<ScoutFeedFile> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as ScoutFeedFile) : {};
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return {};
    // eslint-disable-next-line no-console -- operational; no secrets
    console.warn("[scout-feed] read failed", code ?? "unknown");
    return {};
  }
}

export async function readScoutFeed(
  moduleId: string,
): Promise<ScoutFeedModule | null> {
  const file = await readFile();
  return file[moduleId] ?? null;
}

export async function setScoutFeed(
  moduleId: string,
  data: { ours: FeedPost[]; competitors: FeedPost[] },
): Promise<ScoutFeedModule> {
  const file = await readFile();
  const entry: ScoutFeedModule = {
    ours: data.ours.slice(0, MAX_PER_SIDE),
    competitors: data.competitors.slice(0, MAX_PER_SIDE),
    updatedAt: new Date().toISOString(),
  };
  file[moduleId] = entry;
  await fs.mkdir(STORE_DIR, { recursive: true });
  const tmp = `${STORE_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(file, null, 2), "utf8");
  await fs.rename(tmp, STORE_FILE);
  return entry;
}
