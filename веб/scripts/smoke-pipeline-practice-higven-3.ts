/**
 * Wave 2026-10-18 pipeline-practice-higven-3 — ONE × 3 layered smoke.
 *
 *   npx tsx scripts/smoke-pipeline-practice-higven-3.ts
 *
 * styleCopyMode=vision_ref · characterPaint=none · pack higven_01 · N=3
 * Brand full vernatun-logo.png · Scriptwriter Haiku
 * → docs/карусель тест/pipeline-practice-higven-3/
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
  HIGVEN_3_PARALLEL_PACK_HARD,
  assertVisionRefPromptBanClean,
} from "../lib/studio/create-carousel-prompts";
import {
  HIGVEN_PACK_ID,
  SEED_HIGVEN_01_ID,
} from "../lib/settings/design-presets/higven-seeds";
import { mapSlideToRefSlot } from "../lib/studio/style-copy-slots";
import { seedPipelinePracticeHigven3 } from "./seed-pipeline-practice-higven-3";

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
// HIGVEN-3 locks: Scriptwriter Haiku · Designer chat GPT
process.env.CAROUSEL_SCRIPTWRITER_MODEL =
  process.env.CAROUSEL_SCRIPTWRITER_MODEL?.trim() ||
  "anthropic/claude-haiku-4.5";
process.env.DESIGNER_TEXT_MODEL =
  process.env.DESIGNER_TEXT_MODEL?.trim() || "openai/gpt-4.1";

const USER_ID = process.env.CF_DEV_USER_ID?.trim() || SEED_ADMIN_USER_ID;
const SLIDES = 3;
const ROW = process.env.SMOKE_ROW?.trim() || "17";
const ATTEMPT = Number(process.env.SMOKE_ATTEMPT?.trim() || "1") || 1;
const OUT_DIR_NAME = "pipeline-practice-higven-3";
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
        max: 40,
        updatedAt: new Date().toISOString(),
        note: "reset by smoke-pipeline-practice-higven-3",
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
  console.log("[smoke-pipeline-practice-higven-3] start", {
    attempt: ATTEMPT,
    row: ROW,
    slides: SLIDES,
    styleCopyMode: "vision_ref",
    characterPaint: "none",
    pack: HIGVEN_PACK_ID,
    outDir: OUT_DIR,
    slotMap: expectedSlotMap(SLIDES),
    scriptwriter: process.env.CAROUSEL_SCRIPTWRITER_MODEL,
    designerText: process.env.DESIGNER_TEXT_MODEL,
    hasKey: hasAggregatorKey(),
    higvenOverlayChars: HIGVEN_3_PARALLEL_PACK_HARD.length,
  });

  if (!hasAggregatorKey()) {
    // eslint-disable-next-line no-console -- smoke
    console.error("[smoke-higven-3] BLOCKER: no aggregator key");
    process.exitCode = 1;
    return;
  }

  const seed = await seedPipelinePracticeHigven3(USER_ID);
  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-higven-3] seed", seed);

  const preflight = await runSheetPreflight("useful");
  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-higven-3] sheet preflight", {
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
    characterPaint: "none",
    // no forceHero — character none
    styleCopyMode: "vision_ref",
    styleCopyPackId: HIGVEN_PACK_ID,
  });

  if (!result.ok) {
    // eslint-disable-next-line no-console -- smoke
    console.error("[smoke-higven-3] FAIL:", result.error);
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
        `# ${OUT_DIR_NAME} — FAILED (attempt ${ATTEMPT})`,
        "",
        `Error: ${result.error}`,
        "",
        `- styleCopyMode: \`vision_ref\``,
        `- characterPaint: \`none\``,
        `- pack: \`${HIGVEN_PACK_ID}\``,
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
    const name = `slide_${String(i + 1).padStart(2, "0")}.png`;
    const src = absPaths[i];
    if (src && (await fileExists(src))) {
      await copyFile(src, path.join(OUT_DIR, name));
      await copyFile(src, path.join(MEDIA_MIRROR, name));
      pngCount += 1;
    }
    const htmlSrc = (src ?? "").replace(/\.png$/i, ".html");
    if (htmlSrc && (await fileExists(htmlSrc))) {
      await copyFile(
        htmlSrc,
        path.join(OUT_DIR, name.replace(/\.png$/, ".html")),
      );
    }
  }

  const timelineSrc =
    result.timelineMd || path.join(OUT_DIR, `01-row-${ROW}-timeline.md`);
  if (await fileExists(timelineSrc)) {
    await copyFile(timelineSrc, path.join(OUT_DIR, "timeline.md"));
  }

  const dump = result.designerPromptDump;
  const combined = dump ? `${dump.system}\n\n${dump.user}` : "";
  const ban = combined
    ? assertVisionRefPromptBanClean(combined)
    : { ok: false as const, reason: "no_designer_prompt_dump" };
  const hasHigvenOverlay =
    Boolean(dump?.system?.includes("HIGVEN-3 PARALLEL PACK")) ||
    Boolean(dump?.user?.includes("HIGVEN-3"));

  await writeFile(
    path.join(OUT_DIR, "timeline-prompt-full.md"),
    [
      `# timeline-prompt-full — ${OUT_DIR_NAME}`,
      "",
      `- wave: 2026-10-18-pipeline-practice-higven-3`,
      `- attempt: ${ATTEMPT}`,
      `- styleCopyMode: \`vision_ref\``,
      `- characterPaint: \`none\``,
      `- pack: \`${HIGVEN_PACK_ID}\``,
      `- designActiveId: \`${SEED_HIGVEN_01_ID}\``,
      `- logoRef: \`/brand/vernatun-logo.png\``,
      `- scriptwriter: \`${process.env.CAROUSEL_SCRIPTWRITER_MODEL}\``,
      `- designerText: \`${process.env.DESIGNER_TEXT_MODEL}\``,
      `- FULL_inject_skipped: ${dump?.FULL_inject_skipped ?? "?"}`,
      `- referenceImageAttached: ${dump?.referenceImageAttached ?? false}`,
      `- higven_overlay: ${hasHigvenOverlay}`,
      `- ban_assert: ${ban.ok ? "PASS" : `FAIL (${"reason" in ban ? ban.reason : "?"})`}`,
      "",
      "## Slot map (N=3 · cover → midA → cta)",
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
    ].join("\n"),
    "utf8",
  );

  const meta = {
    wave: "2026-10-18-pipeline-practice-higven-3",
    attempt: ATTEMPT,
    styleCopyMode: "vision_ref",
    character_path: "none",
    characterPaint: "none",
    styleCopyPackId: result.styleCopyPackId ?? HIGVEN_PACK_ID,
    sheetRowKey: ROW,
    topic: sheetRow.topic,
    usefulGid: DEFAULT_USEFUL_GID,
    slides: SLIDES,
    pngCount,
    designActiveId: seed.activeId ?? SEED_HIGVEN_01_ID,
    logoRef: seed.logoRef,
    scriptwriterModel: process.env.CAROUSEL_SCRIPTWRITER_MODEL,
    designerTextModel: process.env.DESIGNER_TEXT_MODEL,
    slotMap: result.styleCopySlotMap ?? expectedSlotMap(SLIDES),
    FULL_inject_skipped: dump?.FULL_inject_skipped ?? true,
    referenceImageAttached: dump?.referenceImageAttached ?? false,
    higvenOverlayPresent: hasHigvenOverlay,
    banAssertOk: ban.ok,
    banAssertReason: ban.ok ? null : "reason" in ban ? ban.reason : null,
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
      `# ${OUT_DIR_NAME} (attempt ${ATTEMPT})`,
      "",
      `- styleCopyMode: \`vision_ref\``,
      `- characterPaint: \`none\``,
      `- pack: **01 HIGVEN** (\`${HIGVEN_PACK_ID}\`)`,
      `- brand logo: **full** \`/brand/vernatun-logo.png\``,
      `- useful row: **${ROW}** — ${sheetRow.topic.slice(0, 100)}`,
      `- PNG: **${pngCount}/${SLIDES}**`,
      `- HIGVEN overlay in prompt: ${hasHigvenOverlay ? "yes" : "no"}`,
      `- ban assert: ${ban.ok ? "PASS" : "FAIL"}`,
      `- timeline: \`timeline.md\` + \`timeline-prompt-full.md\``,
      "",
    ].join("\n"),
    "utf8",
  );

  const ok =
    pngCount === SLIDES &&
    ban.ok &&
    seed.activeId === SEED_HIGVEN_01_ID &&
    seed.logoRef.includes("vernatun-logo");
  // eslint-disable-next-line no-console -- smoke
  console.log("[smoke-pipeline-practice-higven-3] DONE", {
    ok,
    attempt: ATTEMPT,
    pngCount,
    banOk: ban.ok,
    higvenOverlay: hasHigvenOverlay,
    outDir: OUT_DIR,
    draftId: result.draftId,
  });
  if (!ok) process.exitCode = 1;
}

main().catch((err) => {
  // eslint-disable-next-line no-console -- smoke
  console.error("[smoke-pipeline-practice-higven-3] fatal", err);
  process.exitCode = 1;
});
