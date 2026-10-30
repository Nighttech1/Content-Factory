import { z } from "zod";
import type { ContentModuleManifest } from "@/types/module";

export const manifest: ContentModuleManifest = {
  id: "cartoon-reels",
  title: "Мульт-Reels (2D сторителлинг)",
  description: "Иллюстрированный сторителлинг 9:16 с субтитрами.",
  version: "0.2.0-mock",
  outputFormat: "video_9_16",
  icon: "Clapperboard",
  defaultSettings: {
    worker: "workers/designer-cartoon",
    aspect: "9:16",
  },
  inputSchema: z.object({}),
};
