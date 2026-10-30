/**
 * Remote work in Armenia — N=4, CTA «поделитесь в комментариях».
 * Image: openai/gpt-5.4-image-2. maxRepair=0.
 *
 * Usage: npx tsx scripts/smoke-vernatun-remote-comments-hy4.ts
 */
import { config } from "dotenv";
config();

process.env.CAROUSEL_MODEL_IMAGE_GEN = "openai/gpt-5.4-image-2";
process.env.CAROUSEL_IMAGE_FALLBACKS = "openai/gpt-5.4-image-2";

import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { runVernatunCarouselJob } from "../lib/studio/vernatun-carousel/orchestrator";

async function main() {
  const topic = "Поиск удалённой работы в Армении: с чего начать";

  console.log(
    `\n=== Remote Armenia + comments CTA (gpt-5.4-image-2, N=4) ===\n${topic}\n`,
  );

  const result = await runVernatunCarouselJob({
    brief: {
      topic,
      audience:
        "специалисты, которые хотят remote / релокацию и ищут работу, живя в Армении",
      slideCount: 4,
      buildMode: "B",
      skipScriptApproval: true,
      language: "ru",
      tone: "практичный, честный, с конкретными шагами и площадками",
      styleNotes: `FORCE_SLIDE_COUNT=4.
ПОЛЬЗА: mid = шаги + именнованные ориентиры (LinkedIn, Remote OK / We Work Remotely, Staff.am, Telegram IT…).
ИП — можно один слайд с next step + hedge.
СЛОВАРЬ: 1 HY—RU/слайд; RU в body/headline.
АТМОСФЕРА HARD: каждый слайд image_need=photo_generic + живой visual_intent. НЕ kind=none. Mid = photoreal full-bleed + list/checklist OVERLAY on-photo (как живая обложка, не чёрный UI).
Vocab chip = series LOCK filled pill. TOP-RIGHT без любых отметок зоны лого.
NO_DECORATIVE_QUOTES. Без пагинации.
Финал CTA = поделитесь в комментариях.`,
      ctaType: "community_circle",
      cta: "Поделитесь в комментариях — как вы искали удалённую работу из Армении?",
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
  console.log(`→ AD: ${verdictPath}`);
  console.log(`→ public: /vernatun-jobs/${result.jobId}/`);
  if (result.remarks.length) {
    console.log("  remarks:", result.remarks.slice(0, 12).join(" | "));
  }

  const outDir = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-smoke",
    `remote-comments-54-${new Date().toISOString().slice(0, 10)}`,
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
