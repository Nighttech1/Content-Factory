/**
 * C-28 / C-29 content workspace — feed contract (fixtures + C-36 live IG).
 * C-29: carousel-engine posts carry stable https `thumbUrl` (picsum).
 * C-35/C-36: sourceMode required; live Graph mapping in ig-live-feed.
 */

export type FeedPostSource = "ours" | "competitor";

/** Live Graph feed vs deterministic fixtures. */
export type FeedSourceMode = "live" | "mock";

/** @deprecated Prefer FeedSourceMode — kept for older imports. */
export type FeedPostSourceMode = FeedSourceMode;

export type FeedPostMetrics = {
  likes: number;
  views: number;
  comments?: number;
  /** Mock fixtures may set this; live IG Graph omits (no shares field). */
  shares?: number;
  /** S47 engagement; optional until scraper/API maps saves. */
  saves?: number;
};

export type FeedPost = {
  id: string;
  source: FeedPostSource;
  title: string;
  thumbUrl?: string;
  metrics: FeedPostMetrics;
  topicTags?: string[];
  /** Always set: "live" from Graph, "mock" from fixtures. */
  sourceMode: FeedSourceMode;
  /** IG handle when known (ours or competitor). */
  username?: string;
  /**
   * S48 — account followers / subscribers for plaque (RU compact `Nk`).
   * Backend may map from Graph `followers_count` / Apify subscribers.
   */
  followers?: number;
  /** Alias accepted by UI formatters (same as followers). */
  subscribers?: number;
  externalId?: string;
  permalink?: string;
  mediaType?: "CAROUSEL_ALBUM" | "IMAGE" | "VIDEO" | string;
  /** Carousel children image/video URLs; slideCount = length when present. */
  slideUrls?: string[];
  /** Optional playable media (C-49 feed play). Fixtures may omit. */
  mediaUrl?: string;
  /** Hint duration for scrubbers (C-51); C-49 may ignore. */
  durationSec?: number;
};

export type FeedResponse = {
  ours: FeedPost[];
  competitors: FeedPost[];
  /**
   * Aggregate: "live" if any post is live; else "mock".
   * Partial live (e.g. live ours + mock competitors) → top-level "live".
   */
  sourceMode: FeedSourceMode;
};

/** Core Module SDK ids that have fixture feeds. */
export const FEED_CORE_MODULE_IDS = [
  "carousel-engine",
  "aesthetic-graphics",
  "cartoon-reels",
  "heygen-reels",
] as const;

export type FeedCoreModuleId = (typeof FEED_CORE_MODULE_IDS)[number];

export function isFeedCoreModuleId(id: string): id is FeedCoreModuleId {
  return (FEED_CORE_MODULE_IDS as readonly string[]).includes(id);
}

/** Registered custom plugins (`custom-*`). Empty feed is OK. */
export function isCustomModuleId(id: string): boolean {
  return /^custom-[a-z0-9][a-z0-9-]*$/i.test(id);
}

/** Derive top-level sourceMode from posts (any live → live). */
export function aggregateFeedSourceMode(
  ours: FeedPost[],
  competitors: FeedPost[],
): FeedSourceMode {
  const anyLive = [...ours, ...competitors].some((p) => p.sourceMode === "live");
  return anyLive ? "live" : "mock";
}
