/**
 * MontageProject JSON — Zod gate. LLM must never supply executable code.
 */

import { z } from "zod";

export const MONTAGE_SCHEMA_VERSION = "1.0";

const effectSchema = z.object({
  type: z.string().min(1),
  params: z.record(z.string(), z.unknown()).optional(),
});

const baseScene = z.object({
  scene_id: z.string().min(1),
  transition: z.enum(["cut", "fade", "xfade"]).default("cut"),
  effects: z.array(effectSchema).default([]),
});

export const videoSceneSchema = baseScene.extend({
  type: z.literal("video"),
  asset_id: z.string().min(1),
  source_start: z.number().finite().nonnegative(),
  source_end: z.number().finite().positive(),
  caption: z.string().optional(),
});

export const insertSceneSchema = baseScene.extend({
  type: z.literal("insert"),
  asset_id: z.string().min(1),
  duration: z.number().finite().positive(),
  audio_enabled: z.boolean().default(false),
  source_url: z.string().optional(),
  reason: z.string().optional(),
});

export const titleSceneSchema = baseScene.extend({
  type: z.literal("title"),
  duration: z.number().finite().positive(),
  parameters: z.object({
    text: z.string().min(1),
    fontSize: z.number().finite().positive().optional(),
    color: z.string().optional(),
    position: z.enum(["top", "center", "bottom"]).optional(),
  }),
});

export const endcardSceneSchema = baseScene.extend({
  type: z.literal("endcard"),
  duration: z.number().finite().positive(),
  parameters: z.object({
    text: z.string().min(1),
    cta: z.string().optional(),
  }),
});

export const motionGraphicSceneSchema = baseScene.extend({
  type: z.literal("motion_graphic"),
  template_id: z.string().min(1),
  duration: z.number().finite().positive(),
  parameters: z.record(z.string(), z.unknown()).default({}),
});

export const audioBedSceneSchema = baseScene.extend({
  type: z.literal("audio_bed"),
  asset_id: z.string().min(1),
  volume: z.number().finite().min(0).max(1).default(0.15),
});

export const sceneSchema = z.discriminatedUnion("type", [
  videoSceneSchema,
  insertSceneSchema,
  titleSceneSchema,
  endcardSceneSchema,
  motionGraphicSceneSchema,
  audioBedSceneSchema,
]);

export const subtitleCueSchema = z.object({
  id: z.string().min(1),
  start: z.number().finite().nonnegative(),
  end: z.number().finite().positive(),
  text: z.string(),
});

export const montageProjectSchema = z.object({
  schema_version: z.literal(MONTAGE_SCHEMA_VERSION),
  reel_id: z.string().min(1),
  style_profile: z.string().min(1),
  version: z.number().int().positive(),
  format: z.object({
    width: z.literal(1080),
    height: z.literal(1920),
    fps: z.number().int().positive().default(30),
    aspect_ratio: z.literal("9:16").default("9:16"),
  }),
  scenes: z.array(sceneSchema).min(1),
  audio: z
    .object({
      normalize: z.boolean().default(true),
      music_volume: z.number().finite().min(0).max(1).optional(),
    })
    .default({ normalize: true }),
  subtitles: z.array(subtitleCueSchema).default([]),
});

export type MontageProject = z.infer<typeof montageProjectSchema>;
export type MontageScene = z.infer<typeof sceneSchema>;

export function validateMontageProject(input: unknown): {
  ok: true;
  project: MontageProject;
} | {
  ok: false;
  error: string;
} {
  if (input && typeof input === "object" && "code" in (input as object)) {
    return { ok: false, error: "executable_code_forbidden" };
  }
  const parsed = montageProjectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join("; "),
    };
  }
  const ids = new Set<string>();
  for (const s of parsed.data.scenes) {
    if (ids.has(s.scene_id)) {
      return { ok: false, error: `duplicate_scene_id:${s.scene_id}` };
    }
    ids.add(s.scene_id);
  }
  return { ok: true, project: parsed.data };
}
