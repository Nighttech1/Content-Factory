/**
 * Mode B invite carousel via Studio product path (draw-bridge) + user photo.
 * Result lands in Черновики.
 *
 * Usage:
 *   npx tsx scripts/run-mode-b-studio-invite.ts [path-to-photo.jpg]
 */
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path, { resolve } from "node:path";
import { runVernatunFromTopic } from "../lib/studio/vernatun-carousel/draw-bridge";
import { ingestUserAssets } from "../lib/studio/vernatun-carousel/ingest-user-assets";
import { upsertDraft } from "../lib/db/drafts-repository";
import { SEED_ADMIN_USER_ID } from "../lib/db/actor";
import { randomUUID } from "node:crypto";

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

const DEFAULT_PHOTO = resolve(
  process.env.USERPROFILE || "",
  ".cursor/projects/e-Applications-Content-factory/assets/c__Users_karahanyan_a_s_AppData_Roaming_Cursor_User_workspaceStorage_8176f3d1f8dbe02963fbf8102bd25af3_images_image-e483a159-39ad-4ef2-9e54-1a3b59e8bc6c.jpg",
);

const TOPIC =
  process.argv[3] ||
  "Приглашаем в Vernatun — тёплый speaking-club в Москве. Приходи на разговор, не на экзамен";

async function main() {
  const photoPath = resolve(process.argv[2] || DEFAULT_PHOTO);
  if (!existsSync(photoPath)) {
    throw new Error(`photo_not_found: ${photoPath}`);
  }

  const jobId = randomUUID();
  const jobDir = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-jobs",
    jobId,
  );
  await mkdir(path.join(jobDir, "assets", "user"), { recursive: true });

  const buf = await readFile(photoPath);
  const userAssets = await ingestUserAssets({
    jobDir,
    files: [
      {
        filename: path.basename(photoPath) || "user-invite.jpg",
        mime: "image/jpeg",
        data: buf,
        required: true,
      },
    ],
  });

  console.log("Mode B Studio invite");
  console.log("  photo:", photoPath);
  console.log("  topic:", TOPIC);
  console.log("  userAssets:", userAssets.map((a) => a.asset_id).join(", "));

  let result: Awaited<ReturnType<typeof runVernatunFromTopic>>;
  try {
    result = await runVernatunFromTopic({
      topic: TOPIC,
      slideCount: 4,
      buildMode: "B",
      jobId,
      userAssets,
      styleNotes:
        "Обложка-хук приглашение в speaking-club Vernatun. Опирайся на фото пользователя (тёплая встреча за столом). CTA: Приходите на встречу Vernatun.",
      onProgress: (a, m) => console.log(`  [${a}] ${m}`),
    });
  } catch (err) {
    console.error("Mode B job failed:", err);
    throw err;
  }

  if (!result.ok) {
    throw new Error(result.error?.message || "mode_b_draw_failed");
  }
  const jobIdOut =
    result.jobId ||
    result.artifactDir?.split(/[/\\]/).pop() ||
    jobId;
  const statusOut = result.status || (result.needsReview ? "BLOCKED_WITH_REMARKS" : "FINAL");
  const remarksOut = result.remarks ?? [];
  const draftId = `vernatun-b-invite-${String(jobIdOut).slice(0, 8)}`;
  await upsertDraft(SEED_ADMIN_USER_ID, {
    id: draftId,
    moduleId: "carousel-engine",
    title: `[B/${statusOut}] Приглашение в Vernatun (ваше фото)`.slice(0, 120),
    slides: result.slides.map((s, j) => ({
      id: `s${j + 1}`,
      imageUrl: s.imageUrl,
      caption: TOPIC,
    })),
    scenario: [
      `mode=B`,
      `job=${jobIdOut}`,
      `status=${statusOut}`,
      `user_photo=yes`,
      TOPIC,
      ...remarksOut.slice(0, 6),
    ].join("\n"),
    status: "unpublished",
    sourceCompetitorId: "vernatun-b-invite",
    competitorId: "vernatun-b-invite",
  });

  const out = {
    status: statusOut,
    jobId: jobIdOut,
    draftId,
    slides: result.slides.map((s) => s.imageUrl),
    remarks: remarksOut.slice(0, 8),
  };
  const smokeDir = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-smoke",
    "2026-10-22-mode-b-invite",
  );
  await mkdir(smokeDir, { recursive: true });
  await writeFile(
    path.join(smokeDir, "demo-b-invite.json"),
    JSON.stringify(out, null, 2),
    "utf8",
  );
  // Keep a copy of user photo next to report for audit
  await copyFile(photoPath, path.join(smokeDir, "user-photo-source.jpg"));

  console.log(JSON.stringify(out, null, 2));
  console.log("Черновик:", draftId);
  if (result.status !== "FINAL") process.exitCode = 2;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
