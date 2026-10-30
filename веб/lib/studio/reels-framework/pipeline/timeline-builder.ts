import type { MontageProject } from "../montage-schema";
import { MONTAGE_SCHEMA_VERSION, validateMontageProject } from "../montage-schema";
import type { SourceAssetMeta } from "../types";

/** Build a simple ordered plan from uploaded sources (Stage 1 — no full AI). */
export function buildSimpleMontageFromSources(opts: {
  reelId: string;
  styleProfile: string;
  version: number;
  sources: SourceAssetMeta[];
  titleText?: string;
  endcardText?: string;
}): { ok: true; project: MontageProject } | { ok: false; error: string } {
  if (opts.sources.length === 0) {
    return { ok: false, error: "no_sources" };
  }

  const scenes: MontageProject["scenes"] = [];
  let t = 0;
  const subtitles: MontageProject["subtitles"] = [];

  if (opts.titleText) {
    scenes.push({
      scene_id: "scene_title",
      type: "title",
      duration: 2,
      transition: "cut",
      effects: [],
      parameters: { text: opts.titleText, fontSize: 52, position: "center" },
    });
    t += 2;
  }

  opts.sources.forEach((src, i) => {
    const dur = Math.min(src.durationSec ?? 5, 12);
    const start = 0;
    const end = dur;
    const sceneId = `scene_video_${String(i + 1).padStart(3, "0")}`;
    scenes.push({
      scene_id: sceneId,
      type: "video",
      asset_id: src.assetId,
      source_start: start,
      source_end: end,
      caption: src.fileName,
      transition: "cut",
      effects: [],
    });
    subtitles.push({
      id: `sub_${sceneId}`,
      start: t,
      end: t + Math.min(dur, 4),
      text: opts.titleText || src.fileName.replace(/\.[^.]+$/, ""),
    });
    t += dur;
  });

  scenes.push({
    scene_id: "scene_endcard",
    type: "endcard",
    duration: 2.5,
    transition: "cut",
    effects: [],
    parameters: {
      text: opts.endcardText || "Спасибо за просмотр",
      cta: "Напишите в комментарии",
    },
  });

  const raw = {
    schema_version: MONTAGE_SCHEMA_VERSION,
    reel_id: opts.reelId,
    style_profile: opts.styleProfile,
    version: opts.version,
    format: {
      width: 1080 as const,
      height: 1920 as const,
      fps: 30,
      aspect_ratio: "9:16" as const,
    },
    scenes,
    audio: { normalize: true },
    subtitles,
  };

  return validateMontageProject(raw);
}
