/**
 * Re-apply logo_bake on an existing job's originals → rendered + public.
 * Per-slide wordmark contrast (auto) unless AD lock in logo_bake.json.
 * Usage: npx tsx scripts/rebake-job-logos.ts <jobId>
 */
import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import {
  bakeExactEmblemOntoSlide,
  ensureLogoBakeJobMeta,
  pickLogoCornerForJob,
  resolveLogoBakeEmblemPath,
  resolveWordmarkHexForSlide,
  writeLogoBakeJobMeta,
} from "../lib/studio/vernatun-carousel/logo-bake";

async function main() {
  const jobId = process.argv[2];
  if (!jobId) {
    console.error("Usage: npx tsx scripts/rebake-job-logos.ts <jobId>");
    process.exit(1);
  }
  const emblem = resolveLogoBakeEmblemPath();
  if (!emblem) throw new Error("emblem_missing");
  const jobDir = path.join(process.cwd(), "generatedMedia", "vernatun-jobs", jobId);
  let meta = await ensureLogoBakeJobMeta(jobDir, jobId, emblem);
  meta = { ...meta, emblemPath: emblem };
  // Clear stale series-wide tint so per-slide auto runs (keep AD locks).
  delete meta.wordmarkHex;

  const originals = path.join(jobDir, "assets", "originals");
  const rendered = path.join(jobDir, "rendered");
  const pub = path.join(process.cwd(), "public", "vernatun-jobs", jobId);
  await mkdir(rendered, { recursive: true });
  await mkdir(pub, { recursive: true });
  const files = (await readdir(originals))
    .filter((f) => /^slide_\d+_src\.(jpe?g|png)$/i.test(f))
    .sort();

  console.log(
    "corner",
    meta.corner,
    "(pick would be",
    pickLogoCornerForJob(jobId) + ")",
    "size",
    meta.sizePx,
    "emblem",
    path.basename(meta.emblemPath),
  );

  const wordmarkBySlide: Record<string, string> = {
    ...(meta.wordmarkBySlide || {}),
  };

  for (const f of files) {
    const m = f.match(/^slide_(\d+)_src/i);
    const n = m?.[1] ?? "01";
    const slideIndex = Number(n);
    const outName = `slide_${n.padStart(2, "0")}.png`;
    const out = path.join(rendered, outName);
    const slidePath = path.join(originals, f);
    const tint = await resolveWordmarkHexForSlide({
      meta,
      slideIndex,
      slidePath,
    });
    wordmarkBySlide[String(slideIndex)] = tint.wordmarkHex;
    const r = await bakeExactEmblemOntoSlide({
      slidePath,
      emblemPath: meta.emblemPath,
      outPath: out,
      corner: meta.corner,
      sizePx: meta.sizePx,
      wordmarkHex: tint.wordmarkHex,
    });
    await copyFile(out, path.join(pub, outName));
    console.log(
      "baked",
      outName,
      r.corner,
      r.wordmarkHex,
      `lum=${tint.luminance.toFixed(0)}`,
      `${r.placedW}x${r.placedH}`,
    );
  }

  meta = { ...meta, wordmarkBySlide };
  await writeLogoBakeJobMeta(jobDir, meta);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
