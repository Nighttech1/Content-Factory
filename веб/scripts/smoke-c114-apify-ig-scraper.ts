/**
 * Smoke C-114…C-116: Apify IG scraper mapper + soft-fail (CI-safe).
 * Does NOT require a live Apify key. Optional LIVE_AUTH probe when key present.
 * Never prints IG_SCRAPER_API_KEY value.
 *
 * Run: npx tsx scripts/smoke-c114-apify-ig-scraper.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import {
  filterCompetitorsForModule,
  mapApifyDatasetToFeedPosts,
  mapApifyMediaType,
  popularityScore,
  type ApifyIgItem,
} from "../lib/studio/ig-apify-scraper";
import {
  APIFY_DEFAULT_MAX_RUNS_PER_HOUR,
  APIFY_RAW_CACHE_TTL_MS,
  clearIgFeedCache,
  getOrCreateInFlight,
  igFeedCacheKeyApifyModule,
  igFeedCacheKeyApifyRaw,
  tryConsumeApifyRunSlot,
} from "../lib/studio/ig-feed-cache";
import {
  isIgScraperConfigured,
  readIgScraperConfig,
} from "../lib/studio/ig-scraper-config";

const ROOT = join(__dirname, "..");

function loadDotEnv(filePath: string): void {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env) || !process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadDotEnv(resolve(ROOT, ".env"));

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function assertMapperUnit(): void {
  const fake: ApifyIgItem[] = [
    {
      id: "img1",
      type: "Image",
      caption: "Single photo\nmore",
      displayUrl: "https://example.com/img1.jpg",
      likesCount: 10,
      commentsCount: 2,
      ownerUsername: "photo_user",
      url: "https://instagram.com/p/img1",
    },
    {
      id: "vid1",
      type: "Video",
      productType: "clips",
      caption: "Reel hit",
      displayUrl: "https://example.com/vid1.jpg",
      videoUrl: "https://example.com/vid1.mp4",
      likesCount: 100,
      commentsCount: 20,
      videoViewCount: 5000,
      ownerUsername: "reel_user",
      url: "https://instagram.com/reel/vid1",
    },
    {
      id: "car1",
      type: "Sidecar",
      caption: "Carousel niche",
      displayUrl: "https://example.com/car1.jpg",
      childPosts: [
        { displayUrl: "https://example.com/c1.jpg" },
        { displayUrl: "https://example.com/c2.jpg" },
        { displayUrl: "https://example.com/c3.jpg" },
      ],
      likesCount: 50,
      commentsCount: 5,
      ownerUsername: "carousel_user",
      url: "https://instagram.com/p/car1",
    },
  ];

  assert(mapApifyMediaType(fake[0]!) === "IMAGE", "Image → IMAGE");
  assert(mapApifyMediaType(fake[1]!) === "VIDEO", "Video/clips → VIDEO");
  assert(mapApifyMediaType(fake[2]!) === "CAROUSEL_ALBUM", "Sidecar → CAROUSEL");

  assert(
    popularityScore(fake[1]!) === 100 + 20 + 5000,
    "popularity = likes+comments+views",
  );

  const posts = mapApifyDatasetToFeedPosts(fake);
  assert(posts.length === 3, "mapped 3 posts");
  assert(posts[0]!.externalId === "vid1", "sort: video first (highest score)");
  assert(posts[1]!.externalId === "car1", "sort: carousel second");
  assert(posts[2]!.externalId === "img1", "sort: image last");
  assert(posts.every((p) => p.source === "competitor"), "all competitor");
  assert(posts.every((p) => p.sourceMode === "live"), "all live");
  assert(posts[0]!.id === "ig-competitor-vid1", "stable id prefix");

  const carousel = filterCompetitorsForModule("carousel-engine", posts);
  assert(
    carousel.every((p) => p.mediaType !== "VIDEO"),
    "carousel: no VIDEO",
  );
  assert(
    carousel[0]!.mediaType === "CAROUSEL_ALBUM",
    "carousel: Sidecar first",
  );
  assert(
    carousel.some((p) => p.mediaType === "IMAGE"),
    "carousel: IMAGE backfill",
  );

  const reels = filterCompetitorsForModule("custom-reels", posts);
  assert(reels.length === 1, "reels: only VIDEO");
  assert(reels[0]!.mediaType === "VIDEO", "reels: VIDEO");
  assert(
    !reels.some((p) => p.mediaType === "CAROUSEL_ALBUM" || p.mediaType === "IMAGE"),
    "reels: no Sidecar/IMAGE",
  );

  console.log("MAPPER_OK");
}

function assertCacheKeys(): void {
  assert(
    igFeedCacheKeyApifyRaw("ArmenianClub") ===
      "apify:ig-scraper:h=armenianclub:limit=50",
    "raw cache key",
  );
  assert(
    igFeedCacheKeyApifyModule("carousel-engine", "Guest", ["b", "a"]).includes(
      "apify:competitors:carousel-engine",
    ),
    "module cache key",
  );
  assert(
    APIFY_RAW_CACHE_TTL_MS >= 10 * 60 * 1000,
    "Apify raw TTL ≥10 min (S51)",
  );
  assert(
    APIFY_DEFAULT_MAX_RUNS_PER_HOUR >= 1,
    "maxRunsPerHour default ≥1",
  );
  console.log("CACHE_KEYS_OK");
}

async function assertInFlightDedup(): Promise<void> {
  clearIgFeedCache();
  let factories = 0;
  const p1 = getOrCreateInFlight("smoke:dedup", async () => {
    factories += 1;
    await new Promise((r) => setTimeout(r, 20));
    return "ok";
  });
  const p2 = getOrCreateInFlight("smoke:dedup", async () => {
    factories += 1;
    return "bad";
  });
  const [a, b] = await Promise.all([p1, p2]);
  assert(a === "ok" && b === "ok", "in-flight shares result");
  assert(factories === 1, "in-flight single factory");
  clearIgFeedCache();
  assert(tryConsumeApifyRunSlot() === true, "run slot available after clear");
  console.log("INFLIGHT_DEDUP_OK");
}

function assertEnvExample(): void {
  const p = join(ROOT, ".env.example");
  assert(existsSync(p), ".env.example exists");
  const text = readFileSync(p, "utf8");
  assert(text.includes("IG_SCRAPER_API_KEY"), ".env.example IG_SCRAPER_API_KEY");
  assert(text.includes("IG_SCRAPER_BASE_URL"), ".env.example IG_SCRAPER_BASE_URL");
  assert(
    text.includes("APIFY_IG_MAX_RUNS_PER_HOUR"),
    ".env.example APIFY_IG_MAX_RUNS_PER_HOUR",
  );
  console.log("ENV_EXAMPLE_OK");
}

function assertConfigNoLeak(): void {
  const cfg = readIgScraperConfig();
  if (!cfg) {
    assert(!isIgScraperConfigured(), "unconfigured matches null");
    console.log("CONFIG_SKIP (no key)");
    return;
  }
  assert(isIgScraperConfigured(), "configured");
  assert(typeof cfg.token === "string" && cfg.token.length > 0, "token present");
  assert(cfg.baseUrl.length > 0, "baseUrl");
  // Probe style only — never print token
  console.log(`CONFIG_OK len=${cfg.token.length} base=${cfg.baseUrl}`);
}

async function optionalLiveAuth(): Promise<void> {
  const cfg = readIgScraperConfig();
  if (!cfg) {
    console.log("LIVE_AUTH=skip");
    return;
  }

  try {
    const res = await fetch("https://api.apify.com/v2/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Accept: "application/json",
      },
    });
    if (res.status === 401 || res.status === 403) {
      console.log("LIVE_AUTH=fail");
      return;
    }
    if (!res.ok) {
      console.log(`LIVE_AUTH=fail status=${res.status}`);
      return;
    }
    // Do not dump user/body — may contain account info; no secrets either
    console.log("LIVE_AUTH=ok");
  } catch (err) {
    console.log(
      `LIVE_AUTH=fail net=${err instanceof Error ? err.message : "error"}`,
    );
  }
}

async function main(): Promise<void> {
  assertMapperUnit();
  assertCacheKeys();
  await assertInFlightDedup();
  assertEnvExample();
  assertConfigNoLeak();
  await optionalLiveAuth();
  console.log("SMOKE_C114_OK");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
