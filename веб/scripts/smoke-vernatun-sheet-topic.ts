/**
 * B1–B5 checkpoint: one carousel from Vernatun sheet topic.
 * Theme: «Любимая еда» — 5 slides, each with a vocab block: HY word + RU translation.
 * maxRepair=0; read prompts/AD_VERDICT.md after.
 *
 * Usage: npx tsx scripts/smoke-vernatun-sheet-topic.ts
 */
import { config } from "dotenv";
config();

import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { runVernatunCarouselJob } from "../lib/studio/vernatun-carousel/orchestrator";

/** One HY word per slide + Russian gloss (Eastern Armenian). */
export const FOOD_VOCAB_5 = [
  { hy: "սնունդ", ru: "еда" },
  { hy: "համ", ru: "вкус" },
  { hy: "հաց", ru: "хлеб" },
  { hy: "սուրճ", ru: "кофе" },
  { hy: "սեղան", ru: "стол" },
] as const;

function styleNotesFoodCarousel(): string {
  const lines = FOOD_VOCAB_5.map(
    (w, i) =>
      `Слайд ${i + 1}: отдельный блок словаря РОВНО так (буква в букву): «${w.hy} — ${w.ru}»`,
  ).join("\n");
  return `B1_B5_SHEET_CHECKPOINT (HARD):
Тема встречи Vernatun из Google Sheet: «Любимая еда».
FORCE_SLIDE_COUNT=5. Финал = CTA прийти в клуб.
На КАЖДОМ слайде:
1) обычный русский вирусный copy (headline + body) по теме еды/встречи;
2) ОТДЕЛЬНЫЙ блок словаря — одно армянское слово + перевод на русский, крупно, читаемо.
Канон блоков (не менять написание HY):
${lines}
Пустой TOP-RIGHT под logo_bake. Кадр 1080×1350 (4:5), не 9:16.
JSON один объект UTF-8.`;
}

async function main() {
  const topic =
    "Любимая еда — встреча Vernatun: говорим о вкусах и учим 5 армянских слов";
  const styleNotes = styleNotesFoodCarousel();

  console.log(`\n=== B1–B5 sheet checkpoint (N=5, maxRepair=0) ===\n${topic}\n`);
  console.log(
    "Vocab:",
    FOOD_VOCAB_5.map((w) => `${w.hy} — ${w.ru}`).join(" · "),
    "\n",
  );

  const result = await runVernatunCarouselJob({
    brief: {
      topic,
      audience: "участники Vernatun, speaking club Москва",
      slideCount: 5,
      buildMode: "B",
      skipScriptApproval: true,
      language: "ru+hy",
      tone: "тёплый, аппетитный, живой",
      styleNotes,
      cta: "Приходите в Vernatun — говорим и пробуем слова за столом",
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
    /* */
  }

  const verdictPath = path.join(result.jobDir, "prompts", "AD_VERDICT.md");
  console.log(
    `\n→ status=${result.status} ok=${result.ok} repairs=${result.repairCycles}`,
  );
  console.log(`→ jobId=${result.jobId}`);
  console.log(`→ AD log (TEAM): ${verdictPath}`);
  console.log(`→ public: /vernatun-jobs/${result.jobId}/`);
  if (result.remarks.length) {
    console.log("  remarks:", result.remarks.slice(0, 8).join(" | "));
  }

  const outDir = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-smoke",
    `sheet-food-${new Date().toISOString().slice(0, 10)}`,
  );
  await mkdir(outDir, { recursive: true });
  await writeFile(
    path.join(outDir, "report.json"),
    JSON.stringify(
      {
        sheetTopic: "Любимая еда",
        sheetRef:
          "https://docs.google.com/spreadsheets/d/1kOJ1CjMK5rNldM1IGNLdiVXqHTMeCuG35yP6_w6Y5Ls",
        vocab: FOOD_VOCAB_5,
        jobId: result.jobId,
        status: result.status,
        ok: result.ok,
        repairCycles: result.repairCycles,
        remarks: result.remarks,
        adVerdict: verdictPath,
        public: `/vernatun-jobs/${result.jobId}/`,
        checkpoint: "B1-B5",
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
