/**
 * Variant A + Art Director smoke — ONE 4-slide layered carousel + AD review text.
 * NO remake after AD.
 *
 *   npx tsx scripts/smoke-variant-a-ad.ts
 *
 * Output: docs/карусель тест/variant-a-ad-smoke/
 *   slide_01…04.png · timeline.md · art-director-review.md|.json
 */

import { existsSync, readFileSync } from "node:fs";
import { access, copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolve } from "node:path";

import { SEED_ADMIN_USER_ID } from "../lib/db/actor";
import { runCorrectPipelineGenerate } from "../lib/intake/correct-pipeline-job";
import { DEFAULT_USEFUL_GID } from "../lib/intake/sheet-config";
import { findSheetRow, runSheetPreflight } from "../lib/intake/sheet-client";
import {
  formatArtDirectorReviewMarkdown,
  runArtDirectorReview,
} from "../lib/studio/art-director-run";

const OUT_DIR = path.join(
  process.cwd(),
  "docs",
  "карусель тест",
  "variant-a-ad-smoke",
);
const MEDIA_MIRROR = path.join(
  process.cwd(),
  "generatedMedia",
  "variant-a-ad-smoke",
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
        note: "reset by smoke-variant-a-ad",
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
  "variant-a-ad-smoke",
);
// Pipeline already runs AD once — smoke may re-run AD on copied paths for artifact;
// skip inline AD during gen to avoid double LLM cost, then call AD explicitly below.
process.env.CAROUSEL_SKIP_ART_DIRECTOR = "1";

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
  console.log("[smoke-variant-a-ad] start", {
    userId: USER_ID,
    usefulGid: DEFAULT_USEFUL_GID,
    slides: SLIDES,
    row: ROW_KEY,
    outDir: OUT_DIR,
    hasKey: hasAggregatorKey(),
    pipeline: process.env.CAROUSEL_PIPELINE,
  });

  await resetWavePngBudgetForSmoke();
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(MEDIA_MIRROR, { recursive: true });

  if (!hasAggregatorKey()) {
    // eslint-disable-next-line no-console -- smoke
    console.error(
      "[smoke-variant-a-ad] FAIL: no AGGREGATOR_API_KEY / CAROUSEL_API_KEY",
    );
    await writeFile(
      path.join(OUT_DIR, "README.md"),
      ["# variant-a-ad-smoke — FAILED", "", "Missing aggregator key.", ""].join(
        "\n",
      ),
      "utf8",
    );
    process.exitCode = 1;
    return;
  }

  const preflight = await runSheetPreflight("useful");
  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-variant-a-ad] preflight", {
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
    console.error(`[smoke-variant-a-ad] row ${ROW_KEY} not found`);
    process.exitCode = 1;
    return;
  }

  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-variant-a-ad] generating", {
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
    console.error("[smoke-variant-a-ad] FAIL:", result.error);
    await writeFile(
      path.join(OUT_DIR, "README.md"),
      [
        "# variant-a-ad-smoke — FAILED",
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
    }
  }

  const timelineSrc =
    result.timelineMd ||
    path.join(OUT_DIR, `01-row-${ROW_KEY}-timeline.md`);
  if (await fileExists(timelineSrc)) {
    await copyFile(timelineSrc, path.join(OUT_DIR, "timeline.md"));
  }

  // Art Director ONCE on finals — NO remake after
  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-variant-a-ad] Art Director review (no remake)…");
  const ad = await runArtDirectorReview({
    userId: USER_ID,
    draftId: result.draftId,
    jobId: result.jobId,
    slideUrls: rootCopies.length === SLIDES ? rootCopies : absPaths,
    briefMeta: {
      idea: sheetRow.topic.slice(0, 120),
      mode: "useful",
      renderMode: "layered_html",
    },
    appendLog: true,
  });

  if (!ad.ok) {
    // eslint-disable-next-line no-console -- smoke
    console.error("[smoke-variant-a-ad] AD FAIL:", ad.error);
    await writeFile(
      path.join(OUT_DIR, "art-director-review.md"),
      [
        "# Art Director review — FAILED",
        "",
        `Error: ${ad.error}`,
        "",
        "**NO remake** attempted.",
        "",
      ].join("\n"),
      "utf8",
    );
    process.exitCode = 1;
  } else {
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
    await writeFile(
      path.join(MEDIA_MIRROR, "art-director-review.md"),
      md,
      "utf8",
    );
    // eslint-disable-next-line no-console -- smoke
    console.log("[smoke-variant-a-ad] AD", {
      verdict: ad.verdict.verdict,
      remarks: ad.verdict.remarks?.length ?? 0,
      remakeEnqueued: false,
    });
  }

  const readme = [
    "# variant-a-ad-smoke — Variant A html_layout + Art Director",
    "",
    `- **pipeline:** \`layered_html\` + Designer \`html_layout\` + AD review`,
    `- **row:** useful \`${ROW_KEY}\` — ${sheetRow.topic}`,
    `- **slides:** ${SLIDES}`,
    `- **draftId:** \`${result.draftId}\``,
    `- **jobId:** \`${result.jobId ?? "?"}\``,
    `- **PNG count:** ${pngCount} (cap ${HARD_PNG_CAP})`,
    `- **AD remake:** **NO** (stop after review text)`,
    "",
    "## Files",
    "",
    ...rootCopies.map((p) => `- \`${path.relative(process.cwd(), p)}\``),
    `- \`timeline.md\``,
    `- \`art-director-review.md\``,
    `- \`art-director-review.json\``,
    "",
  ].join("\n");

  await writeFile(path.join(OUT_DIR, "README.md"), readme, "utf8");
  await writeFile(path.join(MEDIA_MIRROR, "README.md"), readme, "utf8");

  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-variant-a-ad] done", {
    pngCount,
    draftId: result.draftId,
    outDir: path.relative(process.cwd(), OUT_DIR),
    remakeEnqueued: false,
  });

  if (pngCount < SLIDES || pngCount > HARD_PNG_CAP) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console -- smoke
  console.error(
    "[smoke-variant-a-ad] fatal",
    err instanceof Error ? err.message : err,
  );
  process.exitCode = 1;
});
