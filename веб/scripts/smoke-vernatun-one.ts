/**
 * DEV: exactly ONE carousel per turn (maxRepair=0).
 * After run: open prompts/AD_VERDICT.md — APPROVED or REMARKS for the team.
 *
 * Usage: npx tsx scripts/smoke-vernatun-one.ts
 */
import { config } from "dotenv";
config();

import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { runVernatunCarouselJob } from "../lib/studio/vernatun-carousel/orchestrator";

async function main() {
  const topic =
    process.env.SMOKE_TOPIC?.trim() ||
    "Почему живая встреча в Vernatun сильнее бесконечного чата";

  console.log(`\n=== DEV one carousel (maxRepair=0) ===\n${topic}\n`);

  const result = await runVernatunCarouselJob({
    brief: {
      topic,
      audience: "участники Vernatun",
      slideCount: 4,
      buildMode: "B",
      skipScriptApproval: true,
      language: "ru",
      tone: "честный, живой",
      cta: process.env.SMOKE_CTA?.trim() || "Приходите на встречу Vernatun",
      maxRepairCycles: 0,
      ...(process.env.SMOKE_STYLE?.trim()
        ? { styleNotes: process.env.SMOKE_STYLE.trim() }
        : {}),
    },
    onProgress: (agent, message) => {
      console.log(`  [${agent}] ${message}`);
    },
  });

  const pub = path.join(
    process.cwd(),
    "public",
    "vernatun-jobs",
    result.jobId,
  );
  await mkdir(pub, { recursive: true });
  const rendered = path.join(result.jobDir, "rendered");
  try {
    const files = (await readdir(rendered)).filter((f) =>
      /^slide_\d+\.png$/i.test(f),
    );
    for (const f of files.sort()) {
      await copyFile(path.join(rendered, f), path.join(pub, f));
    }
  } catch {
    /* no slides */
  }

  const verdictPath = path.join(result.jobDir, "prompts", "AD_VERDICT.md");
  console.log(
    `\n→ status=${result.status} ok=${result.ok} repairs=${result.repairCycles}`,
  );
  console.log(`→ jobId=${result.jobId}`);
  console.log(`→ AD log (TEAM): ${verdictPath}`);
  console.log(`→ public: /vernatun-jobs/${result.jobId}/`);
  if (result.remarks.length) {
    console.log("  remarks:", result.remarks.slice(0, 6).join(" | "));
  }
  if (result.error) console.log("  error:", result.error);

  const outDir = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-smoke",
    `one-${new Date().toISOString().slice(0, 10)}`,
  );
  await mkdir(outDir, { recursive: true });
  await writeFile(
    path.join(outDir, "one-report.json"),
    JSON.stringify(
      {
        jobId: result.jobId,
        status: result.status,
        ok: result.ok,
        repairCycles: result.repairCycles,
        remarks: result.remarks,
        error: result.error,
        adVerdict: verdictPath,
        public: `/vernatun-jobs/${result.jobId}/`,
      },
      null,
      2,
    ),
    "utf8",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
