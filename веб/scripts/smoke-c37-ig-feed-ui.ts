/**
 * Smoke C-37: Studio UI live feed badge + Razbor slideUrls priority.
 * CI-safe (no IG token required).
 *
 * Run: npx tsx scripts/smoke-c37-ig-feed-ui.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildCompetitorSlides } from "../lib/studio/razbor-pipeline";
import type { FeedPost } from "../lib/studio/feed-types";

const ROOT = join(__dirname, "..");

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function read(rel: string): string {
  const p = join(ROOT, rel);
  assert(existsSync(p), `missing file: ${rel}`);
  return readFileSync(p, "utf8");
}

function assertBadgeSource(): void {
  const workspace = read("components/studio/StudioModuleWorkspace.tsx");
  assert(
    workspace.includes('data-testid="feed-source-badge"'),
    "feed-source-badge testid in StudioModuleWorkspace",
  );
  assert(
    workspace.includes("feedSourceMode") || workspace.includes("sourceMode"),
    "workspace tracks FeedResponse.sourceMode",
  );
  assert(
    workspace.includes("Онлайн · Instagram") &&
      workspace.includes("Демо-данные"),
    "badge copy live/mock",
  );
  // Client must not call Graph / tokens
  assert(!/graph\.facebook\.com/i.test(workspace), "no Graph URL in workspace");
  assert(!/access_token/i.test(workspace), "no access_token in workspace");
  assert(
    !workspace.includes("ig-live-feed") && !workspace.includes("readIgToken"),
    "workspace must not import server IG helpers",
  );
  console.log("SMOKE_C37_BADGE_OK");
}

function assertSlideUrlsPriority(): void {
  const liveUrls = [
    "https://cdn.example/slide-0.jpg",
    "https://cdn.example/slide-1.jpg",
    "https://cdn.example/slide-2.jpg",
  ];
  const withUrls: FeedPost = {
    id: "c37-live-slides",
    source: "competitor",
    title: "Live carousel",
    thumbUrl: "https://cdn.example/cover.jpg",
    metrics: { likes: 10, views: 100 },
    sourceMode: "live",
    topicTags: ["club"],
    slideUrls: liveUrls,
  };

  const slides = buildCompetitorSlides(withUrls);
  assert(slides.length === 3, `slideUrls length → 3 slides (got ${slides.length})`);
  assert(
    slides.every((s, i) => s.imageUrl === liveUrls[i]),
    "slideUrls win over picsum/thumb",
  );
  assert(
    !slides.some((s) => /picsum\.photos/i.test(s.imageUrl)),
    "no picsum when slideUrls present",
  );

  // Live without slideUrls: single thumb, no picsum (D3)
  const liveThumbOnly: FeedPost = {
    id: "c37-live-thumb",
    source: "competitor",
    title: "Live single",
    thumbUrl: "https://cdn.example/only-cover.jpg",
    metrics: { likes: 1, views: 2 },
    sourceMode: "live",
  };
  const thumbSlides = buildCompetitorSlides(liveThumbOnly);
  assert(thumbSlides.length === 1, "live thumb → single slide");
  assert(
    thumbSlides[0].imageUrl === liveThumbOnly.thumbUrl,
    "live thumb URL used",
  );
  assert(
    !/picsum\.photos/i.test(thumbSlides[0].imageUrl),
    "no picsum for live thumb fallback",
  );

  // Mock without slideUrls: synthetic picsum path still works
  const mockPost: FeedPost = {
    id: "c37-mock-synth",
    source: "competitor",
    title: "Mock carousel",
    thumbUrl: "https://picsum.photos/seed/cf-razbor-comp-c37-mock-synth/720/1200",
    metrics: { likes: 5, views: 50 },
    sourceMode: "mock",
    topicTags: ["club"],
  };
  const mockSlides = buildCompetitorSlides(mockPost);
  assert(mockSlides.length >= 3, "mock synthetic ≥3 slides");
  assert(
    mockSlides.some((s) => /picsum\.photos/i.test(s.imageUrl)),
    "mock path still uses picsum when no slideUrls",
  );

  console.log("SMOKE_C37_SLIDES_OK");
}

function assertNoClientSecrets(): void {
  const clientFiles = [
    "components/studio/StudioModuleWorkspace.tsx",
    "components/studio/workspace/RazborModal.tsx",
    "components/studio/workspace/FeedPostCard.tsx",
    "components/studio/workspace/VerticalPostCarousel.tsx",
  ];

  const forbidden = [
    /access_token/i,
    /INSTAGRAM_ACCESS_TOKEN/,
    /IG_ACCESS_TOKEN/,
    /graph\.facebook\.com/i,
    /readIgToken/,
    /ig-live-feed/,
    /ig-feed-config/,
  ];

  for (const rel of clientFiles) {
    const src = read(rel);
    for (const re of forbidden) {
      assert(!re.test(src), `${rel} must not match ${re}`);
    }
    // No hardcoded long token-like EAAG/IGQ blobs
    assert(!/\bEAA[A-Za-z0-9]{20,}/.test(src), `${rel}: no EAA token blob`);
    assert(!/\bIGQ[A-Za-z0-9]{20,}/.test(src), `${rel}: no IGQ token blob`);
  }

  console.log("SMOKE_C37_NO_SECRETS_OK");
}

function main(): void {
  assertBadgeSource();
  assertSlideUrlsPriority();
  assertNoClientSecrets();
  console.log("SMOKE_C37_OK");
}

main();
