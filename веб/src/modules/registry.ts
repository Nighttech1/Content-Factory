/**
 * Server-side module registry (adapters + brand-context / Node APIs).
 * Client / Studio tiles must use `@/modules/manifests` — not this file.
 * (No `server-only` package import: breaks `tsx` smokes; boundary = import graph.)
 *
 * Custom plugins (C-21/C-22): hydrated from data/local/custom-modules.json via
 * ensureCustomModulesHydrated(). Map + hydrate state live on globalThis so all
 * Next.js route bundles share one registry (avoids dual Map / stale one-shot).
 */

import type { ContentModuleManifest, IContentModule } from "@/types/module";
import { toCanonicalModuleId } from "@/modules/id-map";
import { listManifests as listClientManifests } from "@/modules/manifests";
import { contentModule as carouselEngine } from "@/modules/carousel-engine";
import { contentModule as aestheticGraphics } from "@/modules/aesthetic-graphics";
import { contentModule as cartoonReels } from "@/modules/cartoon-reels";
import { contentModule as heygenReels } from "@/modules/heygen-reels";
import { contentModule as siteArticles } from "@/modules/site-articles";
import { contentModule as tgArticles } from "@/modules/tg-articles";
import { createRemoteFromRecord } from "@/modules/custom-remote/factory";
import { readCustomModuleRecords } from "@/modules/custom-remote/persist";

const GLOBAL_KEY = "__cfModuleRegistry" as const;

type CfModuleRegistryState = {
  modulesById: Map<string, IContentModule>;
  hydratePromise: Promise<void> | null;
  coreRegistered: boolean;
};

type GlobalWithRegistry = typeof globalThis & {
  [GLOBAL_KEY]?: CfModuleRegistryState;
};

function getRegistryState(): CfModuleRegistryState {
  const g = globalThis as GlobalWithRegistry;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = {
      modulesById: new Map(),
      hydratePromise: null,
      coreRegistered: false,
    };
  }
  return g[GLOBAL_KEY];
}

function modulesById(): Map<string, IContentModule> {
  return getRegistryState().modulesById;
}

/**
 * Register (or replace) a content module by its canonical `manifest.id`.
 */
export function registerModule(mod: IContentModule): void {
  const id = mod.manifest.id;
  modulesById().set(id, mod);
}

/**
 * Lookup by canonical or legacy Studio alias.
 * Returns `undefined` if unknown after alias normalization.
 * Call `await ensureCustomModulesHydrated()` before relying on custom-* ids.
 */
export function getModule(id: string): IContentModule | undefined {
  const canonical = toCanonicalModuleId(id);
  return modulesById().get(canonical);
}

/**
 * Resolve a module: normal hydrate, then on custom-* miss force re-read disk.
 * Use from generate / run-module so POST register → generate works across bundles.
 */
export async function resolveModule(
  id: string,
): Promise<IContentModule | undefined> {
  await ensureCustomModulesHydrated();
  const mod = getModule(id);
  if (mod) return mod;

  const canonical = toCanonicalModuleId(id);
  const looksCustom =
    canonical.startsWith("custom-") || id.startsWith("custom-");
  if (!looksCustom) return undefined;

  await ensureCustomModulesHydrated({ force: true });
  return getModule(id);
}

/** All registered modules (insertion order). */
export function listModules(): IContentModule[] {
  return Array.from(modulesById().values());
}

/**
 * Core manifests for smoke / isomorphic callers.
 * Same four ids as `@/modules/manifests` (client-safe entry).
 * Prefer importing `listManifests` from `@/modules/manifests` on the client.
 * Custom plugins: use `listCustomManifests()` after hydrate.
 */
export function listManifests(): ContentModuleManifest[] {
  return listClientManifests();
}

/** Custom (plugin) manifests currently registered (`custom-*`). */
export function listCustomManifests(): ContentModuleManifest[] {
  return Array.from(modulesById().values())
    .map((m) => m.manifest)
    .filter((m) => m.id.startsWith("custom-"));
}

/** Eager-register core adapters (C-20 mock-first + C-76 articles). No secrets. */
function registerCoreModules(): void {
  const state = getRegistryState();
  if (state.coreRegistered) return;
  registerModule(carouselEngine);
  registerModule(aestheticGraphics);
  registerModule(cartoonReels);
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

  // Sync: drop stale custom-* that are no longer on disk (JSON replaced / pruned).
  for (const id of Array.from(map.keys())) {
    if (id.startsWith("custom-") && !diskIds.has(id)) {
      map.delete(id);
    }
  }

  for (const record of records) {
    try {
      registerModule(createRemoteFromRecord(record));
    } catch (err) {
      const message = err instanceof Error ? err.message : "hydrate_skip";
      // eslint-disable-next-line no-console -- operational; no secrets
      console.warn(
        `[registry] skip custom module ${record.id}:`,
        message,
      );
    }
  }
}

/**
 * Load custom-modules.json into the in-memory registry.
 * Idempotent by default; `{ force: true }` re-reads disk, upserts, and removes
 * custom-* ids missing from the current JSON (full sync, not upsert-only).
 */
export function ensureCustomModulesHydrated(options?: {
  force?: boolean;
}): Promise<void> {
  const state = getRegistryState();
  if (options?.force) {
    state.hydratePromise = hydrateCustomModulesFromDisk().catch((err) => {
      state.hydratePromise = null;
      const message = err instanceof Error ? err.message : "hydrate_failed";
      // eslint-disable-next-line no-console
      console.warn("[registry] custom hydrate failed:", message);
    });
    return state.hydratePromise;
  }
  if (!state.hydratePromise) {
    state.hydratePromise = hydrateCustomModulesFromDisk().catch((err) => {
      state.hydratePromise = null;
      const message = err instanceof Error ? err.message : "hydrate_failed";
      // eslint-disable-next-line no-console
      console.warn("[registry] custom hydrate failed:", message);
    });
  }
  return state.hydratePromise;
}

/** Kick off hydrate on server boot (non-blocking warm path). */
void ensureCustomModulesHydrated();
