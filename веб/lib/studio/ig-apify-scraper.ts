/**
 * C-114 / C-115 — Apify Instagram Scraper → FeedPost competitors.
 * Soft-fail: network/HTTP/empty → []. Never logs API key.
 */

import {
  APIFY_RAW_CACHE_TTL_MS,
  getCached,
  getOrCreateInFlight,
  igFeedCacheKeyApifyRaw,
  setCached,
  tryConsumeApifyRunSlot,
} from "@/lib/studio/ig-feed-cache";
import {
  isIgScraperConfigured,
  readIgScraperConfig,
} from "@/lib/studio/ig-scraper-config";
import type { FeedPost } from "@/lib/studio/feed-types";
import {
  hashtagsForGraphQuery,
  IG_NICHE_DEFAULT_HASHTAGS,
  mapTopicToHashtags,
  parseDefaultHashtags,
} from "@/lib/studio/topic-hashtags";

export const APIFY_IG_RESULTS_LIMIT = 50;
const ACTOR_SYNC_PATH =
  "/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items";
const SYNC_TIMEOUT_SEC = 300;

/** Raw Apify dataset item (defensive — schema may drift). */
export type ApifyIgItem = {
  id?: string | number;
  shortCode?: string;
  type?: string;
  productType?: string;
  caption?: string;
  displayUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  childPosts?: Array<{
    displayUrl?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
  }>;
  images?: string[];
  likesCount?: number;
  commentsCount?: number;
  videoViewCount?: number;
  videoPlayCount?: number;
  ownerUsername?: string;
  owner?: { username?: string; followersCount?: number };
  /** S49 — profile followers when actor returns them */
  followersCount?: number;
  ownerFollowersCount?: number;
  url?: string;
  /** Actor error row (empty/private hashtag) — skip. */
  error?: string;
  errorDescription?: string;
};

function titleFromCaption(caption: string | undefined, fallbackId: string): string {
  const raw = (caption ?? "").trim();
  if (!raw) return `IG post ${fallbackId}`;
  const firstLine = raw.split(/\r?\n/)[0]?.trim() || raw;
  return firstLine.length > 120 ? `${firstLine.slice(0, 117)}…` : firstLine;
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function viewsFromItem(item: ApifyIgItem): number {
  return num(item.videoViewCount) || num(item.videoPlayCount) || 0;
}

export function popularityScore(item: ApifyIgItem): number {
  return num(item.likesCount) + num(item.commentsCount) + viewsFromItem(item);
}

export function popularityScorePost(p: FeedPost): number {
  return (
    (Number(p.metrics.likes) || 0) +
    (Number(p.metrics.comments) || 0) +
    (Number(p.metrics.views) || 0)
  );
}

function normalizeTypeHint(item: ApifyIgItem): string {
  return `${item.type ?? ""} ${item.productType ?? ""}`.toLowerCase();
}

/**
 * D4: Sidecar / multi children → CAROUSEL; Video/Reel/Clips → VIDEO; else IMAGE.
 */
export function mapApifyMediaType(
  item: ApifyIgItem,
): "CAROUSEL_ALBUM" | "IMAGE" | "VIDEO" {
  const children = Array.isArray(item.childPosts) ? item.childPosts : [];
  const hint = normalizeTypeHint(item);

  if (
    hint.includes("sidecar") ||
    children.length > 1 ||
    (Array.isArray(item.images) && item.images.length > 1)
  ) {
    return "CAROUSEL_ALBUM";
  }

  if (
    hint.includes("video") ||
    hint.includes("reel") ||
    hint.includes("clips") ||
    Boolean(item.videoUrl)
  ) {
    return "VIDEO";
  }

  return "IMAGE";
}

function slideUrlsFromItem(item: ApifyIgItem): string[] | undefined {
  const children = Array.isArray(item.childPosts) ? item.childPosts : [];
  if (children.length > 0) {
    const urls = children
      .map((c) => c.displayUrl || c.thumbnailUrl || c.videoUrl)
      .filter((u): u is string => Boolean(u));
    if (urls.length > 0) return urls;
  }
  if (Array.isArray(item.images) && item.images.length > 0) {
    const imgs = item.images.filter(Boolean);
    if (imgs.length > 0) return imgs;
  }
  // S50 — live cards need at least cover URL for Razbor/Create L/R
  const cover = item.displayUrl || item.thumbnailUrl || item.videoUrl;
  return cover ? [cover] : undefined;
}

/**
 * Map one Apify dataset item → competitor FeedPost (or null if no id).
 */
export function mapApifyItemToFeedPost(item: ApifyIgItem): FeedPost | null {
  if (item.error) return null;

  const externalId = String(item.id ?? item.shortCode ?? "").trim();
  if (!externalId) return null;

  const mediaType = mapApifyMediaType(item);
  const thumbUrl =
    item.thumbnailUrl || item.displayUrl || item.videoUrl || undefined;
  /** S50 — always attach slideUrls for carousels (and multi-image) when API has them. */
  const slideUrls =
    mediaType === "CAROUSEL_ALBUM" || mediaType === "IMAGE"
      ? slideUrlsFromItem(item)
      : undefined;

  const username =
    (item.ownerUsername ?? item.owner?.username ?? "")
      .trim()
      .replace(/^@/, "") || undefined;

  const followersRaw =
    num(item.followersCount) ||
    num(item.ownerFollowersCount) ||
    num(item.owner?.followersCount) ||
    0;

  return {
    id: `ig-competitor-${externalId}`,
    source: "competitor",
    title: titleFromCaption(item.caption, externalId),
    thumbUrl,
    mediaUrl: mediaType === "VIDEO" ? item.videoUrl || undefined : undefined,
    metrics: {
      likes: num(item.likesCount),
      comments: num(item.commentsCount),
      views: viewsFromItem(item),
    },
    sourceMode: "live",
    username,
    /** S49 — plaque `name | Nк`; fixtures fill if missing */
    ...(followersRaw > 0 ? { followers: followersRaw } : {}),
    externalId,
    permalink: item.url || undefined,
    mediaType,
    slideUrls,
  };
}

/** Map + sort by popularity desc (D3). */
export function mapApifyDatasetToFeedPosts(items: ApifyIgItem[]): FeedPost[] {
  const scored = items
    .map((item) => ({ item, score: popularityScore(item) }))
    .sort((a, b) => b.score - a.score);

  const byId = new Map<string, FeedPost>();
  for (const { item } of scored) {
    const post = mapApifyItemToFeedPost(item);
    if (!post || !post.externalId) continue;
    if (!byId.has(post.externalId)) {
      byId.set(post.externalId, post);
    }
  }
  return [...byId.values()].sort(
    (a, b) => popularityScorePost(b) - popularityScorePost(a),
  );
}

/**
 * D4 module split:
 * - carousel-engine: CAROUSEL_ALBUM first, IMAGE backfill; no VIDEO
 * - custom-reels: VIDEO only
 */
export function filterCompetitorsForModule(
  moduleId: string,
  posts: FeedPost[],
): FeedPost[] {
  if (moduleId === "custom-reels") {
    return posts.filter((p) => p.mediaType === "VIDEO");
  }

  if (moduleId === "carousel-engine") {
    const carousels = posts.filter((p) => p.mediaType === "CAROUSEL_ALBUM");
    const images = posts.filter((p) => p.mediaType === "IMAGE");
    return [...carousels, ...images];
  }

  return posts;
}

function primaryHashtag(topic?: string): string {
  const defaults = parseDefaultHashtags(
    process.env.IG_DEFAULT_HASHTAGS,
    IG_NICHE_DEFAULT_HASHTAGS,
  );
  const mapped = mapTopicToHashtags(topic, defaults);
  const tags = hashtagsForGraphQuery(mapped);
  const primary = (tags[0] ?? defaults[0] ?? "armenianclub")
    .replace(/^#/, "")
    .toLowerCase();
  return primary;
}

/**
 * Build POST URL.
 * - If `baseUrl` already contains `/acts/` (full actor path), use it and ensure timeout query.
 * - Else append default actor sync path under API root.
 */
export function buildApifyRunUrl(baseUrl: string): string {
  const root = baseUrl.replace(/\/$/, "");
  let url: string;
  if (root.includes("/acts/")) {
    url = root.includes("run-sync-get-dataset-items")
      ? root
      : `${root}/run-sync-get-dataset-items`;
  } else {
    url = `${root}${ACTOR_SYNC_PATH}`;
  }
  const u = new URL(url);
  if (!u.searchParams.has("timeout")) {
    u.searchParams.set("timeout", String(SYNC_TIMEOUT_SEC));
  }
  return u.toString();
}

async function runApifyOnce(
  config: { token: string; baseUrl: string },
  tag: string,
  resultsType: "posts" | "reels",
): Promise<ApifyIgItem[]> {
  if (!tryConsumeApifyRunSlot()) {
    // eslint-disable-next-line no-console
    console.warn(
      `[ig-apify] maxRunsPerHour exhausted; skip run-sync type=${resultsType} tag=${tag}`,
    );
    return [];
  }

  const url = buildApifyRunUrl(config.baseUrl);
  const bare = tag.replace(/^#/, "").toLowerCase();
  /**
   * Hashtag `search` often returns `no_items` on this actor.
   * Locked: explore-tags via `directUrls`. Posts ≠ reels — need both runs.
   * Each call bills up to resultsLimit items (PPE) — keep ≤50 (S51).
   */
  const body = {
    directUrls: [`https://www.instagram.com/explore/tags/${bare}/`],
    resultsType,
    resultsLimit: APIFY_IG_RESULTS_LIMIT,
  };

  // eslint-disable-next-line no-console
  console.info(
    `[ig-apify] run-sync MISS type=${resultsType} tag=${tag} limit=${APIFY_IG_RESULTS_LIMIT}`,
  );

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.warn(
      `[ig-apify] run-sync HTTP ${res.status} tag=${tag} type=${resultsType} (token not logged)`,
    );
    return [];
  }

  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    // eslint-disable-next-line no-console
    console.warn(
      `[ig-apify] dataset not an array type=${resultsType}; soft-fail`,
    );
    return [];
  }

  return (data as ApifyIgItem[]).filter((row) => !row.error);
}

async function fetchApifyDatasetRawUncached(
  tag: string,
): Promise<ApifyIgItem[]> {
  const config = readIgScraperConfig();
  if (!config) return [];

  try {
    const [posts, reels] = await Promise.all([
      runApifyOnce(config, tag, "posts"),
      runApifyOnce(config, tag, "reels"),
    ]);

    const byId = new Map<string, ApifyIgItem>();
    for (const item of [...posts, ...reels]) {
      const id = String(item.id ?? item.shortCode ?? "").trim();
      if (!id || byId.has(id)) continue;
      byId.set(id, item);
    }
    const items = [...byId.values()];
    if (items.length === 0) {
      // eslint-disable-next-line no-console
      console.warn(`[ig-apify] empty dataset after filter tag=${tag}`);
      return [];
    }
    return items;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `[ig-apify] fetch failed tag=${tag}: ${err instanceof Error ? err.message : "error"}`,
    );
    return [];
  }
}

/**
 * Cache + in-flight dedupe. One miss → 2 run-sync (posts + reels), ≤50 each.
 * Carousel + reels modules share the same raw key for identical hashtag.
 */
async function fetchApifyDatasetRaw(tag: string): Promise<ApifyIgItem[]> {
  if (!isIgScraperConfigured()) return [];

  const cacheKey = igFeedCacheKeyApifyRaw(`${tag}:posts+reels`);
  const cached = getCached<ApifyIgItem[]>(cacheKey);
  if (cached) {
    // eslint-disable-next-line no-console
    console.info(`[ig-apify] cache HIT key=${cacheKey}`);
    return cached;
  }

  return getOrCreateInFlight(cacheKey, async () => {
    const again = getCached<ApifyIgItem[]>(cacheKey);
    if (again) {
      // eslint-disable-next-line no-console
      console.info(`[ig-apify] cache HIT (after wait) key=${cacheKey}`);
      return again;
    }
    // eslint-disable-next-line no-console
    console.info(`[ig-apify] cache MISS key=${cacheKey}`);
    const items = await fetchApifyDatasetRawUncached(tag);
    if (items.length > 0) {
      setCached(cacheKey, items, APIFY_RAW_CACHE_TTL_MS);
    }
    return items;
  });
}

/**
 * Fetch ~50 hashtag posts via Apify, map + sort. Soft-fail → [].
 */
export async function fetchApifyCompetitorPosts(
  topic?: string,
): Promise<FeedPost[]> {
  if (!isIgScraperConfigured()) return [];

  const tag = primaryHashtag(topic);
  const raw = await fetchApifyDatasetRaw(tag);
  if (raw.length === 0) return [];
  return mapApifyDatasetToFeedPosts(raw);
}
