/**
 * C-visual-style-deconstructor — AI Bridge vision→DesignPresetFile+DESIGN.md helpers.
 * Backend route should call `deconstructStyle` from `@/lib/studio/deconstruct-style`
 * (live vision) or use these parsers/prompts for custom wiring.
 *
 * Soft-fail → golden mock; never wipe library. Never log image bytes / API keys.
 */

import {
  buildHtmlKitFromPreset,
  createBentoGlassSeedPreset,
  createDarkNotesSeedPreset,
  parseDesignPresetFile,
  parseLayoutMap,
  presetFileFromMarkdown,
  type DeconstructStyleResponse,
  type DesignPresetFile,
  type DesignPresetId,
  type LayoutMap,
} from "@/lib/settings/design-preset";
import { VERNATUN_SAFE_ZONE } from "@/lib/studio/design-from-image-prompts";

export type { DeconstructStyleResponse, DesignPresetFile, LayoutMap };

/** Ordered roles for DesignSlot 4-up grid (cover · midA · midB · cta). */
export const DECONSTRUCT_GRID_ROLES = [
  "cover",
  "body_slide",
  "body_slide",
  "cta_slide",
] as const;

export type DeconstructStyleInput = {
  nameHint?: string;
  preferPreset?: DesignPresetId;
  slotId?: string;
  referenceImageUrl?: string;
  /**
   * Wave layout-copy: when true / when Backend attaches 4 refs,
   * emit layoutMap (text anchors, numbering, logo/CTA chrome).
   */
  gridMode?: boolean;
  /** Explicit ref count hint (4 = grid layoutMap required). */
  referenceCount?: number;
};

/** System prompt — Backend attaches image(s) as multimodal user content. */
export const DECONSTRUCT_STYLE_SYSTEM_PROMPT = [
  "## Роль — Visual Style Deconstructor",
  "",
  "Ты извлекаешь **визуальную систему** из референса Instagram-карусели (панорама N кадров OK как **вход**).",
  "Выход — typed **DesignPresetFile** + **DESIGN.md** для Vernatun Create/Designer.",
  "Product preview после разбора = **нарезанные 4:5**, не панорама.",
  "",
  "### Canvas",
  `- ${VERNATUN_SAFE_ZONE.width}×${VERNATUN_SAFE_ZONE.height}; safe: top≥${VERNATUN_SAFE_ZONE.top}, bottom≥${VERNATUN_SAFE_ZONE.bottom}, sides≥${VERNATUN_SAFE_ZONE.left}.`,
  "",
  "### Ближайший preset (HARD)",
  "Выбери ровно один `preset`:",
  "- `dark_notes` — charcoal chalkboard, yellow marker tape, doodles, hand checkboxes, seamless yellow arrows, pomegranate.",
  "- `bento_glass` — dark glass cards / bento, gold-amber glow, timers/gauges optional, gold CTA.",
  "- `dark_editorial` — cinematic photo cover + telemetry + gold CTA (близко к bento_glass).",
  "- `bold_poster` — high-contrast poster type, solid blocks, minimal chrome.",
  "",
  "### Что извлечь (HARD · deconstruct_verify · colors + fonts + sizes)",
  "1. **ColorTokens (REQUIRED):** bg, surface, text, muted, accent, accentSoft? — hex/CSS for each.",
  "2. **TypographyTokens (REQUIRED):**",
  "   - families: display (title), body, mono?, armenianSafe?",
  "   - **scale (REQUIRED sizes):** cover (title px), h2, body, caption (content px) — numeric px from the reference.",
  "3. ComponentPrimitiveConfig: card/glass, markerHighlight, doodle, checkbox, gauge, buttonCta, logoMark, **seamlessConnector**.",
  "4. cssVarOverrides extras (`--cf-design-*`).",
  "",
  "### layoutMap — 4-ref grid (HARD · grid_layout_map · when 4 slides attached)",
  "When Backend sends **exactly 4** reference frames ordered **cover · midA · midB · cta**, ALSO emit `layoutMap` inside design-preset-json:",
  "```json",
  "{",
  '  "layoutMap": {',
  '    "slides": [',
  "      {",
  '        "role": "cover|body_slide|cta_slide",',
  '        "textAnchor": { "x": "left|center|right", "y": "top|middle|bottom" },',
  '        "numbering": { "present": false, "format": "pretty_N_M|digits_only|corner_badge|omit", "position": "…", "style": "…", "slot": "…|absent" },',
  '        "logoChrome": { "present": true, "slot": "bottom-right|top-right|top-left|absent" },',
  '        "ctaChrome": { "present": false, "slot": "bottom|center|absent" }',
  "      }",
  "    ],",
  '    "numberingGlobal": "absent|pretty_N_M|digits_only|corner_badge",',
  '    "grammarNote": "short human note of repeated rhythm"',
  "  }",
  "}",
  "```",
  "- **4 slides required** in `layoutMap.slides` (roles: cover, body_slide, body_slide, cta_slide).",
  "- Per role: text_block **anchor** (x/y), numbering `{present, format, position, style}` **or** `present:false` / omit.",
  "- Logo + CTA chrome **positions** (present + slot) per slide — CTA usually only on last.",
  "- If **no** slide numbers visible on any ref → `numbering.present: false` everywhere + `numberingGlobal: \"absent\"`.",
  "- Generation will **mirror** this grammar; invent content/bg/CTA only — do NOT invent numbers when refs have none.",
  "- Single-image / non-grid deconstruct: layoutMap optional; still always emit colors+fonts+sizes.",
  "",
  "### FAIL if missing",
  "- Colors-only stub **without** typography.scale sizes = FAIL — always emit cover/h2/body/caption numbers.",
  "- Families without hex colors = FAIL.",
  "- 4-ref grid without `layoutMap` (4 slides + numberingGlobal) = FAIL.",
  "- DESIGN.md must mention colors + font families + size roles so Designer FULL inject works.",
  "",
  "### Формат ответа (строго)",
  "Один ответ с fenced-блоками:",
  "",
  "1) ```design-preset-json — полный JSON DesignPresetFile (без image bytes) **with colors + typography.scale** (+ **layoutMap** on 4-ref grid).",
  "2) ```design-md — полный DESIGN.md (YAML frontmatter + body для coding agents) including size table (+ short layout grammar note when layoutMap present).",
  "3) опционально ```html-frame — CSS vars + safe-zone notes.",
  "",
  "### Запреты",
  "- Не возвращай base64 / секреты / чужие логотипы как «наш».",
  "- Не пиши carousel Scriptwriter slides[] JSON.",
  "- Не предлагай panorama JPG как deliverable preview.",
  "- Не отдавай palette без sizes (Designer needs FULL role table).",
  "- Не выдумывай slide numbers когда на рефах их нет.",
].join("\n");

export const DECONSTRUCT_STYLE_USER_INSTRUCTION = [
  "Разбери этот референс карусели.",
  "Верни design-preset-json + design-md (и при необходимости html-frame).",
  "MUST include: colors (bg/text/accent/muted/…) + font families (display/body) + typography.scale sizes (cover/h2/body/caption px).",
  "Map к ближайшему DesignPresetId; сохрани marker/doodle/glass/seamlessConnector если видны.",
].join(" ");

/** User instruction when Backend attaches 4 ordered refs (cover·midA·midB·cta). */
export const DECONSTRUCT_GRID_USER_INSTRUCTION = [
  "Разбери **4** референс-слайда карусели в порядке: 1=cover · 2=midA · 3=midB · 4=CTA.",
  "Верни design-preset-json + design-md.",
  "MUST include: colors + font families + typography.scale (cover/h2/body/caption px).",
  "MUST include **layoutMap** with exactly 4 slides (roles cover / body_slide / body_slide / cta_slide):",
  "textAnchor per role, numbering {present, format, position, style} or absent, logoChrome + ctaChrome slots, numberingGlobal, grammarNote.",
  "If refs show NO slide numbers → numberingGlobal=\"absent\" and numbering.present=false on every slide.",
  "Map к ближайшему DesignPresetId; сохрани glass/marker/doodle/seamlessConnector если видны.",
].join(" ");

/**
 * Pick user instruction for Backend vision call.
 * Prefer grid instruction when gridMode or referenceCount≥4.
 */
export function resolveDeconstructUserInstruction(
  opts?: DeconstructStyleInput,
): string {
  if (opts?.gridMode || (opts?.referenceCount != null && opts.referenceCount >= 4)) {
    return DECONSTRUCT_GRID_USER_INSTRUCTION;
  }
  return DECONSTRUCT_STYLE_USER_INSTRUCTION;
}

export type ParsedDeconstructReply = {
  presetFile: DesignPresetFile | null;
  markdown: string;
  html: string;
  parseOk: boolean;
};

/** Vernatun-safe default scale when LLM omits typography.scale (deconstruct_verify). */
export const DECONSTRUCT_FALLBACK_SCALE = {
  cover: 48,
  h2: 32,
  body: 22,
  caption: 16,
} as const;

/**
 * Ensure DesignPresetFile has colors + font families + typography.scale sizes.
 * Soft-fills missing scale from golden seed / fallback — never colors-only stub.
 * Preserves layoutMap when present (grid deconstruct).
 */
export function ensureDeconstructFullTokens(
  preset: DesignPresetFile,
  opts?: DeconstructStyleInput,
): DesignPresetFile {
  const seed =
    opts?.preferPreset === "bento_glass"
      ? createBentoGlassSeedPreset()
      : createDarkNotesSeedPreset();
  const scale = preset.typography.scale;
  const hasScale =
    scale &&
    typeof scale === "object" &&
    (typeof scale.cover === "number" ||
      typeof scale.body === "number" ||
      typeof scale.h2 === "number" ||
      typeof scale.caption === "number");
  const nextScale = hasScale
    ? {
        cover: scale.cover ?? seed.typography.scale?.cover ?? DECONSTRUCT_FALLBACK_SCALE.cover,
        h2: scale.h2 ?? seed.typography.scale?.h2 ?? DECONSTRUCT_FALLBACK_SCALE.h2,
        body: scale.body ?? seed.typography.scale?.body ?? DECONSTRUCT_FALLBACK_SCALE.body,
        caption:
          scale.caption ??
          seed.typography.scale?.caption ??
          DECONSTRUCT_FALLBACK_SCALE.caption,
      }
    : {
        ...(seed.typography.scale ?? DECONSTRUCT_FALLBACK_SCALE),
      };

  return {
    ...preset,
    colors: {
      bg: preset.colors.bg || seed.colors.bg,
      surface: preset.colors.surface || seed.colors.surface,
      text: preset.colors.text || seed.colors.text,
      muted: preset.colors.muted || seed.colors.muted,
      accent: preset.colors.accent || seed.colors.accent,
      accentSoft: preset.colors.accentSoft ?? seed.colors.accentSoft,
    },
    typography: {
      ...preset.typography,
      display: preset.typography.display || seed.typography.display,
      body: preset.typography.body || seed.typography.body,
      scale: nextScale,
    },
    // Preserve layoutMap from grid deconstruct (never drop on soft-fill)
    ...(preset.layoutMap ? { layoutMap: preset.layoutMap } : {}),
  };
}

/** True when layoutMap has ≥4 slides and numberingGlobal set (G3 / grid_layout_map). */
export function hasValidLayoutMap(preset: DesignPresetFile | null | undefined): boolean {
  const map = preset?.layoutMap;
  if (!map || !Array.isArray(map.slides) || map.slides.length < 4) return false;
  return typeof map.numberingGlobal === "string" && map.numberingGlobal.length > 0;
}

/**
 * Merge a separately parsed layoutMap onto a preset (Backend may send companion JSON).
 * Soft — returns original preset if map invalid.
 */
export function attachLayoutMapToPreset(
  preset: DesignPresetFile,
  layoutMapRaw: unknown,
): DesignPresetFile {
  const map = parseLayoutMap(layoutMapRaw);
  if (!map) return preset;
  return { ...preset, layoutMap: map };
}

/**
 * Parse vision/LLM reply into DesignPresetFile + DESIGN.md.
 * Tolerant of missing fields — fills from nearest golden seed.
 */
export function parseDeconstructStyleReply(
  raw: string,
  opts?: DeconstructStyleInput,
): ParsedDeconstructReply {
  const text = (raw ?? "").trim();
  if (!text) {
    return { presetFile: null, markdown: "", html: "", parseOk: false };
  }

  const jsonFence =
    text.match(/```design-preset-json\s*([\s\S]*?)```/i) ||
    text.match(/```json\s*([\s\S]*?"preset"\s*:[\s\S]*?)```/i);
  const mdFence =
    text.match(/```design-md\s*([\s\S]*?)```/i) ||
    text.match(/```markdown\s*([\s\S]*?)```/i);
  const htmlFence =
    text.match(/```html-frame\s*([\s\S]*?)```/i) ||
    text.match(/```html\s*([\s\S]*?)```/i);

  let markdown = mdFence?.[1]?.trim() ?? "";
  let html = htmlFence?.[1]?.trim() ?? "";
  let presetFile: DesignPresetFile | null = null;

  if (jsonFence?.[1]) {
    try {
      const parsed = JSON.parse(jsonFence[1].trim()) as Record<
        string,
        unknown
      >;
      if (opts?.slotId && typeof parsed.id !== "string") {
        parsed.id = opts.slotId;
      }
      if (opts?.nameHint && typeof parsed.name !== "string") {
        parsed.name = opts.nameHint;
      }
      if (!parsed.designMd && markdown) parsed.designMd = markdown;
      presetFile = parseDesignPresetFile(parsed);
      if (presetFile && opts?.referenceImageUrl) {
        presetFile = {
          ...presetFile,
          referenceImageUrl:
            presetFile.referenceImageUrl ?? opts.referenceImageUrl,
        };
      }
    } catch {
      presetFile = null;
    }
  }

  if (!markdown) {
    if (/^---\s*\n[\s\S]*?\n---/.test(text) || /^#\s+/m.test(text)) {
      markdown = text
        .replace(/```design-preset-json[\s\S]*?```/gi, "")
        .replace(/```json[\s\S]*?```/gi, "")
        .replace(/```html-frame[\s\S]*?```/gi, "")
        .replace(/```html[\s\S]*?```/gi, "")
        .trim();
    }
  }

  if (!presetFile && markdown.trim().length > 40) {
    presetFile = presetFileFromMarkdown({
      markdown,
      name: opts?.nameHint,
      id: opts?.slotId,
      referenceImageUrl: opts?.referenceImageUrl,
    });
    if (opts?.preferPreset) {
      presetFile = { ...presetFile, preset: opts.preferPreset };
    }
  }

  if (presetFile && !markdown) {
    markdown = presetFile.designMd;
  }

  if (!html && presetFile) {
    html = buildHtmlKitFromPreset(presetFile);
  }

  const parseOk = Boolean(presetFile && markdown.trim().length > 40);
  return {
    presetFile,
    markdown: markdown.trim(),
    html: html.trim(),
    parseOk,
  };
}

/**
 * Soft mock when aggregator key missing / vision fail.
 * Returns golden dark_notes (or preferPreset seed) — never empty.
 */
export function mockDeconstructStyleResponse(
  opts?: DeconstructStyleInput,
): DeconstructStyleResponse {
  const prefer = opts?.preferPreset;
  const hint = (opts?.nameHint ?? "").toLowerCase();
  let base: DesignPresetFile;
  if (
    prefer === "bento_glass" ||
    /bento|glass|telemetry/.test(hint)
  ) {
    base = createBentoGlassSeedPreset({
      id: opts?.slotId,
      name: opts?.nameHint,
    });
  } else if (
    prefer === "dark_notes" ||
    /notes|chalk|marker|doodle/.test(hint)
  ) {
    base = createDarkNotesSeedPreset({
      id: opts?.slotId,
      name: opts?.nameHint,
    });
  } else {
    base = createDarkNotesSeedPreset({
      id: opts?.slotId ?? `mock-seed-dark-notes-${Date.now().toString(36)}`,
      name: opts?.nameHint,
    });
  }

  const presetFile = ensureDeconstructFullTokens(
    {
      ...base,
      referenceImageUrl: opts?.referenceImageUrl ?? base.referenceImageUrl,
    },
    opts,
  );

  return {
    presetFile,
    markdown: presetFile.designMd,
    html: buildHtmlKitFromPreset(presetFile),
    source: "mock",
  };
}

/**
 * Build API response from LLM text. Caller sets source live|mock.
 * On parse fail → soft mock from golden seeds (never empty wipe).
 */
export function toDeconstructStyleResponse(
  raw: string,
  source: "live" | "mock",
  opts?: DeconstructStyleInput,
): DeconstructStyleResponse {
  const parsed = parseDeconstructStyleReply(raw, opts);
  if (parsed.parseOk && parsed.presetFile) {
    const presetFile = ensureDeconstructFullTokens(parsed.presetFile, opts);
    return {
      presetFile,
      markdown: parsed.markdown || presetFile.designMd,
      html: parsed.html || buildHtmlKitFromPreset(presetFile),
      source,
    };
  }
  return mockDeconstructStyleResponse(opts);
}

/**
 * Pure helper for Backend: prefer live parse, else mock.
 * Does **not** call LLM — Backend supplies `rawModelText` after vision call.
 */
export function deconstructStyleFromModelText(
  rawModelText: string | null | undefined,
  opts?: DeconstructStyleInput & { forceMock?: boolean },
): DeconstructStyleResponse {
  if (opts?.forceMock || !rawModelText?.trim()) {
    return mockDeconstructStyleResponse(opts);
  }
  return toDeconstructStyleResponse(rawModelText, "live", opts);
}

/** List golden seeds for Backend seed-on-empty job. */
export function listFactorySeedPresets(): DesignPresetFile[] {
  return [createDarkNotesSeedPreset(), createBentoGlassSeedPreset()];
}
