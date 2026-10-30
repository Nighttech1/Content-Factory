/**
 * Neutral placeholder assets for C-20 mock-first adapters.
 * Paths under /mock/ are conceptual; data-URLs work without static files.
 */

export const MOCK_CAROUSEL = {
  width: 1080,
  height: 1350,
  mime: "image/png",
} as const;

export const MOCK_SINGLE = {
  width: 1080,
  height: 1080,
  mime: "image/svg+xml",
} as const;

export const MOCK_VIDEO_9_16 = {
  width: 1080,
  height: 1920,
  mime: "video/mp4",
} as const;

/** Tiny 1×1 PNG (transparent) as data-URL fallback. */
export const PLACEHOLDER_PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

/** Conceptual mock MP4 path for Inspector (no binary committed). */
export const MOCK_MP4_URL = "/mock/assets/placeholder-9x16.mp4";

/** Conceptual poster for video mocks. */
export const MOCK_POSTER_URL = "/mock/assets/placeholder-9x16-poster.png";

export function mockCarouselSlideUrl(slideIndex: number): string {
  return `/mock/assets/carousel-1080x1350/slide-${slideIndex}.png`;
}

export function mockAestheticSvg(topic: string, title: string): string {
  const safeTopic = escapeXml(topic.slice(0, 80));
  const safeTitle = escapeXml(title.slice(0, 60));
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <rect width="1080" height="1080" fill="#1a1a1a"/>
  <rect x="48" y="48" width="984" height="984" fill="none" stroke="#c9a227" stroke-width="4"/>
  <text x="540" y="420" text-anchor="middle" fill="#f5f0e8" font-family="Georgia, serif" font-size="42">${safeTitle}</text>
  <text x="540" y="520" text-anchor="middle" fill="#b8b0a4" font-family="system-ui, sans-serif" font-size="28">${safeTopic}</text>
  <text x="540" y="980" text-anchor="middle" fill="#666" font-family="system-ui, sans-serif" font-size="20">mock · aesthetic-graphics</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
