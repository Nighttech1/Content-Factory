import { z } from "zod";
import type { ContentModuleManifest } from "@/types/module";

export const manifest: ContentModuleManifest = {
  id: "tg-articles",
  title: "Статьи в TG",
  description:
    "Посты и лонгриды для Telegram-канала: хук, абзацы и кнопка перехода.",
  version: "0.1.0-mock",
  outputFormat: "single_image",
  icon: "Send",
  defaultSettings: {
    worker: "workers/publisher",
    channel: "telegram",
  },
  inputSchema: z.object({}),
};
