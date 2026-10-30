/**
 * CONTROL generation — 4-slide carousel through OUR strengthened pipeline.
 * Topic: «Лучшие армянские заведения Москвы». CTA = share favourite spots in comments.
 * ONE generation only. Two script masks (Scriptwriter + LLM script Art Director),
 * then Mode B image gen, then vision Art Director (Sonnet).
 *
 *   node node_modules/tsx/dist/cli.mjs scripts/gen-armspots-moscow.ts
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

const TRACE_DIR = path.join("docs", "карусель тест", "armspots-moscow-4");
process.env.CAROUSEL_PIPELINE = "layered_html";
process.env.CAROUSEL_PROMPT_TRACE = "1";
process.env.CAROUSEL_PROMPT_TRACE_DIR = TRACE_DIR;

const USER_ID = process.env.CF_DEV_USER_ID?.trim() || SEED_ADMIN_USER_ID;
const OUT_DIR = path.join(process.cwd(), "generatedMedia", "gen-armspots-moscow-4");

function ts() {
  return new Date().toISOString().slice(11, 23);
}
function log(stage: string, msg: string) {
  // eslint-disable-next-line no-console
  console.log(`[${ts()}] ${stage} ${msg}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  log("ORCHESTRATOR", `start userId=${USER_ID} pipeline=layered_html slides=4 (ONE generation)`);
  log(
    "MODELS",
    `scriptwriter=${process.env.CAROUSEL_SCRIPTWRITER_MODEL || process.env.AGGREGATOR_DEFAULT_MODEL || "(default)"} | script-AD=${process.env.CAROUSEL_MODEL_AD_SCRIPT || "(default)"} | final-AD=${process.env.ART_DIRECTOR_MODEL || "(default)"}`,
  );

  const CTA = "Делитесь любимыми армянскими местами Москвы в комментариях";
  const row: NormalizedSheetRow = {
    mode: "useful",
    sheetRowKey: "armspots-moscow",
    topic: "Лучшие армянские заведения Москвы",
    notes:
      "Гастрогид: куда пойти за настоящей армянской кухней и атмосферой в Москве. Конкретные заведения/рынки/пекарни с ориентиром по районам, чем славится каждое, для кого, лайфхак по выбору. Тёплый, аппетитный, с конкретикой — без воды.",
    cta_type: 2,
    meta: { cta: CTA },
    hero: null,
    slides: 4,
    statusRaw: "",
    pickable: true,
  };
  log("SCRIPTWRITER", `topic="${row.topic}" slides=${row.slides} cta="${CTA}"`);

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
    cta: CTA,
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
  report.needs_review = result.needs_review;

  // Finals live in the vernatun job dir.
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

  // Final Art Director verdict (Sonnet vision).
  const ad = result.artDirectorReview;
  if (ad) {
    report.artDirector = { verdict: ad.verdict, score: ad.score, remarks: ad.remarks?.length ?? 0 };
    log("AD", `verdict=${ad.verdict} score=${ad.score ?? "?"} remarks=${ad.remarks?.length ?? 0}`);
    const md: string[] = [
      `# AD VERDICT (control) — ${ad.verdict}`,
      "",
      `- verdict: **${ad.verdict}**`,
      ad.score != null ? `- score: ${ad.score}` : "",
      "",
      "## Summary",
      ad.summary ?? "(none)",
      "",
      "## Remarks",
      ...(ad.remarks ?? []).map(
        (r) => `- **Slide ${r.slideIndex}** · \`${r.category}\` · ${r.severity} — ${r.note}`,
      ),
    ];
    await writeFile(path.join(OUT_DIR, "AD_VERDICT.md"), md.filter(Boolean).join("\n"), "utf8");
  } else {
    log("AD", "no verdict (see agent logs)");
  }

  // Capture the image prompts (to confirm CTA flew into the image prompt).
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
  console.error("[gen-armspots] fatal", err instanceof Error ? err.stack : err);
  process.exitCode = 1;
});
