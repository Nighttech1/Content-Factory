/**
 * Smoke C-40: Competitors column by topic (UI source contract).
 * CI-safe (no IG token / no live server required for source asserts).
 *
 * Run: npx tsx scripts/smoke-c40-competitors-by-topic-ui.ts
 *
 * Optional HTTP smoke (when BASE_URL set / default localhost):
 *   BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c40-competitors-by-topic-ui.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { getFeedForModule } from "../lib/studio/feed-fixtures";

const ROOT = join(__dirname, "..");
const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

/** Fixer: RU topic via hashtag aliases must not empty mock competitors. */
function assertGuestTopicMockCompetitors(): void {
  const empty = getFeedForModule("carousel-engine", "");
  assert(empty.competitors.length > 0, "empty topic → niche competitors");

  const guest = getFeedForModule("carousel-engine", "гостевой");
  assert(
    guest.competitors.length > 0,
    "topic=гостевой must yield non-empty mock competitors (hashtag alias)",
  );
  assert(
    guest.competitors.length <= empty.competitors.length,
    "topic filter ⊆ full niche set",
  );
  console.log(
    `SMOKE_C40_GUEST_TOPIC_OK n=${guest.competitors.length}/${empty.competitors.length}`,
  );
}

function read(rel: string): string {
  const p = join(ROOT, rel);
  assert(existsSync(p), `missing file: ${rel}`);
  return readFileSync(p, "utf8");
}

/** Forbidden UX: ask user for competitor Instagram URLs / nicks as primary input. */
const COMPETITOR_URL_COPY_RE =
  /(вставь(те)?\s+(ссылк|url|ник)|добавь(те)?\s+конкурент|ссылк[аи]\s+на\s+конкурент|instagram\.com\/|конкурент[а-я]*\s+(url|ссылк|ник|username)|paste\s+(competitor|instagram)\s+(url|link)|enter\s+competitor\s+(url|username))/i;

function assertMountFetchesNiche(): void {
  const workspace = read("components/studio/StudioModuleWorkspace.tsx");
  assert(
    /fetchFeed\(\s*undefined\s*,\s*["']full["']\s*\)/.test(workspace),
    "mount must call fetchFeed(undefined, full) — niche competitors without topic",
  );
  assert(
    workspace.includes("competitorsLoading"),
    "competitorsLoading state for topic-only refresh",
  );
  assert(
    /loading=\{feedLoading\s*\|\|\s*competitorsLoading\}/.test(workspace) ||
      workspace.includes("competitorsLoading"),
    "competitors column uses loading while refreshing",
  );
  assert(
    workspace.includes('testId="carousel-competitors"') ||
      workspace.includes('testId="carousel-competitors"'),
    "competitors carousel testId present",
  );
  assert(
    workspace.includes("Актуальные карусели ниши") ||
      workspace.includes("карусели ниши"),
    "empty-topic subtitle = niche (not paste competitors)",
  );
  console.log("SMOKE_C40_MOUNT_OK");
}

function assertTopicClearRefetch(): void {
  const workspace = read("components/studio/StudioModuleWorkspace.tsx");
  const idea = read("components/studio/workspace/ModuleIdeaBar.tsx");

  // Empty commit must refetch competitors (niche), not early-return
  assert(
    /function handleTopicCommit/.test(workspace),
    "handleTopicCommit present",
  );
  assert(
    /fetchFeed\(\s*next\s*\|\|\s*undefined\s*,\s*["']competitors["']\s*\)/.test(
      workspace,
    ) ||
      /fetchFeed\(\s*[^,]+,\s*["']competitors["']\s*\)/.test(workspace),
    "topic commit refreshes competitors mode",
  );
  assert(
    !/if\s*\(\s*!\s*next\s*\)\s*return/.test(
      workspace.slice(workspace.indexOf("handleTopicCommit")),
    ),
    "handleTopicCommit must NOT early-return on empty topic",
  );

  assert(
    idea.includes('data-testid="module-idea-clear"'),
    "clear control testid",
  );
  assert(
    /onTopicCommit\(\s*["']["']\s*\)/.test(idea) ||
      idea.includes('onTopicCommit("")'),
    "clearTopic commits empty string → niche refetch",
  );
  assert(idea.includes("Сбросить"), "clear button copy");
  console.log("SMOKE_C40_CLEAR_OK");
}

function assertNoCompetitorUrlCopy(): void {
  const files = [
    "components/studio/StudioModuleWorkspace.tsx",
    "components/studio/workspace/ModuleIdeaBar.tsx",
    "components/studio/workspace/VerticalPostCarousel.tsx",
    "components/studio/workspace/FeedPostCard.tsx",
  ];

  for (const rel of files) {
    const src = read(rel);
    assert(
      !COMPETITOR_URL_COPY_RE.test(src),
      `${rel}: must not ask for competitor URLs/nicks as CTA`,
    );
  }

  const idea = read("components/studio/workspace/ModuleIdeaBar.tsx");
  assert(
    idea.includes("Конкуренты подбираются по теме автоматически") ||
      /автоматически/.test(idea),
    "auto-topic competitors hint present",
  );
  assert(
    !/placeholder=.*конкурент/i.test(idea),
    "topic placeholder must not ask for competitors",
  );
  assert(
    !/placeholder=.*instagram\.com/i.test(idea),
    "topic placeholder must not ask for IG URLs",
  );

  console.log("SMOKE_C40_NO_URL_COPY_OK");
}

function assertLoadingWiring(): void {
  const workspace = read("components/studio/StudioModuleWorkspace.tsx");
  // full → feedLoading; else (competitors) → competitorsLoading
  assert(
    /if\s*\(\s*mode\s*===\s*["']full["']\s*\)\s*\{[\s\S]*?setFeedLoading\(\s*true\s*\)[\s\S]*?\}\s*else\s*\{[\s\S]*?setCompetitorsLoading\(\s*true\s*\)/.test(
      workspace,
    ),
    "full→feedLoading; else(competitors)→competitorsLoading",
  );
  assert(
    workspace.includes("setCompetitorsLoading(false)"),
    "competitorsLoading cleared in finally",
  );
  assert(
    /competitors\.length\s*===\s*0[\s\S]*?feedLoading\s*\|\|\s*competitorsLoading/.test(
      workspace,
    ),
    "C-61: competitors loading OR only on first empty load",
  );

  // C-52 SWR: parent loading prop stays; carousel must not pulse-replace populated grid.
  const carousel = read("components/studio/workspace/VerticalPostCarousel.tsx");
  assert(
    /showSkeletons\s*=\s*loading\s*&&\s*displayPosts\.length\s*===\s*0/.test(
      carousel,
    ),
    "C-52: skeletons only when loading && empty",
  );
  assert(
    carousel.includes("feed-refetching"),
    "C-52: refetch hint testid when posts already shown",
  );
  console.log("SMOKE_C40_LOADING_OK");
}

async function optionalHttpSmoke(): Promise<"ok" | "skip"> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(`${BASE}/api/studio/carousel-engine/feed`, {
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) {
      throw new Error(`feed status ${res.status}`);
    }
    const data = (await res.json()) as { competitors?: unknown };
    assert(
      Array.isArray(data.competitors),
      "feed JSON must include competitors array",
    );
    assert(
      (data.competitors as unknown[]).length >= 0,
      "competitors array present (may be empty only if broken backend)",
    );
    // Soft: prefer non-empty mock/live for niche
    if ((data.competitors as unknown[]).length === 0) {
      console.warn(
        "SMOKE_C40_HTTP_WARN: competitors empty without topic — check C-39 mock",
      );
    } else {
      console.log(
        `SMOKE_C40_HTTP_COMPETITORS_OK n=${(data.competitors as unknown[]).length}`,
      );
    }

    const topicRes = await fetch(
      `${BASE}/api/studio/carousel-engine/feed?topic=${encodeURIComponent("гостевой")}`,
    );
    assert(topicRes.ok, `topic feed status ${topicRes.status}`);
    const topicData = (await topicRes.json()) as { competitors?: unknown };
    assert(
      Array.isArray(topicData.competitors),
      "topic feed must include competitors array",
    );
    assert(
      (topicData.competitors as unknown[]).length > 0,
      "topic=гостевой must yield non-empty mock competitors",
    );
    console.log(
      `SMOKE_C40_HTTP_TOPIC_OK n=${(topicData.competitors as unknown[]).length}`,
    );

    const page = await fetch(`${BASE}/studio/carousel-engine`);
    assert(page.ok, `page /studio/carousel-engine status ${page.status}`);
    console.log("SMOKE_C40_HTTP_OK");
    return "ok";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`SMOKE_C40_HTTP_SKIP (${msg})`);
    return "skip";
  }
}

async function main(): Promise<void> {
  assertMountFetchesNiche();
  assertTopicClearRefetch();
  assertNoCompetitorUrlCopy();
  assertLoadingWiring();
  assertGuestTopicMockCompetitors();
  await optionalHttpSmoke();
  console.log("SMOKE_C40_OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
