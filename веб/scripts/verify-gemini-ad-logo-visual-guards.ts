/**
 * Wave 2026-10-18-gemini-ad-logo-visual — Tester G1–G9 guards.
 *   npx tsx scripts/verify-gemini-ad-logo-visual-guards.ts
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import { sanitizeLogoRefForLlm } from "@/lib/intake/placeholders";
import {
  ART_DIRECTOR_DEFAULT_MODEL,
  resolveArtDirectorModel,
} from "@/lib/studio/art-director-review";
import { isSanitizedLogoStub } from "@/lib/studio/carousel-html-renderer";
import {
  formatPrettySlideNum,
  resolveTypeScaleCss,
} from "@/lib/studio/carousel-layered-composite";
import {
  formatTypeScaleInjectBlock,
  parseTypographyScaleFromPaletteJson,
  resolveCreateCarouselOverlay,
  VISUAL_PROMPT_RICHNESS_HARD,
} from "@/lib/studio/create-carousel-prompts";

type Row = { id: string; pass: boolean; detail: string };
const results: Row[] = [];

function check(id: string, pass: boolean, detail: string) {
  results.push({ id, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${id} — ${detail}`);
}

async function main() {
  // G1 type scale SoT
  const scale = { cover: 40, h2: 28, body: 18, caption: 14 };
  const coverCss = resolveTypeScaleCss("cover_center", scale);
  check(
    "G1_type_scale_cover",
    coverCss.primary === "40px" && coverCss.scaleApplied,
    JSON.stringify(coverCss),
  );
  const bodyCss = resolveTypeScaleCss("body_left", scale);
  check(
    "G1_type_scale_body_h2",
    bodyCss.primary === "28px",
    JSON.stringify(bodyCss),
  );
  const fallback = resolveTypeScaleCss("cover_center", null);
  check(
    "G1_fallback_yields_when_missing",
    !fallback.scaleApplied && fallback.primary.includes("px"),
    `fallback primary=${fallback.primary}`,
  );

  // G8 pretty numbering
  check("G8_pretty_03_06", formatPrettySlideNum(2, 6) === "03/06", formatPrettySlideNum(2, 6));
  check("G8_pretty_01_06", formatPrettySlideNum(0, 6) === "01/06", formatPrettySlideNum(0, 6));
  check("G8_pretty_06_06", formatPrettySlideNum(5, 6) === "06/06", formatPrettySlideNum(5, 6));

  // G3 Gemini default (no silent gpt-4o)
  const cleared = resolveArtDirectorModel(undefined);
  check(
    "G3_gemini_default",
    ART_DIRECTOR_DEFAULT_MODEL === "google/gemini-2.5-flash" &&
      cleared === "google/gemini-2.5-flash" &&
      !cleared.includes("gpt-4o"),
    `default=${ART_DIRECTOR_DEFAULT_MODEL} resolved=${cleared}`,
  );
  check(
    "G3_env_override",
    resolveArtDirectorModel("openai/gpt-4o") === "openai/gpt-4o",
    resolveArtDirectorModel("openai/gpt-4o"),
  );

  // G2 Designer TYPE SCALE inject
  const palette = JSON.stringify({
    typography: { scale: { cover: 40, h2: 28, body: 18, caption: 14 } },
  });
  const parsed = parseTypographyScaleFromPaletteJson(palette);
  const inject = formatTypeScaleInjectBlock(parsed, { sourceLabel: "test" });
  check(
    "G2_type_scale_inject_block",
    inject.includes("TYPE SCALE") && inject.includes("40px"),
    inject.slice(0, 320),
  );
  const overlay = resolveCreateCarouselOverlay("designer", "draw", {
    placeholders: { designPaletteJson: palette },
  });
  const overlayStr = String(overlay ?? "");
  check(
    "G2_designer_overlay_has_scale",
    overlayStr.includes("TYPE SCALE") &&
      (overlayStr.includes("40px") || /cover[^\n]*40/.test(overlayStr)),
    `len=${overlayStr.length} has40px=${overlayStr.includes("40px")}`,
  );

  // G7 rich visual_prompt (constant is already a joined string)
  const rich = String(VISUAL_PROMPT_RICHNESS_HARD);
  check(
    "G7_rich_vp",
    /≥3|>=3|3 concrete/i.test(rich) &&
      /Armenian|Vernatun|khachkar|Ararat|apricot/i.test(rich),
    rich.slice(0, 220),
  );

  // G5 logo dual-path
  const fakeData = `data:image/png;base64,${"A".repeat(500)}`;
  const stub = sanitizeLogoRefForLlm(fakeData);
  check(
    "G5_sanitize_stub",
    isSanitizedLogoStub(stub) && stub.includes("[brand logo present"),
    stub,
  );
  check("G5_raw_not_stub", !isSanitizedLogoStub(fakeData), "raw usable for img");

  const placeholdersSrc = await fs.readFile(
    path.join(process.cwd(), "lib/intake/placeholders.ts"),
    "utf8",
  );
  check(
    "G5_logoRefRaw_field",
    placeholdersSrc.includes("logoRefRaw:") &&
      placeholdersSrc.includes("sanitizeLogoRefForLlm"),
    "buildCorrectPlaceholders dual-path present",
  );

  // G4 no remake in AD runner
  const adRun = await fs.readFile(
    path.join(process.cwd(), "lib/studio/art-director-run.ts"),
    "utf8",
  );
  const hasEnqueueCall =
    /\benqueue\s*\(/.test(adRun) ||
    /\baddJob\s*\(/.test(adRun) ||
    /queue\.add\s*\(/.test(adRun);
  check("G4_no_enqueue_in_ad_run", !hasEnqueueCall, `enqueue=${hasEnqueueCall}`);
  check(
    "G4_remakeEnqueued_false_typed",
    adRun.includes("remakeEnqueued: false") || adRun.includes("remakeEnqueued = false"),
    "typed remakeEnqueued false",
  );

  // G6 brand-name font token in composite source
  const compositeSrc = await fs.readFile(
    path.join(process.cwd(), "lib/studio/carousel-layered-composite.ts"),
    "utf8",
  );
  check(
    "G6_brand_name_font_doc",
    compositeSrc.includes(".brand-name") &&
      compositeSrc.includes("--cf-font-content") &&
      compositeSrc.includes("var(--cf-font-content, var(--cf-font-body))"),
    "composite keeps content font token",
  );

  // G9 smoke artifacts
  const smokeDir = path.join(
    process.cwd(),
    "docs",
    "карусель тест",
    "gemini-ad-logo-visual-smoke-6",
  );
  const pngs: Array<{ i: number; size: number }> = [];
  for (let i = 1; i <= 6; i++) {
    const p = path.join(smokeDir, `slide_0${i}.png`);
    try {
      const st = await fs.stat(p);
      pngs.push({ i, size: st.size });
    } catch {
      pngs.push({ i, size: 0 });
    }
  }
  check(
    "G9_six_pngs",
    pngs.every((p) => p.size > 10_000),
    JSON.stringify(pngs),
  );

  const adJson = JSON.parse(
    await fs.readFile(path.join(smokeDir, "art-director-review.json"), "utf8"),
  ) as {
    model?: string;
    remakeEnqueued?: boolean;
    verdict?: string;
  };
  const adMd = await fs.readFile(
    path.join(smokeDir, "art-director-review.md"),
    "utf8",
  );
  check("G9_ad_gemini", adJson.model === "google/gemini-2.5-flash", String(adJson.model));
  check(
    "G9_ad_no_remake",
    adJson.remakeEnqueued === false && /NO remake/i.test(adMd),
    `remakeEnqueued=${adJson.remakeEnqueued}`,
  );
  check("G9_ad_verdict", adJson.verdict === "approve" || adJson.verdict === "remarks", String(adJson.verdict));

  const html3 = await fs.readFile(path.join(smokeDir, "slide_03.html"), "utf8");
  check("G8_html_03_06", html3.includes("03/06"), "slide_03 has 03/06");
  check(
    "G5_html_brand_img",
    /class="brand"[\s\S]*?<img\s+src="data:image\//.test(html3) ||
      /<img\s+src="data:image\/png;base64,/.test(html3),
    "brand <img data-url> in HTML",
  );
  check(
    "G6_html_brand_font",
    html3.includes(".brand-name") && html3.includes("--cf-font-content"),
    "HTML brand-name token",
  );
  check(
    "G1_html_data_type_scale",
    html3.includes('data-type-scale="preset"') ||
      html3.includes("data-type-scale=\"fallback\""),
    "data-type-scale attr",
  );

  const failed = results.filter((r) => !r.pass);
  console.log(
    `\nSUMMARY ${results.filter((r) => r.pass).length}/${results.length} PASS`,
  );
  if (failed.length) {
    console.log("FAILED:", failed.map((f) => f.id).join(", "));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
