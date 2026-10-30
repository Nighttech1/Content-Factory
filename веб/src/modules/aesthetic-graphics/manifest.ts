import { z } from "zod";
import type { ContentModuleManifest } from "@/types/module";

export const manifest: ContentModuleManifest = {
  id: "aesthetic-graphics",
  title: "Полезные картинки & Инфографика",
  description:
    "Читы, таблицы и quote-тайлы для Telegram и LinkedIn.",
  version: "0.2.0-mock",
  outputFormat: "single_image",
  icon: "Image",
  defaultSettings: {
    worker: "workers/designer-graphics",
  },
  inputSchema: z.object({}),
};
