/**
 * Wave 2026-10-18 vision-style-copy — ONE × 6 layered smoke (Variant A in_image).
 *
 *   npx tsx scripts/smoke-vision-style-copy.ts
 *
 * styleCopyMode=vision_ref · characterPaint=in_image · pack 01 RE orange
 * useful row #17 kitchen (or SMOKE_ROW override)
 * → docs/карусель тест/vision-style-copy-smoke-A-in-image-6/
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
  assertVisionRefPromptBanClean,
} from "../lib/studio/create-carousel-prompts";
import {
  LAYOUT_COPY_CONDUCTOR_NUMBER,
  SEED_RE_ORANGE_ID,
} from "../lib/settings/design-presets/layout-copy-seeds";
import { mapSlideToRefSlot } from "../lib/studio/style-copy-slots";
import { seedLayoutCopyDualChar } from "./seed-layout-copy-dual-char";

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
const ROW = process.env.SMOKE_ROW?.trim() || "17";
const OUT_DIR_NAME = "vision-style-copy-smoke-A-in-image-6";
const OUT_DIR = path.join(process.cwd(), "docs", "карусель тест", OUT_DIR_NAME);
const MEDIA_MIRROR = path.join(process.cwd(), "generatedMedia", OUT_DIR_NAME);

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
        note: "reset by smoke-vision-style-copy",
      },
      null,
      2,
    ),
    "utf8",
  );
}

function expectedSlotMap(n: number): string[] {
  return Array.from({ length: n }, (_, i) => mapSlideToRefSlot(i + 1, n));
}

async function main() {
  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-vision-style-copy] start", {
    row: ROW,
    slides: SLIDES,
    styleCopyMode: "vision_ref",
    characterPaint: "in_image",
    pack: "re_orange_01",
    outDir: OUT_DIR,
    slotMap: expectedSlotMap(SLIDES),
    hasKey: hasAggregatorKey(),
  });

  if (!hasAggregatorKey()) {
    // eslint-disable-next-line no-console -- smoke
    console.error("[smoke-vision-style-copy] BLOCKER: no aggregator key");
    process.exitCode = 1;
    return;
  }

  // Ensure design 01 + Ануш conductor exist
  await seedLayoutCopyDualChar(USER_ID);

  const preflight = await runSheetPreflight("useful");
  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-vision-style-copy] sheet preflight", {
    ok: preflight.ok,
    tabs: preflight.tabs?.map((t) => `${t.mode}:${t.gid}`).slice(0, 8),
  });

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(MEDIA_MIRROR, { recursive: true });
  await resetWavePngBudget();

  process.env.CAROUSEL_PROMPT_TRACE_DIR = path.join(
    "docs",
    "карусель тест",
    OUT_DIR_NAME,
  );

  const sheetRow = await findSheetRow("useful", ROW);
  if (!sheetRow) {
    await writeFile(
      path.join(OUT_DIR, "README.md"),
      [
        `# ${OUT_DIR_NAME} — FAILED`,
        "",
        `Row ${ROW} not found on useful sheet.`,
        "",
      ].join("\n"),
      "utf8",
    );
    process.exitCode = 1;
    return;
  }

  const result = await runCorrectPipelineGenerate({
    userId: USER_ID,
    mode: "useful",
    sheetRowKey: ROW,
    slides: SLIDES,
    force: true,
    publishMode: "manual",
    characterPaint: "in_image",
    forceHero: LAYOUT_COPY_CONDUCTOR_NUMBER,
    styleCopyMode: "vision_ref",
    styleCopyPackId: "re_orange_01",
  });

  if (!result.ok) {
    // eslint-disable-next-line no-console -- smoke
    console.error("[smoke-vision-style-copy] FAIL:", result.error);
    if (result.designerPromptDump) {
      await writeFile(
        path.join(OUT_DIR, "timeline-prompt-full.md"),
        [
          "# Designer prompt dump (FAILED draw)",
          "",
          `- styleCopyMode: \`${result.designerPromptDump.styleCopyMode}\``,
          `- FULL_inject_skipped: ${result.designerPromptDump.FULL_inject_skipped}`,
          `- referenceImageAttached: ${result.designerPromptDump.referenceImageAttached}`,
          "",
          "## System",
          "",
          "```markdown",
          result.designerPromptDump.system,
          "```",
          "",
          "## User",
          "",
          "```text",
          result.designerPromptDump.user,
          "```",
          "",
        ].join("\n"),
        "utf8",
      );
    }
    await writeFile(
      path.join(OUT_DIR, "README.md"),
      [
        `# ${OUT_DIR_NAME} — FAILED`,
        "",
        `Error: ${result.error}`,
        "",
        `- styleCopyMode: \`vision_ref\``,
        `- characterPaint: \`in_image\``,
        `- pack: \`re_orange_01\``,
        `- sheet row: ${ROW}`,
        `- topic: ${sheetRow.topic.slice(0, 120)}`,
        "",
      ].join("\n"),
      "utf8",
    );
    process.exitCode = 1;
    return;
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
    result.timelineMd || path.join(OUT_DIR, `01-row-${ROW}-timeline.md`);
  if (await fileExists(timelineSrc)) {
    await copyFile(timelineSrc, path.join(OUT_DIR, "timeline.md"));
  }

  // Full Designer system+user for ban proof
  const dump = result.designerPromptDump;
  const combined = dump
    ? `${dump.system}\n\n${dump.user}`
    : "";
  const ban = combined
    ? assertVisionRefPromptBanClean(combined)
    : { ok: false as const, reason: "no_designer_prompt_dump" };

  const promptFullLines = [
    `# timeline-prompt-full — ${OUT_DIR_NAME}`,
    "",
    `- wave: 2026-10-18-vision-style-copy`,
    `- styleCopyMode: \`vision_ref\``,
    `- characterPaint: \`in_image\``,
    `- pack: \`re_orange_01\` (01 RE orange grid)`,
    `- FULL_inject_skipped: ${dump?.FULL_inject_skipped ?? "?"}`,
    `- referenceImageAttached: ${dump?.referenceImageAttached ?? false}`,
    `- referenceImageCount: ${dump?.referenceImageCount ?? 0}`,
    `- ban_assert: ${ban.ok ? "PASS" : `FAIL (${"reason" in ban ? ban.reason : "?"})`}`,
    "",
    "## Slot map (N=6)",
    "",
    "```",
    (
      result.styleCopySlotMap ??
      expectedSlotMap(SLIDES).map((slot, i) => ({
        slide: i + 1,
        slot,
        refPath: undefined as string | undefined,
      }))
    )
      .map((m) => `${m.slide}→${m.slot}${m.refPath ? ` · ${m.refPath}` : ""}`)
      .join("\n"),
    "```",
    "",
    "## Designer SYSTEM (full)",
    "",
    "```markdown",
    dump?.system ?? "_(missing)_",
    "```",
    "",
    "## Designer USER (full)",
    "",
    "```text",
    dump?.user ?? "_(missing)_",
    "```",
    "",
    "_Secrets redacted — no API keys._",
    "",
  ];
  await writeFile(
    path.join(OUT_DIR, "timeline-prompt-full.md"),
    promptFullLines.join("\n"),
    "utf8",
  );

  const meta = {
    wave: "2026-10-18-vision-style-copy",
    arm: "A",
    styleCopyMode: "vision_ref",
    character_path: "in_image",
    characterPaint: "in_image",
    styleCopyPackId: result.styleCopyPackId ?? "re_orange_01",
    sheetRowKey: ROW,
    topic: sheetRow.topic,
    usefulGid: DEFAULT_USEFUL_GID,
    slides: SLIDES,
    pngCount,
    designActiveId: SEED_RE_ORANGE_ID,
    hero: LAYOUT_COPY_CONDUCTOR_NUMBER,
    conductor: "Ануш",
    slotMap: result.styleCopySlotMap ?? expectedSlotMap(SLIDES),
    FULL_inject_skipped: dump?.FULL_inject_skipped ?? true,
    referenceImageAttached: dump?.referenceImageAttached ?? false,
    banAssertOk: ban.ok,
    banAssertReason: ban.ok ? null : ("reason" in ban ? ban.reason : null),
    draftId: result.draftId,
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
      `# ${OUT_DIR_NAME}`,
      "",
      `- styleCopyMode: \`vision_ref\``,
      `- characterPaint: \`in_image\``,
      `- pack: **01** RE orange`,
      `- useful row: **${ROW}** — ${sheetRow.topic.slice(0, 100)}`,
      `- PNG: **${pngCount}/${SLIDES}**`,
      `- ban assert: ${ban.ok ? "PASS (no Manrope / typography.scale / FULL TOKEN)" : "FAIL"}`,
      `- timeline: \`timeline.md\` + \`timeline-prompt-full.md\``,
      "",
      "Alias prior arm A path (layout-copy) not overwritten — wave-named dir is SoT.",
      "",
    ].join("\n"),
    "utf8",
  );

  const ok = pngCount === SLIDES && ban.ok;
  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-vision-style-copy] DONE", {
    ok,
    pngCount,
    banOk: ban.ok,
    outDir: OUT_DIR,
    draftId: result.draftId,
  });
  if (!ok) process.exitCode = 1;
}

main().catch((err) => {
  // eslint-disable-next-line no-console -- smoke
  console.error("[smoke-vision-style-copy] fatal", err);
  process.exitCode = 1;
});
