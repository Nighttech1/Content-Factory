/**
 * role → provider → model.
 * Product rule: ONE text brain (Sonnet) for ALL text masks — scriptwriter,
 * script-AD, image-planner, designer and the vision Art Director share one
 * JobLlmSession transcript (C-ONE-BRAIN-01). No duplicate masks, no gemini base.
 * Image gen is separate — GPT Image 2.0 (best RU/HY glyph fidelity).
 */

import type { RoleId, RoleModelConfig } from "./types";

/** Canonical text brain — ONE Sonnet for all text masks (C-ONE-BRAIN-01). */
export const TEXT_ORCHESTRATOR_MODEL = "anthropic/claude-sonnet-4";
/**
 * Scriptwriter writes the viral carousel copy — the creative core. A flash brain
 * is too weak here, so the scriptwriter gets a strong Claude Sonnet by default
 * (matches the product Create default). Override with CAROUSEL_MODEL_SCRIPTWRITER.
 */
export const SCRIPTWRITER_STRONG_MODEL = "anthropic/claude-sonnet-4";
/**
 * Final Art Director runs VISION QA on the assembled PNGs (plaque overlaps,
 * baked-element trails/halos/smears, logo contrast) and makes the FINAL
 * accept/reject call. gpt-4o over-reported (hallucinated overlaps, mis-read
 * Armenian), so AD-final uses a strong Claude Sonnet — careful instruction-
 * following vision. Override with CAROUSEL_MODEL_AD_FINAL.
 */
export const AD_FINAL_VISION_MODEL = "anthropic/claude-sonnet-4";
/** Mode B full slides — GPT Image 2.0. */
export const IMAGE_GEN_MODEL = "openai/gpt-5.4-image-2";
/**
 * If primary returns empty_url — try next.
 * Override via CAROUSEL_IMAGE_FALLBACKS=model1,model2
 */
export const IMAGE_GEN_FALLBACKS = [
  "openai/gpt-5.4-image-2",
  "openai/gpt-5-image-mini",
  "yandex/yandex-art",
] as const;
export const TEXT_ORCHESTRATOR_FALLBACKS = [
  "google/gemini-2.0-flash",
  "google/gemini-flash-1.5",
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
] as const;

/** Ordered unique list: primary first, then fallbacks. */
export function resolveImageGenModelChain(primary?: string): string[] {
  const envList = process.env.CAROUSEL_IMAGE_FALLBACKS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const head = (primary?.trim() || IMAGE_GEN_MODEL).trim();
  const rest = envList?.length
    ? envList
    : [...IMAGE_GEN_FALLBACKS];
  const out: string[] = [];
  for (const m of [head, ...rest]) {
    if (m && !out.includes(m)) out.push(m);
  }
  return out;
}

/** Native multi-ref edits: GPT Image family. YandexART = prompt-only (+ logo_bake). */
export function imageModelSupportsNativeRefs(model: string): boolean {
  return /openai\//i.test(model) || /gpt-.*image/i.test(model);
}

const TEXT_CFG: RoleModelConfig = {
  provider: "google",
  model: TEXT_ORCHESTRATOR_MODEL,
};

const DEFAULTS: Record<RoleId, RoleModelConfig> = {
  orchestrator: { ...TEXT_CFG },
  scriptwriter: {
    provider: "anthropic",
    model: SCRIPTWRITER_STRONG_MODEL,
  },
  artDirectorScript: { ...TEXT_CFG },
  researchAgent: { ...TEXT_CFG },
  factChecker: { ...TEXT_CFG },
  imagePlanner: { ...TEXT_CFG },
  imageGen: {
    provider: "openai",
    model: IMAGE_GEN_MODEL,
  },
  designer: { ...TEXT_CFG },
  artDirectorFinal: {
    provider: "openai",
    model: AD_FINAL_VISION_MODEL,
  },
  qa: {
    provider: "none",
    model: "deterministic",
  },
};

const ENV_KEY: Record<RoleId, string> = {
  orchestrator: "CAROUSEL_MODEL_ORCHESTRATOR",
  scriptwriter: "CAROUSEL_MODEL_SCRIPTWRITER",
  artDirectorScript: "CAROUSEL_MODEL_AD_SCRIPT",
  researchAgent: "CAROUSEL_MODEL_RESEARCH",
  factChecker: "CAROUSEL_MODEL_FACT_CHECKER",
  imagePlanner: "CAROUSEL_MODEL_IMAGE_PLANNER",
  imageGen: "CAROUSEL_MODEL_IMAGE_GEN",
  designer: "CAROUSEL_MODEL_DESIGNER",
  artDirectorFinal: "CAROUSEL_MODEL_AD_FINAL",
  qa: "CAROUSEL_MODEL_QA",
};

function splitProviderModel(slug: string): RoleModelConfig {
  const trimmed = slug.trim();
  const slash = trimmed.indexOf("/");
  if (slash > 0) {
    return {
      provider: trimmed.slice(0, slash),
      model: trimmed,
    };
  }
  return { provider: "unknown", model: trimmed };
}

function parseJsonOverrides(): Partial<Record<RoleId, RoleModelConfig>> {
  const raw = process.env.CAROUSEL_ROLE_MODELS_JSON?.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Partial<Record<RoleId, RoleModelConfig>> = {};
    for (const [k, v] of Object.entries(parsed)) {
      const role = k as RoleId;
      if (!(role in DEFAULTS)) continue;
      if (typeof v === "string" && v.trim()) {
        out[role] = splitProviderModel(v);
      } else if (v && typeof v === "object") {
        const o = v as { provider?: unknown; model?: unknown };
        if (typeof o.model === "string" && o.model.trim()) {
          out[role] = {
            provider:
              typeof o.provider === "string" && o.provider.trim()
                ? o.provider.trim()
                : splitProviderModel(o.model).provider,
            model: o.model.trim(),
          };
        }
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** Shared text model for JobLlmSession (env CAROUSEL_MODEL_TEXT overrides). */
export function resolveTextOrchestratorModel(): string {
  const env = process.env.CAROUSEL_MODEL_TEXT?.trim();
  if (env) return env;
  return TEXT_ORCHESTRATOR_MODEL;
}

export function listRoleModelDefaults(): Record<RoleId, RoleModelConfig> {
  const overrides = parseJsonOverrides();
  const textModel = resolveTextOrchestratorModel();
  const textCfg: RoleModelConfig = splitProviderModel(textModel);
  const out = { ...DEFAULTS } as Record<RoleId, RoleModelConfig>;
  for (const role of Object.keys(DEFAULTS) as RoleId[]) {
    // These roles keep their OWN default (not the shared text brain):
    // image gen (GPT Image), deterministic QA, AD-final (vision QA),
    // scriptwriter (strong Claude Sonnet for the creative copy).
    if (
      role === "imageGen" ||
      role === "qa" ||
      role === "artDirectorFinal" ||
      role === "scriptwriter"
    ) {
      const envSlug = process.env[ENV_KEY[role]]?.trim();
      if (envSlug) out[role] = splitProviderModel(envSlug);
      else if (overrides[role]) out[role] = overrides[role]!;
      continue;
    }
    // Force one text brain unless explicit per-role env (debug only).
    const envSlug = process.env[ENV_KEY[role]]?.trim();
    if (envSlug) out[role] = splitProviderModel(envSlug);
    else if (overrides[role]) out[role] = overrides[role]!;
    else out[role] = { ...textCfg };
  }
  return out;
}

export function resolveRoleModel(role: RoleId): RoleModelConfig {
  return listRoleModelDefaults()[role];
}

/**
 * C-REMARKS-TO-BAKE-03: vision remarks → CHEAP re-bake by default. GPT image
 * re-generation is expensive, so it is OFF unless CAROUSEL_ALLOW_IMAGE_REGEN=1.
 */
export function isImageRegenAllowed(): boolean {
  return process.env.CAROUSEL_ALLOW_IMAGE_REGEN?.trim() === "1";
}
