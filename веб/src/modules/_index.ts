/**
 * Module SDK public barrel (C-19) — CLIENT-SAFE only.
 * Do NOT re-export `@/modules/registry` here: adapters pull `brand-context` (`node:fs`).
 * Server: `import { getModule } from "@/modules/registry"`.
 * Studio: `import { listManifests } from "@/modules/manifests"`.
 */

export type {
  ContentModuleManifest,
  IContentModule,
  DraftOutput,
  AssetRenderResult,
  ElementOutput,
  ModuleOutputFormat,
} from "@/types/module";

export {
  STUDIO_MODULE_ID_ALIASES,
  CANONICAL_TO_STUDIO_ID,
  toCanonicalModuleId,
  toStudioModuleId,
  isCanonicalModuleId,
} from "@/modules/id-map";
export type {
  CanonicalModuleId,
  LegacyStudioModuleId,
} from "@/modules/id-map";

/** Client-safe manifests — Studio / Client Components. */
export { listManifests } from "@/modules/manifests";
