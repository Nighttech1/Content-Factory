/**
 * FINAL smoke N=4 — «Карта для переводов в Армению».
 * Budget: 1 generation. STANDARD (no FACT_CHECK burn).
 * Usage: npx tsx scripts/smoke-vernatun-transfers-card-hy4.ts
 */
import { config } from "dotenv";
config();

process.env.CAROUSEL_MODEL_IMAGE_GEN = "openai/gpt-5.4-image-2";
process.env.CAROUSEL_IMAGE_FALLBACKS = "openai/gpt-5.4-image-2";

import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { runVernatunCarouselJob } from "../lib/studio/vernatun-carousel/orchestrator";

async function main() {
  const topic = "Карта для переводов в Армению: что важно знать";
  console.log(`\n=== FINAL transfers-card HY4 (N=4) ===\n${topic}\n`);

  const result = await runVernatunCarouselJob({
    brief: {
      topic,
      audience:
        "люди в РФ/СНГ, которые переводят деньги родным или себе в Армению",
      slideCount: 4,
      buildMode: "B",
      skipScriptApproval: true,
      language: "ru",
      tone: "практичный, ясный, без пафоса",
      styleNotes: `FORCE_SLIDE_COUNT=4.
FACT_CHECK=0.
СЛОВАРЬ supporting_copy (1 HY—RU на слайд) — GPT НЕ рисует HY; рисует свободный пунктирный VOCAB_SLOT (CYAN #00E8FF) где лучше по композиции.
HTML bake: cyan-гайд → wipe → oval orange pill. Справа снизу — изогнутая swoosh-стрелка (Ч/Б), не orange.
АТМОСФЕРА: photoreal full-bleed (банковская карта / телефон / Ереван / перевод — по слайду). LOGO AIR: текст не в x=852..1052 y=28..264; без отметок зоны лого.
CTA: Поделитесь в комментариях — какой картой вы переводите в Армению?`,
      ctaType: "community_circle",
      cta: "Поделитесь в комментариях — какой картой вы переводите в Армению?",
      maxRepairCycles: 0,
      factCheckMode: "STANDARD",
      factCheckRaw: "0",
    },
    onProgress: (agent, message) => {
      console.log(`  [${agent}] ${message}`);
    },
  });

  const pub = path.join(process.cwd(), "public", "vernatun-jobs", result.jobId);
  await mkdir(pub, { recursive: true });
  const preview = path.join(
    process.cwd(),
    "public",
    "vernatun-preview-final-ready",
  );
  await mkdir(preview, { recursive: true });
  try {
    const rendered = path.join(result.jobDir, "rendered");
    for (const f of (await readdir(rendered))
      .filter((x) => /^slide_\d+\.png$/i.test(x))
      .sort()) {
      await copyFile(path.join(rendered, f), path.join(pub, f));
      await copyFile(path.join(rendered, f), path.join(preview, f));
    }
  } catch {
    /* */
  }

  console.log(
    `\n→ status=${result.status} ok=${result.ok} repairs=${result.repairCycles}`,
  );
  console.log(`→ jobId=${result.jobId}`);
  console.log(`→ AD: ${path.join(result.jobDir, "prompts", "AD_VERDICT.md")}`);
  console.log(`→ public: /vernatun-jobs/${result.jobId}/`);
  console.log(`→ preview: /vernatun-preview-final-ready/`);
  if (result.remarks.length) {
    console.log("  remarks:", result.remarks.slice(0, 12).join(" | "));
  }

  const outDir = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-smoke",
    `transfers-card-hy4-${new Date().toISOString().slice(0, 10)}`,
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
        remarks: result.remarks,
        public: `/vernatun-jobs/${result.jobId}/`,
        preview: "/vernatun-preview-final-ready/",
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
