/**
 * Settings Brand SoT — JSON under data/local/ (Phase 6).
 * Serves {{BRAND_NAME}} / {{LOGO_REF}} placeholders.
 *
 * logoRef may be:
 * - data:image/… (upload from Settings Brand panel)
 * - site path `/brand/….png` (or legacy `.svg`) under public/
 * - relative upload path `data/local/brand-logos/…` (resolvable on read)
 * - https URL
 */

import { existsSync, promises as fs } from "node:fs";
import path from "node:path";

const STORE_DIR = path.join(process.cwd(), "data", "local");
const STORE_FILE = path.join(STORE_DIR, "brand-settings.json");
const LOGO_UPLOAD_DIR = path.join(STORE_DIR, "brand-logos");

export type BrandSettings = {
  userId: string;
  brandName: string;
  logoRef: string;
  tagline?: string;
  extras?: Record<string, string>;
  updatedAt: string;
};

type BrandFile = {
  byUser: Record<string, BrandSettings>;
};

const DEFAULT_BRAND_NAME = "Vernatun";
/**
 * Brand store default logoRef (wordmark PNG kept for uploads / legacy).
 * Phase 2 composite Path A prefers `/brand/vernatun-emblem.png` + HTML wordmark
 * (`logo.textColor`) at render time — see carousel-html-renderer.
 */
/** Circular emblem used on Mode B chrome + Settings default. */
const DEFAULT_LOGO_REF = "/brand/apple-touch-icon.png";

function empty(): BrandFile {
  return { byUser: {} };
}

async function readFile(): Promise<BrandFile> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<BrandFile>;
    return { byUser: parsed.byUser ?? {} };
  } catch {
    return empty();
  }
}

async function writeFile(data: BrandFile): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2), "utf8");
}

export function defaultBrandSettings(userId: string): BrandSettings {
  return {
    userId,
    brandName: DEFAULT_BRAND_NAME,
    logoRef: DEFAULT_LOGO_REF,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Normalize stored logoRef so composite / API can load uploaded paths.
 * Keeps data: and https intact; rewrites relative files under public/ or brand-logos/.
 */
export function normalizeBrandLogoRef(raw: string | undefined | null): string {
  const ref = (raw ?? "").trim();
  if (!ref) return "";
  if (
    ref.startsWith("data:") ||
    ref.startsWith("http://") ||
    ref.startsWith("https://") ||
    ref.startsWith("file://")
  ) {
    return ref;
  }
  // Absolute filesystem path that exists
  if (path.isAbsolute(ref) && existsSync(ref)) {
    return ref;
  }
  // Site-relative under public/
  const publicRel = ref.startsWith("/") ? ref.slice(1) : ref;
  const publicAbs = path.join(process.cwd(), "public", publicRel);
  if (existsSync(publicAbs)) {
    return ref.startsWith("/") ? ref : `/${publicRel.replace(/\\/g, "/")}`;
  }
  // Uploaded under data/local/brand-logos/…
  const cwdAbs = path.isAbsolute(ref)
    ? ref
    : path.join(process.cwd(), ref.replace(/^\//, ""));
  if (existsSync(cwdAbs)) {
    // Prefer portable relative path from cwd for store
    const rel = path.relative(process.cwd(), cwdAbs).replace(/\\/g, "/");
    return rel.startsWith("..") ? cwdAbs : rel;
  }
  // brand-logos basename lookup
  const base = path.basename(ref);
  const uploadCandidate = path.join(LOGO_UPLOAD_DIR, base);
  if (existsSync(uploadCandidate)) {
    return path
      .relative(process.cwd(), uploadCandidate)
      .replace(/\\/g, "/");
  }
  return ref;
}

export async function getBrandSettings(userId: string): Promise<BrandSettings> {
  const file = await readFile();
  const brand = file.byUser[userId] ?? defaultBrandSettings(userId);
  return {
    ...brand,
    logoRef: normalizeBrandLogoRef(brand.logoRef) || brand.logoRef,
  };
}

export async function putBrandSettings(
  userId: string,
  patch: Partial<Omit<BrandSettings, "userId" | "updatedAt">>,
): Promise<BrandSettings> {
  const file = await readFile();
  const prev = file.byUser[userId] ?? defaultBrandSettings(userId);
  const brandName =
    typeof patch.brandName === "string" && patch.brandName.trim()
      ? patch.brandName.trim()
      : prev.brandName;
  const logoRef =
    typeof patch.logoRef === "string" && patch.logoRef.trim()
      ? normalizeBrandLogoRef(patch.logoRef.trim()) || patch.logoRef.trim()
      : prev.logoRef;
  const next: BrandSettings = {
    userId,
    brandName,
    logoRef,
    tagline:
      typeof patch.tagline === "string"
        ? patch.tagline.trim() || undefined
        : prev.tagline,
    extras:
      patch.extras && typeof patch.extras === "object"
        ? patch.extras
        : prev.extras,
    updatedAt: new Date().toISOString(),
  };
  file.byUser[userId] = next;
  await writeFile(file);
  return next;
}
