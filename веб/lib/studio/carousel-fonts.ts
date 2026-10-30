/**
 * S57 layered_html — resolve 3 DESIGN.md / preset font roles and ensure
 * local woff2 files under public/fonts/ for Puppeteer @font-face.
 * Never log secrets.
 */

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type { DesignPresetFile } from "@/lib/settings/design-preset";

export type CarouselFontRole = "title" | "body" | "content";

export type ResolvedCarouselFont = {
  role: CarouselFontRole;
  /** CSS family stack for font-family */
  cssFamily: string;
  /** Primary family name (e.g. "Cormorant Garamond") */
  familyName: string;
  /** Absolute path to local woff2 when available */
  localWoff2Path?: string;
  /** file:// URL for @font-face src */
  localWoff2Url?: string;
};

const FONTS_DIR = path.join(process.cwd(), "public", "fonts");

const GOOGLE_FAMILY_ALIASES: Record<string, string> = {
  manrope: "Manrope",
  "cormorant garamond": "Cormorant Garamond",
  "plus jakarta sans": "Plus Jakarta Sans",
  "noto sans armenian": "Noto Sans Armenian",
  "ibm plex mono": "IBM Plex Mono",
  "century gothic": "Montserrat", // closest free stand-in for Puppeteer
  inter: "Inter",
  "times new roman": "Cormorant Garamond",
  georgia: "Cormorant Garamond",
  system: "Manrope",
  "system-ui": "Manrope",
  serif: "Cormorant Garamond",
  "sans-serif": "Manrope",
  monospace: "IBM Plex Mono",
};

/** Extract first quoted or bare family token from a CSS font stack. */
export function extractPrimaryFontFamily(stack: string): string {
  const s = (stack ?? "").trim();
  if (!s) return "Manrope";
  const quoted = s.match(/["']([^"']+)["']/);
  if (quoted?.[1]?.trim()) return quoted[1].trim();
  const bare = s.split(",")[0]?.trim() ?? "Manrope";
  return bare.replace(/["']/g, "") || "Manrope";
}

function slugFamily(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveGoogleFamily(familyName: string): string | null {
  const key = familyName.trim().toLowerCase();
  if (GOOGLE_FAMILY_ALIASES[key]) return GOOGLE_FAMILY_ALIASES[key]!;
  // Reject generic CSS keywords
  if (
    /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-sans-serif|ui-serif)$/i.test(
      familyName,
    )
  ) {
    return null;
  }
  return familyName.trim();
}

/**
 * Parse 3 roles from preset typography (+ DESIGN.md hints).
 * title = display · body = body · content = armenianSafe || mono || body
 */
export function parseDesignFonts(
  preset: DesignPresetFile,
  designMd?: string,
): Record<CarouselFontRole, string> {
  const md = designMd ?? preset.designMd ?? "";
  const mdDisplay =
    md.match(/display\s*[:=]\s*["']?([^"'\n,]+)/i)?.[1]?.trim() ||
    md.match(/headline[-_]?xl[\s\S]{0,80}?fontFamily\s*:\s*([^\n]+)/i)?.[1]
      ?.trim() ||
    "";
  const mdBody =
    md.match(/\bbody\s*[:=]\s*["']?([^"'\n,]+)/i)?.[1]?.trim() ||
    md.match(/body[-_]?lg[\s\S]{0,80}?fontFamily\s*:\s*([^\n]+)/i)?.[1]
      ?.trim() ||
    "";
  const mdContent =
    md.match(/armenian\s*[:=]\s*["']?([^"'\n,]+)/i)?.[1]?.trim() ||
    md.match(/content\s*[:=]\s*["']?([^"'\n,]+)/i)?.[1]?.trim() ||
    "";

  const title =
    (preset.typography.display || mdDisplay || "Cormorant Garamond").trim();
  const body = (preset.typography.body || mdBody || "Manrope").trim();
  const content = (
    preset.typography.armenianSafe ||
    preset.typography.mono ||
    mdContent ||
    body
  ).trim();

  return { title, body, content };
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Download a Google Fonts woff2 into public/fonts/{slug}.woff2 when missing.
 * Best-effort — returns null path when network/family fails (CSS stack still works via CDN).
 */
export async function ensureFontWoff2(
  familyName: string,
): Promise<{ path?: string; url?: string; family: string }> {
  const google = resolveGoogleFamily(familyName);
  const family = google ?? "Manrope";
  const slug = slugFamily(family);
  const outPath = path.join(FONTS_DIR, `${slug}.woff2`);

  if (await fileExists(outPath)) {
    return {
      path: outPath,
      url: pathToFileURL(outPath).href,
      family,
    };
  }

  try {
    await mkdir(FONTS_DIR, { recursive: true });
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@400;500;600;700&display=swap`;
    const cssRes = await fetch(cssUrl, {
      headers: {
        // Desktop Chrome UA → woff2 urls
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!cssRes.ok) {
      return { family };
    }
    const css = await cssRes.text();
    const match = css.match(
      /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/i,
    );
    const woffUrl = match?.[1];
    if (!woffUrl) return { family };

    const bin = await fetch(woffUrl);
    if (!bin.ok) return { family };
    const buf = Buffer.from(await bin.arrayBuffer());
    if (buf.length < 64) return { family };
    await writeFile(outPath, buf);
    return {
      path: outPath,
      url: pathToFileURL(outPath).href,
      family,
    };
  } catch {
    return { family };
  }
}

/**
 * Ensure all 3 roles have local woff2 when possible; return resolved stacks + @font-face CSS.
 */
export async function ensureCarouselFonts(input: {
  preset: DesignPresetFile;
  designMd?: string;
}): Promise<{
  fonts: ResolvedCarouselFont[];
  fontFaceCss: string;
  cssVars: Record<string, string>;
}> {
  const stacks = parseDesignFonts(input.preset, input.designMd);
  const roles: CarouselFontRole[] = ["title", "body", "content"];
  const fonts: ResolvedCarouselFont[] = [];

  for (const role of roles) {
    const cssFamily = stacks[role];
    const familyName = extractPrimaryFontFamily(cssFamily);
    const ensured = await ensureFontWoff2(familyName);
    fonts.push({
      role,
      cssFamily,
      familyName: ensured.family,
      localWoff2Path: ensured.path,
      localWoff2Url: ensured.url,
    });
  }

  const faceBlocks = fonts
    .filter((f) => f.localWoff2Url)
    .map(
      (f) => `@font-face {
  font-family: "${f.familyName}";
  src: url("${f.localWoff2Url}") format("woff2");
  font-weight: 400 700;
  font-style: normal;
  font-display: block;
}`,
    )
    .join("\n");

  // CDN fallback when download failed
  const missing = fonts.filter((f) => !f.localWoff2Url);
  const importLine =
    missing.length > 0
      ? `@import url('https://fonts.googleapis.com/css2?${missing
          .map(
            (f) =>
              `family=${encodeURIComponent(f.familyName).replace(/%20/g, "+")}:wght@400;500;600;700`,
          )
          .join("&")}&display=swap');`
      : "";

  const cssVars: Record<string, string> = {
    "--cf-font-title": fonts[0]!.cssFamily.includes(fonts[0]!.familyName)
      ? fonts[0]!.cssFamily
      : `"${fonts[0]!.familyName}", ${fonts[0]!.cssFamily}`,
    "--cf-font-body": fonts[1]!.cssFamily.includes(fonts[1]!.familyName)
      ? fonts[1]!.cssFamily
      : `"${fonts[1]!.familyName}", ${fonts[1]!.cssFamily}`,
    "--cf-font-content": fonts[2]!.cssFamily.includes(fonts[2]!.familyName)
      ? fonts[2]!.cssFamily
      : `"${fonts[2]!.familyName}", ${fonts[2]!.cssFamily}`,
    "--cf-font-display": `var(--cf-font-title)`,
    "--cf-font-armenian": `var(--cf-font-content)`,
  };

  return {
    fonts,
    fontFaceCss: [importLine, faceBlocks].filter(Boolean).join("\n"),
    cssVars,
  };
}
