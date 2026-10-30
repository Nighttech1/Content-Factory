/**
 * C-137 — seed MeshAgent records from pack catalog + per-pipeline specs.
 * C-151/C-152 — distinct PIPELINE_COPY per module; custom-reels = Сценарист / Монтажёр.
 */

import {
  AGENT_PACK_CATALOG,
  type AgentPackMeta,
} from "@/lib/settings/agent-pack-catalog";
import {
  copywriterPackId,
  laneAModeFor,
  MESH_PIPELINE_LABELS,
  type MeshPipelineId,
} from "@/lib/mesh-roles";
import type { MeshAgent } from "@/types/mesh-agent";
import {
  DEFAULT_CAROUSEL_IMAGE_MODEL,
  DEFAULT_DESIGNER_TEXT_MODEL,
  DEFAULT_SCRIPTWRITER_MODEL,
} from "@/types/mesh-agent";
import {
  RAZBOR_ANALYST_MODEL,
  RAZBOR_ANALYST_SYSTEM_PROMPT,
} from "@/lib/studio/razbor-live-shared";
import {
  ART_DIRECTOR_AGENT_ID,
  ART_DIRECTOR_DISPLAY_NAME,
  ART_DIRECTOR_SYSTEM_PROMPT,
} from "@/lib/studio/art-director-review";

/**
 * C-140 — combat system briefs per content module (RU).
 * S52: Vernatun = publisher/brand OK; TOPIC never hardcoded (coffee/jazz/club ritual).
 * Topic/theme comes only from the user message (or smoke theme pool).
 */
export const COMBAT_USER_BRIEFS: Record<MeshPipelineId, string> = {
  "carousel-engine": [
    "МИССИЯ: карусель Instagram 4:5 Vernatun (publisher brand); число слайдов = N из запроса пользователя или sheet (не угадывать).",
    "АУДИТОРИЯ: 25–45, премиальный армянский community / cultural brand Vernatun — тон и голос бренда, НЕ тема контента.",
    "ТОН: тёплый, культурный, без инфобиз-воды. Brand Vernatun OK как издатель.",
    "TOPIC LOCK (HARD · S52): тема/сюжет карусели = ТОЛЬКО из сообщения пользователя или строки Google Sheet. ЗАПРЕТ предполагать кофе / джаз / клубный ритуал / «вечер в клубе» как default topic. Few-shots с кофе = style craft only.",
    "MODE: meetings | useful ({{MODE}}) — Create chat ⊕ sheet entry.",
    "СТРУКТУРА: cover ≤6–8 слов → value/proof → CTA; swipe_trigger META на каждом слайде; ритм под N.",
    "АРТЕФАКТ: strict JSON (requested_slide_count === slides.length) → critic 05 ≤2 → Designer image_prompt-only.",
    "ЗАПРЕТЫ: нет стоковых фраз «лучший вечер в городе», нет чужих логотипов, нет хардкода 5 слайдов, нет topic-lock на кофе/клуб.",
    "CTA флаги 1–3 (лист 2): 1 встреча разговорного клуба (детали в шапке профиля) · 2 делитесь в комментариях · 3 сохрани и подпишись на подборки. Сценарий пишется ПОД финальный CTA.",
  ].join("\n"),
  "aesthetic-graphics": [
    "МИССИЯ: одна полезная картинка / инфографика 1:1 или 4:5 под brandbook.",
    "АУДИТОРИЯ: подписчики, которые сохраняют шпаргалки в избранное.",
    "ТОН: ясный экспертный тезис, без воды.",
    "СТРУКТУРА: заголовок-тезис → 3–5 пунктов → микро-CTA.",
    "ЗАПРЕТЫ: клиппарт, нечитаемый мелкий текст, чужие стоковые фото лиц.",
    "CTA: сохранить / отправить другу.",
  ].join("\n"),
  "cartoon-reels": [
    "МИССИЯ: мульт-рилс 9:16, 15–25с, 2D-сторителлинг с битами.",
    "АУДИТОРИЯ: Recs / Reels, короткая досматриваемость.",
    "ТОН: живые реплики, лёгкий юмор без токсичности.",
    "СТРУКТУРА: хук 0–2с → конфликт/поворот → punchline → CTA.",
    "ЗАПРЕТЫ: водяные лого, мелкие субтитры, затяжной интро-текст.",
    "CTA: комментарий / подписка / переход в профиль.",
  ].join("\n"),
  "heygen-reels": [
    "МИССИЯ: spoken-сценарий для AI-аватара HeyGen, 20–45с, 9:16.",
    "АУДИТОРИЯ: смотрят в звуке и без — captions обязательны.",
    "ТОН: естественная речь от первого лица, без канцелярита.",
    "СТРУКТУРА: spoken hook → 2–3 тезиса → CTA в речи и на экране.",
    "ЗАПРЕТЫ: неестественные списки вслух, длинные паузы, англицизмы без нужды.",
    "CTA: записаться / написать в Direct / ссылка в шапке.",
  ].join("\n"),
  "site-articles": [
    "МИССИЯ: статья на сайт: SEO-заголовок, лид, 600–1200 слов, финальный CTA.",
    "АУДИТОРИЯ: поисковый и брендовый трафик клуба/проекта.",
    "ТОН: экспертный, читаемый, без кликбейта.",
    "СТРУКТУРА: H1 → лид → H2-блоки → вывод → CTA.",
    "ЗАПРЕТЫ: дубли H1, тонкие абзацы без смысла, скрытый SEO-спам.",
    "CTA: бронь / заявка / подписка на рассылку.",
  ].join("\n"),
  "tg-articles": [
    "МИССИЯ: пост или лонгрид Telegram с хуком в первой строке.",
    "АУДИТОРИЯ: подписчики канала, читают с телефона.",
    "ТОН: прямой, разговорный, без лишних эмодзи.",
    "СТРУКТУРА: хук → ценность → абзацы → кнопка/ссылка.",
    "ЗАПРЕТЫ: стена текста без абзацев, кликбейт без факта.",
    "CTA: кнопка перехода / ответ боту / бронь.",
  ].join("\n"),
  "custom-reels": [
    "МИССИЯ: вертикальный рилс 9:16, 15–30с — сценарий для Сценариста → Монтажёр (не карусель).",
    "АУДИТОРИЯ: холодный Recs + тёплые подписчики; mute-proof on-screen.",
    "ТОН: Vernatun — культурный, ритуал/кофе/город; без инфобиз-воды.",
    "СТРУКТУРА: hook 0–2с → 2–4 value beats → CTA on-screen + captionLine.",
    "АРТЕФАКТ: reels JSON (hook/beats/cta/promptForMontage) — не slides[] 4:5.",
    "ЗАПРЕТЫ: тихие первые 2с; плоский VO без хука; carousel JSON; promptForDesigner.",
    "CTA: сохранить / коммент / follow / link-in-bio — явно на экране и в подписи.",
  ].join("\n"),
  "custom-clips-to-reels": [
    "МИССИЯ: нарезка сильного момента из длинного видео в короткий рилс.",
    "АУДИТОРИЯ: не смотрели полное видео — нужен самодостаточный клип.",
    "ТОН: энергия исходника, без «досмотрите до конца» как единственного хука.",
    "СТРУКТУРА: момент-хук → контекст 1 фразой → punch → CTA.",
    "ЗАПРЕТЫ: длинные паузы, обрезка на полуслове без субтитров.",
    "CTA: смотреть полное / подписаться / сохранить.",
  ].join("\n"),
  "custom-info-video": [
    "МИССИЯ: информационное видео: 3–5 тезисов + VO + финальный CTA.",
    "АУДИТОРИЯ: хотят пользу за 45–90с, не развлечение ради мема.",
    "ТОН: спокойный экспертный, чёткие формулировки.",
    "СТРУКТУРА: тема → тезисы с иллюстрациями → вывод → CTA.",
    "ЗАПРЕТЫ: перегруз анимацией, неподтверждённые факты.",
    "CTA: скачать гайд / записаться / перейти на сайт.",
  ].join("\n"),
};

/**
 * @deprecated Use COMBAT_USER_BRIEFS[pipelineId]; kept for legacy accordion hints.
 * S52: do NOT inject as product TOPIC — jazz/coffee atmosphere is legacy mock only.
 */
export const MOCK_USER_BRIEF = {
  audience:
    "25–45 лет, ценители премиального отдыха и культурного community.",
  atmosphere: "Тёплый вечер, приглушенный свет, живой разговор.",
  accent: "Brand Vernatun — publisher; topic comes from user message only.",
} as const;

/**
 * @deprecated S49 — Team basic brief deleted. Kept for smoke/migrate; callers
 * must NOT inject into Create chat or agent user turns (`loadUserBrief` → "").
 */
export function defaultCombatBrief(pipelineId: MeshPipelineId): string {
  return COMBAT_USER_BRIEFS[pipelineId] ?? COMBAT_USER_BRIEFS["carousel-engine"];
}

type PipelineCopySpec = {
  copywriterName: string;
  designerName: string;
  /** Card role chip; default `Копирайтер · {ModuleName}`. */
  copywriterRole?: string;
  /** Card role chip; default «Дизайн / сборка». */
  designerRole?: string;
  copywriterPrompt: string;
  designerPrompt: string;
  copywriterSkills: string[];
  designerSkills: string[];
  copywriterRules: string[];
  designerRules: string[];
  /**
   * Brand lock hint in designer systemPrompt (carousel/graphics).
   * Runtime tokens come from Settings Embla **active** DESIGN.md (`activeDesignId`),
   * not only docs/DESIGN.md — see `lib/settings/design-library.ts`.
   */
  designerUsesDesignMd?: boolean;
};

const PIPELINE_COPY: Record<MeshPipelineId, PipelineCopySpec> = {
  "carousel-engine": {
    copywriterName: "Копирайтер каруселей",
    designerName: "Дизайнер карусели",
    // S57 layered_html — short role identity; HARD in Create overlays.
    copywriterPrompt: [
      "Роль: Сценарист каруселей Instagram 4:5 Vernatun (Dramaturgy & Hook Engine) · S57 layered_html.",
      "Артефакт: STRICT JSON slides[] → zod + critic 05 (retry ≤2) → Designer. Не рилс, не auto-handoff.",
      "primary ≤8 words; secondary_copy REQUIRED every slide — MUCH wider body (≥220 chars AND ≥5 clauses; steps/example/micro-instruction); visual_prompt SCENE ONLY + RICH (≥3 elements; Armenian motifs OPTIONAL if topic asks — no laundry list).",
      "Auto N=7 for «N способов/советов». CTA 1–4 + swipe_trigger META KEEP. Modes meetings|useful; Create ⊕ sheet.",
      "Combat rules: Create agent-start — не дублируй полный HARD здесь.",
    ].join(" "),
    designerPrompt: [
      "Роль: Дизайнер карусели (Layered Visual Engine · Variant A) — describe → «Нарисовать».",
      "S57 product: image-2 paints BACKGROUND ONLY (NO TEXT NO LOGO) from visual_prompt.",
      "MUST emit per slide: image_prompt (bg) + html_layout (template/text_block/highlights/chrome).",
      "Default path: FULL DESIGN TOKENS (colors+fonts+sizes) every draw; html_layout = placement + variety + fontFit reduce-only.",
      "Exception styleCopyMode=vision_ref: HARD-COPY etalon image reference; SKIP token-card role table; Brand Vernatun content swap only; emit bgFit; characterPaint default in_image.",
      "brandChrome default bottom-right (name right of icon — Backend CSS) unless etalon/map says otherwise. Slide num = own HTML slot when allowed.",
      "Composite executes html_layout — no raw HTML/CSS from LLM. Vision OFF.",
      "renderMode=layered_html. swipe_trigger META never on-slide.",
      "Combat rules: Create agent-start overlays — не дублируй полный HARD здесь.",
    ].join(" "),
    copywriterSkills: [
      "Dramaturgy JSON",
      "Dynamic N / auto-7 N-ways",
      "Modes meetings|useful",
      "primary ≤8 + secondary_copy REQUIRED",
      "visual_prompt SCENE ONLY + RICH (≥3; motifs optional)",
      "secondary_copy ≥220 chars AND ≥5 clauses",
      "swipe_trigger META + CTA 1–4",
      "needs_input when blocked",
      "Consume Razbor insights",
      "Sprint9 golden likeness",
      "Handoff JSON дизайнеру",
    ],
    designerSkills: [
      "Parse slides[] any length",
      "Describe→Нарисовать",
      "Layered Visual Engine",
      "Variant A html_layout emit",
      "bg image_prompt NO TEXT NO LOGO",
      "FULL DESIGN TOKENS inject (token_card)",
      "vision_ref hard-copy + skip token table",
      "layout variety + fontFit reduce-only",
      "bgFit cover|contain|mask emit",
      "characterPaint default in_image",
      "brandChrome bottom-right hint",
      "highlight phrases ⊆ copy",
      "HTML type + Brand + CTA button",
      "Vision OFF (layered_html)",
      "Ignore swipe_trigger paint",
      "Anti purple-slop / black success",
      "Brand lock 1080×1350",
    ],
    copywriterRules: [
      "Не смешивать с рилс-сценариями",
      "Нет hardcode slide count (auto-7 OK)",
      "STRICT JSON + ask N if missing",
      "CTA ask 1–4 if missing",
      "secondary_copy required ≥220 chars AND ≥5 clauses on body",
      "visual_prompt scene-only + rich every slide",
      "Motifs optional — no laundry list",
      "Ban one-liner visual_prompt",
      "swipe_trigger never on-slide",
      "Critic retry ≤2 then needs_input",
      "Must-consume Razbor when present",
      "Без auto-handoff дизайнеру",
      "Без инфобиз-воды",
      "FAIL flat cover hooks",
      "No soft-mock on bad JSON",
    ],
    designerRules: [
      "token_card: цвета/CSS vars / scale из Settings",
      "vision_ref: skip token-card role table; hard-copy etalon",
      "layered_html: bg only — NO TEXT NO LOGO",
      "Variant A: image_prompt + html_layout every slide",
      "characterPaint product default = in_image",
      "html_layout = placement + variety OR etalon rhythm",
      "emit bgFit on vision_ref",
      "highlight phrase must be substring of copy",
      "closed template enum only",
      "HTML owns type + logo + CTA 1–4",
      "Vision OFF on product path",
      "No draw without visual_prompt",
      "Цикл по slides[] без fixed N",
      "Сначала описание, потом «Нарисовать»",
      "«Готово» только с composite PNG",
      "type-on-PNG / correct paint ≠ ship",
      "No purple-slop / black success",
    ],
    designerUsesDesignMd: true,
  },
  "aesthetic-graphics": {
    copywriterName: "Копирайтер графики",
    designerName: "Дизайнер графики",
    copywriterPrompt:
      "Тексты одной полезной картинки / шпаргалки: короткий тезис, пункты, микро-CTA. Не сценарий рилса и не пакет слайдов карусели.",
    designerPrompt:
      "Верстай одну статичную полезную картинку или инфографику 1:1 / 4:5 в токенах brandbook Vernatun. Не монтаж видео и не карусель из 5 слайдов.",
    copywriterSkills: ["Тезис на кадр", "Пункты шпаргалки", "Микро-CTA сохранить"],
    designerSkills: ["Цитата/карточка", "Инфографика 1:1·4:5", "Токены brandbook"],
    copywriterRules: ["Один главный тезис на кадр"],
    designerRules: ["Без клиппарта", "Читаемый кегль на мобиле"],
    designerUsesDesignMd: true,
  },
  "cartoon-reels": {
    copywriterName: "Копирайтер мульт-рилсов",
    designerName: "Дизайнер 2D",
    copywriterPrompt:
      "Сценарий битов и реплик для 2D-мульт-рилса 9:16: хук 0–2с, конфликт, punchline, CTA. Это рисованный сторителлинг — не spoken HeyGen и не монтаж сырого футажа.",
    designerPrompt:
      "Рисуй и компонуй 2D-сцены мульт-рилса 9:16 по битам сценария: персонажи, смена кадров, субтитры на бит. Не режь live-видео и не рендери HeyGen-аватар.",
    copywriterSkills: ["Бит-структура 2D", "Реплики персонажей", "Субтитры на бит"],
    designerSkills: ["2D-сцены", "Компоновка 9:16", "Синхрон субтитров с битом"],
    copywriterRules: ["Хук в первые 2 секунды", "Без затяжного интро-текста"],
    designerRules: ["Только вертикаль 9:16", "Без водяных лого"],
  },
  "heygen-reels": {
    copywriterName: "Копирайтер HeyGen",
    designerName: "Рендер HeyGen",
    copywriterPrompt:
      "Spoken-сценарий roles/plot для AI-аватара HeyGen 20–45с: естественная речь от первого лица, CTA в голосе и на экране. Не mute-монтаж сырых клипов.",
    designerPrompt:
      "Рендери AI-аватар HeyGen: голос, синхрон губ, captions. Вход — spoken-скрипт; выход — avatar reel. Не cut/join сырого футажа как Монтажёр рилсов.",
    copywriterSkills: ["Spoken hook", "Roles/plot HeyGen", "CTA в речи"],
    designerSkills: ["HeyGen аватар", "Синхрон губ", "Captions на речь"],
    copywriterRules: ["Естественная речь", "Без длинных списков вслух"],
    designerRules: ["Captions читаемы без звука"],
  },
  "site-articles": {
    copywriterName: "Копирайтер сайта",
    designerName: "Редактор сайта",
    designerRole: "Редакция / SEO-сборка",
    copywriterPrompt:
      "Черновик статьи на сайт: SEO-H1, лид, 600–1200 слов, H2-блоки, вывод. Тон клуба/проекта — не пост Telegram и не VO рилса.",
    designerPrompt:
      "Собери статью для сайта: иерархия заголовков, SEO meta, внутренние ссылки, финальный CTA. Не верстка IG-слайдов и не монтаж видео.",
    copywriterSkills: ["SEO-H1 и лид", "H2-блоки 600–1200", "Вывод + CTA-текст"],
    designerSkills: ["Иерархия H1–H2", "Meta/slug", "CTA-блок в конце"],
    copywriterRules: ["Ровно один H1", "Без скрытого SEO-спама"],
    designerRules: ["CTA в конце статьи", "Читаемые абзацы"],
  },
  "tg-articles": {
    copywriterName: "Копирайтер TG",
    designerName: "Редактор TG",
    designerRole: "Редакция / пост TG",
    copywriterPrompt:
      "Текст поста или лонгрида Telegram: хук в первой строке, ценность абзацами, кнопка/ссылка. Короче и разговорнее сайта; не SEO-статья.",
    designerPrompt:
      "Оформи пост/лонгрид Telegram под канал: абзацы с телефона, кнопка перехода, без лишних эмодзи. Не структура SEO-сайта и не слайды карусели.",
    copywriterSkills: ["Хук первой строки TG", "Абзацы с телефона", "Текст кнопки"],
    designerSkills: ["Верстка поста TG", "Кнопка/ссылка", "Плотность эмодзи"],
    copywriterRules: ["Хук в первой строке", "Без кликбейта без факта"],
    designerRules: ["Без лишних эмодзи", "Не стена текста"],
  },
  "custom-reels": {
    copywriterName: "Сценарист",
    designerName: "Монтажёр рилсов",
    copywriterRole: "Сценарист · Рилс",
    designerRole: "Монтаж рилса",
    // C-reels-scriptwriter-upgrade + Sprint 9 — verbatim intent from reels-scriptwriter skill
    copywriterPrompt: [
      "Ты Сценарист вертикального рилса 9:16 (15–30с) для Instagram Reels + YouTube Shorts — не копирайтер карусели и не Dramaturgy JSON (Sprint 9).",
      "Hook обязан попадать в 0–2 секунды; иначе FAIL.",
      "Структура: hook → 2–4 value beats → CTA on-screen + caption.",
      "Тайминг субтитров / VO на каждый beat; формат 9:16 15–30с.",
      "Primary artifact = STRICT JSON: contentType reels, durationSec, hook{t0,t1,onScreen,vo}, beats[{t0,t1,label,onScreen,vo}], cta{t0,t1,onScreen,vo,captionLine}, promptForMontage, caption?, hashtags?, roles?, location?.",
      "Mute-proof: on-screen readable without audio. Tone Vernatun — cultural/ritual/coffee/city; no «в этом видео я расскажу»; no soft open «Привет, сегодня…».",
      "PASS likeness: golden fixtures sprint9 reels (ig_coffee_ritual, yt_shorts_club_paradox, ig_mute_proof_cta).",
      "Handoff = promptForMontage + hook/beats/cta fields → Монтажёр рилсов (не Designer carousel paint, не HeyGen).",
      "Запрет: плоский VO без хука; тихие первые 2с; carousel slide JSON / slides[] 4:5; promptForDesigner.",
      "Parse fail / missing hook|beats|CTA = FAIL job — не soft-mock success. Critic gate before Draft.",
    ].join(" "),
    designerPrompt: [
      "Ты Монтажёр рилсов. На вход — СЫРЫЕ видеосъёмки (raw shot videos) + сценарий Сценариста (hook/beats/cta/promptForMontage).",
      "Обязан: нарезать и склеить клипы (cut/join), burn-in субтитры по таймингу beats, вставки между шотами, эффекты,",
      "при необходимости — сгенерированные видео-вставки по promptForMontage.",
      "Формат выхода — вертикальный рилс 9:16. Не собирай слайды карусели и не опирайся на design.md / promptForDesigner.",
      "Не HeyGen / cartoon path — existing montage render only (Sprint 9 lock).",
    ].join(" "),
    copywriterSkills: [
      "Hook 0–2s HARD",
      "Beats · VO · on-screen",
      "CTA + captionLine",
      "promptForMontage",
      "Reels JSON (not carousel)",
      "IG + YT Shorts tone",
      "Sprint9 golden likeness",
    ],
    designerSkills: [
      "Монтаж сырого футажа",
      "Субтитры burn-in по beats",
      "Вставки между шотами",
      "Эффекты и gen-inserts",
    ],
    copywriterRules: [
      "Hook обязан в 0–2с иначе FAIL",
      "2–4 value beats + explicit CTA",
      "Запрет carousel slides[] / promptForDesigner",
      "Handoff = promptForMontage",
      "No soft-mock on bad reels JSON",
      "Not HeyGen / cartoon",
    ],
    designerRules: [
      "Вход = raw videos + reels script",
      "Субтитры крупные mute-proof",
      "Не роль «Дизайн / сборка» слайдов",
      "Not HeyGen path",
    ],
    designerUsesDesignMd: false,
  },
  "custom-clips-to-reels": {
    copywriterName: "Копирайтер нарезки",
    designerName: "Монтажёр нарезки",
    designerRole: "Монтаж нарезки",
    copywriterPrompt:
      "Подписи, хуки и CTA к нарезкам из уже снятого длинного видео: момент→хук, контекст одной фразой. Не полный сценарий с нуля как у Сценариста custom-reels.",
    designerPrompt:
      "Вырезай сильные моменты из длинного исходника (clip detection), убирай паузы, клей в короткий рилс, субтитры на речь. Отличие от Монтажёра рилсов: источник — одно длинное видео, не набор сырых шотов под новый сценарий.",
    copywriterSkills: ["Момент→хук", "Контекст 1 фраза", "CTA к полному видео"],
    designerSkills: ["Клип-детекция", "Вырезка моментов", "Субтитры на речь"],
    copywriterRules: ["Хук из реального момента", "Не полный reels-сценарий с нуля"],
    designerRules: ["Без длинных пауз", "Не обрезка на полуслове без субтитров"],
    designerUsesDesignMd: false,
  },
  "custom-info-video": {
    copywriterName: "Копирайтер инфо-видео",
    designerName: "Дизайнер инфо-видео",
    designerRole: "Сборка инфо-видео",
    copywriterPrompt:
      "Структура информационного ролика 45–90с: тема, 3–5 тезисов, VO-текст, вывод и CTA. Экспертный тон — не Recs-хук 15с и не SEO-статья.",
    designerPrompt:
      "Собери информационное видео: иллюстрации к тезисам, таймлайн VO, финальный CTA-экран. Не mute-монтаж сырых шотов как Монтажёр рилсов и не 2D-мульт.",
    copywriterSkills: ["3–5 тезисов", "VO-скрипт", "Вывод + CTA-текст"],
    designerSkills: ["Иллюстрации к тезисам", "Таймлайн VO", "Финал-экран CTA"],
    copywriterRules: ["3–5 тезисов", "Факты без выдумки"],
    designerRules: ["Финал с CTA", "Без перегруза анимацией"],
  },
};

function packById(id: string): AgentPackMeta | undefined {
  return AGENT_PACK_CATALOG.find((p) => p.id === id);
}

function skillNames(pack?: AgentPackMeta): string[] {
  return (pack?.tools ?? [])
    .filter((t) => t.kind === "skill")
    .map((t) => t.name);
}

function agent(
  partial: Omit<MeshAgent, "modelConfig" | "isActive" | "plugins" | "mcp"> &
    Partial<Pick<MeshAgent, "modelConfig" | "isActive" | "plugins" | "mcp">>,
): MeshAgent {
  const { modelConfig, isActive, plugins, mcp, ...rest } = partial;
  return {
    ...rest,
    plugins: plugins ?? [],
    mcp: mcp ?? [],
    isActive: isActive ?? true,
    modelConfig: {
      model: modelConfig?.model ?? "gpt-4o",
      temperature: modelConfig?.temperature ?? 0.4,
      maxTokens: modelConfig?.maxTokens ?? 4096,
      ...(modelConfig?.textModel?.trim()
        ? { textModel: modelConfig.textModel.trim() }
        : {}),
      ...(typeof modelConfig?.thinking === "boolean"
        ? { thinking: modelConfig.thinking }
        : {}),
      ...(modelConfig?.reasoningEffort
        ? { reasoningEffort: modelConfig.reasoningEffort }
        : {}),
    },
  };
}

/** Default agents for a content-type pipeline (mutable seed for store). */
export function seedAgentsForPipeline(
  pipelineId: MeshPipelineId,
): Record<string, MeshAgent> {
  const spec = PIPELINE_COPY[pipelineId];
  const cwPack = copywriterPackId(pipelineId);
  const withRazbor = laneAModeFor(pipelineId) === "user-razbor-script";
  const scoutPack = packById("scout");
  const analystPack = packById("analyst");
  const trainerPack = packById("team-trainer");
  const razborPack = packById("razbor-agent");
  const designerPack = packById("designer");
  const publisherPack = packById("publisher");
  const cwMeta = packById(cwPack);

  const copywriterRole =
    spec.copywriterRole ??
    `Копирайтер · ${MESH_PIPELINE_LABELS[pipelineId]}`;
  const designerRole = spec.designerRole ?? "Дизайн / сборка";
  const designerSystemPrompt = spec.designerUsesDesignMd
    ? `${spec.designerPrompt}\n\nВАЖНО: Из Settings → Дизайн бери **только цвета / CSS vars** (\`--cf-design-*\`, palette, cssVarOverrides) активного слота (Embla / activeDesignId). **Layout free** — композицию и разметку придумай сам; не жди layout markup / primitive toggles из Settings.`
    : spec.designerPrompt;

  const out: Record<string, MeshAgent> = {};

  out.user = agent({
    id: "user",
    name: "Пользователь",
    role: "Запрос",
    packId: "user",
    roleKind: "user",
    avatarIcon: "user",
    systemPrompt: "",
    skills: ["Текст запроса", "Выбор типа контента", "HITL-контекст"],
    plugins: [],
    mcp: [],
    rules: [],
    userRequest: "",
    isActive: true,
    modelConfig: { model: "gpt-4o", temperature: 0, maxTokens: 1024 },
  });

  if (withRazbor) {
    out.razbor = agent({
      id: "razbor",
      name: "Разборщик",
      role: "Декомпозиция брифа",
      packId: "razbor-agent",
      roleKind: "release",
      avatarIcon: "razbor",
      /** S48 — LIVE Haiku Razbor system (hook/mid/CTA + trainer tasks). */
      systemPrompt: RAZBOR_ANALYST_SYSTEM_PROMPT,
      skills:
        skillNames(razborPack).length > 0
          ? skillNames(razborPack)
          : [
              "Hook / mid / CTA",
              "Virality brief",
              "Trainer tasks → Scriptwriter+Designer",
              "Handoff insights",
            ],
      plugins: ["json-schema-validator", "text-summarizer"],
      mcp: ["mcp://knowledge-base/briefs", "mcp://notion/templates"],
      rules: [
        "Не путать с Scout-Аналитиком",
        "Не silent mock при наличии ключа",
        "Handoff обязан нести insights",
        "S50: ≥2 concrete trainer tasks Scriptwriter + ≥2 Designer (не «улучши»)",
        "CTA map Vernatun 1–4; incomplete CTA отметить",
      ],
      modelConfig: {
        model: RAZBOR_ANALYST_MODEL,
        temperature: 0.35,
        maxTokens: 8192,
        thinking: true,
        reasoningEffort: "high",
      },
    });
  }

  out.copywriter = agent({
    id: "copywriter",
    name: spec.copywriterName,
    role: copywriterRole,
    packId: cwPack,
    roleKind: "release",
    avatarIcon: "copywriter",
    systemPrompt: spec.copywriterPrompt,
    skills:
      skillNames(cwMeta).length > 0
        ? [...spec.copywriterSkills, ...skillNames(cwMeta)]
        : spec.copywriterSkills,
    plugins: ["grammar-checker", "headline-analyzer"],
    mcp: ["mcp://copywriting/vocabulary", "mcp://analytics/best-posts"],
    rules: spec.copywriterRules,
    /** C-audit-01 — carousel Scriptwriter = Claude 3.7 Sonnet + thinking. */
    modelConfig:
      pipelineId === "carousel-engine"
        ? {
            model: DEFAULT_SCRIPTWRITER_MODEL,
            temperature: 0.55,
            maxTokens: 8192,
            thinking: true,
            reasoningEffort: "high",
          }
        : { model: "gpt-4o", temperature: 0.55, maxTokens: 4096 },
  });

  out.designer = agent({
    id: "designer",
    name: spec.designerName,
    role: designerRole,
    packId: "designer",
    roleKind: "release",
    avatarIcon: "designer",
    systemPrompt: designerSystemPrompt,
    skills:
      skillNames(designerPack).length > 0
        ? [...spec.designerSkills, ...skillNames(designerPack)]
        : spec.designerSkills,
    plugins: ["color-contrast-check", "image-aspect-ratio-calc"],
    mcp: ["mcp://filesystem/design.md", "mcp://figma/design-system"],
    rules: spec.designerRules,
    /**
     * C-audit-01 — carousel Designer: draw = image-2 on `model`;
     * chat/describe/handoff = `textModel` Sonnet (route must not chat on image id).
     */
    modelConfig: {
      model:
        pipelineId === "carousel-engine"
          ? DEFAULT_CAROUSEL_IMAGE_MODEL
          : "gpt-4o",
      temperature: 0.35,
      maxTokens: 4096,
      ...(pipelineId === "carousel-engine"
        ? { textModel: DEFAULT_DESIGNER_TEXT_MODEL }
        : {}),
    },
  });

  /** Variant A — carousel-only Art Director (after composite; NO remake). */
  if (pipelineId === "carousel-engine") {
    const artDirectorPack = packById("art-director");
    out[ART_DIRECTOR_AGENT_ID] = agent({
      id: ART_DIRECTOR_AGENT_ID,
      name: ART_DIRECTOR_DISPLAY_NAME,
      role: "Ревью финалов · remarks|approve",
      packId: "art-director",
      roleKind: "release",
      /** FE may map icon; fallback designer until Frontend adds key. */
      avatarIcon: "art-director",
      systemPrompt: ART_DIRECTOR_SYSTEM_PROMPT,
      skills:
        skillNames(artDirectorPack).length > 0
          ? skillNames(artDirectorPack)
          : [
              "Sequence QA (hook→value→CTA)",
              "S57 layered integrity",
              "Variant A html_layout critique",
              "Anti-slop / etalon #3 taste",
              "approve | remarks JSON",
              "NO auto-remake",
            ],
      plugins: ["json-schema-validator"],
      mcp: [],
      rules: [
        "Только после готовых PNG",
        "Не запускай перерисовку — только verdict",
        "P0/P1 → remarks (never soft-approve)",
        "Approve ≠ social publish",
        "Не OCR remake loop",
      ],
      modelConfig: {
        model: DEFAULT_DESIGNER_TEXT_MODEL,
        temperature: 0.25,
        maxTokens: 4096,
        thinking: true,
        reasoningEffort: "medium",
      },
    });
  }

  out.publisher = agent({
    id: "publisher",
    name: "Публицист",
    role: "Публикация",
    packId: "publisher",
    roleKind: "release",
    avatarIcon: "publisher",
    systemPrompt:
      "Прими макет, обсуди слот и поставь в Расписание (HITL до публикации).",
    skills:
      skillNames(publisherPack).length > 0
        ? skillNames(publisherPack)
        : ["Слот публикации", "Расписание", "HITL-чат"],
    plugins: ["media-compressor", "scheduler-cron"],
    mcp: ["mcp://telegram/channel-bot", "mcp://crm/analytics-tracker"],
    rules: ["Без публикации без HITL", "Согласовать слот"],
    modelConfig: { model: "gpt-4o-mini", temperature: 0.2, maxTokens: 2048 },
  });

  out.scout = agent({
    id: "scout",
    name: "Скаут",
    role: "Сбор информации",
    packId: "scout",
    roleKind: "scout",
    avatarIcon: "scout",
    systemPrompt:
      "Собирай контент по параметрам разведки и фильтруй шум. Не предлагай правки skills.",
    skills:
      skillNames(scoutPack).length > 0
        ? skillNames(scoutPack)
        : ["Сбор по теме", "Фильтр параметров", "Очередь в аналитику"],
    plugins: ["rss-fetcher", "engagement-rate-filter"],
    mcp: ["mcp://web-search/trends", "mcp://telegram/scout-feed"],
    rules: ["Только сбор и фильтр", "Не писать skill patches"],
    modelConfig: { model: "gpt-4o-mini", temperature: 0.3, maxTokens: 4096 },
  });

  out.analyst = agent({
    id: "analyst",
    name: "Аналитик",
    role: "Выводы",
    packId: "analyst",
    roleKind: "analyst",
    avatarIcon: "analyst",
    systemPrompt:
      "Анализируй данные скаута и выдавай заключение по типу контента и площадке. Ты не Разборщик.",
    skills:
      skillNames(analystPack).length > 0
        ? skillNames(analystPack)
        : ["Заключение по типам", "Заключение по площадкам", "Передача Тренеру"],
    plugins: ["stat-calculator", "chart-builder"],
    mcp: ["mcp://database/post-metrics", "mcp://crm/leads"],
    rules: ["Не разбирать чужой пост как Разборщик"],
    modelConfig: { model: "gpt-4o", temperature: 0.25, maxTokens: 4096 },
  });

  out["team-trainer"] = agent({
    id: "team-trainer",
    name: "Тренер",
    role: "Усиление команды",
    packId: "team-trainer",
    roleKind: "trainer",
    avatarIcon: "trainer",
    systemPrompt:
      "По заключению аналитика предлагай обновления skills/rules команды выпуска. Apply только после HITL.",
    skills:
      skillNames(trainerPack).length > 0
        ? skillNames(trainerPack)
        : [
            "Поиск skills/plugins",
            "GitHub / Hugging Face",
            "Правка правил команды",
          ],
    plugins: ["prompt-diff-checker", "dataset-cleaner"],
    mcp: ["mcp://knowledge-base/master-prompts", "mcp://git/prompt-repo"],
    rules: ["Патчи только через HITL «Согласовано»", "Не подменять Скаута"],
    modelConfig: { model: "claude-sonnet-4", temperature: 0.45, maxTokens: 8192 },
  });

  return out;
}

export function cloneAgents(
  agents: Record<string, MeshAgent>,
): Record<string, MeshAgent> {
  return JSON.parse(JSON.stringify(agents)) as Record<string, MeshAgent>;
}
