/**
 * Server-only: reads brand-lock from disk.
 * Never import from Client Components / Studio tiles — use `@/modules/manifests` for UI.
 * (No `server-only` package import: breaks `tsx` smokes; Next client guard = manifests split.)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface BrandContextSnippet {
  /** Absolute or cwd-relative path that was read (or attempted). */
  path: string;
  /** First ~2KB of brand-lock markdown (no secrets expected). */
  excerpt: string;
  /** True when file was readable. */
  loaded: boolean;
}

const DEFAULT_REL = join("workers", "_shared", "brand-lock.md");

/**
 * Read club brand-lock as plain text for adapter meta / feedbackLogs.
 * Never writes; never touches secrets. Failures → empty excerpt + loaded:false.
 */
export function loadBrandContext(
  relativePath: string = DEFAULT_REL,
): BrandContextSnippet {
  const path = join(process.cwd(), relativePath);
  try {
    const raw = readFileSync(path, "utf8");
    const excerpt = raw.slice(0, 2048);
    return { path: relativePath, excerpt, loaded: true };
  } catch {
    return { path: relativePath, excerpt: "", loaded: false };
  }
}

/** Short lock id for feedbackLogs (version line if present). */
export function brandLockFeedback(ctx: BrandContextSnippet): string {
  if (!ctx.loaded) return "brand_lock=missing";
  const ver = ctx.excerpt.match(/brandbook[_\s-]?version[:\s]+([^\s\n]+)/i);
  return ver ? `brand_lock=ok;version=${ver[1]}` : "brand_lock=ok";
}
