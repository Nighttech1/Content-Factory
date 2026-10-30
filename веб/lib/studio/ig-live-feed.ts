/**
 * C-36 / C-39 / C-114–C-116 / S52 — Studio live feed.
 * Ours: Graph GET /{IG_USER_ID}/media (carousel-engine).
 * Competitors (S52): **last Scout snapshot only** — NEVER call Apify here.
 * Apify runs only via `runScoutApify` (POST .../scout/run).
 * Soft-fail per side. Never logs access tokens or scraper keys.
 */

import {
  getCached,
  igFeedCacheKeyCompetitors,
  igFeedCacheKeyOurs,
  setCached,
} from "@/lib/studio/ig-feed-cache";
import {
  isIgFeedConfigured,
  readIgFeedConfig,
  type IgFeedConfig,
} from "@/lib/studio/ig-feed-config";
import {
  allowFeedFixtures,
  isIgScraperConfigured,
} from "@/lib/studio/ig-scraper-config";
import {
  emptyFeed,
  getFeedForModule,
  resolveFeed,
} from "@/lib/studio/feed-fixtures";
import type {
  FeedPost,
  FeedResponse,
  FeedSourceMode,
} from "@/lib/studio/feed-types";
import {
  aggregateFeedSourceMode,
  isCustomModuleId,
  isFeedCoreModuleId,
} from "@/lib/studio/feed-types";
import { getScoutCompetitorsForFeed } from "@/lib/studio/scout-run";
import {
  hashtagsForGraphQuery,
  mapTopicToHashtags,
} from "@/lib/studio/topic-hashtags";

const GRAPH_BASE = "https://graph.facebook.com/v21.0";
const MEDIA_FIELDS =
  "id,caption,media_type,media_url,thumbnail_url,permalink,like_count,comments_count,timestamp,children{media_url,media_type,thumbnail_url}";
/** Prefer carousels; backfill IMAGE up to this count (D6). Skip VIDEO. */
const TARGET_POST_COUNT = 12;
const FETCH_LIMIT = 25;

type IgChild = {
  media_url?: string;
  media_type?: string;
  thumbnail_url?: string;
};

type IgMedia = {
  id?: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  like_count?: number;
  comments_count?: number;
  timestamp?: string;
  children?: { data?: IgChild[] };
  /** Rare; Hashtag top_media usually omits owner. */
  username?: string;
  owner?: { username?: string };
};

function titleFromCaption(caption: string | undefined, fallbackId: string): string {
  const raw = (caption ?? "").trim();
  if (!raw) return `IG post ${fallbackId}`;
  const firstLine = raw.split(/\r?\n/)[0]?.trim() || raw;
  return firstLine.length > 120 ? `${firstLine.slice(0, 117)}…` : firstLine;
}

function slideUrlsFromMedia(media: IgMedia): string[] | undefined {
  const children = media.children?.data ?? [];
  if (children.length === 0) return undefined;
  const urls = children
    .map((c) => c.thumbnail_url || c.media_url)
    .filter((u): u is string => Boolean(u));
  return urls.length > 0 ? urls : undefined;
}

/**
 * D2 (locked): views = 0 on feed path — no per-media insights (N+1 / rate risk).
 * likes / comments from media object fields.
 */
function mapMediaToPost(
  media: IgMedia,
  source: "ours" | "competitor",
  username: string,
): FeedPost | null {
  const externalId = media.id?.trim();
  if (!externalId) return null;

  const mediaType = media.media_type ?? undefined;
  const thumbUrl = media.thumbnail_url || media.media_url || undefined;
  const slideUrls = slideUrlsFromMedia(media);

  return {
    id: `ig-${source}-${externalId}`,
    source,
    title: titleFromCaption(media.caption, externalId),
    thumbUrl,
    metrics: {
      likes: Number(media.like_count) || 0,
      views: 0,
      comments: Number(media.comments_count) || 0,
    },
    sourceMode: "live",
    username,
    /* S49: Graph media path rarely has followers_count — fixtures/UI resolve */
    externalId,
    permalink: media.permalink,
    mediaType,
    slideUrls,
  };
}

function likeCount(m: IgMedia): number {
  return Number(m.like_count) || 0;
}

/** Prefer CAROUSEL_ALBUM, then fill with IMAGE; skip VIDEO (D6). */
function selectPreferredMedia(items: IgMedia[]): IgMedia[] {
  const carousels = items.filter((m) => m.media_type === "CAROUSEL_ALBUM");
  if (carousels.length >= TARGET_POST_COUNT) {
    return carousels.slice(0, TARGET_POST_COUNT);
  }
  const images = items.filter((m) => m.media_type === "IMAGE");
  const out = [...carousels];
  for (const img of images) {
    if (out.length >= TARGET_POST_COUNT) break;
    out.push(img);
  }
  return out;
}

/**
 * Hashtag path: dedupe by id, prefer CAROUSEL then IMAGE, rank by like_count desc, cap ~12.
 */
function selectAndRankHashtagMedia(items: IgMedia[]): IgMedia[] {
  const byId = new Map<string, IgMedia>();
  for (const m of items) {
    const id = m.id?.trim();
    if (!id) continue;
    const prev = byId.get(id);
    if (!prev || likeCount(m) > likeCount(prev)) {
      byId.set(id, m);
    }
  }
  const unique = [...byId.values()];
  const carousels = unique
    .filter((m) => m.media_type === "CAROUSEL_ALBUM")
    .sort((a, b) => likeCount(b) - likeCount(a));
  const images = unique
    .filter((m) => m.media_type === "IMAGE")
    .sort((a, b) => likeCount(b) - likeCount(a));

  const out: IgMedia[] = [];
  for (const m of carousels) {
    if (out.length >= TARGET_POST_COUNT) break;
    out.push(m);
  }
  for (const m of images) {
    if (out.length >= TARGET_POST_COUNT) break;
    out.push(m);
  }
  return out;
}

function displayUsernameForHashtag(media: IgMedia, tag: string): string {
  const owner =
    media.username?.trim() ||
    media.owner?.username?.trim() ||
    "";
  if (owner) return owner.replace(/^@/, "");
  return `#${tag.replace(/^#/, "")}`;
}

async function graphGetJson(
  url: URL,
): Promise<{ ok: true; body: unknown } | { ok: false; status: number }> {
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    return { ok: false, status: res.status };
  }
  const body: unknown = await res.json();
  return { ok: true, body };
}

async function fetchOursMedia(config: IgFeedConfig): Promise<FeedPost[]> {
  const cacheKey = igFeedCacheKeyOurs(config.igUserId);
  const cached = getCached<FeedPost[]>(cacheKey);
  if (cached) return cached;

  const url = new URL(`${GRAPH_BASE}/${config.igUserId}/media`);
  url.searchParams.set("fields", MEDIA_FIELDS);
  url.searchParams.set("limit", String(FETCH_LIMIT));
  url.searchParams.set("access_token", config.token);

  const result = await graphGetJson(url);
  if (!result.ok) {
    // eslint-disable-next-line no-console
    console.warn(
      `[ig-feed] ours media HTTP ${result.status} for user=${config.igUserId}`,
    );
    throw new Error(`ours_http_${result.status}`);
  }

  const data = (result.body as { data?: IgMedia[] }).data ?? [];
  const selected = selectPreferredMedia(data);
  const posts = selected
    .map((m) => mapMediaToPost(m, "ours", config.oursUsername))
    .filter((p): p is FeedPost => p !== null);

  setCached(cacheKey, posts);
  return posts;
}

async function searchHashtagId(
  config: IgFeedConfig,
  tag: string,
): Promise<string | null> {
  const q = tag.replace(/^#/, "").trim().toLowerCase();
  if (!q) return null;

  const url = new URL(`${GRAPH_BASE}/ig_hashtag_search`);
  url.searchParams.set("user_id", config.igUserId);
  url.searchParams.set("q", q);
  url.searchParams.set("access_token", config.token);

  const result = await graphGetJson(url);
  if (!result.ok) {
    // eslint-disable-next-line no-console
    console.warn(
      `[ig-feed] ig_hashtag_search HTTP ${result.status} for q=${q}`,
    );
    return null;
  }

  const data = (result.body as { data?: Array<{ id?: string }> }).data ?? [];
  const id = data[0]?.id?.trim();
  return id || null;
}

async function fetchHashtagMediaEdge(
  config: IgFeedConfig,
  hashtagId: string,
  edge: "top_media" | "recent_media",
): Promise<IgMedia[]> {
  const url = new URL(`${GRAPH_BASE}/${hashtagId}/${edge}`);
  url.searchParams.set("user_id", config.igUserId);
  url.searchParams.set("fields", MEDIA_FIELDS);
  url.searchParams.set("limit", String(FETCH_LIMIT));
  url.searchParams.set("access_token", config.token);

  const result = await graphGetJson(url);
  if (!result.ok) {
    // eslint-disable-next-line no-console
    console.warn(
      `[ig-feed] hashtag ${edge} HTTP ${result.status} id=${hashtagId}`,
    );
    return [];
  }

  return (result.body as { data?: IgMedia[] }).data ?? [];
}

type TaggedMedia = { media: IgMedia; tag: string };

async function fetchMediaForHashtag(
  config: IgFeedConfig,
  tag: string,
): Promise<TaggedMedia[]> {
  const hashtagId = await searchHashtagId(config, tag);
  if (!hashtagId) return [];

  let items = await fetchHashtagMediaEdge(config, hashtagId, "top_media");
  if (items.length === 0) {
    items = await fetchHashtagMediaEdge(config, hashtagId, "recent_media");
  }

  return items.map((media) => ({ media, tag }));
}

/**
 * Primary competitor discovery: topic → hashtags → top_media (≤3 tags, ≤12 posts).
 */
async function fetchCompetitorsByHashtags(
  config: IgFeedConfig,
  topic: string | undefined,
): Promise<{ posts: FeedPost[]; queryTags: string[]; mappedTopic: string }> {
  const mapped = mapTopicToHashtags(topic, config.defaultHashtags);
  const queryTags = hashtagsForGraphQuery(mapped);

  const cacheKey = igFeedCacheKeyCompetitors(config.igUserId, {
    topic: mapped.topic,
    hashtags: queryTags,
  });
  const cached = getCached<FeedPost[]>(cacheKey);
  if (cached) {
    return { posts: cached, queryTags, mappedTopic: mapped.topic };
  }

  const batches = await Promise.all(
    queryTags.map((tag) => fetchMediaForHashtag(config, tag)),
  );
  const tagged = batches.flat();
  const selected = selectAndRankHashtagMedia(tagged.map((t) => t.media));

  // Preserve tag for display username when owner missing
  const tagById = new Map<string, string>();
  for (const { media, tag } of tagged) {
    const id = media.id?.trim();
    if (id && !tagById.has(id)) tagById.set(id, tag);
  }

  const posts = selected
    .map((m) => {
      const tag = (m.id && tagById.get(m.id)) || queryTags[0] || "hashtag";
      return mapMediaToPost(m, "competitor", displayUsernameForHashtag(m, tag));
    })
    .filter((p): p is FeedPost => p !== null);

  if (posts.length > 0) {
    setCached(cacheKey, posts);
  }
  return { posts, queryTags, mappedTopic: mapped.topic };
}

async function fetchCompetitorMediaBd(
  config: IgFeedConfig,
  username: string,
): Promise<FeedPost[]> {
  const fields = `business_discovery.username(${username}){username,media.limit(${FETCH_LIMIT}){${MEDIA_FIELDS}}}`;
  const url = new URL(`${GRAPH_BASE}/${config.igUserId}`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("access_token", config.token);

  const result = await graphGetJson(url);
  if (!result.ok) {
    // eslint-disable-next-line no-console
    console.warn(
      `[ig-feed] business_discovery (fallback) HTTP ${result.status} for @${username}`,
    );
    return [];
  }

  const bd = (result.body as {
    business_discovery?: {
      username?: string;
      media?: { data?: IgMedia[] };
    };
  }).business_discovery;

  if (!bd) {
    // eslint-disable-next-line no-console
    console.warn(
      `[ig-feed] business_discovery (fallback) empty for @${username}`,
    );
    return [];
  }

  const handle = bd.username || username;
  const selected = selectPreferredMedia(bd.media?.data ?? []);
  return selected
    .map((m) => mapMediaToPost(m, "competitor", handle))
    .filter((p): p is FeedPost => p !== null);
}

/** Optional BD fallback — only when hashtag path yielded zero posts. */
async function fetchCompetitorsBdFallback(
  config: IgFeedConfig,
  topic: string | undefined,
): Promise<FeedPost[]> {
  if (config.competitorUsernames.length === 0) {
    return [];
  }

  const mapped = mapTopicToHashtags(topic, config.defaultHashtags);
  const queryTags = hashtagsForGraphQuery(mapped);
  const cacheKey = igFeedCacheKeyCompetitors(config.igUserId, {
    topic: mapped.topic,
    hashtags: queryTags,
    usernames: config.competitorUsernames,
  });
  const cached = getCached<FeedPost[]>(cacheKey);
  if (cached) return cached;

  // eslint-disable-next-line no-console
  console.warn(
    "[ig-feed] hashtag path empty; using IG_COMPETITOR_USERNAMES Business Discovery fallback",
  );

  const batches = await Promise.all(
    config.competitorUsernames.map((u) => fetchCompetitorMediaBd(config, u)),
  );
  const posts = batches.flat().slice(0, TARGET_POST_COUNT);
  if (posts.length > 0) {
    setCached(cacheKey, posts);
  }
  return posts;
}

async function fetchAllCompetitors(
  config: IgFeedConfig,
  topic: string | undefined,
): Promise<FeedPost[]> {
  const { posts: hashtagPosts } = await fetchCompetitorsByHashtags(
    config,
    topic,
  );
  if (hashtagPosts.length > 0) {
    return hashtagPosts;
  }

  return fetchCompetitorsBdFallback(config, topic);
}

function withMockSourceMode(feed: FeedResponse): FeedResponse {
  const tag = (p: FeedPost): FeedPost =>
    p.sourceMode === "mock" ? p : { ...p, sourceMode: "mock" };
  const ours = feed.ours.map(tag);
  const competitors = feed.competitors.map(tag);
  return {
    ours,
    competitors,
    sourceMode: "mock",
  };
}

/**
 * S50 / S52 competitor fallback when Scout snapshot is empty:
 * - scraper ON + no USE_FEED_FIXTURES → never return mock competitors (empty OK)
 * - scraper OFF → fixtures (local demo)
 * - USE_FEED_FIXTURES=1 → fixtures allowed even with scraper (CI / offline)
 */
function competitorFixtureFallback(
  fixtureCompetitors: FeedPost[],
  scraperOn: boolean,
  fixturesOk: boolean,
): FeedPost[] {
  if (fixturesOk) return fixtureCompetitors;
  if (scraperOn) return [];
  return fixtureCompetitors;
}

/**
 * S52 — competitors from Scout snapshot only (0 Apify).
 * Optional topic soft-filter on snapshot tags/title (no network).
 */
function competitorsFromScoutSnapshot(
  moduleId: string,
  topic: string | undefined,
  fixtureCompetitors: FeedPost[],
  scraperOn: boolean,
  fixturesOk: boolean,
): FeedPost[] {
  const snap = getScoutCompetitorsForFeed(moduleId);
  if (snap.length > 0) {
    const q = topic?.trim().toLowerCase();
    if (!q) return snap;
    const filtered = snap.filter((p) => {
      const tags = (p.topicTags ?? []).join(" ").toLowerCase();
      const title = (p.title ?? "").toLowerCase();
      const user = (p.username ?? "").toLowerCase();
      return tags.includes(q) || title.includes(q) || user.includes(q);
    });
    return filtered.length > 0 ? filtered : snap;
  }
  return competitorFixtureFallback(fixtureCompetitors, scraperOn, fixturesOk);
}

/**
 * Live carousel-engine feed.
 * Competitors (S52): Scout snapshot only — NEVER Apify on this path.
 * Fixture competitors NEVER silent-merge while scraper key set (unless USE_FEED_FIXTURES=1).
 */
export async function fetchCarouselLiveFeed(
  topic?: string,
): Promise<FeedResponse> {
  const fixture = withMockSourceMode(
    getFeedForModule("carousel-engine", topic),
  );
  const fixturesOk = allowFeedFixtures();
  const scraperOn = isIgScraperConfigured();

  let ours: FeedPost[] = fixture.ours;
  let competitors: FeedPost[] = competitorsFromScoutSnapshot(
    "carousel-engine",
    topic,
    fixture.competitors,
    scraperOn,
    fixturesOk,
  );

  if (!isIgFeedConfigured()) {
    const sourceMode: FeedSourceMode = aggregateFeedSourceMode(
      ours,
      competitors,
    );
    return { ours, competitors, sourceMode };
  }

  const config = readIgFeedConfig();
  if (!config) {
    const sourceMode: FeedSourceMode = aggregateFeedSourceMode(
      ours,
      competitors,
    );
    return { ours, competitors, sourceMode };
  }

  try {
    const liveOurs = await fetchOursMedia(config);
    if (liveOurs.length > 0) {
      ours = liveOurs;
    } else {
      // eslint-disable-next-line no-console
      console.warn("[ig-feed] ours live returned 0 posts; using fixtures");
    }
  } catch {
    // eslint-disable-next-line no-console
    console.warn("[ig-feed] ours fetch failed; using fixtures");
  }

  // S52: Graph hashtag competitors only when no Scout snapshot and scraper off / fixtures
  if (getScoutCompetitorsForFeed("carousel-engine").length === 0 && !scraperOn) {
    try {
      const liveComp = await fetchAllCompetitors(config, topic);
      if (liveComp.length > 0) {
        competitors = liveComp;
      }
    } catch {
      // eslint-disable-next-line no-console
      console.warn("[ig-feed] competitors Graph fetch failed; fallback policy");
    }
  }

  const sourceMode: FeedSourceMode = aggregateFeedSourceMode(ours, competitors);
  return { ours, competitors, sourceMode };
}

/**
 * custom-reels (S52): Scout snapshot VIDEO competitors; else empty (no Apify on feed).
 */
export async function fetchCustomReelsLiveFeed(
  topic?: string,
): Promise<FeedResponse> {
  const competitors = competitorsFromScoutSnapshot(
    "custom-reels",
    topic,
    [],
    isIgScraperConfigured(),
    allowFeedFixtures(),
  );
  if (competitors.length > 0) {
    return {
      ours: [],
      competitors,
      sourceMode: aggregateFeedSourceMode([], competitors),
    };
  }
  return emptyFeed();
}

/**
 * Studio feed resolver (S52):
 * - carousel-engine: Graph ours + Scout snapshot competitors (0 Apify)
 * - custom-reels: Scout snapshot or empty
 * - other core: fixtures; other custom-*: empty
 * Returns null when module unknown (404).
 */
export async function resolveStudioFeed(
  moduleId: string,
  topic?: string,
): Promise<FeedResponse | null> {
  if (moduleId === "carousel-engine") {
    return fetchCarouselLiveFeed(topic);
  }

  if (moduleId === "custom-reels") {
    return fetchCustomReelsLiveFeed(topic);
  }

  if (isFeedCoreModuleId(moduleId)) {
    return withMockSourceMode(resolveFeed(moduleId, topic)!);
  }

  if (isCustomModuleId(moduleId)) {
    return emptyFeed();
  }

  return null;
}
