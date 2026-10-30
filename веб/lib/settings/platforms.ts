/**
 * C-79 — publishing platforms + API key slots (localStorage, no secrets in git).
 */

export const PLATFORMS_STORAGE_KEY = "cf.settings.platforms.v1";

export type PlatformKind =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "telegram"
  | "youtube"
  | "website"
  | "other";

export type PublishPlatform = {
  id: string;
  kind: PlatformKind;
  label: string;
  /** User-facing note; never log apiKey. */
  note?: string;
  /** Client-only; never commit. */
  apiKey?: string;
  /** Optional base URL / channel id. */
  endpoint?: string;
  enabled: boolean;
};

export const PLATFORM_KIND_LABELS: Record<PlatformKind, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  telegram: "Telegram",
  youtube: "YouTube",
  website: "Сайт",
  other: "Другое",
};

export const DEFAULT_PLATFORMS: PublishPlatform[] = [
  {
    id: "ig-main",
    kind: "instagram",
    label: "Instagram · основной",
    enabled: true,
  },
  {
    id: "tg-channel",
    kind: "telegram",
    label: "Telegram · канал",
    enabled: true,
  },
  {
    id: "yt-main",
    kind: "youtube",
    label: "YouTube",
    enabled: false,
  },
  {
    id: "site-main",
    kind: "website",
    label: "Сайт Vernatun",
    enabled: true,
  },
];

function isPlatform(value: unknown): value is PublishPlatform {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.kind === "string" &&
    typeof p.label === "string" &&
    typeof p.enabled === "boolean"
  );
}

export function parsePlatforms(raw: unknown): PublishPlatform[] {
  if (!Array.isArray(raw)) return DEFAULT_PLATFORMS.map((p) => ({ ...p }));
  const list = raw.filter(isPlatform);
  return list.length > 0 ? list : DEFAULT_PLATFORMS.map((p) => ({ ...p }));
}

export function readPlatformsFromStorage(): PublishPlatform[] {
  if (typeof window === "undefined") {
    return DEFAULT_PLATFORMS.map((p) => ({ ...p }));
  }
  try {
    const raw = window.localStorage.getItem(PLATFORMS_STORAGE_KEY);
    if (!raw) return DEFAULT_PLATFORMS.map((p) => ({ ...p }));
    return parsePlatforms(JSON.parse(raw) as unknown);
  } catch {
    return DEFAULT_PLATFORMS.map((p) => ({ ...p }));
  }
}

export function writePlatformsToStorage(list: PublishPlatform[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    PLATFORMS_STORAGE_KEY,
    JSON.stringify(parsePlatforms(list)),
  );
}

export function upsertPlatform(
  list: PublishPlatform[],
  platform: PublishPlatform,
): PublishPlatform[] {
  const next = list.filter((p) => p.id !== platform.id);
  next.push(platform);
  return next;
}

export function removePlatform(
  list: PublishPlatform[],
  id: string,
): PublishPlatform[] {
  return list.filter((p) => p.id !== id);
}

export function enabledPlatforms(list: PublishPlatform[]): PublishPlatform[] {
  return list.filter((p) => p.enabled);
}

export function newPlatformId(kind: PlatformKind): string {
  return `${kind}-${Date.now().toString(36)}`;
}
