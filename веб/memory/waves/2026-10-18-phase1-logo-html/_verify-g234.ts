/**
 * Tester one-shot G2/G3/G4 — not product code.
 * npx tsx memory/waves/2026-10-18-phase1-logo-html/_verify-g234.ts
 */
import { defaultBrandSettings } from "../../../lib/settings/brand-store";
import {
  createDarkNotesSeedPreset,
  parseDesignPresetFile,
} from "../../../lib/settings/design-preset";
import {
  buildLayeredSlideHtml,
  synthesizeFallbackHtmlLayout,
} from "../../../lib/studio/carousel-layered-composite";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const logoRef = defaultBrandSettings("tester-phase1").logoRef;
console.log("G2 logoRef=", logoRef);

const seed = createDarkNotesSeedPreset();
const preset = parseDesignPresetFile(seed) ?? seed;
const layout = synthesizeFallbackHtmlLayout("cover", 0);
layout.logo = { placement: "bottom-right" };
layout.brandChrome = "bottom-right";

const tinyBg =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const withLogo = buildLayeredSlideHtml({
  slide: {
    primary_copy: "T",
    layout_variant: "cover",
    html_layout: layout,
  },
  slideIndex0: 0,
  slideTotal: 2,
  backgroundUrl: tinyBg,
  preset,
  fontFaceCss: "",
  brand: {
    brandName: "Vernatun",
    logoUrl: "https://example.com/logo.png",
  },
});

const noLogo = buildLayeredSlideHtml({
  slide: {
    primary_copy: "T",
    layout_variant: "cover",
    html_layout: layout,
  },
  slideIndex0: 0,
  slideTotal: 2,
  backgroundUrl: tinyBg,
  preset,
  fontFaceCss: "",
  brand: { brandName: "Vernatun" },
});

const g3 =
  !/<div class="brand-name">/.test(withLogo) &&
  /<div class="brand"[^>]*>[\s\S]*?<img /i.test(withLogo);
const g4 = /class="brand-name">Vernatun</.test(noLogo);

console.log("G3 logoUrl → img only, no brand-name element=", g3);
console.log("G4 no logoUrl → brand-name present=", g4);

const storeSrc = readFileSync(
  path.join(process.cwd(), "lib/settings/brand-store.ts"),
  "utf8",
);
const g2src = /DEFAULT_LOGO_REF\s*=\s*"\/brand\/vernatun-logo\.png"/.test(
  storeSrc,
);
const pngOk = existsSync(
  path.join(process.cwd(), "public/brand/vernatun-logo.png"),
);

const fail = !(logoRef === "/brand/vernatun-logo.png" && g2src && g3 && g4 && pngOk);
console.log("ALL", fail ? "FAIL" : "PASS");
process.exitCode = fail ? 1 : 0;
