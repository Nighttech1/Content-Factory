import type { MontageSettings } from "../types";
import { getReel, upsertReel } from "../store";
import { renderReel } from "../manager";

/**
 * Stage 8 helpers — approval vs full_auto.
 * Default product mode remains draft (manual render after footage).
 */
export function canAutoPublish(settings: MontageSettings): boolean {
  return settings.productionMode === "full_auto";
}

export function requiresUserApproval(settings: MontageSettings): boolean {
  return settings.productionMode === "approval" || settings.productionMode === "draft";
}

export async function maybeAutoRenderAfterFootage(reelId: string): Promise<{
  triggered: boolean;
  reason: string;
}> {
  const reel = getReel(reelId);
  if (!reel) return { triggered: false, reason: "not_found" };
  const mode = (reel.settingsOverride?.productionMode as string) || "draft";
  if (mode !== "full_auto") {
    return { triggered: false, reason: "not_full_auto" };
  }
  if (!reel.sources.length) {
    return { triggered: false, reason: "no_sources" };
  }
  const result = await renderReel(reelId);
  if (!result.ok) {
    upsertReel({
      ...getReel(reelId)!,
      status: "NEEDS_INTERVENTION",
      lastError: result.error,
    });
    return { triggered: true, reason: `failed:${result.error}` };
  }
  // approval gate even in auto if QA says so — already handled in renderReel
  return { triggered: true, reason: "rendered" };
}
