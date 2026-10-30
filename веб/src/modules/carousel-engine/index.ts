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
  MOCK_CAROUSEL,
  mockCarouselSlideUrl,
} from "@/modules/_shared/mock-assets";
import { manifest } from "./manifest";

export { manifest };

const LAYOUT_ID = "carousel_editorial_v1";

type SlidePayload = {
  titleRu: string;
  titleHy: string;
  bodyRu: string;
  layoutId: string;
  slideType: "cover" | "point" | "cta";
};

function clampSlideCount(options?: Record<string, unknown>): number {
  const raw = options?.slideCount;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (Number.isFinite(n)) return Math.min(8, Math.max(3, Math.floor(n)));
  return 5;
}

function buildSlides(topic: string, count: number): SlidePayload[] {
  const slides: SlidePayload[] = [];
  for (let i = 0; i < count; i++) {
    const slideType: SlidePayload["slideType"] =
      i === 0 ? "cover" : i === count - 1 ? "cta" : "point";
    slides.push({
      titleRu:
        slideType === "cover"
          ? topic.slice(0, 72) || "Тема карусели"
          : slideType === "cta"
            ? "Сохрани и поделись"
            : `Пункт ${i}`,
      titleHy:
        slideType === "cover"
          ? "Թեմա"
          : slideType === "cta"
            ? "Պահպանիր"
            : `Կետ ${i}`,
      bodyRu:
        slideType === "cover"
          ? `Черновик карусели: ${topic}`
          : slideType === "cta"
            ? "Напиши в комментариях — что откликнулось."
            : `Ключевая мысль #${i} по теме «${topic}».`,
      layoutId: LAYOUT_ID,
      slideType,
    });
  }
  return slides;
}

export const contentModule: IContentModule = {
  manifest,
  async generateDraft(
    topic: string,
    options?: Record<string, unknown>,
  ): Promise<DraftOutput> {
    const brand = loadBrandContext();
    const count = clampSlideCount(options);
    const slides = buildSlides(topic.trim() || "untitled", count);
    const draftId = newDraftId(manifest.id);
    const draft: DraftOutput = {
      draftId,
      moduleId: manifest.id,
      topic,
      elements: slides.map((payload, index) => ({
        index,
        kind: "slide",
        payload,
      })),
      meta: {
        mock: true,
        phase: "C-20",
        layoutId: LAYOUT_ID,
        canvas: { width: MOCK_CAROUSEL.width, height: MOCK_CAROUSEL.height },
        brandPath: brand.path,
        feedbackLogs: [
          brandLockFeedback(brand),
          `carousel_slides=${count}`,
        ],
      },
    };
    storeDraft(draft);
    return draft;
  },

  async renderAsset(draft: DraftOutput): Promise<AssetRenderResult> {
    storeDraft(draft);
    const assets = draft.elements.map((el) => ({
      url: mockCarouselSlideUrl(el.index),
      mime: MOCK_CAROUSEL.mime,
      width: MOCK_CAROUSEL.width,
      height: MOCK_CAROUSEL.height,
    }));
    return {
      draftId: draft.draftId,
      assets,
      mock: true,
      feedbackLogs: [
        "carousel_render=mock",
        "puppeteer=skipped",
        `canvas=${MOCK_CAROUSEL.width}x${MOCK_CAROUSEL.height}`,
      ],
    };
  },

  async regenerateElement(
    draftId: string,
    elementIndex: number,
  ): Promise<ElementOutput> {
    const draft = getStoredDraft(draftId);
    if (!draft) {
      throw new Error(`DraftNotFound:${draftId}`);
    }
    const existing = draft.elements.find((e) => e.index === elementIndex);
    if (!existing) {
      throw new Error(`ElementNotFound:${elementIndex}`);
    }
    const prev = existing.payload as SlidePayload;
    const payload: SlidePayload = {
      ...prev,
      titleRu: `${prev.titleRu} · reroll`,
      bodyRu: `Перегенерированный слайд ${elementIndex} (${Date.now()}).`,
      layoutId: LAYOUT_ID,
    };
    updateStoredElement(draftId, elementIndex, payload);
    return {
      draftId,
      elementIndex,
      payload,
      asset: {
        url: mockCarouselSlideUrl(elementIndex),
        mime: MOCK_CAROUSEL.mime,
        width: MOCK_CAROUSEL.width,
        height: MOCK_CAROUSEL.height,
      },
    };
  },
};

export default module;
