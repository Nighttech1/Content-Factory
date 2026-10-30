/**
 * Wave 2026-10-18-logo-placement-v2 — 6-slide re-composite smoke.
 * Reuses bg plates from vision-style-copy (or phase1 HTML) — no paid image gen.
 *
 * Asserts: transparent logo; cover+last top-left; body bottom-left;
 * BRAND_LOGO_SIZE_PX=176; logo-only (no .brand-name).
 *
 *   npx tsx scripts/smoke-logo-placement-v2.ts
 *
 * Output: docs/карусель тест/logo-placement-v2-smoke/
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  createDarkNotesSeedPreset,
  parseDesignPresetFile,
} from "../lib/settings/design-preset";
import {
  BRAND_LOGO_SIZE_PX,
  buildLayeredSlideHtml,
  defaultLogoPlacementForRole,
  resolveAssetUrlForPlaywright,
  synthesizeFallbackHtmlLayout,
} from "../lib/studio/carousel-layered-composite";
import { normalizeCarouselSlideRole } from "../types/design";

const SRC_CANDIDATES = [
  path.join(
    process.cwd(),
    "docs",
    "карусель тест",
    "vision-style-copy-smoke-A-in-image-6",
  ),
  path.join(
    process.cwd(),
    "docs",
    "карусель тест",
    "phase1-logo-html-smoke",
  ),
];

const OUT_DIR = path.join(
  process.cwd(),
  "docs",
  "карусель тест",
  "logo-placement-v2-smoke",
);
const LOGO_PNG = path.join(process.cwd(), "public", "brand", "vernatun-logo.png");
const SLIDES = 6;

function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractBgDataUri(html: string): string | null {
  const m = html.match(/background-image:\s*url\("([^"]+)"\)/);
  if (!m?.[1]?.startsWith("data:image")) return null;
  return m[1];
}

function extractCopy(html: string, className: string): string {
  const re = new RegExp(
    `class="${className}"[^>]*>([\\s\\S]*?)</div>`,
    "i",
  );
  const m = html.match(re);
  return m ? stripTags(m[1]) : "";
}

function roleVariantForIndex(
  i0: number,
  total: number,
): "cover" | "body" | "cta" {
  if (i0 === 0) return "cover";
  if (i0 === total - 1) return "cta";
  return "body";
}

async function fileToDataUri(absPath: string): Promise<string> {
  const buf = await readFile(absPath);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

async function screenshotHtmlToPng(html: string, outPath: string) {
  const playwright = await import("playwright");
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 1080, height: 1350 },
      deviceScaleFactor: 1,
    });
    await page.setContent(html, { waitUntil: "load", timeout: 90_000 });
    await page.screenshot({
      path: outPath,
      type: "png",
      clip: { x: 0, y: 0, width: 1080, height: 1350 },
    });
    await page.close();
  } finally {
    await browser.close();
  }
}

async function assertLogoHasAlpha(absPath: string): Promise<{
  ok: boolean;
  note: string;
}> {
  const sharp = (await import("sharp")).default;
  const { data, info } = await sharp(absPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let transparent = 0;
  for (let i = 3; i < data.length; i += info.channels) {
    if (data[i]! < 16) transparent += 1;
  }
  const ok = transparent > 1000;
  return {
    ok,
    note: `transparentPixels≈${transparent} · ${info.width}×${info.height}`,
  };
}

async function main() {
  if (!existsSync(LOGO_PNG)) {
    throw new Error(`Missing ${LOGO_PNG}`);
  }
  const SRC_DIR = SRC_CANDIDATES.find((d) => existsSync(d));
  if (!SRC_DIR) {
    throw new Error(
      `Missing source smoke dirs: ${SRC_CANDIDATES.join(" | ")}`,
    );
  }

  await mkdir(OUT_DIR, { recursive: true });

  const logoFileUrl = resolveAssetUrlForPlaywright("/brand/vernatun-logo.png");
  if (!logoFileUrl) throw new Error("resolveAssetUrlForPlaywright failed");
  const logoUrl = await fileToDataUri(LOGO_PNG);

  const alpha = await assertLogoHasAlpha(LOGO_PNG);
  const asserts: string[] = [];
  asserts.push(
    alpha.ok
      ? `PASS logo alpha: ${alpha.note}`
      : `FAIL logo alpha: ${alpha.note}`,
  );
  asserts.push(
    BRAND_LOGO_SIZE_PX === 176
      ? "PASS BRAND_LOGO_SIZE_PX=176"
      : `FAIL BRAND_LOGO_SIZE_PX=${BRAND_LOGO_SIZE_PX}`,
  );

  const seed = createDarkNotesSeedPreset();
  const preset = parseDesignPresetFile(seed) ?? seed;

  const placementBySlide: Record<string, string> = {};
  let brandNameHits = 0;
  const pngSizes: Record<string, number> = {};

  for (let i = 1; i <= SLIDES; i++) {
    const n = String(i).padStart(2, "0");
    const srcHtmlPath = path.join(SRC_DIR, `slide_${n}.html`);
    if (!existsSync(srcHtmlPath)) {
      throw new Error(`Missing ${srcHtmlPath}`);
    }
    const srcHtml = await readFile(srcHtmlPath, "utf8");
    const bg = extractBgDataUri(srcHtml);
    if (!bg) throw new Error(`No bg data URI in ${srcHtmlPath}`);

    const primary =
      extractCopy(srcHtml, "primary") || `Slide ${i} · logo-placement-v2`;
    const secondary = extractCopy(srcHtml, "secondary");
    const i0 = i - 1;
    const roleVar = roleVariantForIndex(i0, SLIDES);
    const role = normalizeCarouselSlideRole(roleVar, i0, SLIDES);
    const expected = defaultLogoPlacementForRole(role, i0, SLIDES);
    const layout = synthesizeFallbackHtmlLayout(role, i0);
    // Do NOT force old BR — let role SoT + resolveLogoPlacement win

    const html = buildLayeredSlideHtml({
      slide: {
        primary_copy: primary,
        secondary_copy: secondary || undefined,
        layout_variant: roleVar,
        html_layout: layout,
        cta_type: roleVar === "cta" ? 2 : null,
      },
      slideIndex0: i0,
      slideTotal: SLIDES,
      backgroundUrl: bg,
      preset,
      fontFaceCss: "",
      brand: {
        brandName: "Vernatun",
        logoUrl,
      },
    });

    const placementMatch =
      new RegExp(`data-placement="${expected}"`).test(html) &&
      new RegExp(`data-brand-chrome="${expected}"`).test(html);
    placementBySlide[`slide_${n}`] = expected;
    asserts.push(
      placementMatch
        ? `PASS slide_${n} (${role}): ${expected}`
        : `FAIL slide_${n} (${role}): expected ${expected}`,
    );

    if (/<div class="brand-name">/.test(html)) {
      asserts.push(`FAIL slide_${n}: <div class="brand-name"> despite logoUrl`);
      brandNameHits += 1;
    } else {
      asserts.push(`PASS slide_${n}: no brand-name element`);
    }
    if (!/<div class="brand"[^>]*>[\s\S]*?<img /i.test(html)) {
      asserts.push(`FAIL slide_${n}: brand <img> missing`);
    } else {
      asserts.push(`PASS slide_${n}: brand <img> present`);
    }

    const sizeInCss =
      html.includes(`max-width: ${BRAND_LOGO_SIZE_PX}px`) ||
      html.includes(`max-height: ${BRAND_LOGO_SIZE_PX}px`);
    asserts.push(
      sizeInCss
        ? `PASS slide_${n}: CSS size ${BRAND_LOGO_SIZE_PX}px`
        : `FAIL slide_${n}: CSS size missing ${BRAND_LOGO_SIZE_PX}`,
    );

    const outHtml = path.join(OUT_DIR, `slide_${n}.html`);
    const outPng = path.join(OUT_DIR, `slide_${n}.png`);
    await writeFile(outHtml, html, "utf8");
    await screenshotHtmlToPng(html, outPng);
    const bytes = (await readFile(outPng)).byteLength;
    pngSizes[`slide_${n}.png`] = bytes;
    // eslint-disable-next-line no-console -- smoke
    console.log(
      `[logo-placement-v2] slide_${n}.png ${bytes} bytes · ${expected}`,
    );
  }

  const readme = [
    "# logo-placement-v2-smoke",
    "",
    "Wave: `2026-10-18-logo-placement-v2`",
    `Source bg: \`${path.basename(SRC_DIR)}\` (embedded data URI plates)`,
    "Logo: `public/brand/vernatun-logo.png` (transparent, stripped black matte)",
    "",
    "## Placement (HARD)",
    "- cover (slide 01) → **top-left**",
    "- body (02–05) → **bottom-left**",
    "- last / cta (06) → **top-left**",
    "",
    `## Size: BRAND_LOGO_SIZE_PX = ${BRAND_LOGO_SIZE_PX}`,
    "",
    "## Asserts",
    ...asserts.map((a) => `- ${a}`),
    "",
    `brandName chrome hits with logoUrl: ${brandNameHits} (expect 0)`,
    `logo file URL resolve: ${logoFileUrl}`,
    "",
    "## PNG sizes",
    ...Object.entries(pngSizes).map(([k, v]) => `- ${k}: ${v} bytes`),
    "",
  ].join("\n");
  await writeFile(path.join(OUT_DIR, "README.md"), readme, "utf8");
  await writeFile(
    path.join(OUT_DIR, "asserts.json"),
    JSON.stringify(
      {
        asserts,
        brandNameHits,
        logoFileUrl,
        placementBySlide,
        pngSizes,
        BRAND_LOGO_SIZE_PX,
        srcDir: SRC_DIR,
        alpha,
      },
      null,
      2,
    ),
    "utf8",
  );

  const failed = asserts.filter((a) => a.startsWith("FAIL"));
  // eslint-disable-next-line no-console -- smoke
  console.log("[logo-placement-v2] DONE", {
    outDir: OUT_DIR,
    failed: failed.length,
    brandNameHits,
    placementBySlide,
    BRAND_LOGO_SIZE_PX,
  });
  if (failed.length || brandNameHits > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console -- smoke
  console.error("[logo-placement-v2] fatal", err);
  process.exitCode = 1;
});
