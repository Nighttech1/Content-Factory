/**
 * Two masks (сценарист ↔ AD сценария) → then images.
 * N=4, one HY—RU vocab per slide, maxRepair=0 (no regen).
 * After: read prompts/01_script_ad_verdict.json + prompts/AD_VERDICT.md
 *
 * Usage: npx tsx scripts/smoke-vernatun-two-masks-hy4.ts
 */
import { config } from "dotenv";
config();

import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { runVernatunCarouselJob } from "../lib/studio/vernatun-carousel/orchestrator";

async function main() {
  const topic = "4 слова для первого разговора в Vernatun";

  console.log(`\n=== Two masks + HY×4 (maxRepair=0) ===\n${topic}\n`);

  const result = await runVernatunCarouselJob({
    brief: {
      topic,
      audience: "новички speaking-club Vernatun, кто боится первого слова",
      slideCount: 4,
      buildMode: "B",
      // true = не ждать UI-чат; сразу сценарист + AD-сценария (две маски).
      // Маски AD НЕ выключаются этим флагом (см. CAROUSEL_SKIP_AD_SCRIPT).
      skipScriptApproval: true,
      language: "ru",
      tone: "тёплый, практичный, без стыда за акцент",
      styleNotes: `TWO_MASKS_LIVE=1
FORCE_SLIDE_COUNT=4.
HEADLINE_RULES: только русский в headline/body/cta; БЕЗ армянского там.
СЛОВАРЬ HARD: на каждом из 4 слайдов supporting_copy = ровно ОДНО армянское слово + перевод («բարև — привет»).
Слова разные, простые для первого разговора (привет / спасибо / пожалуйста / встреча — или близкие по смыслу).
NO_DECORATIVE_QUOTES. PAGINATION: без счётчиков.
Финал = CTA speaking_meetup Vernatun.
Единый фотореализм; ≥64px от краёв текста.`,
      ctaType: "speaking_meetup",
      cta: "Приходите на разговорную встречу Vernatun — скажем первое слово вместе",
      maxRepairCycles: 0,
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
  try {
    const rendered = path.join(result.jobDir, "rendered");
    const files = (await readdir(rendered)).filter((f) =>
      /^slide_\d+\.png$/i.test(f),
    );
    for (const f of files.sort()) {
      await copyFile(path.join(rendered, f), path.join(pub, f));
    }
  } catch {
    /* no rendered yet (script blocked) */
  }

  const verdictPath = path.join(result.jobDir, "prompts", "AD_VERDICT.md");
  const scriptAdPath = path.join(
    result.jobDir,
    "prompts",
    "01_script_ad_verdict.json",
  );
  console.log(
    `\n→ status=${result.status} ok=${result.ok} repairs=${result.repairCycles}`,
  );
  console.log(`→ jobId=${result.jobId}`);
  console.log(`→ script AD: ${scriptAdPath}`);
  console.log(`→ AD log (TEAM): ${verdictPath}`);
  console.log(`→ public: /vernatun-jobs/${result.jobId}/`);
  if (result.remarks.length) {
    console.log("  remarks:", result.remarks.slice(0, 12).join(" | "));
  }

  const outDir = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-smoke",
    `two-masks-hy4-${new Date().toISOString().slice(0, 10)}`,
  );
  await mkdir(outDir, { recursive: true });
  await writeFile(
    path.join(outDir, "report.json"),
    JSON.stringify(
      {
        topic,
        jobId: result.jobId,
        status: result.status,
        ok: result.ok,
        repairCycles: result.repairCycles,
        remarks: result.remarks,
        scriptAd: scriptAdPath,
        adVerdict: verdictPath,
        public: `/vernatun-jobs/${result.jobId}/`,
      },
      null,
      2,
    ),
    "utf8",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
