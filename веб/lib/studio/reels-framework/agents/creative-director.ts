import { getReel } from "../store";
import { getStyleProfile } from "../memory/style-profiles";
import { activeRulesFor } from "../memory/style-memory";
import { buildSimpleMontageFromSources } from "../pipeline/timeline-builder";
import { saveMontageProject } from "../manager";
import type { MontageProject } from "../montage-schema";
import type { AnalysisReport } from "./footage-analyzer";
import fs from "node:fs";
import path from "node:path";
import { ensureReelDirs } from "../paths";

/**
 * Creative decisions → validated MontageProject.
 * Separates must (script) from nice-to-have (profile tips).
 */
export function runCreativeDirector(opts: {
  reelId: string;
  analysis?: AnalysisReport;
}): {
  ok: true;
  project: MontageProject;
  must: string[];
  recommendations: string[];
} | { ok: false; error: string } {
  const reel = getReel(opts.reelId);
  if (!reel) return { ok: false, error: "reel_not_found" };
  if (!reel.sources.length) return { ok: false, error: "no_sources" };

  const profile = getStyleProfile(reel.styleProfileId);
  const rules = activeRulesFor(reel.styleProfileId);

  const must = [
    "preserve_hook_from_script",
    "include_cta_endcard",
    "vertical_1080x1920",
    "no_invented_footage",
  ];
  const recommendations = [
    `tempo:${profile.tempo}`,
    `avg_scene:${profile.avgSceneSec}`,
    `meme_freq:${profile.memeFrequency}`,
    ...rules.map((r) => `rule:${r.id}:${r.title}`),
  ];

  let sources = reel.sources;
  if (opts.analysis?.chosenTakes?.length) {
    const chosen = new Set(opts.analysis.chosenTakes);
    const filtered = reel.sources.filter((s) => chosen.has(s.assetId));
    if (filtered.length) sources = filtered;
  }

  const built = buildSimpleMontageFromSources({
    reelId: reel.id,
    styleProfile: profile.id,
    version: Math.max(1, reel.planVersion + 1),
    sources,
    titleText: reel.topic.slice(0, 80),
    endcardText:
      typeof (reel.script?.script as { cta?: { captionLine?: string } })?.cta
        ?.captionLine === "string"
        ? (reel.script!.script as { cta: { captionLine: string } }).cta.captionLine
        : "Напишите в комментарии",
  });
  if (!built.ok) return built;

  // Apply profile avg scene length soft trim on video scenes
  const project: MontageProject = {
    ...built.project,
    scenes: built.project.scenes.map((s) => {
      if (s.type !== "video") return s;
      const max = profile.avgSceneSec * 1.5;
      const dur = s.source_end - s.source_start;
      if (dur > max) {
        return { ...s, source_end: s.source_start + max };
      }
      return s;
    }),
  };

  const saved = saveMontageProject(reel.id, project);
  if (!saved.ok) return { ok: false, error: saved.error };

  const dirs = ensureReelDirs(reel.id);
  fs.writeFileSync(
    path.join(dirs.root, "creative-director.json"),
    JSON.stringify({ must, recommendations, profile: profile.id }, null, 2),
    "utf8",
  );

  return { ok: true, project, must, recommendations };
}
