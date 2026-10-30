/**
 * One-shot probe Apify IG scraper (does not print token).
 * Run: npx tsx scripts/probe-ig-scraper.ts
 */
import { readFileSync } from "node:fs";
import path from "node:path";

function readKey(): string {
  const env = readFileSync(path.join(process.cwd(), ".env"), "utf8");
  const m = env.match(/^IG_SCRAPER_API_KEY=(.+)$/m);
  const v = m?.[1]?.trim() ?? "";
  if (!v) throw new Error("IG_SCRAPER_API_KEY missing");
  return v;
}

async function main() {
  const token = readKey();
  console.log(`KEY_OK len=${token.length} prefix=${token.slice(0, 9)}`);

  const body = {
    search: "armenianclub",
    searchType: "hashtag",
    resultsType: "posts",
    resultsLimit: 5,
  };

  const res = await fetch(
    "https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?timeout=120",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  console.log(`STATUS=${res.status}`);
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    console.log(`BODY_PREFIX=${text.slice(0, 400)}`);
    process.exit(1);
  }
  if (!Array.isArray(data)) {
    console.log(`NOT_ARRAY=${JSON.stringify(data).slice(0, 500)}`);
    process.exit(1);
  }
  console.log(`COUNT=${data.length}`);
  const o = data[0] as Record<string, unknown> | undefined;
  if (o) {
    console.log(`SAMPLE_KEYS=${Object.keys(o).slice(0, 30).join(",")}`);
    console.log(
      JSON.stringify({
        type: o.type,
        productType: o.productType,
        likesCount: o.likesCount,
        commentsCount: o.commentsCount,
        videoViewCount: o.videoViewCount,
        videoPlayCount: o.videoPlayCount,
        ownerUsername: o.ownerUsername,
        url: o.url,
        displayUrl: typeof o.displayUrl === "string",
        childPosts: Array.isArray(o.childPosts) ? o.childPosts.length : 0,
        images: Array.isArray(o.images) ? o.images.length : 0,
      }),
    );
  }
}

main().catch((e) => {
  console.error("ERR", e instanceof Error ? e.message : e);
  process.exit(1);
});
