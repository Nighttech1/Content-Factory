/**
 * C-28 / C-29 / C-31 — in-memory mock posts per moduleId.
 * No Prisma. Live IG for carousel-engine is C-36 (`ig-live-feed`).
 * Competitors filter by topic (title substring or tag).
 * C-29: carousel-engine ≥21+21 with stable https thumbUrl (picsum).
 * C-31: reels thumbs use 9:16 picsum seeds (https).
 * C-36: every fixture post + response carries `sourceMode: "mock"`.
 */

import type { FeedCoreModuleId, FeedPost, FeedResponse } from "./feed-types";
import { isFeedCoreModuleId } from "./feed-types";
import { mapTopicToHashtags } from "./topic-hashtags";

/** Collapse hyphen / underscore / spaces so guest-night ≡ guestnight. */
function normalizeMatchToken(s: string): string {
  return s.toLowerCase().replace(/[-_\s]+/g, "");
}

type ModuleFeed = {
  ours: FeedPost[];
  competitors: FeedPost[];
};

function post(
  partial: Omit<FeedPost, "metrics" | "sourceMode"> & {
    metrics: FeedPost["metrics"];
    sourceMode?: FeedPost["sourceMode"];
  },
): FeedPost {
  const metrics = { ...partial.metrics };
  if (typeof metrics.saves !== "number") {
    metrics.saves = mockSaves(metrics.likes, metrics.comments ?? 0);
  }
  const next: FeedPost = { sourceMode: "mock", ...partial, metrics };
  // S47: plaque needs username; mock-only default (live posts keep API handle)
  if (!next.username?.trim()) {
    next.username =
      next.source === "ours" ? "vernatun.club" : `rival_${next.id.slice(-4)}`;
  }
  // S48: followers for plaque (deterministic from id hash if omitted)
  if (typeof next.followers !== "number" && typeof next.subscribers !== "number") {
    let h = 0;
    for (let i = 0; i < next.id.length; i++) {
      h = (h * 31 + next.id.charCodeAt(i)) >>> 0;
    }
    next.followers = 8_000 + (h % 1_200_000);
  }
  return next;
}

/** Stable picsum URL — same seed → same image across reloads. */
function picsumThumb(seed: string, w = 360, h = 600): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

/** C-64: carousel previews are 9:16 with ≥3 slides for L/R on the card. */
function carouselSlideUrls(seed: string): string[] {
  return [
    picsumThumb(`${seed}-s1`, 360, 640),
    picsumThumb(`${seed}-s2`, 360, 640),
    picsumThumb(`${seed}-s3`, 360, 640),
  ];
}

type SeedPost = {
  title: string;
  tags: string[];
  likes: number;
  views: number;
  comments: number;
};

/** Deterministic mock shares for CORE fixtures (live IG omits shares). */
function mockShares(likes: number, comments: number): number {
  return Math.max(3, Math.round(likes * 0.035 + comments * 0.2));
}

/** Deterministic mock saves for S47 engagement row. */
function mockSaves(likes: number, comments: number): number {
  return Math.max(2, Math.round(likes * 0.06 + comments * 0.15));
}

function seedMetrics(s: Pick<SeedPost, "likes" | "views" | "comments">) {
  return {
    likes: s.likes,
    views: s.views,
    comments: s.comments,
    shares: mockShares(s.likes, s.comments),
    saves: mockSaves(s.likes, s.comments),
  };
}

const CAROUSEL_OURS_SEEDS: SeedPost[] = [
  {
    title: "Armenian Club — 5 tips for guest night",
    tags: ["guest-night", "club", "tips"],
    likes: 1240,
    views: 18900,
    comments: 48,
  },
  {
    title: "Carousel: menu highlights this week",
    tags: ["menu", "food", "weekly"],
    likes: 890,
    views: 14200,
    comments: 31,
  },
  {
    title: "Behind the bar — signature cocktails",
    tags: ["cocktails", "bar", "behind-the-scenes"],
    likes: 2100,
    views: 27600,
    comments: 72,
  },
  {
    title: "Wine flight: three Armenian reds",
    tags: ["wine", "tasting", "armenian"],
    likes: 1560,
    views: 22100,
    comments: 44,
  },
  {
    title: "Table styling for Saturday dinner",
    tags: ["table", "dinner", "styling"],
    likes: 980,
    views: 15400,
    comments: 29,
  },
  {
    title: "Chef specials — autumn mezze board",
    tags: ["mezze", "chef", "autumn"],
    likes: 1780,
    views: 26800,
    comments: 61,
  },
  {
    title: "Live music night lineup teaser",
    tags: ["music", "live", "lineup"],
    likes: 2340,
    views: 41200,
    comments: 88,
  },
  {
    title: "Private dining room walkthrough",
    tags: ["private", "dining", "venue"],
    likes: 1120,
    views: 18700,
    comments: 35,
  },
  {
    title: "Coffee & baklava afternoon set",
    tags: ["coffee", "baklava", "dessert"],
    likes: 760,
    views: 12100,
    comments: 22,
  },
  {
    title: "DJ warm-up playlist carousel",
    tags: ["dj", "playlist", "nightlife"],
    likes: 1890,
    views: 33500,
    comments: 70,
  },
  {
    title: "How we plate lavash wraps",
    tags: ["lavash", "food", "plating"],
    likes: 1340,
    views: 19800,
    comments: 41,
  },
  {
    title: "Weekend brunch reservation reminder",
    tags: ["brunch", "reservation", "weekend"],
    likes: 920,
    views: 14600,
    comments: 27,
  },
  {
    title: "Armenian heritage month poster set",
    tags: ["heritage", "poster", "armenian"],
    likes: 2010,
    views: 28900,
    comments: 66,
  },
  {
    title: "Bartender craft: pomegranate sour",
    tags: ["cocktails", "pomegranate", "bar"],
    likes: 1670,
    views: 24300,
    comments: 53,
  },
  {
    title: "Event space capacity & layout tips",
    tags: ["event", "venue", "tips"],
    likes: 840,
    views: 13200,
    comments: 19,
  },
  {
    title: "Staff spotlight — sommelier picks",
    tags: ["staff", "wine", "sommelier"],
    likes: 1180,
    views: 17600,
    comments: 38,
  },
  {
    title: "Late-night snack menu drop",
    tags: ["menu", "late-night", "snacks"],
    likes: 1450,
    views: 21400,
    comments: 47,
  },
  {
    title: "Wedding tasting package slides",
    tags: ["wedding", "tasting", "package"],
    likes: 2560,
    views: 45800,
    comments: 92,
  },
  {
    title: "Rooftop sunset cocktail hour",
    tags: ["rooftop", "sunset", "cocktails"],
    likes: 2980,
    views: 52100,
    comments: 105,
  },
  {
    title: "Kids-friendly Sunday lunch carousel",
    tags: ["family", "lunch", "sunday"],
    likes: 690,
    views: 10800,
    comments: 16,
  },
  {
    title: "Closing tips: how guests remember us",
    tags: ["hospitality", "tips", "brand"],
    likes: 1320,
    views: 19500,
    comments: 40,
  },
  {
    title: "Bonus slide: seasonal garnish guide",
    tags: ["seasonal", "garnish", "bar"],
    likes: 540,
    views: 8900,
    comments: 12,
  },
];

const CAROUSEL_COMP_SEEDS: SeedPost[] = [
  {
    title: "Competitor: rooftop guest night invite",
    tags: ["guest-night", "rooftop", "invite"],
    likes: 3400,
    views: 52000,
    comments: 110,
  },
  {
    title: "Food carousel — seasonal menu drop",
    tags: ["menu", "seasonal", "food"],
    likes: 1800,
    views: 31000,
    comments: 64,
  },
  {
    title: "Cocktail flight education series",
    tags: ["cocktails", "education", "bar"],
    likes: 960,
    views: 15800,
    comments: 22,
  },
  {
    title: "Wedding venue walkthrough slides",
    tags: ["wedding", "venue", "event"],
    likes: 4200,
    views: 68000,
    comments: 95,
  },
  {
    title: "DJ night hype carousel",
    tags: ["dj", "nightlife", "music"],
    likes: 2700,
    views: 41000,
    comments: 88,
  },
  {
    title: "Brunch reservation story pack",
    tags: ["brunch", "reservation", "weekend"],
    likes: 2100,
    views: 35500,
    comments: 71,
  },
  {
    title: "Heritage month bilingual graphics",
    tags: ["heritage", "bilingual", "poster"],
    likes: 1900,
    views: 29800,
    comments: 58,
  },
  {
    title: "Pomegranate cocktail tutorial",
    tags: ["cocktails", "pomegranate", "tutorial"],
    likes: 1500,
    views: 24200,
    comments: 49,
  },
  {
    title: "Private dining upsell carousel",
    tags: ["private", "dining", "upsell"],
    likes: 1280,
    views: 20100,
    comments: 36,
  },
  {
    title: "Autumn mezze board competitor take",
    tags: ["mezze", "autumn", "food"],
    likes: 1750,
    views: 27600,
    comments: 62,
  },
  {
    title: "Live jazz night promo slides",
    tags: ["music", "live", "jazz"],
    likes: 2300,
    views: 38900,
    comments: 80,
  },
  {
    title: "Baklava & coffee afternoon set",
    tags: ["baklava", "coffee", "dessert"],
    likes: 880,
    views: 14200,
    comments: 24,
  },
  {
    title: "Lavash wrap plating tips",
    tags: ["lavash", "plating", "food"],
    likes: 1120,
    views: 18400,
    comments: 33,
  },
  {
    title: "Sommelier picks of the month",
    tags: ["wine", "sommelier", "picks"],
    likes: 1640,
    views: 25900,
    comments: 51,
  },
  {
    title: "Late-night snack menu rival",
    tags: ["menu", "late-night", "snacks"],
    likes: 1390,
    views: 22300,
    comments: 45,
  },
  {
    title: "Wedding tasting package competitor",
    tags: ["wedding", "tasting", "package"],
    likes: 3100,
    views: 51200,
    comments: 102,
  },
  {
    title: "Sunset cocktail hour rooftop",
    tags: ["rooftop", "sunset", "cocktails"],
    likes: 3600,
    views: 59000,
    comments: 118,
  },
  {
    title: "Family Sunday lunch promo",
    tags: ["family", "lunch", "sunday"],
    likes: 720,
    views: 11900,
    comments: 18,
  },
  {
    title: "Hospitality brand story slides",
    tags: ["hospitality", "brand", "story"],
    likes: 1480,
    views: 24600,
    comments: 42,
  },
  {
    title: "Seasonal garnish bar guide",
    tags: ["seasonal", "garnish", "bar"],
    likes: 610,
    views: 9800,
    comments: 14,
  },
  {
    title: "Club capacity & layout tips",
    tags: ["event", "venue", "tips"],
    likes: 980,
    views: 16100,
    comments: 27,
  },
  {
    title: "Weekend playlist teaser pack",
    tags: ["dj", "playlist", "weekend"],
    likes: 2050,
    views: 33400,
    comments: 76,
  },
];

function buildCarouselFeed(): ModuleFeed {
  const ours = CAROUSEL_OURS_SEEDS.map((s, i) => {
    const n = i + 1;
    const idNum = String(n).padStart(2, "0");
    const seed = `cf-carousel-ours-${n}`;
    const slideUrls = carouselSlideUrls(seed);
    return post({
      id: `ours-ce-${idNum}`,
      source: "ours",
      title: s.title,
      thumbUrl: slideUrls[0],
      slideUrls,
      metrics: seedMetrics(s),
      topicTags: s.tags,
      mediaType: "CAROUSEL_ALBUM",
    });
  });

  const competitors = CAROUSEL_COMP_SEEDS.map((s, i) => {
    const n = i + 1;
    const idNum = String(n).padStart(2, "0");
    const seed = `cf-carousel-comp-${n}`;
    const slideUrls = carouselSlideUrls(seed);
    return post({
      id: `comp-ce-${idNum}`,
      source: "competitor",
      title: s.title,
      thumbUrl: slideUrls[0],
      slideUrls,
      metrics: seedMetrics(s),
      topicTags: s.tags,
      mediaType: "CAROUSEL_ALBUM",
    });
  });

  return { ours, competitors };
}

function withPicsumThumb(
  seed: string,
  base: Omit<FeedPost, "thumbUrl" | "sourceMode"> & {
    thumbUrl?: string;
    sourceMode?: FeedPost["sourceMode"];
  },
  size: { w: number; h: number } = { w: 360, h: 450 },
): FeedPost {
  return post({
    ...base,
    thumbUrl: base.thumbUrl ?? picsumThumb(seed, size.w, size.h),
  });
}

/** Reels 9:16 mock thumbs (C-31). */
function withReelsThumb(
  seed: string,
  base: Omit<FeedPost, "thumbUrl" | "sourceMode"> & {
    thumbUrl?: string;
    sourceMode?: FeedPost["sourceMode"];
  },
): FeedPost {
  return withPicsumThumb(seed, base, { w: 360, h: 640 });
}

const FEEDS: Readonly<Record<FeedCoreModuleId, ModuleFeed>> = {
  "carousel-engine": buildCarouselFeed(),

  "aesthetic-graphics": {
    ours: [
      withPicsumThumb("cf-ag-ours-1", {
        id: "ours-ag-01",
        source: "ours",
        title: "Bilingual poster — Armenian Heritage Month",
        metrics: { likes: 1560, views: 22100, comments: 41, shares: 62 },
        topicTags: ["heritage", "bilingual", "poster"],
        mediaType: "IMAGE",
      }),
      withPicsumThumb("cf-ag-ours-2", {
        id: "ours-ag-02",
        source: "ours",
        title: "Quote card: hospitality values",
        metrics: { likes: 720, views: 9800, comments: 18, shares: 29 },
        topicTags: ["quote", "values", "hospitality"],
        mediaType: "IMAGE",
      }),
      withPicsumThumb("cf-ag-ours-3", {
        id: "ours-ag-03",
        source: "ours",
        title: "Infographic: tasting flight map",
        metrics: { likes: 1100, views: 16500, comments: 27, shares: 44 },
        topicTags: ["infographic", "tasting", "wine"],
        mediaType: "IMAGE",
      }),
    ],
    competitors: [
      withPicsumThumb("cf-ag-comp-1", {
        id: "comp-ag-01",
        source: "competitor",
        title: "Minimal heritage month graphic",
        metrics: { likes: 2900, views: 44000, comments: 76, shares: 118 },
        topicTags: ["heritage", "minimal", "poster"],
        mediaType: "IMAGE",
      }),
      withPicsumThumb("cf-ag-comp-2", {
        id: "comp-ag-02",
        source: "competitor",
        title: "Bilingual event flyer template",
        metrics: { likes: 1340, views: 19800, comments: 33, shares: 54 },
        topicTags: ["bilingual", "event", "flyer"],
        mediaType: "IMAGE",
      }),
      withPicsumThumb("cf-ag-comp-3", {
        id: "comp-ag-03",
        source: "competitor",
        title: "Wine tasting infographic set",
        metrics: { likes: 2100, views: 35500, comments: 54, shares: 86 },
        topicTags: ["wine", "tasting", "infographic"],
        mediaType: "IMAGE",
      }),
      withPicsumThumb("cf-ag-comp-4", {
        id: "comp-ag-04",
        source: "competitor",
        title: "Luxury hospitality quote series",
        metrics: { likes: 880, views: 12100, comments: 19, shares: 35 },
        topicTags: ["quote", "luxury", "hospitality"],
        mediaType: "IMAGE",
      }),
    ],
  },

  "cartoon-reels": {
    ours: [
      withReelsThumb("cf-cr-ours-1", {
        id: "ours-cr-01",
        source: "ours",
        title: "2D reel: guest arrives at the club",
        metrics: seedMetrics({ likes: 3200, views: 89000, comments: 140 }),
        topicTags: ["story", "guest", "club"],
        mediaType: "VIDEO",
      }),
      withReelsThumb("cf-cr-ours-2", {
        id: "ours-cr-02",
        source: "ours",
        title: "Cartoon chef vs spicy challenge",
        metrics: seedMetrics({ likes: 4100, views: 112000, comments: 210 }),
        topicTags: ["food", "challenge", "chef"],
        mediaType: "VIDEO",
      }),
      withReelsThumb("cf-cr-ours-3", {
        id: "ours-cr-03",
        source: "ours",
        title: "Mascot dance for weekend promo",
        metrics: seedMetrics({ likes: 2800, views: 76000, comments: 98 }),
        topicTags: ["mascot", "weekend", "promo"],
        mediaType: "VIDEO",
      }),
    ],
    competitors: [
      withReelsThumb("cf-cr-comp-1", {
        id: "comp-cr-01",
        source: "competitor",
        title: "Animated guest welcome story",
        metrics: seedMetrics({ likes: 5600, views: 145000, comments: 320 }),
        topicTags: ["guest", "welcome", "story"],
        mediaType: "VIDEO",
      }),
      withReelsThumb("cf-cr-comp-2", {
        id: "comp-cr-02",
        source: "competitor",
        title: "Food challenge cartoon skit",
        metrics: seedMetrics({ likes: 4800, views: 128000, comments: 260 }),
        topicTags: ["food", "challenge", "skit"],
        mediaType: "VIDEO",
      }),
      withReelsThumb("cf-cr-comp-3", {
        id: "comp-cr-03",
        source: "competitor",
        title: "Weekend promo mascot loop",
        metrics: seedMetrics({ likes: 1900, views: 54000, comments: 71 }),
        topicTags: ["weekend", "mascot", "promo"],
        mediaType: "VIDEO",
      }),
      withReelsThumb("cf-cr-comp-4", {
        id: "comp-cr-04",
        source: "competitor",
        title: "DJ booth cartoon hype reel",
        metrics: seedMetrics({ likes: 3700, views: 98000, comments: 155 }),
        topicTags: ["dj", "music", "nightlife"],
        mediaType: "VIDEO",
      }),
    ],
  },

  "heygen-reels": {
    ours: [
      withReelsThumb("cf-hg-ours-1", {
        id: "ours-hg-01",
        source: "ours",
        title: "Avatar host: tonight’s lineup",
        metrics: seedMetrics({ likes: 2400, views: 67000, comments: 120 }),
        topicTags: ["lineup", "host", "nightlife"],
        mediaType: "VIDEO",
      }),
      withReelsThumb("cf-hg-ours-2", {
        id: "ours-hg-02",
        source: "ours",
        title: "HeyGen tip: reserving a table",
        metrics: seedMetrics({ likes: 1600, views: 42000, comments: 65 }),
        topicTags: ["reservation", "tips", "table"],
        mediaType: "VIDEO",
      }),
      withReelsThumb("cf-hg-ours-3", {
        id: "ours-hg-03",
        source: "ours",
        title: "Brand story — why we cook Armenian",
        metrics: seedMetrics({ likes: 3100, views: 91000, comments: 180 }),
        topicTags: ["brand", "armenian", "story"],
        mediaType: "VIDEO",
      }),
    ],
    competitors: [
      withReelsThumb("cf-hg-comp-1", {
        id: "comp-hg-01",
        source: "competitor",
        title: "AI host reveals weekend lineup",
        metrics: seedMetrics({ likes: 5200, views: 150000, comments: 290 }),
        topicTags: ["lineup", "weekend", "host"],
        mediaType: "VIDEO",
      }),
      withReelsThumb("cf-hg-comp-2", {
        id: "comp-hg-02",
        source: "competitor",
        title: "Avatar explains table booking",
        metrics: seedMetrics({ likes: 2100, views: 58000, comments: 88 }),
        topicTags: ["reservation", "table", "booking"],
        mediaType: "VIDEO",
      }),
      withReelsThumb("cf-hg-comp-3", {
        id: "comp-hg-03",
        source: "competitor",
        title: "Founder story with talking avatar",
        metrics: seedMetrics({ likes: 3900, views: 104000, comments: 200 }),
        topicTags: ["brand", "story", "founder"],
        mediaType: "VIDEO",
      }),
      withReelsThumb("cf-hg-comp-4", {
        id: "comp-hg-04",
        source: "competitor",
        title: "Cocktail tutorial avatar reel",
        metrics: seedMetrics({ likes: 2800, views: 72000, comments: 110 }),
        topicTags: ["cocktails", "tutorial", "bar"],
        mediaType: "VIDEO",
      }),
    ],
  },
};

/**
 * Case-insensitive match: topic substring in title or any topicTag,
 * plus hashtag aliases from `mapTopicToHashtags` (RU topics → e.g. guestnight).
 * Empty / whitespace topic → always true (caller returns full competitor set).
 */
export function matchesTopic(post: FeedPost, topic: string): boolean {
  const q = topic.trim().toLowerCase();
  if (!q) return true;
  if (post.title.toLowerCase().includes(q)) return true;
  const tags = post.topicTags ?? [];
  if (tags.some((t) => t.toLowerCase().includes(q))) return true;

  // C-40 Client: Cyrillic topics (гостевой) don't appear in Latin titles/tags —
  // match mapped hashtags with hyphen/underscore variants (guest-night ↔ guestnight).
  const mapped = mapTopicToHashtags(topic);
  if (mapped.emptyTopic) return true;
  const titleNorm = normalizeMatchToken(post.title);
  const tagsNorm = tags.map(normalizeMatchToken);
  return mapped.hashtags.some((h) => {
    const needle = normalizeMatchToken(h);
    if (!needle) return false;
    if (titleNorm.includes(needle)) return true;
    return tagsNorm.some((t) => t.includes(needle));
  });
}

/**
 * Resolve mock feed for a core module.
 * Empty / whitespace topic → full default competitor set.
 * Non-empty → filter competitors only; ours always full set.
 */
export function getFeedForModule(
  moduleId: FeedCoreModuleId,
  topic?: string,
): FeedResponse {
  const feed = FEEDS[moduleId];
  const raw = (topic ?? "").trim();
  if (!raw) {
    return {
      ours: feed.ours.slice(),
      competitors: feed.competitors.slice(),
      sourceMode: "mock",
    };
  }
  return {
    ours: feed.ours.slice(),
    competitors: feed.competitors.filter((p) => matchesTopic(p, raw)),
    sourceMode: "mock",
  };
}

/** Empty workspace for custom plugins (no fixture posts yet). */
export function emptyFeed(): FeedResponse {
  return { ours: [], competitors: [], sourceMode: "mock" };
}

export function resolveFeed(
  moduleId: string,
  topic?: string,
): FeedResponse | null {
  if (isFeedCoreModuleId(moduleId)) {
    return getFeedForModule(moduleId, topic);
  }
  return null;
}

/** Lookup a fixture post by id within a core module feed (ours + competitors). */
export function findFeedPost(
  moduleId: string,
  postId: string,
): FeedPost | null {
  if (!isFeedCoreModuleId(moduleId)) return null;
  const feed = FEEDS[moduleId];
  return (
    feed.ours.find((p) => p.id === postId) ??
    feed.competitors.find((p) => p.id === postId) ??
    null
  );
}
