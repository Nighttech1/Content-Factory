import type {
  AssetRenderResult,
  DraftOutput,
  ElementOutput,
  IContentModule,
} from "@/types/module";
import {
  brandLockFeedback,
  loadBrandContext,
} from "@/modules/_shared/brand-context";
import {
  getStoredDraft,
  newDraftId,
  storeDraft,
  updateStoredElement,
} from "@/modules/_shared/draft-store";
import {
  MOCK_MP4_URL,
  MOCK_POSTER_URL,
  MOCK_VIDEO_9_16,
} from "@/modules/_shared/mock-assets";
import { manifest } from "./manifest";

export { manifest };

type ScenePlan = {
  sceneIndex: number;
  durationSec: number;
  shot: "wide" | "medium" | "close-up" | "detail";
  action: string;
  motion: "push-in" | "pull-out" | "pan" | "parallax" | "micro-motion";
  subtitle: string;
  imagePrompt: string;
};

function buildScenePlan(topic: string, sceneCount: number): ScenePlan[] {
  const safeTopic = topic.trim() || "Тёплая история о встрече и разговоре";
  const shots: ScenePlan["shot"][] = [
    "wide", "medium", "close-up", "detail", "medium", "wide",
    "close-up", "medium", "detail", "wide", "close-up", "medium",
  ];
  const motions: ScenePlan["motion"][] = [
    "push-in", "pan", "micro-motion", "detail", "parallax", "pull-out",
    "push-in", "pan", "micro-motion", "parallax", "push-in", "pull-out",
  ];

  return Array.from({ length: sceneCount }, (_, index) => ({
    sceneIndex: index,
    durationSec: Number((20 / sceneCount).toFixed(2)),
    shot: shots[index % shots.length],
    action:
      index === 0
        ? `Хук: визуально показать конфликт или обещание истории «${safeTopic}»`
        : index === sceneCount - 1
          ? "Финальная эмоциональная реакция и мягкий CTA"
          : `Развить историю «${safeTopic}»: действие ${index + 1}`,
    motion: motions[index % motions.length],
    subtitle: index === 0 ? safeTopic.slice(0, 72) : `Сцена ${index + 1}`,
    imagePrompt:
      "vertical 2D editorial comic illustration, warm palette, expressive faces, " +
      `consistent characters, ${safeTopic}, scene ${index + 1}, no text, no logo, no watermark`,
  }));
}

export const contentModule: IContentModule = {
  manifest,

  async generateDraft(topic, options): Promise<DraftOutput> {
    const sceneCount =
      typeof options?.sceneCount === "number"
        ? Math.min(16, Math.max(8, Math.floor(options.sceneCount)))
        : 12;
    const scenePlan = buildScenePlan(topic, sceneCount);
    const draftId = newDraftId(manifest.id);
    const brand = loadBrandContext();

    const draft: DraftOutput = {
      draftId,
      moduleId: manifest.id,
      topic,
      elements: scenePlan.map((payload) => ({
        index: payload.sceneIndex,
        kind: "ai_comic_scene",
        payload,
      })),
      meta: {
        mock: true,
        phase: "AI-VIDEO-MODULE-01",
        output: { width: 1080, height: 1920, fps: 30, aspect: "9:16" },
        renderMode: "keyframes-plus-motion",
        feedbackLogs: [
          brandLockFeedback(brand),
          `scene_count=${sceneCount}`,
          "text_in_images=false",
          "social_ui=false",
          "image_generation_worker=not_attached",
        ],
      },
    };

    storeDraft(draft);
    return draft;
  },

  async renderAsset(draft): Promise<AssetRenderResult> {
    storeDraft(draft);
    return {
      draftId: draft.draftId,
      assets: [
        {
          url: MOCK_MP4_URL,
          mime: MOCK_VIDEO_9_16.mime,
          width: MOCK_VIDEO_9_16.width,
          height: MOCK_VIDEO_9_16.height,
        },
        {
          url: MOCK_POSTER_URL,
          mime: "image/png",
          width: MOCK_VIDEO_9_16.width,
          height: MOCK_VIDEO_9_16.height,
        },
      ],
      mock: true,
      feedbackLogs: [
        "render=mock",
        "remotion=composition-contract-ready",
        "ffmpeg=final-encode-ready",
        "image_generation_worker=not_attached",
      ],
    };
  },

  async regenerateElement(
    draftId: string,
    elementIndex: number,
  ): Promise<ElementOutput> {
    const draft = getStoredDraft(draftId);
    if (!draft) throw new Error(`DraftNotFound:${draftId}`);
    const existing = draft.elements.find((e) => e.index === elementIndex);
    if (!existing) throw new Error(`ElementNotFound:${elementIndex}`);

    const previous = existing.payload as ScenePlan;
    const payload: ScenePlan = {
      ...previous,
      imagePrompt: `${previous.imagePrompt}, alternate composition`,
    };
    updateStoredElement(draftId, elementIndex, payload);
    return { draftId, elementIndex, payload };
  },
};

export default contentModule;
