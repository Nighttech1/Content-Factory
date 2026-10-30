/**
 * Sprint 9.8 + Phase 6 correct — carousel quality critic gate BEFORE Draft.
 * zod STRICT first; critic-05 SUPPLEMENTS (does not replace).
 * Max Scriptwriter retries = SCRIPTWRITER_CRITIC_MAX_RETRIES (2) — Backend owns loop.
 */

import {
  type CarouselHandoffJson,
  parseAndAssertCarouselJsonStrict,
  CarouselJsonParseError,
} from "@/lib/studio/carousel-json-contract";
import {
  CAROUSEL_CRITIC_05_RETRY_HINT,
  runCarouselCritic05,
  SCRIPTWRITER_CRITIC_MAX_RETRIES,
  shouldRetryScriptwriterAfterCritic,
  type Critic05Options,
} from "@/lib/studio/carousel-critic-05";

export {
  SCRIPTWRITER_CRITIC_MAX_RETRIES,
  shouldRetryScriptwriterAfterCritic,
  runCarouselCritic05,
  CAROUSEL_CRITIC_05_RETRY_HINT,
} from "@/lib/studio/carousel-critic-05";

export type CarouselCriticVerdict =
  | { ok: true; json: CarouselHandoffJson; warnings: string[] }
  | {
      ok: false;
      code: string;
      message: string;
      reasons: string[];
      retryHint?: string;
      /** How many Scriptwriter retries Backend may still attempt (0 = stop). */
      retriesRemaining?: number;
    };

/**
 * Deterministic critic (no extra LLM required for gate).
 * 1) zod STRICT  2) critic-05 rules  → retryHint for Scriptwriter (≤2).
 */
export function critiqueCarouselHandoff(
  input: string | CarouselHandoffJson,
  opts?: {
    allowRetryHint?: boolean;
    /** Consumed Scriptwriter critic retries so far (0 on first fail). */
    retryCount?: number;
    critic05?: Critic05Options;
  },
): CarouselCriticVerdict {
  const retryCount = Math.max(0, Math.floor(opts?.retryCount ?? 0));
  const allowHint = opts?.allowRetryHint !== false;
  const retriesRemaining = Math.max(
    0,
    SCRIPTWRITER_CRITIC_MAX_RETRIES - retryCount,
  );

  let json: CarouselHandoffJson;
  try {
    json =
      typeof input === "string"
        ? parseAndAssertCarouselJsonStrict(input)
        : parseAndAssertCarouselJsonStrict(JSON.stringify(input));
  } catch (err) {
    if (err instanceof CarouselJsonParseError) {
      return {
        ok: false,
        code: `carousel_${err.code.toLowerCase()}`,
        message: err.message,
        reasons: [err.message],
        retryHint: allowHint
          ? "Fix STRICT JSON: count match, secondary_copy REQUIRED every slide, visual_prompt scene-only every slide, cta_type 1–4, then resubmit."
          : undefined,
        retriesRemaining,
      };
    }
    return {
      ok: false,
      code: "carousel_critic_error",
      message: "Carousel critic failed unexpectedly.",
      reasons: ["unexpected"],
      retriesRemaining: 0,
    };
  }

  const c05 = runCarouselCritic05(json, opts?.critic05);
  if (!c05.ok) {
    const canRetry =
      allowHint && shouldRetryScriptwriterAfterCritic(retryCount);
    return {
      ok: false,
      code: "carousel_quality_reject",
      message: `Carousel critic REJECT: ${c05.reasons.map((r) => r.code).join("; ")}`,
      reasons: c05.reasons.map(
        (r) =>
          (r.slide != null ? `${r.code}:slide_${r.slide}` : r.code) +
          ` (${r.message})`,
      ),
      retryHint: canRetry ? c05.retryHint : undefined,
      retriesRemaining: canRetry
        ? Math.max(0, SCRIPTWRITER_CRITIC_MAX_RETRIES - (retryCount + 1))
        : 0,
    };
  }

  const warnings = c05.warnings.map(
    (w) => `${w.code}${w.slide != null ? `:slide_${w.slide}` : ""}: ${w.message}`,
  );

  return { ok: true, json, warnings };
}

/** True when reply looks like it contains a carousel JSON artifact worth gating. */
export function replyLooksLikeCarouselJson(text: string): boolean {
  const t = (text ?? "").trim();
  if (!t.includes("{")) return false;
  return (
    /requested_slide_count/i.test(t) ||
    (/slides\s*:/i.test(t) && /primary_copy/i.test(t)) ||
    (/slides\s*:/i.test(t) && /headline/i.test(t))
  );
}
