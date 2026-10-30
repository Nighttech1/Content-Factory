/**
 * Quick Backend unit checks for layout-copy composite (no live LLM).
 *   npx tsx scripts/verify-layout-copy-composite-unit.ts
 */

import assert from "node:assert/strict";

import { LAYOUT_MAP_RE_ORANGE } from "../lib/settings/design-presets/layout-copy-seeds";
import { SEED_RE_ORANGE_PRESET } from "../lib/settings/design-presets/layout-copy-seeds";
import {
  buildLayeredSlideHtml,
  resolveCharacterPlacement,
  shouldShowSlideNumber,
} from "../lib/studio/carousel-layered-composite";
import {
  isThinSecondaryCopy,
  SECONDARY_COPY_MIN_CHARS_BODY,
} from "../lib/studio/carousel-critic-05";

function main() {
  assert.equal(LAYOUT_MAP_RE_ORANGE.numberingGlobal, "absent");
  assert.equal(
    shouldShowSlideNumber(LAYOUT_MAP_RE_ORANGE, "cover", 0, 6),
    false,
  );
  assert.equal(
    shouldShowSlideNumber(LAYOUT_MAP_RE_ORANGE, "body_slide", 2, 6),
    false,
  );
  assert.equal(shouldShowSlideNumber(null, "cover", 0, 6), true);

  assert.equal(
    resolveCharacterPlacement(null, "cover", 0, true, {
      characterPaint: "in_image",
      slideTotal: 6,
    }),
    "none",
  );
  assert.equal(
    resolveCharacterPlacement(null, "cover", 0, true, {
      characterPaint: "overlay_cutout",
      slideTotal: 6,
    }),
    "right-cutout",
  );
  assert.equal(
    resolveCharacterPlacement(null, "cta_slide", 5, true, {
      characterPaint: "overlay_cutout",
      slideTotal: 6,
    }),
    "right-cutout",
  );
  assert.equal(
    resolveCharacterPlacement(null, "body_slide", 2, true, {
      characterPaint: "overlay_cutout",
      slideTotal: 6,
    }),
    "none",
  );

  const thin = "Короткий текст. Ещё одно.";
  assert.equal(isThinSecondaryCopy(thin, "body_slide"), true);
  assert.ok(SECONDARY_COPY_MIN_CHARS_BODY >= 220);

  const wide =
    "Сначала выпиши три продукта, которые уже есть дома. Потом собери один обед за 15 минут без магазина — например омлет с зеленью и хлеб. Если осталось время, заморозь порцию на завтра. Так ты экономишь и деньги, и нервы в будни. Последний шаг: фото результата в заметки — через неделю увидишь паттерн.";
  assert.equal(isThinSecondaryCopy(wide, "body_slide"), false);

  const html = buildLayeredSlideHtml({
    slide: {
      primary_copy: "Test hook here",
      secondary_copy: wide,
      layout_variant: "cover",
    },
    slideIndex0: 0,
    slideTotal: 6,
    backgroundUrl: "data:image/png;base64,AA==",
    preset: SEED_RE_ORANGE_PRESET,
    fontFaceCss: "",
    brand: { brandName: "Vernatun" },
    layoutMap: LAYOUT_MAP_RE_ORANGE,
    characterPaint: "in_image",
  });
  assert.ok(!html.includes('class="slide-num"'), "numbering absent → no slide-num");
  assert.ok(html.includes('data-brand-chrome="top-left"') || html.includes("top-left"));

  // eslint-disable-next-line no-console -- unit
  console.log("[verify-layout-copy-composite-unit] OK");
}

main();
