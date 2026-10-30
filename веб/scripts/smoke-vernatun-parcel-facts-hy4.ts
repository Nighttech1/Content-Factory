/**
 * Sheet row №44 — facts=1 → FACT_CHECK branch.
 * Topic: посылка в Армению. N=4. gpt-5.4-image-2. maxRepair=0.
 *
 * Usage: npx tsx scripts/smoke-vernatun-parcel-facts-hy4.ts
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

  console.log(
    `\n=== Parcel Armenia FACT_CHECK (facts=1, gpt-5.4-image-2, N=4) ===\n${topic}\n`,
  );

  const result = await runVernatunCarouselJob({
    brief: {
      topic,
      audience:
        "люди в РФ/диаспоре, которые хотят отправить посылку родственникам в Армению",
      slideCount: 4,
      buildMode: "B",
      skipScriptApproval: true,
      language: "ru",
      tone: "практичный, честный, с правилами и оговорками",
      styleNotes: `FORCE_SLIDE_COUNT=4.
FACT_CHECK=1 (колонка facts листа «Полезные карусели» №44).
СЛОВАРЬ: 1 HY—RU/слайд; RU в body/headline.
АТМОСФЕРА: каждый слайд photoreal full-bleed — НЕ сплошной чёрный/белый фон.
LIST: только если body реально перечисляет 2+ пункта; cover/CTA — без фейкового checklist.
Vocab chip = series LOCK. TOP-RIGHT без отметок зоны лого.
NO_DECORATIVE_QUOTES. Без пагинации.
Финал CTA = поделитесь в комментариях опытом отправки.`,
      ctaType: "community_circle",
      cta: "Поделитесь в комментариях — как вы отправляли посылку в Армению?",
      maxRepairCycles: 0,
      factCheckMode: "FACT_CHECK",
      factCheckRaw: "1",
      sheetRowKey: "44",
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
    /* */
  }

  const verdictPath = path.join(result.jobDir, "prompts", "AD_VERDICT.md");
  console.log(
    `\n→ status=${result.status} ok=${result.ok} repairs=${result.repairCycles}`,
  );
  console.log(`→ jobId=${result.jobId}`);
  console.log(`→ AD: ${verdictPath}`);
  console.log(`→ public: /vernatun-jobs/${result.jobId}/`);
  if (result.remarks.length) {
    console.log("  remarks:", result.remarks.slice(0, 12).join(" | "));
  }

  const outDir = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-smoke",
    `parcel-facts-hy4-${new Date().toISOString().slice(0, 10)}`,
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
        factCheckMode: "FACT_CHECK",
        sheetRowKey: "44",
        adVerdict: verdictPath,
        public: `/vernatun-jobs/${result.jobId}/`,
        imageModel: "openai/gpt-5.4-image-2",
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
