/**
 * ONE real generation — 4-slide carousel through OUR pipeline.
 * Topic: «Армянские кафе и рестораны в Москве».
 *
 * Runs runCorrectPipelineFromRow with a custom row (not a Google sheet row),
 * captures the full per-stage log (agent-run-logs + prompt-trace timeline),
 * and surfaces the Art Director (LLM) verdict + every weak spot for fixes.
 *
 *   node node_modules/tsx/dist/cli.mjs scripts/gen-armcafe-moscow.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolve } from "node:path";

import { SEED_ADMIN_USER_ID } from "../lib/db/actor";
import { runCorrectPipelineFromRow } from "../lib/intake/correct-pipeline-job";
import { formatArtDirectorReviewMarkdown } from "../lib/studio/art-director-run";
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

const TRACE_DIR = path.join("docs", "карусель тест", "armcafe-moscow-4-modeB");
process.env.CAROUSEL_PIPELINE = "layered_html";
process.env.CAROUSEL_PROMPT_TRACE = "1";
process.env.CAROUSEL_PROMPT_TRACE_DIR = TRACE_DIR;

const USER_ID = process.env.CF_DEV_USER_ID?.trim() || SEED_ADMIN_USER_ID;
const OUT_DIR = path.join(process.cwd(), "generatedMedia", "gen-armcafe-moscow-4-modeB");
const LOG_STORE = path.join(process.cwd(), "data", "local", "agent-run-logs.json");

function ts() {
  return new Date().toISOString().slice(11, 23);
}
function log(stage: string, msg: string) {
  // eslint-disable-next-line no-console
  console.log(`[${ts()}] ${stage} ${msg}`);
}

type LogEntry = {
  jobId?: string;
  agentRole?: string;
  agentId?: string;
  level?: string;
  message?: string;
  meta?: unknown;
  createdAt?: string;
};

async function readLogEntries(): Promise<LogEntry[]> {
  try {
    const raw = await readFile(LOG_STORE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as LogEntry[];
    if (Array.isArray(parsed?.entries)) return parsed.entries as LogEntry[];
    if (Array.isArray(parsed?.logs)) return parsed.logs as LogEntry[];
    return [];
  } catch {
    return [];
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const beforeCount = (await readLogEntries()).length;

  log("ORCHESTRATOR", `start userId=${USER_ID} pipeline=layered_html slides=4`);
  log(
    "ENV",
    `aggregatorKey=${process.env.AGGREGATOR_API_KEY ? "present" : "MISSING"} scriptwriterModel=${
      process.env.CAROUSEL_SCRIPTWRITER_MODEL || process.env.AGGREGATOR_DEFAULT_MODEL || "(default)"
    } adModel=${process.env.ART_DIRECTOR_MODEL || "(default google/gemini-2.5-flash)"}`,
  );

  const row: NormalizedSheetRow = {
    mode: "useful",
    sheetRowKey: "armcafe-moscow",
    topic: "Армянские кафе и рестораны в Москве",
    notes:
      "Гид: куда пойти за настоящей армянской кухней в Москве — атмосфера, кухня (хаш, долма, кебаб, лаваш из тонира), для кого, лайфхак по выбору. Тёплый, аппетитный, с конкретикой.",
    cta_type: 2,
    hero: null,
    slides: 4,
    statusRaw: "",
    pickable: true,
  };
  log("SCRIPTWRITER", `topic="${row.topic}" cta=${row.cta_type} slides=${row.slides}`);

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

  // ---- collect per-stage log entries emitted during this run ----
  const all = await readLogEntries();
  const fresh = all.slice(beforeCount);
  const jobId = result.jobId;
  const jobEntries = jobId ? fresh.filter((e) => e.jobId === jobId) : fresh;

  log("STAGE-LOG", `${jobEntries.length} entries for job ${jobId ?? "(none)"}`);
  const weakSpots: string[] = [];
  for (const e of jobEntries.length ? jobEntries : fresh) {
    const line = `  · [${e.agentRole ?? e.agentId ?? "?"}] ${(e.level ?? "info").toUpperCase()}: ${e.message ?? ""}`;
    // eslint-disable-next-line no-console
    console.log(line);
    if (e.level === "red" || e.level === "error" || e.level === "warn") {
      weakSpots.push(
        `[${e.agentRole ?? e.agentId}] ${e.level}: ${e.message}${
          e.meta ? " · " + JSON.stringify(e.meta) : ""
        }`,
      );
    }
  }

  // ---- outputs ----
  const report: Record<string, unknown> = {
    topic: row.topic,
    slides: row.slides,
    pipeline: "layered_html",
    jobId,
    draftId: result.ok ? result.draftId : undefined,
    ok: result.ok,
    error: result.ok ? undefined : result.error,
    needs_input: result.ok ? result.needs_input : result.needs_input,
    timelineMd: result.timelineMd,
    runSeconds: Number(secs),
    weakSpots,
  };

  if (result.ok) {
    report.needs_review = result.needs_review;
    const ad = result.artDirectorReview;
    report.artDirector = ad
      ? { verdict: ad.verdict, score: ad.score, remarksCount: ad.remarks?.length ?? 0 }
      : "see vernatun AD_VERDICT.md";
    log(
      "ART DIRECTOR (correct-pipeline)",
      ad
        ? `verdict=${ad.verdict} score=${ad.score ?? "?"} remarks=${ad.remarks?.length ?? 0}`
        : "no verdict here — see vernatun job AD_VERDICT.md",
    );
    if (ad) {
      await writeFile(
        path.join(OUT_DIR, "art-director-review.md"),
        formatArtDirectorReviewMarkdown(ad, {}),
        "utf8",
      );
    }
    // Finals live in the vernatun job dir, not public/generated/carousel.
    const vjRendered = jobId
      ? path.join(process.cwd(), "generatedMedia", "vernatun-jobs", jobId, "rendered")
      : "";
    const vjPublic = jobId
      ? path.join(process.cwd(), "public", "vernatun-jobs", jobId)
      : "";
    let copied = 0;
    for (let i = 1; i <= 8; i++) {
      const n = String(i).padStart(2, "0");
      const src = [path.join(vjRendered, `slide_${n}.png`), path.join(vjPublic, `slide_${n}.png`)].find(
        (p) => p && existsSync(p),
      );
      if (!src) continue;
      await copyFile(src, path.join(OUT_DIR, `slide_${n}.png`));
      copied += 1;
    }
    report.pngCopied = copied;
    report.vernatunJobDir = jobId ? path.join("generatedMedia", "vernatun-jobs", jobId) : undefined;
    log("MONTAGE", `copied ${copied} final PNG(s) from vernatun job → ${OUT_DIR}`);

    // Capture the vernatun orchestrator's own Art Director verdict + asset manifest
    if (jobId) {
      const jobPrompts = path.join(process.cwd(), "generatedMedia", "vernatun-jobs", jobId, "prompts");
      for (const f of ["AD_VERDICT.md", "AD_FINDINGS.json", "02_image_plan.json"]) {
        const src = path.join(jobPrompts, f);
        if (existsSync(src)) await copyFile(src, path.join(OUT_DIR, f));
      }
      const manifest = path.join(process.cwd(), "generatedMedia", "vernatun-jobs", jobId, "reports", "ASSET_MANIFEST.json");
      if (existsSync(manifest)) await copyFile(manifest, path.join(OUT_DIR, "ASSET_MANIFEST.json"));
      // Surface the real image source (web/local vs generate)
      try {
        const man = JSON.parse(await readFile(manifest, "utf8")) as Array<Record<string, unknown>>;
        const sources = man.map((m) => `${m.filename}: ${m.source_type}/${m.source_url_or_provider}`);
        report.imageSources = sources;
        log("IMAGE SOURCE", sources.join(" | "));
      } catch {
        /* optional */
      }
    }
  } else {
    log("PIPELINE", `FAILED error=${result.error} needs_input=${result.needs_input}`);
  }

  if (result.timelineMd && existsSync(result.timelineMd)) {
    await copyFile(result.timelineMd, path.join(OUT_DIR, "timeline.md"));
    log("TRACE", `timeline → ${path.join(OUT_DIR, "timeline.md")}`);
  }

  await writeFile(path.join(OUT_DIR, "RUN_REPORT.json"), JSON.stringify(report, null, 2), "utf8");
  log("DONE", `report → ${path.join(OUT_DIR, "RUN_REPORT.json")}`);
  if (weakSpots.length) {
    log("WEAK-SPOTS", `${weakSpots.length} issue(s):`);
    for (const w of weakSpots) {
      // eslint-disable-next-line no-console
      console.log("    ! " + w);
    }
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[gen-armcafe] fatal", err instanceof Error ? err.stack : err);
  process.exitCode = 1;
});
