/**
 * Sprint 9.8 + C-audit-02 — Claude-Code carousel pack with FULL golden JSON few-shots.
 * Injected into existing agent-start (does NOT replace mesh agents).
 */

import { CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY } from "@/lib/studio/create-carousel-prompts";
import { CAROUSEL_JSON_SCHEMA_HINT } from "@/lib/studio/carousel-json-contract";

/** Fixture ids (full bodies embedded below — not name-only). */
export const SPRINT9_CAROUSEL_FEWSHOT_IDS = [
  "dark_notes_coffee",
  "bento_glass_metrics",
  "dark_editorial_night",
  "bold_poster_invite",
] as const;

/** Embedded from memory/fixtures/sprint9/carousel/dark_notes_coffee/handoff.json */
const FEWSHOT_DARK_NOTES_COFFEE = {
  contentType: "carousel",
  project: "vernatun",
  content_id: "golden-dark-notes-coffee",
  requested_slide_count: 3,
  idea: "Утренний ритуал клуба: кофе + честный разговор вместо инфобиз-советов",
  hook: "Кофе врёт?",
  tone: "vernatun",
  cta_type: 4,
  slides: [
    {
      slide_number: 1,
      layout_variant: "cover",
      primary_copy: "Кофе врёт?",
      secondary_copy: "",
      swipe_trigger:
        "META: curiosity — зритель хочет узнать, что именно врёт кофе про «продуктивность»",
      visual_prompt:
        "dark_notes chalk grid charcoal wall, yellow marker underline under empty coffee cup outline, soft steam doodle crossing right cut, Vernatun pomegranate mark tiny bottom-left, warm side light, no purple glow",
      alt_text: "Меловая доска с чашкой кофе и вопросом",
    },
    {
      slide_number: 2,
      layout_variant: "point",
      primary_copy: "Ритуал важнее рецепта",
      secondary_copy:
        "В Vernatun кофе — пауза, чтобы услышать друг друга. Не «система на 6 фигур».",
      swipe_trigger:
        "META: proof beat — зритель листает за конкретным жестом клуба",
      visual_prompt:
        "dark_notes checklist boxes hand-drawn, yellow marker highlight on one checked line, coffee steam bridge arrow continuing from slide 1, charcoal texture, warm amber accent only",
      alt_text: "Чеклист ритуала на меловой доске",
    },
    {
      slide_number: 3,
      layout_variant: "cta",
      primary_copy: "Сохрани ритуал",
      secondary_copy: "Лайк + сохранить — чтобы не потерять паузу на неделе.",
      swipe_trigger: "META: soft end — CTA save; дальше листать не нужно",
      visual_prompt:
        "dark_notes cta frame, gold-soft chalk CTA block, doodle arrow pointing to save gesture icon, seamless leftover steam from prior slide, no stock Inter poster look",
      alt_text: "Призыв сохранить ритуал",
      cta_type: 4,
    },
  ],
  caption: "Кофе не про продуктивность. Про паузу. Vernatun.",
  hashtags: ["#Vernatun", "#АрмянскийКлуб", "#Ритуал", "#Кофе"],
  promptForDesigner:
    "dark_notes class: marker/doodle/bridges; HTML/CSS-first 3×4:5; ignore swipe_trigger paint",
} as const;

/** Embedded from memory/fixtures/sprint9/carousel/bento_glass_metrics/handoff.json */
const FEWSHOT_BENTO_GLASS_METRICS = {
  contentType: "carousel",
  project: "vernatun",
  content_id: "golden-bento-glass-metrics",
  requested_slide_count: 4,
  idea: "Живая телеметрия клуба: не vanity metrics, а тепло встреч",
  hook: "Цифра молчит?",
  tone: "vernatun",
  cta_type: 2,
  slides: [
    {
      slide_number: 1,
      layout_variant: "cover",
      primary_copy: "Цифра молчит?",
      secondary_copy: "",
      swipe_trigger: "META: gap — какая метрика клуба важнее лайков",
      visual_prompt:
        "bento_glass dark charcoal, frosted glass card with faint telemetry ring, gold/orange accent glow soft, no purple, cinematic top light",
      alt_text: "Стеклянная карточка с вопросом о цифрах",
    },
    {
      slide_number: 2,
      layout_variant: "point",
      primary_copy: "Не лайки — тепло",
      secondary_copy:
        "Сколько человек остались после встречи поговорить. Вот метрика.",
      swipe_trigger: "META: mid value — конкретика вместо vanity",
      visual_prompt:
        "bento_glass bento modules 2×2 glass tiles, tiny timer and metric chips, gold accent line crossing vertical cut to next slide, charcoal depth",
      alt_text: "Bento-плитки с метриками тепла",
    },
    {
      slide_number: 3,
      layout_variant: "proof",
      primary_copy: "Один стол = сигнал",
      secondary_copy:
        "Если стол пустеет — контент врёт. Если нет — клуб живой.",
      swipe_trigger: "META: emotional turn before CTA subscribe",
      visual_prompt:
        "bento_glass glass panel with soft line chart glow amber, telemetry gauge, bridge glow continuing from prior tile edge",
      alt_text: "График и датчик «тепло стола»",
    },
    {
      slide_number: 4,
      layout_variant: "cta",
      primary_copy: "Хочешь ещё такого?",
      secondary_copy: "Подписывайся — следующие разборы тепла клуба.",
      swipe_trigger: "META: soft end — subscribe CTA; stop here",
      visual_prompt:
        "bento_glass gold CTA button glow, glass end-card, Vernatun mark, no stock purple CTA pill",
      alt_text: "CTA подписка",
      cta_type: 2,
    },
  ],
  caption: "Метрики клуба — не vanity. Тепло стола. Vernatun.",
  hashtags: ["#Vernatun", "#Клуб", "#Community", "#Метрики"],
  promptForDesigner:
    "bento_glass: glass/telemetry/gold CTA; HTML/CSS-first 4×4:5; ignore swipe_trigger",
} as const;

/** Embedded from memory/fixtures/sprint9/carousel/dark_editorial_night/handoff.json */
const FEWSHOT_DARK_EDITORIAL_NIGHT = {
  contentType: "carousel",
  project: "vernatun",
  content_id: "golden-dark-editorial-night",
  requested_slide_count: 3,
  idea: "Ночной город и армянский разговорный клуб — editorial photo + gold CTA",
  hook: "Город спит. Мы — нет.",
  tone: "vernatun",
  cta_type: 3,
  slides: [
    {
      slide_number: 1,
      layout_variant: "cover",
      primary_copy: "Город спит. Мы — нет.",
      secondary_copy: "",
      swipe_trigger:
        "META: cinematic curiosity — кто «мы» в городе ночью",
      visual_prompt:
        "dark_editorial cinematic B/W night street photo grain, soft sodium rim light, editorial title safe-zone top, no purple color grade",
      alt_text: "Ночная улица, editorial обложка",
    },
    {
      slide_number: 2,
      layout_variant: "point",
      primary_copy: "Разговор громче неона",
      secondary_copy:
        "В Vernatun язык — не упражнение. Это стол, где можно ошибаться и смеяться.",
      swipe_trigger: "META: value — клуб как живой стол, не курс",
      visual_prompt:
        "dark_editorial telemetry gauges soft gold arcs over desaturated photo, editorial type hierarchy, bridge light streak across cut",
      alt_text: "Телеметрия поверх ночного кадра",
    },
    {
      slide_number: 3,
      layout_variant: "cta",
      primary_copy: "Живые встречи",
      secondary_copy:
        "Приглашение через TG-канал в шапке профиля — приходи за столом.",
      swipe_trigger: "META: soft end — club meet CTA via TG; stop",
      visual_prompt:
        "dark_editorial gold CTA button solid, photo still blurred behind, Vernatun mark, premium editorial not purple CTA pill",
      alt_text: "CTA живые встречи клуба",
      cta_type: 3,
    },
  ],
  caption: "Ночной город. Живой стол. Vernatun — через TG в шапке.",
  hashtags: ["#Vernatun", "#Ереван", "#РазговорныйКлуб", "#Ночь"],
  promptForDesigner:
    "dark_editorial: photo cover + gauges + gold CTA; HTML/CSS-first; ignore swipe_trigger",
} as const;

function fenceJson(label: string, body: unknown): string {
  return [
    `### Few-shot \`${label}\``,
    "```json",
    JSON.stringify(body, null, 2),
    "```",
  ].join("\n");
}

/**
 * C-audit-02 D-p-4 — FULL golden JSON bodies (not name-only bullets).
 * S52: coffee/club topics inside few-shots = STYLE craft only — never product TOPIC LOCK.
 */
export const SPRINT9_CAROUSEL_FEWSHOT_BLOCK = [
  "## Few-shot golden bar (Sprint 9 · full JSON)",
  "",
  "**STYLE-ONLY — NOT TOPIC (HARD · S52):** examples below show craft (hook bar, visual_prompt density, CTA 1–4, swipe META).",
  "Their coffee / club / night-table *subjects* are **not** default product themes.",
  "**TOPIC = user message only.** Brand Vernatun OK as publisher. Do not force coffee/jazz/club ritual.",
  "",
  "Match quality of these COMPLETE handoff examples (slides[] + hook + cta_type). Schema:",
  CAROUSEL_JSON_SCHEMA_HINT,
  "",
  fenceJson("dark_notes_coffee (style-only not topic)", FEWSHOT_DARK_NOTES_COFFEE),
  "",
  fenceJson("bento_glass_metrics (style-only not topic)", FEWSHOT_BENTO_GLASS_METRICS),
  "",
  fenceJson("dark_editorial_night (style-only not topic)", FEWSHOT_DARK_EDITORIAL_NIGHT),
  "",
  "Also likeness id `bold_poster_invite` (fixture on disk) — same STRICT schema · style-only.",
].join("\n");

export const SPRINT9_CAROUSEL_CRITIC_INSTRUCTIONS = [
  "## Critic gate (before Draft — not a mesh agent)",
  "",
  "Before claiming ready for Designer/Draft, self-check against paired invariants:",
  "1. Cover = captivating curiosity gap ≤6–8 words (not flat labels).",
  "2. Every slide has META swipe_trigger (not painted on-slide).",
  "3. cta_type 1–4 present; CTA copy matches catalog.",
  "4. visual_prompt concrete; no purple-slop markers.",
  "5. requested_slide_count === slides.length.",
  "If any fail — fix JSON before user handoff. Server critic will REJECT soft success.",
].join("\n");

/** Full Scriptwriter pack = role overlay + few-shot + critic (for external callers). */
export function buildSprint9CarouselScriptwriterPack(): string {
  return [
    CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY,
    "",
    SPRINT9_CAROUSEL_FEWSHOT_BLOCK,
    "",
    SPRINT9_CAROUSEL_CRITIC_INSTRUCTIONS,
  ].join("\n");
}
