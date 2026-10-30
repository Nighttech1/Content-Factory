/**
 * Smoke C-33: Brand Kit logo + DESIGN + API loader + branded slide helpers.
 * C-51: Designer removed from Razbor cascade — brand wire via buildBrandedSlides /
 * buildCarouselDraft (non-cascade helpers), not designerMessages.
 *
 * Run: npx tsx scripts/smoke-c33-brand-kit.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { loadBrandKit, brandKitAgentNote } from "../lib/brand/loadBrandKit";
import { getFeedForModule } from "../lib/studio/feed-fixtures";
import {
  buildBrandedSlides,
  buildCarouselDraft,
  proposeScenario,
} from "../lib/studio/razbor-pipeline";

const ROOT = join(__dirname, "..");

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function assertAssets(): void {
  const logo = join(ROOT, "public/brand/vernatun-logo.svg");
  const design = join(ROOT, "docs/DESIGN.md");
  assert(existsSync(logo), "public/brand/vernatun-logo.svg missing");
  assert(existsSync(design), "docs/DESIGN.md missing");
  const svg = readFileSync(logo, "utf8");
  assert(svg.includes("<svg"), "logo must be SVG");
  assert(svg.toLowerCase().includes("vernatun"), "logo should say Vernatun");
  const md = readFileSync(design, "utf8");
  assert(md.includes("Brand & Style") || md.includes("Cognac"), "DESIGN content");
  console.log("SMOKE_C33_ASSETS_OK");
}

function assertLoader(): void {
  const kit = loadBrandKit();
  assert(kit.name === "Vernatun", "name Vernatun");
  assert(kit.logoUrl === "/brand/vernatun-logo.svg", "logoUrl path");
  assert(Object.keys(kit.palette).length > 0, "palette non-empty");
  assert(kit.designMarkdown.length > 100, "designMarkdown body");
  assert(!JSON.stringify(kit).includes("API_KEY"), "no secrets in kit");
  assert(!JSON.stringify(kit).includes("DATABASE_URL"), "no DB url in kit");
  assert(brandKitAgentNote(kit).includes(kit.logoUrl), "agent note has logo");
  console.log("SMOKE_C33_LOADER_OK");
}

function assertDesignerWire(): void {
  const feed = getFeedForModule("carousel-engine");
  assert(feed.competitors.length > 0, "need competitors");
  const post = feed.competitors[0];

  const slides = buildBrandedSlides(post);
  assert(slides.length >= 4, "branded slides");
  assert(
    slides[0].imageUrl === "/brand/vernatun-logo.svg" ||
      slides[0].brandLogoUrl === "/brand/vernatun-logo.svg",
    "cover uses brand logo",
  );
  const last = slides[slides.length - 1];
  assert(
    last.imageUrl === "/brand/vernatun-logo.svg" ||
      last.brandLogoUrl === "/brand/vernatun-logo.svg",
    "finale uses brand logo",
  );

  const draft = buildCarouselDraft(post, proposeScenario(post));
  assert(draft.brand?.logoUrl === "/brand/vernatun-logo.svg", "draft.brand.logoUrl");
  assert(draft.brand?.note.includes("Brand Kit"), "draft.brand.note");

  console.log("SMOKE_C33_DESIGNER_OK");
}

function assertPageSource(): void {
  const page = readFileSync(join(ROOT, "app/brand-kit/page.tsx"), "utf8");
  assert(page.includes("loadBrandKit"), "page uses loadBrandKit");
  assert(page.includes("designMarkdown") || page.includes("DESIGN.md"), "page shows DESIGN");
  const api = readFileSync(join(ROOT, "app/api/brand-kit/route.ts"), "utf8");
  assert(api.includes("loadBrandKit"), "API uses loadBrandKit");
  console.log("SMOKE_C33_UI_OK");
}

function main(): void {
  assertAssets();
  assertLoader();
  assertDesignerWire();
  assertPageSource();
  console.log("SMOKE_C33_PASS");
}

main();
