import { mkdir, writeFile, copyFile, readFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

import { generateAggregatorImageWithOptionalRef } from "@/lib/llm/aggregator-images";
import { buildModeBSlidePrompt } from "./prompts";
import {
  imageModelSupportsNativeRefs,
  resolveImageGenModelChain,
  resolveRoleModel,
} from "./role-models";
import { resolveVernatunEmblemPath } from "./mode-b-brand-chrome";
import { logSlideImagePrompt } from "./prompt-dev-log";
import type { AssetManifestRow, BuildMode, QualityStatus, VernatunScript } from "./types";
import type { ImageSlotPlan } from "./image-planner";

async function downloadToFile(
  url: string,
  dest: string,
): Promise<{ bytes: number; sha256: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download_fail_${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return {
    bytes: buf.length,
    sha256: createHash("sha256").update(buf).digest("hex"),
  };
}

function qualityFromBytes(bytes: number, shortHint?: number): QualityStatus {
  if (bytes < 20_000) return "BLOCKED";
  if (shortHint != null && shortHint < 720) return "WARN";
  if (bytes < 80_000) return "WARN";
  return "PASS";
}

export type PreparedSlideImage = {
  slideIndex: number;
  localPath: string;
  publicUrl: string;
  manifest: AssetManifestRow;
};

export async function prepareSlideImages(input: {
  jobDir: string;
  topic: string;
  script: VernatunScript;
  slots: ImageSlotPlan[];
  buildMode: BuildMode;
  brandName: string;
  colorsNote: string;
  visualStyle: string;
  userAssetPathById: Map<string, string>;
  /** Optional override; default resolves Vernatun apple-touch emblem. */
  logoPath?: string | null;
}): Promise<PreparedSlideImage[]> {
  const originals = path.join(input.jobDir, "assets", "originals");
  await mkdir(originals, { recursive: true });
  const model = resolveRoleModel("imageGen");
  const out: PreparedSlideImage[] = [];
  const logoPath =
    input.logoPath === null
      ? null
      : input.logoPath?.trim() || resolveVernatunEmblemPath();

  for (const slot of input.slots) {
    const slide = input.script.slides.find((s) => s.index === slot.slide_index);
    if (!slide) continue;
    const fname = `slide_${String(slot.slide_index).padStart(2, "0")}_src.jpg`;
    const dest = path.join(originals, fname);

    if (slot.action === "use_user" && slot.user_asset_id) {
      const src = input.userAssetPathById.get(slot.user_asset_id);
      if (src) {
        await copyFile(src, dest);
        const buf = await readFile(dest);
        const sha = createHash("sha256").update(buf).digest("hex");
        const qs = qualityFromBytes(buf.length);
        out.push({
          slideIndex: slot.slide_index,
          localPath: dest,
          publicUrl: dest,
          manifest: {
            asset_id: `user-${slot.slide_index}`,
            filename: fname,
            slide_id: `slide_${slot.slide_index}`,
            role: "photo",
            source_type: "user",
            source_url_or_provider: slot.user_asset_id,
            license_or_terms: "user_upload",
            original_filename: path.basename(src),
            original_width: 0,
            original_height: 0,
            bytes: buf.length,
            format: "image/jpeg",
            sha256: sha,
            transformed: false,
            transform_log: "",
            transformations: [],
            quality_status: qs,
            visual_review: "pending",
            accepted: qs !== "BLOCKED",
            rejection_reason: qs === "BLOCKED" ? "file_too_small" : undefined,
          },
        });
        continue;
      }
    }

    // Mode B: full slide via IMAGE_GEN_MODEL; logo bake is post-pass (refs optional).
    const refId = slot.user_asset_id;
    const userPhotoPath =
      (refId && input.userAssetPathById.get(refId)) ||
      (input.userAssetPathById.size
        ? [...input.userAssetPathById.values()][0]
        : undefined);
    const typeNote = input.script.type_system
      ? `headline=${input.script.type_system.headline}; body=${input.script.type_system.body}; cta=${input.script.type_system.cta}`
      : undefined;
    const slideCountTotal =
      input.script.slide_count ?? input.script.slides.length;
    const { pickVocabSlot } = await import("./vocab-plaque-bake");
    const vocabSlot = pickVocabSlot(slot.slide_index, slideCountTotal);
    const prompt = buildModeBSlidePrompt({
      index: slot.slide_index,
      headline: slide.headline,
      body: slide.body,
      supporting: slide.supporting_copy,
      cta: slide.cta,
      visualIntent: slide.visual_intent,
      brandName: input.brandName,
      colorsNote: input.colorsNote,
      nativeLogoRef: Boolean(logoPath),
      hasUserPhotoRef: Boolean(userPhotoPath),
      typeSystemNote: typeNote,
      slideCountTotal,
      vocabSlot,
    });

    const refPaths: string[] = [];
    const refMeta: Array<{ role: string; path: string }> = [];
    if (userPhotoPath) {
      refPaths.push(userPhotoPath);
      refMeta.push({ role: "user_photo", path: userPhotoPath });
    }
    if (logoPath) {
      refPaths.push(logoPath);
      refMeta.push({ role: "logo", path: logoPath });
    }

    const modelChain = resolveImageGenModelChain(model.model);
    await logSlideImagePrompt({
      jobDir: input.jobDir,
      slideIndex: slot.slide_index,
      prompt,
      refs: refMeta,
      model: modelChain.join(" → "),
    });

    let gen: Awaited<
      ReturnType<typeof generateAggregatorImageWithOptionalRef>
    > = null;
    let usedModel = modelChain[0] ?? model.model;
    for (const tryModel of modelChain) {
      usedModel = tryModel;
      const useRefs =
        imageModelSupportsNativeRefs(tryModel) && refPaths.length > 0;
      const wantsGptQuality = imageModelSupportsNativeRefs(tryModel);
      for (let attempt = 1; attempt <= 2; attempt++) {
        gen = await generateAggregatorImageWithOptionalRef({
          prompt,
          model: tryModel,
          // Product frame 4:5 — ask API for Instagram carousel size, NOT 9:16 stories
          size: "1080x1350",
          // GPT Image honors quality=; YandexART / Gemini — skip
          ...(wantsGptQuality ? { quality: "high" as const } : {}),
          referenceImagePaths: useRefs ? refPaths : undefined,
          referenceImagePath: useRefs ? refPaths[0] : undefined,
        });
        if (gen?.url) break;
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 2000 * attempt));
        }
      }
      if (gen?.url) break;
    }
    if (!gen?.url) {
      throw new Error(
        `image_gen_fail_slide_${slot.slide_index}:empty_url models=${modelChain.join(",")}`,
      );
    }
    const dl = await downloadToFile(gen.url, dest);
    const qs = qualityFromBytes(dl.bytes);
    out.push({
      slideIndex: slot.slide_index,
      localPath: dest,
      publicUrl: dest,
      manifest: {
        asset_id: `gen-${slot.slide_index}`,
        filename: fname,
        slide_id: `slide_${slot.slide_index}`,
        role: "full_slide",
        source_type: "generated",
        source_url_or_provider: usedModel,
        license_or_terms: "generated",
        original_filename: fname,
        original_width: 0,
        original_height: 0,
        bytes: dl.bytes,
        format: "image/jpeg",
        sha256: dl.sha256,
        transformed: false,
        transform_log: `ai_generate;model=${usedModel};native_logo=${Boolean(logoPath)};user_ref=${Boolean(userPhotoPath)};continuity=${gen.continuity}`,
        transformations: [
          {
            op: "ai_generate",
            detail: `${usedModel};mode_b;${gen.continuity};refs=${refMeta.map((r) => r.role).join("+") || "none"}`,
          },
        ],
        quality_status: qs,
        visual_review: "pending",
        accepted: qs !== "BLOCKED",
        rejection_reason:
          qs === "BLOCKED" ? "generated_quality_blocked" : undefined,
      },
    });
  }

  return out;
}
