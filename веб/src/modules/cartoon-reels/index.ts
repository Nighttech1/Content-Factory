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
  newDraftId,
  getStoredDraft,
  storeDraft,
  updateStoredElement,
} from "@/modules/_shared/draft-store";
import {
  MOCK_POSTER_URL,
  MOCK_MP4_URL,
  MOCK_VIDEO_9_16,
} from "@/modules/_shared/mock-assets";
import { manifest } from "./manifest";

export { manifest };

type SceneBeat = {
  beatIndex: number;
  captionRu: string;
  captionHy: string;
  durationFrames: number;
  lottieHint?: string;
};

type ScenePayload = {
  compositionId: string;
  fps: number;
  width: number;
  height: number;
  beats: SceneBeat[];
};

function buildScene(topic: string, beatCount = 4): ScenePayload {
  const beats: SceneBeat[] = [];
  for (let i = 0; i < beatCount; i++) {
    beats.push({
      beatIndex: i,
      captionRu:
        i === 0
          ? topic.slice(0, 80) || "Начало истории"
          : `Кадр ${i + 1}: продолжение «${topic.slice(0, 40)}»`,
      captionHy: i === 0 ? "Սկիզբ" : `Կադր ${i + 1}`,
      durationFrames: 45,
      lottieHint: i % 2 === 0 ? "character-wave" : "bg-pan",
    });
  }
  return {
    compositionId: "CartoonReel9x16",
    fps: 30,
    width: MOCK_VIDEO_9_16.width,
    height: MOCK_VIDEO_9_16.height,
    beats,
  };
}

function remotionEnabled(): boolean {
  return process.env.ENABLE_REMOTION_RENDER === "1";
}

export const contentModule: IContentModule = {
  manifest,
  async generateDraft(
    topic: string,
    options?: Record<string, unknown>,
  ): Promise<DraftOutput> {
    const brand = loadBrandContext();
    const beatCount =
      typeof options?.beatCount === "number"
        ? Math.min(8, Math.max(2, Math.floor(options.beatCount)))
        : 4;
    const scene = buildScene(topic.trim() || "untitled", beatCount);
    const draftId = newDraftId(manifest.id);
    const draft: DraftOutput = {
      draftId,
      moduleId: manifest.id,
      topic,
      elements: scene.beats.map((beat) => ({
        index: beat.beatIndex,
        kind: "scene_beat",
        payload: beat,
      })),
      meta: {
        mock: true,
        phase: "C-20",
        scene: {
          compositionId: scene.compositionId,
          fps: scene.fps,
          width: scene.width,
          height: scene.height,
        },
        feedbackLogs: [
          brandLockFeedback(brand),
          `cartoon_beats=${beatCount}`,
          "remotion=scene_json_only",
        ],
      },
    };
    storeDraft(draft);
    return draft;
  },

  async renderAsset(draft: DraftOutput): Promise<AssetRenderResult> {
    storeDraft(draft);
    if (remotionEnabled()) {
      // Real Remotion worker path reserved for Sprint 7 / queue — still mock URL if worker absent.
      return {
        draftId: draft.draftId,
        assets: [
          {
            url: MOCK_MP4_URL,
            mime: MOCK_VIDEO_9_16.mime,
            width: MOCK_VIDEO_9_16.width,
            height: MOCK_VIDEO_9_16.height,
          },
        ],
        mock: true,
        feedbackLogs: [
          "ENABLE_REMOTION_RENDER=1",
          "remotion_worker=not_attached",
          "fallback=mock_mp4",
        ],
      };
    }
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
        "cartoon_render=mock",
        "ENABLE_REMOTION_RENDER=0",
        "gpu=not_required",
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
    const prev = existing.payload as SceneBeat;
    const payload: SceneBeat = {
      ...prev,
      captionRu: `${prev.captionRu} · reroll`,
      captionHy: `${prev.captionHy} · նոր`,
      durationFrames: prev.durationFrames,
    };
    updateStoredElement(draftId, elementIndex, payload);
    return {
      draftId,
      elementIndex,
      payload,
    };
  },
};

export default module;
