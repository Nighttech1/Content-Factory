/**
 * Wave 2026-10-18 layout-copy-dual-char — TWO × 6-slide layered smokes.
 *
 *   npx tsx scripts/smoke-layout-copy-dual-char.ts
 *   SMOKE_ARM=A|B|both  SMOKE_ROW_A=17  SMOKE_ROW_B=13
 *
 * A) characterPaint=in_image  → docs/карусель тест/layout-copy-dual-char-smoke-A-in-image/
 * B) characterPaint=overlay_cutout → …/layout-copy-dual-char-smoke-B-overlay/
 *
 * Active design = RE Orange 01. Hero Ануш #1. force slides=6.
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
  LAYOUT_COPY_CONDUCTOR_NUMBER,
  SEED_RE_ORANGE_ID,
} from "../lib/settings/design-presets/layout-copy-seeds";
import type { CharacterPaintPath } from "../lib/studio/create-carousel-prompts";

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
process.env.CAROUSEL_SKIP_ART_DIRECTOR = "1";

const USER_ID = process.env.CF_DEV_USER_ID?.trim() || SEED_ADMIN_USER_ID;
const SLIDES = 6;
const ARM = (process.env.SMOKE_ARM?.trim() || "both").toLowerCase();
const ROW_A = process.env.SMOKE_ROW_A?.trim() || "17";
const ROW_B = process.env.SMOKE_ROW_B?.trim() || "13";

type ArmSpec = {
  id: "A" | "B";
  characterPaint: CharacterPaintPath;
  rowKey: string;
  outDirName: string;
};

const ARMS: ArmSpec[] = [
  {
    id: "A",
    characterPaint: "in_image",
    rowKey: ROW_A,
    outDirName: "layout-copy-dual-char-smoke-A-in-image",
  },
  {
    id: "B",
    characterPaint: "overlay_cutout",
    rowKey: ROW_B,
    outDirName: "layout-copy-dual-char-smoke-B-overlay",
  },
];

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

async function resetWavePngBudget() {
  const dir = path.join(
    process.cwd(),
    "generatedMedia",
    "wave-visual-deconstructor",
  );
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, "_png_budget.json"),
    JSON.stringify(
      {
        count: 0,
        max: 80,
        updatedAt: new Date().toISOString(),
        note: "reset by smoke-layout-copy-dual-char",
      },
      null,
      2,
    ),
    "utf8",
  );
}

async function runArm(arm: ArmSpec): Promise<boolean> {
  const OUT_DIR = path.join(process.cwd(), "docs", "карусель тест", arm.outDirName);
  const MEDIA_MIRROR = path.join(process.cwd(), "generatedMedia", arm.outDirName);

  process.env.CAROUSEL_PROMPT_TRACE_DIR = path.join(
    "docs",
    "карусель тест",
    arm.outDirName,
  );

  // eslint-disable-next-line no-console -- smoke
  console.log(`[smoke-layout-copy] ARM ${arm.id} start`, {
    characterPaint: arm.characterPaint,
    row: arm.rowKey,
    outDir: OUT_DIR,
    design: SEED_RE_ORANGE_ID,
    hero: LAYOUT_COPY_CONDUCTOR_NUMBER,
  });

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(MEDIA_MIRROR, { recursive: true });
  await resetWavePngBudget();

  const sheetRow = await findSheetRow("useful", arm.rowKey);
  if (!sheetRow) {
    await writeFile(
      path.join(OUT_DIR, "README.md"),
      [`# ${arm.outDirName} — FAILED`, "", `Row ${arm.rowKey} not found.`, ""].join(
        "\n",
      ),
      "utf8",
    );
    return false;
  }

  const result = await runCorrectPipelineGenerate({
    userId: USER_ID,
    mode: "useful",
    sheetRowKey: arm.rowKey,
    slides: SLIDES,
    force: true,
    publishMode: "manual",
    characterPaint: arm.characterPaint,
    forceHero: LAYOUT_COPY_CONDUCTOR_NUMBER,
    // overlay_cutout: SINGLE pose via image model (sheet = style ref).
    // Opt-out only: SMOKE_GEN_CUTOUT_POSES=0 (still crops one cell — never whole sheet).
    generateCutoutPoses:
      arm.characterPaint === "overlay_cutout" &&
      process.env.SMOKE_GEN_CUTOUT_POSES !== "0",
  });

  if (!result.ok) {
    // eslint-disable-next-line no-console -- smoke
    console.error(`[smoke-layout-copy] ARM ${arm.id} FAIL:`, result.error);
    await writeFile(
      path.join(OUT_DIR, "README.md"),
      [
        `# ${arm.outDirName} — FAILED`,
        "",
        `Error: ${result.error}`,
        "",
        `- character_path: \`${arm.characterPaint}\``,
        `- sheet row: ${arm.rowKey}`,
        `- topic: ${sheetRow.topic.slice(0, 120)}`,
        "",
      ].join("\n"),
      "utf8",
    );
    return false;
  }

  const absPaths = result.pngAbsPaths ?? [];
  let pngCount = 0;
  for (let i = 0; i < SLIDES; i++) {
    const src = absPaths[i];
    const name = `slide_${String(i + 1).padStart(2, "0")}.png`;
    if (src && (await fileExists(src))) {
      await copyFile(src, path.join(OUT_DIR, name));
      await copyFile(src, path.join(MEDIA_MIRROR, name));
      pngCount += 1;
    }
    const htmlSrc = (src ?? "").replace(/\.png$/i, ".html");
    if (htmlSrc && (await fileExists(htmlSrc))) {
      await copyFile(htmlSrc, path.join(OUT_DIR, name.replace(/\.png$/, ".html")));
    }
  }

  const timelineSrc =
    result.timelineMd || path.join(OUT_DIR, `01-row-${arm.rowKey}-timeline.md`);
  if (await fileExists(timelineSrc)) {
    await copyFile(timelineSrc, path.join(OUT_DIR, "timeline.md"));
  }

  // Spot-check numbering omit + cutout
  let slideNumFound = false;
  let cutoutImgFound = false;
  for (let i = 0; i < SLIDES; i++) {
    const htmlPath = path.join(
      OUT_DIR,
      `slide_${String(i + 1).padStart(2, "0")}.html`,
    );
    if (!(await fileExists(htmlPath))) continue;
    const html = readFileSync(htmlPath, "utf8");
    if (html.includes('class="slide-num"')) slideNumFound = true;
    if (html.includes('class="character')) cutoutImgFound = true;
  }

  const meta = {
    wave: "2026-10-18-layout-copy-dual-char",
    arm: arm.id,
    character_path: arm.characterPaint,
    characterPaint: arm.characterPaint,
    sheetRowKey: arm.rowKey,
    topic: sheetRow.topic,
    usefulGid: DEFAULT_USEFUL_GID,
    slides: SLIDES,
    pngCount,
    designActiveId: SEED_RE_ORANGE_ID,
    hero: LAYOUT_COPY_CONDUCTOR_NUMBER,
    conductor: "Ануш",
    numberingOmitExpected: true,
    slideNumFound,
    cutoutImgFound,
    draftId: result.ok ? result.draftId : undefined,
    jobId: result.jobId,
    finishedAt: new Date().toISOString(),
  };
  await writeFile(
    path.join(OUT_DIR, "meta.json"),
    JSON.stringify(meta, null, 2),
    "utf8",
  );

  await writeFile(
    path.join(OUT_DIR, "README.md"),
    [
      `# ${arm.outDirName}`,
      "",
      `Wave **2026-10-18 layout-copy-dual-char** — arm **${arm.id}**.`,
      "",
      "| Field | Value |",
      "|-------|-------|",
      `| character_path | \`${arm.characterPaint}\` |`,
      `| useful sheet row | **${arm.rowKey}** |`,
      `| topic | ${sheetRow.topic.slice(0, 100)} |`,
      `| slides | ${SLIDES} PNG (got ${pngCount}) |`,
      `| design active | RE Orange (\`${SEED_RE_ORANGE_ID}\`) |`,
      `| hero / conductor | Ануш #${LAYOUT_COPY_CONDUCTOR_NUMBER} |`,
      `| layoutMap numbering | absent → no \`.slide-num\` (found=${slideNumFound}) |`,
      `| HTML cutout | ${cutoutImgFound} (expected ${arm.characterPaint === "overlay_cutout"}) |`,
      "",
      "## Files",
      "",
      "- `slide_01.png` … `slide_06.png`",
      "- `slide_*.html` (composite source)",
      "- `timeline.md` — Scriptwriter→Designer prompt dump",
      "- `meta.json`",
      "",
      arm.characterPaint === "in_image"
        ? "**A rule:** girl painted WITH scene (conductor to-camera); no separate HTML cutout required."
        : "**B rule:** bg without girl; HTML cutout OVER on cover + last (mandatory).",
      "",
    ].join("\n"),
    "utf8",
  );

  // eslint-disable-next-line no-console -- smoke
  console.log(`[smoke-layout-copy] ARM ${arm.id} done`, {
    pngCount,
    slideNumFound,
    cutoutImgFound,
  });

  return pngCount === SLIDES;
}

async function main() {
  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-layout-copy-dual-char] start", {
    userId: USER_ID,
    arm: ARM,
    rows: { A: ROW_A, B: ROW_B },
    hasKey: hasAggregatorKey(),
  });

  if (!hasAggregatorKey()) {
    // eslint-disable-next-line no-console -- smoke
    console.error("[smoke-layout-copy] FAIL: no aggregator key");
    process.exitCode = 1;
    return;
  }

  // Ensure seeds (idempotent)
  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-layout-copy] seeding designs + landscapes…");
  const { seedLayoutCopyDualChar } = await import("./seed-layout-copy-dual-char");
  await seedLayoutCopyDualChar(USER_ID);

  await resetWavePngBudget();

  const preflight = await runSheetPreflight("useful");
  if (!preflight.ok) {
    // eslint-disable-next-line no-console -- smoke
    console.error("[smoke-layout-copy] sheet preflight failed");
    process.exitCode = 1;
    return;
  }

  const selected =
    ARM === "a"
      ? ARMS.filter((a) => a.id === "A")
      : ARM === "b"
        ? ARMS.filter((a) => a.id === "B")
        : ARMS;

  if (ROW_A === ROW_B && selected.length > 1) {
    // eslint-disable-next-line no-console -- smoke
    console.warn(
      "[smoke-layout-copy] WARN: A and B use same row — lock requires different topics",
    );
  }

  let okAll = true;
  for (const arm of selected) {
    const ok = await runArm(arm);
    if (!ok) okAll = false;
  }

  if (!okAll) process.exitCode = 1;
  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-layout-copy-dual-char] finished", { okAll });
}

main().catch((err) => {
  // eslint-disable-next-line no-console -- smoke
  console.error("[smoke-layout-copy-dual-char] fatal", err);
  process.exitCode = 1;
});
