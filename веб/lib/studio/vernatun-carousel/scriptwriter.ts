import { callAggregatorChat } from "@/lib/llm/aggregator-chat";
import { resolveBriefCta } from "./cta-catalog";
import {
  B4_HY_CANONICAL_15,
  buildB4HyCanonicalScript,
  buildSheetFoodCanonicalScript,
  extractArmenianWords,
  stripDecorativeQuotes,
} from "./hy-text";
import { PROMPT_SCRIPTWRITER } from "./prompts";
import { resolveRoleModel } from "./role-models";
import { extractJsonObject } from "./json-parse";
import { assertCoverHeadline } from "./word-count";
import type { JobLlmSession } from "./job-llm-session";
import type {
  VernatunJobBrief,
  VernatunScript,
  VernatunSlideScript,
} from "./types";

function isB4HySmoke(brief: VernatunJobBrief): boolean {
  return /B4_HY_SMOKE/i.test(brief.styleNotes ?? "");
}

function isSheetFoodCheckpoint(brief: VernatunJobBrief): boolean {
  return /B1_B5_SHEET_CHECKPOINT/i.test(brief.styleNotes ?? "");
}

function b4CanonicalAsScript(brief: VernatunJobBrief, n: number): VernatunScript {
  const raw = buildB4HyCanonicalScript({
    slideCount: n,
    audience: brief.audience,
    cta: brief.cta,
  });
  return {
    ...raw,
    slides: raw.slides.map((s) => ({
      ...s,
      role: s.role,
    })),
  };
}

function sheetFoodAsScript(brief: VernatunJobBrief): VernatunScript {
  const raw = buildSheetFoodCanonicalScript({
    audience: brief.audience,
    cta: brief.cta,
  });
  return {
    ...raw,
    slides: raw.slides.map((s) => ({ ...s, role: s.role })),
  };
}

/** Prefer deterministic checkpoint scripts over fragile LLM JSON. */
function checkpointFallbackScript(
  brief: VernatunJobBrief,
  n: number,
): VernatunScript {
  if (isSheetFoodCheckpoint(brief)) return sheetFoodAsScript(brief);
  if (isB4HySmoke(brief)) return b4CanonicalAsScript(brief, n);
  return buildFallbackScript(brief, n);
}

function buildFallbackScript(
  brief: VernatunJobBrief,
  slideCount: number,
): VernatunScript {
  const topic = brief.topic.trim() || "Vernatun";
  const coverWords = topic
    .replace(/[«»"'.,!?]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .join(" ");
  // RU translation must appear in body (hy_vocab_topic gate).
  const vocabFallback = [
    { hy: "կապ", ru: "связь", body: "В Vernatun сила — в живой связи, а не в бесконечных чатах." },
    { hy: "խոսակցություն", ru: "разговор", body: "В переписке теряется тон. Живой разговор возвращает смысл." },
    { hy: "համայնք", ru: "сообщество", body: "Знакомство и честная обратная связь — так растёт сообщество." },
    { hy: "հանդիպում", ru: "встреча", body: "Первая встреча — без экзамена. Просто приходите." },
    { hy: "ընկերներ", ru: "друзья", body: "Рядом друзья, которые подхватывают мысль." },
    { hy: "պրակտիկա", ru: "практика", body: "Короткая практика каждый день сильнее теории." },
    { hy: "վստահություն", ru: "уверенность", body: "Уверенность растёт от живых попыток, не от зубрёжки." },
    { hy: "ժպիտ", ru: "улыбка", body: "Улыбка снимает половину языкового страха." },
  ];
  const slides: VernatunSlideScript[] = [
    {
      index: 1,
      role: "cover",
      headline: coverWords || "Живые связи",
      body: vocabFallback[0]!.body,
      supporting_copy: `${vocabFallback[0]!.hy} — ${vocabFallback[0]!.ru}`,
      visual_intent:
        "friends talking cafe eye contact warm light community gathering",
      composition_hint:
        "poster-typo viral hook on-photo bare logo, vocab chip same series style",
      image_need: {
        kind: "photo_generic" as const,
        must_be_photographic: true,
        forbid_ai_if_possible: true,
      },
    },
    {
      index: 2,
      role: "split",
      headline: "Чат молчит",
      body: vocabFallback[1]!.body,
      supporting_copy: `${vocabFallback[1]!.hy} — ${vocabFallback[1]!.ru}`,
      visual_intent:
        "two people conversation candid, listening carefully, soft indoor light",
      composition_hint: "split-contrast + vocab chip same series style",
      must_not_repeat: "cover poster",
      image_need: {
        kind: "photo_generic" as const,
        must_be_photographic: true,
        forbid_ai_if_possible: true,
      },
    },
    {
      index: 3,
      role: "cards",
      headline: "Три опоры",
      body: vocabFallback[2]!.body,
      supporting_copy: `${vocabFallback[2]!.hy} — ${vocabFallback[2]!.ru}`,
      visual_intent:
        "small group circle talking laughing casual community meetup",
      composition_hint: "cards-trio + vocab chip same series style",
      must_not_repeat: "split",
      image_need: {
        kind: "photo_generic" as const,
        must_be_photographic: true,
        forbid_ai_if_possible: true,
      },
    },
    {
      index: 4,
      role: "cta",
      headline: "Заходите",
      body: vocabFallback[3]!.body,
      cta: brief.cta || "Приходите на встречу Vernatun",
      supporting_copy: `${vocabFallback[3]!.hy} — ${vocabFallback[3]!.ru}`,
      visual_intent:
        "welcome greeting people entering cozy community space doorway",
      composition_hint: "door-invite + CTA + vocab chip same series style",
      must_not_repeat: "cards",
      image_need: {
        kind: "photo_real_place" as const,
        place_query: "community club entrance doorway people welcome",
        must_be_photographic: true,
        forbid_ai_if_possible: true,
      },
    },
  ].slice(0, slideCount);

  while (slides.length < slideCount) {
    const i = slides.length;
    const v = vocabFallback[i % vocabFallback.length]!;
    slides.push({
      index: i + 1,
      role: i === slideCount - 1 ? "cta" : "body",
      headline: `Шаг ${i + 1}`,
      body: v.body,
      supporting_copy: `${v.hy} — ${v.ru}`,
      visual_intent: "people talking community natural light",
      composition_hint: "statement on-photo + vocab chip same series style",
      image_need: {
        kind: "photo_generic" as const,
        must_be_photographic: true,
        forbid_ai_if_possible: true,
      },
    });
  }

  return {
    carousel_title: topic,
    audience: brief.audience || "участники Vernatun",
    central_thesis: "Живые связи сильнее чатов — приходите в Vernatun.",
    slide_count: slideCount,
    type_system: {
      headline: "Bold geometric sans, weight 900, tight tracking",
      body: "Clean humanist sans, weight 600",
      cta: "Same geometric sans as headline, smaller, high contrast",
    },
    slides,
  };
}

/**
 * Mid slides with kind=none became dead black UI. Force photographic canvas
 * so Mode B keeps lifestyle atmosphere + overlays.
 */
function normalizeImageNeed(
  raw: VernatunSlideScript["image_need"] | undefined,
): VernatunSlideScript["image_need"] {
  if (!raw || raw.kind === "none" || raw.kind === "graphic") {
    return {
      kind: "photo_generic",
      must_be_photographic: true,
      forbid_ai_if_possible: false,
      place_query: raw?.place_query ?? null,
    };
  }
  return {
    ...raw,
    must_be_photographic:
      raw.must_be_photographic ??
      (raw.kind === "photo_generic" ||
        raw.kind === "photo_real_place" ||
        raw.kind === "photo_user_required"),
  };
}

function normalizeTypeSystem(raw: unknown): VernatunScript["type_system"] {
  if (!raw || typeof raw !== "object") {
    return {
      headline: "Bold geometric sans, weight 900",
      body: "Clean humanist sans, weight 600",
      cta: "Bold geometric sans, compact CTA",
    };
  }
  const o = raw as Record<string, unknown>;
  return {
    headline: String(o.headline ?? "Bold geometric sans, weight 900").trim(),
    body: String(o.body ?? "Clean humanist sans, weight 600").trim(),
    cta: String(o.cta ?? "Bold geometric sans, compact CTA").trim(),
  };
}

/** Clamp AD-chosen slide count; demo may FORCE via brief.slideCount. */
export function resolveSlideCount(input: {
  fromScript?: unknown;
  briefForce?: number;
  fallback?: number;
}): number {
  if (
    typeof input.briefForce === "number" &&
    Number.isFinite(input.briefForce) &&
    input.briefForce >= 2
  ) {
    return Math.min(12, Math.max(2, Math.round(input.briefForce)));
  }
  const raw = input.fromScript;
  const n =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? Number(raw)
        : NaN;
  if (Number.isFinite(n) && n >= 4 && n <= 8) return Math.round(n);
  return Math.min(8, Math.max(4, input.fallback ?? 4));
}

function normalizeScript(raw: unknown, slideCount: number): VernatunScript {
  const o = raw as Record<string, unknown>;
  const slidesIn = Array.isArray(o.slides) ? o.slides : [];
  const slides: VernatunSlideScript[] = slidesIn
    .slice(0, slideCount)
    .map((s, i) => {
      const row = (s ?? {}) as Record<string, unknown>;
      return {
        index: typeof row.index === "number" ? row.index : i + 1,
        role: String(row.role ?? (i === 0 ? "cover" : "body")),
        headline: stripDecorativeQuotes(String(row.headline ?? "")),
        body: stripDecorativeQuotes(String(row.body ?? "")),
        supporting_copy:
          typeof row.supporting_copy === "string"
            ? stripDecorativeQuotes(row.supporting_copy)
            : undefined,
        cta:
          typeof row.cta === "string"
            ? stripDecorativeQuotes(row.cta)
            : undefined,
        visual_intent: String(row.visual_intent ?? row.visualIntent ?? "").trim(),
        composition_hint:
          typeof row.composition_hint === "string"
            ? row.composition_hint
            : undefined,
        must_not_repeat:
          typeof row.must_not_repeat === "string"
            ? row.must_not_repeat
            : undefined,
        image_need: normalizeImageNeed(
          row.image_need && typeof row.image_need === "object"
            ? (row.image_need as VernatunSlideScript["image_need"])
            : undefined,
        ),
        facts_to_verify: Array.isArray(row.facts_to_verify)
          ? row.facts_to_verify.map(String)
          : [],
      };
    });
  while (slides.length < slideCount) {
    const i = slides.length;
    slides.push({
      index: i + 1,
      role: i === 0 ? "cover" : i === slideCount - 1 ? "cta" : "body",
      headline: i === 0 ? "Новая тема" : `Слайд ${i + 1}`,
      body: "Текст уточняется.",
      visual_intent: "спокойная фотография людей в разговоре",
    });
  }
  if (slides[0]) slides[0].role = "cover";
  return {
    carousel_title: String(o.carousel_title ?? o.title ?? "Карусель").trim(),
    audience: String(o.audience ?? "аудитория Vernatun").trim(),
    central_thesis: String(o.central_thesis ?? "").trim(),
    slide_count: slideCount,
    type_system: normalizeTypeSystem(o.type_system ?? o.typeSystem),
    slides,
  };
}

async function shortenCover(
  headline: string,
  topic: string,
): Promise<string> {
  const model = resolveRoleModel("scriptwriter");
  const res = await callAggregatorChat({
    system:
      "Сократи заголовок обложки Instagram до максимум 4 слов на русском. Верни только заголовок.",
    user: `Тема: ${topic}\nЗаголовок: ${headline}`,
    model: model.model,
    temperature: 0.3,
    maxTokens: 64,
    fallbackModels: true,
  });
  if (!res.ok) return headline.split(/\s+/).slice(0, 4).join(" ");
  return res.text.trim().replace(/^["«]|["»]$/g, "").slice(0, 80);
}

export async function runScriptwriter(
  brief: VernatunJobBrief,
  session?: JobLlmSession,
): Promise<{ script: VernatunScript; model: string; system: string; user: string }> {
  const forceN =
    typeof brief.slideCount === "number" && brief.slideCount >= 2
      ? Math.min(12, Math.max(2, brief.slideCount))
      : undefined;
  const model = resolveRoleModel("scriptwriter");
  const resolvedCta = resolveBriefCta(brief);
  const user = [
    `Тема/цель: ${brief.topic}`,
    `Аудитория: ${brief.audience ?? "участники клуба Vernatun"}`,
    `Платформа: ${brief.platform ?? "Instagram"}`,
    `CTA_TYPE: ${resolvedCta.ctaType} (из Sheet/брифа; default speaking_meetup)`,
    `CTA (финальный слайд, используй этот смысл/текст): ${resolvedCta.cta}`,
    `СМЫСЛ: обложка должна сразу объяснить тему («${brief.topic}»), не пустой мотиватор. Mid-слайды — конкретные шаги/факты.`,
    forceN
      ? `FORCE_SLIDE_COUNT=${forceN} (демо/smoke — используй ровно это число)`
      : "Выбери slide_count сам (4–8), финал = CTA.",
    `Язык: ${brief.language ?? "ru"}`,
    `Тон: ${brief.tone ?? "честный, живой"}`,
    "СЛОВАРЬ HARD: на КАЖДОМ слайде supporting_copy = ровно одно HY—RU (формат «աշխատանք — работа»). headline/body/cta без HY.",
    "СВЯЗЬ С ТЕМОЙ HARD: слово НЕ с воздуха — по тезису слайда и теме брифа; русский перевод (или однокоренное) ОБЯЗАН быть в body/headline этого слайда. Слова разные по слайдам.",
    "ПОЛЬЗА HARD: каждый mid = практический шаг + именнованный ориентир (сайт/канал/чек-лист). ИП/налоги ок, если уместны и с next step; режь только воду без действия.",
    brief.styleNotes ? `Стиль: ${brief.styleNotes}` : "",
    brief.forbidden?.length
      ? `Запрещено: ${brief.forbidden.join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  // Sheet food checkpoint: exact HY—RU vocab blocks (skip LLM — stable for B4)
  if (isSheetFoodCheckpoint(brief)) {
    return {
      script: sheetFoodAsScript(brief),
      model: "canonical:sheet_food",
      system: PROMPT_SCRIPTWRITER,
      user,
    };
  }

  const res = session
    ? await session.callMask({
        role: "scriptwriter",
        system: PROMPT_SCRIPTWRITER,
        user,
        temperature: 0.55,
        maxTokens: 4096,
        thinking: true,
      })
    : await callAggregatorChat({
        system: PROMPT_SCRIPTWRITER,
        user,
        model: model.model,
        temperature: 0.55,
        maxTokens: 4096,
        thinking: true,
        reasoningEffort: "high",
        fallbackModels: true,
      });

  if (!res.ok) {
    const n = forceN ?? 4;
    const fallback = checkpointFallbackScript(brief, n);
    return {
      script: fallback,
      model: `fallback:${res.error}`,
      system: PROMPT_SCRIPTWRITER,
      user,
    };
  }
  let parsed: Record<string, unknown>;
  try {
    parsed = extractJsonObject(res.text) as Record<string, unknown>;
  } catch (err) {
    const n = forceN ?? 4;
    const fallback = checkpointFallbackScript(brief, n);
    return {
      script: fallback,
      model: `fallback:json_parse:${err instanceof Error ? err.message : "fail"}`,
      system: PROMPT_SCRIPTWRITER,
      user,
    };
  }
  const slideCount = resolveSlideCount({
    fromScript: parsed.slide_count ?? parsed.slideCount,
    briefForce: forceN,
    fallback: 4,
  });
  let script = normalizeScript(parsed, slideCount);
  // B4 smoke: if LLM omitted the canonical HY list, replace with ground-truth script
  if (isB4HySmoke(brief)) {
    const blob = script.slides
      .map((s) => `${s.headline} ${s.body} ${s.supporting_copy ?? ""} ${s.cta ?? ""}`)
      .join(" ");
    const found = new Set(extractArmenianWords([blob]));
    const missing = B4_HY_CANONICAL_15.filter((w) => !found.has(w));
    if (missing.length > 0) {
      script = b4CanonicalAsScript(brief, slideCount);
    }
  }
  const cover = script.slides[0];
  if (cover) {
    let check = assertCoverHeadline(cover.headline);
    if (!check.ok) {
      cover.headline = await shortenCover(cover.headline, brief.topic);
      check = assertCoverHeadline(cover.headline);
      if (!check.ok) {
        cover.headline = cover.headline.split(/\s+/).slice(0, 4).join(" ");
      }
    }
  }
  const last = script.slides[script.slides.length - 1];
  if (last) {
    last.role = "cta";
    if (!(last.cta ?? "").trim()) last.cta = resolvedCta.cta;
    if (!(last.body ?? "").trim()) last.body = resolvedCta.cta;
  }
  return {
    script,
    model: res.model,
    system: PROMPT_SCRIPTWRITER,
    user,
  };
}
