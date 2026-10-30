/**
 * B4.5 smoke: HY HTML plaque bake + logo air coords. N=4. STANDARD (no FACT_CHECK burn).
 * Usage: npx tsx scripts/smoke-vernatun-vocab-html-hy4.ts
 */
import { config } from "dotenv";
config();

process.env.CAROUSEL_MODEL_IMAGE_GEN = "openai/gpt-5.4-image-2";
process.env.CAROUSEL_IMAGE_FALLBACKS = "openai/gpt-5.4-image-2";

import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { runVernatunCarouselJob } from "../lib/studio/vernatun-carousel/orchestrator";

async function main() {
  const topic = "Как отправить посылку в Армению: что важно знать";
  console.log(`\n=== B4.5 vocab HTML bake + logo air (N=4) ===\n${topic}\n`);

  const result = await runVernatunCarouselJob({
    brief: {
      topic,
      audience: "люди, которые отправляют посылки родным в Армению",
      slideCount: 4,
      buildMode: "B",
      skipScriptApproval: true,
      language: "ru",
      tone: "практичный, тёплый",
      styleNotes: `FORCE_SLIDE_COUNT=4.
FACT_CHECK=0.
СЛОВАРЬ supporting_copy (1 HY—RU) — GPT НЕ рисует HY; рисует свободный пунктирный VOCAB_SLOT (CYAN #00E8FF) где лучше по композиции.
HTML bake детектит cyan-гайд → oval orange pill. Справа снизу — стрелка ≈ длина лого, контраст к фону.
АТМОСФЕРА: photoreal full-bleed. LOGO AIR: текст не в x=852..1052 y=28..264; без отметок зоны лого.
CTA: Поделитесь в комментариях — как вы отправляли посылку в Армению?`,
      ctaType: "community_circle",
      cta: "Поделитесь в комментариях — как вы отправляли посылку в Армению?",
      maxRepairCycles: 0,
      factCheckMode: "STANDARD",
      factCheckRaw: "0",
      sheetRowKey: "44-visual",
    },
    onProgress: (agent, message) => {
      console.log(`  [${agent}] ${message}`);
    },
  });

  const pub = path.join(process.cwd(), "public", "vernatun-jobs", result.jobId);
  await mkdir(pub, { recursive: true });
  try {
    const rendered = path.join(result.jobDir, "rendered");
    for (const f of (await readdir(rendered)).filter((x) =>
      /^slide_\d+\.png$/i.test(x),
    ).sort()) {
      await copyFile(path.join(rendered, f), path.join(pub, f));
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
  if (result.remarks.length) {
    console.log("  remarks:", result.remarks.slice(0, 10).join(" | "));
  }

  const outDir = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-smoke",
    `vocab-html-hy4-${new Date().toISOString().slice(0, 10)}`,
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
