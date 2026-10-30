/**
 * Wave 2026-10-18-design-inject-logo-br — Tester G1–G10 guards.
 *   npx tsx scripts/verify-design-inject-logo-br-guards.ts
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import {
  ensureDeconstructFullTokens,
  DECONSTRUCT_FALLBACK_SCALE,
} from "../lib/agents/deconstructStyle";
import {
  buildDesignTokensPayload,
  createDarkNotesSeedPreset,
  ensurePresetTypographyScale,
  parseDesignPresetFile,
} from "../lib/settings/design-preset";
import {
  isThinSecondaryCopy,
  SECONDARY_COPY_MIN_CHARS_BODY,
  SECONDARY_COPY_MIN_CLAUSES_BODY,
} from "../lib/studio/carousel-critic-05";
import {
  BRAND_LOGO_SIZE_PX,
  DEFAULT_BRAND_CHROME,
  applyFontFitReduceOnly,
  buildLayeredSlideHtml,
  formatPrettySlideNum,
  softShuffleIdenticalAnchors,
  synthesizeFallbackHtmlLayout,
  validateLayoutVariety,
} from "../lib/studio/carousel-layered-composite";
import {
  formatFullDesignTokensInjectBlock,
  resolveCreateCarouselOverlay,
  VISUAL_PROMPT_RICHNESS_HARD,
} from "../lib/studio/create-carousel-prompts";

type Row = { id: string; pass: boolean; detail: string };
const results: Row[] = [];

function check(id: string, pass: boolean, detail: string) {
  results.push({ id, pass, detail });
  // eslint-disable-next-line no-console -- verify
  console.log(`${pass ? "PASS" : "FAIL"} ${id} — ${detail}`);
}

function findSmokeDir(): string {
  return path.join(
    process.cwd(),
    "docs",
    "карусель тест",
    "design-inject-logo-br-smoke-6",
  );
}

async function main() {
  const seed = createDarkNotesSeedPreset();
  const payload = buildDesignTokensPayload(seed);
  const roles = payload.roles as Record<
    string,
    { family?: string; sizePx?: number; color?: string }
  >;

  // —— G1 FULL role table ——
  check(
    "G1_roles_title",
    Boolean(roles?.title?.family && roles?.title?.sizePx && roles?.title?.color),
    JSON.stringify(roles?.title),
  );
  check(
    "G1_roles_body",
    Boolean(roles?.body?.family && roles?.body?.sizePx && roles?.body?.color),
    JSON.stringify(roles?.body),
  );
  check(
    "G1_roles_slideNumber_body",
    roles?.slideNumber?.sizePx === roles?.body?.sizePx &&
      roles?.slideNumber?.family === roles?.body?.family &&
      Boolean(roles?.slideNumber?.color),
    JSON.stringify(roles?.slideNumber),
  );
  check(
    "G1_paletteMood",
    typeof payload.paletteMood === "string" &&
      String(payload.paletteMood).length > 20,
    String(payload.paletteMood).slice(0, 120),
  );

  // —— G2 positive FULL DESIGN inject, no sole 64px negatives ——
  const paletteJson = JSON.stringify({
    colors: seed.colors,
    typography: {
      display: seed.typography.display,
      body: seed.typography.body,
      mono: seed.typography.mono,
      scale: seed.typography.scale,
    },
    roles: payload.roles,
  });
  const inject = formatFullDesignTokensInjectBlock(null, {
    sourceLabel: "tester-fixture",
    paletteJsonExcerpt: paletteJson,
  });
  check(
    "G2_full_heading",
    inject.includes("## FULL DESIGN TOKENS (HARD)"),
    inject.slice(0, 80),
  );
  check(
    "G2_positive_px",
    /\*\*\d+px\*\*/.test(inject) || /\d+px/.test(inject),
    "has numeric px in role table",
  );
  check(
    "G2_no_do_not_assume_64",
    !/do\s+NOT\s+assume\s+64/i.test(inject) &&
      !/do\s+not\s+assume\s+64/i.test(inject),
    "inject free of «do NOT assume 64px»",
  );
  const overlay = String(
    resolveCreateCarouselOverlay("designer", "draw", {
      placeholders: { designPaletteJson: paletteJson },
    }) ?? "",
  );
  check(
    "G2_designer_overlay_full",
    overlay.includes("## FULL DESIGN TOKENS (HARD)") &&
      !/do\s+NOT\s+assume\s+64/i.test(overlay),
    `len=${overlay.length} hasFull=${overlay.includes("FULL DESIGN TOKENS")}`,
  );

  // —— G3 motifs optional ——
  const vp = String(VISUAL_PROMPT_RICHNESS_HARD);
  check(
    "G3_motifs_optional",
    /optional/i.test(vp) &&
      /FORBIDDEN laundry list/i.test(vp) &&
      /khachkar/i.test(vp),
    "motifs optional + laundry list forbidden",
  );
  check(
    "G3_ge3_elements",
    /≥\s*3|>=\s*3|at least 3/i.test(vp),
    "≥3 concrete scene elements kept",
  );

  // —— G4 secondary_copy richness ——
  check(
    "G4_critic_bar_consts",
    SECONDARY_COPY_MIN_CHARS_BODY === 120 &&
      SECONDARY_COPY_MIN_CLAUSES_BODY === 3,
    `chars=${SECONDARY_COPY_MIN_CHARS_BODY} clauses=${SECONDARY_COPY_MIN_CLAUSES_BODY}`,
  );
  check(
    "G4_thin_fails",
    isThinSecondaryCopy("Короткий stub.", "body"),
    "thin stub → thin",
  );
  check(
    "G4_rich_passes",
    !isThinSecondaryCopy(
      "Сначала выберите одно слово на день. Потом повторите его в игре за ужином. Через неделю ребёнок сам напомнит — это и есть привычка без ссор.",
      "body",
    ),
    "rich body → not thin",
  );
  check(
    "G4_overlay_rich_wording",
    /2–3× richer|2-3× richer|secondary_copy_rich/i.test(overlay) ||
      /2–3× richer|secondary_copy/.test(
        String(
          resolveCreateCarouselOverlay("scriptwriter", "generate", {}) ?? "",
        ),
      ),
    "SW/Designer overlay mentions rich secondary",
  );

  // —— G5 logo chrome BR ——
  check("G5_default_chrome", DEFAULT_BRAND_CHROME === "bottom-right", DEFAULT_BRAND_CHROME);
  check("G5_logo_88", BRAND_LOGO_SIZE_PX === 88, String(BRAND_LOGO_SIZE_PX));
  const cover0 = synthesizeFallbackHtmlLayout("cover", 0);
  const html = buildLayeredSlideHtml({
    slide: {
      primary_copy: "Test headline",
      secondary_copy:
        "Value beat with a concrete example and a micro-instruction so the body is not thin air.",
      layout_variant: "cover",
      html_layout: cover0,
    },
    slideIndex0: 0,
    slideTotal: 6,
    backgroundUrl: "data:image/png;base64,xx",
    preset: seed,
    fontFaceCss: "",
    brand: { brandName: "Vernatun", logoUrl: "file:///tmp/logo.png" },
  });
  check(
    "G5_html_brand_br",
    /data-brand-chrome="bottom-right"/.test(html) &&
      /bottom:\s*44px/.test(html) &&
      /right:\s*\d+px/.test(html),
    "brand bottom-right positioning",
  );
  check(
    "G5_html_88_transparent_row",
    html.includes("88px") &&
      /background:\s*transparent/.test(html) &&
      /flex-direction:\s*row/.test(html),
    "88 + transparent + flex row",
  );
  check(
    "G5_name_right_of_icon",
    /<img[^>]*>[\s\S]*?class="brand-name"/i.test(html),
    "name after img in brand row",
  );

  // —— G6 slide-num body tokens + pretty N / M ——
  check(
    "G6_pretty_spaced",
    formatPrettySlideNum(2, 6) === "03 / 06" &&
      formatPrettySlideNum(0, 6) === "01 / 06" &&
      formatPrettySlideNum(5, 6) === "06 / 06",
    formatPrettySlideNum(2, 6),
  );
  check(
    "G6_html_own_slot",
    /class="slide-num"/.test(html) && html.includes("01 / 06"),
    "own .slide-num + pretty",
  );
  check(
    "G6_slide_num_body_font",
    /\.slide-num\s*\{[^}]*font-family:\s*var\(--cf-font-body\)/s.test(html),
    "slide-num uses body font",
  );
  check(
    "G6_opposite_corner",
    /\.slide-num\s*\{[^}]*left:\s*\d+px/s.test(html),
    "num left when logo BR",
  );

  // —— G7 fontFit reduce-only ——
  const fitUp = applyFontFitReduceOnly(40, {
    fontSizeOverride: 64,
    role: "primary",
  });
  check(
    "G7_no_enlarge",
    fitUp.px === 40 && !fitUp.reduced,
    JSON.stringify(fitUp),
  );
  const fitDown = applyFontFitReduceOnly(40, {
    fontFit: { role: "primary", deltaPx: -8 },
  });
  check(
    "G7_reduce",
    fitDown.px === 32 && fitDown.reduced,
    JSON.stringify(fitDown),
  );
  const fitPos = applyFontFitReduceOnly(40, { fontFit: { deltaPx: 12 } });
  check(
    "G7_positive_ignored",
    fitPos.px === 40,
    JSON.stringify(fitPos),
  );

  // —— G8 deconstruct → scale → FULL payload ——
  const colorsOnly = parseDesignPresetFile({
    id: "fixture-deconstruct",
    preset: "dark_notes",
    name: "Fixture",
    colors: seed.colors,
    typography: {
      display: seed.typography.display,
      body: seed.typography.body,
    },
    components: seed.components,
  });
  check("G8_parse_fills_scale", Boolean(colorsOnly?.typography.scale?.body), "parse soft-fill");
  const filled = ensureDeconstructFullTokens(
    colorsOnly ??
      ({
        ...seed,
        typography: {
          display: seed.typography.display,
          body: seed.typography.body,
        },
      } as typeof seed),
  );
  check(
    "G8_deconstruct_scale",
    Boolean(filled.typography.scale?.cover && filled.typography.scale?.body),
    JSON.stringify(filled.typography.scale),
  );
  const belted = ensurePresetTypographyScale(filled);
  const roundTrip = buildDesignTokensPayload(belted);
  const rtRoles = roundTrip.roles as Record<
    string,
    { sizePx?: number; color?: string; family?: string }
  >;
  check(
    "G8_payload_roles_nonnull",
    Boolean(
      rtRoles?.title?.sizePx &&
        rtRoles?.title?.color &&
        rtRoles?.body?.sizePx &&
        rtRoles?.body?.color,
    ),
    JSON.stringify({ title: rtRoles?.title, body: rtRoles?.body }),
  );
  check(
    "G8_fallback_scale_const",
    DECONSTRUCT_FALLBACK_SCALE.body > 0,
    JSON.stringify(DECONSTRUCT_FALLBACK_SCALE),
  );

  // —— G9 layout variety ——
  const allLeft = [0, 1, 2].map(() => synthesizeFallbackHtmlLayout("body", 0));
  for (const l of allLeft) {
    l.text_block.anchor = "left";
    l.text_block.vertical = "top";
  }
  check(
    "G9_variety_fail_identical",
    !validateLayoutVariety(allLeft).ok,
    "identical top-left fails",
  );
  const shuffled = softShuffleIdenticalAnchors(allLeft);
  check(
    "G9_soft_shuffle",
    shuffled.shuffled && validateLayoutVariety(shuffled.layouts).ok,
    "soft-shuffle restores variety",
  );
  const b1 = synthesizeFallbackHtmlLayout("body", 1);
  const b2 = synthesizeFallbackHtmlLayout("body", 2);
  check(
    "G9_fallback_rotate",
    b1.text_block.anchor !== b2.text_block.anchor ||
      b1.text_block.vertical !== b2.text_block.vertical,
    `b1=${b1.text_block.anchor}/${b1.text_block.vertical} b2=${b2.text_block.anchor}/${b2.text_block.vertical}`,
  );
  check(
    "G9_fallback_logo_br",
    cover0.logo?.placement === "bottom-right" ||
      cover0.brandChrome === "bottom-right",
    JSON.stringify({ logo: cover0.logo, brandChrome: cover0.brandChrome }),
  );

  // —— G10 smoke 6 PNG + spot-checks ——
  const smokeDir = findSmokeDir();
  let pngCount = 0;
  const frameTemplates = new Set<string>();
  const flexLayouts = new Set<string>();
  let prettyOk = true;
  let brandBrOk = true;
  let chromeOk = true;
  try {
    const entries = await fs.readdir(smokeDir);
    const pngs = entries.filter((e) => /^slide_\d+\.png$/i.test(e)).sort();
    pngCount = pngs.length;
    for (let i = 1; i <= 6; i++) {
      const n = String(i).padStart(2, "0");
      const htmlPath = path.join(smokeDir, `slide_${n}.html`);
      const htmlBody = await fs.readFile(htmlPath, "utf8");
      const pretty = `${n} / 06`;
      if (!htmlBody.includes(pretty)) prettyOk = false;
      if (!/data-brand-chrome="bottom-right"/.test(htmlBody)) brandBrOk = false;
      if (
        !htmlBody.includes("88px") ||
        !/background:\s*transparent/.test(htmlBody) ||
        !/flex-direction:\s*row/.test(htmlBody) ||
        !/<img/i.test(htmlBody)
      ) {
        chromeOk = false;
      }
      // Prefer frame attr (file may embed a second data-template elsewhere)
      const tm = htmlBody.match(
        /<div class="frame"[^>]*\bdata-template="([^"]+)"/,
      );
      if (tm?.[1]) frameTemplates.add(tm[1]);
      const safeBlock = htmlBody.match(/\.safe\s*\{([^}]+)\}/);
      if (safeBlock?.[1]) {
        const j = safeBlock[1].match(/justify-content:\s*([^\s;]+)/)?.[1];
        const a = safeBlock[1].match(/align-items:\s*([^\s;]+)/)?.[1];
        if (j || a) flexLayouts.add(`${j ?? "?"}/${a ?? "?"}`);
      }
    }
  } catch (e) {
    check("G10_smoke_dir", false, `cannot read ${smokeDir}: ${e}`);
  }
  check("G10_smoke_6_png", pngCount === 6, `pngCount=${pngCount} dir=${smokeDir}`);
  check("G10_smoke_pretty_nm", prettyOk, "01 / 06 … 06 / 06 in HTML");
  check("G10_smoke_logo_br", brandBrOk && chromeOk, "BR + 88 + transparent + img");
  check(
    "G10_smoke_layout_variety",
    frameTemplates.size >= 3 || flexLayouts.size >= 3,
    `templates=${[...frameTemplates].join(",")} flex=${[...flexLayouts].join(",")}`,
  );

  const pass = results.filter((r) => r.pass).length;
  const fail = results.filter((r) => !r.pass).length;
  // eslint-disable-next-line no-console -- verify
  console.log(`SUMMARY ${pass}/${results.length} PASS` + (fail ? ` (${fail} FAIL)` : ""));
  if (fail) process.exit(1);
}

main().catch((e) => {
  // eslint-disable-next-line no-console -- verify
  console.error(e);
  process.exit(1);
});
