/**
 * Phase4 E2E DIFFUSION live gen — C-e2e-live-trace
 *
 *   npx tsx scripts/live-gen-e2e-carousel.ts
 *   npx tsx scripts/live-gen-e2e-carousel.ts --only=a
 *   npx tsx scripts/live-gen-e2e-carousel.ts --skip-draw
 *
 * Env forced:
 *   CAROUSEL_E2E_TEXT_IN_IMAGE=1
 *   CAROUSEL_PROMPT_TRACE=1
 *   CAROUSEL_DRAW_SKIP_BG=0
 *   (does NOT force CAROUSEL_HTML_FIRST=1)
 *
 * Budget: 2×3 = 6 PNG. Draft overwrite: draft-e2e-a / draft-e2e-b only.
 * Artifacts: generatedMedia/wave-e2e-image-carousel/
 * MD: docs/карусель тест/10–13-e2e-*.md
 */

import { copyFile, mkdir, writeFile, access } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { resolve } from "node:path";

import {
  assembleAgentStartSystemPrompt,
  buildCreateCarouselAgentBundle,
} from "@/lib/studio/agent-start-bundle";
import { CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY } from "@/lib/studio/create-carousel-prompts";
import {
  DEFAULT_CAROUSEL_IMAGE_MODEL,
  DEFAULT_SCRIPTWRITER_MODEL,
} from "@/types/mesh-agent";
import { seedAgentsForPipeline } from "@/lib/mesh/agent-defaults";
import type { CarouselHandoffJson } from "@/lib/studio/carousel-json-contract";

function loadDotEnv(filePath: string) {
  if (!existsSync(filePath)) return;
  for (const raw of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env) || !process.env[key]) process.env[key] = val;
  }
}

loadDotEnv(resolve(process.cwd(), ".env"));

const DOCS_DIR = path.join(process.cwd(), "docs", "карусель тест");
const ARTIFACT_ROOT = path.join(
  process.cwd(),
  "generatedMedia",
  "wave-e2e-image-carousel",
);
const WAVE_DIR = path.join(
  process.cwd(),
  "memory",
  "waves",
  "2026-10-16-e2e-image-carousel",
);
const API_BASE = process.env.LIVE_GEN_API_BASE?.trim() || "http://localhost:3001";
const USER_ID = "user_seed_admin_c16";
const HARD_PNG_CAP = 6;
const DATE = "2026-10-16";

const DRAFT_IDS = {
  a: "draft-e2e-a",
  b: "draft-e2e-b",
} as const;

type RunId = "a" | "b";

type TopicRun = {
  id: RunId;
  slug: string;
  userBrief: string;
  topicLabel: string;
  cta: 1 | 2 | 3 | 4;
  n: number;
  scriptwriterMd: string;
  designerMd: string;
  draftId: string;
};

const TOPICS: TopicRun[] = [
  {
    id: "a",
    slug: "hy-letters",
    topicLabel: "Армянский алфавит / Маштоц",
    cta: 2,
    n: 3,
    userBrief:
      "Сделай карусель Vernatun на 3 слайда: армянский алфавит и Маштоц — буква как дом для детей диаспоры. CTA 2.",
    scriptwriterMd: "10-e2e-scriptwriter-hy-letters.md",
    designerMd: "11-e2e-designer-hy-letters.md",
    draftId: DRAFT_IDS.a,
  },
  {
    id: "b",
    slug: "hy-sevan",
    topicLabel: "Озеро Севан / тишина",
    cta: 1,
    n: 3,
    userBrief:
      "Сделай карусель Vernatun на 3 слайда: озеро Севан и тишина — вода, ветер, пауза без суеты. CTA 1.",
    scriptwriterMd: "12-e2e-scriptwriter-hy-sevan.md",
    designerMd: "13-e2e-designer-hy-sevan.md",
    draftId: DRAFT_IDS.b,
  },
];

const CTA_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: "Напишите в комментариях",
  2: "Подписывайся",
  3: "TG · в шапке профиля",
  4: "Лайк + сохранить",
};

/** Strong viral handoff when live Scriptwriter unavailable. */
function fallbackHandoff(topic: TopicRun): CarouselHandoffJson {
  if (topic.id === "a") {
    return {
      project: "vernatun",
      content_id: "e2e-hy-letters",
      idea: "Армянский алфавит — дом для детей диаспоры",
      hook: "Буква дышит?",
      tone: "warm cultural",
      cta_type: 2,
      caption: "Алфавит Месропа — не музей, а дом. Vernatun.",
      hashtags: ["#Vernatun", "#ArmenianAlphabet", "#Mashtots"],
      requested_slide_count: 3,
      slides: [
        {
          slide_number: 1,
          layout_variant: "cover",
          primary_copy: "Буква дышит?",
          secondary_copy: "Маштоц дал детям диаспоры дом в знаке.",
          swipe_trigger: "узнать, почему буква — убежище",
          visual_prompt:
            "Dark editorial night desk, warm cognac light on carved Armenian letter Ա, soft gold dust, cinematic shallow depth, premium Vernatun mood, no purple slop",
        },
        {
          slide_number: 2,
          layout_variant: "body_slide",
          primary_copy: "Один знак — целый дом",
          secondary_copy:
            "Ребёнок в диаспоре узнаёт родной звук раньше, чем карту Еревана.",
          swipe_trigger: "увидеть ритуал передачи",
          visual_prompt:
            "Close-up of child hands tracing stone-carved Armenian glyph, candle glow, heritage paper texture, dark luxury editorial photography",
        },
        {
          slide_number: 3,
          layout_variant: "cta_slide",
          primary_copy: "Хочешь ещё таких историй?",
          secondary_copy: "Подписывайся — Vernatun хранит буквы живыми.",
          swipe_trigger: "подписаться на культуру",
          visual_prompt:
            "Premium dark poster frame with soft gold accent pill space, Armenian manuscript fragments softly blurred in background, expensive Instagram craft",
          cta_type: 2,
        },
      ],
    };
  }
  return {
    project: "vernatun",
    content_id: "e2e-hy-sevan",
    idea: "Озеро Севан — тишина без суеты",
    hook: "Вода молчит громче?",
    tone: "quiet cinematic",
    cta_type: 1,
    caption: "Севан учит паузе. Vernatun.",
    hashtags: ["#Vernatun", "#Sevan", "#Armenia"],
    requested_slide_count: 3,
    slides: [
      {
        slide_number: 1,
        layout_variant: "cover",
        primary_copy: "Вода молчит громче?",
        secondary_copy: "Севан — пауза, которую город забывает.",
        swipe_trigger: "войти в тишину озера",
        visual_prompt:
          "Cinematic Lake Sevan at dusk, cold blue water meeting warm amber horizon, wind ripples, lonely pier silhouette, premium dark editorial, no coffee props",
      },
      {
        slide_number: 2,
        layout_variant: "body_slide",
        primary_copy: "Ветер стирает шум",
        secondary_copy:
          "Одна длинная волна — и телефон становится камнем в кармане.",
        swipe_trigger: "почувствовать паузу",
        visual_prompt:
          "Wide Sevan shore stones and shallow water, soft overcast light, quiet atmosphere, expensive travel editorial photography, Armenian highland mood",
      },
      {
        slide_number: 3,
        layout_variant: "cta_slide",
        primary_copy: "Где твоя тишина?",
        secondary_copy: "Напишите в комментариях — озеро ждёт ответ.",
        swipe_trigger: "ответить в комментариях",
        visual_prompt:
          "Night Sevan shoreline with soft gold accent glow on water, premium Instagram CTA frame space, dark luxury craft, no purple gradient",
        cta_type: 1,
      },
    ],
  };
}

function selectedIds(): RunId[] {
  const arg = process.argv.find((a) => a.startsWith("--only="));
  if (!arg) return ["a", "b"];
  const set = new Set(
    arg
      .slice("--only=".length)
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s): s is RunId => s === "a" || s === "b"),
  );
  return (["a", "b"] as const).filter((id) => set.has(id));
}

function wantsSkipDraw(): boolean {
  return process.argv.includes("--skip-draw");
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function localPathFromPublicUrl(url: string): string | null {
  if (!url.startsWith("/generated/")) return null;
  return path.join(process.cwd(), "public", url.replace(/^\//, ""));
}

function fence(lang: string, body: string): string {
  return ["```" + lang, body.replace(/\r\n/g, "\n").trimEnd(), "```"].join(
    "\n",
  );
}

function looksWeakJson(json: {
  hook?: string;
  slides?: Array<{
    primary_copy?: string;
    visual_prompt?: string;
    layout_variant?: string;
  }>;
}): boolean {
  const cover =
    json.slides?.find((s) =>
      /cover/i.test(String(s.layout_variant ?? "")),
    ) ?? json.slides?.[0];
  const hook = (json.hook || cover?.primary_copy || "").trim();
  const flatHook =
    !hook ||
    hook.split(/\s+/).length > 10 ||
    /^(5\s+советов|о нашем|добро пожаловать|лучший вечер|секрет|подпишись)/i.test(
      hook,
    );
  const missingVp = (json.slides ?? []).some(
    (s) =>
      !s.visual_prompt?.trim() ||
      /^красив/i.test(s.visual_prompt.trim()) ||
      s.visual_prompt.trim().length < 24,
  );
  return flatHook || missingVp;
}

function handoffChecklist(json: {
  hook?: string;
  cta_type?: number;
  idea?: string;
  slides?: Array<{
    primary_copy?: string;
    secondary_copy?: string;
    swipe_trigger?: string;
    visual_prompt?: string;
    layout_variant?: string;
    cta_type?: number;
  }>;
}): Record<string, string> {
  const slides = json.slides ?? [];
  const cover =
    slides.find((s) => /cover/i.test(String(s.layout_variant))) ?? slides[0];
  const hook = (json.hook || cover?.primary_copy || "").trim();
  const words = hook.split(/\s+/).filter(Boolean).length;
  const coverOk =
    words >= 2 &&
    words <= 8 &&
    !/^(5\s+советов|о нашем|добро пожаловать|лучший вечер)/i.test(hook)
      ? "PASS"
      : "FAIL";
  const bodies = slides.filter((s) =>
    /body|point|proof/i.test(String(s.layout_variant ?? "")),
  );
  const bodyOk =
    bodies.length === 0 ||
    bodies.every(
      (s) =>
        (s.primary_copy?.trim().length ?? 0) >= 8 &&
        (s.secondary_copy?.trim().length ?? 0) >= 4,
    )
      ? "PASS"
      : "WEAK";
  const swipeOk = slides.every((s) => (s.swipe_trigger?.trim().length ?? 0) >= 4)
    ? "PASS"
    : "FAIL";
  const cta =
    slides.find((s) => /cta/i.test(String(s.layout_variant ?? "")))?.cta_type ??
    json.cta_type;
  const ctaOk = cta === 1 || cta === 2 || cta === 3 || cta === 4 ? "PASS" : "FAIL";
  const vpOk = slides.every(
    (s) =>
      (s.visual_prompt?.trim().length ?? 0) >= 24 &&
      !/^красив/i.test(s.visual_prompt?.trim() ?? ""),
  )
    ? "PASS"
    : "FAIL";
  const topicBlob = `${json.idea ?? ""} ${hook} ${slides.map((s) => s.primary_copy).join(" ")}`.toLowerCase();
  const coffeeLock =
    /\b(эспрессо|латте|кофей|coffee|jazz\s*club|вечер в клубе)\b/i.test(
      topicBlob,
    ) && !/маштоц|алфавит|севан|sevan|буква/i.test(topicBlob);
  const topicOk = coffeeLock ? "FAIL" : "PASS";
  return {
    cover: coverOk,
    body: bodyOk,
    swipe: swipeOk,
    cta: ctaOk,
    visual: vpOk,
    topic: topicOk,
  };
}

async function upsertDraft(input: {
  id: string;
  title: string;
  imageUrls: string[];
  payload: Record<string, unknown>;
}): Promise<{ id: string; ok: boolean }> {
  const slides = input.imageUrls.map((imageUrl, i) => ({
    id: `${input.id}-slide-${i + 1}`,
    imageUrl,
    order: i,
  }));
  try {
    const res = await fetch(`${API_BASE}/api/studio/drafts`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-cf-user-id": USER_ID,
      },
      body: JSON.stringify({
        id: input.id,
        title: input.title,
        slides,
        status: "unpublished",
        moduleId: "carousel-engine",
        payload: input.payload,
      }),
    });
    const raw = (await res.json().catch(() => ({}))) as {
      draft?: { id?: string };
    };
    const id = typeof raw?.draft?.id === "string" ? raw.draft.id : "";
    return { id, ok: res.ok && id === input.id };
  } catch {
    return { id: "", ok: false };
  }
}

function buildScriptwriterMd(input: {
  topic: TopicRun;
  model: string;
  system: string;
  user: string;
  reply1: string;
  correctionUser: string | null;
  reply2: string | null;
  finalJson: unknown;
  checklist: Record<string, string>;
  weakNote: string;
  source: "live" | "fallback";
}): string {
  const correctionBlock =
    input.correctionUser && input.reply2
      ? [
          "**User polish:**",
          "",
          fence("text", input.correctionUser),
          "",
          "**LLM reply #2:**",
          "",
          fence("text", input.reply2),
        ].join("\n")
      : "_none_";

  return [
    `# Scriptwriter session — \`${input.topic.slug}\` (Phase4 E2E)`,
    "",
    `**Date:** ${DATE}`,
    `**Model:** \`${input.model}\``,
    `**Source:** ${input.source}`,
    `**N slides / CTA #:** ${input.topic.n} / ${input.topic.cta}`,
    `**Topic (user):** ${input.topic.topicLabel}`,
    "",
    "---",
    "",
    "## 1. Your request",
    "",
    fence("text", input.topic.userBrief),
    "",
    "---",
    "",
    "## 2. Full system → LLM",
    "",
    fence("text", input.system),
    "",
    "_Source: Create agent-start bundle. `CAROUSEL_PROMPT_TRACE=1`._",
    "",
    "---",
    "",
    "## 3. Full user → LLM",
    "",
    fence("text", input.user),
    "",
    "---",
    "",
    "## 4. LLM chat reply",
    "",
    fence("text", input.reply1),
    "",
    "---",
    "",
    "## 5. Optional correction",
    "",
    correctionBlock,
    "",
    "---",
    "",
    "## 6. Final JSON / prompt to Designer",
    "",
    fence("json", JSON.stringify(input.finalJson, null, 2)),
    "",
    "**Handoff checklist**",
    "",
    "| Check | OK? |",
    "|-------|-----|",
    `| Cover curiosity gap ≤6–8 words | ${input.checklist.cover} |`,
    `| Body value beats | ${input.checklist.body} |`,
    `| \`swipe_trigger\` meta | ${input.checklist.swipe} |`,
    `| \`cta_type\` 1–4 | ${input.checklist.cta} |`,
    `| Concrete \`visual_prompt\` | ${input.checklist.visual} |`,
    `| Topic = user (not coffee) | ${input.checklist.topic} |`,
    "",
    `**Weak-link note:** ${input.weakNote}`,
    "",
  ].join("\n");
}

function buildDesignerMd(input: {
  topic: TopicRun;
  handoffJson: unknown;
  describePlan: string;
  skillsTable: string;
  promptBlocks: string;
  cssVars: Record<string, string> | undefined;
  pngPaths: string[];
  imageModel: string;
  bgCalls: number;
  renderMode: string;
  e2eTextInImage: boolean;
  weakNote: string;
}): string {
  const pngRows = [0, 1, 2]
    .map((i) => {
      const p = input.pngPaths[i];
      return `| ${String(i + 1).padStart(2, "0")} | ${p ? `\`${p.replace(/\\/g, "/")}\`` : "_(missing)_"} | yes |`;
    })
    .join("\n");

  return [
    `# Designer session — \`${input.topic.slug}\` (Phase4 E2E)`,
    "",
    `**Date:** ${DATE}`,
    `**Describe model:** _(draw path — handoff JSON direct)_`,
    `**Draw / image model:** \`${input.imageModel}\` · bgCalls=${input.bgCalls} · mode=\`${input.renderMode}\``,
    `**Paint path:** \`e2e_diffusion\``,
    `**Handoff from:** \`${input.topic.scriptwriterMd}\``,
    `**e2eTextInImage:** ${input.e2eTextInImage}`,
    "",
    "---",
    "",
    "## 1. Handoff intake",
    "",
    `**JSON received:** inline from \`${input.topic.scriptwriterMd}\` §6`,
    "",
    "**Ack + describe plan (per slide):**",
    "",
    fence("text", input.describePlan),
    "",
    "**Approx colors / brandbook tokens passed to image:**",
    "",
    fence(
      "json",
      JSON.stringify(input.cssVars ?? {}, null, 2).slice(0, 2000),
    ),
    "",
    "---",
    "",
    "## 2. Rules / skills / plugins / MCP added",
    "",
    input.skillsTable,
    "",
    "---",
    "",
    "## 3. EXACT prompt(s) → image LLM (per slide)",
    "",
    "Each prompt includes scene + **readable typography** (headline/body/CTA) + color hints.",
    "",
    input.promptBlocks,
    "",
    "---",
    "",
    "## 4. Post-process",
    "",
    "| Step | Detail |",
    "|------|--------|",
    "| `html_overlay` | **`none`** |",
    "| Legacy Playwright/HTML text | skipped (Phase4 primary) |",
    `| Brandbook tokens | ${(Object.keys(input.cssVars ?? {}).length)} vars / approx colors in prompt |`,
    "| `swipe_trigger` painted? | **no** |",
    "| Safe-zone in prompt | top≥120 bottom≥160 sides≥80 |",
    `| Paint path | e2e_diffusion |`,
    "",
    "---",
    "",
    "## 5. Outputs",
    "",
    "| Slide | PNG path | Typography on image? |",
    "|-------|----------|----------------------|",
    pngRows,
    "",
    "**Budget check:** wave total ≤6 PNG (2 carousels × 3).",
    "",
    `**Weak-link note (Designer / Image):** ${input.weakNote}`,
    "",
    "### Handoff JSON (intake copy)",
    "",
    fence("json", JSON.stringify(input.handoffJson, null, 2)),
    "",
  ].join("\n");
}

async function main() {
  process.env.CAROUSEL_E2E_TEXT_IN_IMAGE = "1";
  process.env.CAROUSEL_PROMPT_TRACE = "1";
  process.env.CAROUSEL_DRAW_SKIP_BG = "0";
  // Do NOT force CAROUSEL_HTML_FIRST=1
  delete process.env.CAROUSEL_HTML_FIRST;
  process.env.WAVE_VISUAL_COPY_ARTIFACTS = "0";
  process.env.WAVE_VISUAL_ARTIFACT_DIR = ARTIFACT_ROOT;
  process.env.CAROUSEL_IMAGE_MODEL =
    process.env.CAROUSEL_IMAGE_MODEL?.trim() || DEFAULT_CAROUSEL_IMAGE_MODEL;

  const skipDraw = wantsSkipDraw();
  const ids = selectedIds();
  const runs = TOPICS.filter((t) => ids.includes(t.id));

  if (!CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY.includes("VIRAL CRAFT")) {
    console.error("E2E_FAIL overlay missing VIRAL CRAFT");
    process.exit(1);
  }

  const { resolveAggregatorEnv } = await import("../lib/llm/aggregator");
  const { callAggregatorChat } = await import("../lib/llm/aggregator-chat");
  const {
    parseCarouselJsonFromText,
    parseAndAssertCarouselJsonStrict,
  } = await import("../lib/studio/carousel-json-contract");
  const { runCreateCarouselDraw, isCarouselE2eTextInImage } = await import(
    "../lib/studio/carousel-html-renderer"
  );
  const { CREATE_CAROUSEL_DESIGNER_DRAW_OVERLAY } = await import(
    "../lib/studio/create-carousel-prompts"
  );

  if (!isCarouselE2eTextInImage()) {
    console.error("E2E_FAIL CAROUSEL_E2E_TEXT_IN_IMAGE unexpectedly OFF");
    process.exit(1);
  }
  if (
    /HTML\/CSS-first HARD|ABSOLUTELY NO readable text|optional image-2 bg only \(no text/i.test(
      CREATE_CAROUSEL_DESIGNER_DRAW_OVERLAY,
    )
  ) {
    console.error("E2E_FAIL Designer draw overlay still HTML-first / NO-letters");
    process.exit(1);
  }

  const hasKey = Boolean(resolveAggregatorEnv());
  console.log(`E2E_KEY=${hasKey ? "present" : "MISSING"}`);
  console.log(`E2E_API=${API_BASE}`);
  console.log(`E2E_SCRIPTWRITER=${DEFAULT_SCRIPTWRITER_MODEL}`);
  console.log(`E2E_IMAGE=${process.env.CAROUSEL_IMAGE_MODEL}`);
  console.log(`E2E_TEXT_IN_IMAGE=1`);
  console.log(`E2E_SKIP_DRAW=${skipDraw}`);
  console.log(`E2E_ARTIFACT=${ARTIFACT_ROOT}`);
  console.log(`E2E_RUNS=${runs.map((r) => r.slug).join(",")}`);

  if (!hasKey) {
    console.error("E2E_FAIL aggregator_key_missing");
    process.exit(1);
  }

  await mkdir(DOCS_DIR, { recursive: true });
  await mkdir(ARTIFACT_ROOT, { recursive: true });
  await mkdir(WAVE_DIR, { recursive: true });

  const designerSeed = seedAgentsForPipeline("carousel-engine").designer;
  const skillsTable = [
    "| Id | Layer | Why |",
    "|----|-------|-----|",
    "| carousel-json-contract | skill | Dramaturgy + Phase4 |",
    "| carousel-prompt-trace | skill | dump EXACT prompts |",
    "| create-carousel-prompts | lib | VIRAL CRAFT + E2E DIFFUSION |",
    ...(designerSeed?.skills ?? []).map(
      (s) => `| ${s} | mesh skill | Designer seed |`,
    ),
  ].join("\n");

  let totalPng = 0;
  const sessionSummaries: Array<{
    slug: string;
    scriptwriterMd: string;
    designerMd: string;
    pngPaths: string[];
    checklist: Record<string, string>;
    swWeak: string;
    deWeak: string;
    draftOk: boolean;
    renderMode: string;
    samplePrompt: string;
  }> = [];

  for (const topic of runs) {
    console.log(`\n=== SCRIPTWRITER ${topic.slug} ===`);

    const bundle = buildCreateCarouselAgentBundle({
      agentRole: "scriptwriter",
      mode: "chat",
      pipelineId: "carousel-engine",
    });
    const system = assembleAgentStartSystemPrompt(bundle);
    const user = topic.userBrief;

    let modelUsed = DEFAULT_SCRIPTWRITER_MODEL;
    let reply1 = "";
    let correctionUser: string | null = null;
    let reply2: string | null = null;
    let parsed: unknown = null;
    let source: "live" | "fallback" = "live";

    const chat1 = await callAggregatorChat({
      system,
      user,
      model: DEFAULT_SCRIPTWRITER_MODEL,
      temperature: 0.55,
      maxTokens: 3200,
      thinking: true,
      reasoningEffort: "high",
      fallbackModels: true,
    });

    if (chat1.ok) {
      modelUsed = chat1.model || DEFAULT_SCRIPTWRITER_MODEL;
      if (chat1.fallbackFrom) {
        console.warn(
          `E2E_SW_DEGRADE ${topic.slug} ${chat1.fallbackFrom} → ${modelUsed}`,
        );
      }
      reply1 = chat1.text;
      try {
        parsed = parseCarouselJsonFromText(reply1);
      } catch (e) {
        console.warn(
          `E2E_SW_PARSE_WEAK ${topic.slug}`,
          e instanceof Error ? e.message : e,
        );
        parsed = null;
      }

      const needsCorrection =
        !parsed ||
        looksWeakJson(parsed as Parameters<typeof looksWeakJson>[0]);

      if (needsCorrection) {
        correctionUser = [
          "Поправь вирусную плотность: cover = curiosity paradox/question ≤6–8 слов;",
          "каждый body = один конкретный insight;",
          "cta_slide = catalog copy под заданный CTA;",
          "каждый visual_prompt = concrete cinematic scene;",
          "swipe_trigger meta; TOPIC только из брифа;",
          "верни полный STRICT JSON в fenced ```json.",
        ].join(" ");
        console.log(`E2E_SW_CORRECTION ${topic.slug}`);
        const chat2 = await callAggregatorChat({
          system,
          user: correctionUser,
          model: modelUsed,
          temperature: 0.45,
          maxTokens: 3200,
          thinking: true,
          reasoningEffort: "high",
          fallbackModels: true,
          history: [
            { role: "user", content: user },
            { role: "assistant", content: reply1 },
          ],
        });
        if (chat2.ok) {
          reply2 = chat2.text;
          try {
            parsed = parseCarouselJsonFromText(reply2);
          } catch {
            /* keep */
          }
        }
      }
    } else {
      console.warn(
        `E2E_SW_LIVE_FAIL ${topic.slug} → using strong handoff fallback`,
        chat1.error,
      );
      source = "fallback";
      reply1 = "(live Scriptwriter unavailable — strong handoff JSON used)";
      parsed = fallbackHandoff(topic);
    }

    if (!parsed) {
      console.warn(`E2E_SW_NO_JSON ${topic.slug} → fallback handoff`);
      source = "fallback";
      parsed = fallbackHandoff(topic);
      if (!reply1) reply1 = "(parse miss — fallback handoff)";
    }

    let strict: unknown;
    try {
      strict = parseAndAssertCarouselJsonStrict(JSON.stringify(parsed));
    } catch (e) {
      console.warn(
        `E2E_SW_STRICT_SOFT ${topic.slug}`,
        e instanceof Error ? e.message : e,
      );
      strict = parsed;
    }

    // Ensure N=3
    const slidesArr = (strict as { slides?: unknown[] }).slides;
    if (!Array.isArray(slidesArr) || slidesArr.length !== topic.n) {
      console.warn(
        `E2E_SW_N_MISMATCH ${topic.slug} got=${slidesArr?.length} → fallback`,
      );
      strict = fallbackHandoff(topic);
      source = "fallback";
    }

    const checklist = handoffChecklist(
      strict as Parameters<typeof handoffChecklist>[0],
    );
    const swWeakParts: string[] = [];
    for (const [k, v] of Object.entries(checklist)) {
      if (v !== "PASS") swWeakParts.push(`${k}=${v}`);
    }
    const swWeak =
      swWeakParts.length === 0
        ? "none / PASS"
        : `Scriptwriter soft spots: ${swWeakParts.join(", ")}`;

    const swMd = buildScriptwriterMd({
      topic,
      model: modelUsed,
      system: source === "fallback" ? "(fallback — system not used)" : system,
      user,
      reply1,
      correctionUser,
      reply2,
      finalJson: strict,
      checklist,
      weakNote: swWeak,
      source,
    });
    const swPath = path.join(DOCS_DIR, topic.scriptwriterMd);
    await writeFile(swPath, swMd, "utf8");
    console.log(`E2E_SW_MD ${swPath} source=${source}`);

    await mkdir(path.join(WAVE_DIR, "handoff-json"), { recursive: true });
    await writeFile(
      path.join(WAVE_DIR, "handoff-json", `${topic.slug}.json`),
      JSON.stringify(strict, null, 2),
      "utf8",
    );

    let pngPaths: string[] = [];
    let deWeak = "skipped (--skip-draw)";
    let draftOk = false;
    let renderMode = "";
    let samplePrompt = "";

    if (!skipDraw) {
      if (totalPng + topic.n > HARD_PNG_CAP) {
        console.error(
          `BUDGET_STOP would exceed ${HARD_PNG_CAP} (have ${totalPng})`,
        );
        await writeFile(
          path.join(ARTIFACT_ROOT, "_stop-report.md"),
          `# STOP — PNG budget\n\nWould exceed ${HARD_PNG_CAP} (have ${totalPng}).\n`,
          "utf8",
        );
        break;
      }

      console.log(`=== DESIGNER E2E DRAW ${topic.slug} ===`);
      const draw = await runCreateCarouselDraw(
        strict as Parameters<typeof runCreateCarouselDraw>[0],
        {
          jobId: `e2e-${topic.id}-${Date.now()}`,
          model: DEFAULT_CAROUSEL_IMAGE_MODEL,
          copyToWaveArtifacts: false,
          defaultCtaLabel: CTA_LABEL[topic.cta],
        },
      );

      if (!draw.ok) {
        console.error(
          `E2E_DRAW_FAIL ${topic.slug}`,
          draw.error?.code,
          draw.error?.message,
        );
        deWeak = `draw FAIL: ${draw.error?.code}`;
      } else {
        renderMode = draw.renderMode;
        const bgCalls = draw.bgImageCalls ?? 0;
        const imageUrls = draw.slides.map((s) => s.imageUrl).filter(Boolean);
        const runDir = path.join(ARTIFACT_ROOT, topic.id);
        await mkdir(runDir, { recursive: true });

        for (let i = 0; i < imageUrls.length; i++) {
          const url = imageUrls[i]!;
          const dest = path.join(
            runDir,
            `slide_${String(i + 1).padStart(2, "0")}.png`,
          );
          const local = localPathFromPublicUrl(url);
          if (local && (await fileExists(local))) {
            await copyFile(local, dest);
            pngPaths.push(dest);
          } else if (url.startsWith("data:")) {
            const b64 = url.split(",")[1];
            if (b64) {
              await writeFile(dest, Buffer.from(b64, "base64"));
              pngPaths.push(dest);
            }
          } else if (url.startsWith("http")) {
            try {
              const imgRes = await fetch(url);
              if (imgRes.ok) {
                await writeFile(dest, Buffer.from(await imgRes.arrayBuffer()));
                pngPaths.push(dest);
              }
            } catch {
              /* skip */
            }
          }
        }

        totalPng += pngPaths.length;
        samplePrompt = (draw.imagePrompts ?? []).find((p) => p?.trim()) || "";
        console.log(
          `E2E_DRAW_OK ${topic.slug} png=${pngPaths.length} bgCalls=${bgCalls} mode=${draw.renderMode} e2e=${draw.e2eTextInImage}`,
        );

        if (draw.renderMode !== "e2e_diffusion" || !draw.e2eTextInImage) {
          deWeak = `FAIL S53: renderMode=${draw.renderMode} e2eTextInImage=${draw.e2eTextInImage}`;
        } else if (
          (draw.imagePrompts ?? []).some((p) =>
            /ABSOLUTELY NO readable text/i.test(p || ""),
          )
        ) {
          deWeak = "FAIL: prompts still ban readable text";
        } else if (
          !(draw.imagePrompts ?? []).every((p) =>
            /Paint EXACT readable/i.test(p || ""),
          )
        ) {
          deWeak = "FAIL: prompts missing EXACT readable typography";
        } else {
          deWeak =
            pngPaths.length === topic.n
              ? "none / PASS — e2e_diffusion + typography in prompts"
              : `PNG incomplete ${pngPaths.length}/${topic.n}`;
        }

        const promptBlocks = (draw.promptTrace ?? []).length
          ? (draw.promptTrace ?? [])
              .map((t) =>
                [
                  `### slide_${String(t.slide).padStart(2, "0")}`,
                  "",
                  fence("text", t.exact_prompt),
                  "",
                  `_meta:_ ${t.html_inputs_summary} · image_llm=\`${t.image_llm}\``,
                  "",
                ].join("\n"),
              )
              .join("\n")
          : (draw.imagePrompts ?? [])
              .map((p, i) =>
                [
                  `### slide_${String(i + 1).padStart(2, "0")}`,
                  "",
                  fence("text", p || "(empty)"),
                  "",
                ].join("\n"),
              )
              .join("\n");

        const slides =
          (
            strict as {
              slides?: Array<{
                layout_variant?: string;
                primary_copy?: string;
                visual_prompt?: string;
              }>;
            }
          ).slides ?? [];
        const describePlan = [
          `Получил handoff JSON (${slides.length} slides). Paint path: E2E DIFFUSION — image-2 paints scene + typography in pixels.`,
          ...slides.map(
            (s, i) =>
              `${i + 1}. ${s.layout_variant}: «${s.primary_copy ?? ""}» — visual: ${(s.visual_prompt ?? "").slice(0, 120)}…`,
          ),
        ].join("\n");

        const deMd = buildDesignerMd({
          topic,
          handoffJson: strict,
          describePlan,
          skillsTable,
          promptBlocks: promptBlocks || "_(no prompts)_",
          cssVars: draw.cssVarsApplied,
          pngPaths,
          imageModel: draw.model || DEFAULT_CAROUSEL_IMAGE_MODEL,
          bgCalls,
          renderMode: draw.renderMode,
          e2eTextInImage: Boolean(draw.e2eTextInImage),
          weakNote: deWeak,
        });
        const dePath = path.join(DOCS_DIR, topic.designerMd);
        await writeFile(dePath, deMd, "utf8");
        console.log(`E2E_DE_MD ${dePath}`);

        const draft = await upsertDraft({
          id: topic.draftId,
          title: `E2E ${topic.id.toUpperCase()}: ${topic.topicLabel}`,
          imageUrls,
          payload: {
            wave: "2026-10-16-e2e-image-carousel",
            ticket: "C-e2e-live-trace",
            slug: topic.slug,
            handoff: strict,
            renderMode: draw.renderMode,
            e2eTextInImage: draw.e2eTextInImage,
            bgImageCalls: bgCalls,
            imageModel: DEFAULT_CAROUSEL_IMAGE_MODEL,
            html_overlay: "none",
            overwriteOf: topic.draftId,
          },
        });
        draftOk = draft.ok;
        console.log(
          `E2E_DRAFT ${topic.slug} ok=${draft.ok} id=${draft.id || topic.draftId}`,
        );
      }
    }

    sessionSummaries.push({
      slug: topic.slug,
      scriptwriterMd: topic.scriptwriterMd,
      designerMd: topic.designerMd,
      pngPaths,
      checklist,
      swWeak,
      deWeak,
      draftOk,
      renderMode,
      samplePrompt,
    });
  }

  const phase4Pass = sessionSummaries.every(
    (s) =>
      skipDraw ||
      (s.renderMode === "e2e_diffusion" &&
        s.pngPaths.length === 3 &&
        !s.deWeak.startsWith("FAIL")),
  );

  const indexRows = sessionSummaries
    .map((s, i) => {
      const png =
        s.pngPaths.length > 0
          ? s.pngPaths
              .map((p) => "`" + p.replace(/\\/g, "/") + "`")
              .join("<br>")
          : "_(pending)_";
      return `| ${i + 1} | [\`${s.scriptwriterMd}\`](./${s.scriptwriterMd}) + [\`${s.designerMd}\`](./${s.designerMd}) | ${s.slug} | ${png} | ${s.deWeak} |`;
    })
    .join("\n");

  const priorRows = [
    "| 1 | [`01-scriptwriter-hy-letters.md`](./01-scriptwriter-hy-letters.md) + [`03-designer-hy-letters.md`](./03-designer-hy-letters.md) | Алфавит (prior Phase3) | prior wave | HTML-overlay era |",
    "| 2 | [`02-scriptwriter-hy-sevan.md`](./02-scriptwriter-hy-sevan.md) + [`04-designer-hy-sevan.md`](./04-designer-hy-sevan.md) | Севан (prior Phase3) | prior wave | HTML-overlay era |",
  ].join("\n");

  const readme = [
    "# Карусель тест — prompt-trace + Phase4 E2E",
    "",
    "Папка MD session logs: **Scriptwriter → Designer → Image**.",
    "",
    "Канон: `.cursor/skills/carousel-prompt-trace/SKILL.md` + Client **S53**.",
    "Локи: `shell_freeze` · `upgrade_only` · `no_pipeline_break` · budget **6 PNG**.",
    "",
    "## Phase4 E2E sessions (this wave)",
    "",
    "| # | Файл | Тема | PNG | Weak link |",
    "|---|------|------|-----|-----------|",
    indexRows || "| — | _(pending)_ | | | |",
    "",
    "## Prior Phase3 sessions (archive)",
    "",
    "| # | Файл | Тема | PNG | Weak link |",
    "|---|------|------|-----|-----------|",
    priorRows,
    "",
    "## Вердикт Phase4 / S53",
    "",
    `**Paint path:** \`e2e_diffusion\` (typography IN pixels).`,
    `**html_overlay:** \`none\` on success.`,
    `**Drafts overwrite:** \`draft-e2e-a\`, \`draft-e2e-b\`.`,
    `**PNG total:** ${totalPng}/${HARD_PNG_CAP}`,
    `**Phase4 smoke:** ${phase4Pass ? "PASS (code path)" : "CHECK — see weak links"}`,
    "",
    "Hard REJECT if prompts still say «ABSOLUTELY NO readable text» or HTML-overlay claimed as primary.",
    "",
    "Скрипт: `npx tsx scripts/live-gen-e2e-carousel.ts`.  ",
    "Artifacts: `generatedMedia/wave-e2e-image-carousel/`.",
    "",
  ].join("\n");

  await writeFile(path.join(DOCS_DIR, "README.md"), readme, "utf8");

  await writeFile(
    path.join(ARTIFACT_ROOT, "_png_budget.json"),
    JSON.stringify(
      {
        ticket: "C-e2e-live-trace",
        max: HARD_PNG_CAP,
        count: totalPng,
        drafts: runs.map((r) => r.draftId),
        slugs: sessionSummaries.map((s) => s.slug),
        renderModes: sessionSummaries.map((s) => s.renderMode),
      },
      null,
      2,
    ),
    "utf8",
  );

  const sample =
    sessionSummaries.find((s) => s.samplePrompt)?.samplePrompt || "";
  if (sample) {
    await writeFile(
      path.join(ARTIFACT_ROOT, "_sample-image-prompt.txt"),
      sample,
      "utf8",
    );
  }

  console.log(`\nE2E_DONE png=${totalPng}/${HARD_PNG_CAP} phase4=${phase4Pass}`);
  if (sample) {
    console.log(`E2E_SAMPLE_PROMPT_LEN=${sample.length}`);
    console.log(`E2E_SAMPLE_PROMPT_HEAD=${sample.slice(0, 220)}…`);
  }
  if (!skipDraw && (!phase4Pass || totalPng < HARD_PNG_CAP) && ids.length === 2) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("E2E_FATAL", e instanceof Error ? e.message : e);
  process.exit(1);
});
