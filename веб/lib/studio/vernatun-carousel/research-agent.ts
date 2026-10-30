/**
 * Research Agent — ONLY in FACT_CHECK branch.
 * Builds ResearchReport from live web packs + LLM structuring.
 */
import { callAggregatorChat } from "@/lib/llm/aggregator-chat";
import { extractJsonObject } from "./json-parse";
import type { JobLlmSession } from "./job-llm-session";
import { resolveRoleModel } from "./role-models";
import {
  gatherResearchSources,
  researchIsUsable,
  type ResearchSourcePack,
} from "./web-research";

export type ClaimStatus = "VERIFIED" | "NEEDS_REVIEW" | "REJECTED";

export type ResearchClaim = {
  claim_id: string;
  claim: string;
  status: ClaimStatus;
  source_title: string;
  source_url: string;
  source_type: "official" | "primary" | "reputable_media" | "other";
  supporting_excerpt: string;
  published_or_updated_at: string | null;
  checked_at: string;
  limitations: string[];
  safe_wording: string;
};

export type ResearchReport = {
  topic: string;
  checked_at: string;
  research_available: boolean;
  unavailable_reason?: string;
  questions: string[];
  claims: ResearchClaim[];
  source_packs: ResearchSourcePack[];
};

export const PROMPT_RESEARCH_AGENT = `Ты — маска «Research Agent» Vernatun (FACT_CHECK).
Тебе дали тему, вопросы исследования и РЕАЛЬНЫЕ фрагменты веб-страниц (не выдумывай URL/цифры).
Задача: собрать JSON ResearchReport.claims[] — только то, что подтверждается выдержками.

Правила:
- Приоритет: official/primary (госсайты, документы, сайты служб).
- Каждому claim: source_url из входных паков, supporting_excerpt из текста страницы.
- status: VERIFIED | NEEDS_REVIEW | REJECTED.
- Неподтверждённое → NEEDS_REVIEW или REJECTED + limitations.
- safe_wording = безопасная формулировка для сценария (без ложной точности).
- Нельзя выдумывать URL, даты, цифры, которых нет во входных текстах.

Верни ТОЛЬКО JSON:
{ "claims": [ { "claim_id","claim","status","source_title","source_url","source_type","supporting_excerpt","published_or_updated_at","limitations","safe_wording" } ] }`;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseClaims(raw: unknown, checkedAt: string): ResearchClaim[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((c, i) => {
      const o = (c ?? {}) as Record<string, unknown>;
      const st = String(o.status ?? "NEEDS_REVIEW").toUpperCase();
      const status: ClaimStatus =
        st === "VERIFIED" || st === "REJECTED" ? st : "NEEDS_REVIEW";
      const sourceType = String(o.source_type ?? "other");
      return {
        claim_id: String(o.claim_id ?? `claim_${String(i + 1).padStart(3, "0")}`),
        claim: String(o.claim ?? "").trim(),
        status,
        source_title: String(o.source_title ?? "").trim(),
        source_url: String(o.source_url ?? "").trim(),
        source_type:
          sourceType === "official" ||
          sourceType === "primary" ||
          sourceType === "reputable_media"
            ? (sourceType as ResearchClaim["source_type"])
            : "other",
        supporting_excerpt: String(o.supporting_excerpt ?? "").trim(),
        published_or_updated_at:
          o.published_or_updated_at == null
            ? null
            : String(o.published_or_updated_at),
        checked_at: checkedAt,
        limitations: Array.isArray(o.limitations)
          ? o.limitations.map(String)
          : [],
        safe_wording: String(o.safe_wording ?? o.claim ?? "").trim(),
      };
    })
    .filter((c) => c.claim.length > 0);
}

export async function runResearchAgent(input: {
  topic: string;
  questions: string[];
  session?: JobLlmSession;
}): Promise<ResearchReport> {
  const checkedAt = today();
  const questions = input.questions
    .map((q) => q.trim())
    .filter(Boolean)
    .slice(0, 6);
  if (!questions.length) {
    return {
      topic: input.topic,
      checked_at: checkedAt,
      research_available: false,
      unavailable_reason: "no_research_questions",
      questions: [],
      claims: [],
      source_packs: [],
    };
  }

  const packs = await gatherResearchSources(questions);
  if (!researchIsUsable(packs)) {
    return {
      topic: input.topic,
      checked_at: checkedAt,
      research_available: false,
      unavailable_reason: "RESEARCH_UNAVAILABLE",
      questions,
      claims: [],
      source_packs: packs,
    };
  }

  const user = [
    `Тема: ${input.topic}`,
    `Дата проверки: ${checkedAt}`,
    "Вопросы:",
    ...questions.map((q, i) => `${i + 1}. ${q}`),
    "",
    "Источникые паки (JSON):",
    JSON.stringify(
      packs.map((p) => ({
        query: p.query,
        available: p.available,
        hits: p.hits.map((h) => ({
          title: h.title,
          url: h.url,
          snippet: h.snippet,
          excerpt: (h.excerpt ?? "").slice(0, 1800),
          fetch_error: h.fetch_error,
        })),
      })),
      null,
      2,
    ),
  ].join("\n");

  const model = resolveRoleModel("researchAgent");
  const res = input.session
    ? await input.session.callMask({
        role: "researchAgent",
        system: PROMPT_RESEARCH_AGENT,
        user,
        temperature: 0.2,
        maxTokens: 4096,
      })
    : await callAggregatorChat({
        system: PROMPT_RESEARCH_AGENT,
        user,
        model: model.model,
        temperature: 0.2,
        maxTokens: 4096,
        fallbackModels: true,
      });

  if (!res.ok) {
    return {
      topic: input.topic,
      checked_at: checkedAt,
      research_available: false,
      unavailable_reason: `research_llm_${res.error}`,
      questions,
      claims: [],
      source_packs: packs,
    };
  }

  let claims: ResearchClaim[] = [];
  try {
    const parsed = extractJsonObject(res.text) as Record<string, unknown>;
    claims = parseClaims(parsed.claims, checkedAt);
  } catch {
    claims = [];
  }

  return {
    topic: input.topic,
    checked_at: checkedAt,
    research_available: true,
    questions,
    claims,
    source_packs: packs,
  };
}
