/**
 * Live Apify scrape → split carousel / reels (no token print).
 * Run: npx tsx scripts/run-ig-scraper-live.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { clearIgFeedCache } from "@/lib/studio/ig-feed-cache";
import {
  fetchApifyCompetitorPosts,
  filterCompetitorsForModule,
  popularityScorePost,
} from "@/lib/studio/ig-apify-scraper";
import { isIgScraperConfigured } from "@/lib/studio/ig-scraper-config";

function loadDotEnv(): void {
  const filePath = join(__dirname, "..", ".env");
  if (!existsSync(filePath)) return;
  for (const raw of readFileSync(filePath, "utf8").split(/\r?\n/)) {
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

async function main() {
  loadDotEnv();
  if (!isIgScraperConfigured()) {
    console.error("CONFIG=missing");
    process.exit(1);
  }
  clearIgFeedCache();
  console.log("SCRAPE_START limit=50");
  const all = await fetchApifyCompetitorPosts(undefined);
  const carousels = filterCompetitorsForModule("carousel-engine", all);
  const reels = filterCompetitorsForModule("custom-reels", all);
  console.log(`TOTAL=${all.length}`);
  console.log(`CAROUSELS=${carousels.length}`);
  console.log(`REELS=${reels.length}`);
  if (carousels[0]) {
    const p = carousels[0];
    console.log(
      `TOP_CAROUSEL likes=${p.metrics.likes} comments=${p.metrics.comments ?? 0} views=${p.metrics.views} score=${popularityScorePost(p)} user=${p.username ?? "-"}`,
    );
  }
  if (reels[0]) {
    const p = reels[0];
    console.log(
      `TOP_REEL likes=${p.metrics.likes} comments=${p.metrics.comments ?? 0} views=${p.metrics.views} score=${popularityScorePost(p)} user=${p.username ?? "-"}`,
    );
  }
  const sorted =
    all.length >= 2 &&
    popularityScorePost(all[0]!) >= popularityScorePost(all[1]!);
  console.log(`SORT_OK=${sorted || all.length < 2}`);
  if (all.length === 0) process.exit(2);
  console.log("SCRAPE_OK");
}

main().catch((e) => {
  console.error("ERR", e instanceof Error ? e.message : e);
  process.exit(1);
});
