/**
 * One turn = two masks until script is APPROVED:
 *   Сценарист → Арт-директор сценария → (замечания) → Сценарист → …
 * Only then the orchestrator may spend money on GPT Image.
 */
import { runArtDirectorScript, formatScriptRevisionNotes } from "./art-director-script";
import { runScriptwriter } from "./scriptwriter";
import type { JobLlmSession } from "./job-llm-session";
import type {
  VernatunDefect,
  VernatunJobBrief,
  VernatunProgressFn,
  VernatunScript,
} from "./types";

export const DEFAULT_SCRIPT_APPROVAL_MAX_ROUNDS = 4;

export type ScriptApprovalLoopResult = {
  script: VernatunScript;
  approved: boolean;
  rounds: number;
  defects: VernatunDefect[];
  notes: string;
  model: string;
  verdict?: "APPROVED" | "REVISION_REQUIRED" | "BLOCKED";
};

async function progress(
  onProgress: VernatunProgressFn | undefined,
  agent: string,
  message: string,
): Promise<void> {
  if (onProgress) await onProgress(agent, message);
}

/**
 * Assumes initial script already written (first scriptwriter call).
 * Runs AD check → rewrite until approved or maxRounds.
 */
export async function runScriptApprovalLoop(input: {
  brief: VernatunJobBrief;
  script: VernatunScript;
  session?: JobLlmSession;
  onProgress?: VernatunProgressFn;
  /** Max AD↔scriptwriter revision rounds after the first draft (default 4). */
  maxRounds?: number;
  onRound?: (info: {
    round: number;
    script: VernatunScript;
    adNotes: string;
    defects: VernatunDefect[];
  }) => void | Promise<void>;
}): Promise<ScriptApprovalLoopResult> {
  const maxRounds = Math.max(
    1,
    input.maxRounds ??
      (Number(process.env.CAROUSEL_SCRIPT_APPROVAL_ROUNDS) ||
        DEFAULT_SCRIPT_APPROVAL_MAX_ROUNDS),
  );

  let script = input.script;
  let ad = await runArtDirectorScript(script, input.session, input.brief);
  await progress(
    input.onProgress,
    "Арт-директор (сценарий)",
    ad.approved
      ? "Сценарий согласован — можно в картинки."
      : `Замечания к сценарию (${ad.defects.length}) — отдаю сценаристу…`,
  );

  let round = 0;
  while (!ad.approved && round < maxRounds) {
    round += 1;
    const revision = formatScriptRevisionNotes(ad, round);
    await progress(
      input.onProgress,
      "Сценарист",
      `Правлю сценарий по замечаниям AD (раунд ${round}/${maxRounds})…`,
    );
    const sw = await runScriptwriter(
      {
        ...input.brief,
        styleNotes: [input.brief.styleNotes ?? "", revision]
          .filter(Boolean)
          .join("\n\n"),
      },
      input.session,
    );
    script = sw.script;
    if (input.onRound) {
      await input.onRound({
        round,
        script,
        adNotes: ad.notes,
        defects: ad.defects,
      });
    }
    await progress(
      input.onProgress,
      "Арт-директор (сценарий)",
      `Повторная приёмка сценария (раунд ${round})…`,
    );
    ad = await runArtDirectorScript(script, input.session, input.brief);
  }

  return {
    script,
    approved: ad.approved,
    rounds: round,
    defects: ad.defects,
    notes: ad.notes,
    model: ad.model,
    verdict: ad.verdict,
  };
}
