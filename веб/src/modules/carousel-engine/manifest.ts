import { z } from "zod";
import type { ContentModuleManifest } from "@/types/module";

export const manifest: ContentModuleManifest = {
  id: "carousel-engine",
  title: "Карусели Instagram",
  description:
    "Редакционная карусель 1080×1350 с типографикой и CTA-слайдом.",
  version: "0.2.0-mock",
  outputFormat: "carousel_4_5",
  icon: "Layers",
  defaultSettings: {
    worker: "workers/designer-carousel",
    width: 1080,
    height: 1350,
  },
  inputSchema: z.object({}),
};
