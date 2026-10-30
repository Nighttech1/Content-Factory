import { z } from "zod";
import type { ContentModuleManifest } from "@/types/module";

export const manifest: ContentModuleManifest = {
  id: "site-articles",
  title: "Статьи на сайт",
  description:
    "Длинные редакционные материалы для сайта Vernatun: структура, SEO-заголовок и CTA.",
  version: "0.1.0-mock",
  outputFormat: "single_image",
  icon: "FileText",
  defaultSettings: {
    worker: "workers/publisher",
    channel: "website",
  },
  inputSchema: z.object({}),
};
