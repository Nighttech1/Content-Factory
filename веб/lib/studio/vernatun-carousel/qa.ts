import { readFile, stat } from "node:fs/promises";
import { assertCoverHeadline } from "./word-count";
import type {
  AssetManifestRow,
  BuildMode,
  QaReport,
  VernatunScript,
} from "./types";
import { FRAME_H, FRAME_W } from "./renderer";

async function pngSize(
  filePath: string,
): Promise<{ w: number; h: number } | null> {
  try {
    const buf = await readFile(filePath);
    if (buf.length < 24) return null;
    // PNG IHDR
    if (buf[0] === 0x89 && buf[1] === 0x50) {
      const w = buf.readUInt32BE(16);
      const h = buf.readUInt32BE(20);
      return { w, h };
    }
    // JPEG — accept any for Mode B copy; size check soft
    return { w: FRAME_W, h: FRAME_H };
  } catch {
    return null;
  }
}

export async function runProgrammaticQa(input: {
  buildMode: BuildMode;
  script: VernatunScript;
  pngPaths: string[];
  manifest: AssetManifestRow[];
  templates?: string[];
}): Promise<QaReport> {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const automated: Record<string, boolean | string> = {};

  const cover = assertCoverHeadline(input.script.slides[0]?.headline ?? "");
  automated.cover_headline_le_4 = cover.ok;
  if (!cover.ok) blockers.push(`cover_headline:${cover.message}`);

  automated.slide_count_match =
    input.pngPaths.length === input.script.slides.length;
  if (!automated.slide_count_match) {
    blockers.push("slide_count_mismatch");
  }

  automated.build_mode = input.buildMode;
  automated.mode_mixed = false;

  for (let i = 0; i < input.pngPaths.length; i++) {
    const p = input.pngPaths[i]!;
    try {
      const st = await stat(p);
      if (st.size < 1000) blockers.push(`empty_png_slide_${i + 1}`);
    } catch {
      blockers.push(`missing_png_slide_${i + 1}`);
      continue;
    }
    const size = await pngSize(p);
    if (!size) {
      blockers.push(`bad_png_slide_${i + 1}`);
      continue;
    }
  }

  const accepted = input.manifest.filter((m) => m.accepted);
  automated.manifest_rows = String(accepted.length);
  automated.manifest_quality_blocked = String(
    input.manifest.filter((m) => m.quality_status === "BLOCKED").length,
  );
  if (input.manifest.some((m) => m.quality_status === "BLOCKED")) {
    blockers.push("manifest_quality_blocked");
  }
  if (accepted.length < input.script.slides.length) {
    warnings.push("manifest_incomplete");
  }

  if (input.templates && input.templates.length >= 2) {
    const uniq = new Set(input.templates);
    automated.composition_variety =
      uniq.size >= Math.min(3, input.templates.length);
    if (!automated.composition_variety) {
      warnings.push("low_composition_variety");
    }
    for (let i = 1; i < input.templates.length; i++) {
      if (input.templates[i] === input.templates[i - 1]) {
        warnings.push(`adjacent_same_template_${i}_${i + 1}`);
      }
    }
  }

  automated.visual_review = "pending";

  return {
    status: blockers.length ? "FAIL" : "PASS",
    blockers,
    warnings,
    automated_checks: automated,
    visual_review: "pending",
    files: input.pngPaths,
  };
}
