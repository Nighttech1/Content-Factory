/**
 * Оркестратор LLM — финальный надзор над отчётами QA + AD.
 * Не может «забраковать» proposed FINAL без жёсткого wow/blocker/QA FAIL.
 */

import { callAggregatorChat } from "@/lib/llm/aggregator-chat";
import { resolveRoleModel } from "./role-models";
import { extractJsonObject } from "./json-parse";
import type { QaReport, VernatunDefect, VernatunReleaseStatus } from "./types";

export type SupervisorVerdict = {
  status: VernatunReleaseStatus;
  remarks: string[];
  summary: string;
  model: string;
};

function hasHardBlock(defects: VernatunDefect[], qa: QaReport | null): boolean {
  if (qa?.status === "FAIL") return true;
  if (defects.some((d) => d.priority === "BLOCKER")) {
    return defects.some((d) => {
      if (d.priority !== "BLOCKER") return false;
      const blob = `${d.element} ${d.reason} ${d.fix}`.toLowerCase();
      // Ignore craft blockers (hyphen / empty) — those are demoted upstream
      return /concert|концерт|сцен|user.?asset|contrast|контраст|quality|qa/.test(
        blob,
      );
    })
      ? true
      : defects.some((d) => d.priority === "BLOCKER");
  }
  return defects.some((d) => {
    if (d.priority !== "MAJOR") return false;
    const blob = `${d.element} ${d.reason} ${d.fix}`.toLowerCase();
    return (
      /template_clone|одинаков(ый|ые) (шаблон|силуэт)/.test(blob) ||
      /concert|концерт|барабан|djembe|чужеродн/.test(blob) ||
      /фон не поддержив|user.?asset|user-фото/.test(blob)
    );
  });
}

export async function runPipelineSupervisor(input: {
  buildMode: "A" | "B";
  qa: QaReport | null;
  defects: VernatunDefect[];
  proposedStatus: VernatunReleaseStatus;
  remarks: string[];
}): Promise<SupervisorVerdict> {
  const model = resolveRoleModel("orchestrator");
  const modelId = model.model.includes("mini")
    ? "openai/gpt-4o"
    : model.model;

  const hardBlock = hasHardBlock(input.defects, input.qa);

  // Deterministic first: proposed FINAL + no hard block → keep FINAL (LLM cannot veto).
  if (input.proposedStatus === "FINAL" && !hardBlock) {
    return {
      status: "FINAL",
      remarks: input.remarks,
      summary: "supervisor_confirm_final",
      model: modelId,
    };
  }

  if (input.proposedStatus !== "FINAL" && hardBlock) {
    return {
      status: "BLOCKED_WITH_REMARKS",
      remarks: input.remarks,
      summary: "supervisor_hard_block",
      model: modelId,
    };
  }

  const res = await callAggregatorChat({
    system: `Ты — оркестратор Vernatun. Реши FINAL или BLOCKED_WITH_REMARKS.
Правила:
- BLOCKER (concert/user/contrast) или qa FAIL → не FINAL.
- proposedStatus=FINAL и нет hard-block → оставь FINAL (minor remarks ок).
- Не повышай BLOCKED до FINAL.
JSON: { "status": "FINAL"|"BLOCKED_WITH_REMARKS", "remarks": string[], "summary": string }`,
    user: JSON.stringify(
      {
        buildMode: input.buildMode,
        proposedStatus: input.proposedStatus,
        qa: input.qa,
        defects: input.defects,
        remarks: input.remarks,
        hardBlock,
      },
      null,
      2,
    ),
    model: modelId,
    temperature: 0.1,
    maxTokens: 800,
    fallbackModels: ["openai/gpt-4o"],
  });

  if (!res.ok) {
    return {
      status: input.proposedStatus,
      remarks: input.remarks,
      summary: `supervisor_skip:${res.error}`,
      model: modelId,
    };
  }

  try {
    const parsed = extractJsonObject(res.text) as Record<string, unknown>;
    const statusRaw = String(parsed.status ?? input.proposedStatus);
    let status: VernatunReleaseStatus =
      statusRaw === "FINAL" ? "FINAL" : "BLOCKED_WITH_REMARKS";

    if (input.proposedStatus === "FINAL" && !hardBlock) status = "FINAL";
    if (status === "FINAL" && hardBlock) status = "BLOCKED_WITH_REMARKS";
    if (
      input.proposedStatus === "BLOCKED_WITH_REMARKS" &&
      status === "FINAL" &&
      hardBlock
    ) {
      status = "BLOCKED_WITH_REMARKS";
    }

    const remarks = Array.isArray(parsed.remarks)
      ? parsed.remarks.map(String)
      : input.remarks;
    return {
      status,
      remarks,
      summary: String(parsed.summary ?? ""),
      model: res.model,
    };
  } catch {
    return {
      status: input.proposedStatus,
      remarks: input.remarks,
      summary: "supervisor_parse_fail",
      model: res.model,
    };
  }
}
