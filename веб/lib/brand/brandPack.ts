/**
 * C-33 — Client-safe Brand Kit constants (no fs / Node APIs).
 * Used by Razbor pipeline in the browser; server loadBrandKit enriches DESIGN.md.
 */

import type { BrandKit } from "@/lib/brand/types";

export const BRAND_LOGO_URL = "/brand/vernatun-logo.svg";
export const BRAND_NAME = "Vernatun";

/** Stitch Atelier Synth / Vernatun product accents. */
export const BRAND_PALETTE: Record<string, string> = {
  primary: "#C25E28",
  secondary: "#E6B25A",
  tertiary: "#2A5A84",
  cognac: "#C25E28",
  "sun-gold": "#E6B25A",
  canvas: "#08090B",
  surface: "#0D0F12",
  "surface-layer-2": "#14171C",
  "on-surface": "#E2E2E6",
  outline: "#A48C81",
  "accent-terracotta": "#C86446",
  "accent-gold": "#D4A359",
  background: "#111317",
};

export const BRAND_VOICE: string[] = [
  "Sovereign, razor-sharp, disciplined — instrument-grade, not consumer-AI playful.",
  "Obsidian architectural base with cognac & sun-gold embers.",
  "Logo on cover + finale; glass cards; warm gold accents.",
];

/** Sync brand pack for Designer / draft slides (browser-safe). */
export function getBrandPack(): BrandKit {
  return {
    logoUrl: BRAND_LOGO_URL,
    name: BRAND_NAME,
    palette: { ...BRAND_PALETTE },
    typography: {
      display: "Plus Jakarta Sans",
      body: "Plus Jakarta Sans / Century Gothic (product shell)",
      mono: "JetBrains Mono",
    },
    designMarkdown: "",
    voice: [...BRAND_VOICE],
  };
}

export function brandKitAgentNote(kit?: BrandKit): string {
  const b = kit ?? getBrandPack();
  const primary = b.palette.cognac ?? b.palette.primary ?? "#C25E28";
  const gold = b.palette["sun-gold"] ?? b.palette.secondary ?? "#E6B25A";
  return `Brand Kit: ${b.name} · logo ${b.logoUrl} · cognac ${primary} · gold ${gold}`;
}
