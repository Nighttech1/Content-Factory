/**
 * Seed latest Vernatun FINAL (and optional recent) jobs into drafts SoT for localhost UI.
 * Usage: npx tsx scripts/seed-vernatun-final-drafts.ts
 */
import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";
import { upsertDraft } from "../lib/db/drafts-repository";
import { SEED_ADMIN_USER_ID } from "../lib/db/actor";

async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const jobsRoot = path.join(process.cwd(), "generatedMedia", "vernatun-jobs");
  const jobIds = await readdir(jobsRoot);
  const rows: Array<{
    jobId: string;
    status: string;
    topic: string;
    slides: string[];
    mtime: number;
  }> = [];

  for (const jobId of jobIds) {
    const summaryPath = path.join(jobsRoot, jobId, "final", "summary.json");
    const briefPath = path.join(jobsRoot, jobId, "brief.json");
    const scriptPath = path.join(jobsRoot, jobId, "script.json");
    if (!(await exists(summaryPath))) continue;
    const summary = JSON.parse(await readFile(summaryPath, "utf8")) as {
      status?: string;
      remarks?: string[];
    };
    const status = String(summary.status ?? "UNKNOWN");
    if (status !== "FINAL" && process.env.SEED_INCLUDE_BLOCKED !== "1") {
      // Still allow the known product FINAL + newest finals only
      if (status !== "FINAL") continue;
    }
    let topic = jobId;
    if (await exists(briefPath)) {
      const brief = JSON.parse(await readFile(briefPath, "utf8")) as {
        topic?: string;
      };
      topic = brief.topic?.trim() || topic;
    } else if (await exists(scriptPath)) {
      const script = JSON.parse(await readFile(scriptPath, "utf8")) as {
        carousel_title?: string;
      };
      topic = script.carousel_title?.trim() || topic;
    }

    const slides: string[] = [];
    for (let i = 1; i <= 12; i++) {
      const url = `/vernatun-jobs/${jobId}/slide_0${i}.png`.replace(
        "slide_010",
        "slide_10",
      );
      const publicPng = path.join(
        process.cwd(),
        "public",
        "vernatun-jobs",
        jobId,
        `slide_${String(i).padStart(2, "0")}.png`,
      );
      if (await exists(publicPng)) slides.push(url);
      else break;
    }
    if (slides.length === 0) continue;

    const st = await import("node:fs/promises").then((m) =>
      m.stat(summaryPath),
    );
    rows.push({
      jobId,
      status,
      topic,
      slides,
      mtime: st.mtimeMs,
    });
  }

  rows.sort((a, b) => b.mtime - a.mtime);
  const limit = Math.max(1, Number(process.env.SEED_DRAFT_LIMIT ?? 6) || 6);
  const pick = rows.slice(0, limit);

  for (const row of pick) {
    const id = `vernatun-final-${row.jobId.slice(0, 8)}`;
    await upsertDraft(SEED_ADMIN_USER_ID, {
      id,
      moduleId: "carousel-engine",
      title: `[${row.status}] ${row.topic}`.slice(0, 120),
      slides: row.slides.map((url, i) => ({
        id: `s${i + 1}`,
        imageUrl: url,
        caption: row.topic,
      })),
      scenario: [`job=${row.jobId}`, `status=${row.status}`, row.topic].join(
        "\n",
      ),
      status: "unpublished",
      sourceCompetitorId: "vernatun-final",
      competitorId: "vernatun-final",
    });
    console.log("draft upserted", id, row.status, row.slides.length, "slides");
  }

  console.log(`Done. Seeded ${pick.length} draft(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
