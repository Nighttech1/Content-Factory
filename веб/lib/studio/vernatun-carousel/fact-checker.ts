/**
 * Fact-Checker — ONLY in FACT_CHECK branch.
 * Checks research base and final slide texts.
 */
import { callAggregatorChat } from "@/lib/llm/aggregator-chat";
import { extractJsonObject } from "./json-parse";
import type { JobLlmSession } from "./job-llm-session";
import type { ResearchReport } from "./research-agent";
import { resolveRoleModel } from "./role-models";
import type { VernatunScript } from "./types";

export type FactCheckStatus = "PASS" | "PASS_WITH_WARNINGS" | "BLOCKED";

export type FactCheckFinding = {
  severity: "blocker" | "major" | "minor";
  claim_id?: string;
  slide_index?: number;
  issue: string;
  recommended_change: string;
};

export type FactCheckResult = {
  status: FactCheckStatus;
  claims_checked: number;
  verified: number;
  needs_review: number;
  rejected: number;
  findings: FactCheckFinding[];
  summary: string;
  phase: "research_base" | "final_script";
};

export const PROMPT_FACT_CHECKER = `Ты — маска «Fact-Checker» Vernatun (FACT_CHECK).
Проверяешь факты против ResearchReport. Не выдумывай источники.

Фазы:
A) research_base — оцени claims в отчёте: нет ли выдуманных URL, пустых excerpt, противоречий.
B) final_script — сверь headline/body/cta/supporting_copy слайдов с VERIFIED/safe_wording; числа/даты/названия без опоры → finding.

Итог status:
- PASS — критичных дыр нет
- PASS_WITH_WARNINGS — мягкие оговорки ок
- BLOCKED — существенные неподтверждённые факты / выдумки / RESEARCH_UNAVAILABLE

Верни ТОЛЬКО JSON:
{ "status","claims_checked","verified","needs_review","rejected","findings":[{"severity","claim_id","slide_index","issue","recommended_change"}],"summary" }`;

function parseResult(
  text: string,
  phase: FactCheckResult["phase"],
  fallback: Partial<FactCheckResult>,
): FactCheckResult {
  try {
    const o = extractJsonObject(text) as Record<string, unknown>;
    const st = String(o.status ?? "BLOCKED").toUpperCase();
    const status: FactCheckStatus =
      st === "PASS" || st === "PASS_WITH_WARNINGS" ? st : "BLOCKED";
    const findingsRaw = Array.isArray(o.findings) ? o.findings : [];
    return {
      status,
      claims_checked: Number(o.claims_checked ?? fallback.claims_checked ?? 0),
      verified: Number(o.verified ?? fallback.verified ?? 0),
      needs_review: Number(o.needs_review ?? fallback.needs_review ?? 0),
      rejected: Number(o.rejected ?? fallback.rejected ?? 0),
      findings: findingsRaw.map((f) => {
        const x = (f ?? {}) as Record<string, unknown>;
        const sev = String(x.severity ?? "major").toLowerCase();
        return {
          severity:
            sev === "blocker" || sev === "minor" ? sev : ("major" as const),
          claim_id: x.claim_id != null ? String(x.claim_id) : undefined,
          slide_index:
            x.slide_index != null ? Number(x.slide_index) : undefined,
          issue: String(x.issue ?? ""),
          recommended_change: String(x.recommended_change ?? ""),
        };
      }),
      summary: String(o.summary ?? ""),
      phase,
    };
  } catch {
    return {
      status: "BLOCKED",
      claims_checked: fallback.claims_checked ?? 0,
      verified: fallback.verified ?? 0,
      needs_review: fallback.needs_review ?? 0,
      rejected: fallback.rejected ?? 0,
      findings: [
        {
          severity: "blocker",
          issue: "fact_checker_json_parse_failed",
          recommended_change: "Перезапустить Fact-Checker / упростить ответ",
        },
      ],
      summary: "parse_failed",
      phase,
    };
  }
}

async function callFc(
  user: string,
  session?: JobLlmSession,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const model = resolveRoleModel("factChecker");
  const res = session
    ? await session.callMask({
        role: "factChecker",
        system: PROMPT_FACT_CHECKER,
        user,
        temperature: 0.15,
        maxTokens: 3072,
      })
    : await callAggregatorChat({
        system: PROMPT_FACT_CHECKER,
        user,
        model: model.model,
        temperature: 0.15,
        maxTokens: 3072,
        fallbackModels: true,
      });
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, text: res.text };
}

/** Gate research base before final script. */
export async function runFactCheckerOnResearch(
  report: ResearchReport,
  session?: JobLlmSession,
): Promise<FactCheckResult> {
  if (!report.research_available) {
    return {
      status: "BLOCKED",
      claims_checked: 0,
      verified: 0,
      needs_review: 0,
      rejected: 0,
      findings: [
        {
          severity: "blocker",
          issue: report.unavailable_reason ?? "RESEARCH_UNAVAILABLE",
          recommended_change:
            "Не выпускать как фактологически проверенный; починить веб-поиск или снять флаг facts",
        },
      ],
      summary: "research_unavailable",
      phase: "research_base",
    };
  }

  const verified = report.claims.filter((c) => c.status === "VERIFIED").length;
  const needs = report.claims.filter((c) => c.status === "NEEDS_REVIEW").length;
  const rejected = report.claims.filter((c) => c.status === "REJECTED").length;

  const user = [
    "Фаза: research_base",
    `Тема: ${report.topic}`,
    `checked_at: ${report.checked_at}`,
    "ResearchReport.claims:",
    JSON.stringify(report.claims, null, 2),
  ].join("\n");

  const res = await callFc(user, session);
  if (!res.ok) {
    return {
      status: "BLOCKED",
      claims_checked: report.claims.length,
      verified,
      needs_review: needs,
      rejected,
      findings: [
        {
          severity: "blocker",
          issue: `fact_checker_llm_${res.error}`,
          recommended_change: "Повторить Fact-Checker",
        },
      ],
      summary: res.error,
      phase: "research_base",
    };
  }
  return parseResult(res.text, "research_base", {
    claims_checked: report.claims.length,
    verified,
    needs_review: needs,
    rejected,
  });
}

/** Final gate on written script texts. */
export async function runFactCheckerOnScript(
  script: VernatunScript,
  report: ResearchReport,
  session?: JobLlmSession,
): Promise<FactCheckResult> {
  if (!report.research_available) {
    return runFactCheckerOnResearch(report, session);
  }

  const slideTexts = script.slides.map((s) => ({
    index: s.index,
    headline: s.headline,
    body: s.body,
    supporting_copy: s.supporting_copy,
    cta: s.cta,
  }));

  const user = [
    "Фаза: final_script",
    `Тема: ${report.topic}`,
    "Разрешённые опоры (VERIFIED + safe_wording):",
    JSON.stringify(
      report.claims.map((c) => ({
        claim_id: c.claim_id,
        status: c.status,
        claim: c.claim,
        safe_wording: c.safe_wording,
        source_url: c.source_url,
      })),
      null,
      2,
    ),
    "",
    "Тексты слайдов:",
    JSON.stringify(slideTexts, null, 2),
  ].join("\n");

  const verified = report.claims.filter((c) => c.status === "VERIFIED").length;
  const needs = report.claims.filter((c) => c.status === "NEEDS_REVIEW").length;
  const rejected = report.claims.filter((c) => c.status === "REJECTED").length;

  const res = await callFc(user, session);
  if (!res.ok) {
    return {
      status: "BLOCKED",
      claims_checked: report.claims.length,
      verified,
      needs_review: needs,
      rejected,
      findings: [
        {
          severity: "blocker",
          issue: `fact_checker_llm_${res.error}`,
          recommended_change: "Повторить Fact-Checker финала",
        },
      ],
      summary: res.error,
      phase: "final_script",
    };
  }
  return parseResult(res.text, "final_script", {
    claims_checked: report.claims.length,
    verified,
    needs_review: needs,
    rejected,
  });
}
