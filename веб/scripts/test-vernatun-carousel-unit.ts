/**
 * Honest unit tests for Vernatun carousel product wave — run BEFORE live attempts.
 * Usage: npx tsx scripts/test-vernatun-carousel-unit.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  assertCoverHeadline,
  countWords,
  listRoleModelDefaults,
  resolveTextOrchestratorModel,
  TEXT_ORCHESTRATOR_MODEL,
  normalizeFindings,
  findingToDefect,
  defectToFinding,
  findingsHaveBlocker,
  applyRepairs,
  createJobLlmSession,
} from "../lib/studio/vernatun-carousel";
import {
  contrastRatio,
  ensureReadableDesignColors,
} from "../lib/studio/vernatun-carousel/design-colors";
import type { VernatunScript } from "../lib/studio/vernatun-carousel/types";

let failed = 0;
let passed = 0;
const pending: Array<Promise<void>> = [];

function test(name: string, fn: () => void | Promise<void>) {
  const run = async () => {
    try {
      await fn();
      passed += 1;
      console.log(`  PASS  ${name}`);
    } catch (err) {
      failed += 1;
      console.error(`  FAIL  ${name}`);
      console.error(err);
    }
  };
  pending.push(run());
}

console.log("\n=== Vernatun carousel unit suite ===\n");

test("cover word-count: ≤4 ok", () => {
  assert.equal(countWords("Сила живых связей"), 3);
  assert.equal(assertCoverHeadline("Сила живых связей").ok, true);
});

test("cover word-count: >4 fails", () => {
  const r = assertCoverHeadline("Почему связи в сообществе это сила");
  assert.equal(r.ok, false);
});

test("ONE text brain is Sonnet by default (C-ONE-BRAIN-01)", () => {
  delete process.env.CAROUSEL_MODEL_TEXT;
  assert.equal(resolveTextOrchestratorModel(), TEXT_ORCHESTRATOR_MODEL);
  assert.equal(TEXT_ORCHESTRATOR_MODEL, "anthropic/claude-sonnet-4");
});

test("image gen default is GPT Image 2.0", () => {
  delete process.env.CAROUSEL_MODEL_IMAGE_GEN;
  delete process.env.CAROUSEL_IMAGE_FALLBACKS;
  const {
    IMAGE_GEN_MODEL,
    resolveImageGenModelChain,
    imageModelSupportsNativeRefs,
  } = require("../lib/studio/vernatun-carousel/role-models") as typeof import("../lib/studio/vernatun-carousel/role-models");
  assert.equal(IMAGE_GEN_MODEL, "openai/gpt-5.4-image-2");
  const d = listRoleModelDefaults();
  assert.equal(d.imageGen.model, IMAGE_GEN_MODEL);
  assert.equal(d.imageGen.provider, "openai");
  const chain = resolveImageGenModelChain();
  assert.equal(chain[0], "openai/gpt-5.4-image-2");
  assert.equal(imageModelSupportsNativeRefs("yandex/yandex-art"), false);
  assert.equal(imageModelSupportsNativeRefs("openai/gpt-5.4-image-2"), true);
});

test("carousel image API asks 1080x1350 (4:5), not 9:16", () => {
  const {
    DEFAULT_IMAGE_SIZE,
    CAROUSEL_IMAGE_SIZE_FALLBACKS,
  } = require("../lib/llm/aggregator-images") as typeof import("../lib/llm/aggregator-images");
  assert.equal(DEFAULT_IMAGE_SIZE, "1080x1350");
  assert.ok(CAROUSEL_IMAGE_SIZE_FALLBACKS.includes("1024x1280"));
  assert.ok(!CAROUSEL_IMAGE_SIZE_FALLBACKS.some((s) => /1536|1792|9:?16/i.test(s)));
  const {
    buildModeBSlidePrompt,
  } = require("../lib/studio/vernatun-carousel/prompts") as typeof import("../lib/studio/vernatun-carousel/prompts");
  const p = buildModeBSlidePrompt({
    index: 1,
    headline: "Хук",
    body: "Текст",
    visualIntent: "meetup",
    brandName: "Vernatun",
    colorsNote: "#111",
  });
  assert.match(p, /1080×1350|1080x1350/i);
  assert.match(p, /4:5/);
  assert.match(p, /9:16|Stories/i);
});

test("all text roles share one model without env overrides", () => {
  for (const key of Object.keys(process.env)) {
    if (key.startsWith("CAROUSEL_MODEL_") && key !== "CAROUSEL_MODEL_IMAGE_GEN") {
      delete process.env[key];
    }
  }
  delete process.env.CAROUSEL_ROLE_MODELS_JSON;
  const d = listRoleModelDefaults();
  const textRoles = [
    "orchestrator",
    "scriptwriter",
    "artDirectorScript",
    "imagePlanner",
    "designer",
    "artDirectorFinal",
  ] as const;
  for (const r of textRoles) {
    assert.equal(
      d[r].model,
      TEXT_ORCHESTRATOR_MODEL,
      `${r} must be ${TEXT_ORCHESTRATOR_MODEL}, got ${d[r].model}`,
    );
  }
  assert.equal(
    /image|yandex-art/i.test(d.imageGen.model),
    true,
    `imageGen must be an image model, got ${d.imageGen.model}`,
  );
  assert.equal(d.qa.model, "deterministic");
});

test("image re-gen is OFF by default — vision remarks go to cheap re-bake (C-REMARKS-TO-BAKE-03)", () => {
  const { isImageRegenAllowed } =
    require("../lib/studio/vernatun-carousel/role-models") as typeof import("../lib/studio/vernatun-carousel/role-models");
  delete process.env.CAROUSEL_ALLOW_IMAGE_REGEN;
  assert.equal(isImageRegenAllowed(), false);
  process.env.CAROUSEL_ALLOW_IMAGE_REGEN = "1";
  assert.equal(isImageRegenAllowed(), true);
  delete process.env.CAROUSEL_ALLOW_IMAGE_REGEN;
});

test("findings v2: 7 fields round-trip", () => {
  const f = normalizeFindings([
    {
      slide_id: "slide_2",
      severity: "blocker",
      element: "panel",
      observed_issue: "same shape as slide 1",
      recommended_change: "use pill panel",
      reason: "variety",
      acceptance_check: "adjacent shapes differ",
    },
  ]);
  assert.equal(f.length, 1);
  assert.equal(f[0]!.acceptance_check, "adjacent shapes differ");
  assert.equal(findingsHaveBlocker(f), true);
  const d = findingToDefect(f[0]!);
  assert.equal(d.priority, "BLOCKER");
  assert.equal(d.slide_index, 2);
  const back = defectToFinding(d);
  assert.equal(back.slide_id, "slide_2");
});

test("legacy defects map into findings", () => {
  const f = normalizeFindings([
    {
      priority: "MAJOR",
      slide_index: 3,
      element: "headline",
      reason: "clipped",
      fix: "shrink type",
    },
  ]);
  assert.equal(f[0]!.severity, "major");
  assert.ok(f[0]!.acceptance_check.length > 0);
});

test("geometry repair: counter + panel shape", () => {
  const script: VernatunScript = {
    carousel_title: "t",
    audience: "a",
    central_thesis: "c",
    slides: [
      {
        index: 1,
        role: "cover",
        headline: "Сила связей",
        body: "x",
        visual_intent: "people",
      },
      {
        index: 2,
        role: "body",
        headline: "Второй",
        body: "y",
        visual_intent: "cafe",
      },
    ],
  };
  const plan = applyRepairs(script, [
    {
      slide_id: "slide_1",
      severity: "major",
      element: "counter",
      observed_issue: "too small",
      recommended_change: "сделать крупнее",
      reason: "size",
      acceptance_check: "counter larger",
    },
    {
      slide_id: "slide_2",
      severity: "major",
      element: "panel",
      observed_issue: "clone rect",
      recommended_change: "pill shape",
      reason: "variety",
      acceptance_check: "pill",
    },
  ]);
  assert.ok(plan.geometry.some((g) => g.slideIndex === 1 && (g.counterScale ?? 0) > 1));
  assert.ok(
    plan.geometry.some(
      (g) => g.slideIndex === 2 && g.panelShape === "pill",
    ),
  );
  assert.ok(plan.slidesToRerender.includes(1));
  assert.ok(plan.slidesToRerender.includes(2));
});

test("JobLlmSession created with shared text model", () => {
  const s = createJobLlmSession("test-job");
  assert.equal(s.model, resolveTextOrchestratorModel());
  assert.equal(s.dump().length, 0);
});

test("designer prompt must NOT hardcode 34–40 px pagination", () => {
  const promptsPath = path.join(
    process.cwd(),
    "lib/studio/vernatun-carousel/prompts.ts",
  );
  const src = readFileSync(promptsPath, "utf8");
  assert.equal(/34\s*[–-]\s*40\s*px/i.test(src), false);
});

test("Create modal is single Art Director (no scriptwriter tab)", () => {
  const modal = readFileSync(
    path.join(process.cwd(), "components/studio/workspace/CreateCarouselModal.tsx"),
    "utf8",
  );
  assert.ok(modal.includes("Арт-директор") || modal.includes("artDirector"));
  assert.ok(modal.includes("Собрать карусель"));
  assert.ok(modal.includes("create-build-mode") || modal.includes("buildMode"));
  assert.equal(modal.includes('ChatAgentId = "scriptwriter"'), false);
  assert.equal(modal.includes("CreateCarouselPublicationPane"), false);
});

test("Carousel draft UI exposes only Art Director agent tab", () => {
  const { razborAgentsForModule } = require("../lib/studio/carousel-draft-types") as typeof import("../lib/studio/carousel-draft-types");
  const agents = razborAgentsForModule("carousel-engine");
  assert.equal(agents.length, 1);
  assert.equal(agents[0]?.id, "designer");
  assert.equal(agents[0]?.label, "Арт-директор");
});

test("Drafts panel has download zip control", () => {
  const src = readFileSync(
    path.join(process.cwd(), "components/studio/workspace/DraftsPanel.tsx"),
    "utf8",
  );
  assert.ok(src.includes("draft-download-btn"));
  assert.ok(src.includes("buildStoreZip"));
});

test("CSS supports multiple panel shapes", () => {
  const cssMod = readFileSync(
    path.join(
      process.cwd(),
      "lib/studio/vernatun-carousel/templates/vernatun-base-css.ts",
    ),
    "utf8",
  );
  for (const shape of ["rounded", "pill", "ribbon", "diagonal", "split-band"]) {
    assert.ok(cssMod.includes(`shape-${shape}`), `missing shape-${shape}`);
  }
  assert.ok(cssMod.includes("--counter-scale"));
});

test("Design MD white-on-white is forced readable for Mode A panels", () => {
  const fixed = ensureReadableDesignColors({
    panel: "#FFFFFF",
    ink: "#FFFFFF",
    accent: "#F58220",
    pageBg: "#0B0B0B",
  });
  assert.ok(contrastRatio(fixed.panel, fixed.ink) >= 3);
  assert.notEqual(fixed.ink.toLowerCase(), "#ffffff");
});

test("designColorsHash is stable", () => {
  const { designColorsHash } = require("../lib/studio/vernatun-carousel/design-colors") as typeof import("../lib/studio/vernatun-carousel/design-colors");
  const a = designColorsHash({
    panel: "#F4F0E9",
    ink: "#171513",
    accent: "#E66E3E",
    pageBg: "#DEDBD6",
  });
  const b = designColorsHash({
    panel: "#f4f0e9",
    ink: "#171513",
    accent: "#e66e3e",
    pageBg: "#dedbd6",
  });
  assert.equal(a, b);
});

test("composition recipes: diversity lint + no adjacent clones", () => {
  const {
    pickRecipeForSlide,
    lintRecipeDiversity,
    COMPOSITION_RECIPES,
  } = require("../lib/studio/vernatun-carousel/recipes") as typeof import("../lib/studio/vernatun-carousel/recipes");
  assert.ok(COMPOSITION_RECIPES.length >= 8);
  const recipes: string[] = [];
  let prev: string | null = null;
  for (let i = 0; i < 4; i++) {
    const r = pickRecipeForSlide(i, prev, i === 2 ? "три карточки" : "");
    recipes.push(r);
    prev = r;
  }
  const lint = lintRecipeDiversity(recipes);
  assert.equal(lint.adjacentClones, 0);
  assert.ok(lint.ok);
  assert.ok(lint.uniqueCount >= 2);
});

test("repair template_clone changes recipe", () => {
  const script: VernatunScript = {
    carousel_title: "t",
    audience: "a",
    central_thesis: "c",
    slides: [
      {
        index: 1,
        role: "cover",
        headline: "Сила связей",
        body: "x",
        visual_intent: "people",
        recipe: "poster-typo",
      },
      {
        index: 2,
        role: "body",
        headline: "Второй",
        body: "y",
        visual_intent: "cafe",
        recipe: "poster-typo",
      },
    ],
  };
  const plan = applyRepairs(script, [
    {
      slide_id: "slide_2",
      severity: "major",
      element: "template_clone",
      observed_issue: "same silhouette as slide 1",
      recommended_change: "сменить recipe на split-contrast",
      reason: "template_clone",
      acceptance_check: "recipes differ",
    },
  ]);
  assert.ok(plan.geometry.some((g) => g.slideIndex === 2 && g.recipeForce));
  assert.notEqual(plan.script.slides[1]?.recipe, "poster-typo");
});

test("viral skill loaded into designer + AD prompts", () => {
  const {
    PROMPT_DESIGNER_HTML,
    PROMPT_AD_FINAL,
  } = require("../lib/studio/vernatun-carousel/prompts") as typeof import("../lib/studio/vernatun-carousel/prompts");
  const { VIRAL_SKILL_MARKER } = require("../lib/studio/vernatun-carousel/skills/load-skill") as typeof import("../lib/studio/vernatun-carousel/skills/load-skill");
  assert.ok(PROMPT_DESIGNER_HTML.includes(VIRAL_SKILL_MARKER));
  assert.ok(PROMPT_AD_FINAL.includes(VIRAL_SKILL_MARKER));
  assert.ok(/MAKE|contrast|hierarchy|swipe/i.test(PROMPT_DESIGNER_HTML));
  assert.ok(/can_finalize|template_clone|CHECK/i.test(PROMPT_AD_FINAL));
});

test("orchestrator system prompt references tools + skill", () => {
  const {
    buildOrchestratorSystemPrompt,
    ORCHESTRATOR_PROMPT_MARKER,
  } = require("../lib/studio/vernatun-carousel/tools/orchestrator-prompt") as typeof import("../lib/studio/vernatun-carousel/tools/orchestrator-prompt");
  const p = buildOrchestratorSystemPrompt();
  assert.ok(p.includes(ORCHESTRATOR_PROMPT_MARKER));
  assert.ok(p.includes("finalize"));
  assert.ok(p.includes("load_design_colors"));
});

test("tool executor: known tool + unknown throws", async () => {
  const {
    createToolExecutor,
  } = require("../lib/studio/vernatun-carousel/tools/executor") as typeof import("../lib/studio/vernatun-carousel/tools/executor");
  const {
    listToolNames,
  } = require("../lib/studio/vernatun-carousel/tools/registry") as typeof import("../lib/studio/vernatun-carousel/tools/registry");
  assert.ok(listToolNames().includes("finalize"));
  const ex = createToolExecutor({
    finalize: (args) => ({ ok: true, ...args }),
  });
  const r = await ex.execute("finalize", { status: "FINAL" });
  assert.equal((r as { status: string }).status, "FINAL");
  await assert.rejects(() => ex.execute("no_such_tool"), /unknown_tool/);
});

test("agent loop: mock LLM ≥2 tools then finalize", async () => {
  const {
    runAgentLoop,
  } = require("../lib/studio/vernatun-carousel/tools/agent-loop") as typeof import("../lib/studio/vernatun-carousel/tools/agent-loop");
  const {
    createToolExecutor,
  } = require("../lib/studio/vernatun-carousel/tools/executor") as typeof import("../lib/studio/vernatun-carousel/tools/executor");
  const calls: string[] = [];
  const ex = createToolExecutor({
    qa_auto: () => {
      calls.push("qa_auto");
      return { status: "PASS" };
    },
    vision_review: () => {
      calls.push("vision_review");
      return { can_finalize: true };
    },
    finalize: (args) => {
      calls.push("finalize");
      return args;
    },
  });
  const result = await runAgentLoop({
    maxSteps: 8,
    executor: ex,
    callLlm: async ({ step }) => {
      if (step === 0) return { type: "tools", calls: [{ name: "qa_auto" }] };
      if (step === 1)
        return { type: "tools", calls: [{ name: "vision_review" }] };
      return {
        type: "tools",
        calls: [{ name: "finalize", args: { status: "FINAL" } }],
      };
    },
  });
  assert.ok(result.toolCallCount >= 2);
  assert.equal(result.status, "FINAL");
  assert.ok(calls.includes("qa_auto") && calls.includes("vision_review"));
});

test("image_need schema present on slide type example", () => {
  const slide = {
    index: 1,
    role: "cover",
    headline: "Открытая дверь",
    body: "",
    visual_intent: "club entrance",
    image_need: {
      kind: "photo_real_place" as const,
      place_query: "Vernatun club entrance Moscow",
      must_be_photographic: true,
      forbid_ai_if_possible: true,
    },
  };
  assert.equal(slide.image_need.kind, "photo_real_place");
  assert.ok(slide.image_need.place_query);
});

test("B5: any major/blocker blocks finalize (Client hard gate)", () => {
  const {
    findingsHaveWowMajor,
    findingsBlockFinalize,
  } = require("../lib/studio/vernatun-carousel/findings") as typeof import("../lib/studio/vernatun-carousel/findings");
  assert.equal(
    findingsBlockFinalize([
      {
        slide_id: "slide_1",
        severity: "major",
        element: "background",
        observed_issue: "фон не поддерживает тезис",
        recommended_change: "заменить фото",
        reason: "fit",
        acceptance_check: "photo matches thesis",
      },
    ]),
    true,
  );
  assert.equal(
    findingsBlockFinalize([
      {
        slide_id: "slide_1",
        severity: "minor",
        element: "kerning",
        observed_issue: "tight",
        recommended_change: "loosen",
        reason: "type",
        acceptance_check: "ok",
      },
    ]),
    false,
  );
  // B Client: logo drift / pagination majors MUST block
  assert.equal(
    findingsBlockFinalize([
      {
        slide_id: "slide_2",
        severity: "major",
        element: "pagination",
        observed_issue: "2/6 при 4 слайдах",
        recommended_change: "2/4 или убрать",
        reason: "wrong denominator",
        acceptance_check: "k/N matches slide_count",
      },
    ]),
    true,
  );
  assert.equal(
    findingsHaveWowMajor([
      {
        slide_id: "slide_1",
        severity: "major",
        element: "logo",
        observed_issue: "logo drift",
        recommended_change: "pixel-faithful",
        reason: "branding",
        acceptance_check: "same emblem",
      },
    ]),
    true,
  );
});

test("B3: script type_system normalized", () => {
  const {
    resolveSlideCount,
  } = require("../lib/studio/vernatun-carousel/scriptwriter") as typeof import("../lib/studio/vernatun-carousel/scriptwriter");
  assert.equal(resolveSlideCount({ fromScript: 5 }), 5);
  const prompts = readFileSync(
    path.join(process.cwd(), "lib/studio/vernatun-carousel/prompts.ts"),
    "utf8",
  );
  assert.ok(prompts.includes("type_system"));
  assert.ok(prompts.includes("can_finalize=false"));
});

test("Create modal wires repair-after-preview + user assets", () => {
  const modal = readFileSync(
    path.join(process.cwd(), "components/studio/workspace/CreateCarouselModal.tsx"),
    "utf8",
  );
  assert.ok(modal.includes("REPAIR_FROM_CHAT"));
  assert.ok(modal.includes("create-carousel-user-assets"));
  assert.ok(modal.includes("userAssetFiles"));
});

test("Mode B user photo: cover generate+preserve, not use_user/HTML-only", () => {
  const { enforceUserAssets } = require("../lib/studio/vernatun-carousel/image-planner") as typeof import("../lib/studio/vernatun-carousel/image-planner");
  const plan = enforceUserAssets(
    {
      web_search_available: false,
      slots: [
        {
          slide_index: 1,
          action: "use_user",
          user_asset_id: null,
          visual_prompt: "cover",
          composition_and_crop: "center",
          text_safe_area: "top",
          notes: "",
        },
        {
          slide_index: 2,
          action: "generate",
          user_asset_id: null,
          visual_prompt: "body",
          composition_and_crop: "center",
          text_safe_area: "mid",
          notes: "",
        },
      ],
    },
    [
      {
        asset_id: "u1",
        filename: "me.jpg",
        role: "photo",
        required: true,
        status: "pending",
        notes: "",
      },
    ],
    true,
  );
  assert.equal(plan.slots[0]!.action, "generate");
  assert.equal(plan.slots[0]!.user_asset_id, "u1");
  assert.match(
    plan.slots[0]!.notes,
    /mode_b_cover_preserve_user_photo_add_type/,
  );
  assert.match(plan.slots[0]!.notes, /mode_b_native_logo/);
  assert.equal(plan.slots[1]!.action, "generate");
  assert.equal(plan.slots[1]!.user_asset_id, "u1");
});

test("Mode B HTML chrome is opt-in via MODE_B_HTML_CHROME", () => {
  const renderer = readFileSync(
    path.join(
      process.cwd(),
      "lib/studio/vernatun-carousel/renderer.ts",
    ),
    "utf8",
  );
  assert.ok(renderer.includes('MODE_B_HTML_CHROME === "1"'));
  assert.ok(!/isExactUserPhoto\s*\?\s*slideScript/.test(renderer));
});

test("B0: slide_count resolve — AD range + FORCE", () => {
  const {
    resolveSlideCount,
  } = require("../lib/studio/vernatun-carousel/scriptwriter") as typeof import("../lib/studio/vernatun-carousel/scriptwriter");
  assert.equal(resolveSlideCount({ fromScript: 6 }), 6);
  assert.equal(resolveSlideCount({ fromScript: 99, fallback: 4 }), 4);
  assert.equal(resolveSlideCount({ briefForce: 4, fromScript: 7 }), 4);
});

test("B2: Mode B prompt + exact quoted text + logo_bake corner", () => {
  const {
    buildModeBSlidePrompt,
  } = require("../lib/studio/vernatun-carousel/prompts") as typeof import("../lib/studio/vernatun-carousel/prompts");
  const p = buildModeBSlidePrompt({
    index: 1,
    headline: "Живые связи",
    body: "Не кумовство",
    visualIntent: "meetup",
    brandName: "Vernatun",
    colorsNote: "#111 #F58220",
    nativeLogoRef: true,
    hasUserPhotoRef: true,
  });
  assert.match(p, /CLUB LOGO/);
  assert.match(p, /USER PHOTO/);
  assert.match(p, /\[\[Живые связи\]\]/);
  assert.match(p, /logo_bake/i);
  assert.match(p, /TOP-RIGHT/);
  assert.match(p, /TOP-RIGHT LOGO AIR|LOGO AIR|unmarked quiet corner/i);
  assert.match(p, /200×236|200x236/i);
  assert.match(p, /x=\d+\.\.\d+/i); // exact pocket — text must stay out
  assert.match(p, /48px/);
  assert.match(p, /NEVER paint|Do NOT draw/i);
  assert.match(p, /post-pass|logo_bake/i);
  assert.match(p, /LAYOUT CRAFT|LIST ROWS|conditional lists|do NOT force lists/i);
  assert.match(p, /ONLY when EXACT body|2\+ concrete/i);
  assert.match(p, /invent(ed)? numbers|tax rates|PROPS/i);
  assert.match(p, /solid black OR solid white|solid black\/white/i);
  assert.match(p, /SERIES STYLE LOCK|VOCAB|HTML post-pass/i);
  assert.match(p, /ATMOSPHERE|photoreal lifestyle/i);
  assert.match(p, /Never draw ANY mark showing where the logo/i);
  assert.match(p, /Do NOT paint ANY Armenian|VOCAB SLOT|VOCAB \(HARD/i);
});

test("B4.5: vocab slot FREE by composition + pickVocabSlot", () => {
  const {
    pickVocabSlot,
    vocabSlotPromptBlock,
  } = require("../lib/studio/vernatun-carousel/vocab-plaque-bake") as typeof import("../lib/studio/vernatun-carousel/vocab-plaque-bake");
  const cover = pickVocabSlot(1, 4);
  assert.equal(cover.dashed, true);
  assert.equal(cover.slot, "FREE");
  const mid = pickVocabSlot(2, 4);
  assert.equal(mid.dashed, true);
  assert.equal(mid.slot, "FREE");
  // B4.7 default: NO marker on the image — AD places the pill post-pass.
  const def = vocabSlotPromptBlock(mid);
  assert.match(def, /NO marker|do NOT draw any Armenian vocab/i);
  assert.equal(/CYAN|#00E8FF/i.test(def), false); // no machine marker drawn
  assert.match(def, /Art Director|composited later|post-pass/i);
  assert.equal(/left≈\d+px/.test(def), false); // no forced coords
  // Legacy dashed VOCAB_SLOT only behind the flag.
  const prev = process.env.CAROUSEL_VOCAB_DRAW_SLOT;
  process.env.CAROUSEL_VOCAB_DRAW_SLOT = "1";
  try {
    const legacy = vocabSlotPromptBlock(mid);
    assert.match(legacy, /VOCAB SLOT|PLACE FREELY|composition/i);
    assert.match(legacy, /CYAN|#00E8FF/i);
  } finally {
    if (prev === undefined) delete process.env.CAROUSEL_VOCAB_DRAW_SLOT;
    else process.env.CAROUSEL_VOCAB_DRAW_SLOT = prev;
  }
});

test("B4.6: slide arrow swoosh size + B/W only + raised margin", () => {
  const {
    SLIDE_ARROW_LENGTH_PX,
    SLIDE_ARROW_MARGIN_PX,
    pickArrowHexForBackground,
  } = require("../lib/studio/vernatun-carousel/slide-arrow-bake") as typeof import("../lib/studio/vernatun-carousel/slide-arrow-bake");
  const {
    DEFAULT_LOGO_BAKE_SIZE_PX,
    WORDMARK_DARK,
    WORDMARK_WHITE,
  } = require("../lib/studio/vernatun-carousel/logo-bake") as typeof import("../lib/studio/vernatun-carousel/logo-bake");
  assert.equal(SLIDE_ARROW_LENGTH_PX, Math.round(DEFAULT_LOGO_BAKE_SIZE_PX / 2));
  assert.ok(SLIDE_ARROW_MARGIN_PX >= 64, "arrow raised from bottom");
  // Never primary orange — only wordmark white/dark (swoosh solid, no gradient)
  assert.equal(pickArrowHexForBackground(40), WORDMARK_WHITE);
  assert.equal(pickArrowHexForBackground(220), WORDMARK_DARK);
  assert.match(pickArrowHexForBackground(154), /^#(1A1208|FFFFFF)$/i);
});

test("B4.5: AD vision JSON parse clamps vocab guide bbox", () => {
  const {
    parseVocabGuideVisionText,
    normalizeVocabGuideVisionRect,
  } = require("../lib/studio/vernatun-carousel/vocab-guide-vision") as typeof import("../lib/studio/vernatun-carousel/vocab-guide-vision");
  assert.equal(parseVocabGuideVisionText('{"found":false}'), null);
  const ok = parseVocabGuideVisionText(
    '{"found":true,"left":80,"top":900,"width":360,"height":90}',
  );
  assert.ok(ok);
  assert.equal(ok!.left, 80);
  assert.equal(ok!.width, 360);
  assert.equal(
    normalizeVocabGuideVisionRect({
      found: true,
      left: 900,
      top: 40,
      width: 200,
      height: 80,
    }),
    null,
    "logo air rejected",
  );
});

test("fact-check flag: 1 / 0 / empty / unknown", () => {
  const {
    normalizeFactCheckFlag,
    resolveFactCheckBranch,
    findFactCheckHeader,
  } = require("../lib/studio/vernatun-carousel/fact-check-flag") as typeof import("../lib/studio/vernatun-carousel/fact-check-flag");
  assert.equal(normalizeFactCheckFlag("1").branch, "FACT_CHECK");
  assert.equal(normalizeFactCheckFlag("0").branch, "STANDARD");
  assert.equal(normalizeFactCheckFlag("").branch, "STANDARD");
  assert.equal(normalizeFactCheckFlag("maybe").branch, "STANDARD");
  assert.equal(normalizeFactCheckFlag("maybe").unknownRaw, true);
  assert.equal(
    resolveFactCheckBranch({ factCheckMode: "FACT_CHECK" }).branch,
    "FACT_CHECK",
  );
  assert.equal(
    resolveFactCheckBranch({ styleNotes: "FACT_CHECK=1" }).branch,
    "FACT_CHECK",
  );
  assert.equal(
    resolveFactCheckBranch({ styleNotes: "обычная тема" }).branch,
    "STANDARD",
  );
  assert.equal(
    findFactCheckHeader(["topic", "facts", "status"]),
    "facts",
  );
  assert.ok(
    findFactCheckHeader(["Проверка достоверности фактов", "topic"]),
  );
});

test("sheet normalize: facts column → factCheckMode", () => {
  const {
    normalizeUsefulRow,
  } = require("../lib/intake/normalize") as typeof import("../lib/intake/normalize");
  const on = normalizeUsefulRow({
    "№": "44",
    topic: "Как отправить посылку в Армению",
    category: "Быт",
    value: "Правила",
    СТА: "1",
    flag: "useful",
    facts: "1",
  });
  assert.ok(on);
  assert.equal(on!.factCheckMode, "FACT_CHECK");
  assert.equal(on!.factCheckRaw, "1");
  const off = normalizeUsefulRow({
    "№": "13",
    topic: "Работа удалённо",
    facts: "",
  });
  assert.ok(off);
  assert.equal(off!.factCheckMode, "STANDARD");
});

test("BUGFIX: normalizeSlideToFrame does not cover-crop tall GPT frames", async () => {
  const sharp = (await import("sharp")).default;
  const os = await import("node:os");
  const { mkdir, rm } = await import("node:fs/promises");
  const {
    normalizeSlideToFrame,
  } = require("../lib/studio/vernatun-carousel/logo-bake") as typeof import("../lib/studio/vernatun-carousel/logo-bake");
  const tmp = path.join(os.tmpdir(), `norm-frame-${Date.now()}`);
  await mkdir(tmp, { recursive: true });
  try {
    // Taller-than-4:5 like aggregator (946×1663 ≈ aspect 0.57)
    const src = path.join(tmp, "tall.png");
    // White top band = "headline" that cover would chop
    const buf = await sharp({
      create: {
        width: 946,
        height: 1663,
        channels: 3,
        background: { r: 20, g: 20, b: 20 },
      },
    })
      .composite([
        {
          input: await sharp({
            create: {
              width: 946,
              height: 120,
              channels: 3,
              background: { r: 255, g: 255, b: 255 },
            },
          })
            .png()
            .toBuffer(),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toFile(src);
    void buf;
    const out = await normalizeSlideToFrame(src);
    const { data, info } = await sharp(out)
      .raw()
      .toBuffer({ resolveWithObject: true });
    assert.equal(info.width, 1080);
    assert.equal(info.height, 1350);
    // Top-center of framed canvas should still see bright "headline" (not cropped away)
    const midX = Math.floor(info.width / 2);
    let bright = 0;
    for (let y = 0; y < 80; y++) {
      const i = (y * info.width + midX) * info.channels;
      bright += data[i]!;
    }
    assert.ok(
      bright / 80 > 180,
      "top headline band must survive contain (cover would crop it)",
    );
  } finally {
    await rm(tmp, { recursive: true, force: true }).catch(() => undefined);
  }
});

test("DEV: Mode B prompt forbids crop + white logo plate", () => {
  const {
    buildModeBSlidePrompt,
  } = require("../lib/studio/vernatun-carousel/prompts") as typeof import("../lib/studio/vernatun-carousel/prompts");
  const p = buildModeBSlidePrompt({
    index: 1,
    headline: "Хук",
    body: "Текст",
    visualIntent: "meetup",
    brandName: "Vernatun",
    colorsNote: "#111",
    nativeLogoRef: true,
  });
  assert.match(p, /CROP \/ FRAME|FULLY inside/i);
  assert.match(p, /white rectangles|заплат|plates/i);
  assert.match(p, /CTA/);
});

test("DEV: AD verdict log writes APPROVED|REMARKS for team", async () => {
  const { mkdir, readFile, rm } = await import("node:fs/promises");
  const os = await import("node:os");
  const {
    writeAdVerdictLog,
  } = require("../lib/studio/vernatun-carousel/prompt-dev-log") as typeof import("../lib/studio/vernatun-carousel/prompt-dev-log");
  const tmp = path.join(os.tmpdir(), `ad-verdict-${Date.now()}`);
  await mkdir(tmp, { recursive: true });
  try {
    await writeAdVerdictLog({
      jobDir: tmp,
      canFinalize: false,
      summary: "test remarks",
      findings: [
        {
          slide_id: "slide_1",
          severity: "major",
          element: "edge_margin",
          observed_issue: "too close",
          recommended_change: "pad",
          reason: "test",
          acceptance_check: "ok",
        },
      ],
      repairCycle: 0,
      maxRepair: 0,
    });
    const md = await readFile(path.join(tmp, "prompts", "AD_VERDICT.md"), "utf8");
    assert.match(md, /REMARKS/);
    assert.match(md, /edge_margin/);
    assert.match(md, /команды разработки|DEV TEAM|команда/i);
    const json = JSON.parse(
      await readFile(path.join(tmp, "prompts", "AD_FINDINGS.json"), "utf8"),
    ) as { verdict: string };
    assert.equal(json.verdict, "REMARKS");
  } finally {
    await rm(tmp, { recursive: true, force: true }).catch(() => undefined);
  }
});

test("B4: HY protocol — letter spellout + fidelity block in Mode B prompt", () => {
  const {
    containsArmenian,
    hyLetterSpellout,
    extractArmenianWords,
    armenianFidelityPromptBlock,
    B4_HY_CANONICAL_15,
    b4HySmokeStyleNotes,
  } = require("../lib/studio/vernatun-carousel/hy-text") as typeof import("../lib/studio/vernatun-carousel/hy-text");
  assert.equal(containsArmenian("hello"), false);
  assert.equal(containsArmenian("բարև"), true);
  assert.equal(B4_HY_CANONICAL_15.length, 15);
  assert.match(b4HySmokeStyleNotes(), /B4_HY_SMOKE/);
  assert.match(b4HySmokeStyleNotes(), /русский|RU/i);
  // և = single Armenian letter (U+0587), not ե+վ
  assert.equal(hyLetterSpellout("բարև"), "բ · ա · ր · և");
  const {
    buildB4HyCanonicalScript,
  } = require("../lib/studio/vernatun-carousel/hy-text") as typeof import("../lib/studio/vernatun-carousel/hy-text");
  const canon = buildB4HyCanonicalScript({ slideCount: 4 });
  assert.match(canon.slides[0]!.headline, /[А-Яа-яЁё]/);
  assert.match(canon.slides[0]!.body, /բարև/);
  assert.match(canon.slides[0]!.body, /[А-Яа-яЁё]/);
  assert.deepEqual(extractArmenianWords(["բարև լեզու", "hello"]), [
    "բարև",
    "լեզու",
  ]);
  const block = armenianFidelityPromptBlock(["շնորհակալություն"]);
  assert.match(block, /ARMENIAN SCRIPT FIDELITY/);
  assert.match(block, /շ · ն · ո · ր · հ/);
  const {
    buildModeBSlidePrompt,
  } = require("../lib/studio/vernatun-carousel/prompts") as typeof import("../lib/studio/vernatun-carousel/prompts");
  const p = buildModeBSlidePrompt({
    index: 2,
    headline: "Живой язык",
    body: "учим слова",
    supporting: "բարև — привет",
    visualIntent: "vocab poster",
    brandName: "Vernatun",
    colorsNote: "#111 #F58220",
    nativeLogoRef: true,
    slideCountTotal: 4,
    vocabSlot: { dashed: true, slot: "FREE" },
  });
  // B4.5: GPT must NOT paint HY; free dashed VOCAB_SLOT for HTML bake
  assert.match(p, /VOCAB SLOT|Do NOT paint ANY Armenian|PLACE FREELY/i);
  assert.match(p, /\[\[…\]\]|EXACT headline/);
  assert.match(p, /HEADLINE RULES/);
  assert.match(p, /HTML post-pass|post-pass will paste|Post-pass HTML/i);
  assert.equal(/բ · ա · ր · և/.test(p), false);
});

test("B4: hy_spelling defect → GPT regen", () => {
  const script: VernatunScript = {
    carousel_title: "t",
    audience: "a",
    central_thesis: "c",
    slides: [
      {
        index: 1,
        role: "cover",
        headline: "բարև",
        body: "x",
        visual_intent: "people",
      },
    ],
  };
  const plan = applyRepairs(script, [
    {
      slide_id: "slide_1",
      severity: "major",
      element: "hy_spelling",
      observed_issue: "wrong letter",
      recommended_change: "regen exact HY from script",
      reason: "armenian_spell",
      acceptance_check: "match script",
    },
  ]);
  assert.ok(plan.slidesToRegen.includes(1));
});

test("layout-qa: safe zone rect + prompt block have pixel bounds", () => {
  const {
    logoSafeZoneRect,
    logoSafeZonePromptBlock,
    LOGO_SAFE_ZONE,
    EDGE_MARGIN_PX,
    mergeLayoutFindings,
  } = require("../lib/studio/vernatun-carousel/layout-qa") as typeof import("../lib/studio/vernatun-carousel/layout-qa");
  assert.equal(EDGE_MARGIN_PX, 48);
  assert.equal(LOGO_SAFE_ZONE.widthPx, 200);
  assert.equal(LOGO_SAFE_ZONE.heightPx, 236);
  const z = logoSafeZoneRect(1080, 1350);
  assert.equal(z.left, 1080 - LOGO_SAFE_ZONE.marginPx - LOGO_SAFE_ZONE.widthPx);
  assert.equal(z.top, LOGO_SAFE_ZONE.marginPx);
  assert.equal(z.width, 200);
  assert.equal(z.height, 236);
  const block = logoSafeZonePromptBlock();
  // Exact coords OK (so text stays out) — but forbid painting the zone itself
  assert.match(block, /200×236|200x236/i);
  assert.match(block, /28px/);
  assert.match(block, /48px/);
  assert.match(block, /Do NOT draw|NEVER paint|unmarked|quiet corner/i);
  assert.match(block, /x=\d+\.\.\d+/);
  assert.match(block, /logo_bake|post-pass/i);
  assert.equal(/empty rectangle/i.test(block), false);
  const merged = mergeLayoutFindings(
    [
      {
        slide_id: "slide_1",
        severity: "major",
        element: "logo_collision",
        observed_issue: "ink",
        recommended_change: "regen",
        reason: "programmatic_layout_qa",
        acceptance_check: "clear",
      },
    ],
    [
      {
        slide_id: "slide_1",
        severity: "minor",
        element: "logo_collision",
        observed_issue: "llm soft",
        recommended_change: "ok",
        reason: "llm",
        acceptance_check: "x",
      },
      {
        slide_id: "slide_2",
        severity: "suggestion",
        element: "typography",
        observed_issue: "kerning",
        recommended_change: "n/a",
        reason: "llm",
        acceptance_check: "x",
      },
    ],
  );
  assert.equal(merged[0]!.reason, "programmatic_layout_qa");
  assert.equal(merged.length, 2);
});

test("layout-qa: guide major thresholds stricter than speck", () => {
  const {
    GUIDE_ARTIFACT_MAJOR_ORANGE_MIN,
    GUIDE_ARTIFACT_MAJOR_DENSITY_MIN,
    GUIDE_ARTIFACT_MINOR_ORANGE_MIN,
  } = require("../lib/studio/vernatun-carousel/layout-qa") as typeof import("../lib/studio/vernatun-carousel/layout-qa");
  assert.ok(GUIDE_ARTIFACT_MAJOR_ORANGE_MIN >= 200);
  assert.ok(GUIDE_ARTIFACT_MAJOR_DENSITY_MIN >= 0.04);
  assert.ok(GUIDE_ARTIFACT_MINOR_ORANGE_MIN < GUIDE_ARTIFACT_MAJOR_ORANGE_MIN);
});

test("layout-qa: logo_collision / edge_margin / guide → GPT regen", () => {
  const script: VernatunScript = {
    carousel_title: "t",
    audience: "a",
    central_thesis: "c",
    slides: [
      {
        index: 1,
        role: "cover",
        headline: "Сила связей",
        body: "x",
        visual_intent: "people",
      },
    ],
  };
  for (const el of ["logo_collision", "edge_margin", "guide_artifact"]) {
    const plan = applyRepairs(script, [
      {
        slide_id: "slide_1",
        severity: "major",
        element: el,
        observed_issue: el,
        recommended_change: "regen slide",
        reason: "programmatic_layout_qa",
        acceptance_check: "clear",
      },
    ]);
    assert.ok(plan.slidesToRegen.includes(1), `${el} must regen`);
    assert.ok(plan.slidesToRerender.includes(1), `${el} must rerender`);
  }
});

test("B5.4: logo defect → rerender bake only (no GPT regen)", () => {
  const script: VernatunScript = {
    carousel_title: "t",
    audience: "a",
    central_thesis: "c",
    slides: [
      {
        index: 1,
        role: "cover",
        headline: "Сила связей",
        body: "x",
        visual_intent: "people",
      },
      {
        index: 2,
        role: "body",
        headline: "Второй",
        body: "y",
        visual_intent: "cafe",
      },
    ],
  };
  const plan = applyRepairs(script, [
    {
      slide_id: "slide_2",
      severity: "major",
      element: "logo",
      observed_issue: "logo drift",
      recommended_change: "exact emblem bake",
      reason: "branding",
      acceptance_check: "same emblem",
    },
  ]);
  assert.ok(plan.slidesToRerender.includes(2));
  assert.ok(!plan.slidesToRegen.includes(2));
});

test("B5.4: logo corner is always TOP-RIGHT for every job", () => {
  const {
    pickLogoCornerForJob,
    FIXED_LOGO_CORNER,
    emblemCompositeOffset,
    isLogoBakeEnabled,
    DEFAULT_LOGO_BAKE_SIZE_PX,
  } = require("../lib/studio/vernatun-carousel/logo-bake") as typeof import("../lib/studio/vernatun-carousel/logo-bake");
  assert.equal(DEFAULT_LOGO_BAKE_SIZE_PX, 180);
  assert.equal(FIXED_LOGO_CORNER, "tr");
  assert.equal(pickLogoCornerForJob("job-aaa"), "tr");
  assert.equal(pickLogoCornerForJob("job-bbb-different"), "tr");
  const prev = process.env.LOGO_BAKE;
  delete process.env.LOGO_BAKE;
  assert.equal(isLogoBakeEnabled(), true);
  process.env.LOGO_BAKE = "0";
  assert.equal(isLogoBakeEnabled(), false);
  if (prev === undefined) delete process.env.LOGO_BAKE;
  else process.env.LOGO_BAKE = prev;
  const off = emblemCompositeOffset("tr", 180, 180, 28, 1080, 1350);
  assert.equal(off.left, 1080 - 28 - 180);
  assert.equal(off.top, 28);
});

test("B5.4: bakeExactEmblemOntoSlide writes PNG with lockup bytes", async () => {
  const { mkdir, readFile, rm } = await import("node:fs/promises");
  const os = await import("node:os");
  const {
    bakeExactEmblemOntoSlide,
    resolveLogoBakeEmblemPath,
  } = require("../lib/studio/vernatun-carousel/logo-bake") as typeof import("../lib/studio/vernatun-carousel/logo-bake");
  const tmp = path.join(os.tmpdir(), `vernatun-logo-bake-${Date.now()}`);
  await mkdir(tmp, { recursive: true });
  try {
    const sharp = (await import("sharp")).default;
    const slidePath = path.join(tmp, "slide.jpg");
    const outPath = path.join(tmp, "out.png");
    await sharp({
      create: {
        width: 1080,
        height: 1350,
        channels: 3,
        background: { r: 40, g: 30, b: 20 },
      },
    })
      .jpeg()
      .toFile(slidePath);
    const emblem =
      resolveLogoBakeEmblemPath() ||
      path.join(process.cwd(), "brand", "vernatun-logo-lockup.png");
    const result = await bakeExactEmblemOntoSlide({
      slidePath,
      emblemPath: emblem,
      outPath,
      corner: "bl",
      sizePx: 144,
    });
    assert.equal(result.corner, "bl");
    assert.ok(result.emblemSha256.length === 64);
    assert.ok(result.placedW <= 144 && result.placedH <= 144);
    const out = await readFile(outPath);
    assert.ok(out.length > 5_000);
    assert.equal(out[0], 0x89); // PNG magic
  } finally {
    await rm(tmp, { recursive: true, force: true }).catch(() => undefined);
  }
});

test("B5.4: brand resolves lockup PNG with alpha first", () => {
  const {
    resolveVernatunEmblemPath,
  } = require("../lib/studio/vernatun-carousel/mode-b-brand-chrome") as typeof import("../lib/studio/vernatun-carousel/mode-b-brand-chrome");
  const p = resolveVernatunEmblemPath();
  assert.ok(p);
  assert.match(p!, /vernatun-logo-lockup\.png$/);
});

test("B5.4: AD can request wordmark tint per slide; luminance pick", () => {
  const {
    parseWordmarkHexFromFixText,
    pickWordmarkHexForLuminance,
    WORDMARK_DARK,
    WORDMARK_WHITE,
  } = require("../lib/studio/vernatun-carousel/logo-bake") as typeof import("../lib/studio/vernatun-carousel/logo-bake");
  assert.equal(pickWordmarkHexForLuminance(200), WORDMARK_DARK); // beige
  assert.equal(pickWordmarkHexForLuminance(160), WORDMARK_DARK);
  assert.equal(pickWordmarkHexForLuminance(40), WORDMARK_WHITE);
  assert.equal(
    parseWordmarkHexFromFixText("wordmark dark — название сливается"),
    WORDMARK_DARK,
  );
  assert.equal(
    parseWordmarkHexFromFixText("перекрась wordmark #FFFFFF"),
    WORDMARK_WHITE,
  );
  const plan = applyRepairs(
    {
      carousel_title: "t",
      audience: "a",
      central_thesis: "c",
      slides: [
        {
          index: 1,
          role: "cover",
          headline: "Хук",
          body: "x",
          visual_intent: "cafe",
        },
        {
          index: 2,
          role: "body",
          headline: "Два",
          body: "y",
          visual_intent: "room",
        },
      ],
    },
    [
      {
        slide_id: "slide_1",
        severity: "major",
        element: "logo_contrast",
        observed_issue: "VERNATUN белый на бежевом",
        recommended_change: "wordmark dark",
        reason: "контраст названия клуба",
        acceptance_check: "текст читается",
      },
      {
        slide_id: "slide_2",
        severity: "major",
        element: "logo_contrast",
        observed_issue: "тёмный текст на тёмном фото",
        recommended_change: "wordmark white",
        reason: "контраст",
        acceptance_check: "текст читается",
      },
    ],
  );
  assert.ok(plan.slidesToRerender.includes(1));
  assert.ok(plan.slidesToRerender.includes(2));
  assert.ok(!plan.slidesToRegen.includes(1));
  assert.equal(plan.logoWordmarkBySlide?.[1], WORDMARK_DARK);
  assert.equal(plan.logoWordmarkBySlide?.[2], WORDMARK_WHITE);
});

test("B5.4: viral skill + AD final require TR logo + collision check", () => {
  const skill = readFileSync(
    path.join(
      process.cwd(),
      "lib/studio/vernatun-carousel/skills/viral-carousel-design.md",
    ),
    "utf8",
  );
  assert.match(skill, /TOP-RIGHT/);
  assert.match(skill, /logo_collision|Финальная приёмка/i);
  assert.match(skill, /Wordmark contrast/i);
  assert.match(skill, /layout-QA|программный/i);
  assert.match(skill, /edge_margin|guide_artifact/);
  const {
    PROMPT_AD_FINAL,
  } = require("../lib/studio/vernatun-carousel/prompts") as typeof import("../lib/studio/vernatun-carousel/prompts");
  assert.match(PROMPT_AD_FINAL, /ФИНАЛЬНАЯ ПРИЁМКА|TOP-RIGHT/);
  assert.match(PROMPT_AD_FINAL, /logo_collision/);
  assert.match(PROMPT_AD_FINAL, /edge_margin/);
  assert.match(PROMPT_AD_FINAL, /guide_artifact/);
  assert.match(PROMPT_AD_FINAL, /программный layout-QA|layout-QA/);
  assert.match(PROMPT_AD_FINAL, /hy_spelling|ARMENIAN SPELLING/);
  const adFinalSrc = readFileSync(
    path.join(process.cwd(), "lib/studio/vernatun-carousel/art-director-final.ts"),
    "utf8",
  );
  assert.match(adFinalSrc, /ФИНАЛЬНАЯ ПРИЁМКА/);
  assert.match(adFinalSrc, /TOP-RIGHT/);
});

test("B5.4: tintLockupWordmark does not recolor pixels inside emblem circle", async () => {
  const {
    tintLockupWordmark,
    findEmblemCircleInLockup,
    WORDMARK_DARK,
    resolveLogoBakeEmblemPath,
  } = require("../lib/studio/vernatun-carousel/logo-bake") as typeof import("../lib/studio/vernatun-carousel/logo-bake");
  const sharp = (await import("sharp")).default;
  const emblem =
    resolveLogoBakeEmblemPath() ||
    path.join(process.cwd(), "brand", "vernatun-logo-lockup.png");
  const src = readFileSync(emblem);
  const before = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { cx, cy, r } = findEmblemCircleInLockup(
    Buffer.from(before.data),
    before.info.width,
    before.info.height,
  );
  const tinted = await tintLockupWordmark(src, WORDMARK_DARK);
  const after = await sharp(tinted).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // Sample a point well inside the circle — must match original RGB
  const ix = Math.floor(cx);
  const iy = Math.floor(cy);
  const i = (iy * before.info.width + ix) * 4;
  assert.equal(after.data[i], before.data[i]);
  assert.equal(after.data[i + 1], before.data[i + 1]);
  assert.equal(after.data[i + 2], before.data[i + 2]);
  assert.ok(r > 40);
});

test("B2: enforceUserAssets spreads 3 user photos + native logo note", () => {
  const { enforceUserAssets } = require("../lib/studio/vernatun-carousel/image-planner") as typeof import("../lib/studio/vernatun-carousel/image-planner");
  const plan = enforceUserAssets(
    {
      web_search_available: false,
      slots: [1, 2, 3, 4].map((i) => ({
        slide_index: i,
        action: "generate" as const,
        user_asset_id: null,
        visual_prompt: "x",
        composition_and_crop: "c",
        text_safe_area: "t",
        notes: "",
      })),
    },
    [
      {
        asset_id: "u1",
        original_filename: "a.jpg",
        mime: "image/jpeg",
        bytes: 1,
        sha256: "a",
        path: "/a",
        required: true,
        status: "pending",
      },
      {
        asset_id: "u2",
        original_filename: "b.jpg",
        mime: "image/jpeg",
        bytes: 1,
        sha256: "b",
        path: "/b",
        required: true,
        status: "pending",
      },
      {
        asset_id: "u3",
        original_filename: "c.jpg",
        mime: "image/jpeg",
        bytes: 1,
        sha256: "c",
        path: "/c",
        required: true,
        status: "pending",
      },
    ],
    true,
  );
  const ids = plan.slots.map((s) => s.user_asset_id);
  assert.ok(ids.includes("u1") && ids.includes("u2") && ids.includes("u3"));
  assert.match(plan.slots[0]!.notes, /mode_b_native_logo/);
});

test("orchestrator prompt is Framework B only", () => {
  const {
    buildOrchestratorSystemPrompt,
    ORCHESTRATOR_B_ONLY_MARKER,
  } = require("../lib/studio/vernatun-carousel/tools/orchestrator-prompt") as typeof import("../lib/studio/vernatun-carousel/tools/orchestrator-prompt");
  const p = buildOrchestratorSystemPrompt();
  assert.ok(p.includes(ORCHESTRATOR_B_ONLY_MARKER));
  assert.match(p, /slide_count/);
});

test("AD: reconcileAttachmentFindings drops false missing-slide blocker", () => {
  const {
    reconcileAttachmentFindings,
  } = require("../lib/studio/vernatun-carousel/art-director-final") as typeof import("../lib/studio/vernatun-carousel/art-director-final");
  const kept = reconcileAttachmentFindings(
    [
      {
        slide_id: "slide_5",
        severity: "blocker",
        element: "carousel_structure",
        observed_issue: "Финальный слайд 5 полностью отсутствует во вложении.",
        recommended_change: "Приложить слайд 5",
        reason: "Карусель оборвана",
        acceptance_check: "Слайд 5 есть",
      },
      {
        slide_id: "slide_3",
        severity: "major",
        element: "headline",
        observed_issue: "Заголовок заменён абракадаброй",
        recommended_change: "Вернуть RU",
        reason: "Скрипт нарушен",
        acceptance_check: "RU headline",
      },
    ],
    5,
    5,
  );
  assert.equal(kept.length, 1);
  assert.equal(kept[0]?.element, "headline");
  const untouched = reconcileAttachmentFindings(
    [
      {
        slide_id: "slide_5",
        severity: "blocker",
        element: "carousel_structure",
        observed_issue: "Финальный слайд отсутствует",
        recommended_change: "Приложить",
        reason: "оборвана",
        acceptance_check: "есть",
      },
    ],
    4,
    5,
  );
  assert.equal(untouched.length, 1);
});

test("B4/sheet: Mode B — RU headlines, no decorative quotes, pagination none", () => {
  const {
    buildModeBSlidePrompt,
  } = require("../lib/studio/vernatun-carousel/prompts") as typeof import("../lib/studio/vernatun-carousel/prompts");
  const p = buildModeBSlidePrompt({
    index: 3,
    headline: "Хлеб сближает",
    body: "Начните с тёплого",
    supporting: "հաց — хлеб",
    visualIntent: "bread",
    brandName: "Vernatun",
    colorsNote: "#111",
    nativeLogoRef: true,
    slideCountTotal: 5,
  });
  assert.match(p, /HEADLINE RULES/);
  assert.match(p, /RUSSIAN CYRILLIC ONLY/);
  assert.match(p, /Do NOT draw decorative quotation marks/);
  assert.match(p, /PAGINATION POLICY/);
  assert.match(p, /Do NOT draw page counters/);
  // B4.5: HY not in [[…]] paint list — HTML bake owns vocab
  assert.equal(/\[\[հաց — хлеб\]\]/.test(p), false);
  assert.match(p, /Do NOT paint ANY Armenian|VOCAB SLOT|HTML post-pass/i);
  assert.match(p, /RU HEADLINE FIDELITY/);
  assert.match(p, /Х · л · е · б/);
});

test("stripDecorativeQuotes removes wrapping marks", () => {
  const {
    stripDecorativeQuotes,
  } = require("../lib/studio/vernatun-carousel/hy-text") as typeof import("../lib/studio/vernatun-carousel/hy-text");
  assert.equal(stripDecorativeQuotes("«За чашкой»"), "За чашкой");
  assert.equal(stripDecorativeQuotes('"Hello"'), "Hello");
});

test("sheet food canonical: 5 slides × HY—RU vocab", () => {
  const {
    buildSheetFoodCanonicalScript,
    SHEET_FOOD_VOCAB_5,
  } = require("../lib/studio/vernatun-carousel/hy-text") as typeof import("../lib/studio/vernatun-carousel/hy-text");
  const s = buildSheetFoodCanonicalScript({});
  assert.equal(s.slide_count, 5);
  assert.equal(s.slides.length, 5);
  for (let i = 0; i < 5; i++) {
    assert.ok(s.slides[i]?.supporting_copy?.includes(SHEET_FOOD_VOCAB_5[i]!.hy));
    assert.ok(s.slides[i]?.supporting_copy?.includes(SHEET_FOOD_VOCAB_5[i]!.ru));
  }
  assert.equal(s.slides[4]?.role, "cta");
  assert.ok(s.slides[4]?.cta);
});

test("script approval: formatScriptRevisionNotes for writer", () => {
  const {
    formatScriptRevisionNotes,
  } = require("../lib/studio/vernatun-carousel/art-director-script") as typeof import("../lib/studio/vernatun-carousel/art-director-script");
  const md = formatScriptRevisionNotes(
    {
      approved: false,
      defects: [
        {
          priority: "MAJOR",
          slide_index: 1,
          element: "cover",
          reason: "Пустой хук",
          fix: "Назови тему remote из Армении",
        },
      ],
      notes: "нужна конкретика",
      model: "test",
      verdict: "REVISION_REQUIRED",
    },
    1,
  );
  assert.match(md, /REVISION_ROUND=1/);
  assert.match(md, /Назови тему/);
  assert.match(md, /FIX:/);
});

test("CTA catalog: 4 types + default speaking_meetup", () => {
  const {
    CTA_TYPE_IDS,
    resolveBriefCta,
    parseCtaType,
    CTA_TYPE_CATALOG,
  } = require("../lib/studio/vernatun-carousel/cta-catalog") as typeof import("../lib/studio/vernatun-carousel/cta-catalog");
  assert.equal(CTA_TYPE_IDS.length, 4);
  assert.equal(parseCtaType("CTA_MEETING"), "speaking_meetup");
  assert.equal(parseCtaType("consult_dm"), "consult_dm");
  const r = resolveBriefCta({});
  assert.equal(r.ctaType, "speaking_meetup");
  assert.match(r.cta, /разговорн|Vernatun/i);
  assert.match(CTA_TYPE_CATALOG.speaking_meetup.defaultCopy, /Vernatun/);
});

test("layout-qa: edgeBandLooksLikeText needs dens+run (not photo noise)", () => {
  const {
    edgeBandLooksLikeText,
    EDGE_INK_DENSITY_MIN,
  } = require("../lib/studio/vernatun-carousel/layout-qa") as typeof import("../lib/studio/vernatun-carousel/layout-qa");
  assert.equal(edgeBandLooksLikeText(0.093, 10), false); // was false-positive 9.3%
  assert.equal(edgeBandLooksLikeText(EDGE_INK_DENSITY_MIN, 10), false);
  assert.equal(edgeBandLooksLikeText(EDGE_INK_DENSITY_MIN, 40), true);
});

test("two masks: scriptwriter + AD script prompts (no code substance gate)", () => {
  const {
    PROMPT_SCRIPTWRITER,
    PROMPT_AD_SCRIPT,
    PROMPT_AD_FINAL,
  } = require("../lib/studio/vernatun-carousel/prompts") as typeof import("../lib/studio/vernatun-carousel/prompts");
  assert.match(PROMPT_SCRIPTWRITER, /VIRAL_CAROUSEL_SKILL|## MAKE/);
  assert.match(PROMPT_SCRIPTWRITER, /SCRIPTWRITER_VIRAL_SKILL/);
  assert.match(PROMPT_SCRIPTWRITER, /СМЫСЛ|здесь и сейчас/i);
  assert.match(PROMPT_SCRIPTWRITER, /supporting_copy|բարև|աշխատանք/i);
  assert.match(PROMPT_SCRIPTWRITER, /практическ|именнованн|ИП/i);
  assert.match(PROMPT_AD_SCRIPT, /СЦЕНАРИСТУ|APPROVED/i);
  assert.match(PROMPT_AD_SCRIPT, /AD_SCRIPT_VIRAL_SKILL/);
  assert.match(PROMPT_AD_SCRIPT, /hy_vocab|supporting_copy|swamp_copy/i);
  assert.match(PROMPT_AD_SCRIPT, /ИП|не запрещай/i);
  assert.match(PROMPT_AD_FINAL, /СБОРЩИКУ КАРТИНОК|сборщик/i);
  const loopSrc = readFileSync(
    path.join(process.cwd(), "lib/studio/vernatun-carousel/script-approval-loop.ts"),
    "utf8",
  );
  assert.match(loopSrc, /runScriptApprovalLoop/);
  assert.equal(
    require("node:fs").existsSync(
      path.join(process.cwd(), "lib/studio/vernatun-carousel/script-substance.ts"),
    ),
    false,
  );
  const {
    loadScriptwriterSkill,
    loadArtDirectorScriptSkill,
  } = require("../lib/studio/vernatun-carousel/skills/load-skill") as typeof import("../lib/studio/vernatun-carousel/skills/load-skill");
  assert.match(loadScriptwriterSkill(), /СЛОВАРЬ|supporting_copy/i);
  assert.match(loadArtDirectorScriptSkill(), /виральн|APPROVED|HY/i);
});

test("hy vocab: parse + one-per-slide defects + topic tie", () => {
  const {
    parseHyRuVocab,
    defectsForOneHyVocabPerSlide,
    ruVocabTiedToSlideCopy,
  } = require("../lib/studio/vernatun-carousel/hy-text") as typeof import("../lib/studio/vernatun-carousel/hy-text");
  assert.deepEqual(parseHyRuVocab("աշխատանք — работа"), {
    hy: "աշխատանք",
    ru: "работа",
  });
  assert.equal(parseHyRuVocab("привет"), null);
  assert.equal(ruVocabTiedToSlideCopy("работа", "Поиск работы", "Ищем remote"), true);
  assert.equal(ruVocabTiedToSlideCopy("работа", "Старт", "Только мотивация"), false);
  const ok = defectsForOneHyVocabPerSlide({
    slides: [
      {
        index: 1,
        headline: "Поиск работы",
        body: "С чего начать поиск работы из Армении.",
        supporting_copy: "աշխատանք — работа",
      },
      {
        index: 2,
        headline: "Удалённый режим",
        body: "Как выстроить удалённый день без хаоса.",
        supporting_copy: "հեռավար — удалённый",
      },
    ],
  });
  assert.equal(ok.length, 0);
  const untied = defectsForOneHyVocabPerSlide({
    slides: [
      {
        index: 1,
        headline: "Поиск вакансий",
        body: "С чего начать в Ереване.",
        supporting_copy: "բարև — привет",
      },
    ],
  });
  assert.ok(untied.some((d) => d.element === "hy_vocab_topic"));
  const bad = defectsForOneHyVocabPerSlide({
    slides: [
      {
        index: 1,
        headline: "բարև всем",
        body: "ok",
        supporting_copy: "нет слова",
      },
    ],
  });
  assert.ok(bad.length >= 2);
  assert.ok(bad.some((d) => d.element === "hy_vocab"));
  assert.ok(bad.some((d) => d.element === "headline"));
});

Promise.all(pending).then(() => {
  console.log(`\n=== Result: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) process.exit(1);
});
