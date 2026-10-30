/**
 * C-audit-03 dry-run: fixture 3-slide JSON → HTML/CSS-first PNGs (no image API).
 *
 *   npx tsx scripts/smoke-c-audit-03-html-first.ts
 *
 * Does NOT burn live gpt-image budget. Full 6-PNG wave smoke → Tester/Deployer.
 */

import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { createDarkNotesSeedPreset } from "../lib/settings/design-preset";
import {
  runCreateCarouselDraw,
  slideWarrantsOptionalBg,
} from "../lib/studio/carousel-html-renderer";
import type { CarouselHandoffJson } from "../lib/studio/carousel-json-contract";
import { carouselJsonSchema } from "../lib/studio/carousel-json-contract";
import { DEFAULT_CAROUSEL_IMAGE_MODEL } from "../types/mesh-agent";

const FIXTURE = path.join(
  process.cwd(),
  "memory/fixtures/sprint9/carousel/dark_notes_coffee/handoff.json",
);
const JOB_ID = "c-audit-03-smoke";
const MIN_PNG_BYTES = 12_000;

function fail(msg: string): never {
  console.error("FAIL:", msg);
  process.exit(1);
}

function ok(label: string, pass: boolean, detail?: string) {
  const line = detail ? `${label} — ${detail}` : label;
  if (!pass) fail(line);
  console.log("OK:", line);
}

async function main() {
  process.env.CAROUSEL_HTML_FIRST = "1";
  process.env.WAVE_VISUAL_COPY_ARTIFACTS = "0";
  // Isolated budget counter — do not touch main wave-visual-deconstructor budget
  process.env.WAVE_VISUAL_ARTIFACT_DIR = path.join(
    process.cwd(),
    "generatedMedia",
    "wave-carousel-audit-fix",
    "_smoke-budget",
  );
  // Clear skip so warrant heuristic can be asserted on dark_notes text kits
  delete process.env.CAROUSEL_DRAW_SKIP_BG;

  const raw = JSON.parse(await readFile(FIXTURE, "utf8")) as unknown;
  const parsed = carouselJsonSchema.safeParse(raw);
  if (!parsed.success) {
    fail(`fixture schema: ${parsed.error.message}`);
  }
  const json = parsed.data as CarouselHandoffJson;

  ok("fixture slides", json.slides.length === 3, `n=${json.slides.length}`);

  for (const slide of json.slides) {
    const warrants = slideWarrantsOptionalBg({
      visualPrompt: slide.visual_prompt,
      htmlFirst: true,
    });
    // dark_notes chalk/marker/checklist → HTML kit enough, no image API
    ok(
      `text-kit skip for slide ${slide.slide_number}`,
      warrants === false,
      slide.layout_variant,
    );
  }

  ok(
    "photo visual_prompt warrants bg",
    slideWarrantsOptionalBg({
      visualPrompt:
        "cinematic portrait photo of people at club table, warm bokeh, no text",
      htmlFirst: true,
    }) === true,
  );
  ok(
    "cinematic kit warrants bg",
    slideWarrantsOptionalBg({
      visualPrompt: "moody club atmosphere",
      kitAesthetic: "cinematic_scene",
      htmlFirst: true,
    }) === true,
  );

  // Force HTML-only for draw (belt + suspenders; warrants already false)
  process.env.CAROUSEL_DRAW_SKIP_BG = "1";

  const preset = createDarkNotesSeedPreset();
  const draw = await runCreateCarouselDraw(json, {
    jobId: JOB_ID,
    presetFile: preset,
    copyToWaveArtifacts: false,
  });

  if (!draw.ok) {
    fail(`draw: ${draw.error.code} — ${draw.error.message}`);
  }

  ok("draw ok", draw.ok === true);
  ok("htmlFirst", draw.htmlFirst === true);
  ok(
    "bgImageCalls=0",
    draw.bgImageCalls === 0,
    `calls=${draw.bgImageCalls}`,
  );
  ok(
    "model id image-2",
    draw.model === DEFAULT_CAROUSEL_IMAGE_MODEL ||
      draw.model === "openai/gpt-5.4-image-2",
    draw.model,
  );
  ok("renderMode html_png", draw.renderMode === "html_png", draw.renderMode);
  ok("3 slides out", draw.slides.length === 3, `n=${draw.slides.length}`);

  for (const slide of draw.slides) {
    const fileName = `slide_${String(slide.index).padStart(2, "0")}.png`;
    const abs = path.join(
      process.cwd(),
      "public/generated/carousel",
      JOB_ID,
      fileName,
    );
    const st = await stat(abs);
    ok(
      `PNG ${fileName} size`,
      st.size >= MIN_PNG_BYTES,
      `${st.size} bytes (min ${MIN_PNG_BYTES})`,
    );
    // PNG magic
    const buf = await readFile(abs);
    ok(
      `PNG ${fileName} header`,
      buf[0] === 0x89 &&
        buf[1] === 0x50 &&
        buf[2] === 0x4e &&
        buf[3] === 0x47,
    );
    ok(
      `preview URL 4:5 path`,
      slide.imageUrl.includes(`/generated/carousel/${JOB_ID}/`),
      slide.imageUrl,
    );
  }

  console.log("\nC-audit-03 HTML-first smoke PASS");
  console.log(
    `Artifacts: public/generated/carousel/${JOB_ID}/slide_01..03.png`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
