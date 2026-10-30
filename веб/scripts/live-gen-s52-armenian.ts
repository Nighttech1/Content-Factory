/**
 * S52 C-carousel-quality-etalon — LIVE smoke (Deployer runs full 9 PNG)
 * Exactly 3 carousels × 3 slides = 9 PNGs. Random Armenian themes (NOT coffee).
 * Image API backgrounds REQUIRED (gpt-5.4-image-2). Overwrite 3 stable draft ids.
 *
 *   npx tsx scripts/live-gen-s52-armenian.ts
 *   npx tsx scripts/live-gen-s52-armenian.ts --only=a,b
 *
 * Env forced by this script:
 *   CAROUSEL_HTML_FIRST=1
 *   CAROUSEL_DRAW_SKIP_BG=0   ← must call image API (pictures, not text-only)
 *   WAVE_VISUAL_ARTIFACT_DIR=generatedMedia/wave-s52-design-razbor
 *
 * Locks: no social publish · shell_freeze · budget ≤9 · no 4th draft.
 */

import { copyFile, mkdir, writeFile, access } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { resolve } from "node:path";

import type { DesignPresetFile } from "@/types/design";
import type { LiveGenKitAesthetic } from "@/lib/studio/carousel-html-renderer";
import { DEFAULT_CAROUSEL_IMAGE_MODEL } from "@/types/mesh-agent";

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
  "2026-10-16-design-razbor-quality",
);
const ARTIFACT_ROOT = path.join(
  process.cwd(),
  "generatedMedia",
  "wave-s52-design-razbor",
);
const ARTIFACTS = path.join(ARTIFACT_ROOT, "deliverables");
const API_BASE = process.env.LIVE_GEN_API_BASE?.trim() || "http://localhost:3001";
const USER_ID = "user_seed_admin_c16";
const HARD_PNG_CAP = 9;

/** HARD: overwrite these exact draft ids — never create a 4th carousel. */
const DRAFT_IDS = {
  a: "draft-s52-etalon-a",
  b: "draft-s52-etalon-b",
  c: "draft-s52-etalon-c",
} as const;

const CTA_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: "Пиши в комментариях",
  2: "Подпишись на Vernatun",
  3: "Встречи в TG",
  4: "Лайк + сохранить",
};

const NO_BAKE =
  "ABSOLUTELY FORBIDDEN in image pixels: readable text, letters, acronyms, HTML, CTA, TIP, HOOK, stacked placeholder digits. Photoreal or cinematic illustration only. No purple glow.";

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

/** Armenian theme pool — NOT coffee / jazz-club ritual. Rotates each run. */
const ARMENIAN_THEME_POOL = [
  {
    id: "yerevan_night",
    titleRu: "Ереван ночь",
    idea: "Ночной Ереван: огни, Cascade, тёплый воздух — Vernatun как publisher",
    hook: "Город спит?",
    cover: "Город *спит*?",
    body: "Огни Cascade *молчат*",
    bodySec: "Пока кто-то говорит по-армянски — город живой.",
    cta: "Сохрани *ночь*",
    ctaSec: "Лайк + сохранить — Ереван останется в ленте.",
    ctaType: 4 as const,
    visual: {
      cover:
        "CINEMATIC full-bleed photograph: Yerevan night skyline Cascade steps warm sodium lights, shallow depth, premium editorial mood",
      body: "CINEMATIC street scene photograph: wet asphalt reflections, soft bokeh neon amber, empty plaza at night Armenia",
      cta: "CINEMATIC night balcony view over Yerevan lights, dark upper third empty for overlay typography, warm orange rim",
    },
    hashtags: ["#Vernatun", "#Ереван", "#Ночь", "#Армения"],
  },
  {
    id: "alphabet",
    titleRu: "Армянский алфавит",
    idea: "Армянские буквы как живой язык — не урок, а дыхание",
    hook: "Буква дышит?",
    cover: "Буква *дышит*?",
    body: "38 знаков — *дом*",
    bodySec: "Алфавит Маштоца — не музей. Это голос за столом.",
    cta: "Хочешь ещё *такого*?",
    ctaSec: "Подписывайся — следующие разборы языка.",
    ctaType: 2 as const,
    visual: {
      cover:
        "CINEMATIC still-life photograph: carved Armenian stone letters Mesrop Mashtots style, dramatic side light, dark charcoal, heritage mood",
      body: "CINEMATIC close-up photograph: handwritten Armenian script on textured paper, warm amber desk lamp, shallow DOF",
      cta: "CINEMATIC manuscript page with soft gold light spill, empty lower third for CTA overlay, no readable English",
    },
    hashtags: ["#Vernatun", "#Алфавит", "#Маштоц", "#Армянский"],
  },
  {
    id: "pomegranate",
    titleRu: "Гранат / символ",
    idea: "Гранат как символ изобилия и корней — без кофе-ритуала",
    hook: "Зерно громче?",
    cover: "Зерно *громче*?",
    body: "Один плод — *круг*",
    bodySec: "Гранат Vernatun — корни, не декор для сторис.",
    cta: "А у *тебя*?",
    ctaSec: "Напиши в комментариях: какой символ твой?",
    ctaType: 1 as const,
    visual: {
      cover:
        "CINEMATIC product/still photograph: ripe pomegranate split open ruby seeds, dark slate, soft gold rim light, luxury food photography",
      body: "CINEMATIC top-down photograph: pomegranate halves on dark wood, scattered seeds like constellation, warm side light",
      cta: "CINEMATIC close-up ruby seeds with bokeh, generous empty dark field for overlay button, no text in image",
    },
    hashtags: ["#Vernatun", "#Гранат", "#Символ", "#Корни"],
  },
  {
    id: "tatev",
    titleRu: "Татев",
    idea: "Монастырь Татев и канатная дорога — высота наследия",
    hook: "Выше страха?",
    cover: "Выше *страха*?",
    body: "Камень держит *тишину*",
    bodySec: "Татев — не открытка. Это пауза над ущельем.",
    cta: "Приходи в *круг*",
    ctaSec: "Живые встречи — TG в шапке профиля.",
    ctaType: 3 as const,
    visual: {
      cover:
        "CINEMATIC landscape photograph: Tatev monastery cliffs Armenia, dramatic clouds, golden hour, epic scale, no people faces close",
      body: "CINEMATIC aerial feel photograph: Wings of Tatev cable car over gorge, mist, stone monastery distant, editorial travel",
      cta: "CINEMATIC monastery silhouette against dusk sky, empty lower third for CTA, warm amber horizon",
    },
    hashtags: ["#Vernatun", "#Татев", "#Армения", "#Наследие"],
  },
  {
    id: "duduk",
    titleRu: "Дудук",
    idea: "Дудук — голос, который слышно без слов",
    hook: "Дудук слышит?",
    cover: "Дудук *слышит*?",
    body: "Дерево говорит *тише*",
    bodySec: "Один звук — и комната становится домом.",
    cta: "Сохрани *звук*",
    ctaSec: "Лайк + сохранить — мелодия рядом.",
    ctaType: 4 as const,
    visual: {
      cover:
        "CINEMATIC photograph: apricot-wood duduk instrument close-up, soft smoke-like atmosphere, warm tungsten light, dark background",
      body: "CINEMATIC scene: musician hands holding duduk in shadow, rim light orange, intimate concert mood, shallow DOF",
      cta: "CINEMATIC still: duduk resting on dark velvet, single warm spotlight, empty space for overlay typography",
    },
    hashtags: ["#Vernatun", "#Дудук", "#Музыка", "#Армения"],
  },
  {
    id: "diaspora_table",
    titleRu: "Диаспора стол",
    idea: "Стол диаспоры: хлеб, смех, язык через города",
    hook: "Стол без границ?",
    cover: "Стол без *границ*?",
    body: "Хлеб едет *дальше*",
    bodySec: "Диаспора — не расстояние. Это один длинный стол.",
    cta: "Хочешь ещё *такого*?",
    ctaSec: "Подписывайся — истории круга дальше.",
    ctaType: 2 as const,
    visual: {
      cover:
        "CINEMATIC photograph: long dinner table with lavash bread wine glasses warm people silhouettes, diaspora gathering mood, soft orange light",
      body: "CINEMATIC close-up: hands breaking lavash bread over shared plates, candles, heritage home table, photoreal",
      cta: "CINEMATIC empty chair at warm table end, invitation metaphor, dark upper third for CTA overlay",
    },
    hashtags: ["#Vernatun", "#Диаспора", "#Стол", "#Community"],
  },
  {
    id: "aragats",
    titleRu: "Арагац",
    idea: "Арагац — четыре вершины, один горизонт",
    hook: "Вершина молчит?",
    cover: "Вершина *молчит*?",
    body: "Четыре пика — *один*",
    bodySec: "Арагац учит не спешить к вершине.",
    cta: "А у *тебя*?",
    ctaSec: "Какая вершина ждёт? Пиши в комментариях.",
    ctaType: 1 as const,
    visual: {
      cover:
        "CINEMATIC mountain landscape photograph: Mount Aragats four peaks Armenia, snow patches, wide sky, epic travel editorial",
      body: "CINEMATIC alpine meadow foreground with Aragats massif distant, soft morning light, no logos",
      cta: "CINEMATIC ridge silhouette against dusk gradient, empty lower field for CTA button overlay",
    },
    hashtags: ["#Vernatun", "#Арагац", "#Горы", "#Армения"],
  },
  {
    id: "sevan",
    titleRu: "Севан",
    idea: "Озеро Севан — синева и тишина выше города",
    hook: "Вода помнит?",
    cover: "Вода *помнит*?",
    body: "Севан выше *ленты*",
    bodySec: "Синий горизонт — пауза, которую нельзя скроллить.",
    cta: "Приходи в *круг*",
    ctaSec: "Живые встречи — TG в шапке профиля.",
    ctaType: 3 as const,
    visual: {
      cover:
        "CINEMATIC photograph: Lake Sevan deep blue water peninsula monastery silhouette, bright highland sky, travel editorial",
      body: "CINEMATIC shoreline stones and clear Sevan water, mountain backdrop, cool daylight, photoreal",
      cta: "CINEMATIC wide Sevan dusk reflection, empty sky third for CTA overlay, soft amber cloud edge",
    },
    hashtags: ["#Vernatun", "#Севан", "#Озеро", "#Армения"],
  },
] as const;

type Theme = (typeof ARMENIAN_THEME_POOL)[number];

function pickThemes(count: number): Theme[] {
  const pool = [...ARMENIAN_THEME_POOL];
  // Deterministic shuffle from time + pid so each run differs
  let seed = Date.now() ^ (process.pid << 16);
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, count);
}

function handoffFromTheme(theme: Theme): CarouselHandoffJson {
  return {
    contentType: "carousel",
    requested_slide_count: 3,
    idea: theme.idea,
    hook: theme.hook,
    tone: "vernatun",
    cta_type: theme.ctaType,
    slides: [
      {
        slide_number: 1,
        layout_variant: "cover",
        primary_copy: theme.cover,
        secondary_copy: theme.titleRu,
        swipe_trigger: `META: curiosity — swipe for ${theme.id} value beat`,
        visual_prompt: `${theme.visual.cover}. FULL-BLEED photoreal/cinematic hero image. ${NO_BAKE}`,
        alt_text: `Cover: ${theme.titleRu}`,
      },
      {
        slide_number: 2,
        layout_variant: "body_slide",
        primary_copy: theme.body,
        secondary_copy: theme.bodySec,
        swipe_trigger: "META: value beat — swipe for CTA",
        visual_prompt: `${theme.visual.body}. CINEMATIC photograph illustration, photoreal scene. ${NO_BAKE}`,
        alt_text: `Body: ${theme.titleRu}`,
      },
      {
        slide_number: 3,
        layout_variant: "cta_slide",
        primary_copy: theme.cta,
        secondary_copy: theme.ctaSec,
        swipe_trigger: "META: soft end after CTA",
        visual_prompt: `${theme.visual.cta}. CINEMATIC photograph, empty space for HTML CTA overlay. ${NO_BAKE}`,
        alt_text: `CTA: ${theme.titleRu}`,
        cta_type: theme.ctaType,
      },
    ],
    caption: `${theme.idea} Vernatun.`,
    hashtags: [...theme.hashtags],
    promptForDesigner:
      "S52 cinematic_scene + image-2 bg; HTML/CSS text overlay; TOPIC from theme not coffee.",
  };
}

function presetCinematic(): DesignPresetFile {
  return {
    id: "s52-cinematic",
    preset: "dark_editorial",
    name: "S52 Armenian Cinematic",
    designMd: "S52 temporary — cinematic photo + tokens only.",
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

function presetEditorialNight(): DesignPresetFile {
  return {
    id: "s52-editorial",
    preset: "dark_editorial",
    name: "S52 Editorial Night",
    designMd: "S52 temporary — dark editorial tokens.",
    colors: {
      bg: "#12100E",
      surface: "#1C1814",
      text: "#F5F0E6",
      muted: "#A89B84",
      accent: "#E8B84A",
      accentSoft: "#F5D547",
    },
    typography: {
      display: '"Manrope", system-ui, sans-serif',
      body: "Manrope, system-ui, sans-serif",
      armenianSafe: '"Noto Sans Armenian", Manrope, sans-serif',
    },
    components: {
      buttonCta: { glow: false, radius: "12px", labelWeight: 700 },
      card: { glass: true },
      seamlessConnector: { enabled: true },
      gauge: { glow: true },
      doodle: { enabled: false },
    },
    version: 1,
  };
}

function presetBoldHeritage(): DesignPresetFile {
  return {
    id: "s52-bold-heritage",
    preset: "bold_poster",
    name: "S52 Bold Heritage",
    designMd: "S52 temporary — bold poster over photo bg.",
    colors: {
      bg: "#0E0E10",
      surface: "#1A1A1E",
      text: "#FFFFFF",
      muted: "#B8B0A4",
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
  id: string;
  title: string;
  imageUrls: string[];
  payload: unknown;
}): Promise<{ id: string; ok: boolean; raw: unknown }> {
  const slides = input.imageUrls.map((imageUrl, i) => ({
    id: `s52-${i + 1}`,
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

function selectedIds(): Array<"a" | "b" | "c"> {
  const arg = process.argv.find((a) => a.startsWith("--only="));
  if (!arg) return ["a", "b", "c"];
  const set = new Set(
    arg
      .slice("--only=".length)
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s): s is "a" | "b" | "c" => s === "a" || s === "b" || s === "c"),
  );
  return (["a", "b", "c"] as const).filter((id) => set.has(id));
}

async function main() {
  process.env.WAVE_VISUAL_ARTIFACT_DIR = ARTIFACT_ROOT;
  process.env.CAROUSEL_HTML_FIRST = "1";
  // HARD: must call image API — pictures not text-only
  process.env.CAROUSEL_DRAW_SKIP_BG = "0";
  process.env.WAVE_VISUAL_COPY_ARTIFACTS = "0";
  process.env.CAROUSEL_IMAGE_MODEL =
    process.env.CAROUSEL_IMAGE_MODEL?.trim() || DEFAULT_CAROUSEL_IMAGE_MODEL;

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

  const ids = selectedIds();
  const themes = pickThemes(3);
  const kits: Array<{
    id: "a" | "b" | "c";
    kitAesthetic: LiveGenKitAesthetic;
    preset: DesignPresetFile;
  }> = [
    { id: "a", kitAesthetic: "cinematic_scene", preset: presetCinematic() },
    { id: "b", kitAesthetic: "cinematic_scene", preset: presetEditorialNight() },
    { id: "c", kitAesthetic: "cinematic_scene", preset: presetBoldHeritage() },
  ];

  const carousels = kits
    .filter((k) => ids.includes(k.id))
    .map((k, i) => {
      const theme = themes[i] ?? themes[0]!;
      const json = handoffFromTheme(theme);
      return {
        ...k,
        theme,
        draftId: DRAFT_IDS[k.id],
        title: `S52 ${k.id.toUpperCase()}: ${theme.titleRu}`,
        ctaLabel: CTA_LABEL[json.cta_type],
        json,
      };
    });

  const hasKey = Boolean(resolveAggregatorEnv());
  console.log(`S52_KEY=${hasKey ? "present" : "MISSING"}`);
  console.log(`S52_API=${API_BASE}`);
  console.log(`S52_IMAGE_MODEL=${process.env.CAROUSEL_IMAGE_MODEL}`);
  console.log(`S52_HTML_FIRST=${process.env.CAROUSEL_HTML_FIRST}`);
  console.log(`S52_SKIP_BG=${process.env.CAROUSEL_DRAW_SKIP_BG}`);
  console.log(`S52_BUDGET_DIR=${process.env.WAVE_VISUAL_ARTIFACT_DIR}`);
  console.log(
    `S52_THEMES=${carousels.map((c) => `${c.id}:${c.theme.id}`).join(",")}`,
  );
  console.log(
    `S52_OVERWRITE=${carousels.map((c) => c.draftId).join(",")}`,
  );

  if (!hasKey) {
    await mkdir(WAVE_DIR, { recursive: true });
    await writeFile(
      path.join(WAVE_DIR, "s52-live-gen-report.md"),
      [
        "# S52 live-gen — FAIL",
        "",
        "**Status:** FAILED — aggregator key missing",
        "",
        "No PNG burnt. Drafts not overwritten.",
      ].join("\n"),
      "utf8",
    );
    console.error("S52_FAIL missing_key");
    process.exit(1);
  }

  await mkdir(ARTIFACTS, { recursive: true });
  await mkdir(path.join(WAVE_DIR, "handoff-json"), { recursive: true });
  for (const c of carousels) {
    await mkdir(path.join(ARTIFACTS, c.id), { recursive: true });
  }

  const results: Array<{
    id: string;
    title: string;
    themeId: string;
    draftId: string;
    overwriteOk: boolean;
    imageUrls: string[];
    pngPaths: string[];
    pngOk: number;
    drawOk: boolean;
    bgImageCalls?: number;
    renderMode?: string;
    error?: string;
  }> = [];

  let totalPng = 0;

  for (const c of carousels) {
    console.log(`\n=== ${c.id.toUpperCase()} ${c.title} theme=${c.theme.id} ===`);
    await writeFile(
      path.join(WAVE_DIR, "handoff-json", `S52-${c.id.toUpperCase()}.json`),
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
        themeId: c.theme.id,
        draftId: c.draftId,
        overwriteOk: false,
        imageUrls: [],
        pngPaths: [],
        pngOk: 0,
        drawOk: false,
        error: msg,
      });
      continue;
    }

    const critic = critiqueCarouselHandoff(json);
    if (!critic.ok) {
      console.error(`CRITIC_FAIL ${c.id}`, critic.message);
      results.push({
        id: c.id,
        title: c.title,
        themeId: c.theme.id,
        draftId: c.draftId,
        overwriteOk: false,
        imageUrls: [],
        pngPaths: [],
        pngOk: 0,
        drawOk: false,
        error: critic.message,
      });
      continue;
    }

    if (totalPng + json.slides.length > HARD_PNG_CAP) {
      console.error(
        `BUDGET_STOP would exceed ${HARD_PNG_CAP} (have ${totalPng})`,
      );
      results.push({
        id: c.id,
        title: c.title,
        themeId: c.theme.id,
        draftId: c.draftId,
        overwriteOk: false,
        imageUrls: [],
        pngPaths: [],
        pngOk: 0,
        drawOk: false,
        error: "budget_would_exceed_9",
      });
      break;
    }

    const draw = await runCreateCarouselDraw(json, {
      jobId: `s52-${c.id}-${Date.now()}`,
      model: DEFAULT_CAROUSEL_IMAGE_MODEL,
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
        themeId: c.theme.id,
        draftId: c.draftId,
        overwriteOk: false,
        imageUrls: [],
        pngPaths: [],
        pngOk: 0,
        drawOk: false,
        error: `${draw.error?.code}: ${draw.error?.message}`,
      });
      continue;
    }

    const bgCalls = draw.bgImageCalls ?? 0;
    if (bgCalls < 1) {
      console.error(
        `BG_FAIL ${c.id} bgImageCalls=${bgCalls} — expected image API (not text-only)`,
      );
      results.push({
        id: c.id,
        title: c.title,
        themeId: c.theme.id,
        draftId: c.draftId,
        overwriteOk: false,
        imageUrls: draw.slides.map((s) => s.imageUrl).filter(Boolean),
        pngPaths: [],
        pngOk: 0,
        drawOk: false,
        bgImageCalls: bgCalls,
        renderMode: draw.renderMode,
        error: "bgImageCalls_zero_text_only_forbidden",
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
      } else if (url.startsWith("http") || url.startsWith("data:")) {
        try {
          if (url.startsWith("data:")) {
            const b64 = url.split(",")[1];
            if (b64) {
              await writeFile(dest, Buffer.from(b64, "base64"));
              pngPaths.push(dest);
            }
          } else {
            const imgRes = await fetch(url);
            if (imgRes.ok) {
              const buf = Buffer.from(await imgRes.arrayBuffer());
              await writeFile(dest, buf);
              pngPaths.push(dest);
            }
          }
        } catch {
          /* skip */
        }
      }
    }

    totalPng += pngPaths.length;
    console.log(
      `DRAW_OK ${c.id} slides=${imageUrls.length} png=${pngPaths.length} bgCalls=${bgCalls} mode=${draw.renderMode}`,
    );

    const draft = await upsertDraft({
      id: c.draftId,
      title: c.title,
      imageUrls,
      payload: {
        wave: "2026-10-16-design-razbor-quality",
        ticket: "C-carousel-quality-etalon",
        themeId: c.theme.id,
        handoff: c.json,
        renderMode: draw.renderMode,
        bgImageCalls: bgCalls,
        imageModel: DEFAULT_CAROUSEL_IMAGE_MODEL,
        overwriteOf: c.draftId,
      },
    });
    console.log(
      `DRAFT_OVERWRITE ${c.id} ok=${draft.ok} id=${draft.id} expected=${c.draftId}`,
    );

    results.push({
      id: c.id,
      title: c.title,
      themeId: c.theme.id,
      draftId: draft.id || c.draftId,
      overwriteOk: draft.ok,
      imageUrls,
      pngPaths,
      pngOk: pngPaths.length,
      drawOk: true,
      bgImageCalls: bgCalls,
      renderMode: draw.renderMode,
      error: draft.ok ? undefined : "draft_overwrite_failed",
    });
  }

  const pngTotal = results.reduce((n, r) => n + r.pngOk, 0);
  const allNine =
    pngTotal === 9 &&
    results.length === 3 &&
    results.every(
      (r) =>
        r.drawOk &&
        r.overwriteOk &&
        r.pngOk === 3 &&
        (r.bgImageCalls ?? 0) >= 1,
    );

  const budgetPath = path.join(ARTIFACT_ROOT, "_png_budget.json");
  await mkdir(ARTIFACT_ROOT, { recursive: true });
  await writeFile(
    budgetPath,
    JSON.stringify(
      {
        ticket: "C-carousel-quality-etalon",
        max: HARD_PNG_CAP,
        count: pngTotal,
        themes: results.map((r) => r.themeId),
        drafts: results.map((r) => r.draftId),
        ok: allNine,
      },
      null,
      2,
    ),
    "utf8",
  );

  const lines: string[] = [
    "# S52 live-gen — C-carousel-quality-etalon",
    "",
    `**Status:** ${allNine ? "OK" : "PARTIAL/FAIL"}`,
    `**PNG:** ${pngTotal}/${HARD_PNG_CAP}`,
    `**Image model:** \`${DEFAULT_CAROUSEL_IMAGE_MODEL}\``,
    `**HTML-first:** CAROUSEL_HTML_FIRST=1 · CAROUSEL_DRAW_SKIP_BG=0`,
    `**Artifacts:** \`${ARTIFACTS}\``,
    `**Etalon compare:** \`generatedMedia/эталон карусели/\``,
    "",
    "| ID | Theme | Draft (overwrite) | PNG | bgCalls | OK |",
    "|----|-------|-------------------|-----|---------|----|",
    ...results.map(
      (r) =>
        `| ${r.id} | ${r.themeId} | \`${r.draftId}\` | ${r.pngOk}/3 | ${r.bgImageCalls ?? "—"} | ${r.drawOk && r.overwriteOk ? "yes" : "no"}${r.error ? ` (${r.error})` : ""} |`,
    ),
    "",
    "## Notes",
    "- Themes picked from Armenian pool (NOT coffee).",
    "- Draft ids fixed: draft-s52-etalon-a/b/c — re-run overwrites, no spam.",
    "- Client compares deliverables vs etalon folder side-by-side.",
  ];

  await mkdir(WAVE_DIR, { recursive: true });
  await writeFile(
    path.join(WAVE_DIR, "s52-live-gen-report.md"),
    lines.join("\n"),
    "utf8",
  );
  console.log(`\nS52_REPORT ${allNine ? "OK" : "FAIL"} png=${pngTotal}`);
  if (!allNine) process.exit(1);
}

main().catch((e) => {
  console.error("S52_FATAL", e);
  process.exit(1);
});
