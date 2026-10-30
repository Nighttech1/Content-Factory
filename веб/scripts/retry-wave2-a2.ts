import { runVernatunCarouselJob } from "../lib/studio/vernatun-carousel/orchestrator";
import { upsertDraft } from "../lib/db/drafts-repository";
import { SEED_ADMIN_USER_ID } from "../lib/db/actor";
import { runClientPlaywrightAccept } from "../lib/studio/vernatun-carousel/client-playwright-accept";

const topic = "Первая встреча Vernatun: чего ожидать";

async function main() {
  console.log("[Оркестратор] retry Mode A:", topic);
  const result = await runVernatunCarouselJob({
    brief: {
      topic,
      audience: "участники Vernatun",
      slideCount: 4,
      buildMode: "A",
      skipScriptApproval: true,
      cta: "Приходите на встречу Vernatun",
    },
    onProgress: (a, m) => console.log(`  [${a}] ${m}`),
  });
  console.log(
    `→ status=${result.status} ok=${result.ok} slides=${result.slides.length} err=${result.error ?? ""}`,
  );
  if (result.ok && result.slides.length) {
    await upsertDraft(SEED_ADMIN_USER_ID, {
      id: "vernatun-a-wave2-2",
      moduleId: "carousel-engine",
      title: `[A/${result.status}] ${topic}`,
      slides: result.slides.map((s, j) => ({
        id: `s${j + 1}`,
        imageUrl: s.imageUrl,
        caption: topic,
      })),
      scenario: ["mode=A retry", ...(result.remarks ?? []).slice(0, 6)].join(
        "\n",
      ),
      status: "unpublished",
      sourceCompetitorId: "vernatun-smoke",
      competitorId: "vernatun-smoke",
    });
    console.log("draft upserted vernatun-a-wave2-2");
  }
  console.log("\n[Клиент] Playwright приёмка…");
  const accept = await runClientPlaywrightAccept({
    baseUrl: "http://127.0.0.1:3000",
    maxJobs: 10,
  });
  console.log(`[Клиент] ${accept.verdict} — ${accept.summary}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
