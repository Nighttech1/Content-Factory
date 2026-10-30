/**
 * Vernatun commissioning: N carousels × M slides.
 * Usage: npx tsx scripts/smoke-vernatun-carousel.ts
 * Env: SMOKE_CAROUSEL_COUNT=4 SMOKE_SLIDE_COUNT=4 SMOKE_BUILD_MODE=A|B|AB
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { runVernatunCarouselJob } from "../lib/studio/vernatun-carousel/orchestrator";
import type { BuildMode } from "../lib/studio/vernatun-carousel/types";

const TOPICS = [
  "Почему связи в сообществе — сила, а не кумовство",
  "Как заговорить на армянском без стыда",
  "Три ошибки новичков в speaking club",
  "Зачем Vernatun собирает людей офлайн",
];

async function main() {
  const count = Math.min(
    8,
    Math.max(1, Number(process.env.SMOKE_CAROUSEL_COUNT ?? 4) || 4),
  );
  const slides = Math.min(
    12,
    Math.max(2, Number(process.env.SMOKE_SLIDE_COUNT ?? 4) || 4),
  );
  const modeEnv = (process.env.SMOKE_BUILD_MODE ?? "A").toUpperCase();
  const outRoot = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-smoke",
    new Date().toISOString().slice(0, 10),
  );
  await mkdir(outRoot, { recursive: true });

  const summary: unknown[] = [];

  for (let i = 0; i < count; i++) {
    const topic = TOPICS[i % TOPICS.length]!;
    const buildMode: BuildMode =
      modeEnv === "B"
        ? "B"
        : modeEnv === "AB"
          ? i % 2 === 0
            ? "A"
            : "B"
          : "A";

    console.log(
      `\n=== [${i + 1}/${count}] mode=${buildMode} slides=${slides} ===\n${topic}\n`,
    );

    const result = await runVernatunCarouselJob({
      brief: {
        topic,
        audience: "участники Vernatun",
        slideCount: slides,
        buildMode,
        skipScriptApproval: true,
        cta: "Приходите на встречу Vernatun",
      },
      onProgress: (agent, message) => {
        console.log(`  [${agent}] ${message}`);
      },
    });

    summary.push({
      index: i + 1,
      topic,
      buildMode,
      ok: result.ok,
      status: result.status,
      jobId: result.jobId,
      jobDir: result.jobDir,
      slides: result.slides.map((s) => s.imageUrl),
      remarks: result.remarks,
      error: result.error,
      repairCycles: result.repairCycles,
    });

    console.log(
      `→ status=${result.status} ok=${result.ok} slides=${result.slides.length} repairs=${result.repairCycles}`,
    );
    if (result.remarks.length) {
      console.log("  remarks:", result.remarks.slice(0, 5).join(" | "));
    }
  }

  const reportPath = path.join(outRoot, "smoke-report.json");
  await writeFile(reportPath, JSON.stringify(summary, null, 2), "utf8");
  console.log(`\nReport: ${reportPath}`);

  // Клиент: авто-Playwright приёмка всех режимов без пользователя
  if (process.env.SMOKE_SKIP_CLIENT_ACCEPT?.trim() !== "1") {
    console.log("\n[Клиент] Запуск Playwright-приёмки каруселей A+B…");
    const { runClientPlaywrightAccept } = await import(
      "../lib/studio/vernatun-carousel/client-playwright-accept"
    );
    const accept = await runClientPlaywrightAccept({
      baseUrl: process.env.CLIENT_ACCEPT_BASE_URL?.trim() || "http://127.0.0.1:3000",
      maxJobs: count + 4,
    });
    await writeFile(
      path.join(outRoot, "client-accept-summary.json"),
      JSON.stringify(accept, null, 2),
      "utf8",
    );
    console.log(`[Клиент] Вердикт: ${accept.verdict} — ${accept.summary}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
