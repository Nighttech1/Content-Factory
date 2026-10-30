/**
 * C-33 — Server Brand Kit loader (reads docs/DESIGN.md).
 * Do NOT import from Client Components — use `brandPack` instead.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import {
  BRAND_LOGO_URL,
  BRAND_NAME,
  BRAND_PALETTE,
  BRAND_VOICE,
  brandKitAgentNote,
  getBrandPack,
} from "@/lib/brand/brandPack";
import type { BrandKit } from "@/lib/brand/types";

export type { BrandKit, BrandKitTypography } from "@/lib/brand/types";
export { brandKitAgentNote, getBrandPack } from "@/lib/brand/brandPack";

function designPath(): string {
  return join(process.cwd(), "docs", "DESIGN.md");
}

/** Parse YAML-ish frontmatter color map from stitch DESIGN.md. */
function parsePaletteFromFrontmatter(raw: string): Record<string, string> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { ...BRAND_PALETTE };

  const block = match[1];
  const palette: Record<string, string> = { ...BRAND_PALETTE };
  let inColors = false;

  for (const line of block.split(/\r?\n/)) {
    if (/^colors:\s*$/.test(line)) {
      inColors = true;
      continue;
    }
    if (inColors) {
      if (/^[a-zA-Z]/.test(line) && !/^\s/.test(line)) {
        inColors = false;
        continue;
      }
      const m = line.match(/^\s+([a-z0-9-]+):\s*'?(#[0-9A-Fa-f]{3,8})'?/);
      if (m) {
        palette[m[1]] = m[2];
      }
    }
  }

  if (!palette.cognac) palette.cognac = "#C25E28";
  if (!palette["sun-gold"]) palette["sun-gold"] = "#E6B25A";

  return palette;
}

function stripFrontmatter(raw: string): string {
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim();
}

function extractVoice(body: string): string[] {
  const voice: string[] = [];
  const impression = body.match(/\*\*The Impression:\*\*\s*([^\n]+)/i);
  if (impression?.[1]) voice.push(impression[1].trim());

  const cognac = body.match(/\*\*Cognac & Sun Gold Embers:\*\*\s*([^\n]+)/i);
  if (cognac?.[1]) voice.push(cognac[1].trim().slice(0, 220));

  return voice.length > 0 ? voice : [...BRAND_VOICE];
}

export type LoadBrandKitOptions = {
  /**
   * Active Settings Embla DESIGN.md (synced / body / header).
   * When set, replaces file body for designMarkdown + palette/voice parse.
   */
  designMarkdownOverride?: string | null;
};

/**
 * Load Vernatun Brand Kit (logo path, palette, DESIGN body).
 * Server-only. Safe fallbacks if DESIGN.md missing — never throws secrets.
 * Prefer active Settings override when Frontend synced it (C-settings-design-md-carousel).
 */
export function loadBrandKit(opts?: LoadBrandKitOptions): BrandKit {
  const override = opts?.designMarkdownOverride?.trim() ?? "";
  if (override) {
    const designMarkdown = stripFrontmatter(override);
    return {
      logoUrl: BRAND_LOGO_URL,
      name: BRAND_NAME,
      palette: parsePaletteFromFrontmatter(override),
      typography: {
        display: "Plus Jakarta Sans",
        body: "Plus Jakarta Sans / Century Gothic (product shell)",
        mono: "JetBrains Mono",
      },
      designMarkdown,
      voice: extractVoice(designMarkdown),
    };
  }

  const path = designPath();
  let raw = "";
  if (existsSync(path)) {
    try {
      raw = readFileSync(path, "utf8");
    } catch {
      raw = "";
    }
  }

  if (!raw) {
    const fallback = getBrandPack();
    fallback.designMarkdown = [
      "## Brand & Style",
      "",
      "Vernatun Brand Kit fallback — place `docs/DESIGN.md` from stitch atelier_synth.",
      "",
      `- Logo: ${BRAND_LOGO_URL}`,
      `- Primary cognac: ${BRAND_PALETTE.primary}`,
      `- Sun gold: ${BRAND_PALETTE.secondary}`,
    ].join("\n");
    return fallback;
  }

  const designMarkdown = stripFrontmatter(raw);

  return {
    logoUrl: BRAND_LOGO_URL,
    name: BRAND_NAME,
    palette: parsePaletteFromFrontmatter(raw),
    typography: {
      display: "Plus Jakarta Sans",
      body: "Plus Jakarta Sans / Century Gothic (product shell)",
      mono: "JetBrains Mono",
    },
    designMarkdown,
    voice: extractVoice(designMarkdown),
  };
}
