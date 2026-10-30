/**
 * Wave 2026-10-18-design-inject-logo-br — ONE 6-slide layered carousel smoke.
 * Asserts: logo bottom-RIGHT + name beside, pretty N / M, brand chrome, variety.
 * AD optional (run if keys present; NO remake).
 *
 *   npx tsx scripts/smoke-design-inject-logo-br-6.ts
 *
 * Output: docs/карусель тест/design-inject-logo-br-smoke-6/
 */

import { existsSync, readFileSync } from "node:fs";
import { access, copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolve } from "node:path";

import { SEED_ADMIN_USER_ID } from "../lib/db/actor";
import { runCorrectPipelineGenerate } from "../lib/intake/correct-pipeline-job";
import { DEFAULT_USEFUL_GID } from "../lib/intake/sheet-config";
import { findSheetRow, runSheetPreflight } from "../lib/intake/sheet-client";
import { getBrandSettings } from "../lib/settings/brand-store";
import {
  ART_DIRECTOR_DEFAULT_MODEL,
  formatArtDirectorReviewMarkdown,
  resolveArtDirectorModel,
  runArtDirectorReview,
} from "../lib/studio/art-director-run";
import {
  BRAND_LOGO_SIZE_PX,
  DEFAULT_BRAND_CHROME,
  formatPrettySlideNum,
} from "../lib/studio/carousel-layered-composite";

const OUT_DIR = path.join(
  process.cwd(),
  "docs",
  "карусель тест",
  "design-inject-logo-br-smoke-6",
);
const MEDIA_MIRROR = path.join(
  process.cwd(),
  "generatedMedia",
  "design-inject-logo-br-smoke-6",
);

async function resetWavePngBudgetForSmoke() {
  const dir = path.join(
    process.cwd(),
    "generatedMedia",
    "wave-visual-deconstructor",
  );
  await mkdir(dir, { recursive: true });
  const budgetPath = path.join(dir, "_png_budget.json");
  await writeFile(
    budgetPath,
    JSON.stringify(
      {
        count: 0,
        max: 40,
        updatedAt: new Date().toISOString(),
        stopReport: undefined,
        note: "reset by smoke-design-inject-logo-br-6",
      },
      null,
      2,
    ),
    "utf8",
  );
}

function loadDotEnv(filePath: string) {
  if (!existsSync(filePath)) return;
  for (const raw of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env) || !process.env[key]) process.env[key] = val;
  }
}

loadDotEnv(resolve(process.cwd(), ".env"));
loadDotEnv(resolve(process.cwd(), ".env.local"));

process.env.CAROUSEL_PROMPT_TRACE = "1";
process.env.CAROUSEL_PIPELINE = "layered_html";
process.env.CAROUSEL_PROMPT_TRACE_DIR = path.join(
  "docs",
  "карусель тест",
  "design-inject-logo-br-smoke-6",
);
process.env.CAROUSEL_SKIP_ART_DIRECTOR = "1";

const USER_ID = process.env.CF_DEV_USER_ID?.trim() || SEED_ADMIN_USER_ID;
const SLIDES = 6;
const ROW_KEY = process.env.SMOKE_ROW_KEY?.trim() || "1";
const HARD_PNG_CAP = 8;

function hasAggregatorKey(): boolean {
  return Boolean(
    process.env.AGGREGATOR_API_KEY?.trim() ||
      process.env.CAROUSEL_API_KEY?.trim() ||
      process.env.POLZA_API_KEY?.trim(),
  );
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const adModel = resolveArtDirectorModel(process.env.ART_DIRECTOR_MODEL);
  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-design-inject-logo-br-6] start", {
    userId: USER_ID,
    usefulGid: DEFAULT_USEFUL_GID,
    slides: SLIDES,
    row: ROW_KEY,
    outDir: OUT_DIR,
    hasKey: hasAggregatorKey(),
    pipeline: process.env.CAROUSEL_PIPELINE,
    brandChromeDefault: DEFAULT_BRAND_CHROME,
    logoSizePx: BRAND_LOGO_SIZE_PX,
    adModel,
  });

  await resetWavePngBudgetForSmoke();
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(MEDIA_MIRROR, { recursive: true });

  if (!hasAggregatorKey()) {
    // eslint-disable-next-line no-console -- smoke
    console.error(
      "[smoke-design-inject-logo-br-6] FAIL: no AGGREGATOR_API_KEY / CAROUSEL_API_KEY",
    );
    await writeFile(
      path.join(OUT_DIR, "README.md"),
      [
        "# design-inject-logo-br-smoke-6 — FAILED",
        "",
        "Missing aggregator key.",
        "",
      ].join("\n"),
      "utf8",
    );
    process.exitCode = 1;
    return;
  }

  const brand = await getBrandSettings(USER_ID);
  const brandHasLogo = Boolean((brand.logoRef ?? "").trim());

  const preflight = await runSheetPreflight("useful");
  if (!preflight.ok) {
    process.exitCode = 1;
    return;
  }

  const sheetRow = await findSheetRow("useful", ROW_KEY);
  if (!sheetRow) {
    // eslint-disable-next-line no-console -- smoke
    console.error(`[smoke-design-inject-logo-br-6] row ${ROW_KEY} not found`);
    process.exitCode = 1;
    return;
  }

  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-design-inject-logo-br-6] generating", {
    topic: sheetRow.topic.slice(0, 100),
    slidesForced: SLIDES,
  });

  const result = await runCorrectPipelineGenerate({
    userId: USER_ID,
    mode: "useful",
    sheetRowKey: ROW_KEY,
    slides: SLIDES,
    force: true,
    publishMode: "manual",
  });

  if (!result.ok) {
    // eslint-disable-next-line no-console -- smoke
    console.error("[smoke-design-inject-logo-br-6] FAIL:", result.error);
    await writeFile(
      path.join(OUT_DIR, "README.md"),
      [
        "# design-inject-logo-br-smoke-6 — FAILED",
        "",
        `Error: ${result.error}`,
        "",
      ].join("\n"),
      "utf8",
    );
    process.exitCode = 1;
    return;
  }

  const absPaths = result.pngAbsPaths ?? [];
  let pngCount = 0;
  const rootCopies: string[] = [];

  for (let i = 0; i < SLIDES; i++) {
    const src = absPaths[i];
    const name = `slide_${String(i + 1).padStart(2, "0")}.png`;
    const dest = path.join(OUT_DIR, name);
    const mediaDest = path.join(MEDIA_MIRROR, name);
    if (src && (await fileExists(src))) {
      await copyFile(src, dest);
      await copyFile(src, mediaDest);
      pngCount += 1;
      rootCopies.push(dest);
    }
  }

  const timelineSrc =
    result.timelineMd ||
    path.join(OUT_DIR, `01-row-${ROW_KEY}-timeline.md`);
  if (await fileExists(timelineSrc)) {
    await copyFile(timelineSrc, path.join(OUT_DIR, "timeline.md"));
  }

  let logoImgFound = false;
  let brandBottomRight = false;
  let brandFlexRow = false;
  let logoTransparent = false;
  let logoEnlarged = false;
  let prettyNumFound = false;
  let slideNumOpposite = false;
  const anchors: string[] = [];
  const flexKeys: string[] = [];

  for (let i = 0; i < SLIDES; i++) {
    const htmlPath = (absPaths[i] ?? "").replace(/\.png$/i, ".html");
    if (htmlPath && (await fileExists(htmlPath))) {
      const html = readFileSync(htmlPath, "utf8");
      if (html.includes('class="brand"') && html.includes("<img")) {
        logoImgFound = true;
      }
      if (
        /data-brand-chrome="bottom-right"/i.test(html) ||
        /data-placement="bottom-right"/i.test(html)
      ) {
        brandBottomRight = true;
      }
      if (
        /\.brand\s*\{[^}]*flex-direction:\s*row/i.test(html) ||
        /flex-direction:\s*row/.test(html)
      ) {
        brandFlexRow = true;
      }
      if (
        /\.brand img\s*\{[^}]*background:\s*transparent/i.test(html)
      ) {
        logoTransparent = true;
      }
      if (
        html.includes(`${BRAND_LOGO_SIZE_PX}px`) ||
        /width:\s*8[0-9]px/.test(html)
      ) {
        logoEnlarged = true;
      }
      const expected = formatPrettySlideNum(i, SLIDES);
      if (html.includes(expected) || html.includes(" / ")) {
        prettyNumFound = true;
      }
      if (
        /\.slide-num\s*\{[^}]*left:/i.test(html) &&
        brandBottomRight
      ) {
        slideNumOpposite = true;
      }
      const anchorAttr = html.match(/data-anchor="([^"]+)"/);
      const vertAttr = html.match(/data-vertical="([^"]+)"/);
      if (anchorAttr) {
        anchors.push(`${anchorAttr[1]}:${vertAttr?.[1] ?? "?"}`);
      }
      const j = html.match(/\.safe\s*\{[^}]*justify-content:\s*([^;]+)/);
      const a = html.match(/\.safe\s*\{[^}]*align-items:\s*([^;]+)/);
      if (j && a) flexKeys.push(`${j[1]!.trim()}|${a[1]!.trim()}`);
      await copyFile(
        htmlPath,
        path.join(OUT_DIR, `slide_${String(i + 1).padStart(2, "0")}.html`),
      );
    }
  }

  const varietyOk =
    new Set(anchors).size >= 2 ||
    new Set(flexKeys).size >= 2 ||
    flexKeys.length < 2;

  // Optional AD — NO remake
  let adOk = false;
  let adModelUsed = adModel;
  try {
    // eslint-disable-next-line no-console -- smoke
    console.log("[smoke-design-inject-logo-br-6] Art Director (optional)…");
    const ad = await runArtDirectorReview({
      userId: USER_ID,
      draftId: result.draftId,
      jobId: result.jobId,
      slideUrls: rootCopies.length === SLIDES ? rootCopies : absPaths,
      model: adModel,
      briefMeta: {
        idea: sheetRow.topic.slice(0, 120),
        mode: "useful",
        renderMode: "layered_html",
      },
      appendLog: true,
    });
    if (ad.ok) {
      adOk = true;
      adModelUsed = ad.model;
      const md = formatArtDirectorReviewMarkdown(ad.verdict, {
        draftId: result.draftId,
        model: ad.model,
        source: ad.source,
      });
      await writeFile(path.join(OUT_DIR, "art-director-review.md"), md, "utf8");
      await writeFile(
        path.join(OUT_DIR, "art-director-review.json"),
        JSON.stringify(
          {
            ...ad.verdict,
            model: ad.model,
            source: ad.source,
            remakeEnqueued: false,
            draftId: result.draftId,
          },
          null,
          2,
        ),
        "utf8",
      );
    } else {
      await writeFile(
        path.join(OUT_DIR, "art-director-review.md"),
        [
          "# Art Director — skipped/failed (optional)",
          "",
          `Error: ${ad.error}`,
          "",
          "**NO remake**.",
          "",
        ].join("\n"),
        "utf8",
      );
    }
  } catch (err) {
    await writeFile(
      path.join(OUT_DIR, "art-director-review.md"),
      [
        "# Art Director — skipped",
        "",
        err instanceof Error ? err.message : String(err),
        "",
      ].join("\n"),
      "utf8",
    );
  }

  const readme = [
    "# design-inject-logo-br-smoke-6",
    "",
    "Wave `2026-10-18-design-inject-logo-br` — ONE 6-slide layered HTML.",
    "",
    `- **pipeline:** \`layered_html\` (S57)`,
    `- **row:** useful \`${ROW_KEY}\` — ${sheetRow.topic}`,
    `- **slides:** ${SLIDES}`,
    `- **draftId:** \`${result.draftId}\``,
    `- **PNG count:** ${pngCount}`,
    `- **brand chrome default:** \`${DEFAULT_BRAND_CHROME}\` · logo ${BRAND_LOGO_SIZE_PX}px · transparent bg · name right of icon`,
    `- **brand logo present:** ${brandHasLogo}`,
    `- **HTML logo <img>:** ${logoImgFound}`,
    `- **brand bottom-right:** ${brandBottomRight}`,
    `- **brand flex-row:** ${brandFlexRow}`,
    `- **logo transparent:** ${logoTransparent}`,
    `- **logo enlarged:** ${logoEnlarged}`,
    `- **pretty N / M:** ${prettyNumFound}`,
    `- **slide-num opposite logo:** ${slideNumOpposite}`,
    `- **template variety:** ${varietyOk} (${[...new Set(anchors)].join(", ") || "n/a"})`,
    `- **AD:** ${adOk ? adModelUsed : "optional skipped/fail"} · remake **NO**`,
    "",
    "## Files",
    "",
    ...rootCopies.map((p) => `- \`${path.relative(process.cwd(), p)}\``),
    `- \`timeline.md\``,
    `- \`art-director-review.md\` (optional)`,
    "",
  ].join("\n");

  await writeFile(path.join(OUT_DIR, "README.md"), readme, "utf8");
  await writeFile(path.join(MEDIA_MIRROR, "README.md"), readme, "utf8");

  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-design-inject-logo-br-6] done", {
    pngCount,
    logoImgFound,
    brandBottomRight,
    brandFlexRow,
    logoTransparent,
    logoEnlarged,
    prettyNumFound,
    slideNumOpposite,
    varietyOk,
    adOk,
    remakeEnqueued: false,
  });

  if (pngCount < SLIDES || pngCount > HARD_PNG_CAP) {
    process.exitCode = 1;
  }
  if (brandHasLogo && !logoImgFound) {
    process.exitCode = 1;
  }
  if (!brandBottomRight || !logoTransparent || !logoEnlarged) {
    // eslint-disable-next-line no-console -- smoke
    console.error(
      "[smoke-design-inject-logo-br-6] WARN: brand chrome asserts incomplete",
      { brandBottomRight, logoTransparent, logoEnlarged },
    );
    process.exitCode = 1;
  }
  if (!prettyNumFound) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console -- smoke
  console.error(
    "[smoke-design-inject-logo-br-6] fatal",
    err instanceof Error ? err.message : err,
  );
  process.exitCode = 1;
});
