/**
 * S50 smoke — hit Studio competitors feed and print live vs mock counts.
 * Loads `.env` for IG_SCRAPER_API_KEY. Never prints the key value.
 *
 * Usage:
 *   npx tsx scripts/smoke-s50-competitors-live-vs-mock.ts
 *   npx tsx scripts/smoke-s50-competitors-live-vs-mock.ts --url http://127.0.0.1:3000
 *   npx tsx scripts/smoke-s50-competitors-live-vs-mock.ts --direct   # call resolveStudioFeed in-process
 *
 * Exit 0 always for soft-fail observability (prints PASS/WARN/FAIL line).
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

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

type PostLike = {
  sourceMode?: string;
  slideUrls?: string[];
  username?: string;
  mediaType?: string;
};

type FeedLike = {
  ours?: PostLike[];
  competitors?: PostLike[];
  sourceMode?: string;
};

function countModes(posts: PostLike[]): { live: number; mock: number; other: number } {
  let live = 0;
  let mock = 0;
  let other = 0;
  for (const p of posts) {
    if (p.sourceMode === "live") live += 1;
    else if (p.sourceMode === "mock") mock += 1;
    else other += 1;
  }
  return { live, mock, other };
}

function summarize(label: string, feed: FeedLike): void {
  const competitors = Array.isArray(feed.competitors) ? feed.competitors : [];
  const ours = Array.isArray(feed.ours) ? feed.ours : [];
  const c = countModes(competitors);
  const o = countModes(ours);
  const withSlides = competitors.filter(
    (p) => Array.isArray(p.slideUrls) && p.slideUrls.length > 0,
  ).length;
  const sampleUser = competitors.find((p) => p.username)?.username ?? "(none)";

  // eslint-disable-next-line no-console
  console.log(`\n=== ${label} ===`);
  // eslint-disable-next-line no-console
  console.log(
    `top-level sourceMode=${feed.sourceMode ?? "?"} | scraperKey=${
      process.env.IG_SCRAPER_API_KEY?.trim() ? "SET" : "MISSING"
    } | USE_FEED_FIXTURES=${process.env.USE_FEED_FIXTURES?.trim() || "(unset)"}`,
  );
  // eslint-disable-next-line no-console
  console.log(
    `competitors: total=${competitors.length} live=${c.live} mock=${c.mock} other=${c.other} withSlideUrls=${withSlides} sampleUser=${sampleUser}`,
  );
  // eslint-disable-next-line no-console
  console.log(
    `ours: total=${ours.length} live=${o.live} mock=${o.mock} other=${o.other}`,
  );

  const scraperOn = Boolean(process.env.IG_SCRAPER_API_KEY?.trim());
  const fixturesForced = process.env.USE_FEED_FIXTURES?.trim() === "1";
  if (scraperOn && !fixturesForced && c.mock > 0 && c.live === 0) {
    // eslint-disable-next-line no-console
    console.log("VERDICT: FAIL — scraper key present but competitors are all mock");
  } else if (scraperOn && c.live > 0) {
    // eslint-disable-next-line no-console
    console.log("VERDICT: PASS — live competitors present");
  } else if (scraperOn && c.live === 0 && c.mock === 0) {
    // eslint-disable-next-line no-console
    console.log(
      "VERDICT: WARN — scraper on, competitors empty (Apify/Graph soft-fail; not mock)",
    );
  } else {
    // eslint-disable-next-line no-console
    console.log("VERDICT: INFO — fixtures/demo path (no scraper or fixtures forced)");
  }
}

async function viaHttp(baseUrl: string): Promise<void> {
  const url = `${baseUrl.replace(/\/$/, "")}/api/studio/carousel-engine/feed`;
  // eslint-disable-next-line no-console
  console.log(`GET ${url} …`);
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  let data: FeedLike = {};
  try {
    data = JSON.parse(text) as FeedLike;
  } catch {
    // eslint-disable-next-line no-console
    console.log(`HTTP ${res.status} non-JSON body (${text.slice(0, 120)}…)`);
    return;
  }
  // eslint-disable-next-line no-console
  console.log(`HTTP ${res.status}`);
  summarize("HTTP /api/studio/carousel-engine/feed", data);
}

async function viaDirect(): Promise<void> {
  const { resolveStudioFeed } = await import("../lib/studio/ig-live-feed");
  const feed = await resolveStudioFeed("carousel-engine");
  if (!feed) {
    // eslint-disable-next-line no-console
    console.log("direct resolveStudioFeed returned null");
    return;
  }
  summarize("direct resolveStudioFeed(carousel-engine)", feed);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const direct = args.includes("--direct");
  const urlIdx = args.indexOf("--url");
  const baseUrl =
    urlIdx >= 0 && args[urlIdx + 1]
      ? args[urlIdx + 1]!
      : process.env.SMOKE_BASE_URL?.trim() || "http://127.0.0.1:3000";

  if (direct) {
    await viaDirect();
  } else {
    try {
      await viaHttp(baseUrl);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(
        `HTTP failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      // eslint-disable-next-line no-console
      console.log("Falling back to --direct …");
      await viaDirect();
    }
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
