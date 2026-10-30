/**
 * C-carousel-preview-black — same-origin preview URLs via media-proxy.
 * Never log secrets or raw Authorization headers.
 */

/** Path prefix for the studio media proxy (same-origin). */
export const STUDIO_MEDIA_PROXY_PATH = "/api/studio/media-proxy";

/**
 * Convert a remote https image URL into a same-origin proxy URL.
 * Already same-origin / relative paths are returned unchanged.
 * Empty / invalid → empty string.
 */
export function toPreviewUrl(remoteUrl: string): string {
  const raw = typeof remoteUrl === "string" ? remoteUrl.trim() : "";
  if (!raw) return "";

  // Already same-origin relative (static generated / proxy)
  if (raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }

  // data: / blob: — leave as-is (FE can load without proxy)
  if (/^(data:|blob:)/i.test(raw)) {
    return raw;
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return raw;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return raw;
  }

  // Localhost absolute → keep (dev) or still proxy for consistency
  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1") {
    // Prefer proxy so FE always hits same origin from browser
    return `${STUDIO_MEDIA_PROXY_PATH}?url=${encodeURIComponent(parsed.toString())}`;
  }

  return `${STUDIO_MEDIA_PROXY_PATH}?url=${encodeURIComponent(parsed.toString())}`;
}

/** Map slides[].imageUrl through toPreviewUrl. */
export function mapSlidesToPreviewUrls<
  T extends { imageUrl: string },
>(slides: T[]): T[] {
  return slides.map((s) => ({
    ...s,
    imageUrl: toPreviewUrl(s.imageUrl) || s.imageUrl,
  }));
}

/**
 * C-designer-panorama-slice — Create preview must be N sliced frames, not a
 * single panorama URL. Reject if count mismatch or obvious panorama-only payload.
 */
export function assertSlicedCreatePreview(
  slides: Array<{ imageUrl?: string } | null | undefined>,
  expectedCount: number,
): { ok: true } | { ok: false; message: string } {
  const n = Math.max(1, Math.round(expectedCount));
  if (!Array.isArray(slides) || slides.length < 1) {
    return {
      ok: false,
      message:
        "Create preview rejected: нет нарезанных кадров 4:5 (пустой slides[]).",
    };
  }
  if (slides.length !== n) {
    return {
      ok: false,
      message: `Create preview rejected: ожидалось ${n} нарезанных 4:5, получено ${slides.length}. Панорама как единственный preview запрещена.`,
    };
  }
  const urls = slides
    .map((s) => (typeof s?.imageUrl === "string" ? s.imageUrl.trim() : ""))
    .filter(Boolean);
  if (urls.length !== n) {
    return {
      ok: false,
      message: "Create preview rejected: у части слайдов нет imageUrl.",
    };
  }
  // Single shared URL for N>1 → treat as panorama / non-sliced
  if (n > 1 && new Set(urls).size === 1) {
    return {
      ok: false,
      message:
        "Create preview rejected: один URL на все слайды (похоже на panorama-only).",
    };
  }
  const panoramaHint = /panorama|master[-_]?strip|full[-_]?bleed[-_]?wide/i;
  if (n === 1 && panoramaHint.test(urls[0]!)) {
    return {
      ok: false,
      message:
        "Create preview rejected: panorama URL как единственный preview.",
    };
  }
  return { ok: true };
}
