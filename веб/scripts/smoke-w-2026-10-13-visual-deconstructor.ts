/**
 * Wave W-2026-10-13-visual-deconstructor — static + unit/contract guards.
 * Tickets:
 *   C-visual-style-deconstructor
 *   C-design-slot-sliced-preview
 *   C-carousel-css-vars-builder
 *   C-reels-scriptwriter-upgrade
 *
 *   npx tsx scripts/smoke-w-2026-10-13-visual-deconstructor.ts
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(rel: string) {
  return readFileSync(path.join(root, rel), "utf8");
}

let failed = 0;

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed += 1;
  } else {
    console.log("PASS:", msg);
  }
}

async function main() {
  // ========== C-visual-style-deconstructor ==========
  assert(
    existsSync(path.join(root, "types/design.ts")),
    "C-vd: types/design.ts exists",
  );
  assert(
    existsSync(path.join(root, "lib/settings/design-preset.ts")),
    "C-vd: design-preset.ts exists",
  );

  const designTypes = read("types/design.ts");
  assert(
    designTypes.includes("DesignPresetFile") &&
      designTypes.includes("dark_notes") &&
      designTypes.includes("bento_glass"),
    "C-vd: DesignPresetFile + golden preset ids",
  );

  const designPreset = read("lib/settings/design-preset.ts");
  assert(
    designPreset.includes("createDarkNotesSeedPreset") &&
      designPreset.includes("createBentoGlassSeedPreset") &&
      designPreset.includes("PNG_BUDGET_MAX = 40"),
    "C-vd: seed factories + PNG_BUDGET_MAX 40",
  );

  const seedsIdx = read("lib/settings/design-presets/index.ts");
  assert(
    seedsIdx.includes('seed-dark-notes') &&
      seedsIdx.includes('seed-bento-glass'),
    "C-vd: stable seed ids seed-dark-notes / seed-bento-glass",
  );

  const deconstructAgent = read("lib/agents/deconstructStyle.ts");
  assert(
    deconstructAgent.includes("parseDeconstructStyleReply") ||
      deconstructAgent.includes("mockDeconstructStyleResponse"),
    "C-vd: deconstructStyle agent parse/mock",
  );

  const deconstructStudio = read("lib/studio/deconstruct-style.ts");
  assert(
    deconstructStudio.includes("deconstructStyle"),
    "C-vd: studio deconstructStyle entry",
  );

  assert(
    existsSync(path.join(root, "app/api/settings/design-deconstruct/route.ts")),
    "C-vd: POST design-deconstruct route",
  );

  const designLib = read("lib/settings/design-library.ts");
  assert(
    designLib.includes("cf.settings.design.library.v1") &&
      designLib.includes("cf.settings.design.activeId") &&
      designLib.includes("seedFactoryDesignPresets"),
    "C-vd: persist keys + seedFactoryDesignPresets",
  );

  // ========== C-design-slot-sliced-preview ==========
  const sliced = read("components/settings/SlicedSlotPreview.tsx");
  assert(
    sliced.includes("cover") &&
      sliced.includes("cta") &&
      (sliced.includes("body_slide") || sliced.includes("body")) &&
      (sliced.includes("4:5") ||
        sliced.includes("aspect-[4/5]") ||
        sliced.includes("aspectRatio") ||
        sliced.includes("aspect-")),
    "C-sp: SlicedSlotPreview 3 roles / 4:5",
  );
  assert(
    sliced.includes("--cf-design-bg") &&
      sliced.includes("--cf-design-accent"),
    "C-sp: sliced mocks use --cf-design-* vars",
  );

  const carousel = read("components/settings/DesignLibraryCarousel.tsx");
  assert(
    carousel.includes("SlicedSlotPreview") &&
      carousel.includes("Создать из референса"),
    "C-sp: Embla uses SlicedSlotPreview + create-from-ref CTA",
  );
  assert(
    /panorama/i.test(carousel) &&
      (/never panorama|not panorama|Forbidden.*panorama|не panorama/i.test(
        carousel,
      ) ||
        carousel.includes("SlicedSlotPreview")),
    "C-sp: Embla primary preview is sliced (panorama not sole)",
  );

  const tuner = read("components/settings/QuickThemeTuner.tsx");
  assert(
    tuner.includes("cssVarOverrides") &&
      tuner.includes("--cf-design-"),
    "C-sp: QuickThemeTuner writes cssVarOverrides",
  );

  // ========== C-carousel-css-vars-builder ==========
  const renderer = read("lib/studio/carousel-html-renderer.ts");
  assert(
    renderer.includes("export function carouselHtmlBuilder") &&
      renderer.includes("CAROUSEL_SAFE") &&
      renderer.includes("top: 120") &&
      renderer.includes("bottom: 160") &&
      renderer.includes("left: 80"),
    "C-cb: carouselHtmlBuilder + safe-zone 120/160/80",
  );
  assert(
    renderer.includes("designPresetToCssVars") &&
      renderer.includes("cover") &&
      renderer.includes("body_slide") &&
      renderer.includes("cta_slide"),
    "C-cb: CSS vars + role kits",
  );
  assert(
    renderer.includes("marker") &&
      renderer.includes("glass-card") &&
      (renderer.includes("doodle") || renderer.includes("bridge-arrow")),
    "C-cb: preset primitives marker/glass/doodle",
  );

  const artifacts = read("lib/studio/wave-visual-artifacts.ts");
  assert(
    artifacts.includes("wave-visual-deconstructor") &&
      artifacts.includes("reservePngBudget") &&
      artifacts.includes("commitPngBudget") &&
      artifacts.includes("copySlidesToWaveArtifacts"),
    "C-cb: wave artifact + budget helpers",
  );

  // ========== C-reels-scriptwriter-upgrade ==========
  const agentDefaults = read("lib/mesh/agent-defaults.ts");
  assert(
    agentDefaults.includes('"custom-reels"') &&
      agentDefaults.includes("Сценарист") &&
      agentDefaults.includes("0–2") &&
      agentDefaults.includes("promptForMontage"),
    "C-rs: custom-reels Сценарист + hook 0–2 + promptForMontage",
  );
  assert(
    agentDefaults.includes("slides[]") ||
      agentDefaults.includes("promptForDesigner"),
    "C-rs: forbids carousel slides / promptForDesigner in reels prompt",
  );

  const reelsContract = read("lib/studio/reels-script-contract.ts");
  assert(
    reelsContract.includes("parseReelsScriptArtifact") &&
      reelsContract.includes('contentType: "reels"') &&
      reelsContract.includes("carousel_slides_forbidden"),
    "C-rs: reels-script-contract rejects carousel slides",
  );

  // Unit: parse helpers
  const { createDarkNotesSeedPreset, createBentoGlassSeedPreset, designPresetToCssVars, PNG_BUDGET_MAX } =
    await import("../lib/settings/design-preset");
  const dark = createDarkNotesSeedPreset();
  const bento = createBentoGlassSeedPreset();
  assert(dark.id === "seed-dark-notes" && dark.preset === "dark_notes", "C-vd unit: dark_notes seed id");
  assert(bento.id === "seed-bento-glass" && bento.preset === "bento_glass", "C-vd unit: bento_glass seed id");
  assert(PNG_BUDGET_MAX === 40, "C-vd unit: PNG_BUDGET_MAX === 40");

  const vars = designPresetToCssVars(dark);
  assert(
    vars["--cf-design-bg"] && vars["--cf-design-accent"],
    "C-cb unit: designPresetToCssVars emits --cf-design-*",
  );

  const { carouselHtmlBuilder, normalizeCarouselSlideRole } = await import(
    "../lib/studio/carousel-html-renderer"
  );
  const built = carouselHtmlBuilder({
    slides: [
      { role: "cover", headline: "Hook", body: "Sub" },
      { role: "point", headline: "Body", body: "Check" },
      { role: "cta", headline: "CTA", body: "Save" },
    ],
    preset: dark,
  });
  assert(built.frames.length === 3, "C-cb unit: builder returns 3 frames");
  assert(
    built.frames[0]!.role === "cover" &&
      built.frames[1]!.role === "body_slide" &&
      built.frames[2]!.role === "cta_slide",
    "C-cb unit: role normalize cover/body/cta",
  );
  assert(
    built.cssVarsApplied["--cf-design-bg"] === dark.colors.bg,
    "C-cb unit: css vars from preset colors",
  );
  assert(
    built.frames.every((f) => f.html.includes("--cf-design-bg")),
    "C-cb unit: HTML embeds CSS vars",
  );
  assert(
    normalizeCarouselSlideRole(undefined, 0, 5) === "cover" &&
      normalizeCarouselSlideRole(undefined, 4, 5) === "cta_slide",
    "C-cb unit: rhythm first cover last cta",
  );

  const { parseReelsScriptArtifact } = await import(
    "../lib/studio/reels-script-contract"
  );
  const badCarousel = parseReelsScriptArtifact({
    slides: [{ primary_copy: "x" }],
  });
  assert(!badCarousel.ok, "C-rs unit: rejects carousel slides without hook");

  const goodReels = parseReelsScriptArtifact({
    contentType: "reels",
    durationSec: 20,
    hook: { t0: 0, t1: 2, onScreen: "STOP", vo: "Stop scrolling" },
    beats: [
      { t0: 2, t1: 8, label: "a", onScreen: "A", vo: "A" },
      { t0: 8, t1: 14, label: "b", onScreen: "B", vo: "B" },
    ],
    cta: {
      t0: 14,
      t1: 20,
      onScreen: "Save",
      vo: "Save this",
      captionLine: "Link in bio",
    },
    promptForMontage: "Cut on beats; end card CTA",
  });
  assert(
    goodReels.ok &&
      (goodReels.artifact?.hook?.t1 ?? Number.POSITIVE_INFINITY) <= 2 &&
      (goodReels.artifact?.beats?.length ?? 0) >= 2 &&
      Boolean(goodReels.artifact?.cta?.captionLine) &&
      Boolean(goodReels.artifact?.promptForMontage),
    "C-rs unit: accepts reels artifact with hook≤2 + beats + CTA + montage",
  );

  // Razbor freeze soft check — ticket files should not claim Razbor edits
  for (const ticket of [
    "C-visual-style-deconstructor",
    "C-design-slot-sliced-preview",
    "C-carousel-css-vars-builder",
    "C-reels-scriptwriter-upgrade",
  ]) {
    const chainPath = path.join(root, "memory/tickets", ticket, "chain.md");
    if (existsSync(chainPath)) {
      const chain = readFileSync(chainPath, "utf8");
      assert(
        !/RazborModal\.tsx/.test(chain) ||
          /no Razbor|Razbor freeze|не трогать Razbor|Do not edit Razbor/i.test(
            chain,
          ),
        `${ticket}: chain respects Razbor freeze`,
      );
    }
  }

  if (failed > 0) {
    console.error(`\nSMOKE_W_2026_10_13_VISUAL_DECONSTRUCTOR_FAIL (${failed})`);
    process.exit(1);
  }
  console.log("\nSMOKE_W_2026_10_13_VISUAL_DECONSTRUCTOR_OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
