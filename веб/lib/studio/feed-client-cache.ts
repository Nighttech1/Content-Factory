/**
 * C-142 / S50 — client bootstrap + last-known feed cache for studio module workspace.
 * S50: carousel/reels bootstrap competitors empty (not mock fixtures) so abort/timeout
 * cannot leave picsum mocks painted as «live». Cache may upgrade to live.
 */

import {
  emptyFeed,
  resolveFeed,
} from "@/lib/studio/feed-fixtures";
import type { FeedResponse, FeedSourceMode } from "@/lib/studio/feed-types";
import { isCustomModuleId } from "@/lib/studio/feed-types";

export const FEED_CACHE_STORAGE_PREFIX = "cf.studio.feed.cache.v1:";

/**
 * Soft-fail timeout for live feed fetch.
 * Apify run-sync often exceeds 8s — S50 raised so first live paint can complete
 * (server TTL cache makes later loads fast).
 */
export const FEED_FETCH_TIMEOUT_MS = 120_000;

/**
 * S51 — client TTL: skip network refetch while localStorage feed is fresh.
 * Aligns with server Apify raw TTL (30 min) so remount/focus does not re-burn CU.
 */
export const FEED_CLIENT_CACHE_TTL_MS = 30 * 60 * 1000;

type CachedFeedPayload = {
  v: 1;
  moduleId: string;
  savedAt: number;
  feed: FeedResponse;
};

function cacheKey(moduleId: string): string {
  return `${FEED_CACHE_STORAGE_PREFIX}${moduleId}`;
}

function isFeedPostArray(value: unknown): boolean {
  return Array.isArray(value);
}

function isFeedResponse(value: unknown): value is FeedResponse {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (!isFeedPostArray(o.ours) || !isFeedPostArray(o.competitors)) return false;
  const mode = o.sourceMode;
  return mode === "live" || mode === "mock";
}

/**
 * Deterministic first paint (SSR + client).
 * S50: for carousel-engine / custom-reels — empty competitors (and empty ours for reels)
 * so mock picsum never sticks when live Apify is slow/aborted. Other core modules keep fixtures.
 */
export function bootstrapFeed(moduleId: string): FeedResponse {
  if (moduleId === "carousel-engine") {
    const fixture = resolveFeed(moduleId);
    if (!fixture) return emptyFeed();
    return {
      ours: fixture.ours,
      competitors: [],
      sourceMode: "mock",
    };
  }
  if (moduleId === "custom-reels") {
    return emptyFeed();
  }
  const fixture = resolveFeed(moduleId);
  if (fixture) return fixture;
  if (isCustomModuleId(moduleId)) return emptyFeed();
  return emptyFeed();
}

function parseFeedCachePayload(moduleId: string): CachedFeedPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(cacheKey(moduleId));
    if (raw == null || raw === "") return null;
    const parsed = JSON.parse(raw) as CachedFeedPayload;
    if (
      !parsed ||
      parsed.v !== 1 ||
      parsed.moduleId !== moduleId ||
      !isFeedResponse(parsed.feed) ||
      typeof parsed.savedAt !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function normalizeCachedFeed(
  moduleId: string,
  feed: FeedResponse,
): FeedResponse {
  let competitors = feed.competitors;
  /** S50 — stale mock competitor cache must not re-paint as «live» feed. */
  if (
    (moduleId === "carousel-engine" || moduleId === "custom-reels") &&
    Array.isArray(competitors) &&
    competitors.length > 0 &&
    competitors.every(
      (p) =>
        p &&
        typeof p === "object" &&
        (p as { sourceMode?: string }).sourceMode === "mock",
    )
  ) {
    competitors = [];
  }
  const ours = feed.ours;
  const anyLive = [...ours, ...competitors].some(
    (p) =>
      p &&
      typeof p === "object" &&
      (p as { sourceMode?: string }).sourceMode === "live",
  );
  return {
    ours,
    competitors,
    sourceMode: (anyLive ? "live" : "mock") as FeedSourceMode,
  };
}

export function readFeedCache(moduleId: string): FeedResponse | null {
  const parsed = parseFeedCachePayload(moduleId);
  if (!parsed) return null;
  return normalizeCachedFeed(moduleId, parsed.feed);
}

/** Age of localStorage feed cache in ms, or null if missing/invalid. */
export function readFeedCacheAgeMs(moduleId: string): number | null {
  const parsed = parseFeedCachePayload(moduleId);
  if (!parsed) return null;
  return Math.max(0, Date.now() - parsed.savedAt);
}

/**
 * S51 — true when cached feed is within TTL.
 * Does not imply live; caller should also check sourceMode / posts.
 */
export function isFeedCacheFresh(
  moduleId: string,
  ttlMs: number = FEED_CLIENT_CACHE_TTL_MS,
): boolean {
  const age = readFeedCacheAgeMs(moduleId);
  return age != null && age < ttlMs;
}

/**
 * S51 — skip paid feed GET when we already have a fresh live paint.
 * Topic search / explicit refresh still force network.
 */
export function shouldSkipFeedNetworkFetch(moduleId: string): boolean {
  if (!isFeedCacheFresh(moduleId)) return false;
  const feed = readFeedCache(moduleId);
  if (!feed) return false;
  if (feed.sourceMode !== "live") return false;
  return feedHasPosts(feed);
}

export function writeFeedCache(moduleId: string, feed: FeedResponse): void {
  if (typeof window === "undefined") return;
  try {
    const payload: CachedFeedPayload = {
      v: 1,
      moduleId,
      savedAt: Date.now(),
      feed: {
        ours: feed.ours,
        competitors: feed.competitors,
        sourceMode: feed.sourceMode,
      },
    };
    window.localStorage.setItem(cacheKey(moduleId), JSON.stringify(payload));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function feedHasPosts(feed: FeedResponse): boolean {
  return feed.ours.length > 0 || feed.competitors.length > 0;
}
