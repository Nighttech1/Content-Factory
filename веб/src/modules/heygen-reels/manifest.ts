import { z } from "zod";
import type { ContentModuleManifest } from "@/types/module";

export const manifest: ContentModuleManifest = {
  id: "heygen-reels",
  title: "HeyGen AI-Аватар Reels",
  description:
    "Говорящий аватар с синхроном губ и бренд-палитрой.",
  version: "0.2.0-mock",
  outputFormat: "video_9_16",
  icon: "Video",
  defaultSettings: {
    worker: "workers/designer-heygen",
    aspect: "9:16",
  },
  inputSchema: z.object({}),
};
