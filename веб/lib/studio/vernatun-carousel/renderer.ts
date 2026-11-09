import { mkdir, copyFile, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import type { BuildMode, VernatunScript } from "./types";
import type { PreparedSlideImage } from "./image-gen";

export const FRAME_W = 1080;
export const FRAME_H = 1350;

export async function renderModeBCopies(
  images: PreparedSlideImage[],
  outDir: string,
  brand?: {
    logoDataUrl: string;
    brandName: string;
    tagline: string;
  },
  script?: VernatunScript,
  opts?: {
    jobId?: string;
    jobDir?: string;
    session?: import("./job-llm-session").JobLlmSession;
  },
): Promise<string[]> {
  await mkdir(outDir, { recursive: true });
  const pngPaths: string[] = [];
  const { applyModeBBrandChrome, resolveVernatunEmblemDataUrl } = await import(
    "./mode-b-brand-chrome"
  );
  const {
    bakeExactEmblemOntoSlide,
    DEFAULT_LOGO_BAKE_SIZE_PX,
    ensureLogoBakeJobMeta,
    isLogoBakeEnabled,
    pickLogoCornerForJob,
    resolveLogoBakeEmblemPath,
    resolveWordmarkHexForSlide,
    writeLogoBakeJobMeta,
  } = await import("./logo-bake");
  const {
    bakeVocabPlaqueOntoSlide,
    pickVocabSlot,
    writeVocabBakeLog,
  } = await import("./vocab-plaque-bake");
  const {
    bakeSlideArrowOntoSlide,
    writeSlideArrowBakeLog,
  } = await import("./slide-arrow-bake");
  const logoDataUrl = brand
    ? await resolveVernatunEmblemDataUrl(brand.logoDataUrl)
    : "";
  const emblemPath = resolveLogoBakeEmblemPath();
  const jobId = opts?.jobId || "anonymous";
  const jobDir = opts?.jobDir || path.dirname(outDir);
  let bakeCorner = pickLogoCornerForJob(jobId);
  let bakeSize = DEFAULT_LOGO_BAKE_SIZE_PX;
  let bakeEmblem = emblemPath;
  let meta =
    isLogoBakeEnabled() && emblemPath
      ? await ensureLogoBakeJobMeta(jobDir, jobId, emblemPath)
      : null;
  if (meta) {
    bakeCorner = meta.corner;
    bakeSize = meta.sizePx;
    bakeEmblem = meta.emblemPath;
  }
  const wordmarkBySlide: Record<string, string> = {
    ...(meta?.wordmarkBySlide || {}),
  };
  const slideCount = script?.slide_count ?? script?.slides.length ?? images.length;
  const vocabRows: Awaited<ReturnType<typeof bakeVocabPlaqueOntoSlide>>[] =
    [];
  const arrowRows: Awaited<ReturnType<typeof bakeSlideArrowOntoSlide>>[] =
    [];
  const accentMatch = /#(?:F58220|f58220|[0-9A-Fa-f]{6})/.exec(
    JSON.stringify(script ?? {}),
  );
  const accentHex = accentMatch?.[0] ?? "#F58220";

  for (const img of images) {
    const outPath = path.join(
      outDir,
      `slide_${String(img.slideIndex).padStart(2, "0")}.png`,
    );
    // Legacy emergency: HTML chrome bar only if MODE_B_HTML_CHROME=1.
    const useHtmlChrome = process.env.MODE_B_HTML_CHROME === "1";
    const afterLogo = outPath;
    if (useHtmlChrome && brand && logoDataUrl) {
      await applyModeBBrandChrome({
        slidePngOrJpegPath: img.localPath,
        outPngPath: outPath,
        logoDataUrl,
        brandName: brand.brandName,
        tagline: brand.tagline,
        slideIndex0: Math.max(0, img.slideIndex - 1),
        chromeStyle: "bare",
      });
    } else if (isLogoBakeEnabled() && bakeEmblem && meta) {
      // Per-slide wordmark contrast (beige → dark text, dark photo → white).
      const tint = await resolveWordmarkHexForSlide({
        meta,
        slideIndex: img.slideIndex,
        slidePath: img.localPath,
      });
      wordmarkBySlide[String(img.slideIndex)] = tint.wordmarkHex;
      await bakeExactEmblemOntoSlide({
        slidePath: img.localPath,
        emblemPath: bakeEmblem,
        outPath,
        corner: bakeCorner,
        sizePx: bakeSize,
        wordmarkHex: tint.wordmarkHex,
      });
    } else {
      await copyFile(img.localPath, outPath);
    }

    // B4.5: exact HY—RU pill (Playwright) — after logo bake.
    // Skip on the LAST slide: it carries the brand CTA button (baked into the
    // generated image). The vocab pill lands in the same bottom pocket and
    // collides with / smears over the CTA (AD blocker slide 4 cta vocab overlap +
    // gray fallback-reconstruct patch). Mirror the arrow skip on the last slide.
    const slideScript = script?.slides.find((s) => s.index === img.slideIndex);
    const hyRu = slideScript?.supporting_copy?.trim();
    if (
      hyRu &&
      img.slideIndex < slideCount &&
      process.env.CAROUSEL_SKIP_VOCAB_BAKE?.trim() !== "1"
    ) {
      const plan = pickVocabSlot(img.slideIndex, slideCount);
      // Keep logo-only frame so detect/re-bake don't need GPT regen
      const preVocab = path.join(
        outDir,
        `slide_${String(img.slideIndex).padStart(2, "0")}_pre_vocab.png`,
      );
      await copyFile(afterLogo, preVocab);
      const vocabOut = path.join(
        outDir,
        `slide_${String(img.slideIndex).padStart(2, "0")}_vocab.png`,
      );
      const baked = await bakeVocabPlaqueOntoSlide({
        slidePath: preVocab,
        outPath: vocabOut,
        hyRu,
        slot: plan.slot,
        dashedExpected: plan.dashed,
        accentHex,
        jobDir,
        slideIndex: img.slideIndex,
        session: opts?.session,
      });
      await copyFile(vocabOut, outPath);
      vocabRows.push(baked);
    }

    // B4.6: BR swipe arrow (length ≈ logo), contrast vs local bg.
    // Skip on the LAST slide: it is a "swipe to next" cue (no next there) and
    // the final slide carries the brand CTA band — baking the arrow over it
    // collides with the CTA text (AD reject d9daaed7 slide 4 cta_collision).
    if (
      process.env.CAROUSEL_SKIP_ARROW_BAKE?.trim() !== "1" &&
      img.slideIndex < slideCount
    ) {
      const arrowOut = path.join(
        outDir,
        `slide_${String(img.slideIndex).padStart(2, "0")}_arrow.png`,
      );
      const arrowBaked = await bakeSlideArrowOntoSlide({
        slidePath: outPath,
        outPath: arrowOut,
        jobDir,
        slideIndex: img.slideIndex,
      });
      await copyFile(arrowOut, outPath);
      arrowRows.push(arrowBaked);
    }

    pngPaths.push(outPath);
  }

  if (meta && Object.keys(wordmarkBySlide).length) {
    meta = { ...meta, wordmarkBySlide };
    await writeLogoBakeJobMeta(jobDir, meta);
  }
  if (vocabRows.length) {
    await writeVocabBakeLog(jobDir, vocabRows);
  }
  if (arrowRows.length) {
    await writeSlideArrowBakeLog(jobDir, arrowRows);
  }
  return pngPaths;
}

export async function ensurePublicUrls(
  pngPaths: string[],
  jobId: string,
): Promise<string[]> {
  // Serve via /api or public symlink path under generatedMedia
  const publicDir = path.join(
    process.cwd(),
    "public",
    "vernatun-jobs",
    jobId,
  );
  await mkdir(publicDir, { recursive: true });
  const urls: string[] = [];
  for (const p of pngPaths) {
    const base = path.basename(p);
    const dest = path.join(publicDir, base);
    await copyFile(p, dest);
    urls.push(`/vernatun-jobs/${jobId}/${base}`);
  }
  return urls;
}

export function captionsFromScript(script: VernatunScript): string[] {
  return script.slides.map((s) => {
    const parts = [s.headline, s.body, s.cta].filter(Boolean);
    return parts.join("\n");
  });
}

export async function renderByMode(input: {
  buildMode: BuildMode;
  htmlPaths: string[];
  images: PreparedSlideImage[];
  renderedDir: string;
  brand?: {
    logoDataUrl: string;
    brandName: string;
    tagline: string;
  };
  script?: VernatunScript;
  jobId?: string;
  jobDir?: string;
  /** Shared job LLM session — lets the vocab bake place the pill via AD vision. */
  session?: import("./job-llm-session").JobLlmSession;
}): Promise<string[]> {
  return renderModeBCopies(
    input.images,
    input.renderedDir,
    input.brand,
    input.script,
    { jobId: input.jobId, jobDir: input.jobDir, session: input.session },
  );
}
