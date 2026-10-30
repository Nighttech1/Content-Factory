/**
 * LIVE-GEN round 1 — C-live-gen-01
 * Exactly 3 carousels × 3 slides = 9 PNGs. Vernatun topics only.
 * Persist drafts via POST /api/studio/drafts. No social publish.
 *
 *   npx tsx scripts/live-gen-round1.ts
 */

import { copyFile, mkdir, writeFile, access } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { resolve } from "node:path";

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

const WAVE =
  "memory/waves/W-2026-10-15-sprint9-live-gen";
const ARTIFACTS = path.join(WAVE, "artifacts", "round-1");
const API_BASE = process.env.LIVE_GEN_API_BASE?.trim() || "http://localhost:3001";
const USER_ID = "user_seed_admin_c16";

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

const LG_A: CarouselHandoffJson = {
  contentType: "carousel",
  requested_slide_count: 3,
  idea: "Утренний кофе-ритуал Vernatun — место встречи клуба",
  hook: "Кофе пахнет домом?",
  tone: "vernatun",
  cta_type: 4,
  slides: [
    {
      slide_number: 1,
      layout_variant: "cover",
      primary_copy: "Кофе пахнет домом?",
      secondary_copy: "Утро в Vernatun начинается с чашки",
      swipe_trigger:
        "META: curiosity gap — зритель хочет увидеть, что за ритуал / место встречи на следующем кадре",
      visual_prompt:
        "Clean orange-white editorial Instagram background 4:5, high-key minimalist. Top third solid vivid safety-orange field, bottom two-thirds pure white negative space. Center: photoreal ceramic coffee cup with crema swirl, soft studio shadow, no logos. Premium real-estate-ad craft quality: crisp edges, generous whitespace, luxury product photography lighting. No text, no typography, no purple, no stock Inter UI chrome, no watermarks.",
      alt_text: "Чашка кофе на бело-оранжевом фоне Vernatun",
    },
    {
      slide_number: 2,
      layout_variant: "body_slide",
      primary_copy: "Ритуал, не спешка",
      secondary_copy:
        "Один стол. Один разговор. Аромат, который возвращает к корням.",
      swipe_trigger:
        "META: after value beat, swipe for soft CTA to like+save the ritual card",
      visual_prompt:
        "Clean orange-white editorial continuation. White canvas with thin orange geometric header bar. Soft overhead daylight on a marble cafe table: steam rising from espresso, linen napkin, warm wood edge. Isometric-clean product feel like premium brand carousel mid-slide. No people faces as brand, no foreign logos, no text overlays in image, no purple gradient.",
      alt_text: "Стол клуба с кофе и паром — атмосфера ритуала",
    },
    {
      slide_number: 3,
      layout_variant: "cta_slide",
      primary_copy: "Сохрани утро Vernatun",
      secondary_copy: "Лайк + сохранить — чтобы не потерять ритуал",
      swipe_trigger: "META: soft end — engagement complete after CTA",
      visual_prompt:
        "Clean orange-white CTA frame background. Bold orange lower diagonal slice meeting white upper field. Center: empty ceramic cup from above with soft orange rim light, bookmark/ribbon silhouette hint without text. Premium minimal layout ready for HTML CTA overlay. No readable words in image, no social icons baked in, no purple.",
      alt_text: "CTA-кадр: сохранить кофе-ритуал Vernatun",
      cta_type: 4,
    },
  ],
  caption:
    "Утро в клубе Vernatun — это чашка, стол и разговор без спешки. Сохрани ритуал ☕",
  hashtags: ["#Vernatun", "#АрмянскийКлуб", "#КофеРитуал", "#Сообщество"],
  promptForDesigner:
    "Aesthetic lock REF-A: clean orange/white editorial, large type hierarchy via HTML, generous whitespace. Vernatun coffee ritual only — never real-estate logos/addresses.",
};

const LG_B: CarouselHandoffJson = {
  contentType: "carousel",
  requested_slide_count: 3,
  idea: "Сила сообщества Vernatun — энергия вместе",
  hook: "Один голос — слабо",
  tone: "vernatun",
  cta_type: 3,
  slides: [
    {
      slide_number: 1,
      layout_variant: "cover",
      primary_copy: "Один голос — слабо",
      secondary_copy: "Вместе — клуб, который слышно",
      swipe_trigger:
        "META: drama hook — swipe to feel the community proof / vibe on slide 2",
      visual_prompt:
        "Dark cinematic orange Instagram background 4:5. Deep charcoal-black club interior, dramatic rim light, glowing neon-orange accent strips along ceiling architecture (gym-poster craft quality, NOT gym brand). Silhouette cluster of people at a long table in warm orange backlight, steam and shallow depth of field. Moody photography, high contrast, no logos, no readable text, no purple slop, no OM GYM branding.",
      alt_text: "Тёмный кинематографичный кадр сообщества Vernatun",
    },
    {
      slide_number: 2,
      layout_variant: "body_slide",
      primary_copy: "Здесь звучит армянский",
      secondary_copy: "Смех, споры, поддержка — живой круг без сцены и поз",
      swipe_trigger:
        "META: after vibe proof, swipe for invitation CTA to TG club meets",
      visual_prompt:
        "Dark cinematic orange mid-slide. Low-angle dramatic shot of hands sharing bread and coffee cups on dark wood, orange practical lights streaking like LED architecture. Energy of togetherness without gym equipment or trainer faces as identity. Premium sports-ad lighting craft applied to club table. No text in image, no foreign brand marks.",
      alt_text: "Руки за общим столом клуба — энергия вместе",
    },
    {
      slide_number: 3,
      layout_variant: "cta_slide",
      primary_copy: "Приходи в круг",
      secondary_copy: "Живые встречи — приглашение в TG-канале в шапке профиля",
      swipe_trigger: "META: soft end after community CTA",
      visual_prompt:
        "Dark cinematic orange CTA plate. Near-black full-bleed with single glowing orange doorway / corridor light leading into a warm club room. Large negative space upper third for HTML headline. Cinematic depth, orange accent only, no gym logo, no text baked into photo, no purple.",
      alt_text: "CTA: приглашение на живые встречи Vernatun",
      cta_type: 3,
    },
  ],
  caption:
    "В Vernatun сила — в круге. Один голос тихо, вместе — слышно. Ждём в TG 🧡",
  hashtags: ["#Vernatun", "#Сообщество", "#АрмянскийКруг", "#ЖивыеВстречи"],
  promptForDesigner:
    "Aesthetic lock REF-B: dark cinematic + orange accents, drama light, sports-poster energy — Vernatun community only, never OM GYM identity.",
};

const LG_C: CarouselHandoffJson = {
  contentType: "carousel",
  requested_slide_count: 3,
  idea: "Наследие Vernatun — tip-карточки с корнями",
  hook: "Корни громче трендов",
  tone: "vernatun",
  cta_type: 1,
  slides: [
    {
      slide_number: 1,
      layout_variant: "cover",
      primary_copy: "Корни громче трендов",
      secondary_copy: "3 tip-карточки Vernatun — без воды",
      swipe_trigger:
        "META: bold tip cover — swipe to get tip #1 substance on next frame",
      visual_prompt:
        "Black and bright yellow high-contrast tip-card cover 4:5. Deep pure black background, bold yellow rectangular accent block empty for HTML text, subtle moody silhouette of a person at a window with warm twilight. Motivation-tips craft quality: huge hierarchy space, yellow highlight bars, crisp edges. No foreign tip-brand logos, no stock fluff slogans in image, no purple, no readable baked text.",
      alt_text: "Чёрно-жёлтая обложка tip-карусели Vernatun",
    },
    {
      slide_number: 2,
      layout_variant: "body_slide",
      primary_copy: "Говори дома чаще",
      secondary_copy:
        "Один армянский разговор в день важнее идеального акцента.",
      swipe_trigger:
        "META: after tip value, swipe for question CTA to comments",
      visual_prompt:
        "Black-yellow tip mid-card. Black field with yellow numbered circle placeholder space (empty), inset photo of handwritten notebook page on dark desk with warm lamp — heritage/community note vibe, not generic hustle. High contrast, bold graphic frames, checklist craft like tip carousels. No text in photo, no foreign brand, no purple gradient.",
      alt_text: "Tip: говори дома чаще — наследие Vernatun",
    },
    {
      slide_number: 3,
      layout_variant: "cta_slide",
      primary_copy: "Какой tip твой?",
      secondary_copy: "Напиши в комментариях — какой совет заберёшь сегодня",
      swipe_trigger: "META: soft end after comment CTA",
      visual_prompt:
        "Black-yellow CTA tip finale. Pure black background, thick yellow brushstroke underline zone empty for HTML question, soft silhouette of two people talking over coffee at dusk. High-contrast tip-stack ending frame. No engagement icons baked in, no foreign tip brand, no purple, no readable words in image.",
      alt_text: "CTA: какой tip Vernatun заберёшь — напиши в комментариях",
      cta_type: 1,
    },
  ],
  caption:
    "Корни громче трендов. Какой tip Vernatun заберёшь сегодня? Пиши в комментариях 🖤💛",
  hashtags: ["#Vernatun", "#Наследие", "#АрмянскиеКорни", "#TipКарточки"],
  promptForDesigner:
    "Aesthetic lock REF-C: black + yellow tip stack, bold hook hierarchy via HTML — Vernatun heritage tips only, never foreign motivation brand.",
};

const ALL_CAROUSELS: Array<{
  id: "a" | "b" | "c";
  lg: string;
  title: string;
  json: CarouselHandoffJson;
}> = [
  {
    id: "a",
    lg: "LG-A",
    title: "LIVE-GEN R1: LG-A Coffee ritual",
    json: LG_A,
  },
  {
    id: "b",
    lg: "LG-B",
    title: "LIVE-GEN R1: LG-B Community energy",
    json: LG_B,
  },
  {
    id: "c",
    lg: "LG-C",
    title: "LIVE-GEN R1: LG-C Heritage tips",
    json: LG_C,
  },
];

/** `--only a,b,c` to resume partial round without re-burning successful gens. */
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
  // /generated/carousel/{jobId}/slide_01.png → public/generated/carousel/...
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

async function postDraft(input: {
  title: string;
  imageUrls: string[];
  payload: unknown;
}): Promise<{ id: string; ok: boolean; raw: unknown }> {
  const slides = input.imageUrls.map((imageUrl, i) => ({
    id: `live-gen-r1-${i + 1}`,
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

async function main() {
  // Isolate LIVE-GEN from prior wave-visual-deconstructor 40-PNG counter.
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
  console.log(`LIVE_GEN_KEY=${hasKey ? "present" : "MISSING"}`);
  console.log(`LIVE_GEN_API=${API_BASE}`);
  console.log(
    `LIVE_GEN_BUDGET_DIR=${process.env.WAVE_VISUAL_ARTIFACT_DIR}`,
  );
  console.log(`LIVE_GEN_ONLY=${CAROUSELS.map((c) => c.id).join(",")}`);

  if (!hasKey) {
    const report = [
      "# Round-1 report — LIVE-GEN FAIL",
      "",
      "**Status:** FAILED — aggregator key missing",
      "",
      "`AGGREGATOR_API_KEY` / aggregator env not resolved. No PNG burnt. No drafts created.",
      "",
      "Fix: set `AGGREGATOR_API_KEY` (+ `AGGREGATOR_BASE_URL`) in `.env`, restart localhost, re-run `npx tsx scripts/live-gen-round1.ts`.",
      "",
      `PNG count: **0 / 9**`,
    ].join("\n");
    await mkdir(WAVE, { recursive: true });
    await writeFile(path.join(WAVE, "round-1-report.md"), report, "utf8");
    console.error("LIVE_GEN_FAIL missing_key");
    process.exit(1);
  }

  await mkdir(ARTIFACTS, { recursive: true });
  for (const c of CAROUSELS) {
    await mkdir(path.join(ARTIFACTS, c.id), { recursive: true });
  }

  // Persist JSON handoffs for Client / auditors
  const jsonDir = path.join(WAVE, "handoff-json");
  await mkdir(jsonDir, { recursive: true });

  const results: Array<{
    id: string;
    lg: string;
    title: string;
    draftId: string;
    imageUrls: string[];
    pngPaths: string[];
    pngOk: number;
    drawOk: boolean;
    renderMode?: string;
    error?: string;
  }> = [];

  // Hard deliverable cap for this round script run (remaining slots).
  const maxThisRun = CAROUSELS.length * 3;
  let totalPng = 0;

  for (const c of CAROUSELS) {
    console.log(`\n=== ${c.lg} ${c.title} ===`);
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
        draftId: "",
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
      console.error(`CRITIC_FAIL ${c.lg}`, critic.message);
      results.push({
        id: c.id,
        lg: c.lg,
        title: c.title,
        draftId: "",
        imageUrls: [],
        pngPaths: [],
        pngOk: 0,
        drawOk: false,
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
        draftId: "",
        imageUrls: [],
        pngPaths: [],
        pngOk: 0,
        drawOk: false,
        error: "budget_would_exceed_run_cap",
      });
      break;
    }

    const draw = await runCreateCarouselDraw(json, {
      jobId: `live-gen-r1-${c.id}-${Date.now()}`,
      copyToWaveArtifacts: false,
    });

    if (!draw.ok) {
      console.error(`DRAW_FAIL ${c.lg}`, draw.error?.code, draw.error?.message);
      results.push({
        id: c.id,
        lg: c.lg,
        title: c.title,
        draftId: "",
        imageUrls: [],
        pngPaths: [],
        pngOk: 0,
        drawOk: false,
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
        // remote bg fallback — download
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

    const draft = await postDraft({
      title: c.title,
      imageUrls,
      payload: {
        wave: "W-2026-10-15-sprint9-live-gen",
        round: 1,
        lg: c.lg,
        aesthetic: c.id,
        handoff: c.json,
        renderMode: draw.renderMode,
      },
    });
    console.log(`DRAFT ${c.lg} ok=${draft.ok} id=${draft.id}`);

    results.push({
      id: c.id,
      lg: c.lg,
      title: c.title,
      draftId: draft.id,
      imageUrls,
      pngPaths,
      pngOk: pngPaths.length,
      drawOk: true,
      renderMode: draw.renderMode,
      error: draft.ok ? undefined : "draft_persist_failed",
    });
  }

  const allNine =
    results.reduce((n, r) => n + r.pngOk, 0) === 9 &&
    results.every((r) => r.drawOk && r.draftId && r.pngOk === 3);

  const lines: string[] = [
    "# Round-1 report — LIVE-GEN C-live-gen-01",
    "",
    `**Date:** ${new Date().toISOString()}`,
    `**Aggregator key:** present`,
    `**API:** ${API_BASE}`,
    `**Actor:** \`${USER_ID}\``,
    `**PNG deliverable:** **${results.reduce((n, r) => n + r.pngOk, 0)} / 9**`,
    `**All 9 images exist:** **${allNine ? "YES" : "NO"}**`,
    "",
    "## Drafts",
    "",
    "| LG | Title | Draft ID | PNG | URLs |",
    "|----|-------|----------|-----|------|",
  ];

  for (const r of results) {
    lines.push(
      `| ${r.lg} | ${r.title} | \`${r.draftId || "—"}\` | ${r.pngOk}/3 | ${r.imageUrls.map((u) => `\`${u}\``).join("<br>") || r.error || "—"} |`,
    );
  }

  lines.push("", "## Artifact copies (Client Read)", "");
  for (const r of results) {
    lines.push(`### ${r.lg} → \`artifacts/round-1/${r.id}/\``);
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
    "## Handoff JSON",
    "",
    "- `handoff-json/LG-A.json`",
    "- `handoff-json/LG-B.json`",
    "- `handoff-json/LG-C.json`",
    "",
    "## Notes",
    "",
    "- Topics: Vernatun coffee / community / heritage only.",
    "- Aesthetics matched refs A clean orange-white / B dark cinematic orange / C black-yellow tips — brands not copied.",
    "- No social publish. Shell untouched.",
    `- Budget hard stop at 9 PNG (script gate). Actual count: ${results.reduce((n, r) => n + r.pngOk, 0)}.`,
  );

  await writeFile(path.join(WAVE, "round-1-report.md"), lines.join("\n"), "utf8");
  console.log("\nREPORT written", path.join(WAVE, "round-1-report.md"));
  console.log(
    JSON.stringify(
      {
        allNine,
        drafts: results.map((r) => ({
          title: r.title,
          id: r.draftId,
          pngOk: r.pngOk,
        })),
      },
      null,
      2,
    ),
  );

  process.exit(allNine ? 0 : 2);
}

main().catch((e) => {
  console.error("LIVE_GEN_FATAL", e instanceof Error ? e.message : e);
  process.exit(1);
});
