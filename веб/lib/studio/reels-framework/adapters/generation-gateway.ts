/**
 * Provider-agnostic generation gateway. Disabled by default (budget gate).
 */

export type GenKind = "image" | "video" | "tts";

export type GenRequest = {
  kind: GenKind;
  prompt: string;
  styleHints?: string[];
  referencePaths?: string[];
  budgetAllowed: boolean;
};

export type GenResponse =
  | { ok: true; provider: string; localPath?: string; url?: string; mock: boolean }
  | { ok: false; error: string };

export async function generateAsset(req: GenRequest): Promise<GenResponse> {
  if (!req.budgetAllowed) {
    return { ok: false, error: "budget_not_allowed" };
  }
  if (!process.env.REELS_GEN_ENABLED || process.env.REELS_GEN_ENABLED === "0") {
    return { ok: false, error: "generation_disabled" };
  }

  const provider = process.env.REELS_GEN_PROVIDER?.trim() || "none";
  if (provider === "none") {
    return { ok: false, error: "no_provider_configured" };
  }

  // Providers plugged later without changing callers.
  return {
    ok: true,
    provider,
    mock: true,
    url: undefined,
  };
}
