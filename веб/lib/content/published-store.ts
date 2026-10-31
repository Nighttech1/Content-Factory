/**
 * Published-content store — "ячейка дашборда" для готовых единиц от агентов.
 *
 * Агенты фабрики (после апрува человека в облачном чате) пушат готовую единицу
 * сюда через POST /api/content/ingest. Веб-дашборд читает этот стор и показывает
 * раздел «Опубликовано».
 *
 * Хранилище: data/local/published-content.json — НИКОГДА секреты; gitignored
 * (data/local/*). Атомарная запись (tmp + rename), как в analytics/insights-cache.
 * Prisma не трогаем — JSON-стор, чтобы прод-сборка оставалась зелёной и без миграций.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const STORE_DIR = path.join(process.cwd(), "data", "local");
const STORE_FILE = path.join(STORE_DIR, "published-content.json");

/** Максимум единиц в сторе (ротация, без вечного архива — медиа хостит VPS/площадка). */
const MAX_UNITS = 500;

export type PublishedContentType =
  | "carousel"
  | "reel"
  | "article"
  | "youtube"
  | "post";

export type PublishedContentStatus = "approved" | "published";

export type PublishedAsset = {
  /** Вид ассета: slide | cover | video | image | thumbnail | file. */
  kind: string;
  /** Внешний URL (хостит площадка/VPS/хранилище) — в git байтов нет. */
  url: string;
  alt?: string;
};

export type PublishedUnit = {
  /** Уникальный id единицы в сторе (если агент не прислал — генерим). */
  id: string;
  /** ID из контент-плана, напр. V-202611-18. */
  unitId?: string;
  type: PublishedContentType;
  title: string;
  status: PublishedContentStatus;
  /** Медиа: ссылки, не файлы. */
  assets: PublishedAsset[];
  /** Для статей — упорядоченные блоки (h/p/img/video), как Telegra.ph. */
  blocks?: unknown;
  /** Площадки, куда владелец (пока вручную) выложил / планирует. */
  channels?: string[];
  /** Произвольные метаданные (автор-агент, заметки апрува и т.п.). */
  meta?: Record<string, unknown>;
  /** Кто прислал (имя агента/отдела). */
  source?: string;
  /** Когда единица принята дашбордом (ISO). */
  ingestedAt: string;
  /** Когда помечена опубликованной (ISO), если задано. */
  publishedAt?: string;
};

export type PublishedStoreKind = "json";

const VALID_TYPES: PublishedContentType[] = [
  "carousel",
  "reel",
  "article",
  "youtube",
  "post",
];

function isValidType(v: unknown): v is PublishedContentType {
  return typeof v === "string" && (VALID_TYPES as string[]).includes(v);
}

function normalizeAssets(input: unknown): PublishedAsset[] {
  if (!Array.isArray(input)) return [];
  const out: PublishedAsset[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const rec = raw as Record<string, unknown>;
    const url = typeof rec.url === "string" ? rec.url.trim() : "";
    if (!url) continue;
    out.push({
      kind: typeof rec.kind === "string" && rec.kind.trim() ? rec.kind.trim() : "image",
      url,
      alt: typeof rec.alt === "string" ? rec.alt : undefined,
    });
  }
  return out;
}

function normalizeStringArray(input: unknown): string[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const out = input.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  return out.length ? out : undefined;
}

export type PublishedIngestInput = {
  id?: unknown;
  unitId?: unknown;
  type?: unknown;
  title?: unknown;
  status?: unknown;
  assets?: unknown;
  blocks?: unknown;
  channels?: unknown;
  meta?: unknown;
  source?: unknown;
  publishedAt?: unknown;
};

export type NormalizeResult =
  | { ok: true; unit: PublishedUnit }
  | { ok: false; error: string };

function genId(type: string): string {
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${type}-${Date.now().toString(36)}-${rnd}`;
}

/** Проверяет и нормализует вход от агента в PublishedUnit. */
export function normalizeIngest(input: PublishedIngestInput): NormalizeResult {
  if (!isValidType(input.type)) {
    return { ok: false, error: "type must be one of carousel|reel|article|youtube|post" };
  }
  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (!title) {
    return { ok: false, error: "title is required" };
  }
  const status: PublishedContentStatus =
    input.status === "published" ? "published" : "approved";
  const id =
    typeof input.id === "string" && input.id.trim() ? input.id.trim() : genId(input.type);
  const now = new Date().toISOString();

  const unit: PublishedUnit = {
    id,
    unitId:
      typeof input.unitId === "string" && input.unitId.trim()
        ? input.unitId.trim()
        : undefined,
    type: input.type,
    title,
    status,
    assets: normalizeAssets(input.assets),
    blocks: input.blocks ?? undefined,
    channels: normalizeStringArray(input.channels),
    meta:
      input.meta && typeof input.meta === "object"
        ? (input.meta as Record<string, unknown>)
        : undefined,
    source: typeof input.source === "string" && input.source.trim() ? input.source.trim() : undefined,
    ingestedAt: now,
    publishedAt:
      typeof input.publishedAt === "string" && input.publishedAt.trim()
        ? input.publishedAt.trim()
        : status === "published"
          ? now
          : undefined,
  };
  return { ok: true, unit };
}

export async function readPublished(): Promise<PublishedUnit[]> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (u): u is PublishedUnit =>
        !!u &&
        typeof u === "object" &&
        typeof (u as PublishedUnit).id === "string" &&
        isValidType((u as PublishedUnit).type),
    );
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    // eslint-disable-next-line no-console -- operational; no secrets
    console.warn("[content/published-store] read failed", code ?? "unknown");
    return [];
  }
}

async function writeAll(units: PublishedUnit[]): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  const tmp = `${STORE_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(units, null, 2), "utf8");
  await fs.rename(tmp, STORE_FILE);
}

/**
 * Идемпотентный upsert: повтор того же id не плодит дубли (перезаписывает).
 * Новейшие — в начало; хвост обрезается до MAX_UNITS (ротация).
 */
export async function upsertPublished(unit: PublishedUnit): Promise<PublishedUnit[]> {
  const existing = await readPublished();
  const rest = existing.filter((u) => u.id !== unit.id);
  const next = [unit, ...rest].slice(0, MAX_UNITS);
  await writeAll(next);
  return next;
}
