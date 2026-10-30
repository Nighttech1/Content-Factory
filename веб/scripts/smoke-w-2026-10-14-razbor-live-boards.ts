/**
 * S48 smoke — W-2026-10-14-razbor-live-boards
 * Tickets: C-director-nav-marketing, C-feed-plaque-metrics-s48,
 * C-razbor-cta-clip, C-carousel-preload-slides, C-slide-motion-horizontal,
 * C-razbor-live-haiku-boards, C-module-parity-carousel-ui
 *
 *   npx tsx scripts/smoke-w-2026-10-14-razbor-live-boards.ts
 * Expect: SMOKE_W_2026_10_14_RAZBOR_LIVE_BOARDS_OK
 */
import fs from "node:fs";
import path from "node:path";

import { formatFollowersRu } from "../lib/studio/format-followers-ru";
import {
  DEFAULT_CAROUSEL_IMAGE_MODEL,
  DEFAULT_SCRIPTWRITER_MODEL,
} from "../types/mesh-agent";
import { RAZBOR_ANALYST_MODEL } from "../lib/studio/razbor-live-shared";
import { seedAgentsForPipeline } from "../lib/mesh/agent-defaults";

const root = process.cwd();
const checks: { name: string; pass: boolean; detail?: string }[] = [];

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel: string): boolean {
  return fs.existsSync(path.join(root, rel));
}

function ok(name: string, cond: boolean, detail = "") {
  checks.push({ name, pass: !!cond, detail });
  console.log(`${cond ? "PASS" : "FAIL"} | ${name}${detail ? ` — ${detail}` : ""}`);
}

// ——— A) C-director-nav-marketing ———
const sidebar = read("components/shell/SidebarNavigation.tsx");
ok(
  "sidebar Директор → /marketing + nav-director",
  /label:\s*"Директор"/.test(sidebar) &&
    /href:\s*"\/marketing"/.test(sidebar) &&
    /testId:\s*"nav-director"/.test(sidebar),
);
ok(
  "sidebar prefetches /marketing",
  /PREFETCH_HREFS[\s\S]*?\/marketing/.test(sidebar) ||
    /"\/marketing"/.test(sidebar),
);

const studioPage = read("components/studio/StudioPageClient.tsx");
const studioNoComments = studioPage
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/.*$/gm, "");
ok(
  "Studio Launchpad has no Marketing button",
  !/studio-entry-marketing/.test(studioNoComments) &&
    !/Маркетинг/.test(studioNoComments) &&
    !/href=["']\/marketing["']/.test(studioNoComments),
);
ok("marketing route page exists", exists("app/marketing/page.tsx"));

// ——— B) C-feed-plaque-metrics-s48 ———
const feedCard = read("components/studio/workspace/FeedPostCard.tsx");
ok(
  "feed plaque + followers testids",
  /data-testid="feed-username-plaque"/.test(feedCard) &&
    /data-testid="feed-followers-count"/.test(feedCard) &&
    /formatFollowersRu/.test(feedCard),
);
ok(
  "feed plaque ≈1.5× (18px stack / 13px grid)",
  /text-\[18px\]/.test(feedCard) && /px-3 py-1\.5/.test(feedCard),
);
ok(
  "feed engagement ≈2× + 5 metrics",
  /data-testid="feed-engagement-row"/.test(feedCard) &&
    /text-\[18px\]/.test(feedCard) &&
    /key:\s*"views"/.test(feedCard) &&
    /key:\s*"likes"/.test(feedCard) &&
    /key:\s*"comments"/.test(feedCard) &&
    /key:\s*"shares"/.test(feedCard) &&
    /key:\s*"saves"/.test(feedCard),
);
ok(
  "formatFollowersRu compact RU",
  formatFollowersRu(1_564_000) === "1564к" &&
    formatFollowersRu(12_300).includes("к") &&
    formatFollowersRu(500) === "500",
);
ok(
  "FeedPost.followers type + fixtures seed",
  /followers\?:/.test(read("lib/studio/feed-types.ts")) &&
    /followers/.test(read("lib/studio/feed-fixtures.ts")),
);

// ——— C-razbor-cta-clip ———
ok(
  "razbor CTA not clipped (overflow-visible + pb safe)",
  /overflow-visible/.test(feedCard) &&
    /razbor-btn/.test(feedCard) &&
    (/pb-3|pb-4/.test(feedCard) || /safe padding/.test(feedCard)),
);
ok(
  "razbor CTA label white",
  /text-white/.test(feedCard) && /Разбор/.test(feedCard),
);

// ——— C-carousel-preload-slides ———
ok(
  "FeedPostCard preloads slides",
  /prefetchAll/.test(feedCard) && /from "@\/lib\/image-cache"/.test(feedCard),
);
const razborSlides = read("components/studio/workspace/RazborSlidesCarousel.tsx");
ok(
  "RazborSlidesCarousel prefetchAll",
  /prefetchAll/.test(razborSlides),
);
const createPreview = read("components/studio/workspace/CreateCarouselPreview.tsx");
ok(
  "CreateCarouselPreview prefetchAll",
  /prefetchAll/.test(createPreview),
);
ok("image-cache lib exists", exists("lib/image-cache.ts"));

// ——— C-slide-motion-horizontal ———
ok(
  "s48-horizontal motion on feed + razbor + create",
  /data-motion="s48-horizontal"/.test(feedCard) &&
    /data-motion="s48-horizontal"/.test(razborSlides) &&
    /data-motion="s48-horizontal"/.test(createPreview),
);
ok(
  "horizontal travel (x / translateX) not opacity-only",
  (/x:\s*[\[%]|"x"|translateX|x:\s*["']/.test(feedCard) ||
    /initial=\{[\s\S]*?x:/.test(feedCard) ||
    /animate=\{[\s\S]*?x:/.test(feedCard)) &&
    (/x:/.test(razborSlides) || /translateX/.test(razborSlides)),
);

// ——— D) C-razbor-live-haiku-boards (FE chrome) ———
const razbor = read("components/studio/workspace/RazborModal.tsx");
const razborNoComments = razbor
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/.*$/gm, "");
ok(
  "razbor preview ≈1.5× (19.5rem)",
  /max-w-\[19\.5rem\]/.test(razborSlides),
);
ok(
  "razbor no post title in modal chrome header",
  /S48 — no post title in chrome/.test(razbor) &&
    /data-testid="razbor-system-eyebrow"/.test(razbor) &&
    !/data-testid="razbor-post-title"/.test(razbor) &&
    /Разбор конкурента/.test(razborNoComments),
);
ok(
  "razbor start btn + postRazborAnalyze path",
  /razbor-start-btn/.test(razbor) &&
    (/postRazborAnalyze/.test(razbor) ||
      /razbor\/analyze/.test(read("lib/studio/agent-chat-client.ts"))),
);
ok(
  "analyze API route exists",
  exists("app/api/studio/razbor/analyze/route.ts"),
);

const composer = read("components/studio/workspace/AgentChatComposer.tsx");
const promptBox = read("components/ui/chatgpt-prompt-input.tsx");
ok(
  "handoff inside PromptBox trailingActions",
  /trailingActions/.test(composer) &&
    /HandoffRoundButton/.test(composer) &&
    /prompt-box-trailing-actions/.test(promptBox) &&
    /trailingActions/.test(promptBox),
);

const vpc = read("components/studio/workspace/VerticalPostCarousel.tsx");
ok(
  "Competitors|Boards MultiButton",
  /competitors-boards-switch/.test(vpc) &&
    /competitors-panel-boards/.test(vpc) &&
    /Доски/.test(vpc) &&
    /BoardsPanel/.test(vpc),
);
ok(
  "BoardsPanel upload → Razbor",
  exists("components/studio/workspace/BoardsPanel.tsx") &&
    /boards-upload|type="file"|accept=/.test(
      read("components/studio/workspace/BoardsPanel.tsx"),
    ) &&
    /onRazborClick|openRazbor/.test(
      read("components/studio/workspace/BoardsPanel.tsx"),
    ),
);

// ——— Models defaults (C-audit-01: Razbor stays Haiku; Scriptwriter → Sonnet) ———
ok(
  "models: Razbor Haiku, Scriptwriter Sonnet, Designer image-2",
  RAZBOR_ANALYST_MODEL === "anthropic/claude-haiku-4.5" &&
    DEFAULT_SCRIPTWRITER_MODEL === "anthropic/claude-3.7-sonnet" &&
    DEFAULT_CAROUSEL_IMAGE_MODEL === "openai/gpt-5.4-image-2",
);
const seeds = seedAgentsForPipeline("carousel-engine");
ok(
  "seedAgents razbor/scriptwriter/designer models",
  seeds.razbor?.modelConfig.model === RAZBOR_ANALYST_MODEL &&
    seeds.copywriter.modelConfig.model === DEFAULT_SCRIPTWRITER_MODEL &&
    seeds.designer.modelConfig.model === DEFAULT_CAROUSEL_IMAGE_MODEL &&
    seeds.designer.modelConfig.textModel === "anthropic/claude-3.7-sonnet",
);

// ——— E) C-module-parity-carousel-ui ———
ok(
  "FeedPostCard shared (parity — no module fork plaque)",
  /FeedPostCard/.test(vpc) &&
    !exists("components/studio/workspace/FeedPostCardReels.tsx") &&
    !exists("components/studio/custom-reels/FeedPostCard.tsx"),
);

const failed = checks.filter((c) => !c.pass);
console.log("---");
console.log(`total=${checks.length} pass=${checks.length - failed.length} fail=${failed.length}`);
if (failed.length) {
  for (const f of failed) {
    console.error(`RED: ${f.name}${f.detail ? ` — ${f.detail}` : ""}`);
  }
  process.exit(1);
}
console.log("SMOKE_W_2026_10_14_RAZBOR_LIVE_BOARDS_OK");
