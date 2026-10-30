/**
 * Smoke C-39: topic→hashtags mapper + soft-fail feed (CI-safe, no token required).
 * Live Graph optional when configured — never fails CI without token.
 *
 * Run: npx tsx scripts/smoke-c39-ig-hashtag-feed.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { readIgToken } from "../lib/analytics/adapters/ig-token";
import {
  clearIgFeedCache,
  igFeedCacheKeyCompetitors,
} from "../lib/studio/ig-feed-cache";
import { isIgFeedConfigured } from "../lib/studio/ig-feed-config";
import { resolveStudioFeed } from "../lib/studio/ig-live-feed";
import {
  hashtagsForGraphQuery,
  IG_NICHE_DEFAULT_HASHTAGS,
  mapTopicToHashtags,
  TOPIC_HASHTAGS_MAX,
  TOPIC_HASHTAGS_QUERY_MAX,
} from "../lib/studio/topic-hashtags";
import type { FeedResponse } from "../lib/studio/feed-types";

const ROOT = join(__dirname, "..");

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function read(rel: string): string {
  const p = join(ROOT, rel);
  assert(existsSync(p), `missing file: ${rel}`);
  return readFileSync(p, "utf8");
}

function assertMapperUnit(): void {
  const savedDefault = process.env.IG_DEFAULT_HASHTAGS;
  delete process.env.IG_DEFAULT_HASHTAGS;

  const empty = mapTopicToHashtags("");
  assert(empty.emptyTopic === true, "empty: emptyTopic");
  assert(empty.topic === "", "empty: topic string");
  assert(empty.source === "deterministic_mapper", "empty: source");
  assert(
    empty.hashtags.join(",") === [...IG_NICHE_DEFAULT_HASHTAGS].join(","),
    "empty: niche defaults",
  );

  process.env.IG_DEFAULT_HASHTAGS = "clubnight, yerevan , #foodie";
  const envEmpty = mapTopicToHashtags("   ");
  assert(envEmpty.emptyTopic === true, "env empty: emptyTopic");
  assert(envEmpty.hashtags[0] === "clubnight", "env empty: first tag");
  assert(envEmpty.hashtags.includes("yerevan"), "env empty: yerevan");
  assert(envEmpty.hashtags.includes("foodie"), "env empty: strip #");
  assert(!envEmpty.hashtags.some((h) => h.includes("#")), "no # in tags");
  assert(envEmpty.hashtags.length <= TOPIC_HASHTAGS_MAX, "env empty: cap ≤5");

  if (savedDefault === undefined) delete process.env.IG_DEFAULT_HASHTAGS;
  else process.env.IG_DEFAULT_HASHTAGS = savedDefault;

  const guest = mapTopicToHashtags("гостевой вечер");
  assert(guest.emptyTopic === false, "guest: emptyTopic false");
  assert(guest.topic === "гостевой вечер", "guest: preserves input trim");
  assert(guest.hashtags.includes("guestnight"), "guest: alias guestnight");
  assert(guest.hashtags.includes("armenianclub"), "guest: niche anchor");
  assert(guest.hashtags.length <= TOPIC_HASHTAGS_MAX, "guest: ≤5");
  assert(
    hashtagsForGraphQuery(guest).length <= TOPIC_HASHTAGS_QUERY_MAX,
    "graph slice ≤3",
  );

  const food = mapTopicToHashtags("armenian food night");
  assert(food.hashtags.includes("armenianfood"), "food alias");

  const unknown = mapTopicToHashtags("xyzclubbing");
  assert(unknown.hashtags.includes("armenianclub"), "unknown: anchor club");
  assert(unknown.hashtags.includes("yerevan"), "unknown: anchor yerevan");
  assert(
    unknown.hashtags.every((h) => /^[a-z0-9]+$/.test(h)),
    "unknown: bare lowercase alnum",
  );

  const keyA = igFeedCacheKeyCompetitors("123", {
    topic: "Гостевой",
    hashtags: ["guestnight", "armenianclub"],
  });
  const keyB = igFeedCacheKeyCompetitors("123", {
    topic: "гостевой",
    hashtags: ["armenianclub", "guestnight"],
  });
  assert(keyA.includes("t=гостевой"), "cache key topic lower");
  assert(keyA.includes("h=armenianclub,guestnight"), "cache key sorts tags");
  assert(keyA === keyB, "cache key stable sort");

  console.log("SMOKE_C39_MAPPER_OK");
}

function assertEnvExample(): void {
  const envExample = read(".env.example");
  assert(envExample.includes("IG_DEFAULT_HASHTAGS"), ".env.example defaults");
  assert(
    envExample.includes("OPTIONAL fallback only"),
    ".env.example BD fallback note",
  );

  const live = read("lib/studio/ig-live-feed.ts");
  assert(live.includes("ig_hashtag_search"), "live feed hashtag search");
  assert(live.includes("top_media"), "live feed top_media");
  assert(live.includes("mapTopicToHashtags"), "wires mapper");
  assert(!/cheerio|puppeteer.*instagram/i.test(live), "no scrape client");
}

async function assertSoftFailMock(): Promise<void> {
  const saved = {
    IG_USER_ID: process.env.IG_USER_ID,
    INSTAGRAM_ACCESS_TOKEN: process.env.INSTAGRAM_ACCESS_TOKEN,
    INSTAGRAM_GRAPH_TOKEN: process.env.INSTAGRAM_GRAPH_TOKEN,
    IG_ACCESS_TOKEN: process.env.IG_ACCESS_TOKEN,
  };

  delete process.env.IG_USER_ID;
  delete process.env.INSTAGRAM_ACCESS_TOKEN;
  delete process.env.INSTAGRAM_GRAPH_TOKEN;
  delete process.env.IG_ACCESS_TOKEN;

  assert(!isIgFeedConfigured(), "forced unconfigured");
  clearIgFeedCache();

  const feedEmptyTopic = await resolveStudioFeed("carousel-engine");
  assert(feedEmptyTopic, "resolves without token");
  assert(feedEmptyTopic!.sourceMode === "mock", "soft-fail mock");
  assert(Array.isArray(feedEmptyTopic!.competitors), "competitors array");
  assert(
    feedEmptyTopic!.competitors.length > 0,
    "fixture competitors present (empty topic)",
  );

  const feedWithTopic = await resolveStudioFeed(
    "carousel-engine",
    "гостевой вечер",
  );
  assert(feedWithTopic, "resolves with topic without token");
  assert(feedWithTopic!.sourceMode === "mock", "topic soft-fail mock");
  assert(Array.isArray(feedWithTopic!.competitors), "topic competitors array");

  const json = JSON.stringify({ feedEmptyTopic, feedWithTopic });
  assert(!/"access_token"/i.test(json), "no access_token key");
  const token = readIgToken();
  if (token) assert(!json.includes(token), "no token in body");

  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }

  console.log("SMOKE_C39_SOFT_FAIL_OK");
}

async function assertLiveOptional(): Promise<void> {
  if (!isIgFeedConfigured()) {
    console.log(
      "SMOKE_C39_LIVE_SKIP (set token + IG_USER_ID for live hashtag feed)",
    );
    return;
  }

  clearIgFeedCache();
  const feed = (await resolveStudioFeed(
    "carousel-engine",
    "гостевой вечер",
  )) as FeedResponse;
  assert(feed, "live resolve");
  const json = JSON.stringify(feed);
  const token = readIgToken();
  if (token) assert(!json.includes(token), "live response no token");

  if (feed.sourceMode === "live") {
    console.log(
      `SMOKE_C39_LIVE_OK (competitors=${feed.competitors.length} mode=${feed.sourceMode})`,
    );
  } else {
    assert(feed.sourceMode === "mock", "soft-fail still mock");
    console.log("SMOKE_C39_LIVE_SOFT_FAIL_MOCK_OK");
  }
}

async function main(): Promise<void> {
  assertMapperUnit();
  assertEnvExample();
  await assertSoftFailMock();
  await assertLiveOptional();
  console.log("SMOKE_C39_OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
