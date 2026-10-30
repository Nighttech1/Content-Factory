/**
 * One carousel: «Работа удалённо из Армении: с чего начать» — N=4, maxRepair=0.
 * After: read prompts/AD_VERDICT.md
 *
 * Usage: npx tsx scripts/smoke-vernatun-remote-armenia.ts
 */
import { config } from "dotenv";
config();

import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { runVernatunCarouselJob } from "../lib/studio/vernatun-carousel/orchestrator";

async function main() {
  const topic = "Работа удалённо из Армении: с чего начать";

  console.log(`\n=== Remote Armenia N=4 (maxRepair=0) ===\n${topic}\n`);

  const result = await runVernatunCarouselJob({
    brief: {
      topic,
      audience: "специалисты, думающие о релокации / remote из Армении",
      slideCount: 4,
      buildMode: "B",
      skipScriptApproval: true,
      language: "ru",
      tone: "практичный, честный, без розовых очков",
      styleNotes: `HEADLINE_RULES (HARD): все заголовки только на русском (кириллица), без армянских букв в headline.
NO_DECORATIVE_QUOTES: не пиши заголовки в «кавычках» в сценарии — на кадре кавычек-обёрток тоже не будет.
PAGINATION: без нумерации слайдов (ни 1/4, ни точек).
FORCE_SLIDE_COUNT=4. Финал = CTA Vernatun / комьюнити.
Тема: первые шаги remote-работы из Армении (документы/связь/режим/сообщество — по смыслу, без выдуманных законов).`,
      ctaType: "speaking_meetup",
      // explicit override ok; catalog default = разговорная встреча Vernatun
      cta: "Приходите на разговорную встречу Vernatun — разберём ваш старт",
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
    `remote-armenia-${new Date().toISOString().slice(0, 10)}`,
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
