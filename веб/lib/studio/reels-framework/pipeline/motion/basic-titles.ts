import type { MontageProject } from "../../montage-schema";

/** MVP motion: ensure title/endcard scenes exist; no Remotion. */
export function ensureBasicMotionScenes(
  project: MontageProject,
  opts: { title?: string; endcard?: string },
): MontageProject {
  const scenes = [...project.scenes];
  if (opts.title && !scenes.some((s) => s.type === "title")) {
    scenes.unshift({
      scene_id: "scene_title",
      type: "title",
      duration: 2,
      transition: "cut",
      effects: [],
      parameters: { text: opts.title, fontSize: 52, position: "center" },
    });
  }
  if (opts.endcard && !scenes.some((s) => s.type === "endcard")) {
    scenes.push({
      scene_id: "scene_endcard",
      type: "endcard",
      duration: 2.5,
      transition: "cut",
      effects: [],
      parameters: { text: opts.endcard, cta: "CTA" },
    });
  }
  return { ...project, scenes, version: project.version + 1 };
}
