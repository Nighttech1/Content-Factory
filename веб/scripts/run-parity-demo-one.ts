import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { resolve } from "node:path";
import { runVernatunCarouselJob } from "../lib/studio/vernatun-carousel/orchestrator";
import { upsertDraft } from "../lib/db/drafts-repository";
import { SEED_ADMIN_USER_ID } from "../lib/db/actor";

function loadDotEnv(filePath: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("node:fs") as typeof import("node:fs");
    if (!fs.existsSync(filePath)) return;
    const text = fs.readFileSync(filePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 1) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env) || !process.env[key]) process.env[key] = val;
    }
  } catch {
    /* */
  }
}

loadDotEnv(resolve(process.cwd(), ".env"));
loadDotEnv(resolve(process.cwd(), ".env.local"));

/** Viral poster hook — cover must stop the scroll */
const topic =
  process.argv[2] ||
  "Страшно прийти в Vernatun? Листай — это не экзамен, а тёплый разговор";

async function main() {
  console.log("Mode A freedom demo · topic:", topic);
  const result = await runVernatunCarouselJob({
    brief: {
      topic,
      audience: "москвичи 25–40, армянская диаспора, новички клуба",
      slideCount: 4,
      buildMode: "A",
      skipScriptApproval: true,
      cta: "Приходите на встречу Vernatun",
      maxRepairCycles: 2,
    },
    onProgress: (a, m) => console.log(`  [${a}] ${m}`),
  });
  let summary: Record<string, unknown> = {};
  try {
    summary = JSON.parse(
      await readFile(path.join(result.jobDir, "final", "summary.json"), "utf8"),
    );
  } catch {
    /* */
  }
  const out = {
    status: result.status,
    jobId: result.jobId,
    jobDir: result.jobDir,
    slides: result.slides.map((s) => s.imageUrl),
    recipes: summary.recipes,
    templates: summary.templates,
    brandModes: summary.brandModes,
    textModes: summary.textModes,
    designColorsHash: summary.designColorsHash,
    remarks: result.remarks.slice(0, 10),
  };
  console.log(JSON.stringify(out, null, 2));
  const dir = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-smoke",
    "2026-10-22-freedom-demo",
  );
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, "demo-one-freedom.json"),
    JSON.stringify(out, null, 2),
    "utf8",
  );

  // Always land in Studio «Черновики» so localhost UI sees the job
  const draftId = `vernatun-a-freedom-${result.jobId.slice(0, 8)}`;
  await upsertDraft(SEED_ADMIN_USER_ID, {
    id: draftId,
    moduleId: "carousel-engine",
    title: `[A/${result.status}] ${topic}`.slice(0, 120),
    slides: result.slides.map((s, j) => ({
      id: `s${j + 1}`,
      imageUrl: s.imageUrl,
      caption: topic,
    })),
    scenario: [
      `mode=A`,
      `job=${result.jobId}`,
      `status=${result.status}`,
      `brandModes=${JSON.stringify(summary.brandModes ?? [])}`,
      `textModes=${JSON.stringify(summary.textModes ?? [])}`,
      ...result.remarks.slice(0, 6),
    ].join("\n"),
    status: "unpublished",
    sourceCompetitorId: "vernatun-freedom",
    competitorId: "vernatun-freedom",
  });
  console.log("draft upserted → Черновики:", draftId);

  if (result.status !== "FINAL") process.exitCode = 2;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
