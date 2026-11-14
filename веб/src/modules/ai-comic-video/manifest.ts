import { z } from "zod";
import type { ContentModuleManifest } from "@/types/module";

export const manifest: ContentModuleManifest = {
  id: "ai-comic-video",
  title: "AI-видео · оживший комикс",
  description:
    "Вертикальная AI-история из иллюстраций: сценарий, shot list, motion-план и субтитры.",
  version: "0.1.0-spec",
  outputFormat: "video_9_16",
  icon: "Film",
  defaultSettings: {
    worker: "workers/ai-comic-video",
    aspect: "9:16",
    width: 1080,
    height: 1920,
    fps: 30,
    sceneCount: 12,
    renderMode: "keyframes-plus-motion",
  },
  inputSchema: z.object({
    topic: z.string().optional(),
    durationSec: z.number().min(8).max(60).optional(),
    sceneCount: z.number().int().min(8).max(16).optional(),
    characterReferences: z.array(z.string()).optional(),
    voiceover: z.boolean().optional(),
  }),
};
