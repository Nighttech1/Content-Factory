/**
 * Mask «Арт-директор сценария» — проверяет смысл/пользу/виральность.
 * Не программный чеклист смысла: только LLM + механический лимит ≤4 слов на обложке.
 * Замечания уходят сценаристу; цикл крутится в orchestrator до APPROVED.
 */
import { callAggregatorChat } from "@/lib/llm/aggregator-chat";
import { resolveBriefCta } from "./cta-catalog";
import { defectsForOneHyVocabPerSlide } from "./hy-text";
import { PROMPT_AD_SCRIPT } from "./prompts";
import { resolveRoleModel } from "./role-models";
import { extractJsonObject } from "./json-parse";
import { assertCoverHeadline } from "./word-count";
import type { JobLlmSession } from "./job-llm-session";
import type { VernatunDefect, VernatunJobBrief, VernatunScript } from "./types";

export type ScriptAdResult = {
  approved: boolean;
  defects: VernatunDefect[];
  notes: string;
  model: string;
  verdict?: "APPROVED" | "REVISION_REQUIRED" | "BLOCKED";
};

function parseDefects(raw: unknown): VernatunDefect[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((d) => {
      const o = (d ?? {}) as Record<string, unknown>;
      const priority = String(o.priority ?? "MAJOR").toUpperCase();
      return {
        priority:
          priority === "BLOCKER" || priority === "MINOR"
            ? (priority as VernatunDefect["priority"])
            : "MAJOR",
        slide_index: Number(o.slide_index ?? o.slideIndex ?? 0) || 0,
        element: String(o.element ?? "unknown"),
        reason: String(o.reason ?? ""),
        fix: String(o.fix ?? ""),
      };
    })
    .filter((d) => d.reason.trim());
}

export async function runArtDirectorScript(
  script: VernatunScript,
  session?: JobLlmSession,
  brief?: Pick<VernatunJobBrief, "topic" | "cta" | "ctaType">,
): Promise<ScriptAdResult> {
  const coverCheck = assertCoverHeadline(script.slides[0]?.headline ?? "");
  const forced: VernatunDefect[] = [];
  if (!coverCheck.ok) {
    forced.push({
      priority: "BLOCKER",
      slide_index: 1,
      element: "headline",
      reason: `Заголовок обложки: ${coverCheck.words} слов (лимит 4)`,
      fix: "Сократить headline до ≤4 слов, сохранив конкретную тему",
    });
  }
  for (const d of defectsForOneHyVocabPerSlide(script)) {
    forced.push({
      priority: d.priority,
      slide_index: d.slide_index,
      element: d.element,
      reason: d.reason,
      fix: d.fix,
    });
  }

  const substanceBrief = brief ?? {
    topic: script.carousel_title || script.central_thesis || "",
    cta: script.slides[script.slides.length - 1]?.cta,
  };
  const resolved = resolveBriefCta(substanceBrief);
  const model = resolveRoleModel("artDirectorScript");
  const user = [
    "Роль: ты проверяешь сценарий ПЕРЕД генерацией картинок.",
    "Критерии: логика, польза, виральность, конкретика по теме, CTA.",
    "Если не идеально — REVISION_REQUIRED + точечные defects со fix для сценариста.",
    "APPROVED только когда сценарий можно отдавать в карусель без стыда.",
    "",
    `Тема брифа: ${substanceBrief.topic}`,
    `Ожидаемый CTA (${resolved.ctaType}): ${resolved.cta}`,
    "",
    "Сценарий JSON:",
    JSON.stringify(script, null, 2),
  ].join("\n");

  const res = session
    ? await session.callMask({
        role: "artDirectorScript",
        system: PROMPT_AD_SCRIPT,
        user,
        temperature: 0.25,
        maxTokens: 2560,
      })
    : await callAggregatorChat({
        system: PROMPT_AD_SCRIPT,
        user,
        model: model.model,
        temperature: 0.25,
        maxTokens: 2560,
        fallbackModels: true,
      });

  if (!res.ok) {
    // Ops fail: don't fake APPROVED if cover already broken; else allow continue
    // with note (images still gated by orchestrator if we require approved).
    return {
      approved: forced.length === 0,
      defects: forced,
      notes: `ad_script_llm_fail:${res.error}`,
      model: model.model,
      verdict: forced.length ? "BLOCKED" : "APPROVED",
    };
  }

  try {
    const parsed = extractJsonObject(res.text) as Record<string, unknown>;
    const defects = [...forced, ...parseDefects(parsed.defects)];
    const hasBlocker = defects.some((d) => d.priority === "BLOCKER");
    const hasMajor = defects.some((d) => d.priority === "MAJOR");
    const verdictRaw = String(parsed.verdict ?? "").toUpperCase();
    let approved =
      forced.length === 0 &&
      (parsed.approved === true || verdictRaw === "APPROVED") &&
      !hasBlocker &&
      verdictRaw !== "BLOCKED" &&
      verdictRaw !== "REVISION_REQUIRED";
    // Major from AD = not approved (must go back to scriptwriter)
    if (hasMajor) approved = false;
    const verdict: ScriptAdResult["verdict"] = hasBlocker
      ? "BLOCKED"
      : approved
        ? "APPROVED"
        : "REVISION_REQUIRED";
    return {
      approved,
      defects,
      notes: String(parsed.notes ?? ""),
      model: res.model,
      verdict,
    };
  } catch {
    return {
      approved: false,
      defects: [
        ...forced,
        {
          priority: "MAJOR",
          slide_index: 0,
          element: "ad_script_parse",
          reason: "AD сценария вернул нечитаемый JSON — нужна повторная проверка",
          fix: "Переписать сценарий яснее и снова отдать на приёмку",
        },
      ],
      notes: "ad_script_parse_fail",
      model: res.model,
      verdict: "REVISION_REQUIRED",
    };
  }
}

/** Format AD defects into revision brief for the scriptwriter mask. */
export function formatScriptRevisionNotes(
  ad: ScriptAdResult,
  round: number,
): string {
  const lines = [
    `REVISION_ROUND=${round} (арт-директор сценария → сценаристу)`,
    ad.notes ? `Заметка AD: ${ad.notes}` : "",
    "Исправь сценарий по пунктам (сохрани сильное, перепиши слабое):",
    ...ad.defects.map(
      (d) =>
        `- [${d.priority}] слайд ${d.slide_index || "—"} · ${d.element}: ${d.reason} → FIX: ${d.fix}`,
    ),
  ];
  return lines.filter(Boolean).join("\n");
}
