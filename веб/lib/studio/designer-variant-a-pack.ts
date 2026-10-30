/**
 * Variant A — Designer translate step: emit image_prompt + html_layout pack,
 * merge onto Scriptwriter handoff before bg gen + layered composite.
 */

import { readFile } from "node:fs/promises";

import { callAggregatorChat } from "@/lib/llm/aggregator-chat";
import { resolveAggregatorEnv } from "@/lib/llm/aggregator";
import {
  CarouselJsonParseError,
  parseAndAssertDesignerPack,
  parseDesignerImagePromptsFromText,
  type CarouselHandoffJson,
  type DesignerImagePromptsJson,
  type HtmlLayout,
} from "@/lib/studio/carousel-json-contract";
import {
  buildVisionRefBackgroundImagePrompt,
  resolveCreateCarouselOverlay,
  type CorrectPipelinePlaceholders,
  type DrawReferenceImageSignal,
  type StyleCopyMode,
} from "@/lib/studio/create-carousel-prompts";
import {
  softShuffleIdenticalAnchors,
  synthesizeFallbackHtmlLayout,
  validateLayoutVariety,
} from "@/lib/studio/carousel-layered-composite";
import { normalizeCarouselSlideRole } from "@/types/design";
import { DEFAULT_DESIGNER_TEXT_MODEL } from "@/types/mesh-agent";
import { mapSlideToRefSlot } from "@/lib/studio/style-copy-slots";

export type DesignerPackSource =
  | "scriptwriter"
  | "designer_llm"
  | "fallback_synth"
  /** vision_ref: deterministic RE-orange plate grammar (not stock variety invent). */
  | "vision_ref_hardcopy";

/** Full Designer system+user for smoke timeline (vision_ref ban proof). */
export type DesignerPromptDump = {
  system: string;
  user: string;
  styleCopyMode?: StyleCopyMode | null;
  referenceImageAttached: boolean;
  referenceImageCount: number;
  FULL_inject_skipped: boolean;
  /** Why LLM path was skipped / failed (archaeology). */
  failReason?: string;
  packSource?: DesignerPackSource;
};

export type EnsureDesignerVariantAPackResult =
  | {
      ok: true;
      handoff: CarouselHandoffJson;
      pack: DesignerImagePromptsJson;
      source: DesignerPackSource;
      model?: string;
      promptDump?: DesignerPromptDump;
    }
  | {
      ok: false;
      error: string;
      code: "aggregator_key_missing" | "designer_pack_fail" | "schema";
      promptDump?: DesignerPromptDump;
    };

async function pathsToDataUrls(paths: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const p of paths) {
    try {
      const bytes = await readFile(p);
      if (bytes.length < 32) continue;
      const lower = p.toLowerCase();
      const mime =
        lower.endsWith(".jpg") || lower.endsWith(".jpeg")
          ? "image/jpeg"
          : "image/png";
      out.push(`data:${mime};base64,${bytes.toString("base64")}`);
    } catch {
      /* skip missing */
    }
  }
  return out;
}

/**
 * vision_ref HARD: never inject FULL design-token / typography.scale / stock font
 * families via {{DESIGN_PALETTE_JSON}}. Keep colors (+ id/name) only.
 */
export function sanitizePlaceholdersForVisionRef(
  placeholders?: CorrectPipelinePlaceholders | null,
): CorrectPipelinePlaceholders | undefined {
  if (!placeholders) return undefined;
  let designPaletteJson = "{}";
  try {
    const raw = JSON.parse(placeholders.designPaletteJson || "{}") as Record<
      string,
      unknown
    >;
    designPaletteJson = JSON.stringify({
      id: raw.id ?? undefined,
      name: raw.name ?? undefined,
      colors: raw.colors ?? undefined,
      note: "vision_ref: typography/roles/scale omitted — style SoT = etalon image",
    });
  } catch {
    designPaletteJson = "{}";
  }
  return {
    ...placeholders,
    designPaletteJson,
  };
}

function slidesHaveHtmlLayout(handoff: CarouselHandoffJson): boolean {
  return handoff.slides.every(
    (s) => s.html_layout != null && typeof s.html_layout === "object",
  );
}

function packFromHandoff(handoff: CarouselHandoffJson): DesignerImagePromptsJson {
  return {
    slides: handoff.slides.map((s, i) => ({
      slide_number: s.slide_number,
      image_prompt:
        s.image_prompt?.trim() ||
        `Scene only from visual_prompt: ${(s.visual_prompt ?? "").slice(0, 400)}. NO TEXT NO LOGO.`,
        html_layout: (s.html_layout ??
        synthesizeFallbackHtmlLayout(
          normalizeCarouselSlideRole(
            s.layout_variant,
            i,
            handoff.slides.length,
          ),
          i,
        )) as HtmlLayout,
    })),
  };
}

/**
 * Apply soft-shuffle when all anchors identical (layout_variety).
 * Prefer keep Designer invent; only rotate when variety FAIL.
 */
function applyVarietySoftShuffle(
  pack: DesignerImagePromptsJson,
): DesignerImagePromptsJson {
  const layouts = pack.slides.map((s) => s.html_layout);
  const variety = validateLayoutVariety(layouts);
  if (variety.ok) return pack;
  const { layouts: shuffled, shuffled: did } = softShuffleIdenticalAnchors(
    layouts,
  );
  if (!did) return pack;
  return {
    ...pack,
    slides: pack.slides.map((s, i) => ({
      ...s,
      html_layout: shuffled[i] ?? s.html_layout,
    })),
  };
}

function mergePackOntoHandoff(
  handoff: CarouselHandoffJson,
  pack: DesignerImagePromptsJson,
  opts?: { skipVarietyShuffle?: boolean },
): CarouselHandoffJson {
  const varied = opts?.skipVarietyShuffle
    ? pack
    : applyVarietySoftShuffle(pack);
  const byNum = new Map(varied.slides.map((s) => [s.slide_number, s] as const));
  return {
    ...handoff,
    renderMode: handoff.renderMode ?? "layered_html",
    slides: handoff.slides.map((s) => {
      const p = byNum.get(s.slide_number);
      if (!p) return s;
      return {
        ...s,
        image_prompt: p.image_prompt,
        html_layout: p.html_layout,
      };
    }),
  };
}

/**
 * Vision_ref fallback layout grammar.
 * Default = RE-orange plate rhythm; when characterPaint=none (HIGVEN-3) → industrial
 * dark/orange left-type bands (no conductor chrome).
 */
export function synthesizeVisionRefHardCopyLayout(
  role: ReturnType<typeof normalizeCarouselSlideRole>,
  slideIndex0: number,
  slideTotal: number,
  characterPaint?: import("@/lib/studio/create-carousel-prompts").CharacterPaintPath | null,
): HtmlLayout {
  const paint = characterPaint ?? "in_image";
  const isCta = role === "cta_slide" || slideIndex0 >= slideTotal - 1;
  const isCover = role === "cover" || slideIndex0 === 0;
  // midB slot on etalon often centers type; others left/top
  const slot = mapSlideToRefSlot(slideIndex0 + 1, slideTotal);
  const centerMid = slot === "midB" && !isCta && !isCover;
  const higven = paint === "none";
  const template = isCta
    ? "cta_bottom"
    : isCover
      ? "body_left"
      : centerMid && !higven
        ? "body_split"
        : "body_left";
  const wordAccent = (copy: string | undefined) => {
    const word = (copy ?? "").trim().split(/\s+/)[0];
    if (word && word.length >= 3 && (copy ?? "").includes(word)) {
      return [{ phrase: word, style: "accent" as const }];
    }
    return [];
  };
  // Object zone roughly lower-middle / right — leave left for type
  // HIGVEN: industrial photo often right / lower; type left band
  const photoZone = higven
    ? isCover
      ? { x: 0.42, y: 0.12, w: 0.52, h: 0.72 }
      : { x: 0.08, y: 0.28, w: 0.84, h: 0.58 }
    : centerMid
      ? { x: 0.18, y: 0.28, w: 0.64, h: 0.5 }
      : { x: 0.28, y: 0.32, w: 0.62, h: 0.55 };
  // HIGVEN locks (attempt-3): cover+cta TOP-LEFT · body BOTTOM-LEFT
  const logoPlacement = higven
    ? isCover || isCta
      ? "top-left"
      : "bottom-left"
    : isCover || isCta
      ? "top-left"
      : "bottom-left";
  return {
    template,
    text_block: {
      anchor: centerMid && !higven ? "center" : "left",
      align: centerMid && !higven ? "center" : "left",
      safe: true,
      vertical: centerMid && !higven ? "middle" : "top",
    },
    primary: { highlights: wordAccent(undefined) },
    secondary: { highlights: [] },
    logo: {
      placement: logoPlacement,
      // HIGVEN: white wordmark on dark industrial
      ...(higven ? { textColor: "#FFFFFF" } : {}),
    },
    brandChrome: logoPlacement,
    character: { placement: "none" },
    // Critic: cta.placement only on cta_slide (cover chrome is HTML brand, not CTA catalog)
    cta: { placement: isCta ? "bottom" : "none" },
    // HIGVEN: soft scrim under type for contrast on charcoal photos
    scrim: higven ? "soft" : isCover ? "none" : "soft",
    characterPaint: paint,
    layoutMapSource: "vision_ref",
    bgFit: higven ? (isCover ? "contain" : "cover") : "contain",
    photoZone,
  } as HtmlLayout;
}

function synthFallbackPack(handoff: CarouselHandoffJson): DesignerImagePromptsJson {
  return {
    slides: handoff.slides.map((s, i) => {
      const role = normalizeCarouselSlideRole(
        s.layout_variant,
        i,
        handoff.slides.length,
      );
      const layout = synthesizeFallbackHtmlLayout(role, i);
      const word = (s.primary_copy ?? "").trim().split(/\s+/)[0];
      if (word && word.length >= 3 && s.primary_copy?.includes(word)) {
        layout.primary = {
          highlights: [{ phrase: word, style: "accent" }],
        };
      }
      if (role === "cta_slide") {
        layout.cta = { placement: "bottom" };
        layout.template = "cta_bottom";
      }
      return {
        slide_number: s.slide_number,
        image_prompt:
          s.image_prompt?.trim() ||
          `Editorial scene only: ${(s.visual_prompt ?? "").slice(0, 500)}. NO TEXT. NO LOGO. NO WATERMARK.`,
        html_layout: layout,
      };
    }),
  };
}

/** vision_ref: hard-copy RE orange plates — never invent stock cover_center kitchen. */
export function synthVisionRefHardCopyPack(
  handoff: CarouselHandoffJson,
  characterPaint?: import("@/lib/studio/create-carousel-prompts").CharacterPaintPath | null,
): DesignerImagePromptsJson {
  const total = handoff.slides.length;
  const paint = characterPaint ?? "in_image";
  return {
    slides: handoff.slides.map((s, i) => {
      const role = normalizeCarouselSlideRole(
        s.layout_variant,
        i,
        total,
      );
      const layout = synthesizeVisionRefHardCopyLayout(role, i, total, paint);
      const word = (s.primary_copy ?? "").trim().split(/\s+/)[0];
      if (word && word.length >= 3 && s.primary_copy?.includes(word)) {
        layout.primary = {
          highlights: [{ phrase: word, style: "accent" }],
        };
      }
      const forceConductor =
        paint === "in_image" && (i === 0 || i >= total - 1);
      return {
        slide_number: s.slide_number,
        image_prompt: buildVisionRefBackgroundImagePrompt({
          visualPrompt: s.visual_prompt ?? "",
          primaryCopy: s.primary_copy,
          slideIndex0: i,
          slideTotal: total,
          characterPaint: paint,
          forceConductor,
        }),
        html_layout: layout,
      };
    }),
  };
}

/**
 * Soft-repair: drop orphan highlight phrases so a near-valid LLM pack can pass critic.
 */
function softRepairDesignerPack(
  pack: DesignerImagePromptsJson,
  handoff: CarouselHandoffJson,
): DesignerImagePromptsJson {
  const byNum = new Map(
    handoff.slides.map((s) => [s.slide_number, s] as const),
  );
  return {
    slides: pack.slides.map((slide) => {
      const sw = byNum.get(slide.slide_number);
      const primary = sw?.primary_copy ?? "";
      const secondary = sw?.secondary_copy ?? "";
      const layout = { ...slide.html_layout };
      const fix = (
        block: { highlights?: Array<{ phrase: string; style: string }> } | undefined,
        copy: string,
      ) => {
        if (!block?.highlights?.length) return block;
        const kept = block.highlights.filter((h) =>
          copy.includes(h.phrase),
        );
        return { ...block, highlights: kept };
      };
      layout.primary = fix(layout.primary, primary) as HtmlLayout["primary"];
      layout.secondary = fix(
        layout.secondary,
        secondary,
      ) as HtmlLayout["secondary"];
      // vision_ref defaults when LLM omitted
      if (!layout.layoutMapSource) {
        layout.layoutMapSource = "vision_ref";
      }
      if (!layout.bgFit) {
        layout.bgFit = "contain";
      }
      if (layout.characterPaint == null) {
        // Caller softRepair runs before paint is known — default in_image;
        // ensureDesignerVariantAPack re-stamps via merge when paint=none.
        layout.characterPaint = "in_image";
      }
      return { ...slide, html_layout: layout };
    }),
  };
}

/** Stamp characterPaint onto every html_layout in a pack. */
function stampCharacterPaintOnPack(
  pack: DesignerImagePromptsJson,
  paint: import("@/lib/studio/create-carousel-prompts").CharacterPaintPath,
): DesignerImagePromptsJson {
  return {
    slides: pack.slides.map((s) => ({
      ...s,
      html_layout: {
        ...s.html_layout,
        characterPaint: paint,
        character:
          paint === "none"
            ? { placement: "none" as const }
            : s.html_layout.character,
      },
    })),
  };
}

function tryParseDesignerPack(
  text: string,
  handoff: CarouselHandoffJson,
): DesignerImagePromptsJson {
  try {
    return parseAndAssertDesignerPack(text, handoff);
  } catch (first) {
    try {
      const loose = parseDesignerImagePromptsFromText(text);
      const repaired = softRepairDesignerPack(loose, handoff);
      // Re-assert via stringify so schema + critic run on repaired pack
      return parseAndAssertDesignerPack(JSON.stringify(repaired), handoff);
    } catch {
      throw first;
    }
  }
}

/**
 * Ensure every slide has Designer Variant A pack fields.
 * Prefer Scriptwriter-provided html_layout; else Designer LLM translate;
 * vision_ref last resort = hard-copy etalon grammar (NOT stock variety synth).
 */
export async function ensureDesignerVariantAPack(
  handoff: CarouselHandoffJson,
  opts?: {
    placeholders?: CorrectPipelinePlaceholders;
    model?: string;
    /** When true, LLM failure → error (product Create). Smoke can allow fallback. */
    requireLlm?: boolean;
    designMarkdown?: string;
    layoutMap?: import("@/types/design").LayoutMap | null;
    characterPaint?: import("@/lib/studio/create-carousel-prompts").CharacterPaintPath | null;
    /** vision_ref → skip FULL token inject; attach etalon via referenceImage. */
    styleCopyMode?: StyleCopyMode | null;
    referenceImage?: DrawReferenceImageSignal | null;
    /**
     * Local etalon slot paths for multimodal vision attach (Backend).
     * Prefer all 4 slots; never dump base64 into text prompt.
     */
    referenceImagePaths?: string[] | null;
  },
): Promise<EnsureDesignerVariantAPackResult> {
  const visionRef = opts?.styleCopyMode === "vision_ref";
  const skipVariety = visionRef;
  const paint = opts?.characterPaint ?? "in_image";

  const finishOk = (
    pack: DesignerImagePromptsJson,
    source: DesignerPackSource,
    extra?: { model?: string; promptDump?: DesignerPromptDump },
  ): EnsureDesignerVariantAPackResult => {
    const stamped = stampCharacterPaintOnPack(pack, paint);
    return {
      ok: true,
      handoff: mergePackOntoHandoff(handoff, stamped, {
        skipVarietyShuffle: skipVariety,
      }),
      pack: stamped,
      source,
      model: extra?.model,
      promptDump: extra?.promptDump
        ? { ...extra.promptDump, packSource: source }
        : undefined,
    };
  };

  const visionOrStockFallback = (failReason: string, promptDump?: DesignerPromptDump) => {
    if (visionRef) {
      const pack = synthVisionRefHardCopyPack(handoff, paint);
      return finishOk(pack, "vision_ref_hardcopy", {
        promptDump: {
          system: promptDump?.system ?? "",
          user: promptDump?.user ?? "",
          styleCopyMode: "vision_ref",
          referenceImageAttached: promptDump?.referenceImageAttached ?? false,
          referenceImageCount: promptDump?.referenceImageCount ?? 0,
          FULL_inject_skipped: true,
          failReason,
          packSource: "vision_ref_hardcopy",
        },
      });
    }
    const pack = synthFallbackPack(handoff);
    return finishOk(pack, "fallback_synth", {
      promptDump: promptDump
        ? { ...promptDump, failReason, packSource: "fallback_synth" }
        : undefined,
    });
  };

  if (slidesHaveHtmlLayout(handoff)) {
    try {
      const raw = packFromHandoff(handoff);
      const pack = parseAndAssertDesignerPack(JSON.stringify(raw), handoff);
      return finishOk(pack, "scriptwriter");
    } catch {
      // Invalid SW layouts — fall through to Designer LLM
    }
  }

  if (!resolveAggregatorEnv()) {
    if (opts?.requireLlm) {
      return {
        ok: false,
        error: "aggregator_key_missing",
        code: "aggregator_key_missing",
      };
    }
    return visionOrStockFallback("aggregator_key_missing");
  }

  const model =
    opts?.model?.trim() ||
    process.env.DESIGNER_TEXT_MODEL?.trim() ||
    DEFAULT_DESIGNER_TEXT_MODEL;

  const placeholders = visionRef
    ? sanitizePlaceholdersForVisionRef(opts?.placeholders)
    : opts?.placeholders;
  const system = [
    resolveCreateCarouselOverlay("designer", "draw", {
      pipeline: "layered_html",
      placeholders,
      layoutMap: visionRef ? null : opts?.layoutMap ?? null,
      characterPaint: paint,
      styleCopyMode: opts?.styleCopyMode ?? null,
      referenceImage: opts?.referenceImage ?? null,
    }),
    !visionRef && opts?.designMarkdown?.trim()
      ? `\n\n### Active DESIGN.md excerpt\n${opts.designMarkdown.trim().slice(0, 6000)}`
      : "",
    "",
    "OUTPUT ONLY fenced ```json with { slides: [{ slide_number, image_prompt, html_layout }] }.",
    visionRef && paint === "none"
      ? "image_prompt = MATCH attached HIGVEN industrial etalon (dark charcoal/black OR stark white plates, safety-orange energy, bold left empty type band, inset/right hero object); NO character/girl/conductor; content topic = hero OBJECT only (may be food as object, NOT cream lifestyle magazine set). BAN beige plaster lifestyle walls. NO TEXT NO LOGO."
      : visionRef
        ? "image_prompt = MATCH attached reference: solid plate + OBJECT zone; BAN full-bleed kitchen lifestyle; content topic = hero OBJECT only; in_image conductor on cover+cta at minimum. NO TEXT NO LOGO."
        : "image_prompt = BACKGROUND SCENE ONLY (NO TEXT / NO LOGO) — honor characterPaint (in_image may include conductor).",
    visionRef && paint === "none"
      ? "html_layout REQUIRED — layoutMapSource=vision_ref; characterPaint=none; LEFT/TOP bold hierarchy; logo.placement from etalon; optional logo.textColor IN THIS SAME pack (no second call); CTA on last only."
      : visionRef
        ? "html_layout REQUIRED — layoutMapSource=vision_ref; bgFit=contain|mask (prefer); LEFT/TOP type (body_left/cta_bottom); HARD-COPY etalon; DO NOT invent cover_center variety shuffle."
        : "html_layout REQUIRED every slide — closed template catalog; mirror layoutMap when present; set characterPaint.",
    "OUTPUT BOTH image_prompt AND html_layout in ONE reply (parallel pack). highlight phrases MUST be exact substrings of Scriptwriter primary_copy / secondary_copy.",
  ]
    .filter(Boolean)
    .join("\n");

  const user = [
    visionRef && paint === "none"
      ? "HIGVEN-3 PARALLEL PACK: ONE reply with image_prompt + html_layout for each of 3 slides. HARD-COPY industrial HIGVEN grammar. characterPaint=none. No second logo-color call."
      : visionRef
        ? "HARD-COPY the attached etalon style onto this Scriptwriter handoff (image_prompt + html_layout per slide)."
        : "Translate this Scriptwriter handoff into Designer pack (image_prompt + html_layout per slide).",
    "Do not invent new copy. Do not omit html_layout.",
    "",
    "```json",
    JSON.stringify(
      {
        requested_slide_count: handoff.requested_slide_count,
        idea: handoff.idea,
        hook: handoff.hook,
        cta_type: handoff.cta_type,
        character_id: handoff.character_id,
        slides: handoff.slides.map((s) => ({
          slide_number: s.slide_number,
          layout_variant: s.layout_variant,
          primary_copy: s.primary_copy,
          secondary_copy: s.secondary_copy,
          visual_prompt: s.visual_prompt,
          cta_type: s.cta_type,
          swipe_trigger: s.swipe_trigger,
        })),
      },
      null,
      2,
    ),
    "```",
  ].join("\n");

  const refPaths = (opts?.referenceImagePaths ?? []).filter(
    (p) => typeof p === "string" && p.trim(),
  );
  // Prefer cover+cta only first (smaller payload); full 4 if that fails parse.
  const slimPaths =
    visionRef && refPaths.length > 2
      ? [refPaths[0]!, refPaths[refPaths.length - 1]!].filter(Boolean)
      : refPaths;
  const imagesFull =
    visionRef && refPaths.length > 0
      ? await pathsToDataUrls(refPaths)
      : [];
  const imagesSlim =
    visionRef && slimPaths.length > 0
      ? await pathsToDataUrls(slimPaths)
      : imagesFull;

  const promptDump: DesignerPromptDump = {
    system,
    user,
    styleCopyMode: opts?.styleCopyMode ?? null,
    referenceImageAttached: Boolean(imagesSlim.length || imagesFull.length),
    referenceImageCount: Math.max(imagesSlim.length, imagesFull.length),
    FULL_inject_skipped: visionRef,
  };

  const attempts: Array<{ label: string; images?: string[] }> = visionRef
    ? [
        { label: "vision_slim", images: imagesSlim },
        { label: "vision_full", images: imagesFull },
        { label: "text_only" },
      ]
    : [{ label: "default", images: undefined }];

  let lastFail = "designer_pack_empty";

  for (const attempt of attempts) {
    const imgs = attempt.images?.length ? attempt.images : undefined;
    const chat = await callAggregatorChat({
      system,
      user,
      model,
      temperature: visionRef ? 0.25 : 0.35,
      maxTokens: 8192,
      fallbackModels: true,
      ...(imgs ? { images: imgs } : {}),
    });

    if (!chat.ok) {
      lastFail = `${attempt.label}:${chat.error}`;
      continue;
    }
    try {
      const pack = tryParseDesignerPack(chat.text, handoff);
      // On vision_ref: force plate prompts if LLM still wrote lifestyle kitchen
      if (visionRef) {
        const reinforced: DesignerImagePromptsJson = {
          slides: pack.slides.map((slide, i) => {
            const prompt = (slide.image_prompt ?? "").toLowerCase();
            const lifestyle =
              /kitchen|full[- ]?bleed|lifestyle|room scene|interior set/.test(
                prompt,
              ) && !/solid (orange|white|color) plate/.test(prompt);
            if (!lifestyle && slide.html_layout?.bgFit) {
              return {
                ...slide,
                html_layout: {
                  ...slide.html_layout,
                  layoutMapSource:
                    slide.html_layout.layoutMapSource ?? "vision_ref",
                  characterPaint:
                    slide.html_layout.characterPaint ?? "in_image",
                  bgFit:
                    slide.html_layout.bgFit === "cover"
                      ? "contain"
                      : slide.html_layout.bgFit,
                },
              };
            }
            const role = normalizeCarouselSlideRole(
              handoff.slides[i]?.layout_variant,
              i,
              handoff.slides.length,
            );
            const layout =
              lifestyle || !slide.html_layout?.bgFit
                ? {
                    ...synthesizeVisionRefHardCopyLayout(
                      role,
                      i,
                      handoff.slides.length,
                    ),
                    primary: slide.html_layout?.primary ?? {
                      highlights: [],
                    },
                    secondary: slide.html_layout?.secondary ?? {
                      highlights: [],
                    },
                  }
                : {
                    ...slide.html_layout,
                    layoutMapSource: "vision_ref" as const,
                    bgFit:
                      slide.html_layout.bgFit === "cover"
                        ? ("contain" as const)
                        : slide.html_layout.bgFit,
                    characterPaint: "in_image" as const,
                  };
            return {
              ...slide,
              image_prompt: buildVisionRefBackgroundImagePrompt({
                visualPrompt: handoff.slides[i]?.visual_prompt ?? "",
                primaryCopy: handoff.slides[i]?.primary_copy,
                slideIndex0: i,
                slideTotal: handoff.slides.length,
                characterPaint: paint,
                forceConductor: i === 0 || i >= handoff.slides.length - 1,
              }),
              html_layout: layout,
            };
          }),
        };
        return finishOk(reinforced, "designer_llm", {
          model: chat.model,
          promptDump: {
            ...promptDump,
            referenceImageAttached: Boolean(imgs?.length),
            referenceImageCount: imgs?.length ?? 0,
            failReason: undefined,
          },
        });
      }
      return finishOk(pack, "designer_llm", {
        model: chat.model,
        promptDump,
      });
    } catch (err) {
      lastFail =
        err instanceof CarouselJsonParseError
          ? `${attempt.label}:schema:${err.message}`
          : `${attempt.label}:schema`;
    }
  }

  if (opts?.requireLlm) {
    return {
      ok: false,
      error: lastFail,
      code: lastFail.includes("schema") ? "schema" : "designer_pack_fail",
      promptDump: { ...promptDump, failReason: lastFail },
    };
  }

  return visionOrStockFallback(lastFail, {
    ...promptDump,
    failReason: lastFail,
  });
}
