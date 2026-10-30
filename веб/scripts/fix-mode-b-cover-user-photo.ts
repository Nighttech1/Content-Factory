/**
 * Patch Mode B job cover: AI-edit of USER photo (preserve faces/scene) +
 * typography/symbols — NO HTML-only headline overlay. Bare logo only.
 *
 * Usage: npx tsx scripts/fix-mode-b-cover-user-photo.ts [jobId] [userPhotoPath]
 */
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path, { resolve } from "node:path";
import { createHash } from "node:crypto";
import {
  applyModeBBrandChrome,
  resolveVernatunEmblemDataUrl,
} from "../lib/studio/vernatun-carousel/mode-b-brand-chrome";
import { buildModeBSlidePrompt } from "../lib/studio/vernatun-carousel/prompts";
import { ensurePublicUrls } from "../lib/studio/vernatun-carousel/renderer";
import {
  DEFAULT_CAROUSEL_IMAGE_MODEL,
  generateAggregatorImageWithOptionalRef,
} from "../lib/llm/aggregator-images";
import { resolveRoleModel } from "../lib/studio/vernatun-carousel/role-models";
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

const DEFAULT_JOB = "b49ee362-35df-4b4d-9453-16dbe4dc2ce1";
const DEFAULT_PHOTO = resolve(
  process.env.USERPROFILE || "",
  ".cursor/projects/e-Applications-Content-factory/assets/c__Users_karahanyan_a_s_AppData_Roaming_Cursor_User_workspaceStorage_8176f3d1f8dbe02963fbf8102bd25af3_images_image-e483a159-39ad-4ef2-9e54-1a3b59e8bc6c.jpg",
);

async function downloadToFile(url: string, dest: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download_fail:${res.status}:${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf;
}

async function main() {
  const jobId = process.argv[2] || DEFAULT_JOB;
  const photoPath = resolve(process.argv[3] || DEFAULT_PHOTO);
  if (!existsSync(photoPath)) throw new Error(`photo_missing:${photoPath}`);

  const jobDir = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-jobs",
    jobId,
  );
  const script = JSON.parse(
    await readFile(path.join(jobDir, "script.json"), "utf8"),
  ) as {
    slides: Array<{
      index: number;
      headline?: string;
      body?: string;
      supporting_copy?: string;
      cta?: string;
      visual_intent?: string;
    }>;
  };
  const cover = script.slides.find((s) => s.index === 1) || script.slides[0];

  const originals = path.join(jobDir, "assets", "originals");
  await mkdir(originals, { recursive: true });
  const userDir = path.join(jobDir, "assets", "user");
  await mkdir(userDir, { recursive: true });
  await copyFile(photoPath, path.join(userDir, "01_user_cover.jpg"));

  const headline = cover?.headline || "Разговор, а не экзамен";
  const body =
    cover?.body ||
    cover?.supporting_copy ||
    "Speaking-club Vernatun в Москве";
  const prompt =
    buildModeBSlidePrompt({
      index: 1,
      headline,
      body,
      supporting: cover?.supporting_copy,
      cta: cover?.cta,
      visualIntent:
        cover?.visual_intent ||
        "warm speaking-club meetup around a table; real client photo as base",
      brandName: "Vernatun",
      colorsNote: "warm earth + cream ink from Vernatun Design settings",
    }) +
    `\nCRITICAL — USER PHOTO EDIT (cover):
The attached image is the CLIENT'S real photo. Keep it as the main background.
PRESERVE: same people, faces, clothing, table, room layout, camera angle — do NOT replace with different people or invent a new scene.
ALLOWED: add beautiful Russian typography, accent symbols, small graphic flourishes, soft vignette/grade, tasteful stickers — as an art director would on a viral poster.
FORBIDDEN: concert/stage/drums; full redraw; face swap; changing who is in the frame.`;

  const model =
    process.env.CAROUSEL_IMAGE_MODEL?.trim() ||
    resolveRoleModel("imageGen").model ||
    DEFAULT_CAROUSEL_IMAGE_MODEL;
  console.log(
    `Generating cover with user photo as edit reference (model=${model})…`,
  );
  const gen = await generateAggregatorImageWithOptionalRef({
    prompt,
    model,
    size: "1024x1280",
    referenceImagePath: photoPath,
  });
  if (!gen?.url) {
    throw new Error(
      `cover_gen_empty_url model=${model} (edits+generations returned no url)`,
    );
  }

  const coverSrc = path.join(originals, "slide_01_src.jpg");
  const genBuf = await downloadToFile(gen.url, coverSrc);

  const emblemFallback =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const logoDataUrl = await resolveVernatunEmblemDataUrl(emblemFallback);

  const renderedDir = path.join(jobDir, "rendered");
  await mkdir(renderedDir, { recursive: true });

  // Slide 1: AI-edited user photo + bare logo ONLY (no HTML headline)
  const slide1Out = path.join(renderedDir, "slide_01.png");
  await applyModeBBrandChrome({
    slidePngOrJpegPath: coverSrc,
    outPngPath: slide1Out,
    logoDataUrl,
    brandName: "Vernatun",
    tagline: "moscow armenian speaking club",
    slideIndex0: 0,
    chromeStyle: "bare",
  });

  // Slides 2–4: keep AI art, bare logo
  for (let i = 2; i <= 4; i++) {
    const srcAi = path.join(
      jobDir,
      "assets",
      "originals",
      `slide_${String(i).padStart(2, "0")}_src.jpg`,
    );
    const fallbackRendered = path.join(
      renderedDir,
      `slide_${String(i).padStart(2, "0")}.png`,
    );
    const src = existsSync(srcAi) ? srcAi : fallbackRendered;
    if (!existsSync(src)) continue;
    await applyModeBBrandChrome({
      slidePngOrJpegPath: src,
      outPngPath: path.join(
        renderedDir,
        `slide_${String(i).padStart(2, "0")}.png`,
      ),
      logoDataUrl,
      brandName: "Vernatun",
      tagline: "moscow armenian speaking club",
      slideIndex0: i - 1,
      chromeStyle: "bare",
    });
  }

  const pngPaths = [1, 2, 3, 4]
    .map((i) =>
      path.join(renderedDir, `slide_${String(i).padStart(2, "0")}.png`),
    )
    .filter((p) => existsSync(p));
  const urls = await ensurePublicUrls(pngPaths, jobId);

  const manifestPath = path.join(jobDir, "reports", "ASSET_MANIFEST.json");
  try {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Array<
      Record<string, unknown>
    >;
    const row = manifest.find((m) => m.slide_id === "slide_1") || manifest[0];
    if (row) {
      row.source_type = "generate";
      row.source_url_or_provider = "user_photo_edit_preserve";
      row.sha256 = createHash("sha256").update(genBuf).digest("hex");
      row.bytes = genBuf.length;
      row.transform_log = "mode_b_cover_preserve_user_photo_add_type_bare_logo";
    }
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  } catch {
    /* optional */
  }

  const draftId = `vernatun-b-invite-${jobId.slice(0, 8)}`;
  await upsertDraft(SEED_ADMIN_USER_ID, {
    id: draftId,
    moduleId: "carousel-engine",
    title: "[B/FINAL] Приглашение Vernatun — фото + AI-типографика",
    slides: urls.map((url, j) => ({
      id: `s${j + 1}`,
      imageUrl: `${url}?t=${Date.now()}`,
      caption: "Vernatun invite",
    })),
    scenario: [
      "mode=B",
      `job=${jobId}`,
      "cover=preserve_user_photo_add_type",
      "logo=bare_no_plaque",
      "temp: no HTML-only on user photo; AD may add typography/symbols",
    ].join("\n"),
    status: "unpublished",
    sourceCompetitorId: "vernatun-b-invite",
    competitorId: "vernatun-b-invite",
  });

  console.log(
    JSON.stringify(
      {
        jobId,
        draftId,
        coverSha: createHash("sha256")
          .update(genBuf)
          .digest("hex")
          .slice(0, 12),
        model,
        continuity: gen.continuity,
        slides: urls,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
