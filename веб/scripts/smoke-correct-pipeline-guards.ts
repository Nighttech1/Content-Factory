/**
 * Tester wave smoke — critic/vision caps + store APIs + create imports.
 * No network LLM. Exit 0 only if all asserts pass.
 */
import assert from "node:assert/strict";
import {
  SCRIPTWRITER_CRITIC_MAX_RETRIES,
  runCarouselCritic05,
  shouldRetryScriptwriterAfterCritic,
} from "../lib/studio/carousel-critic-05";
import { critiqueCarouselHandoff } from "../lib/studio/carousel-quality-critic";
import {
  MAX_VISION_GENS_PER_SLIDE,
  visionDecideRetryOrReview,
  canRetryVisionSlideGen,
} from "../lib/studio/carousel-vision-text-check";
import {
  getBrandSettings,
  putBrandSettings,
} from "../lib/settings/brand-store";
import {
  listLandscapes,
  upsertLandscape,
} from "../lib/settings/landscapes-store";
import {
  appendAgentLog,
  listAgentLogs,
  getAgentErrorFlag,
} from "../lib/agents/agent-run-log-store";

async function main() {
  // --- Critic supplements zod + max retries = 2 ---
  assert.equal(SCRIPTWRITER_CRITIC_MAX_RETRIES, 2);
  assert.equal(shouldRetryScriptwriterAfterCritic(0), true);
  assert.equal(shouldRetryScriptwriterAfterCritic(1), true);
  assert.equal(shouldRetryScriptwriterAfterCritic(2), false);

  const zodFail = critiqueCarouselHandoff("{not json");
  assert.equal(zodFail.ok, false);

  const empty = critiqueCarouselHandoff({
    hook: "x",
    idea: "y",
    caption: "z",
    hashtags: [],
    cta_type: 1,
    slides: [],
  } as never);
  assert.equal(empty.ok, false);

  // --- Vision max 2 gens ---
  assert.equal(MAX_VISION_GENS_PER_SLIDE, 2);
  assert.equal(canRetryVisionSlideGen(0), true);
  assert.equal(canRetryVisionSlideGen(1), true);
  assert.equal(canRetryVisionSlideGen(2), false);

  const deliverReview = visionDecideRetryOrReview({
    slideIndex0: 0,
    imageUrl: "file://slide.png",
    gensUsed: 2,
    check: {
      ok: true,
      pass: false,
      model: "gpt-4o",
      missing: ["headline"],
      reason: "missing",
      shouldRetry: false,
    },
  });
  assert.equal(deliverReview.needsReview, true);

  // --- Brand / Landscapes / Logs stores (unit, no HTTP — server down) ---
  const brandBefore = await getBrandSettings("smoke-tester");
  assert.ok(brandBefore && typeof brandBefore === "object");
  await putBrandSettings("smoke-tester", {
    brandName: "Smoke Brand",
    logoRef: "/brand/smoke.svg",
    tagline: "t",
  });
  const brandAfter = await getBrandSettings("smoke-tester");
  assert.equal(brandAfter.brandName, "Smoke Brand");

  await upsertLandscape("smoke-tester", {
    number: 99,
    name: "Smoke Hero",
    photoUrls: ["https://example.com/a.jpg"],
  });
  const landscapes = await listLandscapes("smoke-tester");
  assert.ok(
    landscapes.some((c) => c.number === 99 && c.name === "Smoke Hero"),
  );

  await appendAgentLog({
    userId: "smoke-tester",
    agentId: "scriptwriter",
    agentRole: "scriptwriter",
    level: "error",
    message: "smoke guard red",
  });
  const lines = await listAgentLogs({
    userId: "smoke-tester",
    agentId: "scriptwriter",
  });
  assert.ok(lines.some((l) => l.message.includes("smoke guard red")));
  const flag = await getAgentErrorFlag({
    userId: "smoke-tester",
    agentId: "scriptwriter",
  });
  assert.equal(flag.hasError, true);

  // --- Create path imports without crash ---
  await import("../lib/studio/create-carousel-prompts");
  await import("../lib/studio/carousel-json-contract");
  await import("../lib/studio/carousel-quality-critic");
  await import("../lib/intake/correct-pipeline-job");
  await import("../lib/studio/carousel-html-renderer");

  const soft = runCarouselCritic05({
    hook: "Why this meeting changed everything",
    idea: "topic",
    caption: "cap",
    hashtags: ["#a"],
    cta_type: 1,
    slides: [
      {
        slide_number: 1,
        layout_variant: "cover",
        primary_copy: "Why this meeting changed everything",
        secondary_copy: "",
        visual_prompt: "warm café table, soft daylight, no purple gradient",
        swipe_trigger: "curiosity_gap",
      },
      {
        slide_number: 2,
        layout_variant: "body",
        primary_copy: "One concrete tip",
        secondary_copy: "detail",
        visual_prompt: "notebook and pen on wood",
        swipe_trigger: "open_loop",
      },
      {
        slide_number: 3,
        layout_variant: "cta",
        primary_copy: "Join Saturday",
        secondary_copy: "",
        visual_prompt: "door open to warm room",
        swipe_trigger: "cta_urgency",
      },
    ],
  } as never);
  assert.equal(typeof soft.ok, "boolean");

  console.log(
    JSON.stringify(
      {
        ok: true,
        SCRIPTWRITER_CRITIC_MAX_RETRIES,
        MAX_VISION_GENS_PER_SLIDE,
        brandName: brandAfter.brandName,
        landscape99: true,
        logsHasError: flag.hasError,
        criticSoftOk: soft.ok,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
