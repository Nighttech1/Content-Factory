/**
 * Wave 2026-10-16 carousel-audit-fix — LIVE validation (Deployer)
 * Exactly 2 carousels × 3 slides = 6 PNGs. HTML/CSS-first (C-audit-03).
 *
 *   npx tsx scripts/live-gen-audit-fix.ts
 *
 * Locks: no social publish · shell_freeze · budget ≤6 PNG · stop if overspend.
 */

import { copyFile, mkdir, writeFile, access } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { resolve } from "node:path";

import type { DesignPresetFile } from "@/types/design";
import type { LiveGenKitAesthetic } from "@/lib/studio/carousel-html-renderer";
import { DEFAULT_SCRIPTWRITER_MODEL } from "@/types/mesh-agent";

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

const WAVE_DIR = path.join(
  process.cwd(),
  "memory",
  "waves",
  "2026-10-16-carousel-audit-fix",
);
const ARTIFACT_ROOT = path.join(
  process.cwd(),
  "generatedMedia",
  "wave-carousel-audit-fix",
);
const ARTIFACTS = path.join(ARTIFACT_ROOT, "deliverables");
const API_BASE = process.env.LIVE_GEN_API_BASE?.trim() || "http://localhost:3001";
const USER_ID = "user_seed_admin_c16";
const HARD_PNG_CAP = 6;

const CTA_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: "Пиши в комментариях",
  2: "Подпишись на Vernatun",
  3: "Встречи в TG",
  4: "Лайк + сохранить",
};

type CarouselHandoffJson = {
  contentType: "carousel";
  requested_slide_count: number;
  idea: string;
  hook: string;
  tone: string;
  cta_type: 1 | 2 | 3 | 4;
  slides: Array<{
    slide_number: number;
    layout_variant: string;
    primary_copy: string;
    secondary_copy?: string;
    swipe_trigger: string;
    visual_prompt: string;
    alt_text: string;
    cta_type?: 1 | 2 | 3 | 4;
  }>;
  caption: string;
  hashtags: string[];
  promptForDesigner: string;
};

/** dark_notes chalk kit — CTA 4 */
const FIXTURE_A: CarouselHandoffJson = {
  contentType: "carousel",
  requested_slide_count: 3,
  idea: "Утренний ритуал Vernatun: кофе как пауза, не продуктивность",
  hook: "Кофе врёт?",
  tone: "vernatun",
  cta_type: 4,
  slides: [
    {
      slide_number: 1,
      layout_variant: "cover",
      primary_copy: "Кофе врёт?",
      secondary_copy: "Не про «систему на 6 фигур»",
      swipe_trigger:
        "META: curiosity — зритель хочет узнать, что врёт кофе про продуктивность",
      visual_prompt:
        "dark_notes chalk grid charcoal wall, yellow marker underline, coffee cup outline doodle, soft steam, Vernatun warm amber only, no purple, no photoreal people",
      alt_text: "Меловая доска с вопросом про кофе",
    },
    {
      slide_number: 2,
      layout_variant: "body_slide",
      primary_copy: "Ритуал важнее *рецепта*",
      secondary_copy:
        "В Vernatun кофе — пауза, чтобы услышать друг друга.",
      swipe_trigger: "META: value beat — swipe for like+save CTA",
      visual_prompt:
        "dark_notes checklist boxes hand-drawn, yellow marker highlight, chalk texture, warm amber accent, text-kit only",
      alt_text: "Чеклист ритуала на меловой доске",
    },
    {
      slide_number: 3,
      layout_variant: "cta_slide",
      primary_copy: "Сохрани *ритуал*",
      secondary_copy: "Лайк + сохранить — пауза останется на неделе",
      swipe_trigger: "META: soft end after engagement CTA",
      visual_prompt:
        "dark_notes cta frame chalk gold-soft block, doodle arrow to save gesture, seamless steam leftover, no stock Inter",
      alt_text: "CTA сохранить ритуал",
      cta_type: 4,
    },
  ],
  caption: "Кофе не про продуктивность. Про паузу. Vernatun.",
  hashtags: ["#Vernatun", "#АрмянскийКлуб", "#Ритуал", "#Кофе"],
  promptForDesigner:
    "dark_notes HTML/CSS-first; CTA 4 like+save; no diffusion text",
};

/** bold / clean poster kit — CTA 1 */
const FIXTURE_B: CarouselHandoffJson = {
  contentType: "carousel",
  requested_slide_count: 3,
  idea: "Постер Vernatun: тишина стола громче ленты",
  hook: "Тишина громче поста?",
  tone: "vernatun",
  cta_type: 1,
  slides: [
    {
      slide_number: 1,
      layout_variant: "cover",
      primary_copy: "Тишина громче *поста*?",
      secondary_copy: "Лучшие фразы клуба не попали в рилс",
      swipe_trigger: "META: paradox hook — swipe for offline table value",
      visual_prompt:
        "bold_poster high-contrast solid charcoal blocks, large type field, warm cream accent bar, no purple gradient, text-kit only",
      alt_text: "Постер с парадоксом про тишину",
    },
    {
      slide_number: 2,
      layout_variant: "body_slide",
      primary_copy: "Стол без *камеры*",
      secondary_copy:
        "Они остались за столом — смех, споры, армянский круг.",
      swipe_trigger: "META: after value, swipe for comments CTA",
      visual_prompt:
        "bold_poster solid color fields, short type blocks, subtle pomegranate mark, continuous accent bar, no photo collage",
      alt_text: "Постер про стол без камеры",
    },
    {
      slide_number: 3,
      layout_variant: "cta_slide",
      primary_copy: "А у *тебя*?",
      secondary_copy: "Напиши в комментариях: где тишина громче ленты?",
      swipe_trigger: "META: soft end after comment CTA",
      visual_prompt:
        "bold_poster solid CTA block high contrast, large question type, Vernatun mark corner, no purple pill",
      alt_text: "CTA вопрос в комментарии",
      cta_type: 1,
    },
  ],
  caption:
    "Тишина громче поста. А у тебя? Пиши в комментариях. Vernatun.",
  hashtags: ["#Vernatun", "#Клуб", "#Тишина", "#Комментарии"],
  promptForDesigner:
    "bold_poster HTML/CSS-first; CTA 1 comments; no diffusion text",
};

function presetDarkNotes(): DesignPresetFile {
  return {
    id: "audit-fix-dark-notes",
    preset: "dark_notes",
    name: "AUDIT-FIX Dark Notes",
    designMd: "AUDIT-FIX temporary — chalk/marker HTML kit.",
    colors: {
      bg: "#1A1814",
      surface: "#242018",
      text: "#F5F0E6",
      muted: "#A89B84",
      accent: "#F5D547",
      accentSoft: "#FFE88A",
    },
    typography: {
      display: '"Manrope", system-ui, sans-serif',
      body: "Manrope, system-ui, sans-serif",
      armenianSafe: '"Noto Sans Armenian", Manrope, sans-serif',
    },
    components: {
      buttonCta: { glow: false, radius: "12px", labelWeight: 700 },
      card: { glass: false },
      seamlessConnector: { enabled: true },
      gauge: { glow: false },
      doodle: { enabled: true },
    },
    version: 1,
  };
}

function presetCleanPoster(): DesignPresetFile {
  return {
    id: "audit-fix-clean-poster",
    preset: "bold_poster",
    name: "AUDIT-FIX Clean Poster",
    designMd: "AUDIT-FIX temporary — bold orange/white poster HTML kit.",
    colors: {
      bg: "#FFFFFF",
      surface: "#FFF7F0",
      text: "#121212",
      muted: "#5C534C",
      accent: "#FF5A1F",
      accentSoft: "#FFB087",
    },
    typography: {
      display: '"Manrope", system-ui, sans-serif',
      body: "Manrope, system-ui, sans-serif",
      armenianSafe: '"Noto Sans Armenian", Manrope, sans-serif',
    },
    components: {
      buttonCta: { glow: false, radius: "999px", labelWeight: 700 },
      card: { glass: false },
      seamlessConnector: { enabled: false },
      gauge: { glow: false },
      doodle: { enabled: false },
    },
    version: 1,
  };
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function localPathFromPublicUrl(imageUrl: string): string | null {
  const m =
    imageUrl.match(/\/generated\/(.+)$/) ||
    imageUrl.match(/\/generatedMedia\/(.+)$/);
  if (!m?.[1]) return null;
  const root = imageUrl.includes("/generatedMedia/")
    ? "generatedMedia"
    : "generated";
  return path.join(
    process.cwd(),
    "public",
    root,
    m[1].replace(/\//g, path.sep),
  );
}

async function upsertDraft(input: {
  title: string;
  imageUrls: string[];
  payload: unknown;
}): Promise<{ id: string; ok: boolean; raw: unknown }> {
  const slides = input.imageUrls.map((imageUrl, i) => ({
    id: `audit-fix-${i + 1}`,
    imageUrl,
    index: i,
  }));
  const res = await fetch(`${API_BASE}/api/studio/drafts`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-cf-user-id": USER_ID,
    },
    body: JSON.stringify({
      title: input.title,
      slides,
      status: "unpublished",
      moduleId: "carousel-engine",
      payload: input.payload,
    }),
  });
  const raw = await res.json().catch(() => ({}));
  const id =
    typeof (raw as { draft?: { id?: string } })?.draft?.id === "string"
      ? (raw as { draft: { id: string } }).draft.id
      : "";
  return { id, ok: res.ok && Boolean(id), raw };
}

async function tryLiveScriptwriterSonnet(): Promise<{
  json: CarouselHandoffJson | null;
  source: "live_sonnet" | "live_fallback" | "fixture_fallback";
  error?: string;
}> {
  const { resolveAggregatorEnv } = await import("../lib/llm/aggregator");
  const { callAggregatorChat } = await import("../lib/llm/aggregator-chat");
  const { parseCarouselJsonFromText } = await import(
    "../lib/studio/carousel-json-contract"
  );

  if (!resolveAggregatorEnv()) {
    return {
      json: null,
      source: "fixture_fallback",
      error: "aggregator_key_missing",
    };
  }

  const system = [
    "You are Vernatun Content Factory Scriptwriter.",
    "Return ONLY one JSON object (optionally fenced ```json).",
    "Schema keys: contentType=carousel, requested_slide_count=3, idea, hook, tone=vernatun,",
    "cta_type (1|2|3|4), slides[3] with slide_number, layout_variant (cover|body_slide|cta_slide),",
    "primary_copy, secondary_copy, swipe_trigger (META only, never on-slide copy),",
    "visual_prompt (dark_notes chalk/marker text-kit, NO photoreal people), alt_text,",
    "caption, hashtags[], promptForDesigner.",
    "CTA catalog: 1=comments, 2=subscribe, 3=TG meets, 4=like+save. Use cta_type=4.",
    "Hook curiosity ≤8 words. Vernatun Armenian club coffee ritual topic.",
    "visual_prompt must stay HTML-kit friendly (chalk/doodle) — no cinema photo briefs.",
  ].join(" ");

  const user =
    "Сделай карусель 3 слайда Vernatun: утренний кофе-ритуал как пауза (не продуктивность). CTA 4.";

  // C-audit-06: Sonnet → sonnet-4 → haiku; document path — never silent wrong model
  const chat = await callAggregatorChat({
    system,
    user,
    model: DEFAULT_SCRIPTWRITER_MODEL,
    temperature: 0.5,
    maxTokens: 2500,
    thinking: true,
    reasoningEffort: "high",
    fallbackModels: true,
  });

  if (!chat.ok) {
    console.warn(
      `AUDIT_FIX_LIVE_FAIL err=${chat.error} tried=${(chat.triedModels ?? []).join("→")}`,
    );
    return {
      json: null,
      source: "fixture_fallback",
      error: `${chat.error}${chat.triedModels?.length ? ` [${chat.triedModels.join("→")}]` : ""}`,
    };
  }

  if (chat.fallbackFrom) {
    console.warn(
      `AUDIT_FIX_LIVE_DEGRADE primary=${chat.fallbackFrom} → used=${chat.model} tried=${(chat.triedModels ?? []).join("→")}`,
    );
  }

  try {
    const parsed = parseCarouselJsonFromText(chat.text);
    if (parsed.slides.length !== 3) {
      return {
        json: null,
        source: "fixture_fallback",
        error: `slide_count_${parsed.slides.length}`,
      };
    }
    return {
      json: parsed as unknown as CarouselHandoffJson,
      source: chat.fallbackFrom ? "live_fallback" : "live_sonnet",
    };
  } catch (e) {
    return {
      json: null,
      source: "fixture_fallback",
      error: e instanceof Error ? e.message : "parse_fail",
    };
  }
}

async function main() {
  // Isolate wave PNG budget (do not touch wave-visual-deconstructor / smoke-budget)
  process.env.WAVE_VISUAL_ARTIFACT_DIR = ARTIFACT_ROOT;
  process.env.CAROUSEL_HTML_FIRST = "1";
  // Text kits → no image burn; belt+suspenders for 6-PNG hard cap
  process.env.CAROUSEL_DRAW_SKIP_BG = "1";
  process.env.WAVE_VISUAL_COPY_ARTIFACTS = "0";

  const { resolveAggregatorEnv } = await import("../lib/llm/aggregator");
  const { critiqueCarouselHandoff } = await import(
    "../lib/studio/carousel-quality-critic"
  );
  const { runCreateCarouselDraw } = await import(
    "../lib/studio/carousel-html-renderer"
  );
  const { parseAndAssertCarouselJsonStrict } = await import(
    "../lib/studio/carousel-json-contract"
  );

  const hasKey = Boolean(resolveAggregatorEnv());
  console.log(`AUDIT_FIX_KEY=${hasKey ? "present" : "MISSING"}`);
  console.log(`AUDIT_FIX_API=${API_BASE}`);
  console.log(`AUDIT_FIX_BUDGET_DIR=${process.env.WAVE_VISUAL_ARTIFACT_DIR}`);
  console.log(`AUDIT_FIX_HTML_FIRST=${process.env.CAROUSEL_HTML_FIRST}`);
  console.log(`AUDIT_FIX_SKIP_BG=${process.env.CAROUSEL_DRAW_SKIP_BG}`);
  console.log(`AUDIT_FIX_SCRIPTWRITER=${DEFAULT_SCRIPTWRITER_MODEL}`);

  await mkdir(ARTIFACTS, { recursive: true });
  await mkdir(path.join(ARTIFACTS, "a"), { recursive: true });
  await mkdir(path.join(ARTIFACTS, "b"), { recursive: true });
  await mkdir(path.join(WAVE_DIR, "handoff-json"), { recursive: true });

  // Prefer at least one LIVE Scriptwriter JSON (Sonnet) for carousel A
  const liveA = await tryLiveScriptwriterSonnet();
  console.log(
    `AUDIT_FIX_LIVE_A source=${liveA.source}${liveA.error ? ` err=${liveA.error}` : ""}`,
  );

  const carousels: Array<{
    id: "a" | "b";
    title: string;
    kitAesthetic: LiveGenKitAesthetic | undefined;
    preset: DesignPresetFile;
    ctaLabel: string;
    json: CarouselHandoffJson;
    jsonSource: string;
  }> = [
    {
      id: "a",
      title: "AUDIT-FIX A: Coffee ritual (dark notes)",
      kitAesthetic: undefined, // use dark_notes preset chrome
      preset: presetDarkNotes(),
      ctaLabel: CTA_LABEL[4],
      json: liveA.json ?? FIXTURE_A,
      jsonSource: liveA.json ? liveA.source : "fixture_A",
    },
    {
      id: "b",
      title: "AUDIT-FIX B: Silence louder (clean poster)",
      kitAesthetic: "clean_poster",
      preset: presetCleanPoster(),
      ctaLabel: CTA_LABEL[1],
      json: FIXTURE_B,
      jsonSource: "fixture_B",
    },
  ];

  // Force CTA labels on fixtures if live omitted
  if (!liveA.json) {
    carousels[0]!.json = FIXTURE_A;
  } else {
    // Ensure requested_slide_count matches and cta is catalog
    carousels[0]!.json.requested_slide_count = 3;
    if (![1, 2, 3, 4].includes(carousels[0]!.json.cta_type)) {
      carousels[0]!.json.cta_type = 4;
    }
  }

  const results: Array<{
    id: string;
    title: string;
    draftId: string;
    draftOk: boolean;
    imageUrls: string[];
    pngPaths: string[];
    pngOk: number;
    drawOk: boolean;
    renderMode?: string;
    htmlFirst?: boolean;
    bgImageCalls?: number;
    jsonSource: string;
    error?: string;
  }> = [];

  let totalPng = 0;

  for (const c of carousels) {
    console.log(`\n=== ${c.id.toUpperCase()} ${c.title} ===`);
    await writeFile(
      path.join(WAVE_DIR, "handoff-json", `AUDIT-${c.id.toUpperCase()}.json`),
      JSON.stringify(c.json, null, 2),
      "utf8",
    );

    let json;
    try {
      json = parseAndAssertCarouselJsonStrict(JSON.stringify(c.json));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "parse_fail";
      console.error(`STRICT_FAIL ${c.id}`, msg);
      results.push({
        id: c.id,
        title: c.title,
        draftId: "",
        draftOk: false,
        imageUrls: [],
        pngPaths: [],
        pngOk: 0,
        drawOk: false,
        jsonSource: c.jsonSource,
        error: msg,
      });
      continue;
    }

    const critic = critiqueCarouselHandoff(json);
    if (!critic.ok) {
      console.error(`CRITIC_FAIL ${c.id}`, critic.message);
      // For live JSON that fails critic, fall back to fixture once for A
      if (
        c.id === "a" &&
        (c.jsonSource === "live_sonnet" || c.jsonSource === "live_fallback")
      ) {
        console.log("FALLBACK_TO_FIXTURE_A after critic fail");
        c.json = FIXTURE_A;
        c.jsonSource = "fixture_A_after_critic";
        try {
          json = parseAndAssertCarouselJsonStrict(JSON.stringify(c.json));
        } catch (e2) {
          const msg = e2 instanceof Error ? e2.message : "parse_fail";
          results.push({
            id: c.id,
            title: c.title,
            draftId: "",
            draftOk: false,
            imageUrls: [],
            pngPaths: [],
            pngOk: 0,
            drawOk: false,
            jsonSource: c.jsonSource,
            error: msg,
          });
          continue;
        }
      } else {
        results.push({
          id: c.id,
          title: c.title,
          draftId: "",
          draftOk: false,
          imageUrls: [],
          pngPaths: [],
          pngOk: 0,
          drawOk: false,
          jsonSource: c.jsonSource,
          error: critic.message,
        });
        continue;
      }
    }

    if (totalPng + json.slides.length > HARD_PNG_CAP) {
      console.error(
        `BUDGET_STOP would exceed ${HARD_PNG_CAP} (have ${totalPng})`,
      );
      results.push({
        id: c.id,
        title: c.title,
        draftId: "",
        draftOk: false,
        imageUrls: [],
        pngPaths: [],
        pngOk: 0,
        drawOk: false,
        jsonSource: c.jsonSource,
        error: "budget_would_exceed_6",
      });
      break;
    }

    const draw = await runCreateCarouselDraw(json, {
      jobId: `audit-fix-${c.id}-${Date.now()}`,
      copyToWaveArtifacts: false,
      presetFile: c.preset,
      kitAesthetic: c.kitAesthetic,
      defaultCtaLabel: c.ctaLabel,
    });

    if (!draw.ok) {
      console.error(
        `DRAW_FAIL ${c.id}`,
        draw.error?.code,
        draw.error?.message,
      );
      results.push({
        id: c.id,
        title: c.title,
        draftId: "",
        draftOk: false,
        imageUrls: [],
        pngPaths: [],
        pngOk: 0,
        drawOk: false,
        jsonSource: c.jsonSource,
        error: `${draw.error?.code}: ${draw.error?.message}`,
      });
      continue;
    }

    const imageUrls = draw.slides.map((s) => s.imageUrl).filter(Boolean);
    const pngPaths: string[] = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i]!;
      const local = localPathFromPublicUrl(url);
      const dest = path.join(
        ARTIFACTS,
        c.id,
        `slide_${String(i + 1).padStart(2, "0")}.png`,
      );
      if (local && (await fileExists(local))) {
        await copyFile(local, dest);
        pngPaths.push(dest);
      } else if (url.startsWith("http")) {
        try {
          const imgRes = await fetch(url);
          if (imgRes.ok) {
            const buf = Buffer.from(await imgRes.arrayBuffer());
            await writeFile(dest, buf);
            pngPaths.push(dest);
          }
        } catch {
          /* skip */
        }
      }
    }

    totalPng += pngPaths.length;
    console.log(
      `DRAW_OK ${c.id} slides=${imageUrls.length} png=${pngPaths.length} mode=${draw.renderMode} htmlFirst=${draw.htmlFirst} bgCalls=${draw.bgImageCalls}`,
    );

    if (totalPng > HARD_PNG_CAP) {
      console.error(`BUDGET_OVERSPEND totalPng=${totalPng} > ${HARD_PNG_CAP}`);
      process.exit(3);
    }

    const draft = await upsertDraft({
      title: c.title,
      imageUrls,
      payload: {
        wave: "2026-10-16-carousel-audit-fix",
        audit: c.id,
        aesthetic: c.kitAesthetic ?? c.preset.preset,
        handoff: c.json,
        renderMode: draw.renderMode,
        htmlFirst: draw.htmlFirst,
        bgImageCalls: draw.bgImageCalls,
        jsonSource: c.jsonSource,
      },
    });
    console.log(`DRAFT ${c.id} ok=${draft.ok} id=${draft.id}`);

    results.push({
      id: c.id,
      title: c.title,
      draftId: draft.id,
      draftOk: draft.ok,
      imageUrls,
      pngPaths,
      pngOk: pngPaths.length,
      drawOk: true,
      renderMode: draw.renderMode,
      htmlFirst: draw.htmlFirst,
      bgImageCalls: draw.bgImageCalls,
      jsonSource: c.jsonSource,
      error: draft.ok ? undefined : "draft_upsert_failed",
    });
  }

  const allSix =
    results.reduce((n, r) => n + r.pngOk, 0) === HARD_PNG_CAP &&
    results.length === 2 &&
    results.every((r) => r.drawOk && r.draftOk && r.pngOk === 3 && r.draftId);

  const lines: string[] = [
    "# Deployer — 2026-10-16 carousel-audit-fix",
    "",
    `**Date:** ${new Date().toISOString()}`,
    `**Role:** Деплоер`,
    `**Localhost:** ${API_BASE}`,
    `**Studio:** ${API_BASE}/studio`,
    `**Actor:** \`${USER_ID}\``,
    `**PNG deliverable:** **${results.reduce((n, r) => n + r.pngOk, 0)} / 6**`,
    `**All 6 images exist:** **${allSix ? "YES" : "NO"}**`,
    `**HTML-first:** CAROUSEL_HTML_FIRST=1 · CAROUSEL_DRAW_SKIP_BG=1`,
    `**Budget dir:** \`${ARTIFACT_ROOT.replace(/\\/g, "/")}\``,
    `**Live Scriptwriter A:** ${results[0]?.jsonSource ?? "n/a"} (model ${DEFAULT_SCRIPTWRITER_MODEL})`,
    "",
    "## Drafts (Черновики)",
    "",
    "| ID | Title | Draft ID | PNG | Source |",
    "|----|-------|----------|-----|--------|",
  ];

  for (const r of results) {
    lines.push(
      `| ${r.id.toUpperCase()} | ${r.title} | \`${r.draftId}\` | ${r.pngOk}/3 | ${r.jsonSource} |`,
    );
  }

  lines.push("", "## PNG paths (6)", "");
  for (const r of results) {
    lines.push(`### ${r.title}`);
    if (r.pngPaths.length === 0) {
      lines.push(`- (none) ${r.error ?? ""}`);
    } else {
      for (const p of r.pngPaths) {
        lines.push(`- \`${p.replace(/\\/g, "/")}\``);
      }
    }
    lines.push("");
  }

  lines.push("## Preview URLs", "");
  for (const r of results) {
    lines.push(`### ${r.id.toUpperCase()}`);
    for (const u of r.imageUrls) {
      lines.push(`- \`${u}\``);
    }
    lines.push("");
  }

  lines.push(
    "## Locks",
    "",
    "- no social publish",
    "- shell_freeze",
    "- budget hard cap **6** PNG",
    "- script: `scripts/live-gen-audit-fix.ts`",
    "- core: `runCreateCarouselDraw` HTML-first (C-audit-03)",
    "",
    `**Exit:** ${allSix ? "PASS" : "FAIL"}`,
  );

  const deployerPath = path.join(WAVE_DIR, "deployer.md");
  await writeFile(deployerPath, lines.join("\n"), "utf8");
  console.log("\nDEPLOYER report", deployerPath);
  console.log(
    JSON.stringify(
      {
        allSix,
        localhost: API_BASE,
        drafts: results.map((r) => ({
          title: r.title,
          id: r.draftId,
          pngOk: r.pngOk,
          jsonSource: r.jsonSource,
          pngPaths: r.pngPaths.map((p) => p.replace(/\\/g, "/")),
        })),
      },
      null,
      2,
    ),
  );

  process.exit(allSix ? 0 : 2);
}

main().catch((e) => {
  console.error("AUDIT_FIX_FATAL", e instanceof Error ? e.message : e);
  process.exit(1);
});
