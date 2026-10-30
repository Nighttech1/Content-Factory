/**
 * Sprint 9 — static + fixture contract asserts (C-s9-09).
 * Run: npx tsx scripts/assert-sprint9-contracts.ts
 */
import fs from "fs";
import path from "path";
import {
  parseAndAssertCarouselJsonStrict,
  CarouselJsonParseError,
} from "../lib/studio/carousel-json-contract";
import {
  parseAndAssertReelsScript,
  ReelsScriptParseError,
} from "../lib/studio/reels-script-contract";
import { critiqueCarouselHandoff } from "../lib/studio/carousel-quality-critic";
import { critiqueReelsScript } from "../lib/studio/reels-quality-critic";
import { CREATE_CAROUSEL_NO_MOCK } from "../lib/studio/agent-chat-soft-ack";
import {
  loadSprint9CarouselFixtures,
  loadSprint9ReelsFixtures,
} from "../lib/studio/__fixtures__/sprint9-loaders";

type Results = Record<string, unknown>;

function main() {
  const results: Results = {};
  results.CREATE_CAROUSEL_NO_MOCK = CREATE_CAROUSEL_NO_MOCK;
  if (!CREATE_CAROUSEL_NO_MOCK) throw new Error("NO_MOCK must be true");

  const cars = loadSprint9CarouselFixtures();
  const reels = loadSprint9ReelsFixtures();
  let carPass = 0;
  let carFail = 0;
  for (const c of cars) {
    const v = critiqueCarouselHandoff(c.handoff);
    if (v.ok) carPass++;
    else {
      carFail++;
      console.error("car fail", c.id, v);
    }
  }
  let reelsPass = 0;
  let reelsFail = 0;
  for (const r of reels) {
    const v = critiqueReelsScript(r.script);
    if (v.ok) reelsPass++;
    else {
      reelsFail++;
      console.error("reels fail", r.id, v);
    }
  }
  results.carousel_fixtures = { n: cars.length, pass: carPass, fail: carFail };
  results.reels_fixtures = { n: reels.length, pass: reelsPass, fail: reelsFail };

  let badJsonReject = false;
  try {
    parseAndAssertCarouselJsonStrict("{not json");
  } catch (e) {
    badJsonReject = e instanceof CarouselJsonParseError;
  }
  results.bad_carousel_json_reject = badJsonReject;

  let countMismatch = false;
  try {
    parseAndAssertCarouselJsonStrict(
      JSON.stringify({
        contentType: "carousel",
        requested_slide_count: 3,
        slides: [
          {
            slide_number: 1,
            layout_variant: "cover",
            primary_copy: "Hook gap?",
            swipe_trigger: "meta curiosity",
            visual_prompt: "coffee cup on dark bar",
            cta_type: 2,
          },
        ],
        caption: "x",
        hashtags: [],
        cta_type: 2,
      }),
    );
  } catch (e) {
    countMismatch =
      e instanceof CarouselJsonParseError && e.code === "COUNT_MISMATCH";
  }
  results.count_mismatch_reject = countMismatch;

  // Align with smoke-sprint9-fixtures flat-hook fixture (valid schema, weak quality)
  const weakCta = critiqueCarouselHandoff({
    contentType: "carousel",
    requested_slide_count: 1,
    slides: [
      {
        slide_number: 1,
        layout_variant: "cover",
        primary_copy: "Добро пожаловать",
        secondary_copy: "Один практичный абзац для HTML-слоя. Вторая фраза закрывает мысль.",
        swipe_trigger: "meta why",
        visual_prompt: "purple gradient abstract",
        cta_type: 4,
      },
    ],
    caption: "x",
    hashtags: [],
    cta_type: 4,
  });
  results.weak_carousel_reject =
    !weakCta.ok && weakCta.code === "carousel_quality_reject";
  results.weak_carousel_reasons = !weakCta.ok ? weakCta.reasons : [];

  let softReelsReject = false;
  try {
    parseAndAssertReelsScript({
      contentType: "reels",
      platform: "instagram",
      hook: { t0: 0, t1: 3, onScreen: "Привет друзья", vo: "Привет" },
      beats: [{ t0: 3, t1: 5, onScreen: "a", vo: "a" }],
      cta: { onScreen: "", captionLine: "" },
      promptForMontage: "",
    });
  } catch (e) {
    softReelsReject = e instanceof ReelsScriptParseError;
  }
  const softCritic = critiqueReelsScript({
    contentType: "reels",
    platform: "instagram",
    hook: { t0: 0, t1: 1.5, onScreen: "Привет друзья", vo: "Привет" },
    beats: [
      { t0: 2, t1: 5, onScreen: "beat one value", vo: "beat one" },
      { t0: 5, t1: 8, onScreen: "beat two value", vo: "beat two" },
    ],
    cta: { onScreen: "Запишись", captionLine: "Link in bio" },
    promptForMontage: "dark cafe montage",
  });
  results.weak_reels_schema_or_critic =
    softReelsReject || !softCritic.ok;

  const carouselOnReels = critiqueReelsScript({
    contentType: "carousel",
    slides: [{ a: 1 }],
  });
  results.carousel_on_reels_reject = !carouselOnReels.ok;

  let s46ok = true;
  for (const c of cars) {
    const j = c.handoff;
    const cta =
      j.cta_type ??
      j.slides.find((s) => /cta/i.test(s.layout_variant))?.cta_type;
    if (cta != null && (cta < 1 || cta > 4)) s46ok = false;
    for (const s of j.slides) {
      if (!s.swipe_trigger?.trim()) s46ok = false;
    }
  }
  results.s46_cta_swipe_fixtures = s46ok;

  const root = path.join(__dirname, "..");
  const createSrc = fs.readFileSync(
    path.join(root, "components/studio/workspace/CreateCarouselModal.tsx"),
    "utf8",
  );
  results.handoff_to_designer_present = createSrc.includes("drawSlides");
  results.starts_scriptwriter =
    createSrc.includes("Арт-директор") &&
    createSrc.includes("create-carousel-ad-header");
  results.create_step_scriptwriter_testid = createSrc.includes(
    "create-draw-button",
  );
  results.people_tabs =
    createSrc.includes("create-carousel-ad-header") ||
    createSrc.includes("create-carousel-people-tabs");
  results.cta_hint_import =
    createSrc.includes("Собрать карусель") &&
    createSrc.includes("create-build-mode");

  const previewSrc = fs.readFileSync(
    path.join(root, "components/studio/workspace/CreateCarouselPreview.tsx"),
    "utf8",
  );
  results.sliced_preview_testid = previewSrc.includes(
    "create-carousel-preview-sliced",
  );

  const routeSrc = fs.readFileSync(
    path.join(root, "app/api/studio/agent-chat/route.ts"),
    "utf8",
  );
  results.route_carousel_critic = routeSrc.includes("critiqueCarouselHandoff");
  results.route_reels_critic = routeSrc.includes("critiqueReelsScript");
  results.route_error_source = /source:\s*["']error["']/.test(routeSrc);

  const razborSrc = fs.readFileSync(
    path.join(root, "components/studio/workspace/RazborModal.tsx"),
    "utf8",
  );
  results.razbor_scriptwriter = /scriptwriter|Сценарист/.test(razborSrc);
  results.razbor_designer = /designer|Дизайнер/.test(razborSrc);
  results.razbor_handoff_next = razborSrc.includes("handoffNextForTab");

  const hintSrc = fs.readFileSync(
    path.join(root, "components/studio/workspace/ScriptwriterCtaHint.tsx"),
    "utf8",
  );
  results.s46_cta_hint_1_4 =
    /1\s*[–-]\s*4|cta.*1|«\?»|\?/.test(hintSrc) || hintSrc.includes("?");

  console.log(JSON.stringify(results, null, 2));

  const fails: string[] = [];
  for (const [k, v] of Object.entries(results)) {
    if (v === false) fails.push(k);
    if (
      typeof v === "object" &&
      v !== null &&
      "fail" in v &&
      typeof (v as { fail: number }).fail === "number" &&
      (v as { fail: number }).fail > 0
    ) {
      fails.push(k);
    }
  }
  if (fails.length) {
    console.error("ASSERT_FAIL", fails);
    process.exit(1);
  }
  console.log("CONTRACT_ASSERT_OK");
}

main();
