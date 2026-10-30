/**
 * Smoke C-razbor-live-haiku-boards — LIVE Haiku analyze when AGGREGATOR_API_KEY set.
 *   npx tsx scripts/smoke-razbor-live-analyze.ts
 * Never prints API key.
 */

import { config } from "dotenv";
config();

import type { FeedPost } from "../lib/studio/feed-types";
import { runRazborLiveAnalyze } from "../lib/studio/razbor-live-analyze";
import { seedAgentsForPipeline } from "../lib/mesh/agent-defaults";
import {
  DEFAULT_CAROUSEL_IMAGE_MODEL,
  DEFAULT_SCRIPTWRITER_MODEL,
} from "../types/mesh-agent";
import { RAZBOR_ANALYST_MODEL } from "../lib/studio/razbor-live-shared";

const hasKey = Boolean(process.env.AGGREGATOR_API_KEY?.trim());

const fixture: FeedPost = {
  id: "smoke-razbor-live-1",
  source: "competitor",
  title:
    "5 ошибок гостя на первой вечеринке в клубе — и как их избежать без стыда",
  sourceMode: "mock",
  username: "night.rituals",
  mediaType: "CAROUSEL_ALBUM",
  topicTags: ["guest-night", "club", "ritual"],
  metrics: { views: 48200, likes: 3100, comments: 214, saves: 890 },
  thumbUrl: "https://picsum.photos/seed/cf-razbor-smoke-cover/720/1200",
  slideUrls: [
    "https://picsum.photos/seed/cf-razbor-smoke-0/720/1200",
    "https://picsum.photos/seed/cf-razbor-smoke-1/720/1200",
    "https://picsum.photos/seed/cf-razbor-smoke-2/720/1200",
    "https://picsum.photos/seed/cf-razbor-smoke-3/720/1200",
  ],
};

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
}

async function main() {
  const seeds = seedAgentsForPipeline("carousel-engine");
  assert(Boolean(seeds.razbor), "razbor agent seeded");
  assert(
    seeds.razbor!.modelConfig.model === RAZBOR_ANALYST_MODEL &&
      RAZBOR_ANALYST_MODEL === "anthropic/claude-haiku-4.5",
    `razbor model = ${RAZBOR_ANALYST_MODEL} (Haiku; not Scriptwriter Sonnet)`,
  );
  assert(seeds.razbor!.modelConfig.thinking === true, "razbor thinking on");
  assert(
    seeds.copywriter.modelConfig.model === DEFAULT_SCRIPTWRITER_MODEL &&
      DEFAULT_SCRIPTWRITER_MODEL === "anthropic/claude-3.7-sonnet",
    "scriptwriter Sonnet (C-audit-01)",
  );
  assert(
    seeds.designer.modelConfig.model === DEFAULT_CAROUSEL_IMAGE_MODEL,
    "designer image-2",
  );
  assert(
    seeds.designer.modelConfig.textModel === "anthropic/claude-3.7-sonnet",
    "designer textModel Sonnet",
  );
  console.log("MODELS_OK", {
    razbor: seeds.razbor!.modelConfig.model,
    scriptwriter: seeds.copywriter.modelConfig.model,
    designer: seeds.designer.modelConfig.model,
  });

  if (!hasKey) {
    const soft = await runRazborLiveAnalyze({
      post: fixture,
      moduleId: "carousel-engine",
      maxVisionImages: 0,
    });
    assert(soft.ok === true, "soft ok");
    if (soft.ok) {
      assert(soft.source === "mock", "soft mock when no key");
      assert(
        soft.analysis.displayText.includes("AGGREGATOR_API_KEY"),
        "clear soft-fail message",
      );
      console.log("SMOKE_RAZBOR_LIVE_SOFT_FAIL_MOCK_OK");
    }
    return;
  }

  const result = await runRazborLiveAnalyze({
    post: fixture,
    moduleId: "carousel-engine",
    // Text-rich context; skip vision to keep smoke fast/cheap
    maxVisionImages: 0,
  });

  if (!result.ok) {
    console.error("LIVE_FAIL", result.error);
    process.exit(1);
  }

  assert(result.source === "live", "expected live source");
  const a = result.analysis;
  assert(a.displayText.length > 80, "displayText non-trivial");
  assert(
    !/не вижу карусел|не вижу медиа|cannot see the carousel/i.test(a.displayText),
    "must not claim cannot see carousel",
  );
  console.log("LIVE_OK", {
    model: result.model,
    summary: a.summary.slice(0, 160),
    hook: a.hook.slice(0, 120),
    middle: a.middle.slice(0, 120),
    cta: a.cta.slice(0, 120),
    viralityN: a.viralityWhy.length,
    tasksN: a.trainerTasks.length,
    handoffPreview: a.handoffBrief.slice(0, 200),
  });
  console.log("--- SNIPPET ---");
  console.log(a.displayText.slice(0, 900));
  console.log("SMOKE_RAZBOR_LIVE_OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
