/**
 * C-carousel-json-scriptwriter — Vernatun carousel handoff JSON (AI Bridge).
 * Dramaturgy artifact Scriptwriter → Designer. Backend validates on handoff/draw.
 */

import { z } from "zod";

/** CTA catalog 1–4 (C-scriptwriter-swipe-cta). */
export const carouselCtaTypeSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

/** Sheet / agent mode for correct pipeline (meetings | useful). */
export const carouselModeSchema = z.union([
  z.literal("meetings"),
  z.literal("useful"),
]);

/** Product render mode — S57 layered HTML is ship default. */
export const carouselRenderModeSchema = z.union([
  z.literal("layered_html"),
  z.literal("correct_pipeline"),
  z.literal("e2e_diffusion"),
  z.literal("anchor_ref"),
  z.literal("html_overlay"),
]);

/**
 * Variant A — closed HTML layout templates (composite maps each → CSS).
 * Unknown string → zod FAIL (no LLM invent of 7th template).
 */
export const htmlLayoutTemplateSchema = z.enum([
  "cover_center",
  "body_left",
  "body_split",
  "cta_bottom",
  "tip_card",
  "quote_band",
]);

export const htmlLayoutHighlightSchema = z.object({
  /** Exact substring of primary_copy or secondary_copy (orphan → critic FAIL). */
  phrase: z.string().min(1),
  /** Wave lock: accent only (marker/bold deferred). */
  style: z.literal("accent"),
});

export const htmlLayoutTextBlockSchema = z.object({
  anchor: z.enum(["left", "center", "right"]),
  align: z.enum(["left", "center", "right"]),
  safe: z.boolean().default(true),
  /** Optional vertical band for layout variety (top|middle|bottom). */
  vertical: z.enum(["top", "middle", "bottom"]).optional(),
});

/** Brand chrome corners — logo-placement-v2 body SoT = bottom-left (cover/cta → top-left via composite). */
export const htmlLayoutLogoPlacementSchema = z.enum([
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "none",
]);

/**
 * fontFit reduce-only meta (Designer may shrink; composite never enlarges above DESIGN).
 * Positive deltaPx / enlarge overrides are clamped to ≤0 / ≤ DESIGN at composite.
 */
export const htmlLayoutFontFitSchema = z.object({
  role: z
    .enum(["title", "body", "content", "primary", "secondary", "brand", "slideNumber"])
    .optional(),
  /** Must be ≤0 (reduce). Positive values ignored / clamped by composite. */
  deltaPx: z.number().max(0).optional(),
  reason: z.string().max(240).optional(),
});

/**
 * Variant A per-slide html_layout (Architect FINAL).
 * Aliases accepted via preprocess: brandChrome→logo.placement, characterSlot→character.placement.
 */
const htmlLayoutObjectSchema = z.object({
  template: htmlLayoutTemplateSchema,
  text_block: htmlLayoutTextBlockSchema,
  primary: z
    .object({
      highlights: z.array(htmlLayoutHighlightSchema).max(4).default([]),
    })
    .default({ highlights: [] }),
  secondary: z
    .object({
      highlights: z.array(htmlLayoutHighlightSchema).max(6).default([]),
    })
    .default({ highlights: [] }),
  logo: z
    .object({
      placement: htmlLayoutLogoPlacementSchema,
      /**
       * Phase 2 — CSS hex for HTML wordmark (Path A emblem+name).
       * Aliases: logoTextColor, logo.text_color (see normalizeHtmlLayoutRaw).
       */
      textColor: z
        .string()
        .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, "logo.textColor must be #RGB or #RRGGBB")
        .optional(),
    })
    .default({ placement: "bottom-left" }),
  character: z
    .object({
      placement: z.enum(["none", "right-cutout", "left-cutout"]),
    })
    .default({ placement: "none" }),
  cta: z
    .object({
      placement: z.enum(["none", "bottom", "inline"]),
    })
    .default({ placement: "none" }),
  scrim: z.enum(["none", "soft", "heavy"]).default("soft"),
  /**
   * Skill synonym (html-layout-variant-a) — mirrored from logo.placement after normalize.
   * Product chrome SoT = role-aware (logo-placement-v2): cover/cta top-left; body bottom-left.
   */
  brandChrome: htmlLayoutLogoPlacementSchema.optional(),
  /** Skill synonym — mirrored from character.placement after normalize. */
  characterSlot: z
    .enum(["none", "right-cutout", "left-cutout"])
    .optional(),
  /** Reduce-only type fit vs DESIGN scale — composite clamps. */
  fontFit: htmlLayoutFontFitSchema.optional(),
  /**
   * Optional per-role px overrides from Designer. Composite applies **reduce-only**
   * (never above DESIGN typography.scale for that role).
   */
  fontSizeOverride: z
    .object({
      title: z.number().positive().optional(),
      body: z.number().positive().optional(),
      content: z.number().positive().optional(),
      primary: z.number().positive().optional(),
      secondary: z.number().positive().optional(),
      brand: z.number().positive().optional(),
      slideNumber: z.number().positive().optional(),
    })
    .optional(),
  /**
   * Dual character path (wave layout-copy) — alias job `character_path`.
   * Composite: in_image / none → no HTML cutout; overlay_cutout → cover+last.
   */
  characterPaint: z
    .enum(["in_image", "overlay_cutout", "none"])
    .optional(),
  /**
   * Layout grammar source:
   * - preset = active DesignPreset.layoutMap
   * - invent = free variety
   * - vision_ref = etalon image composition (wave vision-style-copy)
   */
  layoutMapSource: z.enum(["preset", "invent", "vision_ref"]).optional(),
  /**
   * Partial / inset etalon photo fit (Backend composite).
   * cover = full-bleed; contain = letterbox; mask = inset photo zone.
   */
  bgFit: z.enum(["cover", "contain", "mask"]).optional(),
  /** Normalized 0..1 photo window when bgFit=mask|contain. */
  photoZone: z
    .object({
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
      w: z.number().min(0).max(1),
      h: z.number().min(0).max(1),
    })
    .optional(),
});

export const htmlLayoutSchema: z.ZodType<
  z.infer<typeof htmlLayoutObjectSchema>
> = z.preprocess(
  (raw) => normalizeHtmlLayoutRaw(raw),
  htmlLayoutObjectSchema,
);
export type HtmlLayoutTemplate = z.infer<typeof htmlLayoutTemplateSchema>;
export type HtmlLayoutHighlight = z.infer<typeof htmlLayoutHighlightSchema>;
export type HtmlLayout = z.infer<typeof htmlLayoutSchema>;

/** Closed template list for prompts / critic messages. */
export const HTML_LAYOUT_TEMPLATES: readonly HtmlLayoutTemplate[] = [
  "cover_center",
  "body_left",
  "body_split",
  "cta_bottom",
  "tip_card",
  "quote_band",
] as const;

/** One slide in the Create carousel handoff artifact. */
export const carouselSlideSchema = z.object({
  slide_number: z.number().int().positive(),
  layout_variant: z.string().min(1),
  /** Short headline / hook — cover pattern ≤6–8 words. */
  primary_copy: z.string().min(1),
  /**
   * S57 HARD — REQUIRED practical body (2–3 sentences) on EVERY slide.
   * Maps from legacy `body`. Rendered by HTML layer (not image model).
   */
  secondary_copy: z.string().min(1),
  /** Meta engagement QA («зачем листать») — NOT on-slide paint / HTML. */
  swipe_trigger: z.string().min(1),
  /**
   * S57 — SCENE ONLY for bg image model (light/materials/composition).
   * No letters, logos, watermarks, on-slide copy.
   */
  visual_prompt: z.string().min(1),
  alt_text: z.string().optional(),
  cta_type: carouselCtaTypeSchema.optional(),
  /**
   * Legacy Phase 6 — optional Designer-translated type-on-PNG prompt.
   * S57 layered: prefer bg-only helpers; image_prompt if set must still be bg-safe.
   */
  image_prompt: z.string().min(1).optional(),
  /**
   * Variant A — optional on Scriptwriter handoff; REQUIRED on Designer emit pack.
   * Composite may synthesize fallback only for legacy archaeology.
   */
  html_layout: htmlLayoutSchema.optional(),
});

/**
 * Strict Create handoff JSON (wave lock).
 * Optional `project` / `content_id` for job wiring; dramaturgy fields from Architect.
 * Phase 6: optional mode / character_id / needs_input for sheet⊕Create.
 */
export const carouselJsonSchema = z.object({
  project: z.string().optional(),
  content_id: z.string().optional(),
  contentType: z.literal("carousel").optional(),
  requested_slide_count: z.number().int().positive(),
  idea: z.string().optional(),
  hook: z.string().optional(),
  tone: z.string().optional(),
  /** Optional root CTA catalog pick (1–4); often mirrored on last/cta slide. */
  cta_type: carouselCtaTypeSchema.optional(),
  slides: z.array(carouselSlideSchema).min(1),
  caption: z.string(),
  hashtags: z.array(z.string()),
  promptForDesigner: z.string().optional(),
  /** Phase 6 — meetings | useful */
  mode: carouselModeSchema.optional(),
  /** Landscapes catalog number; null/omit = no character */
  character_id: z.number().int().positive().nullable().optional(),
  /** Scriptwriter blocked — ask user; do not invent */
  needs_input: z.boolean().optional(),
  /**
   * S57 product = `layered_html`. Trace/artifact field; Backend may stamp.
   * Legacy archaeology: correct_pipeline | e2e_diffusion | …
   */
  renderMode: carouselRenderModeSchema.optional(),
});

/**
 * Phase 7 / Variant A Designer emit — bg image_prompt + html_layout per slide.
 * (Phase 6 archaeology used image_prompt-only; product path requires both.)
 */
export const designerImagePromptSlideSchema = z.object({
  slide_number: z.number().int().positive(),
  /** BACKGROUND SCENE ONLY — NO TEXT / NO LOGO. */
  image_prompt: z.string().min(1),
  /** Variant A — REQUIRED for carousel-engine layered draw. */
  html_layout: htmlLayoutSchema,
});

export const designerImagePromptsSchema = z.object({
  slides: z.array(designerImagePromptSlideSchema).min(1),
});

export type DesignerImagePromptsJson = z.infer<
  typeof designerImagePromptsSchema
>;

export type CarouselSlideJson = z.infer<typeof carouselSlideSchema>;
export type CarouselHandoffJson = z.infer<typeof carouselJsonSchema>;
export type CarouselCtaType = z.infer<typeof carouselCtaTypeSchema>;
export type CarouselMode = z.infer<typeof carouselModeSchema>;
export type CarouselRenderMode = z.infer<typeof carouselRenderModeSchema>;

/** Art Director remark categories (Architect §7.2). */
export const artDirectorRemarkCategorySchema = z.enum([
  "hook",
  "continuity",
  "hierarchy",
  "safe_zone",
  "contrast",
  "cta",
  "brand",
  "slop",
  "copy",
  "missing_assets",
  "layout",
  "design",
  "bake_artifact",
  "overlay",
]);

export const artDirectorRemarkSchema = z.object({
  slideIndex: z.number().int().min(1),
  // Tolerate any category the vision model invents — an off-enum label must NOT
  // throw away the whole verdict (client: AD выдавал «no verdict» из-за category).
  category: artDirectorRemarkCategorySchema.catch("hierarchy"),
  severity: z.enum(["P0", "P1", "P2"]).catch("P2"),
  note: z.string().min(8),
});

/**
 * Art Director verdict — approve | remarks. NEVER remake instructions.
 * Optional `score` / `issues` aliases: issues→remarks after normalize.
 */
export const artDirectorVerdictSchema = z.object({
  verdict: z.enum(["approve", "remarks"]),
  summary: z.string().min(1),
  remarks: z.array(artDirectorRemarkSchema).default([]),
  /** Optional 0–100 taste score (soft; not used for remake). */
  score: z.number().min(0).max(100).optional(),
  /** Alias for remarks (user/LLM habit) — stripped after normalize. */
  issues: z.array(artDirectorRemarkSchema).optional(),
  sequenceNotes: z.string().optional(),
});

export type ArtDirectorRemark = z.infer<typeof artDirectorRemarkSchema>;
export type ArtDirectorVerdict = z.infer<typeof artDirectorVerdictSchema>;

/** Compact schema hint for agent-start system (no secrets). */
export const CAROUSEL_JSON_SCHEMA_HINT = [
  "Strict JSON keys:",
  "project?, content_id?, contentType?: \"carousel\",",
  "requested_slide_count (int = user N; auto 7 when topic is «N способов/советов/ошибок» / ways/tips — SW may bump),",
  "idea?, hook?, tone?, cta_type?: 1|2|3|4, mode?: \"meetings\"|\"useful\",",
  "character_id?: number|null, needs_input?: boolean, renderMode?: \"layered_html\",",
  "slides[{ slide_number, layout_variant, primary_copy (≤8 words), secondary_copy (REQUIRED 2–3 practical sentences),",
  "swipe_trigger (META engagement QA — not on-slide / not HTML text),",
  "visual_prompt (SCENE ONLY — no letters/logos/watermarks), alt_text?, cta_type?: 1|2|3|4, image_prompt?, html_layout? }],",
  "caption, hashtags[], promptForDesigner?",
  "Invariant: requested_slide_count === slides.length.",
  "CTA catalog 1–4 → HTML button on cta_slide only (layered_html). Image model never paints CTA/type/logo.",
  "CTA catalog: 1 comments | 2 subscribe | 3 TG club meets | 4 like+save.",
  "html_layout = Designer Variant A (not Scriptwriter duty).",
].join(" ");

/** Designer bg + html_layout output hint (S57 layered · Variant A). */
export const DESIGNER_IMAGE_PROMPTS_SCHEMA_HINT = [
  "Designer output (layered draw · Variant A): STRICT JSON only —",
  "{ slides: [{ slide_number, image_prompt, html_layout }] }",
  "Length = Scriptwriter slides.length.",
  "image_prompt = BACKGROUND SCENE ONLY from visual_prompt + HARD ban NO TEXT/NO LOGO.",
  "html_layout REQUIRED per slide: template (cover_center|body_left|body_split|cta_bottom|tip_card|quote_band),",
  "text_block {anchor,align,safe}, primary.highlights[] / secondary.highlights[] (phrase MUST be substring of primary_copy / secondary_copy; style:\"accent\" only),",
  "logo.placement|brandChrome, character.placement|characterSlot, cta.placement, scrim.",
  "NO raw HTML/CSS strings. Typography / brand logo / CTA button / character cut-outs = HTML layer executed by composite.",
].join(" ");

export const ART_DIRECTOR_VERDICT_SCHEMA_HINT = [
  "Art Director output: STRICT JSON only —",
  '{ "verdict": "approve"|"remarks", "summary": "1–3 sentences RU", "score"?: 0-100,',
  '  "remarks": [{ "slideIndex": 1, "category": "hook|continuity|hierarchy|safe_zone|contrast|cta|brand|slop|copy|missing_assets|layout",',
  '    "severity": "P0"|"P1"|"P2", "note": "concrete fix hint ≥8 chars" }],',
  '  "sequenceNotes"?: "…" }',
  "HARD: Не запускай перерисовку. Только verdict. NO remake / redraw / re-composite instructions.",
].join(" ");

/**
 * Normalize LLM html_layout aliases → Architect FINAL shape.
 * - brandChrome → logo.placement
 * - characterSlot → character.placement
 * - flat highlights[] → primary.highlights (legacy skill sketch)
 * - text style "accent" coercion; phrase from text synonym
 */
export function normalizeHtmlLayoutRaw(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const o = { ...(raw as Record<string, unknown>) };
  deleteNullKeys(o);

  const LOGO_PLACEMENTS = new Set([
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
    "none",
  ]);
  const brandChrome =
    typeof o.brandChrome === "string"
      ? o.brandChrome
      : typeof o.brand_chrome === "string"
        ? o.brand_chrome
        : undefined;
  if (typeof brandChrome === "string" && LOGO_PLACEMENTS.has(brandChrome)) {
    o.brandChrome = brandChrome;
    if (!o.logo || typeof o.logo !== "object" || Array.isArray(o.logo)) {
      o.logo = { placement: brandChrome };
    } else {
      const logo = { ...(o.logo as Record<string, unknown>) };
      if (logo.placement == null) logo.placement = brandChrome;
      o.logo = logo;
    }
  }

  // Phase 2: logoTextColor / logo.text_color → logo.textColor
  {
    const flatTextColor =
      typeof o.logoTextColor === "string"
        ? o.logoTextColor
        : typeof o.logo_text_color === "string"
          ? o.logo_text_color
          : undefined;
    if (!o.logo || typeof o.logo !== "object" || Array.isArray(o.logo)) {
      if (typeof flatTextColor === "string" && flatTextColor.trim()) {
        let hex = flatTextColor.trim();
        if (/^[0-9A-Fa-f]{6}$/.test(hex)) hex = `#${hex}`;
        if (/^[0-9A-Fa-f]{3}$/.test(hex)) hex = `#${hex}`;
        o.logo = { placement: "bottom-left", textColor: hex };
      }
    } else {
      const logo = { ...(o.logo as Record<string, unknown>) };
      if (logo.placement == null) logo.placement = "bottom-left";
      const nested =
        typeof logo.textColor === "string"
          ? logo.textColor
          : typeof logo.text_color === "string"
            ? logo.text_color
            : typeof flatTextColor === "string"
              ? flatTextColor
              : undefined;
      if (typeof nested === "string" && nested.trim()) {
        let hex = nested.trim();
        if (/^[0-9A-Fa-f]{6}$/.test(hex)) hex = `#${hex}`;
        if (/^[0-9A-Fa-f]{3}$/.test(hex)) hex = `#${hex}`;
        logo.textColor = hex;
        delete logo.text_color;
      }
      o.logo = logo;
    }
    delete o.logoTextColor;
    delete o.logo_text_color;
  }

  // Clamp fontFit.deltaPx to ≤0 at normalize (reduce-only contract)
  if (o.fontFit && typeof o.fontFit === "object" && !Array.isArray(o.fontFit)) {
    const ff = { ...(o.fontFit as Record<string, unknown>) };
    if (typeof ff.deltaPx === "number" && Number.isFinite(ff.deltaPx) && ff.deltaPx > 0) {
      ff.deltaPx = 0;
    }
    o.fontFit = ff;
  }

  const characterSlot =
    typeof o.characterSlot === "string"
      ? o.characterSlot
      : typeof o.character_slot === "string"
        ? o.character_slot
        : undefined;
  if (
    characterSlot === "none" ||
    characterSlot === "right-cutout" ||
    characterSlot === "left-cutout"
  ) {
    o.characterSlot = characterSlot;
    if (
      !o.character ||
      typeof o.character !== "object" ||
      Array.isArray(o.character)
    ) {
      o.character = { placement: characterSlot };
    } else {
      const ch = { ...(o.character as Record<string, unknown>) };
      if (ch.placement == null) ch.placement = characterSlot;
      o.character = ch;
    }
  }

  // Sync brandChrome/characterSlot from nested placement when only nested set
  if (
    o.logo &&
    typeof o.logo === "object" &&
    !Array.isArray(o.logo) &&
    o.brandChrome == null
  ) {
    const p = (o.logo as Record<string, unknown>).placement;
    if (typeof p === "string" && LOGO_PLACEMENTS.has(p)) {
      o.brandChrome = p;
    }
  }
  if (
    o.character &&
    typeof o.character === "object" &&
    !Array.isArray(o.character) &&
    o.characterSlot == null
  ) {
    const p = (o.character as Record<string, unknown>).placement;
    if (p === "none" || p === "right-cutout" || p === "left-cutout") {
      o.characterSlot = p;
    }
  }

  // Flat highlights[] (skill sketch) → primary.highlights
  if (Array.isArray(o.highlights)) {
    const mapped = o.highlights
      .map((h) => normalizeHighlightRaw(h))
      .filter(Boolean);
    if (!o.primary || typeof o.primary !== "object" || Array.isArray(o.primary)) {
      o.primary = { highlights: mapped };
    } else {
      const prim = { ...(o.primary as Record<string, unknown>) };
      if (!Array.isArray(prim.highlights) || prim.highlights.length === 0) {
        prim.highlights = mapped;
      }
      o.primary = prim;
    }
    delete o.highlights;
  }

  if (o.primary && typeof o.primary === "object" && !Array.isArray(o.primary)) {
    const prim = { ...(o.primary as Record<string, unknown>) };
    if (Array.isArray(prim.highlights)) {
      prim.highlights = prim.highlights
        .map((h) => normalizeHighlightRaw(h))
        .filter(Boolean);
    }
    o.primary = prim;
  }
  if (
    o.secondary &&
    typeof o.secondary === "object" &&
    !Array.isArray(o.secondary)
  ) {
    const sec = { ...(o.secondary as Record<string, unknown>) };
    if (Array.isArray(sec.highlights)) {
      sec.highlights = sec.highlights
        .map((h) => normalizeHighlightRaw(h))
        .filter(Boolean);
    }
    o.secondary = sec;
  }

  // anchor synonym at root → text_block
  if (
    (!o.text_block || typeof o.text_block !== "object") &&
    o.anchor &&
    typeof o.anchor === "object" &&
    !Array.isArray(o.anchor)
  ) {
    const a = o.anchor as Record<string, unknown>;
    const x =
      a.x === "left" || a.x === "center" || a.x === "right" ? a.x : "center";
    o.text_block = {
      anchor: x,
      align: x,
      safe: a.safe !== false,
    };
    delete o.anchor;
  }

  return o;
}

function normalizeHighlightRaw(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const h = { ...(raw as Record<string, unknown>) };
  if (h.phrase == null && typeof h.text === "string") h.phrase = h.text;
  delete h.text;
  if (h.style == null || h.style === "marker" || h.style === "bold") {
    // Wave lock: coerce to accent (marker/bold deferred)
    h.style = "accent";
  }
  if (typeof h.phrase !== "string" || !h.phrase.trim()) return null;
  return h;
}

/**
 * Parse Designer image_prompt + html_layout pack (Variant A / S57).
 */
export function parseDesignerImagePromptsFromText(
  text: string,
): DesignerImagePromptsJson {
  const candidate = extractJsonCandidate(text);
  if (!candidate) {
    throw new CarouselJsonParseError(
      "NO_JSON",
      "No Designer image_prompt JSON found.",
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    throw new CarouselJsonParseError(
      "INVALID_JSON",
      "Designer image_prompt JSON.parse failed.",
    );
  }
  const normalized = normalizeDesignerPackRaw(parsed);
  const result = designerImagePromptsSchema.safeParse(normalized);
  if (!result.success) {
    const detail = result.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    // Unknown template surfaces as zod enum fail → SCHEMA
    throw new CarouselJsonParseError(
      "SCHEMA",
      `Designer image_prompts failed schema: ${detail}`,
    );
  }
  return result.data;
}

function normalizeDesignerPackRaw(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const obj = { ...(raw as Record<string, unknown>) };
  if (!Array.isArray(obj.slides)) return obj;
  obj.slides = obj.slides.map((slide) => {
    if (!slide || typeof slide !== "object" || Array.isArray(slide)) return slide;
    const s = { ...(slide as Record<string, unknown>) };
    deleteNullKeys(s);
    if (s.html_layout != null) {
      s.html_layout = normalizeHtmlLayoutRaw(s.html_layout);
    }
    return s;
  });
  return obj;
}

export type HtmlLayoutCriticIssue = {
  code: "unknown_template" | "orphan_highlight" | "missing_html_layout" | "cta_placement";
  message: string;
  slide?: number;
};

/**
 * Critic: reject unknown template (belt) + orphan highlight phrases.
 * Call after zod parse, or on raw+normalized layout with copy SoT.
 */
export function critiqueHtmlLayout(
  layout: HtmlLayout | null | undefined,
  primaryCopy: string,
  secondaryCopy: string,
  slideNumber?: number,
): HtmlLayoutCriticIssue[] {
  const issues: HtmlLayoutCriticIssue[] = [];
  if (!layout) {
    issues.push({
      code: "missing_html_layout",
      message: "html_layout required (Variant A)",
      slide: slideNumber,
    });
    return issues;
  }

  if (
    !(HTML_LAYOUT_TEMPLATES as readonly string[]).includes(layout.template)
  ) {
    issues.push({
      code: "unknown_template",
      message: `unknown template «${String(layout.template)}» — allowed: ${HTML_LAYOUT_TEMPLATES.join("|")}`,
      slide: slideNumber,
    });
  }

  const primary = primaryCopy ?? "";
  const secondary = secondaryCopy ?? "";
  for (const h of layout.primary?.highlights ?? []) {
    if (!primary.includes(h.phrase)) {
      issues.push({
        code: "orphan_highlight",
        message: `primary highlight «${h.phrase}» is not a substring of primary_copy`,
        slide: slideNumber,
      });
    }
  }
  for (const h of layout.secondary?.highlights ?? []) {
    if (!secondary.includes(h.phrase)) {
      issues.push({
        code: "orphan_highlight",
        message: `secondary highlight «${h.phrase}» is not a substring of secondary_copy`,
        slide: slideNumber,
      });
    }
  }

  return issues;
}

/**
 * Critic Designer pack against Scriptwriter handoff copy (orphan + missing layout).
 * Throws CarouselJsonParseError SCHEMA on any fail.
 */
export function assertDesignerPackHtmlLayouts(
  pack: DesignerImagePromptsJson,
  handoff: CarouselHandoffJson,
): DesignerImagePromptsJson {
  const byNum = new Map(
    handoff.slides.map((s) => [s.slide_number, s] as const),
  );
  const all: HtmlLayoutCriticIssue[] = [];
  for (const slide of pack.slides) {
    const sw = byNum.get(slide.slide_number);
    const primary = sw?.primary_copy ?? "";
    const secondary = sw?.secondary_copy ?? "";
    all.push(
      ...critiqueHtmlLayout(
        slide.html_layout,
        primary,
        secondary,
        slide.slide_number,
      ),
    );

    // CTA placement vs role (Architect: fail preferred)
    const role = sw?.layout_variant ?? "";
    const isCta = /cta/i.test(role);
    const ctaPlacement = slide.html_layout.cta?.placement ?? "none";
    if (!isCta && ctaPlacement !== "none") {
      all.push({
        code: "cta_placement",
        message: `cta.placement=${ctaPlacement} on non-cta_slide`,
        slide: slide.slide_number,
      });
    }
    if (
      isCta &&
      ctaPlacement === "none" &&
      (sw?.cta_type === 1 ||
        sw?.cta_type === 2 ||
        sw?.cta_type === 3 ||
        sw?.cta_type === 4 ||
        handoff.cta_type != null)
    ) {
      all.push({
        code: "cta_placement",
        message: "cta_slide with cta_type 1–4 requires cta.placement bottom|inline",
        slide: slide.slide_number,
      });
    }
  }
  if (all.length > 0) {
    const detail = all
      .slice(0, 6)
      .map((i) => `slide ${i.slide ?? "?"}: ${i.code} — ${i.message}`)
      .join("; ");
    throw new CarouselJsonParseError(
      "SCHEMA",
      `Designer html_layout critic REJECT: ${detail}`,
    );
  }
  return pack;
}

/** Parse Designer pack + orphan/template critic vs handoff. */
export function parseAndAssertDesignerPack(
  text: string,
  handoff: CarouselHandoffJson,
): DesignerImagePromptsJson {
  const pack = parseDesignerImagePromptsFromText(text);
  if (pack.slides.length !== handoff.slides.length) {
    throw new CarouselJsonParseError(
      "COUNT_MISMATCH",
      `Designer pack slides.length (${pack.slides.length}) !== handoff (${handoff.slides.length}).`,
    );
  }
  return assertDesignerPackHtmlLayouts(pack, handoff);
}

export function normalizeArtDirectorVerdictRaw(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const o = { ...(raw as Record<string, unknown>) };
  deleteNullKeys(o);
  if (
    (!Array.isArray(o.remarks) || o.remarks.length === 0) &&
    Array.isArray(o.issues)
  ) {
    o.remarks = o.issues;
  }
  delete o.issues;
  if (!Array.isArray(o.remarks)) o.remarks = [];
  return o;
}

export function parseArtDirectorVerdictFromText(text: string): ArtDirectorVerdict {
  const candidate = extractJsonCandidate(text);
  if (!candidate) {
    throw new CarouselJsonParseError(
      "NO_JSON",
      "No Art Director verdict JSON found.",
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    throw new CarouselJsonParseError(
      "INVALID_JSON",
      "Art Director verdict JSON.parse failed.",
    );
  }
  const normalized = normalizeArtDirectorVerdictRaw(parsed);
  const result = artDirectorVerdictSchema.safeParse(normalized);
  if (!result.success) {
    const detail = result.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    throw new CarouselJsonParseError(
      "SCHEMA",
      `Art Director verdict failed schema: ${detail}`,
    );
  }
  const data = result.data;
  // Harden: any P0/P1 → remarks (never approve with open P1 this wave)
  const hard = data.remarks.filter(
    (r) => r.severity === "P0" || r.severity === "P1",
  );
  if (hard.length > 0 && data.verdict === "approve") {
    return { ...data, verdict: "remarks" };
  }
  if (data.verdict === "approve") {
    return { ...data, remarks: [] };
  }
  return data;
}

export class CarouselJsonParseError extends Error {
  readonly code: "NO_JSON" | "INVALID_JSON" | "SCHEMA" | "COUNT_MISMATCH";

  constructor(code: CarouselJsonParseError["code"], message: string) {
    super(message);
    this.name = "CarouselJsonParseError";
    this.code = code;
  }
}

/** LLM often emits `null` for optional keys — zod `.optional()` rejects null. */
function deleteNullKeys(obj: Record<string, unknown>): void {
  for (const k of Object.keys(obj)) {
    if (obj[k] === null) delete obj[k];
  }
}

function coerceCtaType(raw: unknown): 1 | 2 | 3 | 4 | undefined {
  if (raw === 1 || raw === 2 || raw === 3 || raw === 4) return raw;
  if (typeof raw === "string") {
    const n = Number.parseInt(raw.trim(), 10);
    if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  }
  return undefined;
}

/**
 * Normalize legacy / synonym keys from LLM (Architect skill synonyms) into wave fields.
 * Also strips JSON `null` on optional fields (common LLM habit → schema 400 / zod fail).
 */
function normalizeRawCarouselObject(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const obj = { ...(raw as Record<string, unknown>) };
  deleteNullKeys(obj);

  const rootCta = coerceCtaType(obj.cta_type);
  if (rootCta != null) obj.cta_type = rootCta;
  else delete obj.cta_type;

  // Required caption / hashtags — soft defaults so STRICT shape can pass when
  // dramaturgy slides are otherwise valid (critic-05 still checks quality).
  if (typeof obj.caption !== "string" || !obj.caption.trim()) {
    const idea =
      typeof obj.idea === "string" && obj.idea.trim()
        ? obj.idea.trim()
        : typeof obj.hook === "string" && obj.hook.trim()
          ? obj.hook.trim()
          : "Карусель";
    obj.caption = idea.slice(0, 200);
  }
  if (!Array.isArray(obj.hashtags)) {
    obj.hashtags = [];
  }

  const slidesIn = obj.slides;
  if (!Array.isArray(slidesIn)) return obj;

  obj.slides = slidesIn.map((slide, i) => {
    if (!slide || typeof slide !== "object" || Array.isArray(slide)) return slide;
    const s = { ...(slide as Record<string, unknown>) };
    deleteNullKeys(s);
    if (s.slide_number == null && typeof s.index === "number") {
      s.slide_number = s.index;
    }
    if (s.slide_number == null) {
      s.slide_number = i + 1;
    }
    if (s.layout_variant == null && typeof s.role === "string") {
      s.layout_variant = s.role;
    }
    if (s.primary_copy == null && typeof s.headline === "string") {
      s.primary_copy = s.headline;
    }
    if (s.secondary_copy == null && typeof s.body === "string") {
      s.secondary_copy = s.body;
    }
    const slideCta = coerceCtaType(s.cta_type);
    if (slideCta != null) s.cta_type = slideCta;
    else delete s.cta_type;

    // swipe_trigger is required meta — never paint; fill from primary if LLM null
    if (typeof s.swipe_trigger !== "string" || !s.swipe_trigger.trim()) {
      const primary =
        typeof s.primary_copy === "string" ? s.primary_copy.trim() : "";
      s.swipe_trigger = primary
        ? `Что дальше про: ${primary.slice(0, 48)}?`
        : `Листай — слайд ${i + 1}`;
    }

    if (s.html_layout != null) {
      s.html_layout = normalizeHtmlLayoutRaw(s.html_layout);
    }

    delete s.index;
    delete s.role;
    delete s.headline;
    delete s.body;
    return s;
  });
  return obj;
}

function extractJsonCandidate(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Prefer fenced ```json … ``` then any ``` … ```
  const fencedJson =
    /```(?:json|JSON)\s*([\s\S]*?)```/.exec(trimmed) ??
    /```\s*([\s\S]*?)```/.exec(trimmed);
  if (fencedJson?.[1]) {
    const inner = fencedJson[1].trim();
    if (inner.startsWith("{")) return inner;
  }

  // Raw object: first `{` … last matching `}`
  const start = trimmed.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < trimmed.length; i++) {
    const ch = trimmed[i]!;
    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return trimmed.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * Extract fenced JSON or raw `{…}` from Scriptwriter/Designer chat text, then zod-parse.
 */
export function parseCarouselJsonFromText(text: string): CarouselHandoffJson {
  const candidate = extractJsonCandidate(text);
  if (!candidate) {
    throw new CarouselJsonParseError(
      "NO_JSON",
      "No JSON object found in text (expected fenced ```json or raw {…}).",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    throw new CarouselJsonParseError(
      "INVALID_JSON",
      "Found JSON-looking text but JSON.parse failed.",
    );
  }

  const normalized = normalizeRawCarouselObject(parsed);
  const result = carouselJsonSchema.safeParse(normalized);
  if (!result.success) {
    const detail = result.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    throw new CarouselJsonParseError(
      "SCHEMA",
      `Carousel JSON failed schema: ${detail}`,
    );
  }
  return result.data;
}

/**
 * Invariant: requested_slide_count === slides.length (user N only).
 * Throws CarouselJsonParseError COUNT_MISMATCH on failure.
 */
export function assertSlideCountMatches(
  json: CarouselHandoffJson,
): CarouselHandoffJson {
  const n = json.requested_slide_count;
  const len = json.slides.length;
  if (n !== len) {
    throw new CarouselJsonParseError(
      "COUNT_MISMATCH",
      `requested_slide_count (${n}) !== slides.length (${len}). Fix before Designer draw.`,
    );
  }
  return json;
}

/**
 * Sprint 9.7 — CTA catalog present on root or last/cta slide.
 * Does not rename keys; strengthens fail-job semantics.
 */
export function assertCarouselCtaCatalog(
  json: CarouselHandoffJson,
): CarouselHandoffJson {
  const last = json.slides[json.slides.length - 1];
  const lastIsCta =
    !!last &&
    /cta/i.test(last.layout_variant) &&
    typeof last.cta_type === "number";
  const rootOk =
    json.cta_type === 1 ||
    json.cta_type === 2 ||
    json.cta_type === 3 ||
    json.cta_type === 4;
  const anySlideCta = json.slides.some(
    (s) =>
      s.cta_type === 1 ||
      s.cta_type === 2 ||
      s.cta_type === 3 ||
      s.cta_type === 4,
  );
  if (!rootOk && !lastIsCta && !anySlideCta) {
    throw new CarouselJsonParseError(
      "SCHEMA",
      "Carousel CTA catalog missing: set cta_type 1–4 on root and/or cta slide before Draft.",
    );
  }
  return json;
}

/** Reject empty / whitespace-only visual_prompt (STRICT draw gate). */
export function assertCarouselVisualPrompts(
  json: CarouselHandoffJson,
): CarouselHandoffJson {
  const bad = json.slides.findIndex((s) => !s.visual_prompt?.trim());
  if (bad >= 0) {
    throw new CarouselJsonParseError(
      "SCHEMA",
      `slides[${bad}].visual_prompt required (non-empty) before Designer draw.`,
    );
  }
  return json;
}

/** S57 — secondary_copy required non-empty on every slide (zod + belt). */
export function assertCarouselSecondaryCopy(
  json: CarouselHandoffJson,
): CarouselHandoffJson {
  const bad = json.slides.findIndex((s) => !s.secondary_copy?.trim());
  if (bad >= 0) {
    throw new CarouselJsonParseError(
      "SCHEMA",
      `slides[${bad}].secondary_copy REQUIRED (practical 2–3 sentences) on every slide.`,
    );
  }
  return json;
}

/**
 * Wave layout-copy — body secondary_copy ≥220 chars AND ≥5 clauses (or ≥4 paras).
 * Soft on cover/cta (multi-beat OK shorter). Throws SCHEMA on thin body.
 */
export function assertCarouselSecondaryCopyWide(
  json: CarouselHandoffJson,
): CarouselHandoffJson {
  const MIN_CHARS = 220;
  const MIN_CLAUSES = 5;
  const MIN_PARAS = 4;
  for (let i = 0; i < json.slides.length; i++) {
    const s = json.slides[i]!;
    const role = (s.layout_variant ?? "").toLowerCase();
    if (/cover|cta/.test(role)) continue;
    const text = (s.secondary_copy ?? "").trim();
    const clauses = text
      .split(/(?<=[.!?…])\s+|;\s+|—\s+|–\s+|\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 12).length;
    const paras = text
      .split(/\n\s*\n|\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 20).length;
    const ok =
      text.length >= MIN_CHARS && (clauses >= MIN_CLAUSES || paras >= MIN_PARAS);
    if (!ok) {
      throw new CarouselJsonParseError(
        "SCHEMA",
        `slides[${i}].secondary_copy MUST be MUCH WIDER on body (≥${MIN_CHARS} chars AND ≥${MIN_CLAUSES} clauses or ≥${MIN_PARAS} paragraphs); got ${text.length} chars / ${clauses} clauses / ${paras} paras.`,
      );
    }
  }
  return json;
}

/**
 * Parse + count assert (+ optional CTA / visual gates).
 * Default: count only (backward compatible).
 * Create/draw STRICT path should pass `{ requireCta: true, requireVisualPrompts: true }`.
 */
export function parseAndAssertCarouselJson(
  text: string,
  opts?: {
    requireCta?: boolean;
    requireVisualPrompts?: boolean;
    requireSecondaryCopy?: boolean;
  },
): CarouselHandoffJson {
  let json = assertSlideCountMatches(parseCarouselJsonFromText(text));
  if (opts?.requireVisualPrompts) {
    json = assertCarouselVisualPrompts(json);
  }
  if (opts?.requireSecondaryCopy !== false) {
    // S57 default ON — secondary_copy required every slide
    json = assertCarouselSecondaryCopy(json);
  }
  if (opts?.requireCta) {
    json = assertCarouselCtaCatalog(json);
  }
  return json;
}

/** Full Create STRICT gate (handoff → draw / critic). */
export function parseAndAssertCarouselJsonStrict(
  text: string,
): CarouselHandoffJson {
  return parseAndAssertCarouselJson(text, {
    requireCta: true,
    requireVisualPrompts: true,
    requireSecondaryCopy: true,
  });
}
