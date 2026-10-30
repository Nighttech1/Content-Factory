/**
 * Pipeline readiness run — FROM READY BACKGROUNDS, NO generation.
 *
 * Takes an existing carousel's ready .bg.png plates, runs them through OUR
 * montage layer (layered_html composite → Playwright raster @1080×1350), then
 * hands the composites to the REAL Art Director agent (LLM vision via our
 * aggregator — runArtDirectorReview). Art Director is a strict API call, NOT a
 * deterministic local check. NO image generation, NO remake.
 *
 *   node node_modules/tsx/dist/cli.mjs scripts/run-pipeline-from-backgrounds.ts <jobId>
 *
 * Default jobId = sheet_520af0bc39b5402e (3rd carousel by creation time w/ bg plates).
 */

import { existsSync, readFileSync } from "node:fs";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolve } from "node:path";

import { SEED_ADMIN_USER_ID } from "../lib/db/actor";
import {
  formatArtDirectorReviewMarkdown,
  runArtDirectorReview,
} from "../lib/studio/art-director-run";

const FRAME_W = 1080;
const FRAME_H = 1350;

const jobId = process.argv[2] || "sheet_520af0bc39b5402e";
const jobDir = path.join(process.cwd(), "public", "generated", "carousel", jobId);
const outDir = path.join(process.cwd(), "generatedMedia", "readiness-pipeline", jobId);

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

const USER_ID = process.env.CF_DEV_USER_ID?.trim() || SEED_ADMIN_USER_ID;

function hasAggregatorKey(): boolean {
  return Boolean(
    process.env.AGGREGATOR_API_KEY?.trim() ||
      process.env.CAROUSEL_API_KEY?.trim() ||
      process.env.POLZA_API_KEY?.trim(),
  );
}

function readMarker(html: string, name: string): string {
  const m = new RegExp(`${name}"\\s+content="([^"]+)"`).exec(html);
  return m ? m[1]! : "";
}
function readAttr(html: string, attr: string): string {
  const m = new RegExp(`${attr}="([^"]+)"`).exec(html);
  return m ? m[1]! : "";
}

async function rasterHtmlToPng(html: string, outPath: string) {
  const playwright = await import("playwright");
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage({
      viewport: { width: FRAME_W, height: FRAME_H },
      deviceScaleFactor: 1,
    });
    await page.setContent(html, { waitUntil: "load", timeout: 60_000 });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: outPath,
      type: "png",
      clip: { x: 0, y: 0, width: FRAME_W, height: FRAME_H },
    });
    await page.close();
  } finally {
    await browser.close();
  }
}

function pngSize(buf: Buffer): { width: number; height: number } {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

async function main() {
  // eslint-disable-next-line no-console
  console.log("[pipeline-from-bg] start", {
    jobId,
    userId: USER_ID,
    hasKey: hasAggregatorKey(),
  });

  if (!existsSync(jobDir)) throw new Error(`Job dir not found: ${jobDir}`);
  await mkdir(outDir, { recursive: true });

  // ---- MONTAGE: re-composite each slide FROM its ready .bg.png plate ----
  const slideUrls: string[] = [];
  const slideMeta: Array<Record<string, unknown>> = [];
  for (let i = 1; i <= 12; i++) {
    const n = String(i).padStart(2, "0");
    const htmlPath = path.join(jobDir, `slide_${n}.html`);
    const bgPath = path.join(jobDir, `slide_${n}.bg.png`);
    if (!existsSync(htmlPath) || !existsSync(bgPath)) break;

    let html = await readFile(htmlPath, "utf8");
    const bgBuf = await readFile(bgPath);
    const dataUri = `data:image/png;base64,${bgBuf.toString("base64")}`;
    // Swap the .bg background-image to the raw plate from disk (feed the
    // background through montage, don't trust the baked copy).
    html = html.replace(
      /background-image:\s*url\("[^"]+"\)/,
      `background-image: url("${dataUri}")`,
    );

    const outPng = path.join(outDir, `slide_${n}.png`);
    await rasterHtmlToPng(html, outPng); // Playwright — no generation
    const buf = await readFile(outPng);
    const { width, height } = pngSize(buf);
    slideUrls.push(outPng);
    slideMeta.push({
      n,
      render: readMarker(html, "cf-render"),
      role: readMarker(html, "cf-role"),
      template: readMarker(html, "cf-template"),
      brand: readAttr(html, "data-brand-chrome"),
      width,
      height,
      bytes: buf.byteLength,
    });
    // eslint-disable-next-line no-console
    console.log(
      `[montage] slide_${n} ${readMarker(html, "cf-render")} role=${readMarker(html, "cf-role")} tmpl=${readMarker(html, "cf-template")} ${width}x${height} ${buf.byteLength}b`,
    );
  }

  if (slideUrls.length === 0) throw new Error("No slides composited");

  // ---- ART DIRECTOR: real LLM vision review (strict API call) ----
  if (!hasAggregatorKey()) {
    throw new Error(
      "AGGREGATOR_API_KEY missing — Art Director is a real LLM API call and cannot run without it.",
    );
  }
  // eslint-disable-next-line no-console
  console.log(
    `[art-director] real LLM vision review over ${slideUrls.length} composites (no remake)…`,
  );
  const ad = await runArtDirectorReview({
    userId: USER_ID,
    jobId,
    slideUrls,
    briefMeta: {
      idea: `Готовность пайплайна: прогон готовых фонов карусели ${jobId}`,
      mode: "useful",
      renderMode: "layered_html",
    },
    appendLog: true,
  });

  const reportBase = {
    jobId,
    generated: false,
    montage: "layered_html · Playwright raster @1080×1350",
    slideCount: slideUrls.length,
    slides: slideMeta,
  };

  if (!ad.ok) {
    await writeFile(
      path.join(outDir, "art-director-review.md"),
      `# Art Director review — FAILED\n\nError: ${ad.error}\n\n**NO remake.**\n`,
      "utf8",
    );
    await writeFile(
      path.join(outDir, "PIPELINE_REPORT.json"),
      JSON.stringify({ ...reportBase, artDirector: { ok: false, error: ad.error } }, null, 2),
      "utf8",
    );
    // eslint-disable-next-line no-console
    console.error("[art-director] FAIL:", ad.error);
    process.exitCode = 1;
    return;
  }

  const md = formatArtDirectorReviewMarkdown(ad.verdict, {
    model: ad.model,
    source: ad.source,
  });
  await writeFile(path.join(outDir, "art-director-review.md"), md, "utf8");
  await writeFile(
    path.join(outDir, "art-director-review.json"),
    JSON.stringify({ ...ad.verdict, model: ad.model, source: ad.source, remakeEnqueued: false }, null, 2),
    "utf8",
  );
  await writeFile(
    path.join(outDir, "PIPELINE_REPORT.json"),
    JSON.stringify(
      {
        ...reportBase,
        artDirector: {
          ok: true,
          verdict: ad.verdict.verdict,
          score: ad.verdict.score,
          remarksCount: ad.verdict.remarks?.length ?? 0,
          model: ad.model,
          source: ad.source,
          remakeEnqueued: false,
        },
      },
      null,
      2,
    ),
    "utf8",
  );

  // eslint-disable-next-line no-console
  console.log("\n[ART DIRECTOR · LLM]", {
    verdict: ad.verdict.verdict,
    score: ad.verdict.score,
    remarks: ad.verdict.remarks?.length ?? 0,
    model: ad.model,
    source: ad.source,
  });
  // eslint-disable-next-line no-console
  console.log("[pipeline-from-bg] out:", outDir);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[pipeline-from-bg] fatal", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
