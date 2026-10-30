/**
 * Build CorrectPipelinePlaceholders from Brand + Landscapes + Design.
 * Keeps palette extract local (no design-library client imports).
 */

import { formatCharacterCatalogJson, listLandscapes } from "@/lib/settings/landscapes-store";
import { getBrandSettings } from "@/lib/settings/brand-store";
import { readSyncedActiveDesign } from "@/lib/settings/design-active-server";
import {
  buildDesignTokensPayload,
  type DesignPresetFile,
} from "@/lib/settings/design-preset";
import type { CorrectPipelinePlaceholders } from "@/lib/studio/create-carousel-prompts";
import type { SheetMode } from "@/lib/intake/types";

/** FULL DESIGN role table for Designer inject (deconstruct → Embla → draw). */
function paletteJsonFromPreset(preset: DesignPresetFile): string {
  try {
    return JSON.stringify(buildDesignTokensPayload(preset));
  } catch {
    return JSON.stringify({
      id: preset.id,
      preset: preset.preset,
      name: preset.name,
      colors: preset.colors,
      typography: {
        display: preset.typography.display,
        body: preset.typography.body,
        mono: preset.typography.mono,
        armenianSafe: preset.typography.armenianSafe,
        scale: preset.typography.scale ?? null,
      },
      cssVarOverrides: preset.cssVarOverrides ?? {},
    });
  }
}

/**
 * Never inject base64 data-URLs into LLM system/user prompts (aggregator 400).
 * Keep a short descriptive stub for Scriptwriter / Designer text prompts.
 */
export function sanitizeLogoRefForLlm(raw: string | undefined | null): string {
  const ref = (raw ?? "").trim();
  if (!ref) return "";
  if (/^data:image\//i.test(ref)) {
    const mime = ref.slice(5, ref.indexOf(";")) || "image/png";
    return `[brand logo present as ${mime}; do not invent a different mark — keep brand consistent]`;
  }
  if (ref.length > 400) {
    return `${ref.slice(0, 200)}…[truncated ${ref.length} chars]`;
  }
  return ref;
}

export async function buildCorrectPlaceholders(opts: {
  userId: string;
  mode: SheetMode | string;
  hero?: number | null;
}): Promise<CorrectPipelinePlaceholders> {
  const brand = await getBrandSettings(opts.userId);
  const characters = await listLandscapes(opts.userId);
  const synced = await readSyncedActiveDesign();
  let designPaletteJson = "{}";
  if (synced?.presetFile) {
    try {
      designPaletteJson = paletteJsonFromPreset(synced.presetFile);
    } catch {
      designPaletteJson = "{}";
    }
  }

  const rawLogo = (brand.logoRef ?? "").trim();
  return {
    brandName: brand.brandName,
    /** Sanitized stub / short path for LLM prompts only — never for Puppeteer. */
    logoRef: sanitizeLogoRefForLlm(rawLogo),
    /** Raw Settings Brand logoRef for composite <img> (data URL / path / https). */
    logoRefRaw: rawLogo || undefined,
    designPaletteJson,
    characterCatalog: formatCharacterCatalogJson(characters, opts.hero),
    mode: opts.mode,
  };
}
