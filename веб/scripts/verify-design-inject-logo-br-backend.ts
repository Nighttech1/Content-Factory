/**
 * Backend self-check for wave 2026-10-18-design-inject-logo-br (not Tester G1–G10).
 *   npx tsx scripts/verify-design-inject-logo-br-backend.ts
 */
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
  buildDesignTokensPayload,
  createDarkNotesSeedPreset,
  parseDesignPresetFile,
} from "../lib/settings/design-preset";
import { htmlLayoutSchema } from "../lib/studio/carousel-json-contract";

const fails: string[] = [];
function ok(name: string, pass: boolean, detail?: string) {
  // eslint-disable-next-line no-console -- verify
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!pass) fails.push(name);
}

ok("pretty_01_06", formatPrettySlideNum(0, 6) === "01 / 06", formatPrettySlideNum(0, 6));
ok("pretty_06_06", formatPrettySlideNum(5, 6) === "06 / 06");
ok("logo_size_88", BRAND_LOGO_SIZE_PX === 88);
ok("default_chrome_br", DEFAULT_BRAND_CHROME === "bottom-right");

const fitUp = applyFontFitReduceOnly(40, { fontSizeOverride: 64, role: "primary" });
ok("fontFit_no_enlarge", fitUp.px === 40 && !fitUp.reduced, JSON.stringify(fitUp));
const fitDown = applyFontFitReduceOnly(40, {
  fontFit: { role: "primary", deltaPx: -8 },
});
ok("fontFit_reduce", fitDown.px === 32 && fitDown.reduced);
const fitPos = applyFontFitReduceOnly(40, { fontFit: { deltaPx: 12 } });
ok("fontFit_positive_ignored", fitPos.px === 40);

const allLeft = [0, 1, 2].map(() => synthesizeFallbackHtmlLayout("body", 0));
for (const l of allLeft) {
  l.text_block.anchor = "left";
  l.text_block.vertical = "top";
}
ok("variety_fail_all_left", !validateLayoutVariety(allLeft).ok);
const shuffled = softShuffleIdenticalAnchors(allLeft);
ok(
  "soft_shuffle",
  shuffled.shuffled && validateLayoutVariety(shuffled.layouts).ok,
);

const cover0 = synthesizeFallbackHtmlLayout("cover", 0);
const body1 = synthesizeFallbackHtmlLayout("body", 1);
const body2 = synthesizeFallbackHtmlLayout("body", 2);
ok("fallback_logo_br", cover0.logo?.placement === "bottom-right");
ok(
  "fallback_rotate",
  body1.text_block.anchor !== body2.text_block.anchor ||
    body1.text_block.vertical !== body2.text_block.vertical,
);

const br = htmlLayoutSchema.parse({
  template: "body_left",
  text_block: { anchor: "left", align: "left", safe: true },
  logo: { placement: "bottom-right" },
  brandChrome: "bottom-right",
  fontFit: { role: "body", deltaPx: -4, reason: "overflow" },
});
ok("zod_bottom_right", br.logo.placement === "bottom-right");
ok("zod_fontFit", br.fontFit?.deltaPx === -4);

const seed = createDarkNotesSeedPreset();
const payload = buildDesignTokensPayload(seed);
const roles = payload.roles as Record<
  string,
  { sizePx?: number; color?: string; family?: string }
>;
ok(
  "roles_title",
  Boolean(roles?.title?.family && roles?.title?.sizePx && roles?.title?.color),
);
ok(
  "roles_slideNumber",
  roles?.slideNumber?.sizePx ===
    (seed.typography.scale?.body ?? roles?.body?.sizePx),
);

const noScale = parseDesignPresetFile({
  ...seed,
  typography: { display: seed.typography.display, body: seed.typography.body },
});
ok("parse_fills_scale", Boolean(noScale?.typography.scale?.body));

const html = buildLayeredSlideHtml({
  slide: {
    primary_copy: "Test",
    secondary_copy: "Body copy here with enough value for the slide.",
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
ok("html_brand_br", /data-brand-chrome="bottom-right"/.test(html));
ok("html_logo_88", html.includes("88px"));
ok("html_transparent", /background:\s*transparent/.test(html));
ok("html_flex_row", /flex-direction:\s*row/.test(html));
ok("html_pretty", html.includes("01 / 06"));
ok("html_slide_num_left", /\.slide-num\s*\{[^}]*left:/s.test(html));
ok("html_brand_img", /class="brand"[^>]*>[\s\S]*?<img/i.test(html));
ok("html_name_after_img", /<img[^>]*>[\s\S]*?class="brand-name"/i.test(html));

if (fails.length) {
  // eslint-disable-next-line no-console -- verify
  console.error("FAILED", fails);
  process.exit(1);
}
// eslint-disable-next-line no-console -- verify
console.log("ALL BACKEND UNIT OK");
