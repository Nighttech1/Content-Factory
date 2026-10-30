/**
 * C-visual-style-deconstructor — live vision entry for Backend route.
 * Prompts/parsers: `@/lib/agents/deconstructStyle` (AI Bridge).
 * Soft-fail: never wipe library; mock = golden DesignPresetFile.
 * Never log image bytes or API keys.
 */

import {
  DECONSTRUCT_STYLE_SYSTEM_PROMPT,
  ensureDeconstructFullTokens,
  mockDeconstructStyleResponse,
  resolveDeconstructUserInstruction,
  toDeconstructStyleResponse,
} from "@/lib/agents/deconstructStyle";
import {
  createBentoGlassSeedPreset,
  createDarkNotesSeedPreset,
  createDefaultVernatunPreset,
  ensurePresetTypographyScale,
  type DeconstructStyleResponse,
} from "@/lib/settings/design-preset";
import { callAggregatorChat } from "@/lib/llm/aggregator-chat";
import { resolveAggregatorEnv } from "@/lib/llm/aggregator";

export type DeconstructStyleInput = {
  /** data: URL or remote https URL for vision (single-image path) */
  imageDataUrl?: string;
  /**
   * Wave layout-copy: ordered refs cover · midA · midB · cta (prefer length 4).
   * When length ≥ 4 → gridMode layoutMap required.
   */
  imageDataUrls?: string[];
  nameHint?: string;
  /** Force grid user instruction + layoutMap expectation. */
  gridMode?: boolean;
};

/**
 * Vision image(s) → typed DesignPresetFile + DESIGN.md + HTML kit (+ layoutMap on 4-up).
 */
export async function deconstructStyle(
  input: DeconstructStyleInput,
): Promise<DeconstructStyleResponse & { error?: string }> {
  const nameHint = input.nameHint?.trim() || "DESIGN.md";
  const parseOpts = { nameHint };

  const images = (
    Array.isArray(input.imageDataUrls) && input.imageDataUrls.length
      ? input.imageDataUrls
      : input.imageDataUrl
        ? [input.imageDataUrl]
        : []
  )
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter(Boolean);

  if (!images.length) {
    return {
      ...mockDeconstructStyleResponse(parseOpts),
      error: "image_required",
    };
  }

  const gridMode =
    Boolean(input.gridMode) || images.length >= 4;
  const userInstruction = resolveDeconstructUserInstruction({
    nameHint,
    gridMode,
    referenceCount: images.length,
  });

  if (!resolveAggregatorEnv()) {
    return {
      ...mockDeconstructStyleResponse(parseOpts),
      error: "aggregator_key_missing",
    };
  }

  const result = await callAggregatorChat({
    system: DECONSTRUCT_STYLE_SYSTEM_PROMPT,
    user: userInstruction,
    images,
    temperature: 0.3,
    maxTokens: 4096,
    model:
      process.env.DESIGN_DECONSTRUCT_MODEL?.trim() ||
      process.env.DESIGN_RAZBOR_MODEL?.trim() ||
      undefined,
  });

  if (!result.ok) {
    return {
      ...mockDeconstructStyleResponse(parseOpts),
      error: result.error,
    };
  }

  const live = toDeconstructStyleResponse(result.text, "live", {
    ...parseOpts,
    gridMode,
    referenceCount: images.length,
  });
  if (live.source === "mock") {
    return { ...live, error: "parse_failed" };
  }
  // Belt: persist path always has colors + fonts + typography.scale (Embla → FULL inject)
  const presetFile = ensurePresetTypographyScale(
    ensureDeconstructFullTokens(live.presetFile, {
      ...parseOpts,
      gridMode,
      referenceCount: images.length,
    }),
  );
  return { ...live, presetFile };
}

/** Re-export seeds for FE / seed jobs without circular imports. */
export {
  createDarkNotesSeedPreset,
  createBentoGlassSeedPreset,
  createDefaultVernatunPreset,
};
