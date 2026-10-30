/**
 * C-razbor-live-haiku-boards — client-safe types + prompts + overlay helpers.
 * No Node fs / aggregator imports (safe for RazborModal + agent-defaults).
 *
 * C-audit-01 D-m-8: Razbor stays on Haiku — do NOT follow Scriptwriter Sonnet.
 */

/** HARD — Razbor LIVE analyst (out of scope for carousel Scriptwriter Sonnet upgrade). */
export const RAZBOR_ANALYST_MODEL = "anthropic/claude-haiku-4.5";

/** Canon system prompt — aligns with `.cursor/skills/ai-bridge/razbor-live-prompt.md` (S50 harden). */
export const RAZBOR_ANALYST_SYSTEM_PROMPT = [
  "Ты — Разборщик Vernatun (не Scout-Аналитик). Разбираешь чужой контент: конкурент Instagram ИЛИ user Boards upload.",
  "После старта разбора ОБЯЗАН реально опираться на переданный контекст карусели (подпись, метрики, URL/описания слайдов, изображения если есть).",
  "НИКОГДА не говори «не вижу карусель / нет доступа к медиа», если в user-сообщении перечислены слайды, URL или captions — это и есть карусель.",
  "",
  "Структура анализа (S50 HARD):",
  "1. Hook (cover / 0–2с смысл) — что цепляет; pattern-interrupt; слабости; что украсть для Vernatun curiosity-gap.",
  "2. Mid — value beats / середина карусели; что удерживает swipe; какие beats слабые.",
  "3. CTA — явный/скрытый призыв; map к Vernatun CTA catalog 1–4 (вопрос→комменты | ещё→подписка | клуб→TG | лайк+сохранить); отметь incomplete CTA.",
  "4. Virality brief — 5–10 коротких bullets: почему может залететь / почему нет; метрики только если даны.",
  "5. Trainer tasks (module-wide, CONCRETE) — numbered actionable patches:",
  "   - минимум **2** задачи target=scriptwriter (hook wording / swipe meta / CTA# / N slides / tone) — НЕ «улучши хук».",
  "   - минимум **2** задачи target=designer (visual motifs, contrast, safe-zone, materials, what to steal/avoid) — НЕ «сделай красивее».",
  "   Каждая task = один глагол + объект + критерий (например: «Cover primary_copy ≤8 слов с gap про гостевую ночь, не слоган клуба»).",
  "",
  "Запрет: silent mock; пустой «готово»/«ок»; vague trainer tasks; reels-only script для carousel; секреты; выдуманные метрики как факт без данных.",
  "",
  "Ответ: сначала краткий человеческий разбор (RU markdown).",
  "В КОНЦЕ ответа ОБЯЗАТЕЛЬНО добавь fenced JSON (без комментариев внутри) — иначе FAIL:",
  "```json",
  "{",
  '  "summary": "2–4 предложения о чём карусель",',
  '  "hook": "анализ cover/hook + что усилить",',
  '  "middle": "анализ mid / value beats",',
  '  "cta": "анализ CTA + Vernatun 1–4 map",',
  '  "viralityWhy": ["bullet1", "bullet2"],',
  '  "trainerTasks": [',
  '    { "target": "scriptwriter", "task": "1. …конкретный патч…" },',
  '    { "target": "scriptwriter", "task": "2. …конкретный патч…" },',
  '    { "target": "designer", "task": "1. …конкретный патч…" },',
  '    { "target": "designer", "task": "2. …конкретный патч…" }',
  "  ],",
  '  "handoffBrief": "бриф для Сценариста: hook/mid/CTA + numbered must-do + module-wide"',
  "}",
  "```",
].join("\n");

export type RazborTrainerTask = {
  target: "scriptwriter" | "designer" | "module";
  task: string;
};

export type RazborLiveAnalysis = {
  summary: string;
  hook: string;
  middle: string;
  cta: string;
  viralityWhy: string[];
  trainerTasks: RazborTrainerTask[];
  handoffBrief: string;
  /** Full assistant markdown shown in chat. */
  displayText: string;
  rawJson?: string;
};

/** Overlay for follow-up chat / Scriptwriter handoff system. */
export function buildRazborAnalysisSystemOverlay(
  analysis: RazborLiveAnalysis,
): string {
  const tasks = analysis.trainerTasks
    .map((t) => `- [${t.target}] ${t.task}`)
    .join("\n");
  return [
    "## LIVE Razbor analysis context (keep for follow-ups)",
    `Summary: ${analysis.summary}`,
    analysis.hook ? `Hook: ${analysis.hook}` : "",
    analysis.middle ? `Mid: ${analysis.middle}` : "",
    analysis.cta ? `CTA: ${analysis.cta}` : "",
    analysis.viralityWhy.length
      ? `Virality:\n${analysis.viralityWhy.map((v) => `- ${v}`).join("\n")}`
      : "",
    tasks ? `Trainer tasks:\n${tasks}` : "",
    "",
    "Handoff brief for Scriptwriter:",
    analysis.handoffBrief,
    "",
    "Отвечай на вопросы пользователя О карусели, опираясь на этот анализ. Не отрицай наличие карусели.",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Compact Scriptwriter handoff string (brief + tasks + JSON). */
export function buildRazborScriptwriterHandoffPayload(
  analysis: RazborLiveAnalysis,
): string {
  const tasks = analysis.trainerTasks
    .map((t) => `- [${t.target}] ${t.task}`)
    .join("\n");
  const json =
    analysis.rawJson?.trim() ||
    JSON.stringify(
      {
        summary: analysis.summary,
        hook: analysis.hook,
        middle: analysis.middle,
        cta: analysis.cta,
        viralityWhy: analysis.viralityWhy,
        trainerTasks: analysis.trainerTasks,
        handoffBrief: analysis.handoffBrief,
      },
      null,
      2,
    );
  return [
    analysis.handoffBrief,
    "",
    "## Trainer tasks",
    tasks || "(нет)",
    "",
    "## Analysis JSON",
    "```json",
    json,
    "```",
  ].join("\n");
}

export function analysisFromApiPayload(
  payload: RazborLiveAnalysis,
): RazborLiveAnalysis {
  return {
    summary: payload.summary,
    hook: payload.hook,
    middle: payload.middle,
    cta: payload.cta,
    viralityWhy: Array.isArray(payload.viralityWhy) ? payload.viralityWhy : [],
    trainerTasks: Array.isArray(payload.trainerTasks)
      ? payload.trainerTasks
      : [],
    handoffBrief: payload.handoffBrief,
    displayText: payload.displayText,
    rawJson: payload.rawJson,
  };
}
