import type { ZodTypeAny } from "zod";

/** Output format union per ARCHITECTURE §4 / Module SDK. */
export type ModuleOutputFormat =
  | "carousel_4_5"
  | "video_9_16"
  | "single_image";

/**
 * Manifest for a Content Factory module.
 * Registered in `src/modules/registry.ts`; Studio tiles read via `listManifests()`.
 */
export interface ContentModuleManifest {
  id: string;
  title: string;
  description: string;
  version: string;
  outputFormat: ModuleOutputFormat;
  /** Lucide icon key, e.g. "Layers" */
  icon: string;
  defaultSettings: Record<string, unknown>;
  inputSchema: ZodTypeAny;
}

/** Minimal draft returned by `generateDraft` (stub or real adapter). */
export interface DraftOutput {
  draftId: string;
  moduleId: string;
  topic: string;
  elements: Array<{ index: number; kind: string; payload: unknown }>;
  meta?: Record<string, unknown>;
}

/** Result of rendering a draft to assets. */
export interface AssetRenderResult {
  draftId: string;
  assets: Array<{
    url: string;
    mime: string;
    width?: number;
    height?: number;
  }>;
  mock?: boolean;
  /** Human-readable adapter notes (no secrets). */
  feedbackLogs?: string[];
}

/** Result of regenerating a single element (slide / card). */
export interface ElementOutput {
  draftId: string;
  elementIndex: number;
  payload: unknown;
  asset?: AssetRenderResult["assets"][number];
}

/** Module SDK contract — implement in `src/modules/{id}/`. */
export interface IContentModule {
  manifest: ContentModuleManifest;
  generateDraft(
    topic: string,
    options?: Record<string, unknown>,
  ): Promise<DraftOutput>;
  renderAsset(draft: DraftOutput): Promise<AssetRenderResult>;
  regenerateElement(
    draftId: string,
    elementIndex: number,
  ): Promise<ElementOutput>;
}
