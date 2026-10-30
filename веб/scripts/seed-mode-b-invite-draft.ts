/**
 * Seed the latest Mode B invite FINAL into Studio drafts.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";
import { upsertDraft } from "../lib/db/drafts-repository";
import { SEED_ADMIN_USER_ID } from "../lib/db/actor";

function loadDotEnv(file: string) {
  try {
    const raw = readFileSync(file, "utf8");
    for (const line of raw.split(/\r?\n/)) {
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

async function exists(p: string) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const prefer = process.argv[2];
  const jobsRoot = path.join(process.cwd(), "generatedMedia", "vernatun-jobs");
  let jobId = prefer;
  if (!jobId) {
    const ids = await readdir(jobsRoot);
    const ranked: Array<{ id: string; m: number }> = [];
    for (const id of ids) {
      const sp = path.join(jobsRoot, id, "final", "summary.json");
      if (!(await exists(sp))) continue;
      const summary = JSON.parse(await readFile(sp, "utf8")) as {
        status?: string;
        buildMode?: string;
      };
      if (summary.status !== "FINAL") continue;
      const st = await import("node:fs/promises").then((fs) => fs.stat(sp));
      ranked.push({ id, m: st.mtimeMs });
    }
    ranked.sort((a, b) => b.m - a.m);
    jobId = ranked[0]?.id;
  }
  if (!jobId) throw new Error("no_final_job");

  const summary = JSON.parse(
    await readFile(
      path.join(jobsRoot, jobId, "final", "summary.json"),
      "utf8",
    ),
  ) as { status?: string; buildMode?: string };
  let topic = "Приглашение в Vernatun";
  const briefPath = path.join(jobsRoot, jobId, "brief.json");
  if (await exists(briefPath)) {
    const brief = JSON.parse(await readFile(briefPath, "utf8")) as {
      topic?: string;
    };
    topic = brief.topic || topic;
  }

  const slides: Array<{ id: string; imageUrl: string; caption: string }> = [];
  for (let i = 1; i <= 4; i++) {
    const name = `slide_${String(i).padStart(2, "0")}.png`;
    const pub = path.join(process.cwd(), "public", "vernatun-jobs", jobId, name);
    if (!(await exists(pub))) break;
    slides.push({
      id: `s${i}`,
      imageUrl: `/vernatun-jobs/${jobId}/${name}`,
      caption: topic,
    });
  }
  if (!slides.length) throw new Error(`no_public_slides:${jobId}`);

  const draftId = `vernatun-b-invite-${jobId.slice(0, 8)}`;
  await upsertDraft(SEED_ADMIN_USER_ID, {
    id: draftId,
    moduleId: "carousel-engine",
    title: `[B/${summary.status ?? "FINAL"}] Приглашение в Vernatun (ваше фото)`.slice(
      0,
      120,
    ),
    slides,
    scenario: [
      `mode=${summary.buildMode ?? "B"}`,
      `job=${jobId}`,
      `status=${summary.status}`,
      `user_photo=yes`,
      topic,
    ].join("\n"),
    status: "unpublished",
    sourceCompetitorId: "vernatun-b-invite",
    competitorId: "vernatun-b-invite",
  });
  console.log(JSON.stringify({ draftId, jobId, slides: slides.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
