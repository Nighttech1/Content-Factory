/**
 * FINAL control generation — 4-slide carousel, CTA FLAG 3 (сохрани + подпишись).
 * Topic: «Армянские десерты, которые стоит попробовать» (roundup → fits flag 3).
 * ONE generation. Two script masks (Scriptwriter + LLM script-AD) write TOWARD the
 * flag-3 CTA; LLM Art Director places vocab pills by reading the background; final
 * vision AD (Sonnet) verdict. Full log.
 *
 *   node node_modules/tsx/dist/cli.mjs scripts/gen-final-flag3.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolve } from "node:path";

import { SEED_ADMIN_USER_ID } from "../lib/db/actor";
import { runCorrectPipelineFromRow } from "../lib/intake/correct-pipeline-job";
import type { NormalizedSheetRow } from "../lib/intake/types";

function loadDotEnv(filePath: string) {
  if (!existsSync(filePath)) return;
  for (const raw of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env) || !process.env[key]) process.env[key] = val;
  }
}
loadDotEnv(resolve(process.cwd(), ".env"));
loadDotEnv(resolve(process.cwd(), ".env.local"));

const TRACE_DIR = path.join("docs", "карусель тест", "final-flag3");
process.env.CAROUSEL_PIPELINE = "layered_html";
process.env.CAROUSEL_PROMPT_TRACE = "1";
process.env.CAROUSEL_PROMPT_TRACE_DIR = TRACE_DIR;

const USER_ID = process.env.CF_DEV_USER_ID?.trim() || SEED_ADMIN_USER_ID;
const OUT_DIR = path.join(process.cwd(), "generatedMedia", "gen-final-flag3");

function ts() {
  return new Date().toISOString().slice(11, 23);
}
function log(stage: string, msg: string) {
  // eslint-disable-next-line no-console
  console.log(`[${ts()}] ${stage} ${msg}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  log("ORCHESTRATOR", `start userId=${USER_ID} pipeline=layered_html slides=4 FLAG=3 (ONE generation)`);
  log(
    "MODELS",
    `scriptwriter=${process.env.CAROUSEL_SCRIPTWRITER_MODEL || process.env.AGGREGATOR_DEFAULT_MODEL || "(default)"} | script-AD=${process.env.CAROUSEL_MODEL_AD_SCRIPT || "(default)"} | final-AD=${process.env.ART_DIRECTOR_MODEL || "(default)"}`,
  );

  const row: NormalizedSheetRow = {
    mode: "useful",
    sheetRowKey: "arm-desserts-flag3",
    topic: "Армянские десерты, которые стоит попробовать",
    notes:
      "Полезная подборка: гата, пахлава по-армянски, суджух (ореховый чучхела), алани, шербет — чем каждый особенен, где искать настоящий вкус, как отличить фабричное от домашнего. Тёплый, аппетитный, с конкретикой. Подборка, которую хочется сохранить.",
    cta_type: 3,
    hero: null,
    slides: 4,
    statusRaw: "",
    pickable: true,
  };
  log("SCRIPTWRITER", `topic="${row.topic}" slides=${row.slides} cta_flag=3 (сохрани+подпишись)`);

  const started = Date.now();
  let result;
  try {
    result = await runCorrectPipelineFromRow({
      userId: USER_ID,
      row,
      publishMode: "manual",
    });
  } catch (err) {
    log("FATAL", err instanceof Error ? `${err.message}\n${err.stack}` : String(err));
    process.exitCode = 1;
    return;
  }
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  log("PIPELINE", `finished in ${secs}s ok=${result.ok}`);

  const report: Record<string, unknown> = {
    topic: row.topic,
    cta_flag: 3,
    slides: row.slides,
    jobId: result.jobId,
    ok: result.ok,
    runSeconds: Number(secs),
  };

  if (!result.ok) {
    log("PIPELINE", `FAILED error=${result.error} needs_input=${result.needs_input}`);
    report.error = result.error;
    await writeFile(path.join(OUT_DIR, "RUN_REPORT.json"), JSON.stringify(report, null, 2), "utf8");
    process.exitCode = 1;
    return;
  }

  const jobId = result.jobId!;
  report.draftId = result.draftId;

  const vjRendered = path.join(process.cwd(), "generatedMedia", "vernatun-jobs", jobId, "rendered");
  let copied = 0;
  for (let i = 1; i <= 8; i++) {
    const n = String(i).padStart(2, "0");
    const src = path.join(vjRendered, `slide_${n}.png`);
    if (!existsSync(src)) continue;
    await copyFile(src, path.join(OUT_DIR, `slide_${n}.png`));
    copied += 1;
  }
  report.pngCopied = copied;
  log("MONTAGE", `copied ${copied} final PNG(s) → ${OUT_DIR}`);

  // Vocab plaque placement log (confirm AD-vision, not fallback).
  const vocabBake = path.join(process.cwd(), "generatedMedia", "vernatun-jobs", jobId, "prompts", "vocab_bake.json");
  if (existsSync(vocabBake)) {
    await copyFile(vocabBake, path.join(OUT_DIR, "vocab_bake.json"));
    try {
      const vb = JSON.parse(await readFile(vocabBake, "utf8")) as { slides?: Array<{ slideIndex: number; detectSource?: string; left: number; top: number }> };
      for (const s of vb.slides ?? []) {
        log("VOCAB-PLACE", `slide ${s.slideIndex}: source=${s.detectSource} at (${s.left},${s.top})`);
      }
    } catch { /* optional */ }
  }

  const ad = result.artDirectorReview;
  if (ad) {
    report.artDirector = { verdict: ad.verdict, score: ad.score, remarks: ad.remarks?.length ?? 0 };
    log("AD", `verdict=${ad.verdict} score=${ad.score ?? "?"} remarks=${ad.remarks?.length ?? 0}`);
    const md: string[] = [
      `# AD VERDICT (final · flag 3) — ${ad.verdict}`,
      "",
      `- verdict: **${ad.verdict}**`,
      ad.score != null ? `- score: ${ad.score}` : "",
      "",
      "## Summary",
      ad.summary ?? "(none)",
      "",
      "## Remarks",
      ...(ad.remarks ?? []).map((r) => `- **Slide ${r.slideIndex}** · \`${r.category}\` · ${r.severity} — ${r.note}`),
    ];
    await writeFile(path.join(OUT_DIR, "AD_VERDICT.md"), md.filter(Boolean).join("\n"), "utf8");
  } else {
    log("AD", "no verdict (see agent logs)");
  }

  // Capture CTA slide image prompt (confirm CTA = image-LLM by flag).
  const promptsDir = path.join(process.cwd(), "generatedMedia", "vernatun-jobs", jobId, "prompts");
  for (const f of ["slide_04_image_prompt.md", "01_script_out.json"]) {
    const src = path.join(promptsDir, f);
    if (existsSync(src)) await copyFile(src, path.join(OUT_DIR, f));
  }

  if (result.timelineMd && existsSync(result.timelineMd)) {
    await copyFile(result.timelineMd, path.join(OUT_DIR, "timeline.md"));
  }
  await writeFile(path.join(OUT_DIR, "RUN_REPORT.json"), JSON.stringify(report, null, 2), "utf8");
  log("DONE", `report → ${path.join(OUT_DIR, "RUN_REPORT.json")}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[gen-final-flag3] fatal", err instanceof Error ? err.stack : err);
  process.exitCode = 1;
});
