/**
 * Phase5 S54 ANCHOR REF bake-off — C-s54-bakeoff-pack
 *
 *   npx tsx scripts/live-gen-s54-anchor-bakeoff.ts
 *   npx tsx scripts/live-gen-s54-anchor-bakeoff.ts --only=a
 *   npx tsx scripts/live-gen-s54-anchor-bakeoff.ts --skip-draw
 *
 * Env forced:
 *   CAROUSEL_E2E_TEXT_IN_IMAGE=1
 *   CAROUSEL_DRAW_MODE=anchor_ref
 *   CAROUSEL_PROMPT_TRACE=1
 *   CAROUSEL_DRAW_SKIP_BG=0
 *
 * Budget HARD: 3×3 = 9 NEW PNG under pipeline=anchor_ref_pipeline only.
 * etalon + e2e_diffusion = copy/symlink (0 burn).
 *
 * Themes (Armenian LANGUAGE):
 *   a mashtots-home · b diaspora-kids · c city-speech
 *
 * Draft overwrite: draft-s54-a / draft-s54-b / draft-s54-c
 */

import { copyFile, mkdir, writeFile, access } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { resolve } from "node:path";

import {
  assembleAgentStartSystemPrompt,
  buildCreateCarouselAgentBundle,
} from "@/lib/studio/agent-start-bundle";
import {
  CREATE_CAROUSEL_ANCHOR_REF_DRAW_OVERLAY,
  CREATE_CAROUSEL_S54_LANGUAGE_TOPIC_GUIDANCE,
  CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY,
  resolveCreateCarouselOverlay,
} from "@/lib/studio/create-carousel-prompts";
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
const BAKEOFF_ROOT = path.join(
  process.cwd(),
  "generatedMedia",
  "карусель тест",
  "bakeoff-20261017",
);
const ANCHOR_ROOT = path.join(BAKEOFF_ROOT, "pipeline=anchor_ref_pipeline");
const ETALON_SRC = path.join(process.cwd(), "generatedMedia", "эталон карусели");
const E2E_SRC = path.join(
  process.cwd(),
  "generatedMedia",
  "wave-e2e-image-carousel",
);
const WAVE_DIR = path.join(
  process.cwd(),
  "memory",
  "waves",
  "2026-10-17-anchor-ref-bakeoff",
);
const API_BASE = process.env.LIVE_GEN_API_BASE?.trim() || "http://localhost:3001";
const USER_ID = "user_seed_admin_c16";
const HARD_PNG_CAP = 9;
const DATE = "2026-10-17";

const DRAFT_IDS = {
  a: "draft-s54-a",
  b: "draft-s54-b",
  c: "draft-s54-c",
} as const;

type RunId = "a" | "b" | "c";

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
    slug: "mashtots-home",
    topicLabel: "Маштоц / алфавит as home",
    cta: 2,
    n: 3,
    userBrief: [
      "Сделай карусель Vernatun на 3 слайда про армянский ЯЗЫК:",
      "Маштоц и алфавит как дом — буква как убежище для детей диаспоры.",
      "Не кофе, не джаз, не клубный ритуал. CTA 2.",
      "Cover = curiosity gap ≤6–8 слов. STRICT JSON.",
    ].join(" "),
    scriptwriterMd: "20-s54-scriptwriter-mashtots-home.md",
    designerMd: "21-s54-designer-mashtots-home.md",
    draftId: DRAFT_IDS.a,
  },
  {
    id: "b",
    slug: "diaspora-kids",
    topicLabel: "Дети диаспоры говорят по-армянски",
    cta: 1,
    n: 3,
    userBrief: [
      "Сделай карусель Vernatun на 3 слайда про армянский ЯЗЫК:",
      "дети диаспоры учатся говорить по-армянски — субботняя школа, стыд и гордость звука.",
      "Не кофе, не джаз. CTA 1.",
      "Cover = curiosity gap ≤6–8 слов. STRICT JSON.",
    ].join(" "),
    scriptwriterMd: "22-s54-scriptwriter-diaspora-kids.md",
    designerMd: "23-s54-designer-diaspora-kids.md",
    draftId: DRAFT_IDS.b,
  },
  {
    id: "c",
    slug: "city-speech",
    topicLabel: "Армянский в городе / вывески / устная речь",
    cta: 4,
    n: 3,
    userBrief: [
      "Сделай карусель Vernatun на 3 слайда про армянский ЯЗЫК в городе:",
      "вывески, устная речь на улице, живой язык между домами.",
      "Не кофе, не джаз. CTA 4.",
      "Cover = curiosity gap ≤6–8 слов. STRICT JSON.",
    ].join(" "),
    scriptwriterMd: "24-s54-scriptwriter-city-speech.md",
    designerMd: "25-s54-designer-city-speech.md",
    draftId: DRAFT_IDS.c,
  },
];

const CTA_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: "Напишите в комментариях",
  2: "Подписывайся",
  3: "TG · в шапке профиля",
  4: "Лайк + сохранить",
};

function fallbackHandoff(topic: TopicRun): CarouselHandoffJson {
  if (topic.id === "a") {
    return {
      project: "vernatun",
      content_id: "s54-mashtots-home",
      idea: "Маштоц — алфавит как дом",
      hook: "Буква дышит?",
      tone: "warm heritage",
      cta_type: 2,
      caption: "Алфавит Месропа — не музей, а дом. Vernatun.",
      hashtags: ["#Vernatun", "#Mashtots", "#ArmenianLanguage"],
      requested_slide_count: 3,
      slides: [
        {
          slide_number: 1,
          layout_variant: "cover",
          primary_copy: "Буква дышит?",
          secondary_copy: "Маштоц дал диаспоре дом в одном знаке.",
          swipe_trigger: "узнать, почему буква — убежище",
          visual_prompt:
            "Dark editorial night desk, warm cognac light on carved Armenian letter Ա, soft gold dust, manuscript paper texture, cinematic shallow depth, premium Vernatun mood, no purple slop",
        },
        {
          slide_number: 2,
          layout_variant: "body_slide",
          primary_copy: "Один знак — целый дом",
          secondary_copy:
            "Ребёнок узнаёт родной звук раньше, чем карту Еревана.",
          swipe_trigger: "увидеть ритуал передачи",
          visual_prompt:
            "Child hands tracing stone-carved Armenian glyph, candle glow, heritage paper, same dark luxury editorial world as cover",
        },
        {
          slide_number: 3,
          layout_variant: "cta_slide",
          primary_copy: "Хочешь ещё таких историй?",
          secondary_copy: "Подписывайся — Vernatun хранит буквы живыми.",
          swipe_trigger: "подписаться на культуру",
          visual_prompt:
            "Premium dark poster frame, soft gold accent pill space, Armenian manuscript fragments blurred, same palette and lighting family as cover",
          cta_type: 2,
        },
      ],
    };
  }
  if (topic.id === "b") {
    return {
      project: "vernatun",
      content_id: "s54-diaspora-kids",
      idea: "Дети диаспоры говорят по-армянски",
      hook: "Стыдно звучать?",
      tone: "tender cultural",
      cta_type: 1,
      caption: "Субботняя школа — голос, который возвращают. Vernatun.",
      hashtags: ["#Vernatun", "#Diaspora", "#ArmenianKids"],
      requested_slide_count: 3,
      slides: [
        {
          slide_number: 1,
          layout_variant: "cover",
          primary_copy: "Стыдно звучать?",
          secondary_copy: "Первое «բարև» громче любого диплома.",
          swipe_trigger: "услышать, как проходит страх",
          visual_prompt:
            "Warm classroom window light on children's notebooks with Armenian letters, soft chalk dust, cognac wood desk, dark editorial Vernatun mood, no coffee props",
        },
        {
          slide_number: 2,
          layout_variant: "body_slide",
          primary_copy: "Суббота учит рот",
          secondary_copy:
            "Один урок — и чужой звук становится своим именем.",
          swipe_trigger: "увидеть момент смелости",
          visual_prompt:
            "Close-up of child speaking toward teacher silhouette, same warm window light and chalk classroom materials as cover, heritage editorial photography",
        },
        {
          slide_number: 3,
          layout_variant: "cta_slide",
          primary_copy: "Какое первое слово?",
          secondary_copy: "Напишите в комментариях — Vernatun слушает.",
          swipe_trigger: "ответить в комментариях",
          visual_prompt:
            "Empty classroom desk with soft gold accent glow, same palette as cover, premium Instagram CTA frame space",
          cta_type: 1,
        },
      ],
    };
  }
  return {
    project: "vernatun",
    content_id: "s54-city-speech",
    idea: "Армянский в городе — вывески и устная речь",
    hook: "Город шепчет?",
    tone: "urban cultural",
    cta_type: 4,
    caption: "Вывеска и голос — один язык улицы. Vernatun.",
    hashtags: ["#Vernatun", "#Yerevan", "#ArmenianStreet"],
    requested_slide_count: 3,
    slides: [
      {
        slide_number: 1,
        layout_variant: "cover",
        primary_copy: "Город шепчет?",
        secondary_copy: "Вывеска говорит раньше, чем гид.",
        swipe_trigger: "услышать улицу на армянском",
        visual_prompt:
          "Night street neon reflecting on wet asphalt, Armenian shop signage softly glowing gold, dark luxury urban editorial, cinematic rain haze, no purple slop",
      },
      {
        slide_number: 2,
        layout_variant: "body_slide",
        primary_copy: "Устная речь между домами",
        secondary_copy:
          "Одно «ողջույն» в подъезде держит квартал живым.",
        swipe_trigger: "почувствовать соседский звук",
        visual_prompt:
          "Apartment stairwell conversation blur, warm tungsten vs cool street neon, same night-city palette and rain texture as cover",
      },
      {
        slide_number: 3,
        layout_variant: "cta_slide",
        primary_copy: "Сохрани язык улицы",
        secondary_copy: "Лайк + сохранить — Vernatun рядом.",
        swipe_trigger: "лайкнуть и сохранить",
        visual_prompt:
          "Premium night street CTA frame, soft gold accent on dark wet pavement, same lighting grammar as cover",
        cta_type: 4,
      },
    ],
  };
}

function selectedIds(): RunId[] {
  const arg = process.argv.find((a) => a.startsWith("--only="));
  if (!arg) return ["a", "b", "c"];
  const set = new Set(
    arg
      .slice("--only=".length)
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s): s is RunId => s === "a" || s === "b" || s === "c"),
  );
  return (["a", "b", "c"] as const).filter((id) => set.has(id));
}

function wantsSkipDraw(): boolean {
  return process.argv.includes("--skip-draw");
}

/** Reuse wave handoff-json + skip live Scriptwriter (draw / pack only). */
function wantsDrawOnly(): boolean {
  return process.argv.includes("--draw-only");
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
  return ["```" + lang, body.replace(/\r?\n/g, "\n").trimEnd(), "```"].join(
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
    ) &&
    !/маштоц|алфавит|диаспор|город|вывеск|язык|буква|шепч/i.test(topicBlob);
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

async function copyDirSlides(
  srcDir: string,
  destDir: string,
): Promise<string[]> {
  await mkdir(destDir, { recursive: true });
  const out: string[] = [];
  for (let i = 1; i <= 3; i++) {
    const name = `slide_${String(i).padStart(2, "0")}.png`;
    const src = path.join(srcDir, name);
    const dest = path.join(destDir, name);
    if (await fileExists(src)) {
      await copyFile(src, dest);
      out.push(dest);
    }
  }
  return out;
}

async function packageZeroBurnArms(): Promise<{
  etalon: string[];
  e2e: string[];
}> {
  const etalonRoot = path.join(BAKEOFF_ROOT, "pipeline=etalon");
  const e2eRoot = path.join(BAKEOFF_ROOT, "pipeline=e2e_diffusion");
  await mkdir(etalonRoot, { recursive: true });
  await mkdir(e2eRoot, { recursive: true });

  const etalonPairs: Array<[string, string]> = [
    ["A-dark_notes", "A-dark_notes"],
    ["B-bento_glass", "B-bento_glass"],
    ["C-audit_poster", "C-audit_poster"],
  ];
  const etalonCopied: string[] = [];
  for (const [srcName, destName] of etalonPairs) {
    const paths = await copyDirSlides(
      path.join(ETALON_SRC, srcName),
      path.join(etalonRoot, destName),
    );
    etalonCopied.push(...paths);
  }

  const e2ePairs: Array<[string, string]> = [
    ["a", "hy-letters"],
    ["b", "hy-sevan"],
  ];
  const e2eCopied: string[] = [];
  for (const [srcName, destName] of e2ePairs) {
    const paths = await copyDirSlides(
      path.join(E2E_SRC, srcName),
      path.join(e2eRoot, destName),
    );
    e2eCopied.push(...paths);
  }

  return { etalon: etalonCopied, e2e: e2eCopied };
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
    `# Scriptwriter session — \`${input.topic.slug}\` (S54 ANCHOR REF bake-off)`,
    "",
    `**Date:** ${DATE}`,
    `**Model:** \`${input.model}\``,
    `**Source:** ${input.source}`,
    `**N slides / CTA #:** ${input.topic.n} / ${input.topic.cta}`,
    `**Topic (LANGUAGE):** ${input.topic.topicLabel}`,
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
    "_Includes VIRAL CRAFT + S54 LANGUAGE guidance when live._",
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
    `| Topic = LANGUAGE (not coffee) | ${input.checklist.topic} |`,
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
  continuity: string;
  masterStyleBlock?: string;
  weakNote: string;
}): string {
  const pngRows = [0, 1, 2]
    .map((i) => {
      const p = input.pngPaths[i];
      return `| ${String(i + 1).padStart(2, "0")} | ${p ? `\`${p.replace(/\\/g, "/")}\`` : "_(missing)_"} | yes |`;
    })
    .join("\n");

  return [
    `# Designer session — \`${input.topic.slug}\` (S54 ANCHOR REF)`,
    "",
    `**Date:** ${DATE}`,
    `**Draw / image model:** \`${input.imageModel}\` · bgCalls=${input.bgCalls} · mode=\`${input.renderMode}\``,
    `**Paint path:** \`anchor_ref_pipeline\``,
    `**Cover-first:** yes (sequential)`,
    `**Continuity mode:** \`${input.continuity}\` (image_edit | image_ref_generations | prompt_only / MASTER STYLE)`,
    `**html_overlay:** \`none\``,
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
    "**MASTER STYLE (LOCKED) restated for slides 2–N:**",
    "",
    fence("text", input.masterStyleBlock || "(n/a)"),
    "",
    "**Approx colors / brandbook tokens:**",
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
    "Cover = full E2E. Slides 2–N = MASTER STYLE + Match approved cover + new exact copy in quotes.",
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
    `| Paint path | **anchor_ref_pipeline** |`,
    `| Continuity | ${input.continuity} |`,
    "| `swipe_trigger` painted? | **no** |",
    "| Safe-zone in prompt | top≥120 bottom≥160 sides≥80 |",
    "",
    "---",
    "",
    "## 5. Outputs",
    "",
    "| Slide | PNG path | Typography on image? |",
    "|-------|----------|----------------------|",
    pngRows,
    "",
    "**Budget check:** wave new PNG ≤9 (3 carousels × 3) under `pipeline=anchor_ref_pipeline` only.",
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
  process.env.CAROUSEL_DRAW_MODE = "anchor_ref";
  process.env.CAROUSEL_PROMPT_TRACE = "1";
  process.env.CAROUSEL_DRAW_SKIP_BG = "0";
  delete process.env.CAROUSEL_HTML_FIRST;
  process.env.WAVE_VISUAL_COPY_ARTIFACTS = "0";
  // Isolate S54 9-PNG budget from prior wave-visual-deconstructor counter (39/40).
  process.env.WAVE_VISUAL_ARTIFACT_DIR = BAKEOFF_ROOT;
  process.env.CAROUSEL_IMAGE_MODEL =
    process.env.CAROUSEL_IMAGE_MODEL?.trim() || DEFAULT_CAROUSEL_IMAGE_MODEL;

  const skipDraw = wantsSkipDraw();
  const drawOnly = wantsDrawOnly();
  const ids = selectedIds();
  const runs = TOPICS.filter((t) => ids.includes(t.id));

  if (!CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY.includes("VIRAL CRAFT")) {
    console.error("S54_FAIL overlay missing VIRAL CRAFT");
    process.exit(1);
  }
  if (!CREATE_CAROUSEL_ANCHOR_REF_DRAW_OVERLAY.includes("ANCHOR REF")) {
    console.error("S54_FAIL missing ANCHOR REF overlay");
    process.exit(1);
  }
  if (!CREATE_CAROUSEL_S54_LANGUAGE_TOPIC_GUIDANCE.includes("LANGUAGE")) {
    console.error("S54_FAIL missing LANGUAGE guidance");
    process.exit(1);
  }

  const { resolveAggregatorEnv } = await import("../lib/llm/aggregator");
  const { callAggregatorChat } = await import("../lib/llm/aggregator-chat");
  const {
    parseCarouselJsonFromText,
    parseAndAssertCarouselJsonStrict,
  } = await import("../lib/studio/carousel-json-contract");
  const {
    runCreateCarouselDraw,
    isCarouselE2eTextInImage,
    isCarouselAnchorRef,
  } = await import("../lib/studio/carousel-html-renderer");

  if (!isCarouselE2eTextInImage()) {
    console.error("S54_FAIL CAROUSEL_E2E_TEXT_IN_IMAGE unexpectedly OFF");
    process.exit(1);
  }
  if (!isCarouselAnchorRef()) {
    console.error("S54_FAIL CAROUSEL_DRAW_MODE not anchor_ref");
    process.exit(1);
  }

  const hasKey = Boolean(resolveAggregatorEnv());
  console.log(`S54_KEY=${hasKey ? "present" : "MISSING"}`);
  console.log(`S54_API=${API_BASE}`);
  console.log(`S54_SCRIPTWRITER=${DEFAULT_SCRIPTWRITER_MODEL}`);
  console.log(`S54_IMAGE=${process.env.CAROUSEL_IMAGE_MODEL}`);
  console.log(`S54_DRAW_MODE=anchor_ref`);
  console.log(`S54_SKIP_DRAW=${skipDraw}`);
  console.log(`S54_DRAW_ONLY=${drawOnly}`);
  console.log(`S54_BAKEOFF=${BAKEOFF_ROOT}`);
  console.log(`S54_RUNS=${runs.map((r) => r.slug).join(",")}`);

  if (!hasKey && !skipDraw) {
    console.error("S54_FAIL aggregator_key_missing");
    process.exit(1);
  }

  await mkdir(DOCS_DIR, { recursive: true });
  await mkdir(BAKEOFF_ROOT, { recursive: true });
  await mkdir(ANCHOR_ROOT, { recursive: true });
  await mkdir(WAVE_DIR, { recursive: true });

  // Fresh S54 wave counter (HARD 9) — do not inherit deconstructor 39/40.
  await writeFile(
    path.join(BAKEOFF_ROOT, "_png_budget.json"),
    JSON.stringify(
      {
        count: 0,
        max: HARD_PNG_CAP,
        updatedAt: new Date().toISOString(),
        ticket: "C-s54-bakeoff-pack",
      },
      null,
      2,
    ),
    "utf8",
  );

  const zeroBurn = await packageZeroBurnArms();
  console.log(
    `S54_ZERO_BURN etalon=${zeroBurn.etalon.length} e2e=${zeroBurn.e2e.length}`,
  );

  const designerSeed = seedAgentsForPipeline("carousel-engine").designer;
  const skillsTable = [
    "| Id | Layer | Why |",
    "|----|-------|-----|",
    "| carousel-json-contract | skill | Phase5 ANCHOR REF |",
    "| carousel-prompt-trace | skill | dump EXACT prompts |",
    "| create-carousel-prompts | lib | ANCHOR REF + MASTER STYLE + LANGUAGE |",
    ...(designerSeed?.skills ?? []).map(
      (s) => `| ${s} | mesh skill | Designer seed |`,
    ),
  ].join("\n");

  let totalPng = 0;
  let observedContinuity = "pending";
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
    continuity: string;
    samplePrompt: string;
  }> = [];

  for (const topic of runs) {
    let strict: unknown;
    let checklist: Record<string, string> = {};
    let swWeak = "n/a";
    let source: "live" | "fallback" = "live";

    const handoffPath = path.join(
      WAVE_DIR,
      "handoff-json",
      `${topic.slug}.json`,
    );

    if (drawOnly && (await fileExists(handoffPath))) {
      console.log(`\n=== REUSE HANDOFF ${topic.slug} ===`);
      strict = JSON.parse(readFileSync(handoffPath, "utf8"));
      checklist = handoffChecklist(
        strict as Parameters<typeof handoffChecklist>[0],
      );
      swWeak = "reused prior live Scriptwriter MD";
      source = "live";
      console.log(`S54_SW_REUSE ${handoffPath}`);
    } else {
      console.log(`\n=== SCRIPTWRITER ${topic.slug} ===`);

      const bundle = buildCreateCarouselAgentBundle({
        agentRole: "scriptwriter",
        mode: "chat",
        pipelineId: "carousel-engine",
      });
      let system = assembleAgentStartSystemPrompt(bundle);
      if (!system.includes("S54 LANGUAGE")) {
        system = [
          system,
          "",
          CREATE_CAROUSEL_S54_LANGUAGE_TOPIC_GUIDANCE,
        ].join("\n");
      }
      void resolveCreateCarouselOverlay("designer", "draw", {
        drawMode: "anchor_ref",
      });

      const user = topic.userBrief;

      let modelUsed = DEFAULT_SCRIPTWRITER_MODEL;
      let reply1 = "";
      let correctionUser: string | null = null;
      let reply2: string | null = null;
      let parsed: unknown = null;
      source = "live";

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
            `S54_SW_DEGRADE ${topic.slug} ${chat1.fallbackFrom} → ${modelUsed}`,
          );
        }
        reply1 = chat1.text;
        try {
          parsed = parseCarouselJsonFromText(reply1);
        } catch (e) {
          console.warn(
            `S54_SW_PARSE_WEAK ${topic.slug}`,
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
            "каждый body = один конкретный insight про ЯЗЫК;",
            "cta_slide = catalog copy под заданный CTA;",
            "каждый visual_prompt = concrete cinematic scene (same world family);",
            "swipe_trigger meta; TOPIC только LANGUAGE из брифа — не кофе;",
            "верни полный STRICT JSON в fenced ```json.",
          ].join(" ");
          console.log(`S54_SW_CORRECTION ${topic.slug}`);
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
          `S54_SW_LIVE_FAIL ${topic.slug} → strong handoff fallback`,
          chat1.error,
        );
        source = "fallback";
        reply1 = "(live Scriptwriter unavailable — strong handoff JSON used)";
        parsed = fallbackHandoff(topic);
      }

      if (!parsed) {
        console.warn(`S54_SW_NO_JSON ${topic.slug} → fallback handoff`);
        source = "fallback";
        parsed = fallbackHandoff(topic);
        if (!reply1) reply1 = "(parse miss — fallback handoff)";
      }

      try {
        strict = parseAndAssertCarouselJsonStrict(JSON.stringify(parsed));
      } catch (e) {
        console.warn(
          `S54_SW_STRICT_SOFT ${topic.slug}`,
          e instanceof Error ? e.message : e,
        );
        strict = parsed;
      }

      const slidesArr = (strict as { slides?: unknown[] }).slides;
      if (!Array.isArray(slidesArr) || slidesArr.length !== topic.n) {
        console.warn(
          `S54_SW_N_MISMATCH ${topic.slug} got=${slidesArr?.length} → fallback`,
        );
        strict = fallbackHandoff(topic);
        source = "fallback";
      }

      checklist = handoffChecklist(
        strict as Parameters<typeof handoffChecklist>[0],
      );
      const swWeakParts: string[] = [];
      for (const [k, v] of Object.entries(checklist)) {
        if (v !== "PASS") swWeakParts.push(`${k}=${v}`);
      }
      swWeak =
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
      console.log(`S54_SW_MD ${swPath} source=${source}`);

      await mkdir(path.join(WAVE_DIR, "handoff-json"), { recursive: true });
      await writeFile(
        handoffPath,
        JSON.stringify(strict, null, 2),
        "utf8",
      );
    }

    let pngPaths: string[] = [];
    let deWeak = "skipped (--skip-draw)";
    let draftOk = false;
    let renderMode = "";
    let continuity = "n/a";
    let samplePrompt = "";
    let masterStyleBlock = "";

    if (!skipDraw) {
      if (totalPng + topic.n > HARD_PNG_CAP) {
        console.error(
          `BUDGET_STOP would exceed ${HARD_PNG_CAP} (have ${totalPng})`,
        );
        await writeFile(
          path.join(BAKEOFF_ROOT, "_stop-report.md"),
          `# STOP — PNG budget\n\nWould exceed ${HARD_PNG_CAP} new PNG (have ${totalPng}).\n`,
          "utf8",
        );
        break;
      }

      console.log(`=== DESIGNER ANCHOR REF DRAW ${topic.slug} ===`);
      const draw = await runCreateCarouselDraw(
        strict as Parameters<typeof runCreateCarouselDraw>[0],
        {
          jobId: `s54-${topic.id}-${Date.now()}`,
          model: DEFAULT_CAROUSEL_IMAGE_MODEL,
          copyToWaveArtifacts: false,
          defaultCtaLabel: CTA_LABEL[topic.cta],
          drawMode: "anchor_ref",
        },
      );

      if (!draw.ok) {
        console.error(
          `S54_DRAW_FAIL ${topic.slug}`,
          draw.error?.code,
          draw.error?.message,
        );
        deWeak = `draw FAIL: ${draw.error?.code}`;
      } else {
        renderMode = draw.renderMode;
        continuity = String(draw.anchorContinuity ?? "unknown");
        observedContinuity = continuity;
        masterStyleBlock = draw.masterStyleBlock || "";
        const bgCalls = draw.bgImageCalls ?? 0;
        const imageUrls = draw.slides.map((s) => s.imageUrl).filter(Boolean);
        const runDir = path.join(ANCHOR_ROOT, topic.slug);
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
          `S54_DRAW_OK ${topic.slug} png=${pngPaths.length} bgCalls=${bgCalls} mode=${draw.renderMode} continuity=${continuity}`,
        );

        if (
          draw.renderMode !== "anchor_ref_pipeline" ||
          !draw.e2eTextInImage
        ) {
          deWeak = `FAIL S54: renderMode=${draw.renderMode} e2eTextInImage=${draw.e2eTextInImage}`;
        } else if (
          !(draw.imagePrompts ?? []).every((p) =>
            /Paint EXACT readable/i.test(p || ""),
          )
        ) {
          deWeak = "FAIL: prompts missing EXACT readable typography";
        } else if (
          !(draw.imagePrompts ?? [])[0]?.includes("ANCHOR REF COVER") ||
          !(draw.imagePrompts ?? []).slice(1).every((p) =>
            /MASTER STYLE \(LOCKED/i.test(p || ""),
          )
        ) {
          deWeak = "FAIL: missing ANCHOR REF / MASTER STYLE in prompts";
        } else {
          deWeak =
            pngPaths.length === topic.n
              ? `none / PASS — anchor_ref_pipeline · continuity=${continuity}`
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
          `Получил handoff JSON (${slides.length} slides). Paint path: ANCHOR REF — cover first, then match cover world.`,
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
          continuity,
          masterStyleBlock,
          weakNote: deWeak,
        });
        const dePath = path.join(DOCS_DIR, topic.designerMd);
        await writeFile(dePath, deMd, "utf8");
        console.log(`S54_DE_MD ${dePath}`);

        const draft = await upsertDraft({
          id: topic.draftId,
          title: `S54 ${topic.id.toUpperCase()}: ${topic.topicLabel}`,
          imageUrls,
          payload: {
            wave: "2026-10-17-anchor-ref-bakeoff",
            ticket: "C-s54-bakeoff-pack",
            slug: topic.slug,
            handoff: strict,
            renderMode: draw.renderMode,
            paint_path: "anchor_ref_pipeline",
            anchorContinuity: continuity,
            e2eTextInImage: draw.e2eTextInImage,
            bgImageCalls: bgCalls,
            imageModel: DEFAULT_CAROUSEL_IMAGE_MODEL,
            html_overlay: "none",
            overwriteOf: topic.draftId,
          },
        });
        draftOk = draft.ok;
        console.log(
          `S54_DRAFT ${topic.slug} ok=${draft.ok} id=${draft.id || topic.draftId}`,
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
      continuity,
      samplePrompt,
    });
  }

  const phase5Pass = sessionSummaries.every(
    (s) =>
      skipDraw ||
      (s.renderMode === "anchor_ref_pipeline" &&
        s.pngPaths.length === 3 &&
        !s.deWeak.startsWith("FAIL")),
  );

  const readme = [
    "# Bake-off 2026-10-17 — Carousel pipeline compare (S54)",
    "",
    "Client: open each `pipeline=` folder side-by-side and pick which arm is **closest to etalon**.",
    "",
    "## Arms",
    "",
    "| Label | Path | Budget | Notes |",
    "|-------|------|--------|-------|",
    "| **etalon** | `pipeline=etalon/` | 0 new | Craft refs from `generatedMedia/эталон карусели` (A-dark_notes, B-bento_glass, C-audit_poster) |",
    "| **e2e_diffusion** | `pipeline=e2e_diffusion/` | 0 new | Prior Phase4 one-shot topics (`hy-letters`, `hy-sevan`) — **not** reburned |",
    "| **anchor_ref_pipeline** | `pipeline=anchor_ref_pipeline/` | **9 new** | Cover-first + match cover (ref image **or** MASTER STYLE text) |",
    "",
    "## NEW arm themes (Armenian LANGUAGE)",
    "",
    "| Slug | Brief |",
    "|------|-------|",
    "| `mashtots-home` | Маштоц / алфавит as home |",
    "| `diaspora-kids` | дети диаспоры говорят по-армянски |",
    "| `city-speech` | армянский в городе / вывески / устная речь |",
    "",
    "Theme mismatch vs e2e/etalon is OK — Client compares **craft continuity** (type-in-pixels, set consistency), not identical topics.",
    "",
    "## Continuity mode (this run)",
    "",
    `\`${observedContinuity}\``,
    "",
    "- `image_edit` — Polza `/images/edits` accepted cover PNG",
    "- `image_ref_generations` — generations accepted image/image_url field",
    "- `prompt_only` — Path B: sequential MASTER STYLE restatement (no binary ref)",
    "",
    "## How Client compares (S54.A–C)",
    "",
    "1. Open `pipeline=etalon/` next to `pipeline=e2e_diffusion/` and `pipeline=anchor_ref_pipeline/{theme}/`.",
    "2. Check cover→slide_02/03 visual world match on **anchor_ref** arm.",
    "3. Verdict sentence: which `pipeline=` label is closest to etalon.",
    "",
    "## MD traces",
    "",
    "| Theme | Scriptwriter | Designer |",
    "|-------|--------------|----------|",
    ...sessionSummaries.map(
      (s) =>
        `| \`${s.slug}\` | [\`${s.scriptwriterMd}\`](../../../docs/карусель%20тест/${s.scriptwriterMd}) | [\`${s.designerMd}\`](../../../docs/карусель%20тест/${s.designerMd}) |`,
    ),
    "",
    `**PNG new:** ${totalPng}/${HARD_PNG_CAP}`,
    `**Drafts:** \`draft-s54-a\` / \`b\` / \`c\` (overwrite if API up)`,
    `**Smoke:** ${phase5Pass ? "PASS (code path)" : "CHECK — see weak links"}`,
    "",
    "Script: `npx tsx scripts/live-gen-s54-anchor-bakeoff.ts`",
    "",
  ].join("\n");

  await writeFile(path.join(BAKEOFF_ROOT, "README.md"), readme, "utf8");

  // Append S54 rows to docs index if present
  const docsReadmePath = path.join(DOCS_DIR, "README.md");
  let docsReadme = "";
  try {
    docsReadme = readFileSync(docsReadmePath, "utf8");
  } catch {
    docsReadme = "# Карусель тест\n\n";
  }
  if (!docsReadme.includes("S54 ANCHOR REF")) {
    const s54Block = [
      "",
      "## S54 ANCHOR REF bake-off (2026-10-17)",
      "",
      "| # | Файл | Тема | PNG |",
      "|---|------|------|-----|",
      ...sessionSummaries.map(
        (s, i) =>
          `| ${20 + i * 2}–${21 + i * 2} | [\`${s.scriptwriterMd}\`](./${s.scriptwriterMd}) + [\`${s.designerMd}\`](./${s.designerMd}) | ${s.slug} | \`pipeline=anchor_ref_pipeline/${s.slug}/\` |`,
      ),
      "",
      "Compare root: `generatedMedia/карусель тест/bakeoff-20261017/`",
      "",
    ].join("\n");
    await writeFile(docsReadmePath, docsReadme.trimEnd() + s54Block, "utf8");
  }

  await writeFile(
    path.join(BAKEOFF_ROOT, "_png_budget.json"),
    JSON.stringify(
      {
        ticket: "C-s54-bakeoff-pack",
        max_new: HARD_PNG_CAP,
        count_new: totalPng,
        continuity: observedContinuity,
        drafts: runs.map((r) => r.draftId),
        slugs: sessionSummaries.map((s) => s.slug),
        renderModes: sessionSummaries.map((s) => s.renderMode),
        zero_burn: {
          etalon: zeroBurn.etalon.length,
          e2e_diffusion: zeroBurn.e2e.length,
        },
      },
      null,
      2,
    ),
    "utf8",
  );

  await writeFile(
    path.join(
      process.cwd(),
      "memory",
      "tickets",
      "C-s54-bakeoff-pack",
      "decisions.md",
    ),
    [
      "# C-s54-bakeoff-pack — decisions / run log",
      "",
      `- Date: ${DATE}`,
      `- New PNG: ${totalPng}/${HARD_PNG_CAP}`,
      `- Continuity observed: \`${observedContinuity}\``,
      `- Themes: ${sessionSummaries.map((s) => s.slug).join(", ")}`,
      `- Root: \`generatedMedia/карусель тест/bakeoff-20261017/\``,
      `- Drafts: draft-s54-a/b/c`,
      `- Smoke: ${phase5Pass ? "PASS" : "CHECK"}`,
      "",
      "## Per theme",
      "",
      ...sessionSummaries.map(
        (s) =>
          `- **${s.slug}**: mode=${s.renderMode} continuity=${s.continuity} png=${s.pngPaths.length} draft=${s.draftOk} weak=${s.deWeak}`,
      ),
      "",
    ].join("\n"),
    "utf8",
  );

  console.log(`\nS54_DONE png=${totalPng}/${HARD_PNG_CAP} pass=${phase5Pass}`);
  console.log(`S54_CONTINUITY=${observedContinuity}`);
  console.log(`S54_README=${path.join(BAKEOFF_ROOT, "README.md")}`);
  for (const s of sessionSummaries) {
    for (const p of s.pngPaths) console.log(`S54_PNG ${p}`);
  }

  if (
    !skipDraw &&
    (!phase5Pass || totalPng < HARD_PNG_CAP) &&
    ids.length === 3
  ) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("S54_FATAL", e instanceof Error ? e.message : e);
  process.exit(1);
});
