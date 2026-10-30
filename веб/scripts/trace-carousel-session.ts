/**
 * Wave 2026-10-16 carousel-prompt-trace — live Scriptwriter → Designer dump.
 *
 *   npx tsx scripts/trace-carousel-session.ts
 *   npx tsx scripts/trace-carousel-session.ts --only=a
 *   npx tsx scripts/trace-carousel-session.ts --skip-draw
 *   npx tsx scripts/trace-carousel-session.ts --correction
 *
 * Env forced:
 *   CAROUSEL_PROMPT_TRACE=1
 *   CAROUSEL_HTML_FIRST=1
 *   CAROUSEL_DRAW_SKIP_BG=0
 *   WAVE_VISUAL_ARTIFACT_DIR=generatedMedia/wave-carousel-prompt-trace
 *
 * Budget: 2×3 = 6 PNG. Draft overwrite: draft-trace-a / draft-trace-b only.
 * Secrets: never logged.
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
import type { LiveGenKitAesthetic } from "@/lib/studio/carousel-html-renderer";
import { seedAgentsForPipeline } from "@/lib/mesh/agent-defaults";

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
  "wave-carousel-prompt-trace",
);
const WAVE_DIR = path.join(
  process.cwd(),
  "memory",
  "waves",
  "2026-10-16-carousel-prompt-trace",
);
const API_BASE = process.env.LIVE_GEN_API_BASE?.trim() || "http://localhost:3001";
const USER_ID = "user_seed_admin_c16";
const HARD_PNG_CAP = 6;
const DATE = "2026-10-16";

const DRAFT_IDS = {
  a: "draft-trace-a",
  b: "draft-trace-b",
} as const;

type RunId = "a" | "b";

type TopicRun = {
  id: RunId;
  slug: string;
  /** Raw user brief only (C-155) — N + CTA included as user would type. */
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
    scriptwriterMd: "01-scriptwriter-hy-letters.md",
    designerMd: "03-designer-hy-letters.md",
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
    scriptwriterMd: "02-scriptwriter-hy-sevan.md",
    designerMd: "04-designer-hy-sevan.md",
    draftId: DRAFT_IDS.b,
  },
];

const CTA_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: "Напишите в комментариях",
  2: "Подписывайся",
  3: "TG · в шапке профиля",
  4: "Лайк + сохранить",
};

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

function forceCorrection(): boolean {
  return process.argv.includes("--correction");
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
      /^красив(ый|ый)\s+фон$/i.test(s.visual_prompt.trim()) ||
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
  const cover = slides.find((s) => /cover/i.test(String(s.layout_variant))) ?? slides[0];
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
    const id =
      typeof raw?.draft?.id === "string" ? raw.draft.id : "";
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
    `# Scriptwriter session — \`${input.topic.slug}\``,
    "",
    `**Date:** ${DATE}`,
    `**Model:** \`${input.model}\``,
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
    "_Source: `buildCreateCarouselAgentBundle` + `assembleAgentStartSystemPrompt` (Create product path). `CAROUSEL_PROMPT_TRACE=1`._",
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
    `| Body value beats (not flat labels) | ${input.checklist.body} |`,
    `| \`swipe_trigger\` meta every slide | ${input.checklist.swipe} |`,
    `| \`cta_type\` 1–4 on cta_slide | ${input.checklist.cta} |`,
    `| Concrete \`visual_prompt\` each slide | ${input.checklist.visual} |`,
    `| Topic = user (not coffee default) | ${input.checklist.topic} |`,
    "",
    `**Weak-link note (Scriptwriter only):** ${input.weakNote}`,
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
  weakNote: string;
}): string {
  const pngRows = [0, 1, 2]
    .map((i) => {
      const p = input.pngPaths[i];
      return `| ${String(i + 1).padStart(2, "0")} | ${p ? `\`${p.replace(/\\/g, "/")}\`` : "_(missing)_"} |`;
    })
    .join("\n");

  return [
    `# Designer session — \`${input.topic.slug}\``,
    "",
    `**Date:** ${DATE}`,
    `**Describe model:** _(draw path — no separate describe chat; handoff JSON direct)_`,
    `**Draw / image model:** \`${input.imageModel}\` · bgCalls=${input.bgCalls} · mode=\`${input.renderMode}\``,
    `**Handoff from:** \`${input.topic.scriptwriterMd}\``,
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
    input.promptBlocks,
    "",
    "---",
    "",
    "## 4. Post-process (HTML overlay)",
    "",
    "| Step | Detail |",
    "|------|--------|",
    "| HTML/CSS template | `carouselHtmlBuilder` → Playwright PNG |",
    `| CSS vars / brandbook tokens | ${Object.keys(input.cssVars ?? {}).length} vars (\`--cf-design-*\`) |`,
    "| Playwright raster size | 1080×1350 |",
    "| Text painted | primary_copy / secondary_copy / CTA only |",
    "| `swipe_trigger` painted? | **no** |",
    "| Safe-zone | top≥120 bottom≥160 sides≥80 |",
    "",
    "---",
    "",
    "## 5. Outputs",
    "",
    "| Slide | PNG path |",
    "|-------|----------|",
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
  process.env.CAROUSEL_PROMPT_TRACE = "1";
  process.env.CAROUSEL_HTML_FIRST = "1";
  process.env.CAROUSEL_DRAW_SKIP_BG = "0";
  process.env.WAVE_VISUAL_COPY_ARTIFACTS = "0";
  process.env.WAVE_VISUAL_ARTIFACT_DIR = ARTIFACT_ROOT;
  process.env.CAROUSEL_IMAGE_MODEL =
    process.env.CAROUSEL_IMAGE_MODEL?.trim() || DEFAULT_CAROUSEL_IMAGE_MODEL;

  const skipDraw = wantsSkipDraw();
  const ids = selectedIds();
  const runs = TOPICS.filter((t) => ids.includes(t.id));

  // Sanity: VIRAL CRAFT must be in overlay before live call
  if (!CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY.includes("VIRAL CRAFT")) {
    console.error("TRACE_FAIL overlay missing VIRAL CRAFT");
    process.exit(1);
  }

  const { resolveAggregatorEnv } = await import("../lib/llm/aggregator");
  const { callAggregatorChat } = await import("../lib/llm/aggregator-chat");
  const {
    parseCarouselJsonFromText,
    parseAndAssertCarouselJsonStrict,
  } = await import("../lib/studio/carousel-json-contract");
  const { runCreateCarouselDraw } = await import(
    "../lib/studio/carousel-html-renderer"
  );

  const hasKey = Boolean(resolveAggregatorEnv());
  console.log(`TRACE_KEY=${hasKey ? "present" : "MISSING"}`);
  console.log(`TRACE_API=${API_BASE}`);
  console.log(`TRACE_SCRIPTWRITER=${DEFAULT_SCRIPTWRITER_MODEL}`);
  console.log(`TRACE_IMAGE=${process.env.CAROUSEL_IMAGE_MODEL}`);
  console.log(`TRACE_SKIP_DRAW=${skipDraw}`);
  console.log(`TRACE_SKIP_BG=${process.env.CAROUSEL_DRAW_SKIP_BG}`);
  console.log(`TRACE_ARTIFACT=${ARTIFACT_ROOT}`);
  console.log(`TRACE_RUNS=${runs.map((r) => r.slug).join(",")}`);

  if (!hasKey) {
    console.error("TRACE_FAIL aggregator_key_missing");
    process.exit(1);
  }

  await mkdir(DOCS_DIR, { recursive: true });
  await mkdir(ARTIFACT_ROOT, { recursive: true });
  await mkdir(WAVE_DIR, { recursive: true });

  const designerSeed = seedAgentsForPipeline("carousel-engine").designer;
  const skillsTable = [
    "| Id | Layer | Why |",
    "|----|-------|-----|",
    "| carousel-json-contract | skill | Dramaturgy parse / STRICT JSON |",
    "| carousel-prompt-trace | skill | dump EXACT prompts |",
    "| create-carousel-prompts | lib | VIRAL CRAFT + Designer overlays |",
    ...(designerSeed?.skills ?? []).map(
      (s) => `| ${s} | mesh skill | Designer seed |`,
    ),
    ...(designerSeed?.plugins ?? []).map(
      (p) => `| ${p} | plugin | Designer seed |`,
    ),
    ...(designerSeed?.mcp ?? []).map(
      (m) => `| ${m} | mcp | Designer seed |`,
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

    if (!chat1.ok) {
      console.error(
        `TRACE_SW_FAIL ${topic.slug} err=${chat1.error} tried=${(chat1.triedModels ?? []).join("→")}`,
      );
      process.exit(1);
    }

    const modelUsed = chat1.model || DEFAULT_SCRIPTWRITER_MODEL;
    if (chat1.fallbackFrom) {
      console.warn(
        `TRACE_SW_DEGRADE ${topic.slug} ${chat1.fallbackFrom} → ${modelUsed}`,
      );
    }

    let reply1 = chat1.text;
    let correctionUser: string | null = null;
    let reply2: string | null = null;
    let parsed;
    try {
      parsed = parseCarouselJsonFromText(reply1);
    } catch (e) {
      console.warn(
        `TRACE_SW_PARSE_WEAK ${topic.slug}`,
        e instanceof Error ? e.message : e,
      );
      parsed = null;
    }

    const needsCorrection =
      forceCorrection() ||
      !parsed ||
      looksWeakJson(parsed as Parameters<typeof looksWeakJson>[0]);

    if (needsCorrection) {
      correctionUser = [
        "Поправь вирусную плотность: cover = curiosity paradox/question ≤6–8 слов (не flat label);",
        "каждый body = один конкретный insight/proof/tension;",
        "cta_slide = catalog copy под заданный CTA номер;",
        "каждый visual_prompt = concrete cinematic scene + kit (не «красивый фон»);",
        "swipe_trigger meta на каждом слайде; TOPIC только из моего брифа;",
        "верни полный STRICT JSON в fenced ```json — без prose-only «готово».",
      ].join(" ");

      console.log(`TRACE_SW_CORRECTION ${topic.slug}`);
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
          /* keep prior */
        }
      } else {
        console.warn(`TRACE_SW_CORRECTION_FAIL ${topic.slug} ${chat2.error}`);
      }
    }

    if (!parsed) {
      console.error(`TRACE_SW_NO_JSON ${topic.slug}`);
      process.exit(1);
    }

    let strict;
    try {
      strict = parseAndAssertCarouselJsonStrict(
        JSON.stringify(parsed),
      );
    } catch (e) {
      console.warn(
        `TRACE_SW_STRICT_SOFT ${topic.slug}`,
        e instanceof Error ? e.message : e,
      );
      strict = parsed;
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
        ? "none / PASS — viral craft density looks solid for handoff"
        : `Scriptwriter soft spots: ${swWeakParts.join(", ")}`;

    const swMd = buildScriptwriterMd({
      topic,
      model: modelUsed,
      system,
      user,
      reply1,
      correctionUser,
      reply2,
      finalJson: strict,
      checklist,
      weakNote: swWeak,
    });
    const swPath = path.join(DOCS_DIR, topic.scriptwriterMd);
    await writeFile(swPath, swMd, "utf8");
    console.log(`TRACE_SW_MD ${swPath}`);

    // Persist handoff JSON for wave folder
    await mkdir(path.join(WAVE_DIR, "handoff-json"), { recursive: true });
    await writeFile(
      path.join(WAVE_DIR, "handoff-json", `${topic.slug}.json`),
      JSON.stringify(strict, null, 2),
      "utf8",
    );

    let pngPaths: string[] = [];
    let deWeak = "skipped (--skip-draw)";
    let draftOk = false;
    let designerMdPath = "";

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

      console.log(`=== DESIGNER DRAW ${topic.slug} ===`);
      const kitAesthetic: LiveGenKitAesthetic = "cinematic_scene";
      const draw = await runCreateCarouselDraw(
        strict as Parameters<typeof runCreateCarouselDraw>[0],
        {
          jobId: `trace-${topic.id}-${Date.now()}`,
          model: DEFAULT_CAROUSEL_IMAGE_MODEL,
          copyToWaveArtifacts: false,
          kitAesthetic,
          defaultCtaLabel: CTA_LABEL[topic.cta],
        },
      );

      if (!draw.ok) {
        console.error(
          `TRACE_DRAW_FAIL ${topic.slug}`,
          draw.error?.code,
          draw.error?.message,
        );
        deWeak = `draw FAIL: ${draw.error?.code}`;
      } else {
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
        console.log(
          `TRACE_DRAW_OK ${topic.slug} png=${pngPaths.length} bgCalls=${bgCalls} mode=${draw.renderMode}`,
        );

        const promptBlocks = (draw.promptTrace ?? []).length
          ? (draw.promptTrace ?? [])
              .map((t) => {
                return [
                  `### slide_${String(t.slide).padStart(2, "0")}`,
                  "",
                  fence("text", t.exact_prompt),
                  "",
                  `_html_inputs:_ ${t.html_inputs_summary} · image_llm=\`${t.image_llm}\``,
                  "",
                ].join("\n");
              })
              .join("\n")
          : (draw.imagePrompts ?? [])
              .map((p, i) => {
                const body =
                  p?.trim() ||
                  "image_llm: skipped\n(no exact prompt captured)";
                return [
                  `### slide_${String(i + 1).padStart(2, "0")}`,
                  "",
                  fence("text", body),
                  "",
                ].join("\n");
              })
              .join("\n");

        const slides = (
          strict as {
            slides?: Array<{
              layout_variant?: string;
              primary_copy?: string;
              visual_prompt?: string;
            }>;
          }
        ).slides ?? [];
        const describePlan = slides
          .map((s, i) => {
            return `${i + 1}. ${s.layout_variant}: «${s.primary_copy ?? ""}» — visual: ${(s.visual_prompt ?? "").slice(0, 120)}…`;
          })
          .join("\n");

        const genericPrompt = (draw.imagePrompts ?? []).some(
          (p) =>
            p &&
            (/elegant club mood for slide/i.test(p) ||
              p.trim().length < 80),
        );
        deWeak =
          bgCalls < 1
            ? "Image weak-link: bgImageCalls=0 (HTML-only; visual_prompt may be text-kit)"
            : genericPrompt
              ? "Image prompt somewhat generic — check §3 vs Scriptwriter visual_prompt"
              : pngPaths.length === topic.n
                ? "none / PASS — exact prompts + PNG present"
                : `PNG incomplete ${pngPaths.length}/${topic.n}`;

        const deMd = buildDesignerMd({
          topic,
          handoffJson: strict,
          describePlan:
            `Получил handoff JSON (${slides.length} slides). План HTML/CSS-first + optional image-2 bg (kitAesthetic=cinematic_scene).\n` +
            describePlan,
          skillsTable,
          promptBlocks: promptBlocks || "_(no prompts)_",
          cssVars: draw.cssVarsApplied,
          pngPaths,
          imageModel: draw.model || DEFAULT_CAROUSEL_IMAGE_MODEL,
          bgCalls,
          renderMode: draw.renderMode,
          weakNote: deWeak,
        });
        designerMdPath = path.join(DOCS_DIR, topic.designerMd);
        await writeFile(designerMdPath, deMd, "utf8");
        console.log(`TRACE_DE_MD ${designerMdPath}`);

        const draft = await upsertDraft({
          id: topic.draftId,
          title: `Trace ${topic.id.toUpperCase()}: ${topic.topicLabel}`,
          imageUrls,
          payload: {
            wave: "2026-10-16-carousel-prompt-trace",
            ticket: "C-trace-designer-image",
            slug: topic.slug,
            handoff: strict,
            renderMode: draw.renderMode,
            bgImageCalls: bgCalls,
            imageModel: DEFAULT_CAROUSEL_IMAGE_MODEL,
            overwriteOf: topic.draftId,
          },
        });
        draftOk = draft.ok;
        console.log(
          `TRACE_DRAFT ${topic.slug} ok=${draft.ok} id=${draft.id || topic.draftId}`,
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
    });
  }

  // README index + weak-link verdict
  const primaryWeak = (() => {
    for (const s of sessionSummaries) {
      if (s.checklist.cover === "FAIL" || s.checklist.visual === "FAIL") {
        return "Scriptwriter flat / weak visual_prompt";
      }
    }
    for (const s of sessionSummaries) {
      if (s.deWeak.includes("bgImageCalls=0")) {
        return "weak image prompt / HTML-only skip";
      }
      if (s.deWeak.includes("generic")) {
        return "weak image prompt";
      }
      if (s.pngPaths.length < 3 && !skipDraw) {
        return "HTML overlay miss";
      }
    }
    return "none / PASS";
  })();

  const indexRows = sessionSummaries
    .map((s, i) => {
      const png =
        s.pngPaths.length > 0
          ? s.pngPaths
              .map((p) => "`" + p.replace(/\\/g, "/") + "`")
              .join("<br>")
          : "_(pending / skip-draw)_";
      const weak =
        s.checklist.cover !== "PASS" || s.checklist.visual !== "PASS"
          ? s.swWeak
          : s.deWeak;
      return `| ${i + 1} | [\`${s.scriptwriterMd}\`](./${s.scriptwriterMd}) + [\`${s.designerMd}\`](./${s.designerMd}) | ${s.slug} | ${png} | ${weak} |`;
    })
    .join("\n");

  const evidence = sessionSummaries
    .map(
      (s) =>
        `- **${s.slug}:** Scriptwriter checklist cover=${s.checklist.cover} visual=${s.checklist.visual} topic=${s.checklist.topic}. Designer: ${s.deWeak}. Draft overwrite \`${DRAFT_IDS[s.slug === "hy-letters" ? "a" : "b"]}\`=${s.draftOk ? "ok" : "no/skip"}.`,
    )
    .join("\n");

  const readme = [
    "# Карусель тест — prompt-trace (Client debug)",
    "",
    "Папка для **MD session logs** волны: найти слабое звено **Scriptwriter → Designer → Image**.",
    "",
    "Канон: `.cursor/skills/carousel-prompt-trace/SKILL.md`.  ",
    "Локи: `shell_freeze` · `upgrade_only` · `no_pipeline_break` · budget **6 PNG** (2×3).",
    "",
    "## Как пользоваться",
    "",
    "1. Скопируй шаблон из `_templates/` → новый файл `01-scriptwriter-<slug>.md` / `02-designer-<slug>.md` (эта волна: `01`/`02` Scriptwriter + `03`/`04` Designer).",
    "2. Заполни **все** секции (не сокращай system/user).",
    "3. Приложи пути к PNG в `generatedMedia/…`.",
    "4. Внизу README волны (ниже) — вердикт: где умерло качество.",
    "",
    "Секреты (`API_*`, токены) — **не** писать.",
    "",
    "## Индекс сессий (заполняет волна)",
    "",
    "| # | Файл | Тема | PNG | Weak link |",
    "|---|------|------|-----|-----------|",
    indexRows || "| 1 | _(pending)_ | | | |",
    "",
    "## Вердикт волны",
    "",
    `**Primary weak link:** ${primaryWeak}`,
    "",
    evidence,
    "",
    "Скрипт: `npx tsx scripts/trace-carousel-session.ts`.  ",
    "Draft ids (overwrite only): `draft-trace-a`, `draft-trace-b`.  ",
    "VIRAL CRAFT: injected into `CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY`.",
    "",
  ].join("\n");

  await writeFile(path.join(DOCS_DIR, "README.md"), readme, "utf8");

  await writeFile(
    path.join(ARTIFACT_ROOT, "_png_budget.json"),
    JSON.stringify(
      {
        ticket: "C-trace-designer-image",
        max: HARD_PNG_CAP,
        count: totalPng,
        drafts: runs.map((r) => r.draftId),
        slugs: sessionSummaries.map((s) => s.slug),
      },
      null,
      2,
    ),
    "utf8",
  );

  await writeFile(
    path.join(WAVE_DIR, "weak-link-verdict.md"),
    [
      "# Weak-link verdict — carousel-prompt-trace",
      "",
      `**Primary:** ${primaryWeak}`,
      "",
      evidence,
      "",
    ].join("\n"),
    "utf8",
  );

  console.log(`\nTRACE_DONE png=${totalPng}/${HARD_PNG_CAP} weak=${primaryWeak}`);
  if (!skipDraw && totalPng < HARD_PNG_CAP && ids.length === 2) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("TRACE_FATAL", e instanceof Error ? e.message : e);
  process.exit(1);
});
