/**
 * Optional FE mirror for Plugin Slot customs (C-21).
 * Source of truth for Generate remains server JSON via POST/GET /api/modules/register.
 * Never store API keys — endpoint URL only.
 */

import type { ModuleOutputFormat } from "@/types/module";

export const CUSTOM_MODULES_STORAGE_KEY = "cf.customModules.v1";

/** Client-safe custom manifest (no Zod / no Node). */
export type CustomModuleManifestLite = {
  id: string;
  title: string;
  description: string;
  version: string;
  outputFormat: ModuleOutputFormat;
  icon: string;
  defaultSettings: { workerEndpoint: string };
};

function isOutputFormat(v: unknown): v is ModuleOutputFormat {
  return (
    v === "carousel_4_5" || v === "video_9_16" || v === "single_image"
  );
}

function isLiteManifest(v: unknown): v is CustomModuleManifestLite {
  if (!v || typeof v !== "object") return false;
  const m = v as Record<string, unknown>;
  const settings = m.defaultSettings;
  const workerEndpoint =
    settings &&
    typeof settings === "object" &&
    typeof (settings as Record<string, unknown>).workerEndpoint === "string"
      ? ((settings as Record<string, unknown>).workerEndpoint as string)
      : "";
  return (
    typeof m.id === "string" &&
    m.id.startsWith("custom-") &&
    typeof m.title === "string" &&
    typeof m.description === "string" &&
    typeof m.version === "string" &&
    isOutputFormat(m.outputFormat) &&
    typeof m.icon === "string" &&
    Boolean(workerEndpoint)
  );
}

/** Read mirrored customs from localStorage (browser only). */
export function readCustomModulesFromStorage(): CustomModuleManifestLite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_MODULES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isLiteManifest);
  } catch {
    return [];
  }
}

/** Upsert one custom into localStorage mirror. */
export function writeCustomModuleToStorage(
  manifest: CustomModuleManifestLite,
): void {
  if (typeof window === "undefined") return;
  try {
    const existing = readCustomModulesFromStorage();
    const next = [
      ...existing.filter((m) => m.id !== manifest.id),
      manifest,
    ];
    window.localStorage.setItem(
      CUSTOM_MODULES_STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    // Quota / private mode — ignore; server JSON is source of truth.
  }
}

/** Replace full mirror list (after GET hydrate). */
export function writeCustomModulesListToStorage(
  manifests: CustomModuleManifestLite[],
): void {
  if (typeof window === "undefined") return;
  try {
    const safe = manifests.filter(isLiteManifest);
    window.localStorage.setItem(
      CUSTOM_MODULES_STORAGE_KEY,
      JSON.stringify(safe),
    );
  } catch {
    // ignore
  }
}

/** Client-side worker endpoint check (mirrors server). */
export function isValidWorkerEndpointClient(endpoint: string): boolean {
  const e = endpoint.trim();
  if (!e) return false;
  if (e.startsWith("/api/")) return true;
  try {
    const u = new URL(e);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export type UiOutputType = "Video" | "Carousel" | "Graphic";

export const UI_OUTPUT_TO_FORMAT: Readonly<
  Record<UiOutputType, ModuleOutputFormat>
> = {
  Video: "video_9_16",
  Carousel: "carousel_4_5",
  Graphic: "single_image",
};

export function normalizeApiManifest(
  raw: unknown,
): CustomModuleManifestLite | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  const settings =
    m.defaultSettings && typeof m.defaultSettings === "object"
      ? (m.defaultSettings as Record<string, unknown>)
      : {};
  const workerEndpoint =
    typeof settings.workerEndpoint === "string"
      ? settings.workerEndpoint
      : "";
  const candidate: CustomModuleManifestLite = {
    id: typeof m.id === "string" ? m.id : "",
    title: typeof m.title === "string" ? m.title : "",
    description: typeof m.description === "string" ? m.description : "",
    version: typeof m.version === "string" ? m.version : "0.1.0",
    outputFormat: isOutputFormat(m.outputFormat)
      ? m.outputFormat
      : "single_image",
    icon: typeof m.icon === "string" ? m.icon : "Puzzle",
    defaultSettings: { workerEndpoint },
  };
  return isLiteManifest(candidate) ? candidate : null;
}
