/**
 * Variant A — Art Director (pipeline agent) prompts + verdict helpers (AI Bridge).
 * After carousel finals ready → critique once → approve | remarks.
 * HARD: NO remake / redraw / re-composite instructions or enqueue hints.
 *
 * Pair: `.cursor/skills/art-director/critique-checklist.md` · carousel-json-contract ArtDirectorVerdict.
 * Wave 2026-10-18: default vision = Gemini (ART_DIRECTOR_MODEL | google/gemini-2.5-flash).
 */

import {
  ART_DIRECTOR_VERDICT_SCHEMA_HINT,
  parseArtDirectorVerdictFromText,
  type ArtDirectorVerdict,
  type HtmlLayout,
} from "@/lib/studio/carousel-json-contract";

/** Mesh / Team display name. */
export const ART_DIRECTOR_AGENT_ID = "art-director";
export const ART_DIRECTOR_DISPLAY_NAME = "Арт-директор";

/**
 * Default Art Director vision model (aggregator id).
 * Env `ART_DIRECTOR_MODEL` wins. Backend `art-director-run` should import this —
 * do **not** silently default to openai/gpt-4o when PNGs exist.
 */
export const ART_DIRECTOR_DEFAULT_MODEL = "google/gemini-2.5-flash";

/** Acceptable Gemini alts if flash unavailable (Backend may try). */
export const ART_DIRECTOR_GEMINI_MODEL_ALTS = [
  "google/gemini-2.5-flash",
  "google/gemini-2.0-flash",
] as const;

/**
 * Resolve Art Director model: ART_DIRECTOR_MODEL → Gemini flash default.
 * Does not read CAROUSEL_VISION_MODEL (that path historically fell through to gpt-4o).
 */
export function resolveArtDirectorModel(
  envModel?: string | null,
): string {
  const fromEnv = (envModel ?? process.env.ART_DIRECTOR_MODEL ?? "").trim();
  if (fromEnv) return fromEnv;
  return ART_DIRECTOR_DEFAULT_MODEL;
}

/**
 * Compressed critique checklist (from art-director/critique-checklist.md).
 * Keep in sync when Trainer updates the skill checklist.
 */
export const ART_DIRECTOR_CHECKLIST_COMPRESSED = [
  "1. VIRALITY: cover stops thumb ≤2s; curiosity gap; mid slides earn swipe; swipe_trigger META only (never painted).",
  "2. DESIGN CRAFT: one focal; headline>body>chrome; accent highlights sparingly; safe margins (~120/160/80); one visual world.",
  "3. CONTENT COMPLETENESS (HARD · secondary_copy_wide): body slides need MUCH wider secondary_copy — ≥220 chars AND ≥5 clauses (or ≥4 short paragraphs) with steps/example/micro-story.",
  "   Thin 1–3 sentence stubs / water without proof → remarks **P0/P1** category=copy (or hierarchy).",
  "4. Continuity: type/color/brand/character identity across slides; slide nums N/M in own slot **only if** layoutMap/etalon allows (omit when numbering absent).",
  "5. TOKEN CARD vs vision_ref: on styleCopyMode=token_card — HTML type must honor DESIGN fonts+sizes+colors (ignored palette / mud → remarks). On styleCopyMode=vision_ref — composition must hard-copy etalon; forcing a stock type spreadsheet OR forced full-bleed when etalon is inset → remarks layout P0/P1.",
  "6. BRAND LOGO: when Brand has a logo → logo <img>; mirror layoutMap/etalon chrome when present, else **bottom-RIGHT** + name **beside** icon → else remarks brand P0/P1.",
  "7. LAYOUT MAP / VARIETY / vision_ref: when layoutMap present — fighting map anchors / inventing numbers when absent → remarks layout P0/P1. Without map and not vision_ref — adjacent slides must vary anchors. On vision_ref — layoutMap NOT required; yield to etalon rhythm.",
  "8. S57 layered: text/logo/CTA on HTML; bg NO letters/logos (except in_image conductor allowed); CTA 1–4 on cta_slide; Brand chrome when etalon/Settings expect it.",
  "9. CHARACTER CONDUCTOR: character speaks text / to-camera — not story actor in plot. Product default paint = in_image. Wrong path (cutout baked into bg on overlay_cutout; missing cover+last cutout when overlay_cutout; treating overlay_cutout as default) → remarks character P0/P1.",
  "10. Mobile IG craft: phone-readable; 4:5 1080×1350; copy not under busy photo.",
  "11. Anti-slop: no purple glow hero; no Inter-default when brand fonts exist; no catalog-outside CTA.",
  "12. vision_ref partial bg: etalon inset/letterbox photo forced to full-bleed cover → remarks layout P0/P1 (bgFit contain|mask expected).",
].join("\n");

/** System prompt — Gemini vision preferred; force JSON verdict; NO remake. */
export const ART_DIRECTOR_SYSTEM_PROMPT = [
  "Ты — Арт-директор Vernatun Content Factory (pipeline agent, не Cursor Клиент).",
  "Ты смотришь ГОТОВУЮ карусель (финальные PNG 4:5 после layered HTML composite) через **Gemini vision** (по умолчанию).",
  "Модель: env ART_DIRECTOR_MODEL или google/gemini-2.5-flash — критикуй **пиксели + смысл**, не только сценарий текстом.",
  "",
  "### HARD LOCKS",
  "- **Не запускай перерисовку. NO REMAKE.** Только verdict. Запрещено: remake, redraw, re-composite, «перерисуй», «запусти Designer», enqueue jobs, second draw.",
  "- Approve ≠ публикация в соцсети (HITL / Публицист отдельно).",
  "- S57 keep: image bg + HTML overlay — критикуй результат, не меняй render mode.",
  "- Если слайдов/PNG нет — verdict=remarks, category=missing_assets, severity=P0. Не фейковый approve.",
  "",
  "### Critique axes (все обязательны)",
  "1. **Virality / swipe craft** — hook, mid value, fatigue.",
  "2. **Design craft** — hierarchy, safe-zone, logo chrome; on token_card honor DESIGN colors/fonts/sizes; on vision_ref hard-copy etalon (not stock spreadsheet); layoutMap optional on vision_ref.",
  "3. **Content completeness + ПОЛНОТА ТЕМЫ (HARD)** — тема ОБЯЗАНА быть раскрыта максимально информативно и конкретно за заданное число слайдов: каждый слайд несёт отдельную порцию пользы (конкретные места/имена/шаги/критерии), вместе они покрывают тему без дыр и воды. Тонкий body secondary_copy (<220 chars или <5 clauses) ИЛИ пустой «красивый» слайд без конкретики/новой инфы → **remarks P0/P1** category=copy.",
  "4. **Conductor / paint path** — product default in_image; non-conductor story actor; wrong overlay_cutout as default; missing cover+last cutout when overlay_cutout → remarks.",
  "5. **Partial bg (vision_ref)** — forced full-bleed when etalon inset → remarks.",
  "6. **BAKE ARTIFACT / OVERLAY (HARD, naked-eye)** — у запечённых элементов (vocab-pill, BR-стрелка, CTA-кнопка) НЕ должно быть: серой/нейтральной подложки позади pill; горизонтальных штрихов / «шлейфа» / полос вокруг стрелки; тёмного ореола широкой каймой; грязных/рваных краёв; плашка/pill НЕ должна налезать на CTA-кнопку, другую плашку или текст. Любое такое → remarks P1 category=design (на re-bake, без redraw).",
  "",
  "### Checklist (brutal)",
  ART_DIRECTOR_CHECKLIST_COMPRESSED,
  "",
  "### Verdict rules",
  "- Любой P0 или P1 → verdict=\"remarks\" (never approve).",
  "- Только мягкие P2 или ноль замечаний → verdict=\"approve\", remarks=[].",
  "- summary: 1–3 предложения на русском (virality + design + completeness + conductor).",
  "- remarks[].note: конкретный fix hint (≥8 символов), не «сделай красивее» — но **без** инструкций «перерисуй / запусти Designer».",
  "- Flag: ignored DESIGN on token_card · stock spreadsheet apply on vision_ref · forced full-bleed · grammar fight vs layoutMap · numbers when absent · logo wrong · thin secondary_copy · wrong paint path · non-conductor.",
  "- ЛОГО (смягчение): remarks про лого ТОЛЬКО при РЕАЛЬНОМ наложении глифов заголовка/текста НА лого (перекрытие, нечитаемость). Близость заголовка к зоне лого с видимым зазором БЕЗ перекрытия — НЕ дефект, не выписывай logo-remark.",
  "- sequenceNotes: опционально про дугу / swipe fatigue.",
  "- score: опционально 0–100 (вкус), не триггерит remake.",
  "",
  "### Output",
  ART_DIRECTOR_VERDICT_SCHEMA_HINT,
  "Ответь ТОЛЬКО fenced ```json … ``` с объектом вердикта (без prose remake-плана).",
].join("\n");

export type ArtDirectorSlideMeta = {
  slideIndex: number;
  /** File path or public URL to final PNG. */
  pngUrlOrPath: string;
  layout_variant?: string;
  primary_copy?: string;
  secondary_copy?: string;
  cta_type?: 1 | 2 | 3 | 4;
  html_layout?: HtmlLayout | null;
  template?: string;
};

export type ArtDirectorReviewInput = {
  slides: ArtDirectorSlideMeta[];
  /** Short brief / idea / hook for context (no secrets). */
  briefMeta?: {
    idea?: string;
    hook?: string;
    mode?: string;
    renderMode?: string;
    brandName?: string;
    /** vision_ref | token_card — changes critique bar for tokens vs etalon. */
    styleCopyMode?: "vision_ref" | "token_card" | string;
    /** Product default in_image; overlay_cutout = legacy. */
    characterPaint?: "in_image" | "overlay_cutout" | "none" | string;
  };
};

/**
 * User payload for vision/LLM — ordered slides + short meta.
 * Backend attaches images as multimodal parts when aggregator supports vision.
 */
export function buildArtDirectorUserPayload(input: ArtDirectorReviewInput): string {
  const meta = input.briefMeta ?? {};
  const lines: string[] = [
    "## Карусель на ревью (финальные PNG · Gemini vision)",
    "",
    `Слайдов: ${input.slides.length}`,
    meta.idea ? `idea: ${meta.idea}` : "",
    meta.hook ? `hook: ${meta.hook}` : "",
    meta.mode ? `mode: ${meta.mode}` : "",
    meta.renderMode ? `renderMode: ${meta.renderMode}` : "renderMode: layered_html",
    meta.brandName ? `brand: ${meta.brandName}` : "",
    meta.styleCopyMode ? `styleCopyMode: ${meta.styleCopyMode}` : "",
    meta.characterPaint
      ? `characterPaint: ${meta.characterPaint}`
      : "characterPaint: in_image (product default)",
    "",
    "Оцени virality + design craft + content completeness + conductor/paint path по PNG.",
    "Тонкие body (secondary_copy <220 chars / <5 clauses / без example) → remarks P0/P1.",
    "layoutMap fight / numbers when absent / logo wrong / non-conductor / wrong paint path → remarks.",
    "If styleCopyMode=vision_ref: fail stock-spreadsheet type look + forced full-bleed vs inset etalon; layoutMap NOT required.",
    "",
    "### Slides (порядок обязателен)",
  ];

  for (const s of input.slides) {
    const template =
      s.template ??
      s.html_layout?.template ??
      "(template unknown)";
    lines.push(
      [
        `- slide ${s.slideIndex}:`,
        `  png: ${s.pngUrlOrPath}`,
        s.layout_variant ? `  role: ${s.layout_variant}` : "",
        `  template: ${template}`,
        s.cta_type != null ? `  cta_type: ${s.cta_type}` : "",
        s.primary_copy ? `  primary: ${s.primary_copy}` : "",
        s.secondary_copy
          ? `  secondary: ${s.secondary_copy.slice(0, 160)}${s.secondary_copy.length > 160 ? "…" : ""}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  lines.push(
    "",
    "Просмотри последовательность PNG. Верни JSON verdict.",
    "**Не запускай перерисовку. Только verdict. NO REMAKE.**",
  );

  return lines.filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n");
}

/**
 * Build chat messages for Backend / aggregator (text path).
 * Vision: Backend may replace/augment user content with image parts using pngUrlOrPath.
 */
export function buildArtDirectorReviewMessages(input: ArtDirectorReviewInput): {
  system: string;
  user: string;
} {
  return {
    system: ART_DIRECTOR_SYSTEM_PROMPT,
    user: buildArtDirectorUserPayload(input),
  };
}

/**
 * Parse LLM text → ArtDirectorVerdict (zod STRICT + P0/P1 harden).
 * Alias: issues[] → remarks[].
 */
export function parseArtDirectorReviewResponse(text: string): ArtDirectorVerdict {
  return parseArtDirectorVerdictFromText(text);
}

/**
 * Convenience: input slides + raw LLM reply → structured verdict.
 * Does NOT call LLM and does NOT enqueue remake.
 */
export function reviewArtDirectorFromLlmText(
  input: ArtDirectorReviewInput,
  llmText: string,
): ArtDirectorVerdict {
  if (!input.slides.length) {
    return {
      verdict: "remarks",
      summary: "Нет финальных слайдов для ревью — ассеты отсутствуют.",
      remarks: [
        {
          slideIndex: 1,
          category: "missing_assets",
          severity: "P0",
          note: "Передай slide_0N.png пути/URL Арт-директору; без PNG approve запрещён.",
        },
      ],
      score: 0,
    };
  }
  return parseArtDirectorReviewResponse(llmText);
}

/** Flatten remarks for inspector / issues[] consumers. */
export function artDirectorIssuesFromVerdict(
  verdict: ArtDirectorVerdict,
): ArtDirectorVerdict["remarks"] {
  return verdict.remarks ?? [];
}

/** True if Backend may show green approve chip (no P0/P1). */
export function isArtDirectorApproved(verdict: ArtDirectorVerdict): boolean {
  return verdict.verdict === "approve";
}
