/**
 * Fixer: re-composite smoke B slides 01+06 with SINGLE conductor pose cutouts
 * (never the 6-pose sheet). Mid slides 02–05 untouched. Smoke A untouched.
 *
 *   npx tsx scripts/fix-smoke-b-overlay-cutout.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolve } from "node:path";

import {
  cropSinglePoseFromSheet,
  defaultPoseCellForSlide,
  knockoutCutoutBackground,
  materializeCutoutUrlToFile,
} from "../lib/studio/character-cutout-pose";
import { randomUUID } from "node:crypto";
import { buildCharacterCutoutPrompt } from "../lib/studio/create-carousel-prompts";
import {
  DEFAULT_CAROUSEL_IMAGE_MODEL,
  generateAggregatorImageWithOptionalRef,
} from "../lib/llm/aggregator-images";

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

const OUT_DIR = path.join(
  process.cwd(),
  "docs",
  "карусель тест",
  "layout-copy-dual-char-smoke-B-overlay",
);
const SHEET_ABS = path.join(
  process.cwd(),
  "public",
  "characters",
  "anush-sheet.jpg",
);
const POSE_DIR = path.join(
  process.cwd(),
  "generatedMedia",
  "cutout-poses",
  "smoke-b-fix",
);
const SLIDE_TOTAL = 6;
const FIX_INDEXES = [0, 5]; // 01 + 06

const CONDUCTOR =
  "3D animated Vernatun conductor girl «Ануш»: long dark wavy hair, red traditional dress with gold trim, white apron, warm friendly face, presenter stance facing camera";

async function fileToDataUri(absPath: string): Promise<string | null> {
  try {
    const buf = await readFile(absPath);
    const ext = path.extname(absPath).toLowerCase();
    const mime =
      ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".webp"
          ? "image/webp"
          : "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

async function screenshotHtmlToPng(
  html: string,
  outPath: string,
): Promise<boolean> {
  try {
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
      await page.setContent(html, { waitUntil: "networkidle", timeout: 60_000 });
      await page.screenshot({
        path: outPath,
        type: "png",
        clip: { x: 0, y: 0, width: 1080, height: 1350 },
      });
      await page.close();
      return true;
    } finally {
      await browser.close().catch(() => undefined);
    }
  } catch (err) {
    // eslint-disable-next-line no-console -- fixer script
    console.error("[fix-smoke-b] screenshot fail", err);
    return false;
  }
}

function replaceCharacterSrc(html: string, newSrc: string): string {
  // Replace first character cutout img src (data URI / http / path)
  const re =
    /(<img\s+class="character[^"]*"\s+src=")(data:[^"]+|https?:[^"]+|\/[^"]+)(")/i;
  if (re.test(html)) {
    return html.replace(re, `$1${newSrc}$3`);
  }
  return html.replace(
    /(<img\s+class="character[^"]*"\s+src=")[^"]+(")/i,
    `$1${newSrc}$2`,
  );
}

async function resolveSinglePose(
  slideIndex0: number,
): Promise<{ dataUri: string; source: string } | null> {
  const role =
    slideIndex0 <= 0
      ? "cover"
      : slideIndex0 >= SLIDE_TOTAL - 1
        ? "cta_slide"
        : "body_slide";
  const prompt = buildCharacterCutoutPrompt({
    characterCatalogLine: CONDUCTOR,
    slideRole: role,
    primaryCopy:
      slideIndex0 <= 0
        ? "Удалёнка из Армении — с чего начать"
        : "Начни удалёнку из Армении",
  });

  try {
    const rich = await generateAggregatorImageWithOptionalRef({
      prompt,
      model:
        process.env.CAROUSEL_IMAGE_MODEL?.trim() || DEFAULT_CAROUSEL_IMAGE_MODEL,
      referenceImagePath: SHEET_ABS,
    });
    if (rich?.url) {
      const saved = await materializeCutoutUrlToFile(
        rich.url,
        POSE_DIR,
        `s${slideIndex0 + 1}`,
      );
      let dataUri = saved
        ? (await fileToDataUri(saved)) || null
        : rich.url.startsWith("data:")
          ? rich.url
          : null;
      if (!dataUri && rich.url.startsWith("http")) {
        const fetched = await materializeCutoutUrlToFile(
          rich.url,
          POSE_DIR,
          `s${slideIndex0 + 1}-http`,
        );
        if (fetched) dataUri = await fileToDataUri(fetched);
      }
      if (dataUri) {
        const knocked = await knockoutCutoutBackground({
          srcDataUriOrPath: dataUri,
          outPath: path.join(
            POSE_DIR,
            `pose-alpha-s${slideIndex0 + 1}-${randomUUID().slice(0, 8)}.png`,
          ),
        });
        if (knocked) {
          const alpha = await fileToDataUri(knocked);
          if (alpha) {
            return {
              dataUri: alpha,
              source: `image_model:${rich.continuity}+knockout`,
            };
          }
        }
        return { dataUri, source: `image_model:${rich.continuity}` };
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console -- fixer script
    console.warn("[fix-smoke-b] pose gen soft-fail", slideIndex0 + 1, err);
  }

  const sheetData = await fileToDataUri(SHEET_ABS);
  if (!sheetData) return null;
  const cropped = await cropSinglePoseFromSheet({
    sheetSrc: sheetData,
    outDir: POSE_DIR,
    cellIndex: defaultPoseCellForSlide(slideIndex0, SLIDE_TOTAL),
    label: `s${slideIndex0 + 1}`,
  });
  if (!cropped) return null;
  let dataUri = await fileToDataUri(cropped);
  if (!dataUri) return null;
  const knocked = await knockoutCutoutBackground({
    srcDataUriOrPath: dataUri,
    outPath: path.join(
      POSE_DIR,
      `pose-alpha-crop-s${slideIndex0 + 1}-${randomUUID().slice(0, 8)}.png`,
    ),
  });
  if (knocked) {
    const alpha = await fileToDataUri(knocked);
    if (alpha) return { dataUri: alpha, source: "sheet_cell_crop+knockout" };
  }
  return { dataUri, source: "sheet_cell_crop" };
}

async function main() {
  // eslint-disable-next-line no-console -- fixer script
  console.log("[fix-smoke-b-overlay-cutout] start", { OUT_DIR, SHEET_ABS });
  await mkdir(POSE_DIR, { recursive: true });

  if (!existsSync(SHEET_ABS)) {
    // eslint-disable-next-line no-console -- fixer script
    console.error("[fix-smoke-b] missing sheet", SHEET_ABS);
    process.exitCode = 1;
    return;
  }
  if (!existsSync(OUT_DIR)) {
    // eslint-disable-next-line no-console -- fixer script
    console.error("[fix-smoke-b] missing smoke B dir", OUT_DIR);
    process.exitCode = 1;
    return;
  }

  const results: Array<{
    slide: number;
    source: string;
    pngOk: boolean;
  }> = [];

  for (const i of FIX_INDEXES) {
    const name = `slide_${String(i + 1).padStart(2, "0")}`;
    const htmlPath = path.join(OUT_DIR, `${name}.html`);
    const pngPath = path.join(OUT_DIR, `${name}.png`);
    if (!existsSync(htmlPath)) {
      // eslint-disable-next-line no-console -- fixer script
      console.error("[fix-smoke-b] missing html", htmlPath);
      process.exitCode = 1;
      return;
    }

    const pose = await resolveSinglePose(i);
    if (!pose) {
      // eslint-disable-next-line no-console -- fixer script
      console.error("[fix-smoke-b] no single pose for", name);
      process.exitCode = 1;
      return;
    }

    const htmlRaw = await readFile(htmlPath, "utf8");
    const htmlFixed = replaceCharacterSrc(htmlRaw, pose.dataUri);
    if (htmlFixed === htmlRaw) {
      // eslint-disable-next-line no-console -- fixer script
      console.warn(
        "[fix-smoke-b] WARN: character src replace may have failed",
        name,
      );
    }
    await writeFile(htmlPath, htmlFixed, "utf8");

    const pngOk = await screenshotHtmlToPng(htmlFixed, pngPath);
    // Mirror to generatedMedia
    const mediaMirror = path.join(
      process.cwd(),
      "generatedMedia",
      "layout-copy-dual-char-smoke-B-overlay",
      `${name}.png`,
    );
    await mkdir(path.dirname(mediaMirror), { recursive: true });
    if (pngOk) await copyFile(pngPath, mediaMirror);

    results.push({ slide: i + 1, source: pose.source, pngOk });
    // eslint-disable-next-line no-console -- fixer script
    console.log("[fix-smoke-b] slide done", {
      slide: i + 1,
      source: pose.source,
      pngOk,
    });
  }

  // Update meta note
  const metaPath = path.join(OUT_DIR, "meta.json");
  if (existsSync(metaPath)) {
    try {
      const meta = JSON.parse(await readFile(metaPath, "utf8")) as Record<
        string,
        unknown
      >;
      meta.cutoutFix = {
        at: new Date().toISOString(),
        note: "SINGLE pose cutouts on 01+06 (sheet was style ref / crop fallback; not whole sheet)",
        results,
      };
      await writeFile(metaPath, JSON.stringify(meta, null, 2), "utf8");
    } catch {
      /* ignore */
    }
  }

  const readmePath = path.join(OUT_DIR, "README.md");
  if (existsSync(readmePath)) {
    let readme = await readFile(readmePath, "utf8");
    const note = [
      "",
      "## Fixer cutout (2026-10-18)",
      "",
      "Slides **01+06** re-composited with **ONE** conductor pose each (image model + sheet style ref, or sheet cell crop). Mid slides unchanged. Whole 6-pose sheet no longer used as HTML cutout.",
      "",
    ].join("\n");
    if (!readme.includes("## Fixer cutout")) {
      readme = `${readme.trimEnd()}\n${note}`;
      await writeFile(readmePath, readme, "utf8");
    }
  }

  const allOk = results.every((r) => r.pngOk);
  // eslint-disable-next-line no-console -- fixer script
  console.log("[fix-smoke-b-overlay-cutout] finished", { allOk, results });
  if (!allOk) process.exitCode = 1;
}

main().catch((err) => {
  // eslint-disable-next-line no-console -- fixer script
  console.error("[fix-smoke-b-overlay-cutout] fatal", err);
  process.exitCode = 1;
});
