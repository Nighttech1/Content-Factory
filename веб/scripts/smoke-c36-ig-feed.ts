/**
 * Smoke C-36: Instagram live feed contract (CI-safe).
 * - Always: fixtures + types + mock path via resolveStudioFeed (no token needed)
 * - Live Graph only when isIgFeedConfigured() (token + IG_USER_ID)
 *
 * Run: npx tsx scripts/smoke-c36-ig-feed.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { readIgToken } from "../lib/analytics/adapters/ig-token";
import {
  emptyFeed,
  getFeedForModule,
  resolveFeed,
} from "../lib/studio/feed-fixtures";
import {
  clearIgFeedCache,
  IG_FEED_CACHE_TTL_MS,
} from "../lib/studio/ig-feed-cache";
import {
  isIgFeedConfigured,
  readIgFeedConfig,
} from "../lib/studio/ig-feed-config";
import { resolveStudioFeed } from "../lib/studio/ig-live-feed";
import {
  aggregateFeedSourceMode,
  FEED_CORE_MODULE_IDS,
  type FeedPost,
  type FeedResponse,
} from "../lib/studio/feed-types";

const ROOT = join(__dirname, "..");

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function read(rel: string): string {
  const p = join(ROOT, rel);
  assert(existsSync(p), `missing file: ${rel}`);
  return readFileSync(p, "utf8");
}

function assertPost(p: unknown, label: string): void {
  assert(p && typeof p === "object", `${label}: post object`);
  const post = p as Record<string, unknown>;
  assert(typeof post.id === "string" && post.id, `${label}: id`);
  assert(
    post.source === "ours" || post.source === "competitor",
    `${label}: source`,
  );
  assert(typeof post.title === "string", `${label}: title`);
  assert(
    post.sourceMode === "live" || post.sourceMode === "mock",
    `${label}: sourceMode required`,
  );
  assert(post.metrics && typeof post.metrics === "object", `${label}: metrics`);
  const m = post.metrics as Record<string, unknown>;
  assert(typeof m.likes === "number", `${label}: likes`);
  assert(typeof m.views === "number", `${label}: views`);
}

function assertFeedShape(body: unknown, label: string): void {
  assert(body && typeof body === "object", `${label}: body object`);
  const o = body as FeedResponse;
  assert(Array.isArray(o.ours), `${label}: ours`);
  assert(Array.isArray(o.competitors), `${label}: competitors`);
  assert(
    o.sourceMode === "live" || o.sourceMode === "mock",
    `${label}: top-level sourceMode`,
  );
  for (const p of o.ours) assertPost(p, `${label}.ours`);
  for (const p of o.competitors) assertPost(p, `${label}.competitors`);
  const expected = aggregateFeedSourceMode(o.ours, o.competitors);
  assert(
    o.sourceMode === expected,
    `${label}: aggregate sourceMode mismatch (${o.sourceMode} vs ${expected})`,
  );
}

function assertNoSecrets(body: unknown): void {
  const json = JSON.stringify(body);
  assert(!/"access_token"/i.test(json), "JSON must not contain access_token key");
  const token = readIgToken();
  if (token) {
    assert(!json.includes(token), "JSON must not embed token value");
  }
}

async function assertMockPath(): Promise<void> {
  // Ensure empty token path: fixtures always work regardless of env
  for (const id of FEED_CORE_MODULE_IDS) {
    const feed = getFeedForModule(id);
    assertFeedShape(feed, `fixture:${id}`);
    assert(feed.sourceMode === "mock", `${id}: fixture top-level mock`);
    for (const p of [...feed.ours, ...feed.competitors]) {
      assert(p.sourceMode === "mock", `${id}: post mock`);
    }
  }

  const empty = emptyFeed();
  assertFeedShape(empty, "empty");
  assert(empty.sourceMode === "mock", "empty mock");

  assert(resolveFeed("not-a-module") === null, "unknown → null");

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
  const mockCarousel = await resolveStudioFeed("carousel-engine");
  assert(mockCarousel, "carousel mock resolves");
  assertFeedShape(mockCarousel, "resolve mock carousel");
  assert(mockCarousel!.sourceMode === "mock", "carousel mock mode");
  assertNoSecrets(mockCarousel);

  const other = await resolveStudioFeed("aesthetic-graphics");
  assert(other, "other core resolves");
  assertFeedShape(other, "aesthetic");
  assert(other!.sourceMode === "mock", "other modules stay mock");

  const custom = await resolveStudioFeed("custom-smoke-plugin");
  assert(custom, "custom resolves");
  assertFeedShape(custom, "custom");
  assert(custom!.ours.length === 0, "custom empty");

  const unknown = await resolveStudioFeed("unknown-module-xyz");
  assert(unknown === null, "unknown → null");

  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }

  const route = read("app/api/studio/[moduleId]/feed/route.ts");
  assert(route.includes("resolveStudioFeed"), "route uses resolveStudioFeed");
  assert(!route.toLowerCase().includes("prisma"), "no prisma in feed route");

  const envExample = read(".env.example");
  assert(envExample.includes("IG_USER_ID"), ".env.example IG_USER_ID");
  assert(
    envExample.includes("IG_COMPETITOR_USERNAMES"),
    ".env.example IG_COMPETITOR_USERNAMES",
  );
  assert(envExample.includes("IG_OURS_USERNAME"), ".env.example IG_OURS_USERNAME");

  assert(IG_FEED_CACHE_TTL_MS === 10 * 60 * 1000, "cache TTL 10 min");

  console.log("SMOKE_C36_MOCK_OK");
}

async function assertLiveIfConfigured(): Promise<void> {
  // Restore may be incomplete if only IG_USER_ID was set — re-read from process
  if (!isIgFeedConfigured()) {
    console.log(
      "SMOKE_C36_LIVE_SKIP (set INSTAGRAM_ACCESS_TOKEN|… + IG_USER_ID for live)",
    );
    return;
  }

  const config = readIgFeedConfig();
  assert(config, "config when configured");
  // Never print token
  assert(config!.igUserId, "igUserId present");
  assert(config!.oursUsername, "oursUsername present");

  clearIgFeedCache();
  const live = await resolveStudioFeed("carousel-engine");
  assert(live, "live resolve");
  assertFeedShape(live, "live carousel");
  assertNoSecrets(live);

  const json = JSON.stringify(live);
  assert(!json.includes(config!.token), "response must not include token");

  if (live!.sourceMode === "live") {
    const livePosts = [...live!.ours, ...live!.competitors].filter(
      (p: FeedPost) => p.sourceMode === "live",
    );
    assert(livePosts.length > 0, "live mode implies live posts");
    for (const p of livePosts) {
      assert(p.externalId, `live post ${p.id} externalId`);
      assert(typeof p.metrics.views === "number", "views number (D2 may be 0)");
    }
    console.log(
      `SMOKE_C36_LIVE_OK (ours=${live!.ours.length} competitors=${live!.competitors.length} mode=${live!.sourceMode})`,
    );
  } else {
    // Configured but Graph soft-failed → still valid mock fallback
    assert(live!.sourceMode === "mock", "soft-fail → mock");
    console.log("SMOKE_C36_LIVE_SOFT_FAIL_MOCK_OK");
  }

  // Cache hit: second call should not throw
  const again = await resolveStudioFeed("carousel-engine");
  assertFeedShape(again, "cached");
  assertNoSecrets(again);
}

async function main(): Promise<void> {
  await assertMockPath();
  await assertLiveIfConfigured();
  console.log("SMOKE_C36_OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
