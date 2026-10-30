/**
 * Phase 2 unit guards — no paid image gen.
 *   npx tsx scripts/verify-phase2-vision-prompt-unit.ts
 */

import {
  BRAND_EMBLEM_REF,
  BRAND_LOGO_SIZE_PX,
  buildLayeredSlideHtml,
  resolveLogoTextColor,
  synthesizeFallbackHtmlLayout,
} from "../lib/studio/carousel-layered-composite";
import { htmlLayoutSchema } from "../lib/studio/carousel-json-contract";
import {
  assertBackgroundOnlyPrompt,
  assertVisionRefPromptBanClean,
  buildVisionRefBackgroundImagePrompt,
  extractVisionRefVisualSubject,
  LAYERED_HTML_DESIGNER_OVERLAY_VISION_REF,
  VISION_STYLE_COPY_HARD,
} from "../lib/studio/create-carousel-prompts";
import { createDarkNotesSeedPreset, parseDesignPresetFile } from "../lib/settings/design-preset";
import { normalizeCarouselSlideRole } from "../types/design";
import { existsSync } from "node:fs";
import path from "node:path";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function main() {
  // —— IMAGE prompt scrub ——
  const prompt = buildVisionRefBackgroundImagePrompt({
    visualPrompt: "Светлая кухня с абрикосами и большим столом на весь кадр",
    primaryCopy: "Армянский стол",
    slideIndex0: 0,
    slideTotal: 6,
    characterPaint: "in_image",
    forceConductor: true,
  });
  assert(!/#FF5A1F/i.test(prompt), "no forced #FF5A1F");
  assert(
    !/Photoreal\/CGI single object/i.test(prompt),
    "no positive Photoreal/CGI lock",
  );
  assert(
    !/SOLID bright orange|SOLID clean white plate/i.test(prompt),
    "no idx%2 plate lock",
  );
  assert(
    !/like the single house|MATCH attached reference layout: solid color plate \+ ONE isolated/i.test(
      prompt,
    ),
    "no house-object lock",
  );
  assert(/HARD-COPY|ATTACHED IMAGE/i.test(prompt), "etalon HARD-COPY lead");
  assert(/same drawing language as etalon/i.test(prompt), "soft conductor");
  assert(/not 3D Pixar invent/i.test(prompt), "hygiene soft conductor");
  const bgOk = assertBackgroundOnlyPrompt(prompt);
  assert(bgOk.ok, `sanitize ban present: ${!bgOk.ok ? bgOk.reason : ""}`);

  const subject = extractVisionRefVisualSubject(
    "Светлая кухня с абрикосами на весь кадр",
    "Армянский стол",
  );
  assert(!/^светлая\s+кухня/i.test(subject), `subject scrub kitchen opener got: ${subject}`);

  // —— Designer overlay ban + logoTextColor contract ——
  const overlay = [
    LAYERED_HTML_DESIGNER_OVERLAY_VISION_REF,
    VISION_STYLE_COPY_HARD,
  ].join("\n");
  const ban = assertVisionRefPromptBanClean(overlay);
  assert(ban.ok, `overlay ban: ${!ban.ok ? ban.reason : ""}`);
  assert(/logo\.textColor/i.test(overlay), "Designer asks logo.textColor");

  // —— Schema aliases ——
  const parsed = htmlLayoutSchema.parse({
    template: "body_left",
    text_block: { anchor: "left", align: "left", safe: true },
    logoTextColor: "FFFFFF",
    brandChrome: "top-left",
  });
  assert(
    (parsed.logo as { textColor?: string }).textColor === "#FFFFFF" ||
      (parsed.logo as { textColor?: string }).textColor === "FFFFFF",
    `logoTextColor alias → got ${JSON.stringify(parsed.logo)}`,
  );

  const withHash = htmlLayoutSchema.parse({
    template: "cover_center",
    text_block: { anchor: "center", align: "center", safe: true },
    logo: { placement: "top-left", text_color: "#1A1A1A" },
  });
  assert(
    (withHash.logo as { textColor?: string }).textColor === "#1A1A1A",
    "text_color nested alias",
  );

  // —— Path A composite ——
  assert(BRAND_LOGO_SIZE_PX === 200, `size=${BRAND_LOGO_SIZE_PX}`);
  const emblem = path.join(process.cwd(), "public", "brand", "vernatun-emblem.png");
  assert(existsSync(emblem), `missing ${BRAND_EMBLEM_REF}`);

  const seed = createDarkNotesSeedPreset();
  const preset = parseDesignPresetFile(seed) ?? seed;
  const role = normalizeCarouselSlideRole("cover", 0, 6);
  const layout = synthesizeFallbackHtmlLayout(role, 0);
  layout.layoutMapSource = "vision_ref";
  layout.logo = { placement: "top-left", textColor: "#00FFAA" };

  const color = resolveLogoTextColor(layout, {
    slideIndex0: 0,
    layoutMapSource: "vision_ref",
  });
  assert(color === "#00FFAA", `resolveLogoTextColor=${color}`);

  const html = buildLayeredSlideHtml({
    slide: {
      primary_copy: "Phase 2 cover",
      secondary_copy: "logoTextColor + emblem wordmark",
      html_layout: layout,
    },
    slideIndex0: 0,
    slideTotal: 6,
    backgroundUrl: "data:image/png;base64,iVBORw0KGgo=",
    preset,
    fontFaceCss: "",
    brand: {
      brandName: "VERNATUN",
      logoUrl: "data:image/png;base64,emblem",
      splitEmblemWordmark: true,
    },
  });
  assert(html.includes('data-logo-mode="emblem_wordmark"'), "emblem_wordmark mode");
  assert(html.includes('data-logo-text-color="#00FFAA"'), "textColor attr");
  assert(html.includes("brand-name") && html.includes("VERNATUN"), "HTML wordmark");
  assert(html.includes("max-width: 200px"), "size 200");
  assert(!/Manrope/i.test(html), "no Manrope in composite HTML");
  assert(!/@font-face[\s\S]*Manrope/i.test(html), "no Manrope face");

  // eslint-disable-next-line no-console -- unit
  console.log("[verify-phase2-vision-prompt-unit] OK");
}

main();
