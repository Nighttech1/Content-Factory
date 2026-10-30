/**
 * Wave2: 2 × Mode A carousels (4 slides) + Client Playwright accept.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { runVernatunCarouselJob } from "../lib/studio/vernatun-carousel/orchestrator";
import { runClientPlaywrightAccept } from "../lib/studio/vernatun-carousel/client-playwright-accept";
import { upsertDraft } from "../lib/db/drafts-repository";
import { SEED_ADMIN_USER_ID } from "../lib/db/actor";

const TOPICS = [
  "Как не бояться говорить на армянском в компании",
  "Первая встреча Vernatun: чего ожидать",
];

async function main() {
  const summary: unknown[] = [];

  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i]!;
    console.log(`\n=== Mode A [${i + 1}/2] ===\n${topic}\n`);
    const result = await runVernatunCarouselJob({
      brief: {
        topic,
        audience: "участники Vernatun",
        slideCount: 4,
        buildMode: "A",
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
      buildMode: "A",
      ok: result.ok,
      status: result.status,
      jobId: result.jobId,
      jobDir: result.jobDir,
      slides: result.slides.map((s) => s.imageUrl),
      remarks: result.remarks,
      repairCycles: result.repairCycles,
    });

    console.log(
      `→ status=${result.status} ok=${result.ok} slides=${result.slides.length}`,
    );

    if (result.ok && result.slides.length) {
      await upsertDraft(SEED_ADMIN_USER_ID, {
        id: `vernatun-a-wave2-${i + 1}`,
        moduleId: "carousel-engine",
        title: `[A/${result.status}] ${topic}`,
        slides: result.slides.map((s, j) => ({
          id: `s${j + 1}`,
          imageUrl: s.imageUrl,
          caption: topic,
        })),
        scenario: [
          `mode=A`,
          `job=${result.jobId}`,
          ...(result.remarks ?? []).slice(0, 6),
        ].join("\n"),
        status: "unpublished",
        sourceCompetitorId: "vernatun-smoke",
        competitorId: "vernatun-smoke",
      });
      console.log(`  draft upserted vernatun-a-wave2-${i + 1}`);
    }
  }

  const outRoot = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-smoke",
    "2026-10-21-wave2-A",
  );
  await mkdir(outRoot, { recursive: true });
  await writeFile(
    path.join(outRoot, "smoke-report.json"),
    JSON.stringify(summary, null, 2),
    "utf8",
  );

  console.log("\n[Клиент] Playwright приёмка каруселей A+B…");
  const accept = await runClientPlaywrightAccept({
    baseUrl: "http://127.0.0.1:3000",
    maxJobs: 20,
  });
  await writeFile(
    path.join(outRoot, "client-accept.json"),
    JSON.stringify(
      {
        verdict: accept.verdict,
        summary: accept.summary,
        byMode: accept.byMode,
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log(`[Клиент] ${accept.verdict} — ${accept.summary}`);
  if (accept.verdict === "НЕ ПРИНЯТО") process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
