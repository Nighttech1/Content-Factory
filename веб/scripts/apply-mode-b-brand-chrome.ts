/**
 * Apply Vernatun emblem chrome onto an existing Mode B job rendered slides.
 * Usage: npx tsx scripts/apply-mode-b-brand-chrome.ts <jobId>
 */
import { readdir, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  applyModeBBrandChrome,
  resolveVernatunEmblemDataUrl,
} from "../lib/studio/vernatun-carousel/mode-b-brand-chrome";
import { getBrandSettings } from "../lib/settings/brand-store";
import { SEED_ADMIN_USER_ID } from "../lib/db/actor";
import { ensurePublicUrls } from "../lib/studio/vernatun-carousel/renderer";

async function main() {
  const jobId =
    process.argv[2]?.trim() || "e70e178d-9683-45ff-800b-5385163b50a5";
  const jobDir = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-jobs",
    jobId,
  );
  const rendered = path.join(jobDir, "rendered");
  const files = (await readdir(rendered))
    .filter((f) => /^slide_\d+\.(png|jpe?g)$/i.test(f))
    .sort();
  const brand = await getBrandSettings(SEED_ADMIN_USER_ID);
  const logoDataUrl = await resolveVernatunEmblemDataUrl(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  );
  const outPaths: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const src = path.join(rendered, files[i]!);
    const dest = path.join(rendered, files[i]!.replace(/\.(jpe?g)$/i, ".png"));
    await applyModeBBrandChrome({
      slidePngOrJpegPath: src,
      outPngPath: dest,
      logoDataUrl,
      brandName: brand.brandName || "Vernatun",
      tagline: brand.tagline || "moscow armenian speaking club",
      slideIndex0: i,
    });
    outPaths.push(dest);
    console.log("chrome ok", files[i]);
  }
  await ensurePublicUrls(outPaths, jobId);
  const pub = path.join(process.cwd(), "public", "vernatun-jobs", jobId);
  await mkdir(pub, { recursive: true });
  for (const p of outPaths) {
    await copyFile(p, path.join(pub, path.basename(p)));
  }
  console.log("done", jobId, outPaths.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
