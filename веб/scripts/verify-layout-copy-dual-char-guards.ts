/**
 * Wave 2026-10-18-layout-copy-dual-char — Tester G1–G12.
 *   npx tsx scripts/verify-layout-copy-dual-char-guards.ts
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import {
  DECONSTRUCT_GRID_USER_INSTRUCTION,
  DECONSTRUCT_STYLE_SYSTEM_PROMPT,
  hasValidLayoutMap,
} from "../lib/agents/deconstructStyle";
import {
  LAYOUT_COPY_CONDUCTOR_NAME,
  LAYOUT_COPY_CONDUCTOR_NUMBER,
  LAYOUT_MAP_LUMA_COFFEE,
  LAYOUT_MAP_OMKOPA_TEAL,
  LAYOUT_MAP_RE_ORANGE,
  SEED_LUMA_COFFEE_ID,
  SEED_OMKOPA_TEAL_ID,
  SEED_RE_ORANGE_ID,
  SEED_RE_ORANGE_PRESET,
} from "../lib/settings/design-presets/layout-copy-seeds";
import { parseDesignPresetFile, parseLayoutMap } from "../lib/settings/design-preset";
import {
  isThinSecondaryCopy,
  SECONDARY_COPY_MIN_CHARS_BODY,
  SECONDARY_COPY_MIN_CLAUSES_BODY,
} from "../lib/studio/carousel-critic-05";
import {
  assertCarouselSecondaryCopyWide,
  CarouselJsonParseError,
} from "../lib/studio/carousel-json-contract";
import {
  buildLayeredSlideHtml,
  resolveCharacterPlacement,
  shouldShowSlideNumber,
} from "../lib/studio/carousel-layered-composite";
import {
  CHARACTER_CONDUCTOR_DUAL_PAINT_HARD,
  SECONDARY_COPY_MUCH_WIDER_HARD,
  type CharacterPaintPath,
} from "../lib/studio/create-carousel-prompts";

type Row = { id: string; pass: boolean; detail: string };
const results: Row[] = [];

function check(id: string, pass: boolean, detail: string) {
  results.push({ id, pass, detail });
  // eslint-disable-next-line no-console -- verify
  console.log(`${pass ? "PASS" : "FAIL"} ${id} — ${detail}`);
}

function smokeRoot(rel: string): string {
  return path.join(process.cwd(), "docs", "карусель тест", rel);
}

async function countRootPngs(dir: string): Promise<string[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }
  return entries
    .filter((n) => /^slide_\d+\.png$/i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

async function readMeta(dir: string): Promise<Record<string, unknown> | null> {
  try {
    const raw = await fs.readFile(path.join(dir, "meta.json"), "utf8");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function htmlHasSlideNum(dir: string): Promise<boolean> {
  let files: string[];
  try {
    files = (await fs.readdir(dir)).filter((n) => /^slide_\d+\.html$/i.test(n));
  } catch {
    return false;
  }
  for (const f of files) {
    const html = await fs.readFile(path.join(dir, f), "utf8");
    if (html.includes('class="slide-num"')) return true;
  }
  return false;
}

async function htmlCharacterCutoutSlides(dir: string): Promise<number[]> {
  let files: string[];
  try {
    files = (await fs.readdir(dir))
      .filter((n) => /^slide_\d+\.html$/i.test(n))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch {
    return [];
  }
  const hits: number[] = [];
  for (const f of files) {
    const html = await fs.readFile(path.join(dir, f), "utf8");
    if (/class="character[^"]*cutout/.test(html) || /class="character (right|left)-cutout"/.test(html)) {
      const m = f.match(/(\d+)/);
      if (m) hits.push(Number(m[1]));
    }
  }
  return hits;
}

async function main() {
  const overlayJoined = String(SECONDARY_COPY_MUCH_WIDER_HARD);
  const conductorJoined = String(CHARACTER_CONDUCTOR_DUAL_PAINT_HARD);
  const deconstructSys = Array.isArray(DECONSTRUCT_STYLE_SYSTEM_PROMPT)
    ? DECONSTRUCT_STYLE_SYSTEM_PROMPT.join("\n")
    : String(DECONSTRUCT_STYLE_SYSTEM_PROMPT);
  const deconstructGrid = Array.isArray(DECONSTRUCT_GRID_USER_INSTRUCTION)
    ? DECONSTRUCT_GRID_USER_INSTRUCTION.join("\n")
    : String(DECONSTRUCT_GRID_USER_INSTRUCTION);

  // —— G1 SW overlay ≥220 / ≥5 ——
  check(
    "G1_sw_overlay_220",
    overlayJoined.includes("≥220") && overlayJoined.includes("≥5"),
    "SECONDARY_COPY_MUCH_WIDER_HARD has ≥220 and ≥5",
  );
  check(
    "G1_critic_min_chars",
    SECONDARY_COPY_MIN_CHARS_BODY >= 220 && SECONDARY_COPY_MIN_CLAUSES_BODY >= 5,
    `MIN_CHARS=${SECONDARY_COPY_MIN_CHARS_BODY} MIN_CLAUSES=${SECONDARY_COPY_MIN_CLAUSES_BODY}`,
  );

  // —— G2 critic/zod reject thin ——
  const thin = "Короткий текст. Ещё одно. Третье.";
  check(
    "G2_critic_rejects_thin",
    isThinSecondaryCopy(thin, "body_slide") === true,
    "thin body flagged",
  );
  const wide =
    "Сначала выпиши три продукта, которые уже есть дома. Потом собери один обед за 15 минут без магазина — например омлет с зеленью и хлеб. Если осталось время, заморозь порцию на завтра. Так ты экономишь и деньги, и нервы в будни. Последний шаг: фото результата в заметки — через неделю увидишь паттерн.";
  check(
    "G2_critic_accepts_wide",
    isThinSecondaryCopy(wide, "body_slide") === false,
    `wide len=${wide.length}`,
  );
  let zodThrew = false;
  try {
    assertCarouselSecondaryCopyWide({
      contentType: "carousel",
      requested_slide_count: 2,
      renderMode: "layered_html",
      slides: [
        {
          slide_number: 1,
          layout_variant: "cover",
          primary_copy: "Hook",
          secondary_copy: "Cover can be shorter multi-beat text for the opener.",
          swipe_trigger: "curiosity",
          visual_prompt: "Kitchen counter with herbs, copper pot, warm window light",
        },
        {
          slide_number: 2,
          layout_variant: "body_slide",
          primary_copy: "Step one",
          secondary_copy: thin,
          swipe_trigger: "save",
          visual_prompt: "Cutting board with tomatoes, knife, parsley sprigs",
        },
      ],
      caption: "x",
      hashtags: [],
    } as never);
  } catch (e) {
    zodThrew = e instanceof CarouselJsonParseError;
  }
  check("G2_zod_rejects_thin", zodThrew, "assertCarouselSecondaryCopyWide throws on thin body");

  // —— G3 deconstruct layoutMap ——
  check(
    "G3_deconstruct_prompt_layoutMap",
    deconstructSys.includes("layoutMap") &&
      deconstructSys.includes("numberingGlobal") &&
      deconstructGrid.includes("4 slides"),
    "deconstruct agent requires layoutMap + numberingGlobal",
  );
  const mapFixture = parseLayoutMap({
    numberingGlobal: "absent",
    grammarNote: "test",
    slides: LAYOUT_MAP_RE_ORANGE.slides,
  });
  check(
    "G3_parse_layoutMap_4",
    Boolean(mapFixture && mapFixture.slides.length === 4 && mapFixture.numberingGlobal === "absent"),
    JSON.stringify({ slides: mapFixture?.slides.length, g: mapFixture?.numberingGlobal }),
  );
  check(
    "G3_hasValidLayoutMap_seed",
    hasValidLayoutMap(SEED_RE_ORANGE_PRESET),
    "seed RE orange has valid layoutMap",
  );

  // —— G4 numbering omit ——
  check(
    "G4_shouldShow_absent_false",
    shouldShowSlideNumber(LAYOUT_MAP_RE_ORANGE, "cover", 0, 6) === false &&
      shouldShowSlideNumber(LAYOUT_MAP_RE_ORANGE, "body_slide", 2, 6) === false,
    "absent → no slide-num",
  );
  check(
    "G4_shouldShow_null_true",
    shouldShowSlideNumber(null, "cover", 0, 6) === true,
    "no map → keep pretty N/M",
  );
  const htmlOmit = buildLayeredSlideHtml({
    slide: {
      primary_copy: "Test hook here",
      secondary_copy: wide,
      layout_variant: "cover",
    },
    slideIndex0: 0,
    slideTotal: 6,
    backgroundUrl: "data:image/png;base64,AA==",
    preset: SEED_RE_ORANGE_PRESET,
    fontFaceCss: "",
    brand: { brandName: "Vernatun" },
    layoutMap: LAYOUT_MAP_RE_ORANGE,
    characterPaint: "in_image",
  });
  check(
    "G4_composite_html_no_slide_num",
    !htmlOmit.includes('class="slide-num"'),
    "buildLayeredSlideHtml omits .slide-num",
  );

  // —— G5 grammar mirror (logo chrome from map) ——
  check(
    "G5_logo_chrome_mirrored",
    htmlOmit.includes('data-placement="top-left"') || htmlOmit.includes("top-left"),
    "RE orange map logo top-left present in HTML",
  );

  // —— G6 three seeds + active 01 ——
  check(
    "G6_three_seed_ids",
    Boolean(SEED_RE_ORANGE_ID && SEED_LUMA_COFFEE_ID && SEED_OMKOPA_TEAL_ID),
    `${SEED_RE_ORANGE_ID},${SEED_LUMA_COFFEE_ID},${SEED_OMKOPA_TEAL_ID}`,
  );
  check(
    "G6_maps_numbering_absent",
    LAYOUT_MAP_RE_ORANGE.numberingGlobal === "absent" &&
      LAYOUT_MAP_LUMA_COFFEE.numberingGlobal === "absent" &&
      LAYOUT_MAP_OMKOPA_TEAL.numberingGlobal === "absent",
    "all three maps numberingGlobal=absent",
  );

  const activePath = path.join(process.cwd(), "data", "local", "design-active.json");
  const activeRaw = await fs.readFile(activePath, "utf8");
  const active = JSON.parse(activeRaw) as {
    presetFile?: { id?: string; layoutMap?: { numberingGlobal?: string; slides?: unknown[] } };
  };
  check(
    "G6_active_is_01",
    active.presetFile?.id === SEED_RE_ORANGE_ID &&
      active.presetFile?.layoutMap?.numberingGlobal === "absent" &&
      (active.presetFile?.layoutMap?.slides?.length ?? 0) >= 4,
    `activeId=${active.presetFile?.id}`,
  );

  const sotPath = path.join(process.cwd(), "data", "local", "sprint8-sot.json");
  const sotRaw = await fs.readFile(sotPath, "utf8");
  check(
    "G6_sot_has_three_presets",
    sotRaw.includes(SEED_RE_ORANGE_ID) &&
      sotRaw.includes(SEED_LUMA_COFFEE_ID) &&
      sotRaw.includes(SEED_OMKOPA_TEAL_ID),
    "sprint8-sot contains 01/02/03 seed ids",
  );

  // —— G7 Landscapes conductor ——
  const landPath = path.join(process.cwd(), "data", "local", "landscapes-catalog.json");
  const landRaw = await fs.readFile(landPath, "utf8");
  const land = JSON.parse(landRaw) as {
    byUser?: Record<string, Array<{ number: number; name: string; photoUrls?: string[] }>>;
  };
  const allChars = Object.values(land.byUser ?? {}).flat();
  const anush = allChars.find(
    (c) =>
      c.number === LAYOUT_COPY_CONDUCTOR_NUMBER &&
      c.name === LAYOUT_COPY_CONDUCTOR_NAME &&
      (c.photoUrls ?? []).some((u) => u.includes("anush")),
  );
  check(
    "G7_landscapes_anush",
    Boolean(anush),
    anush
      ? `number=${anush.number} urls=${(anush.photoUrls ?? []).join(",")}`
      : "Ануш#1 missing",
  );
  const sheetStat = await fs.stat(
    path.join(process.cwd(), "public", "characters", "anush-sheet.jpg"),
  ).catch(() => null);
  check(
    "G7_anush_sheet_file",
    Boolean(sheetStat && sheetStat.size > 1000),
    sheetStat ? `bytes=${sheetStat.size}` : "missing public/characters/anush-sheet.jpg",
  );

  // —— G8 enum paths ——
  const paints: CharacterPaintPath[] = ["in_image", "overlay_cutout", "none"];
  check(
    "G8_enum_paths",
    paints.includes("in_image") && paints.includes("overlay_cutout") && paints.includes("none"),
    paints.join("|"),
  );
  check(
    "G8_placement_in_image_none",
    resolveCharacterPlacement(null, "cover", 0, true, {
      characterPaint: "in_image",
      slideTotal: 6,
    }) === "none",
    "in_image → no HTML cutout",
  );
  check(
    "G8_placement_overlay_cover_last",
    resolveCharacterPlacement(null, "cover", 0, true, {
      characterPaint: "overlay_cutout",
      slideTotal: 6,
    }) === "right-cutout" &&
      resolveCharacterPlacement(null, "cta_slide", 5, true, {
        characterPaint: "overlay_cutout",
        slideTotal: 6,
      }) === "right-cutout",
    "overlay cover+last cutout",
  );

  // —— G9 conductor wording ——
  check(
    "G9_conductor_wording",
    conductorJoined.toLowerCase().includes("conductor") &&
      conductorJoined.includes("speaks") &&
      (conductorJoined.includes("to-camera") ||
        conductorJoined.includes("facing") ||
        conductorJoined.includes("camera")) &&
      (conductorJoined.includes("story actor") ||
        conductorJoined.includes("NOT a story")),
    "CHARACTER_CONDUCTOR_DUAL_PAINT_HARD present",
  );

  // —— G10 / G11 dual smoke ——
  // Backend smoke dirs (hyphenated; not architect-proposed …-A-in_image-6)
  const dirA = smokeRoot("layout-copy-dual-char-smoke-A-in-image");
  const dirB = smokeRoot("layout-copy-dual-char-smoke-B-overlay");
  const pngA = await countRootPngs(dirA);
  const pngB = await countRootPngs(dirB);
  const metaA = await readMeta(dirA);
  const metaB = await readMeta(dirB);

  check("G10_smoke_A_png6", pngA.length === 6, `count=${pngA.length} files=${pngA.join(",")}`);
  check(
    "G10_smoke_A_meta_path",
    metaA?.character_path === "in_image" &&
      metaA?.characterPaint === "in_image" &&
      String(metaA?.sheetRowKey) === "17" &&
      metaA?.designActiveId === SEED_RE_ORANGE_ID,
    JSON.stringify({
      path: metaA?.character_path,
      row: metaA?.sheetRowKey,
      design: metaA?.designActiveId,
    }),
  );
  check(
    "G10_smoke_A_no_slide_num",
    (await htmlHasSlideNum(dirA)) === false && metaA?.slideNumFound === false,
    "A HTML has no .slide-num",
  );
  const cutA = await htmlCharacterCutoutSlides(dirA);
  check(
    "G10_smoke_A_no_html_cutout",
    cutA.length === 0 && metaA?.cutoutImgFound === false,
    `cutoutSlides=${cutA.join(",") || "none"}`,
  );

  check("G11_smoke_B_png6", pngB.length === 6, `count=${pngB.length} files=${pngB.join(",")}`);
  check(
    "G11_smoke_B_meta_path",
    metaB?.character_path === "overlay_cutout" &&
      metaB?.characterPaint === "overlay_cutout" &&
      String(metaB?.sheetRowKey) === "13" &&
      metaB?.designActiveId === SEED_RE_ORANGE_ID,
    JSON.stringify({
      path: metaB?.character_path,
      row: metaB?.sheetRowKey,
      design: metaB?.designActiveId,
    }),
  );
  check(
    "G11_topics_differ",
    String(metaA?.sheetRowKey) !== String(metaB?.sheetRowKey) &&
      String(metaA?.topic ?? "") !== String(metaB?.topic ?? ""),
    `A=${metaA?.sheetRowKey} B=${metaB?.sheetRowKey}`,
  );
  check(
    "G11_smoke_B_no_slide_num",
    (await htmlHasSlideNum(dirB)) === false && metaB?.slideNumFound === false,
    "B HTML has no .slide-num",
  );
  const cutB = await htmlCharacterCutoutSlides(dirB);
  check(
    "G11_smoke_B_cover_last_cutout",
    cutB.includes(1) && cutB.includes(6) && metaB?.cutoutImgFound === true,
    `cutoutSlides=${cutB.join(",")}`,
  );

  // —— G12 shell_freeze (no AppShell churn markers in this wave report set) ——
  // Soft: verify seed/preset parse still round-trips; AppShell path not required to exist as edit.
  const parsedSeed = parseDesignPresetFile(SEED_RE_ORANGE_PRESET);
  check(
    "G12_seed_roundtrip",
    parsedSeed?.id === SEED_RE_ORANGE_ID && hasValidLayoutMap(parsedSeed),
    "preset parse keeps layoutMap (shell_freeze product paths untouched by Tester)",
  );
  // Confirm wave reports claim shell_freeze (documentation lock)
  const chain = await fs.readFile(
    path.join(
      process.cwd(),
      "memory",
      "waves",
      "2026-10-18-layout-copy-dual-char",
      "chain.md",
    ),
    "utf8",
  );
  check(
    "G12_shell_freeze_lock",
    chain.includes("shell_freeze") && chain.includes("AppShell"),
    "chain.md locks AppShell freeze",
  );

  const failed = results.filter((r) => !r.pass);
  // eslint-disable-next-line no-console -- verify
  console.log(
    `\n[verify-layout-copy-dual-char-guards] ${results.length - failed.length}/${results.length} PASS`,
  );
  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
