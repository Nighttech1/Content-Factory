import { z } from "zod";
import type { ContentModuleManifest } from "@/types/module";

export const manifest: ContentModuleManifest = {
  id: "club-reels",
  title: "Рилс",
  description:
    "Короткие вертикальные рилсы 9:16: хук 0–2с, монтаж, субтитры, CTA.",
  version: "0.1.0-mock",
  outputFormat: "video_9_16",
  icon: "Video",
  defaultSettings: {
    worker: "workers/reel-lead",
    aspect: "9:16",
  },
  inputSchema: z.object({}),
};
