/**
 * LIVE-GEN round 2 — C-live-gen-03 overwrite
 * Same 3 draft ids · 3×3=9 PNGs · distinct aesthetics · no bento telemetry.
 *
 *   npx tsx scripts/live-gen-round2.ts
 */

import { copyFile, mkdir, writeFile, access } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { resolve } from "node:path";

import type { DesignPresetFile } from "@/types/design";
import type { LiveGenKitAesthetic } from "@/lib/studio/carousel-html-renderer";

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

const WAVE = "memory/waves/W-2026-10-15-sprint9-live-gen";
const ARTIFACTS = path.join(WAVE, "artifacts", "round-2");
const API_BASE = process.env.LIVE_GEN_API_BASE?.trim() || "http://localhost:3001";
const USER_ID = "user_seed_admin_c16";

/** HARD: overwrite these exact draft ids — never create a 4th carousel. */
const DRAFT_IDS = {
  a: "draft_e88877aa-5f9b-4220-93a1-172b1234e29b",
  b: "draft_34745e24-78f9-4acc-8ea2-6756c1740869",
  c: "draft_1f8855e0-641e-4d7e-81e4-48dada276280",
} as const;

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

const CTA_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: "Пиши в комментариях",
  2: "Подпишись на Vernatun",
  3: "Встречи в TG",
  4: "Лайк + сохранить",
};

/** Temporary color/kit overrides for this script only (shell_freeze). */
function presetCleanPoster(): DesignPresetFile {
  return {
    id: "live-gen-r2-clean-poster",
    preset: "bold_poster",
    name: "LIVE-GEN R2 Clean Poster",
    designMd: "LIVE-GEN temporary — clean orange/white poster. No telemetry.",
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

function presetCinematic(): DesignPresetFile {
  return {
    id: "live-gen-r2-cinematic",
    preset: "bold_poster",
    name: "LIVE-GEN R2 Cinematic",
    designMd: "LIVE-GEN temporary — cinematic scene overlays. No coffee plate.",
    colors: {
      bg: "#0A0A0C",
      surface: "#141418",
      text: "#FFF8F0",
      muted: "#C4B8A8",
      accent: "#FF6A2A",
      accentSoft: "#FFB070",
    },
    typography: {
      display: '"Manrope", system-ui, sans-serif',
      body: "Manrope, system-ui, sans-serif",
      armenianSafe: '"Noto Sans Armenian", Manrope, sans-serif',
    },
    components: {
      buttonCta: { glow: true, radius: "999px", labelWeight: 700 },
      card: { glass: false },
      seamlessConnector: { enabled: false },
      gauge: { glow: false },
      doodle: { enabled: false },
    },
    version: 1,
  };
}

function presetTipCards(): DesignPresetFile {
  return {
    id: "live-gen-r2-tip-cards",
    preset: "bold_poster",
    name: "LIVE-GEN R2 Tip Cards",
    designMd: "LIVE-GEN temporary — black/yellow tip pack. No marble clocks.",
    colors: {
      bg: "#000000",
      surface: "#111111",
      text: "#FFFFFF",
      muted: "#B8B8B8",
      accent: "#FFE600",
      accentSoft: "#FFF59A",
    },
    typography: {
      display: '"Manrope", system-ui, sans-serif',
      body: "Manrope, system-ui, sans-serif",
      armenianSafe: '"Noto Sans Armenian", Manrope, sans-serif',
    },
    components: {
      buttonCta: { glow: false, radius: "14px", labelWeight: 700 },
      card: { glass: false },
      seamlessConnector: { enabled: false },
      gauge: { glow: false },
      doodle: { enabled: false },
    },
    version: 1,
  };
}

const LG_A: CarouselHandoffJson = {
  contentType: "carousel",
  requested_slide_count: 3,
  idea: "Утренний кофе-ритуал Vernatun — постерная ясность",
  hook: "Кофе пахнет *домом*?",
  tone: "vernatun",
  cta_type: 4,
  slides: [
    {
      slide_number: 1,
      layout_variant: "cover",
      primary_copy: "Кофе пахнет *домом*?",
      secondary_copy: "Утро Vernatun — полная чашка, не иконка",
      swipe_trigger:
        "META: curiosity gap — swipe to see the ritual value beat",
      visual_prompt:
        "FULL-BLEED photoreal hero photograph ONLY — ceramic Vernatun coffee cup with rich crema filling most of the 4:5 frame, steam rising, soft daylight, orange-white color grade. Premium real-estate marketing poster craft: one hero object huge in frame, generous crop, luxury product photography. ABSOLUTELY FORBIDDEN: line-art coffee icon, espresso plate UI, glass bento cards, clocks, timers, HOOK chips, telemetry gauges, marble texture collage, tiny icon in a tile. No readable text in image. No purple.",
      alt_text: "Крупное hero-фото чашки кофе Vernatun",
    },
    {
      slide_number: 2,
      layout_variant: "body_slide",
      primary_copy: "Ритуал, не *спешка*",
      secondary_copy: "Один стол. Один разговор. Корни в аромате.",
      swipe_trigger: "META: after value, swipe for like+save CTA",
      visual_prompt:
        "Clean orange-white poster mid-slide FULL-BLEED photo: warm cafe table edge with steaming cup filling left half, pure white negative space right for HTML type. Soft daylight, high-key, airy. FORBIDDEN: line icons, espresso plate, ritual clocks, to-go rush timers, glass telemetry, marble+gauges. Photoreal only. No text in image.",
      alt_text: "Постерный mid: стол и пар — без UI-шума",
    },
    {
      slide_number: 3,
      layout_variant: "cta_slide",
      primary_copy: "Сохрани утро *Vernatun*",
      secondary_copy: "Лайк + сохранить — ритуал рядом",
      swipe_trigger: "META: soft end after engagement CTA",
      visual_prompt:
        "Clean orange-white CTA poster background: bold safety-orange lower third meeting bright white upper field, empty ceramic cup from above as soft hero photo (not icon), lots of air for HTML marketing button. FORBIDDEN: espresso plate chrome, clocks, gauges, line-art cup. No baked text. No purple.",
      alt_text: "CTA-постер: сохранить кофе-ритуал",
      cta_type: 4,
    },
  ],
  caption:
    "Утро Vernatun — чашка, стол, разговор. Сохрани ритуал ☕",
  hashtags: ["#Vernatun", "#АрмянскийКлуб", "#КофеРитуал", "#Сообщество"],
  promptForDesigner:
    "REF-A clean_poster: full-bleed hero photo, accent word, CTA every slide, ZERO espresso-plate / clocks.",
};

const LG_B: CarouselHandoffJson = {
  contentType: "carousel",
  requested_slide_count: 3,
  idea: "Сила сообщества Vernatun — кинематограф",
  hook: "Один голос — *слабо*",
  tone: "vernatun",
  cta_type: 3,
  slides: [
    {
      slide_number: 1,
      layout_variant: "cover",
      primary_copy: "Один голос — *слабо*",
      secondary_copy: "Вместе — клуб, который слышно",
      swipe_trigger: "META: drama hook — swipe for community proof",
      visual_prompt:
        "CINEMATIC full-bleed 4:5 scene: group of real people seated at a long dark club table, faces partially lit by dramatic warm orange rim light, shallow depth of field, steam and atmosphere like a sports-poster still — NOT a gym brand. Strong human presence IN the frame. FORBIDDEN: coffee line-icon plate, espresso UI tile, ritual clocks, to-go rush, paper sprint gauges, HOOK chips, glass bento metrics. No logos. No readable text baked in. No purple.",
      alt_text: "Кино: люди за столом Vernatun",
    },
    {
      slide_number: 2,
      layout_variant: "body_slide",
      primary_copy: "Здесь звучит *армянский*",
      secondary_copy: "Смех, споры, поддержка — живой круг",
      swipe_trigger: "META: after vibe, swipe for TG meets CTA",
      visual_prompt:
        "CINEMATIC mid-scene: close dramatic shot of people talking and laughing over shared bread and coffee — hands and faces in warm orange practical light, dark club interior, energy of togetherness. Metaphor of circle/community strong. FORBIDDEN: coffee icon plate, ritual clock tiles, to-go rush timers, telemetry charts, marble clutter. Photoreal people-in-scene only. No text in image.",
      alt_text: "Кино mid: живой круг Vernatun",
    },
    {
      slide_number: 3,
      layout_variant: "cta_slide",
      primary_copy: "Приходи в *круг*",
      secondary_copy: "Живые встречи — ссылка в TG в шапке",
      swipe_trigger: "META: soft end after community CTA",
      visual_prompt:
        "CINEMATIC CTA still: near-black corridor with glowing orange doorway into a warm room where silhouettes of people gather — invitation metaphor, drama light. Large empty upper third for HTML headline. FORBIDDEN: espresso plate, clocks, gauges, line icons. No gym logo. No baked text. No purple.",
      alt_text: "CTA кино: приглашение в круг",
      cta_type: 3,
    },
  ],
  caption:
    "В Vernatun сила — в круге. Ждём на живых встречах в TG 🧡",
  hashtags: ["#Vernatun", "#Сообщество", "#АрмянскийКруг", "#ЖивыеВстречи"],
  promptForDesigner:
    "REF-B cinematic_scene: people/metaphor IN frame, drama orange light, ZERO coffee-plate telemetry.",
};

const LG_C: CarouselHandoffJson = {
  contentType: "carousel",
  requested_slide_count: 3,
  idea: "Наследие Vernatun — tip-карточки 1 / 2 / CTA",
  hook: "Корни громче трендов",
  tone: "vernatun",
  cta_type: 1,
  slides: [
    {
      slide_number: 1,
      layout_variant: "cover",
      primary_copy: "Говори дома *чаще*",
      secondary_copy:
        "Один армянский разговор в день важнее идеального акцента.",
      swipe_trigger: "META: tip1 value — swipe for tip2",
      visual_prompt:
        "BLACK pure background tip-card 4:5 with bright yellow accent glow only — minimal, high contrast motivation tip pack. Soft empty space for huge yellow number and tip text via HTML. Tiny warm silhouette hint optional at bottom edge. FORBIDDEN: espresso plate, coffee line icon, marble texture, ritual clocks, timers, glass telemetry, HOOK chips. No readable baked text. No purple.",
      alt_text: "Tip 1 Vernatun — говори дома чаще",
    },
    {
      slide_number: 2,
      layout_variant: "body_slide",
      primary_copy: "Стол без *телефонов*",
      secondary_copy:
        "Один ужин лицом к лицу возвращает больше, чем лента за час.",
      swipe_trigger: "META: tip2 value — swipe for comment CTA",
      visual_prompt:
        "BLACK tip-card mid frame 4:5, bright yellow geometric corner accent only, clean motivation tip aesthetic. Space for yellow tip number 2 + body via HTML. FORBIDDEN: marble+timers, espresso plate, coffee icons, ritual clocks, to-go rush, glass gauges. Flat graphic black field. No baked text. No purple.",
      alt_text: "Tip 2 Vernatun — стол без телефонов",
    },
    {
      slide_number: 3,
      layout_variant: "cta_slide",
      primary_copy: "Какой tip *твой*?",
      secondary_copy: "Напиши в комментариях — какой совет заберёшь",
      swipe_trigger: "META: soft end after comment CTA",
      visual_prompt:
        "BLACK tip-pack finale 4:5 with bold yellow underline zone empty for HTML question + large yellow CTA button space. Soft dusk silhouette of two people talking optional, minimal. FORBIDDEN: espresso plate, marble clocks, telemetry, line-art coffee. No engagement icons baked in. No purple.",
      alt_text: "CTA tip: пиши в комментариях",
      cta_type: 1,
    },
  ],
  caption:
    "Корни громче трендов. Какой tip заберёшь? Пиши в комментариях 🖤💛",
  hashtags: ["#Vernatun", "#Наследие", "#АрмянскиеКорни", "#TipКарточки"],
  promptForDesigner:
    "REF-C tip_cards: yellow tip 1/2 + CTA comments, black field, ZERO marble/timers/espresso.",
};

const ALL_CAROUSELS: Array<{
  id: "a" | "b" | "c";
  lg: string;
  title: string;
  draftId: string;
  kitAesthetic: LiveGenKitAesthetic;
  preset: DesignPresetFile;
  ctaLabel: string;
  json: CarouselHandoffJson;
}> = [
  {
    id: "a",
    lg: "LG-A",
    title: "LIVE-GEN R2: LG-A Coffee ritual",
    draftId: DRAFT_IDS.a,
    kitAesthetic: "clean_poster",
    preset: presetCleanPoster(),
    ctaLabel: CTA_LABEL[4],
    json: LG_A,
  },
  {
    id: "b",
    lg: "LG-B",
    title: "LIVE-GEN R2: LG-B Community energy",
    draftId: DRAFT_IDS.b,
    kitAesthetic: "cinematic_scene",
    preset: presetCinematic(),
    ctaLabel: CTA_LABEL[3],
    json: LG_B,
  },
  {
    id: "c",
    lg: "LG-C",
    title: "LIVE-GEN R2: LG-C Heritage tips",
    draftId: DRAFT_IDS.c,
    kitAesthetic: "tip_cards",
    preset: presetTipCards(),
    ctaLabel: CTA_LABEL[1],
    json: LG_C,
  },
];

function selectedCarousels() {
  const arg = process.argv.find((a) => a.startsWith("--only="));
  if (!arg) return ALL_CAROUSELS;
  const set = new Set(
    arg
      .slice("--only=".length)
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  return ALL_CAROUSELS.filter((c) => set.has(c.id));
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
  id: string;
  title: string;
  imageUrls: string[];
  payload: unknown;
}): Promise<{ id: string; ok: boolean; raw: unknown }> {
  const slides = input.imageUrls.map((imageUrl, i) => ({
    id: `live-gen-r2-${i + 1}`,
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
      id: input.id,
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
  return { id, ok: res.ok && id === input.id, raw };
}

async function main() {
  if (!process.env.WAVE_VISUAL_ARTIFACT_DIR?.trim()) {
    process.env.WAVE_VISUAL_ARTIFACT_DIR = path.join(
      process.cwd(),
      "generatedMedia",
      "wave-live-gen",
    );
  }

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

  const CAROUSELS = selectedCarousels();
  const hasKey = Boolean(resolveAggregatorEnv());
  console.log(`LIVE_GEN_R2_KEY=${hasKey ? "present" : "MISSING"}`);
  console.log(`LIVE_GEN_R2_API=${API_BASE}`);
  console.log(
    `LIVE_GEN_R2_BUDGET_DIR=${process.env.WAVE_VISUAL_ARTIFACT_DIR}`,
  );
  console.log(`LIVE_GEN_R2_ONLY=${CAROUSELS.map((c) => c.id).join(",")}`);
  console.log(
    `LIVE_GEN_R2_OVERWRITE=${CAROUSELS.map((c) => c.draftId).join(",")}`,
  );

  if (!hasKey) {
    await mkdir(WAVE, { recursive: true });
    await writeFile(
      path.join(WAVE, "round-2-report.md"),
      [
        "# Round-2 report — LIVE-GEN FAIL",
        "",
        "**Status:** FAILED — aggregator key missing",
        "",
        "No PNG burnt. Drafts not overwritten.",
      ].join("\n"),
      "utf8",
    );
    console.error("LIVE_GEN_R2_FAIL missing_key");
    process.exit(1);
  }

  await mkdir(ARTIFACTS, { recursive: true });
  for (const c of CAROUSELS) {
    await mkdir(path.join(ARTIFACTS, c.id), { recursive: true });
  }

  const jsonDir = path.join(WAVE, "handoff-json");
  await mkdir(jsonDir, { recursive: true });

  const results: Array<{
    id: string;
    lg: string;
    title: string;
    draftId: string;
    overwriteOk: boolean;
    imageUrls: string[];
    pngPaths: string[];
    pngOk: number;
    drawOk: boolean;
    kitAesthetic: string;
    renderMode?: string;
    error?: string;
  }> = [];

  const maxThisRun = CAROUSELS.length * 3;
  let totalPng = 0;

  for (const c of CAROUSELS) {
    console.log(`\n=== ${c.lg} ${c.title} kit=${c.kitAesthetic} ===`);
    await writeFile(
      path.join(jsonDir, `${c.lg}.json`),
      JSON.stringify(c.json, null, 2),
      "utf8",
    );

    let json;
    try {
      json = parseAndAssertCarouselJsonStrict(JSON.stringify(c.json));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "parse_fail";
      console.error(`STRICT_FAIL ${c.lg}`, msg);
      results.push({
        id: c.id,
        lg: c.lg,
        title: c.title,
        draftId: c.draftId,
        overwriteOk: false,
        imageUrls: [],
        pngPaths: [],
        pngOk: 0,
        drawOk: false,
        kitAesthetic: c.kitAesthetic,
        error: msg,
      });
      continue;
    }

    const critic = critiqueCarouselHandoff(json);
    if (!critic.ok) {
      console.error(`CRITIC_FAIL ${c.lg}`, critic.message);
      results.push({
        id: c.id,
        lg: c.lg,
        title: c.title,
        draftId: c.draftId,
        overwriteOk: false,
        imageUrls: [],
        pngPaths: [],
        pngOk: 0,
        drawOk: false,
        kitAesthetic: c.kitAesthetic,
        error: critic.message,
      });
      continue;
    }

    if (totalPng + json.slides.length > maxThisRun) {
      console.error(
        `BUDGET_STOP would exceed ${maxThisRun} this run (have ${totalPng})`,
      );
      results.push({
        id: c.id,
        lg: c.lg,
        title: c.title,
        draftId: c.draftId,
        overwriteOk: false,
        imageUrls: [],
        pngPaths: [],
        pngOk: 0,
        drawOk: false,
        kitAesthetic: c.kitAesthetic,
        error: "budget_would_exceed_run_cap",
      });
      break;
    }

    const draw = await runCreateCarouselDraw(json, {
      jobId: `live-gen-r2-${c.id}-${Date.now()}`,
      copyToWaveArtifacts: false,
      presetFile: c.preset,
      kitAesthetic: c.kitAesthetic,
      defaultCtaLabel: c.ctaLabel,
    });

    if (!draw.ok) {
      console.error(`DRAW_FAIL ${c.lg}`, draw.error?.code, draw.error?.message);
      results.push({
        id: c.id,
        lg: c.lg,
        title: c.title,
        draftId: c.draftId,
        overwriteOk: false,
        imageUrls: [],
        pngPaths: [],
        pngOk: 0,
        drawOk: false,
        kitAesthetic: c.kitAesthetic,
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
      `DRAW_OK ${c.lg} slides=${imageUrls.length} png=${pngPaths.length} mode=${draw.renderMode}`,
    );

    const draft = await upsertDraft({
      id: c.draftId,
      title: c.title,
      imageUrls,
      payload: {
        wave: "W-2026-10-15-sprint9-live-gen",
        round: 2,
        lg: c.lg,
        aesthetic: c.kitAesthetic,
        handoff: c.json,
        renderMode: draw.renderMode,
        overwriteOf: c.draftId,
      },
    });
    console.log(
      `DRAFT_OVERWRITE ${c.lg} ok=${draft.ok} id=${draft.id} expected=${c.draftId}`,
    );

    results.push({
      id: c.id,
      lg: c.lg,
      title: c.title,
      draftId: draft.id || c.draftId,
      overwriteOk: draft.ok,
      imageUrls,
      pngPaths,
      pngOk: pngPaths.length,
      drawOk: true,
      kitAesthetic: c.kitAesthetic,
      renderMode: draw.renderMode,
      error: draft.ok ? undefined : "draft_overwrite_failed",
    });
  }

  const allNine =
    results.reduce((n, r) => n + r.pngOk, 0) === 9 &&
    results.every(
      (r) => r.drawOk && r.overwriteOk && r.pngOk === 3 && r.draftId,
    );

  const idsMatch =
    results.length === 3 &&
    results[0]?.draftId === DRAFT_IDS.a &&
    results[1]?.draftId === DRAFT_IDS.b &&
    results[2]?.draftId === DRAFT_IDS.c;

  const lines: string[] = [
    "# Round-2 report — LIVE-GEN C-live-gen-03",
    "",
    `**Date:** ${new Date().toISOString()}`,
    `**Role:** AI Bridge`,
    `**Aggregator key:** present`,
    `**API:** ${API_BASE}`,
    `**Actor:** \`${USER_ID}\``,
    `**PNG deliverable:** **${results.reduce((n, r) => n + r.pngOk, 0)} / 9**`,
    `**All 9 images exist:** **${allNine ? "YES" : "NO"}**`,
    `**Overwrite same 3 draft ids:** **${idsMatch && results.every((r) => r.overwriteOk) ? "YES" : "NO"}**`,
    "",
    "## Summary",
    "",
    "| LG | Title | Draft ID (overwrite) | Kit | PNG |",
    "|----|-------|----------------------|-----|-----|",
  ];

  for (const r of results) {
    lines.push(
      `| ${r.lg} | ${r.title} | \`${r.draftId}\` | ${r.kitAesthetic} | ${r.pngOk}/3 |`,
    );
  }

  lines.push(
    "",
    "## What changed vs Round 1",
    "",
    "1. **Three distinct kits** (not one bento_glass sibling): `clean_poster` / `cinematic_scene` / `tip_cards`.",
    "2. **Telemetry stripped** for this script: no espresso plate, no RITUAL CLOCK / TO-GO RUSH / PAPER SPRINT, no HOOK chips.",
    "3. **LG-A:** full-bleed hero photo prompts + CTA marketing button on every slide + `*accent*` word.",
    "4. **LG-B:** people/metaphor IN scene prompts + text-only cinematic overlays.",
    "5. **LG-C:** Tip 1 / Tip 2 / CTA comments with yellow tip numbers (not marble+timers).",
    "6. Titles → `LIVE-GEN R2: …`; same draft ids overwritten via POST upsert.",
    "7. Temporary `presetFile` color overrides per aesthetic (bold_poster, no glass) — shell_freeze.",
    "",
    "## Draft slide URLs (localhost)",
    "",
  );

  for (const r of results) {
    lines.push(`### ${r.lg} — ${r.kitAesthetic}`);
    if (r.imageUrls.length === 0) {
      lines.push(`- (none) ${r.error ?? ""}`);
    } else {
      for (const u of r.imageUrls) {
        lines.push(`- \`${u}\``);
      }
    }
    lines.push("");
  }

  lines.push("## Artifact copies (Client Read)", "");
  for (const r of results) {
    lines.push(`### ${r.lg} → \`artifacts/round-2/${r.id}/\``);
    if (r.pngPaths.length === 0) {
      lines.push(`- (none) ${r.error ?? ""}`);
    } else {
      for (const p of r.pngPaths) {
        lines.push(`- \`${p.replace(/\\/g, "/")}\``);
      }
    }
    lines.push("");
  }

  lines.push(
    "## Handoff JSON (updated)",
    "",
    "- `handoff-json/LG-A.json`",
    "- `handoff-json/LG-B.json`",
    "- `handoff-json/LG-C.json`",
    "",
    "## Draw path",
    "",
    "- Script: `scripts/live-gen-round2.ts`",
    "- Core: `runCreateCarouselDraw` + `kitAesthetic` + temporary `presetFile`",
    "- Persist: `POST /api/studio/drafts` with **same** `id` (upsert overwrite)",
    "- Budget: `WAVE_VISUAL_ARTIFACT_DIR=generatedMedia/wave-live-gen`",
    "",
    "## Notes",
    "",
    "- upgrade_only / no_pipeline_break / shell_freeze",
    "- No social publish. No 4th carousel.",
    `- Actual PNG count: ${results.reduce((n, r) => n + r.pngOk, 0)}.`,
  );

  await writeFile(path.join(WAVE, "round-2-report.md"), lines.join("\n"), "utf8");
  console.log("\nREPORT written", path.join(WAVE, "round-2-report.md"));
  console.log(
    JSON.stringify(
      {
        allNine,
        idsMatch,
        drafts: results.map((r) => ({
          title: r.title,
          id: r.draftId,
          overwriteOk: r.overwriteOk,
          kit: r.kitAesthetic,
          pngOk: r.pngOk,
        })),
      },
      null,
      2,
    ),
  );

  process.exit(allNine && idsMatch ? 0 : 2);
}

main().catch((e) => {
  console.error("LIVE_GEN_R2_FATAL", e instanceof Error ? e.message : e);
  process.exit(1);
});
