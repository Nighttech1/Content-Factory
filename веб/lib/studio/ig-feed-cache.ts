/**
 * C-36 / C-39 / C-s51 — in-memory TTL cache for Instagram Studio feed (no Redis).
 * Default TTL 10 minutes (D1 Graph). Apify raw dataset uses longer TTL (cost).
 */

export const IG_FEED_CACHE_TTL_MS = 10 * 60 * 1000;

/** S51 — Apify raw posts+reels reuse across carousel/reels remounts. */
export const APIFY_RAW_CACHE_TTL_MS = 30 * 60 * 1000;

/**
 * Soft cap on Apify run-sync POSTs per process hour (each posts|reels call = 1).
 * Override via `APIFY_IG_MAX_RUNS_PER_HOUR` (integer ≥1). Default 24 ≈ 12 full scrapes.
 */
export const APIFY_DEFAULT_MAX_RUNS_PER_HOUR = 24;

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();
const apifyRunTimestamps: number[] = [];

export function getCached<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function setCached<T>(
  key: string,
  value: T,
  ttlMs: number = IG_FEED_CACHE_TTL_MS,
): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * S51 — concurrent identical keys share one Promise (Strict Mode / dual module).
 */
export function getOrCreateInFlight<T>(
  key: string,
  factory: () => Promise<T>,
): Promise<T> {
  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;

  const created = factory().finally(() => {
    if (inFlight.get(key) === created) {
      inFlight.delete(key);
    }
  });
  inFlight.set(key, created);
  return created;
}

function readMaxRunsPerHour(): number {
  const raw = process.env.APIFY_IG_MAX_RUNS_PER_HOUR?.trim();
  if (!raw) return APIFY_DEFAULT_MAX_RUNS_PER_HOUR;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return APIFY_DEFAULT_MAX_RUNS_PER_HOUR;
  return Math.floor(n);
}

/**
 * S51 — consume one Apify run-sync slot. Returns false when hourly budget exhausted.
 * Does not log secrets.
 */
export function tryConsumeApifyRunSlot(): boolean {
  const max = readMaxRunsPerHour();
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  while (
    apifyRunTimestamps.length > 0 &&
    now - (apifyRunTimestamps[0] ?? 0) > windowMs
  ) {
    apifyRunTimestamps.shift();
  }
  if (apifyRunTimestamps.length >= max) {
    return false;
  }
  apifyRunTimestamps.push(now);
  return true;
}

/** Test helper — remaining slots after prune (no side-effect consume). */
export function apifyRunsUsedInLastHour(): number {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  return apifyRunTimestamps.filter((t) => now - t <= windowMs).length;
}

/** Test / smoke helper — clear all feed cache entries + in-flight + run budget. */
export function clearIgFeedCache(): void {
  store.clear();
  inFlight.clear();
  apifyRunTimestamps.length = 0;
}

export function igFeedCacheKeyOurs(igUserId: string): string {
  return `carousel-engine:ours:${igUserId}`;
}

export type IgCompetitorsCacheParts = {
  topic: string;
  hashtags: string[];
  /** Included when BD fallback was used / configured for key stability. */
  usernames?: string[];
};

/**
 * Competitors cache key includes normalized topic + sorted hashtags (+ optional BD usernames).
 */
export function igFeedCacheKeyCompetitors(
  igUserId: string,
  parts: IgCompetitorsCacheParts,
): string {
  const topicNorm = parts.topic.trim().toLowerCase().replace(/\s+/g, " ");
  const tags = [...parts.hashtags]
    .map((t) => t.toLowerCase().replace(/^#/, ""))
    .filter(Boolean)
    .sort()
    .join(",");
  const users = (parts.usernames ?? [])
    .map((u) => u.toLowerCase())
    .filter(Boolean)
    .sort()
    .join(",");
  return `carousel-engine:competitors:${igUserId}:t=${topicNorm}:h=${tags}:u=${users}`;
}

/** C-114 — raw Apify dataset cache (no token in key). */
export function igFeedCacheKeyApifyRaw(tag: string): string {
  const t = tag.toLowerCase().replace(/^#/, "").trim();
  return `apify:ig-scraper:h=${t}:limit=50`;
}

/** Optional per-module filtered competitors cache. */
export function igFeedCacheKeyApifyModule(
  moduleId: string,
  topic: string,
  tags: string[],
): string {
  const topicNorm = topic.trim().toLowerCase().replace(/\s+/g, " ");
  const h = [...tags]
    .map((t) => t.toLowerCase().replace(/^#/, ""))
    .filter(Boolean)
    .sort()
    .join(",");
  return `apify:competitors:${moduleId}:t=${topicNorm}:h=${h}`;
}
