/**
 * Colors ONLY from Design MD / preset. Keep panel↔ink contrast so body copy is
 * never white-on-white when a dark-text preset lands on a dark slide.
 */

export type DesignColors = {
  panel: string;
  ink: string;
  accent: string;
  pageBg: string;
};

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.trim().replace("#", "");
  if (/^[0-9a-fA-F]{3}$/.test(h)) {
    return {
      r: parseInt(h[0]! + h[0]!, 16),
      g: parseInt(h[1]! + h[1]!, 16),
      b: parseInt(h[2]! + h[2]!, 16),
    };
  }
  if (/^[0-9a-fA-F]{6}$/.test(h)) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  return null;
}

/** Relative luminance 0..1 (sRGB). */
export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0.5;
  const lin = [rgb.r, rgb.g, rgb.b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
}

export function contrastRatio(a: string, b: string): number {
  const L1 = relativeLuminance(a);
  const L2 = relativeLuminance(b);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Ensure panel text is readable. Prefer design ink when contrast ≥ 3.
 * Otherwise pick near-black or near-white opposite the panel (still using design hues for accent/pageBg).
 */
export function ensureReadableDesignColors(raw: DesignColors): DesignColors {
  const panel = raw.panel || "#f4f0e9";
  const accent = raw.accent || "#e66e3e";
  const pageBg = raw.pageBg || panel;
  let ink = raw.ink || "#171513";

  if (contrastRatio(panel, ink) < 3) {
    // Panel is light → dark ink; panel is dark → light ink
    ink = relativeLuminance(panel) > 0.55 ? "#171513" : "#F7F4EF";
  }

  // Border/brand must not match panel (invisible edges)
  if (contrastRatio(panel, ink) < 3) {
    ink = relativeLuminance(panel) > 0.5 ? "#12110F" : "#FFFFFF";
  }

  return { panel, ink, accent, pageBg };
}

export function colorsNoteFrom(c: DesignColors): string {
  return `panel=${c.panel}; ink=${c.ink}; accent=${c.accent}; pageBg=${c.pageBg}`;
}

/** Stable audit hash for Design colors (written to brief/summary). */
export function designColorsHash(c: DesignColors): string {
  const norm = (x: string) => (x || "").trim().toLowerCase();
  return `panel=${norm(c.panel)}|ink=${norm(c.ink)}|accent=${norm(c.accent)}|bg=${norm(c.pageBg)}`;
}

export type DesignColorsAudit = {
  colors: DesignColors;
  hash: string;
  source: "active_design" | "default_vernatun_preset";
};
