/**
 * Phase 1 — Vernatun wordmark HTML logo re-composite smoke.
 * Reuses bg plates embedded in vision-style-copy-smoke-A-in-image-6 HTML
 * (no paid image gen). Rebuilds overlay with /brand/vernatun-logo.png → img ONLY.
 *
 *   npx tsx scripts/smoke-phase1-logo-recomposite.ts
 *
 * Output: docs/карусель тест/phase1-logo-html-smoke/
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  createDarkNotesSeedPreset,
  parseDesignPresetFile,
} from "../lib/settings/design-preset";
import {
  buildLayeredSlideHtml,
  resolveAssetUrlForPlaywright,
  synthesizeFallbackHtmlLayout,
} from "../lib/studio/carousel-layered-composite";

const SRC_DIR = path.join(
  process.cwd(),
  "docs",
  "карусель тест",
  "vision-style-copy-smoke-A-in-image-6",
);
const OUT_DIR = path.join(
  process.cwd(),
  "docs",
  "карусель тест",
  "phase1-logo-html-smoke",
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

function roleForIndex(i0: number, total: number): "cover" | "body" | "cta" {
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

async function main() {
  if (!existsSync(LOGO_PNG)) {
    throw new Error(`Missing ${LOGO_PNG}`);
  }
  if (!existsSync(SRC_DIR)) {
    throw new Error(`Missing source smoke dir ${SRC_DIR}`);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const logoFileUrl = resolveAssetUrlForPlaywright("/brand/vernatun-logo.png");
  if (!logoFileUrl) throw new Error("resolveAssetUrlForPlaywright failed for logo");
  // Playwright setContent: embed data URI (file:// flaky)
  const logoUrl = await fileToDataUri(LOGO_PNG);

  const seed = createDarkNotesSeedPreset();
  const preset = parseDesignPresetFile(seed) ?? seed;

  const asserts: string[] = [];
  let brandNameHits = 0;

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
      extractCopy(srcHtml, "primary") || `Slide ${i} · Vernatun smoke`;
    const secondary = extractCopy(srcHtml, "secondary");
    const i0 = i - 1;
    const role = roleForIndex(i0, SLIDES);
    const layout = synthesizeFallbackHtmlLayout(role, i0);
    layout.logo = { placement: "bottom-right" };
    layout.brandChrome = "bottom-right";

    const html = buildLayeredSlideHtml({
      slide: {
        primary_copy: primary,
        secondary_copy: secondary || undefined,
        layout_variant: role,
        html_layout: layout,
        cta_type: role === "cta" ? 2 : null,
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

    // CSS may keep `.brand-name {…}` for name-only fallback — assert the element, not the rule.
    if (/<div class="brand-name">/.test(html)) {
      asserts.push(`FAIL slide_${n}: <div class="brand-name"> despite logoUrl`);
    } else {
      asserts.push(`PASS slide_${n}: no brand-name element`);
    }
    if (!/<div class="brand"[^>]*>[\s\S]*?<img /i.test(html)) {
      asserts.push(`FAIL slide_${n}: brand <img> missing`);
    } else {
      asserts.push(`PASS slide_${n}: brand <img> present`);
    }
    // Visible text chrome should not include standalone Vernatun next to mark
    if (/class="brand-name">\s*Vernatun/i.test(html)) {
      brandNameHits += 1;
    }

    const outHtml = path.join(OUT_DIR, `slide_${n}.html`);
    const outPng = path.join(OUT_DIR, `slide_${n}.png`);
    await writeFile(outHtml, html, "utf8");
    await screenshotHtmlToPng(html, outPng);
    const bytes = (await readFile(outPng)).byteLength;
    // eslint-disable-next-line no-console -- smoke
    console.log(`[phase1-logo] slide_${n}.png ${bytes} bytes`);
  }

  // Fallback fixture: no logoUrl → .brand-name OK
  const fallbackHtml = buildLayeredSlideHtml({
    slide: {
      primary_copy: "Fallback name-only",
      layout_variant: "cover",
      html_layout: synthesizeFallbackHtmlLayout("cover", 0),
    },
    slideIndex0: 0,
    slideTotal: 1,
    backgroundUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    preset,
    fontFaceCss: "",
    brand: { brandName: "Vernatun" },
  });
  const fallbackOk = /class="brand-name">Vernatun</.test(fallbackHtml);
  asserts.push(
    fallbackOk
      ? "PASS fallback: .brand-name when no logoUrl"
      : "FAIL fallback: missing .brand-name when no logoUrl",
  );

  const readme = [
    "# phase1-logo-html-smoke",
    "",
    "Wave: `2026-10-18-phase1-logo-html`",
    "Source bg: `vision-style-copy-smoke-A-in-image-6` (embedded data URI plates)",
    "Logo: `public/brand/vernatun-logo.png` (wordmark) → HTML `<img>` only",
    "",
    "## Asserts",
    ...asserts.map((a) => `- ${a}`),
    "",
    `brandName chrome hits with logoUrl: ${brandNameHits} (expect 0)`,
    `logo file URL resolve: ${logoFileUrl}`,
    "",
  ].join("\n");
  await writeFile(path.join(OUT_DIR, "README.md"), readme, "utf8");
  await writeFile(
    path.join(OUT_DIR, "asserts.json"),
    JSON.stringify({ asserts, brandNameHits, logoFileUrl }, null, 2),
    "utf8",
  );

  const failed = asserts.filter((a) => a.startsWith("FAIL"));
  // eslint-disable-next-line no-console -- smoke
  console.log("[phase1-logo] DONE", {
    outDir: OUT_DIR,
    failed: failed.length,
    brandNameHits,
  });
  if (failed.length || brandNameHits > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console -- smoke
  console.error("[phase1-logo] fatal", err);
  process.exitCode = 1;
});
