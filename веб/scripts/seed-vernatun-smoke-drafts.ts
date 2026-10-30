/**
 * Upsert smoke vernatun jobs into drafts SoT so they appear in UI.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { upsertDraft } from "../lib/db/drafts-repository";
import { SEED_ADMIN_USER_ID } from "../lib/db/actor";

async function main() {
  const reportPath = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-smoke",
    "2026-10-21",
    "smoke-report.json",
  );
  const rows = JSON.parse(await readFile(reportPath, "utf8")) as Array<{
    index: number;
    topic: string;
    buildMode: string;
    status: string;
    jobId: string;
    slides: string[];
    remarks: string[];
  }>;

  for (const row of rows) {
    const id = `vernatun-smoke-${row.index}-${row.buildMode}`;
    await upsertDraft(SEED_ADMIN_USER_ID, {
      id,
      moduleId: "carousel-engine",
      title: `[${row.buildMode}/${row.status}] ${row.topic}`,
      slides: row.slides.map((url, i) => ({
        id: `s${i + 1}`,
        imageUrl: url,
        caption: row.topic,
      })),
      scenario: [
        `Vernatun smoke job ${row.jobId}`,
        `mode=${row.buildMode}`,
        `status=${row.status}`,
        ...(row.remarks?.length
          ? ["remarks:", ...row.remarks.slice(0, 6)]
          : []),
      ].join("\n"),
      status: "unpublished",
      sourceCompetitorId: "vernatun-smoke",
      competitorId: "vernatun-smoke",
    });
    console.log("draft upserted", id);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
