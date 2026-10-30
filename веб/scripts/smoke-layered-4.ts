/**
 * S57 layered_html Client-score smoke — ONE carousel × 4 slides.
 *
 *   npx tsx scripts/smoke-layered-4.ts
 *
 * Env:
 *   CAROUSEL_PROMPT_TRACE=1
 *   CAROUSEL_PIPELINE=layered_html
 *   CAROUSEL_PROMPT_TRACE_DIR=docs/карусель тест/layered-smoke-4
 *
 * Row: useful №1 «Как научить ребёнка армянскому…» — FORCE slides=4.
 * Uses AGGREGATOR_* from .env (never prints secrets).
 */

import { existsSync, readFileSync } from "node:fs";
import { access, copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolve } from "node:path";

import { SEED_ADMIN_USER_ID } from "../lib/db/actor";
import { runCorrectPipelineGenerate } from "../lib/intake/correct-pipeline-job";
import { DEFAULT_USEFUL_GID } from "../lib/intake/sheet-config";
import { findSheetRow, runSheetPreflight } from "../lib/intake/sheet-client";

const OUT_DIR = path.join(
  process.cwd(),
  "docs",
  "карусель тест",
  "layered-smoke-4",
);
const MEDIA_MIRROR = path.join(
  process.cwd(),
  "generatedMedia",
  "layered-smoke-4",
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
        note: "reset by smoke-layered-4",
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
  "layered-smoke-4",
);

const USER_ID = process.env.CF_DEV_USER_ID?.trim() || SEED_ADMIN_USER_ID;
const SLIDES = 4;
const ROW_KEY = "1";
const TOPIC_PREFIX = "Как научить ребёнка армянскому";
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
  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-layered-4] start", {
    userId: USER_ID,
    usefulGid: DEFAULT_USEFUL_GID,
    slides: SLIDES,
    row: ROW_KEY,
    outDir: OUT_DIR,
    hasKey: hasAggregatorKey(),
    pipeline: process.env.CAROUSEL_PIPELINE,
  });

  await resetWavePngBudgetForSmoke();

  // Clean deliverable folder (user asked rewrite; old 51/1/17 deleted separately)
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(MEDIA_MIRROR, { recursive: true });

  if (!hasAggregatorKey()) {
    // eslint-disable-next-line no-console -- smoke
    console.error(
      "[smoke-layered-4] FAIL: no AGGREGATOR_API_KEY / CAROUSEL_API_KEY — cannot generate.",
    );
    await writeFile(
      path.join(OUT_DIR, "README.md"),
      [
        "# layered-smoke-4 — FAILED",
        "",
        "Missing aggregator key. No fake PNG.",
        "",
      ].join("\n"),
      "utf8",
    );
    process.exitCode = 1;
    return;
  }

  const preflight = await runSheetPreflight("useful");
  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-layered-4] preflight", {
    ok: preflight.ok,
    modes: preflight.tabs.map((t) => ({
      mode: t.mode,
      ok: t.ok,
      rowCount: t.rowCount,
    })),
  });
  if (!preflight.ok) {
    process.exitCode = 1;
    return;
  }

  const sheetRow = await findSheetRow("useful", ROW_KEY);
  if (!sheetRow) {
    // eslint-disable-next-line no-console -- smoke
    console.error(`[smoke-layered-4] row ${ROW_KEY} not found`);
    process.exitCode = 1;
    return;
  }

  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-layered-4] generating", {
    topic: sheetRow.topic.slice(0, 100),
    topicMatch: sheetRow.topic
      .toLowerCase()
      .includes(TOPIC_PREFIX.toLowerCase().slice(0, 20)),
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
    console.error("[smoke-layered-4] FAIL:", result.error);
    await writeFile(
      path.join(OUT_DIR, "README.md"),
      [
        "# layered-smoke-4 — FAILED",
        "",
        `Error: ${result.error}`,
        result.timelineMd ? `Timeline: ${result.timelineMd}` : "",
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
    } else {
      // try trace subdir copy
      const alt = path.join(OUT_DIR, ROW_KEY, name);
      if (await fileExists(alt)) {
        await copyFile(alt, dest);
        await copyFile(alt, mediaDest);
        pngCount += 1;
        rootCopies.push(dest);
      }
    }
  }

  // Flatten timeline to timeline.md at root
  const timelineSrc =
    result.timelineMd ||
    path.join(OUT_DIR, `01-row-${ROW_KEY}-timeline.md`);
  if (await fileExists(timelineSrc)) {
    await copyFile(timelineSrc, path.join(OUT_DIR, "timeline.md"));
  }

  const readme = [
    "# layered-smoke-4 — S57 Client score set",
    "",
    `- **pipeline:** \`layered_html\` (bg image + HTML/CSS Puppeteer)`,
    `- **row:** useful \`${ROW_KEY}\` — ${sheetRow.topic}`,
    `- **slides:** ${SLIDES} (forced for Client score; auto-7 may apply elsewhere)`,
    `- **draftId:** \`${result.draftId}\``,
    `- **jobId:** \`${result.jobId ?? "?"}\``,
    `- **PNG count:** ${pngCount} (budget cap ${HARD_PNG_CAP})`,
    `- **vision:** OFF`,
    `- **needs_review:** ${result.needs_review}`,
    "",
    "## Files",
    "",
    ...rootCopies.map((p) => `- \`${path.relative(process.cwd(), p)}\``),
    `- \`timeline.md\``,
    `- mirror: \`generatedMedia/layered-smoke-4/\``,
    "",
    "## Accept notes",
    "",
    "Compare craft vs etalon `#3` in `generatedMedia/эталон карусели/layered-html-refs-2026-10-17/`.",
    "Invent layout OK — not pixel-clone.",
    "",
  ].join("\n");

  await writeFile(path.join(OUT_DIR, "README.md"), readme, "utf8");
  await writeFile(path.join(MEDIA_MIRROR, "README.md"), readme, "utf8");

  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-layered-4] done", {
    pngCount,
    draftId: result.draftId,
    outDir: path.relative(process.cwd(), OUT_DIR),
  });

  if (pngCount < SLIDES || pngCount > HARD_PNG_CAP) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console -- smoke
  console.error(
    "[smoke-layered-4] fatal",
    err instanceof Error ? err.message : err,
  );
  process.exitCode = 1;
});
