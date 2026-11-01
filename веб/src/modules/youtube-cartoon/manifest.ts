import { z } from "zod";
import type { ContentModuleManifest } from "@/types/module";

export const manifest: ContentModuleManifest = {
  id: "youtube-cartoon",
  title: "YouTube",
  description:
    "Мультяшные YouTube-видео: сценарий, иллюстрации, озвучка, субтитры.",
  version: "0.1.0-mock",
  outputFormat: "video_9_16",
  icon: "Youtube",
  defaultSettings: {
    worker: "workers/youtube-cartoon",
    aspect: "16:9",
  },
  inputSchema: z.object({}),
};
