/**
 * Sprint 9.8 — reels quality critic gate BEFORE Draft.
 * Does NOT replace Scriptwriter/Монтажёр; rejects carousel JSON on reels path.
 */

import {
  parseAndAssertReelsScript,
  ReelsScriptParseError,
  type ReelsScriptArtifact,
} from "@/lib/studio/reels-script-contract";

export type ReelsCriticVerdict =
  | { ok: true; artifact: ReelsScriptArtifact; warnings: string[] }
  | {
      ok: false;
      code: string;
      message: string;
      reasons: string[];
      retryHint?: string;
    };

const SOFT_OPEN = [
  /^привет/i,
  /^в\s+этом\s+(видео|рилсе)/i,
  /^сегодня\s+я/i,
  /^hello[, ]/i,
];

/**
 * Deterministic critic for custom-reels Scriptwriter artifact.
 */
export function critiqueReelsScript(
  input: string | unknown,
  opts?: { allowRetryHint?: boolean },
): ReelsCriticVerdict {
  let artifact: ReelsScriptArtifact;
  try {
    artifact = parseAndAssertReelsScript(input);
  } catch (err) {
    if (err instanceof ReelsScriptParseError) {
      return {
        ok: false,
        code: `reels_${err.code.toLowerCase()}`,
        message: err.message,
        reasons: [err.message],
        retryHint: opts?.allowRetryHint
          ? "Emit STRICT reels JSON: contentType reels, hook 0–2s, ≥2 beats, CTA onScreen/captionLine, promptForMontage. Never carousel slides[]."
          : undefined,
      };
    }
    return {
      ok: false,
      code: "reels_critic_error",
      message: "Reels critic failed unexpectedly.",
      reasons: ["unexpected"],
    };
  }

  const reasons: string[] = [];
  const onScreen = artifact.hook.onScreen.trim();
  const vo = artifact.hook.vo.trim();
  if (SOFT_OPEN.some((re) => re.test(onScreen) || re.test(vo))) {
    reasons.push("soft_intro_hook");
  }
  if (artifact.hook.t1 > 2.05) {
    reasons.push("hook_not_0_2s");
  }
  if (artifact.beats.length < 2) {
    reasons.push("need_ge_2_beats");
  }
  if (!artifact.cta.onScreen.trim() && !artifact.cta.captionLine.trim()) {
    reasons.push("missing_cta");
  }
  if (!artifact.promptForMontage.trim()) {
    reasons.push("missing_promptForMontage");
  }

  if (reasons.length > 0) {
    return {
      ok: false,
      code: "reels_quality_reject",
      message: `Reels critic REJECT: ${reasons.join("; ")}`,
      reasons,
      retryHint: opts?.allowRetryHint
        ? "Rewrite captivating hook 0–2s (mute-proof), ≥2 beats, explicit CTA, promptForMontage — one retry then fail."
        : undefined,
    };
  }

  return { ok: true, artifact, warnings: [] };
}

export function replyLooksLikeReelsJson(text: string): boolean {
  const t = (text ?? "").trim();
  if (!t.includes("{")) return false;
  if (/contentType\s*[:=]\s*["']?carousel/i.test(t) && /slides\s*:/i.test(t)) {
    return true; // still gate — will fail as carousel forbidden
  }
  return (
    /contentType\s*[:=]\s*["']?reels/i.test(t) ||
    (/["']hook["']\s*:/.test(t) && /["']beats["']\s*:/.test(t))
  );
}
