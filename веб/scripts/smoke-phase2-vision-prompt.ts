/**
 * Wave 2026-10-18-phase2-vision-prompt — re-composite smoke (no paid image gen).
 * Reuses bg plates from vision-style-copy / logo-placement-v2.
 *
 * Asserts: clean IMAGE prompt strings; Path A emblem+HTML wordmark; logo.textColor;
 * BRAND_LOGO_SIZE_PX=200; no Manrope in HTML.
 *
 *   npx tsx scripts/smoke-phase2-vision-prompt.ts
 *
 * Output: docs/карусель тест/phase2-vision-prompt-smoke/
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  createDarkNotesSeedPreset,
  parseDesignPresetFile,
} from "../lib/settings/design-preset";
import {
  BRAND_EMBLEM_REF,
  BRAND_LOGO_SIZE_PX,
  buildLayeredSlideHtml,
  defaultLogoPlacementForRole,
  resolveAssetUrlForPlaywright,
  synthesizeFallbackHtmlLayout,
} from "../lib/studio/carousel-layered-composite";
import {
  assertBackgroundOnlyPrompt,
  assertVisionRefPromptBanClean,
  buildVisionRefBackgroundImagePrompt,
  LAYERED_HTML_DESIGNER_OVERLAY_VISION_REF,
  VISION_STYLE_COPY_HARD,
} from "../lib/studio/create-carousel-prompts";
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
    "logo-placement-v2-smoke",
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
  "phase2-vision-prompt-smoke",
);
const EMBLEM_PNG = path.join(
  process.cwd(),
  "public",
  "brand",
  "vernatun-emblem.png",
);
const SLIDES = 6;

function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
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

async function main() {
  if (!existsSync(EMBLEM_PNG)) {
    throw new Error(`Missing ${EMBLEM_PNG}`);
  }
  const SRC_DIR = SRC_CANDIDATES.find((d) => existsSync(d));
  if (!SRC_DIR) {
    throw new Error(
      `Missing source smoke dirs: ${SRC_CANDIDATES.join(" | ")}`,
    );
  }

  await mkdir(OUT_DIR, { recursive: true });

  const asserts: string[] = [];

  // —— Prompt scrub evidence ——
  const samplePrompts: string[] = [];
  for (let i = 0; i < SLIDES; i++) {
    const p = buildVisionRefBackgroundImagePrompt({
      visualPrompt: i % 2 === 0 ? "абрикосовый пирог на тарелке" : "ключ от квартиры",
      primaryCopy: `Slide ${i + 1}`,
      slideIndex0: i,
      slideTotal: SLIDES,
      characterPaint: "in_image",
      forceConductor: i === 0 || i === SLIDES - 1,
    });
    samplePrompts.push(p);
    const check = assertBackgroundOnlyPrompt(p);
    asserts.push(
      check.ok
        ? `PASS image_prompt slide ${i + 1}: ban OK`
        : `FAIL image_prompt slide ${i + 1}: ${check.reason}`,
    );
    // Positive locks only (DO NOT lines may mention the words as bans)
    if (
      /#FF5A1F|Photoreal\/CGI single object|SOLID bright orange|SOLID clean white plate/i.test(
        p,
      )
    ) {
      asserts.push(`FAIL image_prompt slide ${i + 1}: stock lock remnant`);
    } else {
      asserts.push(`PASS image_prompt slide ${i + 1}: no stock lock`);
    }
  }
  await writeFile(
    path.join(OUT_DIR, "sample-image-prompts.md"),
    [
      "# Phase 2 — sample IMAGE prompts (scrubbed)",
      "",
      ...samplePrompts.map(
        (p, i) => `## Slide ${i + 1}\n\n\`\`\`text\n${p}\n\`\`\`\n`,
      ),
    ].join("\n"),
    "utf8",
  );

  const overlayBan = assertVisionRefPromptBanClean(
    [LAYERED_HTML_DESIGNER_OVERLAY_VISION_REF, VISION_STYLE_COPY_HARD].join(
      "\n",
    ),
  );
  asserts.push(
    overlayBan.ok
      ? "PASS Designer overlay ban clean"
      : `FAIL Designer overlay ban: ${overlayBan.reason}`,
  );

  asserts.push(
    BRAND_LOGO_SIZE_PX === 200
      ? "PASS BRAND_LOGO_SIZE_PX=200"
      : `FAIL BRAND_LOGO_SIZE_PX=${BRAND_LOGO_SIZE_PX}`,
  );

  const logoFileUrl = resolveAssetUrlForPlaywright(BRAND_EMBLEM_REF);
  if (!logoFileUrl) throw new Error("resolveAssetUrlForPlaywright emblem failed");
  const logoUrl = await fileToDataUri(EMBLEM_PNG);

  const seed = createDarkNotesSeedPreset();
  const preset = parseDesignPresetFile(seed) ?? seed;

  const placementBySlide: Record<string, string> = {};
  const textColorBySlide: Record<string, string> = {};
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
      extractCopy(srcHtml, "primary") || `Slide ${i} · phase2`;
    const secondary = extractCopy(srcHtml, "secondary");
    const i0 = i - 1;
    const roleVar = roleVariantForIndex(i0, SLIDES);
    const role = normalizeCarouselSlideRole(roleVar, i0, SLIDES);
    const expected = defaultLogoPlacementForRole(role, i0, SLIDES);
    const textColor = i0 % 2 === 0 ? "#FFFFFF" : "#1A1A1A";
    const layout = synthesizeFallbackHtmlLayout(role, i0);
    layout.layoutMapSource = "vision_ref";
    layout.logo = { placement: expected, textColor };

    const html = buildLayeredSlideHtml({
      slide: {
        primary_copy: primary,
        secondary_copy: secondary || undefined,
        html_layout: layout,
      },
      slideIndex0: i0,
      slideTotal: SLIDES,
      backgroundUrl: bg,
      preset,
      fontFaceCss: "",
      brand: {
        brandName: "VERNATUN",
        logoUrl,
        splitEmblemWordmark: true,
      },
    });

    const htmlPath = path.join(OUT_DIR, `slide_${n}.html`);
    const pngPath = path.join(OUT_DIR, `slide_${n}.png`);
    await writeFile(htmlPath, html, "utf8");
    await screenshotHtmlToPng(html, pngPath);
    const st = await import("node:fs/promises").then((fs) =>
      fs.stat(pngPath),
    );
    pngSizes[`slide_${n}`] = st.size;

    const placeMatch = html.match(/data-placement="([^"]+)"/);
    placementBySlide[`slide_${n}`] = placeMatch?.[1] ?? "?";
    const colorMatch = html.match(/data-logo-text-color="([^"]+)"/);
    textColorBySlide[`slide_${n}`] = colorMatch?.[1] ?? "?";

    asserts.push(
      placeMatch?.[1] === expected
        ? `PASS slide_${n}: placement ${expected}`
        : `FAIL slide_${n}: placement got ${placeMatch?.[1]} expected ${expected}`,
    );
    asserts.push(
      colorMatch?.[1] === textColor
        ? `PASS slide_${n}: textColor ${textColor}`
        : `FAIL slide_${n}: textColor got ${colorMatch?.[1]}`,
    );
    asserts.push(
      html.includes('data-logo-mode="emblem_wordmark"') &&
        html.includes("brand-name") &&
        /VERNATUN/i.test(html)
        ? `PASS slide_${n}: Path A emblem+wordmark`
        : `FAIL slide_${n}: Path A missing`,
    );
    asserts.push(
      !/Manrope/i.test(html)
        ? `PASS slide_${n}: no Manrope`
        : `FAIL slide_${n}: Manrope leaked`,
    );
    asserts.push(
      html.includes(`max-width: ${BRAND_LOGO_SIZE_PX}px`)
        ? `PASS slide_${n}: size ${BRAND_LOGO_SIZE_PX}`
        : `FAIL slide_${n}: size CSS missing`,
    );
  }

  const failCount = asserts.filter((a) => a.startsWith("FAIL")).length;
  const report = [
    "# Phase 2 vision-prompt smoke",
    "",
    `**Source:** \`${path.relative(process.cwd(), SRC_DIR)}\``,
    `**Out:** \`docs/карусель тест/phase2-vision-prompt-smoke/\``,
    `**Logo:** \`${BRAND_EMBLEM_REF}\` + HTML wordmark (Path A)`,
    `**Size:** BRAND_LOGO_SIZE_PX = ${BRAND_LOGO_SIZE_PX}`,
    "",
    "## Asserts",
    "",
    ...asserts.map((a) => `- ${a}`),
    "",
    "## Placements",
    "",
    "```json",
    JSON.stringify(placementBySlide, null, 2),
    "```",
    "",
    "## logo.textColor",
    "",
    "```json",
    JSON.stringify(textColorBySlide, null, 2),
    "```",
    "",
    "## PNG sizes",
    "",
    "```json",
    JSON.stringify(pngSizes, null, 2),
    "```",
    "",
    failCount === 0 ? "**Verdict: PASS**" : `**Verdict: FAIL** (${failCount})`,
  ].join("\n");

  await writeFile(path.join(OUT_DIR, "SMOKE-REPORT.md"), report, "utf8");

  // eslint-disable-next-line no-console -- smoke
  console.log(report);
  if (failCount > 0) process.exitCode = 1;
}

main().catch((err) => {
  // eslint-disable-next-line no-console -- smoke
  console.error("[smoke-phase2-vision-prompt] FAIL", err);
  process.exitCode = 1;
});
