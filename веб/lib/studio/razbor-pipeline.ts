/**
 * C-51 — Razbor competitor cascade (script-only) for non-carousel modules.
 * C-59 — `carousel-engine` adds Designer (slides + upsertDraft) then Publisher pane
 * (datetime only — no chat / no LLM). No auto-start on open.
 *
 * Open → Analyst welcome (idle). «Начать разбор» → Analyst analysis.
 * Then Scriptwriter full script (roles · plot · text · location).
 *
 * C-35 — Analyst copy branches on post.sourceMode live|mock (no Graph fetch).
 */

import {
  brandKitAgentNote,
  getBrandPack,
} from "@/lib/brand/brandPack";
import type { FeedPost } from "@/lib/studio/feed-types";
import { getFeedForModule } from "@/lib/studio/feed-fixtures";
import { isPlayableVideoUrl } from "@/lib/studio/feed-play";
import type {
  CarouselDraft,
  CarouselDraftBrand,
  CarouselDraftSlide,
  RazborAgentId,
  RazborChatMessage,
} from "@/lib/studio/carousel-draft-types";

function picsum(seed: string, w = 720, h = 1200): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

/** Stable hash from competitor id for deterministic copy variants. */
function seedNum(competitorId: string): number {
  let h = 0;
  for (let i = 0; i < competitorId.length; i++) {
    h = (h * 31 + competitorId.charCodeAt(i)) >>> 0;
  }
  return h;
}

function formatMetric(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

export type CompetitorCarouselSlide = {
  id: string;
  imageUrl: string;
  caption: string;
};

/** C-75 — one slide in carousel idea-brief (text + colors). */
export type RazborIdeaSlide = {
  index: number;
  text: string;
  colors: { bg: string; accent: string; text: string };
};

/**
 * C-51 — Full Vernatun script for a competitor reel (not hook-only, not slides gallery).
 * C-75 — for carousel-engine: `ideaSlides` + `handoffPayload` (idea-brief, not reels script).
 */
export type RazborScript = {
  roles: string[];
  plot: string;
  text: string;
  location: string;
  ideaSlides?: RazborIdeaSlide[];
  /** Explicit handoff line for Designer, e.g. «Карусель 1: …». */
  handoffPayload?: string;
};

/**
 * Competitor carousel slides for Razbor.
 * C-37: live `slideUrls` win; else live thumb single-slide; else picsum synthetic (mock).
 */
export function buildCompetitorSlides(
  post: FeedPost,
): CompetitorCarouselSlide[] {
  if (post.slideUrls && post.slideUrls.length > 0) {
    return post.slideUrls.map((url, i) => {
      const tag =
        post.topicTags?.[i % (post.topicTags.length || 1)] ?? "carousel";
      return {
        id: `${post.id}-slide-${i}`,
        imageUrl: url,
        caption: i === 0 ? post.title : `Слайд ${i + 1} · ${tag}`,
      };
    });
  }

  // Live without children URLs: keep real cover, avoid picsum (D3)
  if (post.sourceMode === "live" && post.thumbUrl) {
    return [
      {
        id: `${post.id}-slide-0`,
        imageUrl: post.thumbUrl,
        caption: post.title,
      },
    ];
  }

  const n = 3 + (seedNum(post.id) % 3); // 3..5
  const base = post.thumbUrl ?? picsum(`cf-razbor-comp-${post.id}`, 720, 1200);
  const slides: CompetitorCarouselSlide[] = [
    {
      id: `${post.id}-slide-0`,
      imageUrl: base,
      caption: post.title,
    },
  ];
  for (let i = 1; i <= n; i++) {
    slides.push({
      id: `${post.id}-slide-${i}`,
      imageUrl: picsum(`cf-razbor-comp-${post.id}-s${i}`, 720, 1200),
      caption: `Слайд ${i + 1} · ${post.topicTags?.[i % (post.topicTags.length || 1)] ?? "carousel"}`,
    });
  }
  return slides;
}

/** Seed brief for Scriptwriter (not Analyst surface). */
export function proposeScenario(post: FeedPost): string {
  const tags = post.topicTags?.slice(0, 3).join(", ") || "club, guest-night";
  return [
    `Vernatun take on «${post.title}»`,
    `Hook: Armenian Club guest night — 5 branded beats (not a clone).`,
    `Tone: warm gold / glass cards; logo on cover + finale.`,
    `Topics: ${tags}.`,
    `CTA: сохранить / записаться на guest night.`,
  ].join("\n");
}

function resolveSlideCount(post: FeedPost): number {
  if (post.slideUrls && post.slideUrls.length > 0) {
    return post.slideUrls.length;
  }
  // Mock / missing slides: deterministic 4..6 rhythm (C-30)
  return 4 + (seedNum(post.id) % 3);
}

function isLiveSource(post: FeedPost): boolean {
  return post.sourceMode === "live";
}

/** User copy: say «рилс» only when the post is actually video. */
function isCompetitorVideoPost(post: FeedPost): boolean {
  const type = (post.mediaType ?? "").trim().toUpperCase();
  if (type === "IMAGE") return false;
  if (type === "VIDEO") return true;
  return isPlayableVideoUrl(post.mediaUrl);
}

/**
 * C-51 — Idle greeting only. Call on modal open; do NOT run analysis here.
 */
export function buildAnalystWelcomeMessages(
  post: FeedPost,
): RazborChatMessage[] {
  return [
    {
      id: `${post.id}-welcome`,
      agentId: "analyst",
      delayMs: 220,
      /** S47 — short welcome only (no post title fluff). */
      text: "Привет! Я Разборщик Vernatun. Нажмите «Начать разбор», когда будете готовы.",
    },
  ];
}

/**
 * C-32 — Analyst surfaces detailed breakdown only (no scenario pitch).
 * C-35 — live cites real metrics + slideCount; mock keeps C-30 templates.
 * Call only after user CTA «Начать разбор» (via `startRazbor`).
 */
export function buildAnalystMessages(post: FeedPost): RazborChatMessage[] {
  const { views, likes, comments } = post.metrics;
  const eng =
    views > 0 ? ((likes / views) * 100).toFixed(1) : "0.0";
  const tags = post.topicTags?.slice(0, 3).join(", ") || "club / guest-night";
  const slideCount = resolveSlideCount(post);
  const live = isLiveSource(post);
  const handle = post.username ? `@${post.username}` : null;
  const permalinkLine = post.permalink
    ? `Permalink: ${post.permalink}`
    : null;

  if (live) {
    const commentPart =
      typeof comments === "number"
        ? ` · ${formatMetric(comments)} comments`
        : "";
    return [
      {
        id: `${post.id}-a1`,
        agentId: "analyst",
        delayMs: 280,
        text: [
          `Live-разбор карусели «${post.title}»${handle ? ` (${handle})` : ""}.`,
          `Факт-метрики: ${formatMetric(views)} views · ${formatMetric(likes)} likes${commentPart}.`,
          `Слайдов: ${slideCount}${permalinkLine ? ` · ${permalinkLine}` : ""}.`,
          `Engagement ≈ ${eng}% · темы: ${tags}.`,
        ].join("\n"),
      },
      {
        id: `${post.id}-a2`,
        agentId: "analyst",
        delayMs: 520,
        text: [
          `Структура (${slideCount} кадров из live media):`,
          `1. Cover — тема + визуальный якорь`,
          `2. Hook — боль/интрига в первых 1–2 сек`,
          `3–${Math.max(3, slideCount - 1)}. Value beats — tip / vibe / social proof`,
          `${slideCount}. Finale — CTA (сохранить / записаться)`,
          `Ритм: короткий текст на кадр, swipe каждые ~2–3 сек.`,
        ].join("\n"),
      },
      {
        id: `${post.id}-a3`,
        agentId: "analyst",
        delayMs: 740,
        text: [
          `Почему держит (по фактам входа):`,
          `· ${formatMetric(likes)} likes при ${formatMetric(views)} views — cover обещает конкретную пользу`,
          `· ${slideCount} слайдов — достаточно глубины swipe без перегруза`,
          `· CTA в конце не спорит с mid-slides`,
          `· Не клонируем permalink конкурента — Vernatun-угол`,
          `Дальше — Сценарист: полный сценарий (роли / сюжет / текст / место). Дизайнеру задание не передаю.`,
        ].join("\n"),
      },
    ];
  }

  const swipeDepth = Math.min(92, 58 + (seedNum(post.id) % 30));
  const hookScore = (6.5 + (seedNum(post.id) % 30) / 10).toFixed(1);

  return [
    {
      id: `${post.id}-a1`,
      agentId: "analyst",
      delayMs: 280,
      text: [
        `Разбор карусели «${post.title}».`,
        `Метрики: ${formatMetric(views)} views · ${formatMetric(likes)} likes${typeof comments === "number" ? ` · ${formatMetric(comments)} comments` : ""}.`,
        `Engagement ≈ ${eng}% · темы: ${tags}.`,
      ].join("\n"),
    },
    {
      id: `${post.id}-a2`,
      agentId: "analyst",
      delayMs: 520,
      text: [
        `Структура (${slideCount} кадров):`,
        `1. Cover — тема + визуальный якорь`,
        `2. Hook — боль/интрига в первых 1–2 сек`,
        `3–${slideCount - 1}. Value beats — tip / vibe / social proof`,
        `${slideCount}. Finale — CTA (сохранить / записаться)`,
        `Ритм: короткий текст на кадр, swipe каждые ~2–3 сек.`,
      ].join("\n"),
    },
    {
      id: `${post.id}-a3`,
      agentId: "analyst",
      delayMs: 740,
      text: [
        `Почему работает:`,
        `· Hook strength ≈ ${hookScore}/10 — cover обещает конкретную пользу`,
        `· Swipe-depth ≈ ${swipeDepth}% — алгоритм держит ≥4 кадров`,
        `· CTA в конце не спорит с mid-slides`,
        `· Контраст glass/gold читается в ленте`,
        `Дальше — Сценарист: полный сценарий (роли / сюжет / текст / место). Дизайнеру задание не передаю.`,
      ].join("\n"),
    },
  ];
}

export type RazborScriptMode = "script-only" | "carousel";

const IDEA_PALETTES = [
  { bg: "#0E1116", accent: "#C9A227", text: "#F4F0E6" },
  { bg: "#12161C", accent: "#7BA3C9", text: "#E8EEF4" },
  { bg: "#14110E", accent: "#C47A5A", text: "#F2E8DE" },
  { bg: "#0C1210", accent: "#6FA88A", text: "#E6F0EA" },
] as const;

/**
 * C-75 — carousel idea-brief (slides + texts + colors), not reels screenplay.
 */
export function buildCarouselIdeaBrief(post: FeedPost): RazborScript {
  const tags = post.topicTags?.slice(0, 2) ?? ["guest-night"];
  const tagA = tags[0] ?? "guest-night";
  const tagB = tags[1] ?? "armenian-club";
  const seed = seedNum(post.id);
  const count = 4 + (seed % 2); // 4..5
  const ideaSlides: RazborIdeaSlide[] = [];
  const slideTexts = [
    `Cover: «${post.title}» — Vernatun угол, без клона`,
    `Hook: боль / интрига вокруг ${tagA}`,
    `Value: tip + vibe (${tagB})`,
    `Social proof: гости клуба / soft CTA`,
    `Finale: Vernatun mark + «сохрани»`,
  ];
  for (let i = 0; i < count; i++) {
    const palette = IDEA_PALETTES[(seed + i) % IDEA_PALETTES.length]!;
    ideaSlides.push({
      index: i + 1,
      text: slideTexts[i] ?? `Слайд ${i + 1} · ${tagA}`,
      colors: { ...palette },
    });
  }
  const colorsLine = ideaSlides
    .map((s) => `S${s.index}:${s.colors.bg}/${s.colors.accent}`)
    .join(" · ");
  const handoffPayload = [
    `Карусель 1: ${post.title}`,
    `слайды: ${ideaSlides.map((s) => `${s.index}) ${s.text}`).join("; ")}`,
    `цвета: ${colorsLine}`,
  ].join(" — ");

  return {
    roles: ["idea-brief"],
    plot: ideaSlides.map((s) => `S${s.index}: ${s.text}`).join(" | "),
    text: ideaSlides
      .map(
        (s) =>
          `Слайд ${s.index}: ${s.text}\n  bg ${s.colors.bg} · accent ${s.colors.accent} · text ${s.colors.text}`,
      )
      .join("\n\n"),
    location: "карусель 9:16 · glass cards",
    ideaSlides,
    handoffPayload,
  };
}

/**
 * Deterministic full script from competitor reel (C-51 contract).
 * Pass `mode: "carousel"` for C-75 idea-brief instead of reels screenplay.
 */
export function buildRazborScript(
  post: FeedPost,
  mode: RazborScriptMode = "script-only",
): RazborScript {
  if (mode === "carousel") {
    return buildCarouselIdeaBrief(post);
  }

  const tags = post.topicTags?.slice(0, 2) ?? ["guest-night"];
  const tagA = tags[0] ?? "guest-night";
  const tagB = tags[1] ?? "armenian-club";
  const seed = seedNum(post.id);
  const locationVariants = [
    "Зал Armenian Club, тёплый свет, бар на фоне",
    "Терраса клуба вечером, городские огни Еревана",
    "VIP-зона у длинного стола, glass-карточки меню",
  ];
  const location = locationVariants[seed % locationVariants.length]!;

  return {
    roles: ["host (ведущий клуба)", "guest (гость вечера)", "VO off-camera (опционально)"],
    plot: [
      `Beat 1 — Cover: ведущий у входа, обещание «${post.title}» без клона конкурента.`,
      `Beat 2 — Hook: боль гостя / интрига вокруг ${tagA}.`,
      `Beat 3–4 — Value: tip / vibe / social proof (${tagB}).`,
      `Beat 5 — Soft CTA: сохранить / записаться на guest night.`,
      `Beat 6 — Finale: Vernatun mark + «сохрани».`,
    ].join(" "),
    text: [
      `HOST: «Armenian Club. Сегодня — наш take на ${tagA}.»`,
      `GUEST: «Я пришёл за атмосферой, а остался из-за людей.»`,
      `HOST: «Три вещи, которые забираешь с собой: ${tagA}, ${tagB}, soft CTA.»`,
      isCompetitorVideoPost(post)
        ? `VO: «Не копия чужого рилса — Vernatun-угол. Сохрани и приходи на guest night.»`
        : `VO: «Не копия чужого поста — Vernatun-угол. Сохрани и приходи на guest night.»`,
    ].join("\n"),
    location,
  };
}

function formatScriptMessage(script: RazborScript): string {
  if (script.ideaSlides && script.ideaSlides.length > 0) {
    return [
      `Idea-brief карусели (не reels-сценарий)`,
      script.handoffPayload ?? "",
      ``,
      script.text,
    ]
      .filter(Boolean)
      .join("\n");
  }
  return [
    `roles: ${JSON.stringify(script.roles)}`,
    `plot: ${script.plot}`,
    `text:`,
    script.text,
    `location: ${script.location}`,
  ].join("\n");
}

/**
 * Full script messages (roles / plot / text / location).
 * `script-only` (C-51, default): no Designer handoff.
 * `carousel` (C-59/C-75): idea-brief for Designer + CTA to publisher (UI).
 */
export function buildScriptwriterMessages(
  post: FeedPost,
  scenario?: string,
  scriptOverride?: RazborScript,
  mode: RazborScriptMode = "script-only",
): RazborChatMessage[] {
  const script = scriptOverride ?? buildRazborScript(post, mode);
  const briefLine =
    (scenario ?? proposeScenario(post)).split("\n")[0] ?? post.title;
  const carousel = mode === "carousel";

  return [
    {
      id: `${post.id}-s1`,
      agentId: "scriptwriter",
      delayMs: 320,
      text: [
        `Принял разбор Разборщика по «${post.title}».`,
        carousel
          ? `Готовлю idea-brief карусели: тексты слайдов + цвета + структура (не reels-сценарий).`
          : `Пишу полный Vernatun-сценарий (роли · сюжет · текст · место).`,
        `Краткий brief: ${briefLine}`,
        carousel
          ? `После handoff Дизайнер соберёт макет по brief.`
          : `Дизайнеру задание не передаю — только сценарий.`,
      ].join("\n"),
    },
    {
      id: `${post.id}-s2`,
      agentId: "scriptwriter",
      delayMs: 520,
      text: formatScriptMessage(script),
    },
    {
      id: `${post.id}-s3`,
      agentId: "scriptwriter",
      delayMs: 640,
      text: carousel
        ? [
            `Idea-brief готов. Можно править тексты/цвета через чат.`,
            `Когда будете готовы — «Передать задание» дизайнеру (формат: «Карусель N: …»).`,
          ].join("\n")
        : [
            `Сценарий готов. Можно править через чат (роли / сюжет / текст / место).`,
            `Карусель и дизайнер вне этого разбора — черновик сюда не собираю.`,
          ].join("\n"),
    },
  ];
}

/**
 * C-51 — Chat revision for Scriptwriter (no Designer).
 * Returns updated script + agent reply bubble(s).
 */
export function applyScriptwriterChatRevision(
  post: FeedPost,
  userNote: string,
  currentScript?: RazborScript,
): { script: RazborScript; reply: RazborChatMessage } {
  const base = currentScript ?? buildRazborScript(post);
  const note = userNote.trim();
  const lower = note.toLowerCase();

  let script: RazborScript = { ...base, roles: [...base.roles] };

  if (lower.includes("роль") || lower.includes("role")) {
    script = {
      ...script,
      roles: [...script.roles, `правка: ${note.slice(0, 80)}`],
    };
  } else if (lower.includes("место") || lower.includes("локац") || lower.includes("location")) {
    script = {
      ...script,
      location: `${base.location} · правка: ${note.slice(0, 120)}`,
    };
  } else if (lower.includes("сюжет") || lower.includes("plot") || lower.includes("бит")) {
    script = {
      ...script,
      plot: `${base.plot} · правка: ${note.slice(0, 160)}`,
    };
  } else {
    script = {
      ...script,
      text: `${base.text}\n\n[правка] ${note.slice(0, 200)}`,
    };
  }

  const seq = seedNum(`${post.id}:${note}`).toString(36).slice(0, 6);
  return {
    script,
    reply: {
      id: `${post.id}-s-rev-${seq}`,
      agentId: "scriptwriter",
      delayMs: 280,
      role: "agent",
      text: [
        `Ок, учёл правку.`,
        formatScriptMessage(script),
      ].join("\n\n"),
    },
  };
}

/**
 * C-59 — Designer mock messages after Scriptwriter (carousel-engine only).
 */
export function buildDesignerMessages(
  post: FeedPost,
  draft: CarouselDraft,
  script?: RazborScript,
): RazborChatMessage[] {
  const brief =
    script?.handoffPayload ??
    `Карусель 1: ${post.title} — макет по idea-brief`;
  return [
    {
      id: `${post.id}-d1`,
      agentId: "designer",
      delayMs: 280,
      text: [
        `Принял idea-brief:`,
        brief,
        `Собираю макет слайдов Vernatun (${draft.slides.length} кадров).`,
      ].join("\n"),
    },
    {
      id: `${post.id}-d2`,
      agentId: "designer",
      delayMs: 480,
      text: [
        `Макет готов: ${draft.slides.length} слайдов.`,
        `Справа — тумблер «Конкурент» / «Наши».`,
        `В чате можно сократить набор («сделай 3 слайда», «убери последний») или попросить визуальную правку.`,
      ].join("\n"),
    },
  ];
}

function clampSlideCount(n: number): number {
  if (!Number.isFinite(n)) return 2;
  return Math.min(8, Math.max(2, Math.round(n)));
}

function restyleSlides(
  post: FeedPost,
  slides: CarouselDraftSlide[],
  note: string,
): CarouselDraftSlide[] {
  const seq = seedNum(`${post.id}:${note}`).toString(36).slice(0, 5);
  return slides.map((slide, i) => ({
    ...slide,
    caption: `${slide.caption ?? `Слайд ${i + 1}`} · визуал: ${note.slice(0, 48)}`,
    imageUrl:
      slide.brandLogoUrl ??
      picsum(`cf-razbor-ours-${post.id}-v-${seq}-${i}`, 720, 1200),
  }));
}

function resizeBrandedSlides(
  post: FeedPost,
  current: CarouselDraftSlide[],
  targetCount: number,
  note: string,
): CarouselDraftSlide[] {
  const count = clampSlideCount(targetCount);
  const kit = getBrandPack();
  const seq = seedNum(`${post.id}:${note}:${count}`).toString(36).slice(0, 6);
  const next: CarouselDraftSlide[] = [];
  for (let i = 0; i < count; i++) {
    const prev = current[i];
    const isLogo = i === 0 || i === count - 1;
    next.push({
      id: prev?.id ?? `ours-${post.id}-slide-${i}-${seq}`,
      imageUrl: isLogo
        ? kit.logoUrl
        : picsum(`cf-razbor-ours-${post.id}-${seq}-${i}`, 720, 1200),
      brandLogoUrl: isLogo ? kit.logoUrl : undefined,
      caption: isLogo
        ? i === 0
          ? `Cover · ${kit.name} logo`
          : `Finale · ${kit.name} logo + CTA`
        : prev?.caption ?? `Beat ${i} · branded glass`,
    });
  }
  return next;
}

export type DesignerRevisionResult = {
  slides: CarouselDraftSlide[];
  reply: RazborChatMessage;
};

/**
 * C-59 mock Designer chat (carousel-engine). Deterministic from competitorId + note.
 * «сделай 3 слайда» → length 3; «короче» / «убери кадр» → length − 1 (min 2);
 * иначе caption/visual note, length unchanged.
 */
export function applyDesignerChatRevision(
  post: FeedPost,
  userNote: string,
  currentSlides: CarouselDraftSlide[],
): DesignerRevisionResult {
  const note = userNote.trim();
  const lower = note.toLowerCase();
  const seq = seedNum(`${post.id}:${note}`).toString(36).slice(0, 6);
  const countMatch = lower.match(/(\d+)\s*слайд/);

  let slides: CarouselDraftSlide[];
  let summary: string;

  if (countMatch) {
    const target = clampSlideCount(Number(countMatch[1]));
    slides = resizeBrandedSlides(post, currentSlides, target, note);
    summary = `Собрал набор из ${slides.length} слайдов.`;
  } else if (
    lower.includes("короче") ||
    lower.includes("убери кадр") ||
    lower.includes("убери последний") ||
    lower.includes("меньше слайд")
  ) {
    const target = clampSlideCount(currentSlides.length - 1);
    slides = resizeBrandedSlides(post, currentSlides, target, note);
    summary = `Убрал кадр — осталось ${slides.length}.`;
  } else {
    slides = restyleSlides(post, currentSlides, note);
    summary = `Оставил ${slides.length} слайдов, обновил визуал/подписи.`;
  }

  return {
    slides,
    reply: {
      id: `${post.id}-d-rev-${seq}`,
      agentId: "designer",
      delayMs: 260,
      role: "agent",
      text: [`Ок, учёл правку.`, summary].join("\n"),
    },
  };
}

export function buildBrandedSlides(post: FeedPost): CarouselDraftSlide[] {
  const kit = getBrandPack();
  const count = 5;
  const slides: CarouselDraftSlide[] = [];
  for (let i = 0; i < count; i++) {
    const isLogo = i === 0 || i === count - 1;
    slides.push({
      id: `ours-${post.id}-slide-${i}`,
      imageUrl: isLogo
        ? kit.logoUrl
        : picsum(`cf-razbor-ours-${post.id}-${i}`, 720, 1200),
      brandLogoUrl: isLogo ? kit.logoUrl : undefined,
      caption: isLogo
        ? i === 0
          ? `Cover · ${kit.name} logo (${kit.logoUrl})`
          : `Finale · ${kit.name} logo + CTA`
        : `Beat ${i} · branded glass · ${kit.palette.primary ?? "#C25E28"}`,
    });
  }
  return slides;
}

function draftBrandSnapshot(): CarouselDraftBrand {
  const kit = getBrandPack();
  const primary = kit.palette.cognac ?? kit.palette.primary ?? "#C25E28";
  const gold = kit.palette["sun-gold"] ?? kit.palette.secondary ?? "#E6B25A";
  return {
    logoUrl: kit.logoUrl,
    name: kit.name,
    paletteNote: `cognac ${primary} · gold ${gold}`,
    note: brandKitAgentNote(kit),
  };
}

/**
 * Draft factory. C-59: Razbor carousel-engine MAY call this + upsertDraft.
 * Other modules still must not (C-51).
 */
export function buildCarouselDraft(post: FeedPost, scenario: string): CarouselDraft {
  const now = new Date().toISOString();
  const id = `draft-razbor-${post.id}`;
  return {
    id,
    sourceCompetitorId: post.id,
    competitorId: post.id,
    title: `Razbor · ${post.title}`,
    slides: buildBrandedSlides(post),
    scenario,
    status: "unpublished",
    createdAt: now,
    updatedAt: now,
    brand: draftBrandSnapshot(),
  };
}

export type RazborWelcomePayload = {
  competitorId: string;
  competitor: FeedPost;
  competitorSlides: CompetitorCarouselSlide[];
  welcomeMessages: RazborChatMessage[];
};

export type RazborAnalysisPayload = {
  competitorId: string;
  competitor: FeedPost;
  competitorSlides: CompetitorCarouselSlide[];
  scenario: string;
  analystMessages: RazborChatMessage[];
};

/** C-51 — Script-only cascade (no designerMessages, no draft). */
export type RazborCascadePayload = {
  competitorId: string;
  scenario: string;
  script: RazborScript;
  scriptwriterMessages: RazborChatMessage[];
};

/** C-59 — Designer leg (carousel-engine only). */
export type RazborDesignerPayload = {
  competitorId: string;
  scenario: string;
  designerMessages: RazborChatMessage[];
  draft: CarouselDraft;
};

/** Resolve competitor from carousel-engine fixtures (deterministic). */
export function findCarouselCompetitor(
  competitorId: string,
): FeedPost | null {
  const feed = getFeedForModule("carousel-engine");
  return feed.competitors.find((p) => p.id === competitorId) ?? null;
}

/**
 * C-51 — Call on modal open. Welcome only; no analysis auto-run.
 */
export function getRazborWelcome(
  competitorId: string,
  postOverride?: FeedPost,
): RazborWelcomePayload | null {
  const competitor =
    postOverride ?? findCarouselCompetitor(competitorId);
  if (!competitor) return null;

  return {
    competitorId: competitor.id,
    competitor,
    competitorSlides: buildCompetitorSlides(competitor),
    welcomeMessages: buildAnalystWelcomeMessages(competitor),
  };
}

/**
 * C-51 — Run after CTA «Начать разбор». Alias of analysis step.
 */
export function startRazbor(
  competitorId: string,
  postOverride?: FeedPost,
): RazborAnalysisPayload | null {
  return runRazborAnalysis(competitorId, postOverride);
}

export function runRazborAnalysis(
  competitorId: string,
  postOverride?: FeedPost,
): RazborAnalysisPayload | null {
  const competitor =
    postOverride ?? findCarouselCompetitor(competitorId);
  if (!competitor) return null;

  const scenario = proposeScenario(competitor);
  return {
    competitorId: competitor.id,
    competitor,
    competitorSlides: buildCompetitorSlides(competitor),
    scenario,
    analystMessages: buildAnalystMessages(competitor),
  };
}

/**
 * C-51 — Scriptwriter leg only (after analysis). No Designer, no draft.
 * Pass `mode: "carousel"` for C-59 script copy (still no draft on this payload).
 */
export function runRazborCascade(
  competitorId: string,
  postOverride?: FeedPost,
  mode: RazborScriptMode = "script-only",
): RazborCascadePayload | null {
  const competitor =
    postOverride ?? findCarouselCompetitor(competitorId);
  if (!competitor) return null;

  const scenario = proposeScenario(competitor);
  const script = buildRazborScript(competitor, mode);
  return {
    competitorId: competitor.id,
    scenario,
    script,
    scriptwriterMessages: buildScriptwriterMessages(
      competitor,
      scenario,
      script,
      mode,
    ),
  };
}

/** Alias for FE clarity — same as `runRazborCascade`. */
export function runRazborScript(
  competitorId: string,
  postOverride?: FeedPost,
  mode: RazborScriptMode = "script-only",
): RazborCascadePayload | null {
  return runRazborCascade(competitorId, postOverride, mode);
}

/**
 * C-59 — Designer mock + draft (carousel-engine). Caller upserts via store.
 */
export function runRazborDesigner(
  competitorId: string,
  postOverride?: FeedPost,
  script?: RazborScript,
): RazborDesignerPayload | null {
  const competitor =
    postOverride ?? findCarouselCompetitor(competitorId);
  if (!competitor) return null;

  const scenario = proposeScenario(competitor);
  const draft = buildCarouselDraft(competitor, scenario);
  return {
    competitorId: competitor.id,
    scenario,
    draft,
    designerMessages: buildDesignerMessages(competitor, draft, script),
  };
}

export function messagesForAgent(
  payload: RazborCascadePayload | RazborDesignerPayload,
  agentId: RazborAgentId,
): RazborChatMessage[] {
  if (agentId === "publisher") return [];
  if (agentId === "scriptwriter" && "scriptwriterMessages" in payload) {
    return payload.scriptwriterMessages;
  }
  if (agentId === "designer" && "designerMessages" in payload) {
    return payload.designerMessages;
  }
  return [];
}
