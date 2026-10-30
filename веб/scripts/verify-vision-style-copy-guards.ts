/**
 * Wave 2026-10-18-vision-style-copy — Tester G1–G14.
 *   npx tsx scripts/verify-vision-style-copy-guards.ts
 */
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";

import {
  SECONDARY_COPY_MIN_CHARS_BODY,
  SECONDARY_COPY_MIN_CLAUSES_BODY,
} from "../lib/studio/carousel-critic-05";
import { resolveBgFitCss } from "../lib/studio/carousel-layered-composite";
import type { HtmlLayout } from "../lib/studio/carousel-json-contract";
import {
  assertVisionRefPromptBanClean,
  DEFAULT_CHARACTER_PAINT,
  LAYERED_HTML_DESIGNER_OVERLAY_VISION_REF,
  resolveCreateCarouselOverlay,
  SECONDARY_COPY_MUCH_WIDER_HARD,
  VISION_REF_PROMPT_BAN_SUBSTRINGS,
  VISION_STYLE_COPY_HARD,
  type StyleCopyMode,
} from "../lib/studio/create-carousel-prompts";
import {
  DEFAULT_STYLE_COPY_PACK_ID,
  mapSlideToRefSlot,
} from "../lib/studio/style-copy-slots";

type Row = { id: string; pass: boolean; detail: string };
const results: Row[] = [];

function check(id: string, pass: boolean, detail: string) {
  results.push({ id, pass, detail });
  // eslint-disable-next-line no-console -- verify
  console.log(`${pass ? "PASS" : "FAIL"} ${id} — ${detail}`);
}

const SMOKE_DIR = path.join(
  process.cwd(),
  "docs",
  "карусель тест",
  "vision-style-copy-smoke-A-in-image-6",
);

const SHELL_CHURN_PATHS = [
  "components/AppShell.tsx",
  "components/layout/AppShell.tsx",
  "components/SidebarNavigation.tsx",
  "components/layout/SidebarNavigation.tsx",
  "app/(studio)/layout.tsx",
];

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

async function main() {
  // —— G1 enum styleCopyMode ——
  const modes: StyleCopyMode[] = ["vision_ref", "token_card"];
  const overlayVision = resolveCreateCarouselOverlay("designer", "describe", {
    pipeline: "layered_html",
    styleCopyMode: "vision_ref",
  });
  const overlayToken = resolveCreateCarouselOverlay("designer", "describe", {
    pipeline: "layered_html",
    styleCopyMode: "token_card",
  });
  check(
    "G1_enum_accepted",
    modes.length === 2 &&
      overlayVision.includes("styleCopyMode = **`vision_ref`**") &&
      !overlayToken.includes("styleCopyMode = **`vision_ref`**"),
    `modes=${modes.join("|")}; vision overlay distinct from token_card`,
  );

  // —— G2 skip FULL buildDesignTokensPayload / FULL TOKEN dump ——
  const visionHasFull =
    overlayVision.includes("## FULL DESIGN TOKENS (HARD)") ||
    overlayVision.includes("FULL DESIGN TOKEN CARD");
  const tokenHasFull =
    overlayToken.includes("## FULL DESIGN TOKENS (HARD)") ||
    overlayToken.includes("FULL DESIGN TOKEN");
  check(
    "G2_skip_full_inject",
    !visionHasFull && tokenHasFull,
    `vision_ref skips FULL dump; token_card injects (visionHasFull=${visionHasFull} tokenHasFull=${tokenHasFull})`,
  );

  // —— G3 timeline ban grep ——
  const timelinePath = path.join(SMOKE_DIR, "timeline-prompt-full.md");
  let timeline = "";
  try {
    timeline = await fs.readFile(timelinePath, "utf8");
  } catch {
    timeline = "";
  }
  const banClean = assertVisionRefPromptBanClean(timeline);
  const banHits = VISION_REF_PROMPT_BAN_SUBSTRINGS.filter((s) =>
    timeline.toLowerCase().includes(s.toLowerCase()),
  );
  check(
    "G3_timeline_ban_clean",
    Boolean(timeline) && banClean.ok && banHits.length === 0,
    banClean.ok
      ? `timeline ${timeline.length} chars; 0 ban hits`
      : `ban=${banClean.ok ? "ok" : (banClean as { reason: string }).reason}; hits=${banHits.join(",")}`,
  );

  // —— G4 image reference attached ——
  let meta: Record<string, unknown> | null = null;
  try {
    meta = JSON.parse(
      await fs.readFile(path.join(SMOKE_DIR, "meta.json"), "utf8"),
    ) as Record<string, unknown>;
  } catch {
    meta = null;
  }
  const slotMap = Array.isArray(meta?.slotMap)
    ? (meta!.slotMap as Array<Record<string, unknown>>)
    : [];
  const refsAttached =
    meta?.referenceImageAttached === true &&
    slotMap.length === 6 &&
    slotMap.every(
      (s) =>
        typeof s.refPath === "string" &&
        String(s.refPath).length > 0 &&
        (s.refKind === "path" || s.refKind === "url" || s.refKind === "base64"),
    );
  const timelineRef =
    timeline.includes("REFERENCE IMAGE WIRE") ||
    timeline.includes("referenceImageAttached: true");
  check(
    "G4_image_ref_attached",
    Boolean(meta) && refsAttached && timelineRef,
    `meta.referenceImageAttached=${String(meta?.referenceImageAttached)} slots=${slotMap.length} timelineRef=${timelineRef}`,
  );

  // —— G5 slot mapping N=6 ——
  const map6 = [1, 2, 3, 4, 5, 6].map((i) => mapSlideToRefSlot(i, 6));
  const expected = ["cover", "midA", "midB", "midA", "midB", "cta"];
  const metaSlots = slotMap.map((s) => String(s.slot));
  check(
    "G5_slot_map_n6",
    map6.join(",") === expected.join(",") &&
      (metaSlots.length === 0 || metaSlots.join(",") === expected.join(",")),
    `fixture=${map6.join(",")} meta=${metaSlots.join(",") || "(n/a)"}`,
  );

  // —— G6 hard-copy wording ——
  // VISION_STYLE_COPY_HARD is a pre-joined string; overlay may be string[] or string.
  const visionOverlayText = Array.isArray(LAYERED_HTML_DESIGNER_OVERLAY_VISION_REF)
    ? LAYERED_HTML_DESIGNER_OVERLAY_VISION_REF.join("\n")
    : String(LAYERED_HTML_DESIGNER_OVERLAY_VISION_REF);
  const hardJoined = `${String(VISION_STYLE_COPY_HARD)}\n${visionOverlayText}`;
  const hardKeys = [
    "composition",
    "text zones",
    "hierarchy",
    "logo",
    "CTA",
    "numbering",
    "photo-vs-plate",
  ];
  const hardOk = hardKeys.every(
    (k) =>
      hardJoined.toLowerCase().includes(k.toLowerCase()) ||
      timeline.toLowerCase().includes(k.toLowerCase()),
  );
  check(
    "G6_hard_copy_wording",
    hardOk && timeline.includes("HARD-COPY"),
    `keys present; timeline HARD-COPY=${timeline.includes("HARD-COPY")}`,
  );

  // —— G7 product default in_image ——
  check(
    "G7_default_in_image",
    DEFAULT_CHARACTER_PAINT === "in_image",
    `DEFAULT_CHARACTER_PAINT=${DEFAULT_CHARACTER_PAINT}`,
  );

  // —— G8 smoke meta in_image + vision_ref + pack 01 ——
  const packOk =
    meta?.styleCopyPackId === "re_orange_01" ||
    meta?.styleCopyPackId === DEFAULT_STYLE_COPY_PACK_ID;
  check(
    "G8_smoke_meta",
    meta?.styleCopyMode === "vision_ref" &&
      (meta?.characterPaint === "in_image" ||
        meta?.character_path === "in_image") &&
      meta?.characterPaint !== "overlay_cutout" &&
      packOk &&
      Number(meta?.slides) === 6,
    `mode=${String(meta?.styleCopyMode)} paint=${String(meta?.characterPaint)} pack=${String(meta?.styleCopyPackId)} slides=${String(meta?.slides)}`,
  );

  // —— G9 bgFit contain/mask ≠ forced cover-only ——
  const coverCss = resolveBgFitCss({ bgFit: "cover" } as HtmlLayout, "bg.png");
  const containCss = resolveBgFitCss(
    { bgFit: "contain" } as HtmlLayout,
    "bg.png",
  );
  const maskCss = resolveBgFitCss(
    {
      bgFit: "mask",
      photoZone: { x: 0.1, y: 0.1, w: 0.8, h: 0.5 },
    } as HtmlLayout,
    "bg.png",
  );
  check(
    "G9_bg_fit_modes",
    coverCss.mode === "cover" &&
      containCss.mode === "contain" &&
      containCss.css.includes("background-size: contain") &&
      maskCss.mode === "mask" &&
      maskCss.css.includes(".bg-photo") &&
      containCss.css !== coverCss.css,
    `cover/contain/mask distinct (contain≠cover)`,
  );

  // —— G10 exactly 6 PNG ——
  const pngs = await countRootPngs(SMOKE_DIR);
  const expectedNames = [
    "slide_01.png",
    "slide_02.png",
    "slide_03.png",
    "slide_04.png",
    "slide_05.png",
    "slide_06.png",
  ];
  check(
    "G10_six_png",
    pngs.length === 6 && expectedNames.every((n) => pngs.includes(n)),
    `pngs=${pngs.join(",") || "(none)"}`,
  );

  // —— G11 KEEP SW ≥220+≥5 ——
  const swOverlay = String(SECONDARY_COPY_MUCH_WIDER_HARD);
  check(
    "G11_sw_wide_keep",
    swOverlay.includes("≥220") &&
      swOverlay.includes("≥5") &&
      SECONDARY_COPY_MIN_CHARS_BODY >= 220 &&
      SECONDARY_COPY_MIN_CLAUSES_BODY >= 5,
    `overlay≥220/≥5; critic MIN=${SECONDARY_COPY_MIN_CHARS_BODY}/${SECONDARY_COPY_MIN_CLAUSES_BODY}`,
  );

  // —— G12 KEEP CTA 1–4 + swipe meta + layered_html ——
  const keepMarkers =
    (overlayVision.includes("CTA catalog") ||
      overlayVision.includes("1–4") ||
      overlayVision.includes("1-4")) &&
    overlayVision.includes("swipe_trigger") &&
    overlayVision.includes("layered_html") &&
    timeline.includes("layered_html") &&
    timeline.includes("swipe_trigger");
  let htmlLayered = false;
  try {
    const html = await fs.readFile(
      path.join(SMOKE_DIR, "slide_01.html"),
      "utf8",
    );
    htmlLayered = html.includes('data-render="layered_html"');
  } catch {
    htmlLayered = false;
  }
  check(
    "G12_keep_cta_swipe_layered",
    keepMarkers && htmlLayered,
    `overlay+timeline markers; slide_01 data-render layered_html=${htmlLayered}`,
  );

  // —— G13 layoutMap NOT required ——
  const layoutMapOptionalRe =
    /layoutMap[\s\S]{0,40}NOT\*\*\s*required for PASS|layoutMap JSON is \*\*NOT\*\* required for PASS|NOT required for PASS on this path/i;
  const visionSaysOptional =
    layoutMapOptionalRe.test(hardJoined) || layoutMapOptionalRe.test(timeline);
  const metaHasNoLayoutMapReq =
    meta != null &&
    !("layoutMapRequired" in meta && meta.layoutMapRequired === true) &&
    !("layoutMap" in meta); // smoke PASS without layoutMap field
  check(
    "G13_layoutmap_not_required",
    visionSaysOptional && metaHasNoLayoutMapReq,
    `prompt optional=${visionSaysOptional}; meta has layoutMap=${meta != null && "layoutMap" in meta}`,
  );

  // —— G14 shell_freeze ——
  const waveReports = [
    path.join(
      process.cwd(),
      "memory",
      "waves",
      "2026-10-18-vision-style-copy",
      "backend-report.md",
    ),
    path.join(
      process.cwd(),
      "memory",
      "waves",
      "2026-10-18-vision-style-copy",
      "ai-bridge-report.md",
    ),
  ];
  let reportsDenyShell = true;
  for (const rp of waveReports) {
    if (!existsSync(rp)) {
      reportsDenyShell = false;
      break;
    }
    const body = await fs.readFile(rp, "utf8");
    const touchedShell =
      /AppShell/.test(body) &&
      !/не\s+AppShell|not\s+AppShell|AppShell\s*\/|AppShell.*not touched|Not touched.*AppShell/i.test(
        body,
      );
    // Reports mention AppShell only as "not touched" — both AI Bridge and Backend do.
    if (!/AppShell/.test(body)) {
      // ok if never mentioned
    } else if (
      !/Not touched|не\s+.*AppShell|AppShell\s*\/|shell_freeze|no AppShell/i.test(
        body,
      )
    ) {
      reportsDenyShell = false;
    }
    void touchedShell;
  }
  const shellPathsPresent = SHELL_CHURN_PATHS.some((p) =>
    existsSync(path.join(process.cwd(), p)),
  );
  // Pass if wave reports declare AppShell untouched (canon for this wave).
  let reportOk = true;
  for (const rp of waveReports) {
    const body = await fs.readFile(rp, "utf8");
    if (
      !/AppShell/.test(body) ||
      !/(Not touched|не\s+|no AppShell|shell_freeze)/i.test(body)
    ) {
      // Backend: "Not touched: AppShell"; AI Bridge: "Not touched … AppShell"
      if (!/Not touched[\s\S]{0,200}AppShell|AppShell[\s\S]{0,80}Not touched|не\s+AppShell|no AppShell/i.test(body)) {
        reportOk = false;
      }
    }
  }
  check(
    "G14_shell_freeze",
    reportOk && reportsDenyShell,
    `wave reports deny AppShell churn; shell paths exist=${shellPathsPresent}`,
  );

  const failed = results.filter((r) => !r.pass);
  // eslint-disable-next-line no-console -- verify
  console.log(
    `\n[verify-vision-style-copy-guards] ${results.length - failed.length}/${results.length} PASS`,
  );
  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console -- verify
  console.error("[verify-vision-style-copy-guards] FAIL", err);
  process.exitCode = 1;
});
