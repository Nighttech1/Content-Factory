/**
 * B4 — Armenian (HY) exact-text protocol for image gen + AD spelling check.
 * Eastern Armenian Unicode range U+0530–U+058F.
 */

/** True if string contains at least one Armenian letter. */
export function containsArmenian(text: string): boolean {
  return /[\u0530-\u058F]/.test(text ?? "");
}

/** Collect unique Armenian words (sequences of Armenian letters). */
export function extractArmenianWords(texts: string[]): string[] {
  const re = /[\u0530-\u058F]+/g;
  const out: string[] = [];
  const seen = new Set<string>();
  for (const t of texts) {
    if (!t) continue;
    for (const m of t.matchAll(re)) {
      const w = m[0]!;
      if (seen.has(w)) continue;
      seen.add(w);
      out.push(w);
    }
  }
  return out;
}

/** Letter-by-letter spellout for the image model (grapheme-safe). */
export function hyLetterSpellout(word: string): string {
  return [...word].join(" · ");
}

/** Strip decorative «» "" '' that image models love to paint around headlines. */
export function stripDecorativeQuotes(text: string): string {
  return (text ?? "")
    .trim()
    .replace(/^[«»""''„“]+/, "")
    .replace(/[«»""''„“]+$/, "")
    .trim();
}

/** Cyrillic letter-by-letter for short RU headlines (stops «чаушой» / Latin mix). */
export function cyrillicHeadlineFidelityBlock(headline: string): string {
  const clean = stripDecorativeQuotes(headline);
  if (!clean || !/[А-Яа-яЁё]/.test(clean)) return "";
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 6) return "";
  const lines = words
    .map((w) => `  • «${w}»  →  ${[...w].join(" · ")}`)
    .join("\n");
  return `RU HEADLINE FIDELITY (HARD — zero wrong Cyrillic):
- Headline is RUSSIAN CYRILLIC ONLY. Do NOT use Armenian letters in the headline.
- Spell CHARACTER-FOR-CHARACTER from the EXACT headline string (no paraphrasing, no «чаушой» for «чашкой»).
- Do NOT mix Latin lookalikes (a/e/o/c/p/x) into Cyrillic words.
- Letter-by-letter keys:
${lines}`;
}

/**
 * Hard block injected into GPT Image prompt when slide copy has Armenian.
 * Goal: stop invented/mirrored/Cyrillic-lookalike glyphs.
 */
export function armenianFidelityPromptBlock(texts: string[]): string {
  const words = extractArmenianWords(texts);
  if (words.length === 0) return "";

  const spellLines = words
    .map((w) => `  • "${w}"  →  ${hyLetterSpellout(w)}`)
    .join("\n");

  return `ARMENIAN SCRIPT FIDELITY (HARD — zero tolerance for wrong glyphs):
- Render ONLY the exact Unicode Armenian letters from the quoted strings (U+0530–U+058F).
- Copy CHARACTER-FOR-CHARACTER. Do NOT invent, swap, mirror, drop, or stylize letters into ornaments.
- Do NOT substitute Cyrillic/Latin lookalikes (о/а/е/р/с ≠ Armenian օ/ա/ե/ր/ս).
- Do NOT invent diacritics or broken shapes; every letter must match the spellout below.
- Prefer a large, clear Armenian sans-serif; prioritize glyph accuracy over decoration.
- Letter-by-letter keys (verify each glyph before drawing):
${spellLines}
- If a word cannot be rendered perfectly, leave that word OFF the slide rather than guessing.`;
}

/**
 * Parse supporting_copy as exactly one HY—RU vocab pair.
 * Accepts em dash / en dash / hyphen.
 */
export function parseHyRuVocab(
  supporting: string | undefined | null,
): { hy: string; ru: string } | null {
  const raw = (supporting ?? "").trim();
  if (!raw) return null;
  const m = raw.match(
    /^([\u0530-\u058F]+)\s*[—–-]\s*([А-Яа-яЁёA-Za-z][\sА-Яа-яЁёA-Za-z-]{0,40})$/u,
  );
  if (!m) return null;
  const hy = m[1]!;
  const ru = m[2]!.trim();
  if (!hy || !ru) return null;
  // Reject if more than one HY token in the whole supporting string
  const allHy = extractArmenianWords([raw]);
  if (allHy.length !== 1) return null;
  return { hy, ru };
}

export type HyVocabDefect = {
  priority: "BLOCKER" | "MAJOR";
  slide_index: number;
  element: string;
  reason: string;
  fix: string;
};

/** Normalize RU for soft stem match (ё→е, lower, strip punctuation). */
export function normalizeRuLex(text: string): string {
  return (text ?? "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^а-яa-z0-9\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * True if Russian vocab translation (or 4+ char stem) appears in slide copy.
 * Ensures HY is woven into the script, not bolted on from thin air.
 */
export function ruVocabTiedToSlideCopy(
  ru: string,
  headline: string,
  body: string,
): boolean {
  const needle = normalizeRuLex(ru);
  if (!needle) return false;
  const hay = normalizeRuLex(`${headline} ${body}`);
  if (!hay) return false;
  if (hay.includes(needle)) return true;
  // Stem: first ≥4 letters of multi-letter words (удалённо → удал)
  const stemLen = Math.min(needle.length, Math.max(4, Math.floor(needle.length * 0.6)));
  const stem = needle.slice(0, stemLen);
  if (stem.length >= 4 && hay.includes(stem)) return true;
  // Multi-word RU: any significant token ≥4 chars
  for (const tok of needle.split(/\s+/)) {
    if (tok.length >= 4 && hay.includes(tok)) return true;
  }
  return false;
}

/**
 * Mechanical gate: each slide must have exactly one HY—RU pair in supporting_copy;
 * headline/body/cta must not contain Armenian; RU sense must appear in slide copy.
 */
export function defectsForOneHyVocabPerSlide(script: {
  slides: Array<{
    index?: number;
    headline?: string;
    body?: string;
    supporting_copy?: string;
    cta?: string;
  }>;
}): HyVocabDefect[] {
  const defects: HyVocabDefect[] = [];
  const seenHy = new Set<string>();
  for (let i = 0; i < script.slides.length; i++) {
    const s = script.slides[i]!;
    const slideIndex = typeof s.index === "number" ? s.index : i + 1;
    const pair = parseHyRuVocab(s.supporting_copy);
    if (!pair) {
      defects.push({
        priority: "MAJOR",
        slide_index: slideIndex,
        element: "hy_vocab",
        reason: `Слайд ${slideIndex}: нет ровно одного HY—RU в supporting_copy (нужно «Հայերեն — русский»)`,
        fix: `Поставь supporting_copy в формате «Հայերեն — русский» с одним словом; сейчас: «${(s.supporting_copy ?? "").slice(0, 80)}»`,
      });
    } else if (seenHy.has(pair.hy)) {
      defects.push({
        priority: "MAJOR",
        slide_index: slideIndex,
        element: "hy_vocab_dup",
        reason: `Слово «${pair.hy}» уже было на другом слайде`,
        fix: "Выбери другое армянское слово по теме этого слайда",
      });
    } else {
      seenHy.add(pair.hy);
      if (
        !ruVocabTiedToSlideCopy(
          pair.ru,
          s.headline ?? "",
          s.body ?? "",
        )
      ) {
        defects.push({
          priority: "MAJOR",
          slide_index: slideIndex,
          element: "hy_vocab_topic",
          reason: `Слово «${pair.hy} — ${pair.ru}» не связано со слайдом: «${pair.ru}» не читается в headline/body`,
          fix: `Впиши смысл «${pair.ru}» в body/headline слайда ИЛИ замени HY на слово по тезису слайда`,
        });
      }
    }

    const forbiddenFields: Array<[string, string | undefined]> = [
      ["headline", s.headline],
      ["body", s.body],
      ["cta", s.cta],
    ];
    for (const [el, text] of forbiddenFields) {
      const hyIn = extractArmenianWords([text ?? ""]);
      if (hyIn.length > 0) {
        defects.push({
          priority: "MAJOR",
          slide_index: slideIndex,
          element: el,
          reason: `${el}: армянские буквы запрещены вне supporting_copy (${hyIn.join(", ")})`,
          fix: `Убери HY из ${el}; оставь только русский. HY — только в supporting_copy`,
        });
      }
    }
  }
  return defects;
}

/** Canonical 15-word list for B4 smoke (Eastern Armenian, speaking-club lexicon). */
export const B4_HY_CANONICAL_15: readonly string[] = [
  "բարև",
  "շնորհակալություն",
  "խնդրեմ",
  "հայերեն",
  "լեզու",
  "խոսել",
  "հանդիպում",
  "ընկերներ",
  "համայնք",
  "սուրճ",
  "սեղան",
  "վստահություն",
  "պրակտիկա",
  "ժպիտ",
  "Վերնատուն",
] as const;

/** Sheet checkpoint «Любимая еда»: 5 slides × (RU copy + HY—RU vocab block). */
export const SHEET_FOOD_VOCAB_5 = [
  { hy: "սնունդ", ru: "еда" },
  { hy: "համ", ru: "вкус" },
  { hy: "հաց", ru: "хлеб" },
  { hy: "սուրճ", ru: "кофе" },
  { hy: "սեղան", ru: "стол" },
] as const;

export function buildSheetFoodCanonicalScript(input: {
  audience?: string;
  cta?: string;
}): {
  carousel_title: string;
  audience: string;
  central_thesis: string;
  slide_count: number;
  type_system: {
    headline: string;
    body: string;
    cta: string;
  };
  slides: Array<{
    index: number;
    role: "cover" | "body" | "cards" | "quote" | "cta";
    headline: string;
    body: string;
    supporting_copy: string;
    cta?: string;
    visual_intent: string;
    composition_hint: string;
    image_need: {
      kind: "photo_generic";
      must_be_photographic: boolean;
      forbid_ai_if_possible: boolean;
    };
  }>;
} {
  const v = SHEET_FOOD_VOCAB_5;
  const slides = [
    {
      index: 1,
      role: "cover" as const,
      headline: "Любимая еда",
      body: "В Vernatun вкус — повод заговорить, а не только поесть.",
      supporting_copy: `${v[0].hy} — ${v[0].ru}`,
      visual_intent: "warm shared meal table friends food poster",
      composition_hint:
        "RU hook + separate vocab card block, empty TOP-RIGHT, 1080x1350",
      image_need: {
        kind: "photo_generic" as const,
        must_be_photographic: true,
        forbid_ai_if_possible: true,
      },
    },
    {
      index: 2,
      role: "body" as const,
      headline: "Что на языке",
      body: "Любимое блюдо и его вкус рассказывают о доме быстрее резюме.",
      supporting_copy: `${v[1].hy} — ${v[1].ru}`,
      visual_intent: "close-up tasty food plate natural light",
      composition_hint: "RU body + vocab block, empty TOP-RIGHT logo pocket",
      image_need: {
        kind: "photo_generic" as const,
        must_be_photographic: true,
        forbid_ai_if_possible: true,
      },
    },
    {
      index: 3,
      role: "cards" as const,
      headline: "Хлеб сближает",
      body: "Начните с тёплого и понятного — так легче первое предложение.",
      supporting_copy: `${v[2].hy} — ${v[2].ru}`,
      visual_intent: "fresh bread bakery warm hands sharing",
      composition_hint:
        "RU Cyrillic headline ONLY + large HY vocab block, ≥48px margins",
      image_need: {
        kind: "photo_generic" as const,
        must_be_photographic: true,
        forbid_ai_if_possible: true,
      },
    },
    {
      index: 4,
      role: "quote" as const,
      headline: "За чашкой",
      body: "Разговор начинается, когда кофе уже на столе.",
      supporting_copy: `${v[3].hy} — ${v[3].ru}`,
      visual_intent: "coffee cups conversation cafe vernatun mood",
      composition_hint: "RU quote feel + vocab block, empty TR",
      image_need: {
        kind: "photo_generic" as const,
        must_be_photographic: true,
        forbid_ai_if_possible: true,
      },
    },
    {
      index: 5,
      role: "cta" as const,
      headline: "За одним столом",
      body: "Приходите в Vernatun — слова и вкусы делим вместе.",
      supporting_copy: `${v[4].hy} — ${v[4].ru}`,
      cta: input.cta || "Приходите в Vernatun — говорим за столом",
      visual_intent: "friends around table invite community dinner",
      composition_hint: "CTA + vocab block, empty TOP-RIGHT, full CTA visible",
      image_need: {
        kind: "photo_generic" as const,
        must_be_photographic: true,
        forbid_ai_if_possible: true,
      },
    },
  ];

  return {
    carousel_title: "Любимая еда — Vernatun",
    audience: input.audience || "участники Vernatun",
    central_thesis:
      "Еда сближает: пять армянских слов к теме любимой еды на встрече.",
    slide_count: 5,
    type_system: {
      headline: "Bold geometric Armenian-capable sans, weight 900",
      body: "Clear humanist sans, weight 600",
      cta: "Bold geometric sans, high contrast CTA",
    },
    slides,
  };
}

/** Brief styleNotes blob forcing scriptwriter to emit these exact words. */
export function b4HySmokeStyleNotes(): string {
  const numbered = B4_HY_CANONICAL_15.map((w, i) => `${i + 1}) ${w}`).join(
    "\n",
  );
  return `B4_HY_SMOKE (HARD):
Карусель Vernatun: живой русский copy (как обычный вирусный слайд) + встроенные армянские слова.
На ВСЕХ слайдах вместе ОБЯЗАНЫ появиться РОВНО эти 15 армянских слов — с ЭТИМ написанием, буква в букву (восточноармянский Unicode). Не транслит, не «похожее», не сокращения.
На КАЖДОМ слайде с HY: обязательно есть обычный русский текст (headline и/или body) — мысль/хук/объяснение, НЕ только список слов. Армянские слова вплетены в этот copy крупно и чётко.
Распредели 15 слов по слайдам 1–4: каждое слово ≥1 раз в headline/body/supporting/cta.
Список (канон):
${numbered}
FORCE_SLIDE_COUNT уже задан. Logo safe zone TOP-RIGHT пустая. JSON: один валидный объект, UTF-8.`;
}

/**
 * Deterministic B4 script: all 15 canonical HY words, clearly spelled for image gen.
 * Used when LLM JSON fails OR as smoke ground-truth copy.
 */
export function buildB4HyCanonicalScript(input: {
  slideCount?: number;
  audience?: string;
  cta?: string;
}): {
  carousel_title: string;
  audience: string;
  central_thesis: string;
  slide_count: number;
  type_system: {
    headline: string;
    body: string;
    cta: string;
  };
  slides: Array<{
    index: number;
    role: "cover" | "body" | "cards" | "cta";
    headline: string;
    body: string;
    supporting_copy?: string;
    cta?: string;
    visual_intent: string;
    composition_hint: string;
    image_need: {
      kind: "photo_generic" | "graphic";
      must_be_photographic: boolean;
      forbid_ai_if_possible: boolean;
    };
  }>;
} {
  const w = B4_HY_CANONICAL_15;
  const n = Math.min(8, Math.max(4, input.slideCount ?? 4));
  // Each slide = normal RU viral copy + exact HY words woven in (not vocab-only).
  const slides = [
    {
      index: 1,
      role: "cover" as const,
      headline: "Живой язык",
      body: `В Vernatun начинаем просто: ${w[0]}, потом ${w[3]} — без стыда и без зубрёжки.`,
      supporting_copy: `Сегодня в тетради: ${w[0]}, ${w[1]}, ${w[2]}, ${w[4]}, ${w[5]}, ${w[14]}.`,
      visual_intent:
        "warm cafe table notebook armenian learning poster typography",
      composition_hint:
        "poster-typo RU hook left/center, HY words clear, empty TOP-RIGHT logo pocket ≥48px margins",
      image_need: {
        kind: "photo_generic" as const,
        must_be_photographic: true,
        forbid_ai_if_possible: true,
      },
    },
    {
      index: 2,
      role: "body" as const,
      headline: "Свои за столом",
      body: `Настоящая ${w[6]} с ${w[7]} важнее чата: ${w[8]}, ${w[9]}, общий ${w[10]}.`,
      supporting_copy: `Запомните точно: ${w[6]}, ${w[7]}, ${w[8]}, ${w[9]}, ${w[10]}.`,
      visual_intent: "friends around table coffee community speaking club",
      composition_hint:
        "RU headline + HY vocab mid-left, people photo, empty TOP-RIGHT, ≥48px margins",
      image_need: {
        kind: "photo_generic" as const,
        must_be_photographic: true,
        forbid_ai_if_possible: true,
      },
    },
    {
      index: 3,
      role: "cards" as const,
      headline: "Смелость говорить",
      body: `${w[11]} растёт из ${w[12]}: ${w[13]} появляется, когда живые ${w[4]} и ${w[5]}.`,
      supporting_copy: `Ещё три слова: ${w[1]}, ${w[2]}, ${w[13]}.`,
      visual_intent: "smiling speakers practice confidence warm room",
      composition_hint:
        "RU statement + few large HY glyphs, empty TOP-RIGHT logo pocket",
      image_need: {
        kind: "photo_generic" as const,
        must_be_photographic: true,
        forbid_ai_if_possible: true,
      },
    },
    {
      index: 4,
      role: "cta" as const,
      headline: "Приходите",
      body: `Повторим у входа в ${w[14]}: ${w[0]}, ${w[1]}, ${w[2]}.`,
      supporting_copy: `И ещё: ${w[3]}, ${w[4]}, ${w[5]} — на живой встрече.`,
      cta: input.cta || "Приходите в Vernatun — говорим по-армянски",
      visual_intent: "welcome doorway community club invite warm light",
      composition_hint:
        "RU CTA + short HY list, empty TOP-RIGHT logo pocket, ≥48px margins",
      image_need: {
        kind: "photo_generic" as const,
        must_be_photographic: true,
        forbid_ai_if_possible: true,
      },
    },
  ].slice(0, n);

  return {
    carousel_title: "15 армянских слов Vernatun",
    audience: input.audience || "участники Vernatun",
    central_thesis:
      "Чёткое написание 15 армянских слов на слайдах speaking club.",
    slide_count: slides.length,
    type_system: {
      headline: "Bold geometric Armenian-capable sans, weight 900",
      body: "Clear humanist sans with full Armenian glyph support, weight 600",
      cta: "Same geometric sans, high contrast CTA",
    },
    slides,
  };
}
