/**
 * Server-side module registry (adapters + brand-context / Node APIs).
 * Client / Studio tiles must use `@/modules/manifests` — not this file.
 */

import type { ContentModuleManifest, IContentModule } from "@/types/module";
import { toCanonicalModuleId } from "@/modules/id-map";
import { listManifests as listClientManifests } from "@/modules/manifests";
import { contentModule as carouselEngine } from "@/modules/carousel-engine";
import { contentModule as aestheticGraphics } from "@/modules/aesthetic-graphics";
import { contentModule as cartoonReels } from "@/modules/cartoon-reels";
import { contentModule as aiComicVideo } from "@/modules/ai-comic-video";
import { contentModule as heygenReels } from "@/modules/heygen-reels";
import { contentModule as siteArticles } from "@/modules/site-articles";
import { contentModule as tgArticles } from "@/modules/tg-articles";
import { createRemoteFromRecord } from "@/modules/custom-remote/factory";
import { readCustomModuleRecords } from "@/modules/custom-remote/persist";

const GLOBAL_KEY = "__cfModuleRegistry" as const;
type CfModuleRegistryState = { modulesById: Map<string, IContentModule>; hydratePromise: Promise<void> | null; coreRegistered: boolean; };
type GlobalWithRegistry = typeof globalThis & { [GLOBAL_KEY]?: CfModuleRegistryState };
function getRegistryState(): CfModuleRegistryState { const g = globalThis as GlobalWithRegistry; if (!g[GLOBAL_KEY]) g[GLOBAL_KEY] = { modulesById: new Map(), hydratePromise: null, coreRegistered: false }; return g[GLOBAL_KEY]; }
function modulesById(): Map<string, IContentModule> { return getRegistryState().modulesById; }
export function registerModule(mod: IContentModule): void { modulesById().set(mod.manifest.id, mod); }
export function getModule(id: string): IContentModule | undefined { return modulesById().get(toCanonicalModuleId(id)); }
export async function resolveModule(id: string): Promise<IContentModule | undefined> { await ensureCustomModulesHydrated(); const mod = getModule(id); if (mod) return mod; const canonical = toCanonicalModuleId(id); if (!canonical.startsWith("custom-") && !id.startsWith("custom-")) return undefined; await ensureCustomModulesHydrated({ force: true }); return getModule(id); }
export function listModules(): IContentModule[] { return Array.from(modulesById().values()); }
export function listManifests(): ContentModuleManifest[] { return listClientManifests(); }
export function listCustomManifests(): ContentModuleManifest[] { return Array.from(modulesById().values()).map((m) => m.manifest).filter((m) => m.id.startsWith("custom-")); }

function registerCoreModules(): void {
  const state = getRegistryState();
  if (state.coreRegistered) return;
  registerModule(carouselEngine);
  registerModule(aestheticGraphics);
  registerModule(cartoonReels);
  registerModule(aiComicVideo);
  registerModule(heygenReels);
  registerModule(siteArticles);
  registerModule(tgArticles);
  state.coreRegistered = true;
}
registerCoreModules();

async function hydrateCustomModulesFromDisk(): Promise<void> {
  const records = await readCustomModuleRecords();
  const diskIds = new Set(records.map((r) => r.id));
  const map = modulesById();
  for (const id of Array.from(map.keys())) if (id.startsWith("custom-") && !diskIds.has(id)) map.delete(id);
  for (const record of records) { try { registerModule(createRemoteFromRecord(record)); } catch (err) { const message = err instanceof Error ? err.message : "hydrate_skip"; console.warn(`[registry] skip custom module ${record.id}:`, message); } }
}
export function ensureCustomModulesHydrated(options?: { force?: boolean }): Promise<void> {
  const state = getRegistryState();
  if (options?.force) { state.hydratePromise = hydrateCustomModulesFromDisk().catch(() => { state.hydratePromise = null; }); return state.hydratePromise; }
  if (!state.hydratePromise) state.hydratePromise = hydrateCustomModulesFromDisk().catch(() => { state.hydratePromise = null; });
  return state.hydratePromise;
}
void ensureCustomModulesHydrated();
