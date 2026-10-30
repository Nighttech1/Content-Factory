/**
 * C-settings-design-md-carousel — Разборщик: image → structured DESIGN.md + HTML frame notes.
 * Export for Backend API route (Settings «Добавить новый дизайн»).
 * Safe-zone / Vernatun lock. Never log image bytes or API keys.
 */

import type { DesignFromImageResponse } from "@/lib/settings/design-library";

/** Vernatun carousel frame + Instagram safe-zone (open-carrusel / carousel-json-contract). */
export const VERNATUN_SAFE_ZONE = {
  width: 1080,
  height: 1350,
  top: 120,
  bottom: 160,
  left: 80,
  right: 80,
} as const;

/**
 * System prompt for vision/LLM: liked carousel frame → DESIGN.md + HTML companion.
 * Backend passes image as multimodal user content; this is system only.
 */
export const DESIGN_FROM_IMAGE_SYSTEM_PROMPT = [
  "## Роль — Разборщик дизайна (image → DESIGN.md)",
  "",
  "Ты извлекаешь **визуальную систему** из одного кадра Instagram-карусели 4:5 для Vernatun Content Factory.",
  "Выход — **структурированный DESIGN.md** + краткие **HTML frame notes** (safe-zone), не сценарий и не тексты слайдов.",
  "",
  "### Кадр и safe-zone (HARD)",
  `- Canvas: ${VERNATUN_SAFE_ZONE.width}×${VERNATUN_SAFE_ZONE.height} (4:5).`,
  `- Safe padding: top≥${VERNATUN_SAFE_ZONE.top}, bottom≥${VERNATUN_SAFE_ZONE.bottom}, sides≥${VERNATUN_SAFE_ZONE.left}/${VERNATUN_SAFE_ZONE.right}.`,
  "- Текст и ключевые UI-элементы — **внутри** safe-zone; края — атмосфера/фон.",
  "",
  "### Тон Vernatun",
  "- Dark luxury: глубокий surface, cognac / sun-gold accents, без stock purple и Inter-by-default.",
  "- Премиальный клуб / community — не инфобиз-лендинг.",
  "",
  "### Что извлечь",
  "1. Palette (hex): surface, primary, secondary, on-surface, outline, accents.",
  "2. Typography: display / body roles, approximate sizes, weight, tracking.",
  "3. Spacing / radius / elevation / glass or matte materials.",
  "4. Layout patterns: cover vs point vs CTA hierarchy.",
  "5. Do / Don't для копирования стиля в HTML-рендерере.",
  "",
  "### Запреты",
  "- Не выдумывай логотип URL / секреты / чужие бренды как «наш».",
  "- Не пиши полный copy слайда — только визуальные правила.",
  "- Не возвращай base64 картинки.",
  "",
  "### Формат ответа (строго)",
  "Верни **один** markdown-документ с двумя секциями:",
  "",
  "1) fenced block `design-md` — полный DESIGN.md (YAML frontmatter `name` + `colors:` + body).",
  "2) fenced block `html-frame` — краткие HTML/CSS notes: safe-zone padding, font stacks, CSS variables from palette.",
  "",
  "Пример каркаса:",
  "```design-md",
  "---",
  "name: Extracted Frame",
  "colors:",
  "  surface: '#111317'",
  "  primary: '#C25E28'",
  "---",
  "# Visual system",
  "...",
  "```",
  "",
  "```html-frame",
  "<!-- 1080x1350; padding: 120 80 160 80 -->",
  ":root { --cf-surface: #111317; --cf-primary: #C25E28; }",
  "...",
  "```",
].join("\n");

/** User text when image is attached as multimodal part (Backend). */
export const DESIGN_FROM_IMAGE_USER_INSTRUCTION = [
  "Разбери этот кадр карусели.",
  "Собери DESIGN.md + html-frame notes для Vernatun (safe-zone 1080×1350).",
  "Ответ строго в блоках design-md и html-frame.",
].join(" ");

export type ParsedDesignFromImage = {
  markdown: string;
  html: string;
  parseOk: boolean;
};

/**
 * Parse model reply into markdown + html companion.
 * Tolerant: accepts ```design-md / ```markdown / bare --- frontmatter.
 */
export function parseDesignFromImageReply(raw: string): ParsedDesignFromImage {
  const text = (raw ?? "").trim();
  if (!text) {
    return { markdown: "", html: "", parseOk: false };
  }

  const designFence =
    text.match(/```design-md\s*([\s\S]*?)```/i) ||
    text.match(/```markdown\s*([\s\S]*?)```/i);
  const htmlFence =
    text.match(/```html-frame\s*([\s\S]*?)```/i) ||
    text.match(/```html\s*([\s\S]*?)```/i);

  let markdown = designFence?.[1]?.trim() ?? "";
  let html = htmlFence?.[1]?.trim() ?? "";

  if (!markdown) {
    // Fallback: whole reply looks like DESIGN.md
    if (/^---\s*\n[\s\S]*?\n---/.test(text) || /^#\s+/m.test(text)) {
      markdown = text
        .replace(/```html-frame[\s\S]*?```/gi, "")
        .replace(/```html[\s\S]*?```/gi, "")
        .trim();
    }
  }

  if (!html) {
    html = [
      `<!-- Vernatun frame ${VERNATUN_SAFE_ZONE.width}x${VERNATUN_SAFE_ZONE.height} -->`,
      `/* safe-zone: top ${VERNATUN_SAFE_ZONE.top}, bottom ${VERNATUN_SAFE_ZONE.bottom}, left ${VERNATUN_SAFE_ZONE.left}, right ${VERNATUN_SAFE_ZONE.right} */`,
      ":root { /* fill from DESIGN.md colors */ }",
    ].join("\n");
  }

  const parseOk = markdown.trim().length > 40;
  return { markdown: markdown.trim(), html: html.trim(), parseOk };
}

/**
 * Build API-ready DesignFromImageResponse from LLM text.
 * `source` set by caller (live vs soft mock).
 */
export function toDesignFromImageResponse(
  raw: string,
  source: "live" | "mock",
  nameHint?: string,
): DesignFromImageResponse {
  const parsed = parseDesignFromImageReply(raw);
  return {
    markdown: parsed.markdown,
    html: parsed.html,
    source,
    name: nameHint?.trim() || "DESIGN.md",
  };
}

/**
 * Soft mock when aggregator key missing — Vernatun-shaped stub (not empty).
 * Backend may use for 200 soft-fail; Frontend still gets appendable slot.
 */
export function mockDesignFromImageResponse(
  nameHint = "DESIGN.md",
): DesignFromImageResponse {
  const markdown = [
    "---",
    "name: Vernatun Extract Stub",
    "colors:",
    "  surface: '#111317'",
    "  surface-container: '#1e2023'",
    "  on-surface: '#e2e2e6'",
    "  primary: '#C25E28'",
    "  secondary: '#E6B25A'",
    "  outline: '#a48c81'",
    "---",
    "",
    "# Visual system (stub)",
    "",
    "Dark luxury Vernatun frame. Replace via live vision parse when aggregator key is set.",
    "",
    "## Safe-zone",
    `- ${VERNATUN_SAFE_ZONE.width}×${VERNATUN_SAFE_ZONE.height}`,
    `- padding top ${VERNATUN_SAFE_ZONE.top} / bottom ${VERNATUN_SAFE_ZONE.bottom} / sides ${VERNATUN_SAFE_ZONE.left}`,
    "",
    "## Typography",
    "- Display: expressive serif or club display (not Inter).",
    "- Body: clean grotesque, high contrast on dark surface.",
  ].join("\n");

  const html = [
    `<!-- ${VERNATUN_SAFE_ZONE.width}x${VERNATUN_SAFE_ZONE.height} -->`,
    `:root {`,
    `  --cf-surface: #111317;`,
    `  --cf-primary: #C25E28;`,
    `  --cf-secondary: #E6B25A;`,
    `  --cf-on-surface: #e2e2e6;`,
    `  --cf-safe-top: ${VERNATUN_SAFE_ZONE.top}px;`,
    `  --cf-safe-bottom: ${VERNATUN_SAFE_ZONE.bottom}px;`,
    `  --cf-safe-x: ${VERNATUN_SAFE_ZONE.left}px;`,
    `}`,
  ].join("\n");

  return { markdown, html, source: "mock", name: nameHint };
}
