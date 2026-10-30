/**
 * Checkpoint dual smoke:
 *  1) Typical Vernatun carousel (logo gate on normal RU copy)
 *  2) Acceptance: RU viral copy + 15 canonical HY words (logo + hy_spelling)
 *
 * Usage: npx tsx scripts/smoke-vernatun-checkpoint-dual.ts
 */
import { config } from "dotenv";
config();

import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  B4_HY_CANONICAL_15,
  b4HySmokeStyleNotes,
  extractArmenianWords,
} from "../lib/studio/vernatun-carousel/hy-text";
import { runVernatunCarouselJob } from "../lib/studio/vernatun-carousel/orchestrator";

async function publishSlides(jobId: string, jobDir: string) {
  const rendered = path.join(jobDir, "rendered");
  const pub = path.join(process.cwd(), "public", "vernatun-jobs", jobId);
  await mkdir(pub, { recursive: true });
  let files: string[] = [];
  try {
    files = (await readdir(rendered)).filter((f) => /^slide_\d+\.png$/i.test(f));
  } catch {
    return [];
  }
  const urls: string[] = [];
  for (const f of files.sort()) {
    await copyFile(path.join(rendered, f), path.join(pub, f));
    urls.push(`/vernatun-jobs/${jobId}/${f}`);
  }
  return urls;
}

async function readHyFromScript(jobDir: string): Promise<string[]> {
  try {
    const { readFile } = await import("node:fs/promises");
    const raw = JSON.parse(
      await readFile(path.join(jobDir, "prompts", "01_script_out.json"), "utf8"),
    ) as {
      slides?: Array<{
        headline?: string;
        body?: string;
        supporting_copy?: string;
        cta?: string;
      }>;
    };
    return extractArmenianWords(
      (raw.slides ?? []).flatMap((s) => [
        s.headline ?? "",
        s.body ?? "",
        s.supporting_copy ?? "",
        s.cta ?? "",
      ]),
    );
  } catch {
    return [];
  }
}

async function main() {
  const outRoot = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-smoke",
    `checkpoint-dual-${new Date().toISOString().slice(0, 10)}`,
  );
  await mkdir(outRoot, { recursive: true });

  const jobs: Array<{
    label: string;
    brief: Parameters<typeof runVernatunCarouselJob>[0]["brief"];
  }> = [
    {
      label: "typical",
      brief: {
        topic: "Почему связи в сообществе — сила, а не кумовство",
        audience: "участники Vernatun",
        slideCount: 4,
        buildMode: "B",
        skipScriptApproval: true,
        language: "ru",
        tone: "честный, живой, вирусный",
        cta: "Приходите на встречу Vernatun",
        maxRepairCycles: 2,
      },
    },
    {
      label: "acceptance_hy_logo",
      brief: {
        topic:
          "Vernatun: живой русский хук + 15 армянских слов на слайдах speaking club",
        audience: "участники Vernatun, учат армянский",
        slideCount: 4,
        buildMode: "B",
        skipScriptApproval: true,
        language: "ru+hy",
        tone: "тёплый, чёткий, учебный",
        styleNotes: b4HySmokeStyleNotes(),
        cta: "Приходите в Vernatun — говорим по-армянски",
        maxRepairCycles: 2,
      },
    },
  ];

  const summary: unknown[] = [];

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i]!;
    console.log(
      `\n=== [${i + 1}/${jobs.length}] ${job.label} mode=B N=4 ===\n${job.brief.topic}\n`,
    );
    if (job.label === "acceptance_hy_logo") {
      console.log(`Canon (15): ${B4_HY_CANONICAL_15.join(" · ")}\n`);
    }

    const result = await runVernatunCarouselJob({
      brief: job.brief,
      onProgress: (agent, message) => {
        console.log(`  [${agent}] ${message}`);
      },
    });

    const publicUrls = await publishSlides(result.jobId, result.jobDir);
    const hyInScript = await readHyFromScript(result.jobDir);
    const missingCanon =
      job.label === "acceptance_hy_logo"
        ? B4_HY_CANONICAL_15.filter((w) => !hyInScript.includes(w))
        : [];

    summary.push({
      label: job.label,
      ok: result.ok,
      status: result.status,
      jobId: result.jobId,
      jobDir: result.jobDir,
      slides: publicUrls.length
        ? publicUrls
        : result.slides.map((s) => s.imageUrl),
      remarks: result.remarks,
      error: result.error,
      repairCycles: result.repairCycles,
      hyWordsInScript: hyInScript,
      hyMissingFromScript: missingCanon,
    });

    console.log(
      `→ ${job.label}: status=${result.status} ok=${result.ok} slides=${publicUrls.length || result.slides.length} repairs=${result.repairCycles}`,
    );
    if (job.label === "acceptance_hy_logo") {
      console.log(
        `  HY in script: ${hyInScript.length}; missing canon: ${missingCanon.length}`,
      );
    }
    if (result.remarks.length) {
      console.log("  remarks:", result.remarks.slice(0, 8).join(" | "));
    }
    if (result.error) console.log("  error:", result.error);
  }

  const reportPath = path.join(outRoot, "checkpoint-dual-report.json");
  await writeFile(
    reportPath,
    JSON.stringify({ canon: B4_HY_CANONICAL_15, summary }, null, 2),
    "utf8",
  );
  console.log(`\nReport: ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
