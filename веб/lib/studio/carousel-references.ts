/**
 * Карусели-образцы, присланные владельцем агенту («сделай так же»).
 * Агент (через облачный чат) пушит их в веб; они показываются ПЕРВЫМИ
 * в колонке «Конкуренты» на экране Карусели — выше находок Разведчика.
 *
 * Хранилище: data/local/carousel-references.json (gitignored). Без Prisma.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import type { FeedPost } from "@/lib/studio/feed-types";

const STORE_DIR = path.join(process.cwd(), "data", "local");
const STORE_FILE = path.join(STORE_DIR, "carousel-references.json");
const MAX_REFS = 50;

export type ReferenceInput = {
  id?: unknown;
  title?: unknown;
  thumbUrl?: unknown;
  username?: unknown;
  note?: unknown;
};

function genId(): string {
  return `ref-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function normalizeReference(input: ReferenceInput): FeedPost | null {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const thumbUrl =
    typeof input.thumbUrl === "string" && input.thumbUrl.trim()
      ? input.thumbUrl.trim()
      : undefined;
  if (!title && !thumbUrl) return null;
  const id =
    typeof input.id === "string" && input.id.trim() ? input.id.trim() : genId();
  const username =
    typeof input.username === "string" && input.username.trim()
      ? input.username.trim()
      : "образец";
  return {
    id,
    source: "competitor",
    title: title || "Карусель-образец",
    thumbUrl,
    metrics: { likes: 0, views: 0 },
    sourceMode: "mock",
    username,
    isReference: true,
  };
}

export async function readCarouselReferences(): Promise<FeedPost[]> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is FeedPost =>
        !!p &&
        typeof p === "object" &&
        typeof (p as FeedPost).id === "string" &&
        (p as FeedPost).isReference === true,
    );
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    // eslint-disable-next-line no-console -- operational; no secrets
    console.warn("[carousel-references] read failed", code ?? "unknown");
    return [];
  }
}

async function writeAll(refs: FeedPost[]): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  const tmp = `${STORE_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(refs, null, 2), "utf8");
  await fs.rename(tmp, STORE_FILE);
}

/** Идемпотентный upsert по id; новейшие — первыми. */
export async function addCarouselReference(post: FeedPost): Promise<FeedPost[]> {
  const existing = await readCarouselReferences();
  const rest = existing.filter((p) => p.id !== post.id);
  const next = [post, ...rest].slice(0, MAX_REFS);
  await writeAll(next);
  return next;
}
