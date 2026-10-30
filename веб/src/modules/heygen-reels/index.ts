import type {
  AssetRenderResult,
  DraftOutput,
  ElementOutput,
  IContentModule,
} from "@/types/module";
import { createAvatarVideo } from "@/lib/ai/heygen-gateway";
import {
  HEYGEN_SCRIPT_PROMPT_VERSION,
  buildHeyGenScriptMockLines,
  type HeyGenScriptLineDraft,
} from "@/lib/ai/prompts/heygen-script";
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
import { MOCK_VIDEO_9_16 } from "@/modules/_shared/mock-assets";
import { manifest } from "./manifest";

export { manifest };

type ScriptLinePayload = HeyGenScriptLineDraft;

export const contentModule: IContentModule = {
  manifest,
  async generateDraft(
    topic: string,
    options?: Record<string, unknown>,
  ): Promise<DraftOutput> {
    const brand = loadBrandContext();
    const persona =
      typeof options?.persona === "string" && options.persona.trim()
        ? options.persona.trim()
        : "club-avatar";
    const lineCount =
      typeof options?.lineCount === "number"
        ? Math.min(8, Math.max(2, Math.floor(options.lineCount)))
        : 4;
    const lines = buildHeyGenScriptMockLines({
      topic: topic.trim() || "untitled",
      persona,
      lineCount,
    });
    const draftId = newDraftId(manifest.id);
    const draft: DraftOutput = {
      draftId,
      moduleId: manifest.id,
      topic,
      elements: lines.map((payload) => ({
        index: payload.lineIndex,
        kind: "script_line",
        payload,
      })),
      meta: {
        mock: true,
        phase: "C-20",
        persona,
        promptVersion: HEYGEN_SCRIPT_PROMPT_VERSION,
        avatarId:
          typeof options?.avatarId === "string" ? options.avatarId : undefined,
        voiceId:
          typeof options?.voiceId === "string" ? options.voiceId : undefined,
        feedbackLogs: [
          brandLockFeedback(brand),
          `heygen_draft_lines=${lineCount}`,
          `prompt=${HEYGEN_SCRIPT_PROMPT_VERSION}`,
          "gateway=deferred_to_render",
        ],
      },
    };
    storeDraft(draft);
    return draft;
  },

  async renderAsset(draft: DraftOutput): Promise<AssetRenderResult> {
    storeDraft(draft);
    const lines = draft.elements
      .map((e) => (e.payload as ScriptLinePayload)?.textRu ?? "")
      .filter(Boolean);
    const script = lines.join(" ");
    const avatarId =
      typeof draft.meta?.avatarId === "string"
        ? draft.meta.avatarId
        : undefined;
    const voiceId =
      typeof draft.meta?.voiceId === "string" ? draft.meta.voiceId : undefined;

    const result = await createAvatarVideo({
      script,
      avatarId,
      voiceId,
      title: `CF · ${draft.topic}`.slice(0, 100),
    });
    return {
      draftId: draft.draftId,
      assets: [
        {
          url: result.url,
          mime: result.mime ?? MOCK_VIDEO_9_16.mime,
          width: result.width ?? MOCK_VIDEO_9_16.width,
          height: result.height ?? MOCK_VIDEO_9_16.height,
        },
      ],
      mock: result.mock,
      feedbackLogs: [
        ...(result.feedbackLogs ?? ["heygen=mock"]),
        result.providerJobId
          ? `providerJobId=${result.providerJobId}`
          : "providerJobId=none",
        `prompt=${HEYGEN_SCRIPT_PROMPT_VERSION}`,
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
    const prev = existing.payload as ScriptLinePayload;
    const payload: ScriptLinePayload = {
      ...prev,
      textRu: `${prev.textRu} · reroll`,
      textHy: `${prev.textHy} · նոր`,
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
