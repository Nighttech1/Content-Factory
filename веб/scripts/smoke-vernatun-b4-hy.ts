/**
 * B4 smoke: 2 carousels × 4 slides with 15 canonical Eastern Armenian words.
 * Image model must render HY glyphs; AD checks hy_spelling; layout-QA checks logo.
 *
 * Usage:
 *   npx tsx scripts/smoke-vernatun-b4-hy.ts
 * Env: SMOKE_CAROUSEL_COUNT=2 (default)
 */
import { config } from "dotenv";
config();

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  B4_HY_CANONICAL_15,
  b4HySmokeStyleNotes,
  extractArmenianWords,
} from "../lib/studio/vernatun-carousel/hy-text";
import { runVernatunCarouselJob } from "../lib/studio/vernatun-carousel/orchestrator";

async function main() {
  const count = Math.min(
    4,
    Math.max(1, Number(process.env.SMOKE_CAROUSEL_COUNT ?? 2) || 2),
  );
  const slides = 4;
  const outRoot = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-smoke",
    `b4-hy-${new Date().toISOString().slice(0, 10)}`,
  );
  await mkdir(outRoot, { recursive: true });

  const styleNotes = b4HySmokeStyleNotes();
  const topic =
    "15 армянских слов для Vernatun: чётко написать и показать на слайдах speaking club";

  const summary: unknown[] = [];

  for (let i = 0; i < count; i++) {
    console.log(
      `\n=== B4 HY [${i + 1}/${count}] mode=B slides=${slides} ===\n${topic}\nCanon (${B4_HY_CANONICAL_15.length}): ${B4_HY_CANONICAL_15.join(" · ")}\n`,
    );

    const result = await runVernatunCarouselJob({
      brief: {
        topic,
        audience: "участники Vernatun, учат армянский",
        slideCount: slides,
        buildMode: "B",
        skipScriptApproval: true,
        language: "ru+hy",
        tone: "тёплый, чёткий, учебный",
        styleNotes,
        cta: "Приходите в Vernatun — говорим по-армянски",
        // 1 repair enough for B4 budget; empty_url retries live in image-gen
        maxRepairCycles: 1,
      },
      onProgress: (agent, message) => {
        console.log(`  [${agent}] ${message}`);
      },
    });

    const scriptWords = extractArmenianWords(
      (result as { script?: { slides?: Array<{ headline?: string; body?: string; supporting_copy?: string; cta?: string }> } })
        .script?.slides?.flatMap((s) => [
          s.headline ?? "",
          s.body ?? "",
          s.supporting_copy ?? "",
          s.cta ?? "",
        ]) ?? [],
    );

    // Prefer reading script from jobDir if present
    let hyInScript: string[] = scriptWords;
    try {
      const { readFile } = await import("node:fs/promises");
      const scriptPath = path.join(
        result.jobDir,
        "prompts",
        "01_script_out.json",
      );
      const raw = JSON.parse(await readFile(scriptPath, "utf8")) as {
        slides?: Array<{
          headline?: string;
          body?: string;
          supporting_copy?: string;
          cta?: string;
        }>;
      };
      hyInScript = extractArmenianWords(
        (raw.slides ?? []).flatMap((s) => [
          s.headline ?? "",
          s.body ?? "",
          s.supporting_copy ?? "",
          s.cta ?? "",
        ]),
      );
    } catch {
      /* ignore */
    }

    const missingCanon = B4_HY_CANONICAL_15.filter(
      (w) => !hyInScript.includes(w),
    );

    summary.push({
      index: i + 1,
      topic,
      ok: result.ok,
      status: result.status,
      jobId: result.jobId,
      jobDir: result.jobDir,
      slides: result.slides.map((s) => s.imageUrl),
      remarks: result.remarks,
      error: result.error,
      repairCycles: result.repairCycles,
      hyWordsInScript: hyInScript,
      hyCanonCount: B4_HY_CANONICAL_15.length,
      hyMissingFromScript: missingCanon,
      publicPreview: result.slides.map(
        (s) => `/vernatun-jobs/${result.jobId}/${path.basename(s.imageUrl)}`,
      ),
    });

    console.log(
      `→ status=${result.status} ok=${result.ok} slides=${result.slides.length} repairs=${result.repairCycles}`,
    );
    console.log(
      `  HY in script: ${hyInScript.length} unique; missing canon: ${missingCanon.length}`,
    );
    if (result.remarks.length) {
      console.log("  remarks:", result.remarks.slice(0, 8).join(" | "));
    }
  }

  const reportPath = path.join(outRoot, "b4-hy-smoke-report.json");
  await writeFile(
    reportPath,
    JSON.stringify(
      {
        canon: B4_HY_CANONICAL_15,
        summary,
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log(`\nReport: ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
