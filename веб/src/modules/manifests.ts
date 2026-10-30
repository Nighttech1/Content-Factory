/**
 * Client-safe module manifests only (no adapters, no node:fs).
 * Studio tiles / ModuleSelectorGrid must import from here — never from `registry.ts`.
 */

import type { ContentModuleManifest } from "@/types/module";
import { manifest as carouselEngine } from "@/modules/carousel-engine/manifest";
import { manifest as aestheticGraphics } from "@/modules/aesthetic-graphics/manifest";
import { manifest as cartoonReels } from "@/modules/cartoon-reels/manifest";
import { manifest as heygenReels } from "@/modules/heygen-reels/manifest";
import { manifest as siteArticles } from "@/modules/site-articles/manifest";
import { manifest as tgArticles } from "@/modules/tg-articles/manifest";

const CORE_MANIFESTS: readonly ContentModuleManifest[] = [
  carouselEngine,
  aestheticGraphics,
  cartoonReels,
  heygenReels,
  siteArticles,
  tgArticles,
];

/** Manifests for Studio tiles / Mesh hooks — isomorphic, no Node APIs. */
export function listManifests(): ContentModuleManifest[] {
  return CORE_MANIFESTS.slice();
}
