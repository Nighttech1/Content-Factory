/**
 * Smoke C-29: carousel-engine grid fixtures (≥21+21 with https thumbUrl)
 * + UI source contracts (grid-cols-3, aspect 3/5, drafts btn testid).
 *
 * File asserts always run. Live HTTP when BASE_URL reachable:
 *   BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c29-feed-grid.ts
 *
 * Run: npx tsx scripts/smoke-c29-feed-grid.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getFeedForModule, matchesTopic } from "../lib/studio/feed-fixtures";

const BASE = process.env.BASE_URL?.replace(/\/$/, "") ?? "";
const ROOT = join(__dirname, "..");

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function assertHttpsThumb(url: unknown, label: string): void {
  assert(typeof url === "string" && url.length > 0, `${label}: thumbUrl string`);
  assert(
    (url as string).startsWith("https://"),
    `${label}: thumbUrl must be https (${url})`,
  );
}

function assertFixtures(): void {
  const feed = getFeedForModule("carousel-engine");
  assert(feed.ours.length >= 21, `carousel ours >= 21 (got ${feed.ours.length})`);
  assert(
    feed.competitors.length >= 21,
    `carousel competitors >= 21 (got ${feed.competitors.length})`,
  );

  for (const p of feed.ours) {
    assertHttpsThumb(p.thumbUrl, `ours ${p.id}`);
    assert(
      (p.thumbUrl as string).includes("picsum.photos/seed/cf-carousel-ours-"),
      `ours ${p.id}: picsum seed`,
    );
  }
  for (const p of feed.competitors) {
    assertHttpsThumb(p.thumbUrl, `comp ${p.id}`);
    assert(
      (p.thumbUrl as string).includes("picsum.photos/seed/cf-carousel-comp-"),
      `comp ${p.id}: picsum seed`,
    );
  }

  const filtered = getFeedForModule("carousel-engine", "wedding");
  assert(
    filtered.ours.length === feed.ours.length,
    "ours unchanged by topic filter",
  );
  assert(filtered.competitors.length > 0, "wedding filter returns some");
  for (const c of filtered.competitors) {
    assert(matchesTopic(c, "wedding"), `topic match: ${c.title}`);
  }

  console.log("SMOKE_C29_FIXTURES_OK");
}

function assertUiSource(): void {
  const carousel = readFileSync(
    join(ROOT, "components/studio/workspace/VerticalPostCarousel.tsx"),
    "utf8",
  );
  const card = readFileSync(
    join(ROOT, "components/studio/workspace/FeedPostCard.tsx"),
    "utf8",
  );
  const workspace = readFileSync(
    join(ROOT, "components/studio/StudioModuleWorkspace.tsx"),
    "utf8",
  );

  assert(carousel.includes("grid-cols-3"), "VerticalPostCarousel: grid-cols-3");
  assert(
    carousel.includes("ours-tab-drafts") ||
      carousel.includes('data-testid="ours-drafts-btn"') ||
      carousel.includes('data-testid="carousel-drafts-btn"'),
    "VerticalPostCarousel: drafts tab/btn testid",
  );
  assert(
    card.includes('aspectRatio === "3/5"') || card.includes("aspect-[3/5]"),
    "FeedPostCard: aspect 3/5",
  );
  assert(
    workspace.includes('moduleId === "carousel-engine"') &&
      workspace.includes('"3/5"') &&
      workspace.includes('layout={feedLayout}') &&
      workspace.includes("showDraftsButton"),
    "StudioModuleWorkspace: carousel-engine grid + 3/5 + drafts",
  );

  console.log("SMOKE_C29_UI_SOURCE_OK");
}

async function assertLive(): Promise<void> {
  if (!BASE) {
    console.log("SMOKE_C29_LIVE_SKIP (set BASE_URL to hit HTTP)");
    return;
  }

  const res = await fetch(`${BASE}/api/studio/carousel-engine/feed`);
  assert(res.status === 200, `live status ${res.status}`);
  const body = (await res.json()) as {
    ours: { thumbUrl?: string }[];
    competitors: { thumbUrl?: string }[];
  };
  assert(body.ours.length >= 21, "live ours >= 21");
  assert(body.competitors.length >= 21, "live competitors >= 21");
  for (const p of [...body.ours, ...body.competitors]) {
    assertHttpsThumb(p.thumbUrl, "live post");
  }

  console.log("SMOKE_C29_LIVE_OK");
}

async function main(): Promise<void> {
  assertFixtures();
  assertUiSource();
  await assertLive();
  console.log("SMOKE_C29_OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
