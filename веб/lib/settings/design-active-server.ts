/**
 * C-settings-design-md-carousel + C-visual-style-deconstructor —
 * server resolve for active DESIGN.md + DesignPresetFile.
 *
 * Embla library lives in browser localStorage (`cf.settings.design.library.v1`).
 * Server Brand Kit / draw cannot read localStorage — Frontend must either:
 *   1. POST /api/settings/design-active with active slot markdown + presetFile (sync), OR
 *   2. Pass `designMarkdown` / `presetFile` in draw / generate-slides body, OR
 *   3. Send header `x-cf-active-design-md` (short payloads only).
 *
 * Priority: body → header → synced file → null (caller falls back to docs/DESIGN.md).
 * Never logs full markdown into tickets; soft-fail on IO.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import {
  type DesignPresetFile,
  parseDesignPresetFile,
} from "@/lib/settings/design-preset";

export const ACTIVE_DESIGN_HEADER = "x-cf-active-design-md";
export const ACTIVE_DESIGN_COOKIE = "cf_settings_design_active_md";

const STORE_DIR = path.join(process.cwd(), "data", "local");
const STORE_FILE = path.join(STORE_DIR, "design-active.json");

/** Cap synced / header payload (~1.5MB) — soft reject larger. */
export const ACTIVE_DESIGN_MAX_CHARS = 1_500_000;

export type ActiveDesignStore = {
  markdown: string;
  name?: string;
  updatedAt: string;
  /** C-visual-style-deconstructor — companion typed preset for builder CSS vars. */
  presetFile?: DesignPresetFile;
};

function clampMarkdown(raw: string): string | null {
  const md = raw.trim();
  if (!md) return null;
  if (md.length > ACTIVE_DESIGN_MAX_CHARS) {
    return md.slice(0, ACTIVE_DESIGN_MAX_CHARS);
  }
  return md;
}

export async function readSyncedActiveDesign(): Promise<ActiveDesignStore | null> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as ActiveDesignStore;
    if (!parsed || typeof parsed.markdown !== "string") return null;
    const markdown = clampMarkdown(parsed.markdown);
    if (!markdown) return null;
    const presetFile = parseDesignPresetFile(parsed.presetFile);
    return {
      markdown,
      name:
        typeof parsed.name === "string" && parsed.name.trim()
          ? parsed.name.trim()
          : undefined,
      updatedAt:
        typeof parsed.updatedAt === "string" && parsed.updatedAt
          ? parsed.updatedAt
          : new Date(0).toISOString(),
      presetFile: presetFile ?? undefined,
    };
  } catch {
    return null;
  }
}

export async function writeSyncedActiveDesign(input: {
  markdown: string;
  name?: string;
  presetFile?: DesignPresetFile | null;
}): Promise<ActiveDesignStore | { error: string }> {
  const markdown = clampMarkdown(input.markdown);
  if (!markdown) return { error: "empty_markdown" };
  if (input.markdown.trim().length > ACTIVE_DESIGN_MAX_CHARS) {
    return { error: "markdown_too_large" };
  }

  const presetFile =
    input.presetFile === null
      ? undefined
      : parseDesignPresetFile(input.presetFile) ?? undefined;

  const store: ActiveDesignStore = {
    markdown,
    name: input.name?.trim() || undefined,
    updatedAt: new Date().toISOString(),
    ...(presetFile ? { presetFile } : {}),
  };

  try {
    await fs.mkdir(STORE_DIR, { recursive: true });
    await fs.writeFile(STORE_FILE, JSON.stringify(store), "utf8");
    return store;
  } catch {
    return { error: "write_failed" };
  }
}

export async function clearSyncedActiveDesign(): Promise<boolean> {
  try {
    await fs.unlink(STORE_FILE);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve active DESIGN.md for a request.
 * Does not read docs/DESIGN.md — callers use loadBrandKit when this returns null.
 */
export async function resolveActiveDesignMarkdown(opts: {
  bodyMarkdown?: string | null;
  headerMarkdown?: string | null;
  cookieMarkdown?: string | null;
}): Promise<string | null> {
  const fromBody = clampMarkdown(opts.bodyMarkdown ?? "");
  if (fromBody) return fromBody;

  const fromHeader = clampMarkdown(opts.headerMarkdown ?? "");
  if (fromHeader) return fromHeader;

  const fromCookie = clampMarkdown(opts.cookieMarkdown ?? "");
  if (fromCookie) return fromCookie;

  const synced = await readSyncedActiveDesign();
  return synced?.markdown ?? null;
}

/**
 * Resolve active DesignPresetFile: body → synced store.
 */
export async function resolveActiveDesignPreset(opts: {
  bodyPreset?: unknown;
}): Promise<DesignPresetFile | null> {
  const fromBody = parseDesignPresetFile(opts.bodyPreset);
  if (fromBody) return fromBody;
  const synced = await readSyncedActiveDesign();
  return synced?.presetFile ?? null;
}

/** Extract override from Request (header + cookie). Body caller passes separately. */
export function designMarkdownFromRequestHeaders(req: Request): {
  headerMarkdown: string | null;
  cookieMarkdown: string | null;
} {
  const headerMarkdown = req.headers.get(ACTIVE_DESIGN_HEADER);
  let cookieMarkdown: string | null = null;
  const cookie = req.headers.get("cookie") ?? "";
  if (cookie) {
    const match = cookie.match(
      new RegExp(`(?:(?:^|;\\s*)${ACTIVE_DESIGN_COOKIE}=([^;]*))`),
    );
    if (match?.[1]) {
      try {
        cookieMarkdown = decodeURIComponent(match[1]);
      } catch {
        cookieMarkdown = match[1];
      }
    }
  }
  return {
    headerMarkdown: headerMarkdown?.trim() ? headerMarkdown : null,
    cookieMarkdown: cookieMarkdown?.trim() ? cookieMarkdown : null,
  };
}

/** Truncate DESIGN.md for image-prompt injection (avoid token blow-up). */
export function excerptDesignForPrompt(
  markdown: string,
  maxChars = 1800,
): string {
  const trimmed = markdown.trim();
  if (!trimmed) return "";
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars)}\n…`;
}

/** Short CSS-var line for image prompts from active preset. */
export function excerptPresetForPrompt(
  preset: DesignPresetFile | null | undefined,
): string {
  if (!preset) return "";
  const c = preset.colors;
  return [
    `Active DesignPresetFile preset=${preset.preset} name=${preset.name}.`,
    `CSS vars: --cf-design-bg=${c.bg}; --cf-design-surface=${c.surface}; --cf-design-text=${c.text}; --cf-design-muted=${c.muted}; --cf-design-accent=${c.accent}.`,
    `Typography display=${preset.typography.display}; body=${preset.typography.body}.`,
  ].join(" ");
}
