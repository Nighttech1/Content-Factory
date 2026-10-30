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
  MOCK_SINGLE,
  mockAestheticSvg,
} from "@/modules/_shared/mock-assets";
import { manifest } from "./manifest";

export { manifest };

type CardPayload = {
  cardType: "quote" | "cheat" | "table";
  headline: string;
  body: string;
  accent: string;
};

function buildCard(topic: string, cardType?: string): CardPayload {
  const type: CardPayload["cardType"] =
    cardType === "cheat" || cardType === "table" || cardType === "quote"
      ? cardType
      : "quote";
  return {
    cardType: type,
    headline:
      type === "quote"
        ? "Цитата дня"
        : type === "cheat"
          ? "Шпаргалка"
          : "Таблица",
    body: topic.slice(0, 200) || "Полезная карточка",
    accent: "#c9a227",
  };
}

export const contentModule: IContentModule = {
  manifest,
  async generateDraft(
    topic: string,
    options?: Record<string, unknown>,
  ): Promise<DraftOutput> {
    const brand = loadBrandContext();
    const cardType =
      typeof options?.cardType === "string" ? options.cardType : undefined;
    const payload = buildCard(topic.trim() || "untitled", cardType);
    const draftId = newDraftId(manifest.id);
    const draft: DraftOutput = {
      draftId,
      moduleId: manifest.id,
      topic,
      elements: [{ index: 0, kind: "card", payload }],
      meta: {
        mock: true,
        phase: "C-20",
        outputFormat: "single_image",
        feedbackLogs: [brandLockFeedback(brand), "aesthetic=mock_svg"],
      },
    };
    storeDraft(draft);
    return draft;
  },

  async renderAsset(draft: DraftOutput): Promise<AssetRenderResult> {
    storeDraft(draft);
    const first = draft.elements[0]?.payload as CardPayload | undefined;
    const headline = first?.headline ?? "Card";
    const url = mockAestheticSvg(draft.topic, headline);
    return {
      draftId: draft.draftId,
      assets: [
        {
          url,
          mime: MOCK_SINGLE.mime,
          width: MOCK_SINGLE.width,
          height: MOCK_SINGLE.height,
        },
      ],
      mock: true,
      feedbackLogs: ["aesthetic_render=svg_data_url", "format=single_image"],
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
    const prev = existing.payload as CardPayload;
    const types: CardPayload["cardType"][] = ["quote", "cheat", "table"];
    const nextType =
      types[(types.indexOf(prev.cardType) + 1) % types.length] ?? "quote";
    const payload: CardPayload = {
      ...prev,
      cardType: nextType,
      headline: `${prev.headline} · ${nextType}`,
      body: `Reroll #${elementIndex}: ${draft.topic} (${Date.now()})`,
    };
    updateStoredElement(draftId, elementIndex, payload);
    return {
      draftId,
      elementIndex,
      payload,
      asset: {
        url: mockAestheticSvg(draft.topic, payload.headline),
        mime: MOCK_SINGLE.mime,
        width: MOCK_SINGLE.width,
        height: MOCK_SINGLE.height,
      },
    };
  },
};

export default module;
