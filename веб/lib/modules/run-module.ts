import { resolveModule } from "@/modules/registry";
import type {
  AssetRenderResult,
  DraftOutput,
  ElementOutput,
} from "@/types/module";

export class ModuleNotFoundError extends Error {
  readonly moduleId: string;
  constructor(moduleId: string) {
    super(`ModuleNotFound:${moduleId}`);
    this.name = "ModuleNotFoundError";
    this.moduleId = moduleId;
  }
}

async function requireModule(moduleId: string) {
  const mod = await resolveModule(moduleId);
  if (!mod) throw new ModuleNotFoundError(moduleId);
  return mod;
}

/** Thin facade: generateDraft for a registered module. */
export async function runGenerateDraft(
  moduleId: string,
  topic: string,
  options?: Record<string, unknown>,
): Promise<DraftOutput> {
  return (await requireModule(moduleId)).generateDraft(topic, options);
}

/** Thin facade: renderAsset (mock-first on localhost). */
export async function runRenderAsset(
  moduleId: string,
  draft: DraftOutput,
): Promise<AssetRenderResult> {
  return (await requireModule(moduleId)).renderAsset(draft);
}

/** Thin facade: regenerate one element by index. */
export async function runRegenerateElement(
  moduleId: string,
  draftId: string,
  elementIndex: number,
): Promise<ElementOutput> {
  return (await requireModule(moduleId)).regenerateElement(
    draftId,
    elementIndex,
  );
}

/**
 * Convenience: generateDraft then optional renderAsset.
 * Sync mock OK for localhost; does not enqueue BullMQ.
 */
export async function runGenerateAndMaybeRender(
  moduleId: string,
  topic: string,
  options?: Record<string, unknown>,
  render = false,
): Promise<{ draft: DraftOutput; render?: AssetRenderResult }> {
  const draft = await runGenerateDraft(moduleId, topic, options);
  if (!render) return { draft };
  const assets = await runRenderAsset(moduleId, draft);
  return { draft, render: assets };
}
