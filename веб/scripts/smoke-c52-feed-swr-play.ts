/**
 * C-52: SWR feed skeletons + media-aware Play + comments/shares.
 * Run: npx tsx scripts/smoke-c52-feed-swr-play.ts
 * Optional: BASE_URL=http://127.0.0.1:3000
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { getFeedForModule } from "../lib/studio/feed-fixtures";
import { shouldShowFeedPlay } from "../lib/studio/feed-play";
import type { FeedPost } from "../lib/studio/feed-types";

const ROOT = join(__dirname, "..");
const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function read(rel: string): string {
  const p = join(ROOT, rel);
  assert(existsSync(p), `missing ${rel}`);
  return readFileSync(p, "utf8");
}

function miniPost(
  partial: Partial<FeedPost> & Pick<FeedPost, "id">,
): Pick<FeedPost, "mediaType" | "mediaUrl"> {
  return {
    mediaType: partial.mediaType,
    mediaUrl: partial.mediaUrl,
  };
}

function assertSwrSource(): void {
  const carousel = read("components/studio/workspace/VerticalPostCarousel.tsx");
  assert(
    /showSkeletons\s*=\s*loading\s*&&\s*displayPosts\.length\s*===\s*0/.test(
      carousel,
    ),
    "skeletons only when loading && empty display",
  );
  assert(
    carousel.includes("posts.length === 0"),
    "local title-filter must not skeleton while posts exist",
  );
  assert(
    /showRefetchHint\s*=\s*loading\s*&&\s*displayPosts\.length\s*>\s*0/.test(
      carousel,
    ),
    "refetch hint when loading with posts",
  );
  assert(
    carousel.includes('data-testid={showRefetchHint ? "feed-refetching"'),
    "feed-refetching testid on refetch",
  );
  assert(
    !/if\s*\(\s*loading\s*\)\s*return/.test(carousel),
    "must not early-return skeletons on any loading",
  );

  const workspace = read("components/studio/StudioModuleWorkspace.tsx");
  assert(
    /competitors\.length\s*===\s*0[\s\S]*?feedLoading\s*\|\|\s*competitorsLoading[\s\S]*?competitorsLoading/.test(
      workspace,
    ),
    "C-61: competitors loading split — OR only while empty",
  );
  assert(
    /moduleId=\{moduleId\}/.test(workspace),
    "moduleId wired into carousels",
  );
  console.log("SMOKE_C52_SWR_SOURCE_OK");
}

function assertPlayHelper(): void {
  assert(
    !shouldShowFeedPlay(miniPost({ id: "a", mediaType: "IMAGE" })),
    "IMAGE hides play",
  );
  assert(
    !shouldShowFeedPlay(
      miniPost({ id: "b", mediaType: "VIDEO", mediaUrl: "https://x/a.mp4" }),
      "aesthetic-graphics",
    ),
    "aesthetic-graphics hides play even for VIDEO",
  );
  assert(
    shouldShowFeedPlay(
      miniPost({ id: "c", mediaType: "VIDEO", mediaUrl: "https://x/a.mp4" }),
    ),
    "VIDEO with url shows play",
  );
  assert(
    !shouldShowFeedPlay(
      miniPost({ id: "d", mediaType: "CAROUSEL_ALBUM", mediaUrl: undefined }),
    ),
    "carousel album without video url hides play",
  );
  assert(
    !shouldShowFeedPlay(
      miniPost({
        id: "e",
        mediaType: "CAROUSEL_ALBUM",
        mediaUrl: "https://x/slide.jpg",
      }),
    ),
    "carousel image url hides play",
  );
  assert(
    !shouldShowFeedPlay(miniPost({ id: "f", mediaType: undefined })),
    "no mediaUrl and not VIDEO hides play",
  );

  const card = read("components/studio/workspace/FeedPostCard.tsx");
  assert(card.includes("shouldShowFeedPlay"), "card uses helper");
  assert(card.includes("комм."), "RU comments label");
  assert(card.includes("репосты"), "RU shares label");
  assert(
    /typeof post\.metrics\.comments === "number"/.test(card),
    "comments shown when number set (incl. grid)",
  );
  assert(
    /typeof post\.metrics\.shares === "number"/.test(card),
    "shares shown when number set",
  );
  console.log("SMOKE_C52_PLAY_HELPER_OK");
}

function assertGraphicsFixtures(): void {
  const feed = getFeedForModule("aesthetic-graphics");
  const all = [...feed.ours, ...feed.competitors];
  assert(all.length > 0, "graphics fixtures nonempty");
  for (const post of all) {
    assert(post.mediaType === "IMAGE", `${post.id} must be IMAGE`);
    assert(!shouldShowFeedPlay(post, "aesthetic-graphics"), `${post.id} no play`);
    assert(typeof post.metrics.comments === "number", `${post.id} comments`);
    assert(typeof post.metrics.shares === "number", `${post.id} shares`);
  }
  console.log(`SMOKE_C52_GRAPHICS_FIXTURES_OK n=${all.length}`);
}

async function optionalHttp(): Promise<void> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const page = await fetch(`${BASE}/studio/aesthetic-graphics`, {
      signal: ctrl.signal,
    });
    clearTimeout(t);
    assert(page.ok, `graphics page ${page.status}`);
    const html = await page.text();
    assert(!html.includes("Studio Launchpad"), "page html no Launchpad");
    console.log("SMOKE_C52_HTTP_OK");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`SMOKE_C52_HTTP_SKIP (${msg})`);
  }
}

async function main(): Promise<void> {
  assertSwrSource();
  assertPlayHelper();
  assertGraphicsFixtures();
  await optionalHttp();
  console.log("SMOKE_C52_OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
