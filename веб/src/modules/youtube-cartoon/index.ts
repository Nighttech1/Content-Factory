/**
 * «YouTube» (youtube-cartoon) — мультяшные YouTube-видео.
 * Переиспользует конвейер cartoon-reels (mock) со своим манифестом.
 * UI-создание отключено (веб = результаты).
 */
import type { IContentModule } from "@/types/module";
import { contentModule as cartoonReels } from "@/modules/cartoon-reels";
import { manifest } from "./manifest";

export { manifest };

export const contentModule: IContentModule = {
  ...cartoonReels,
  manifest,
};

export default contentModule;
