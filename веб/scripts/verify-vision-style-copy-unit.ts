/**
 * Quick unit checks for vision style-copy Backend wire (no LLM burn).
 *   npx tsx scripts/verify-vision-style-copy-unit.ts
 */

import { existsSync } from "node:fs";
import path from "node:path";

import { resolveBgFitCss } from "../lib/studio/carousel-layered-composite";
import type { HtmlLayout } from "../lib/studio/carousel-json-contract";
import {
  DEFAULT_STYLE_COPY_PACK_ID,
  mapSlideToRefSlot,
  resolveStyleCopyPackGridPath,
  resolveStyleCopySlots,
} from "../lib/studio/style-copy-slots";
import { assertVisionRefPromptBanClean } from "../lib/studio/create-carousel-prompts";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const map6 = [1, 2, 3, 4, 5, 6].map((i) => mapSlideToRefSlot(i, 6));
  assert(
    map6.join(",") === "cover,midA,midB,midA,midB,cta",
    `slot map N=6 got ${map6.join(",")}`,
  );

  const grid = resolveStyleCopyPackGridPath({
    packId: DEFAULT_STYLE_COPY_PACK_ID,
  });
  assert(existsSync(grid), `missing pack grid: ${grid}`);

  const { slots, packId } = await resolveStyleCopySlots({
    packId: "re_orange_01",
  });
  assert(packId === "re_orange_01", "pack id");
  for (const id of ["cover", "midA", "midB", "cta"] as const) {
    const p = slots[id].kind === "path" ? slots[id].path : "";
    assert(Boolean(p && existsSync(p)), `slot ${id} missing: ${p}`);
  }

  const coverCss = resolveBgFitCss(
    { bgFit: "cover" } as HtmlLayout,
    "bg.png",
  );
  assert(coverCss.mode === "cover", "cover mode");
  assert(coverCss.css.includes("background-size: cover"), "cover css");

  const containCss = resolveBgFitCss(
    { bgFit: "contain" } as HtmlLayout,
    "bg.png",
  );
  assert(containCss.mode === "contain", "contain mode");
  assert(containCss.css.includes("background-size: contain"), "contain css");

  const maskCss = resolveBgFitCss(
    {
      bgFit: "mask",
      photoZone: { x: 0.1, y: 0.1, w: 0.8, h: 0.5 },
    } as HtmlLayout,
    "bg.png",
  );
  assert(maskCss.mode === "mask", "mask mode");
  assert(maskCss.css.includes(".bg-photo"), "mask photo zone");
  assert(!maskCss.css.includes("background-size: cover;\n  background-position: center;\n}"), "mask not identical forced cover-only");

  const clean = assertVisionRefPromptBanClean(
    "VISION STYLE-COPY HARD-COPY composition zones hierarchy",
  );
  assert(clean.ok, "ban clean sample");
  const dirty = assertVisionRefPromptBanClean("FULL DESIGN TOKEN CARD Manrope");
  assert(!dirty.ok, "ban dirty sample");

  // eslint-disable-next-line no-console -- unit
  console.log("[verify-vision-style-copy-unit] OK", {
    map6,
    slotCache: path.dirname(
      slots.cover.kind === "path" ? slots.cover.path : "",
    ),
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console -- unit
  console.error("[verify-vision-style-copy-unit] FAIL", err);
  process.exitCode = 1;
});
