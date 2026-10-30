/**
 * FACT_CHECK branch (ТЗ): research questions → Research → Fact-Checker →
 * final script → AD editorial → final Fact-Checker.
 * STANDARD branch never enters here.
 */
import { callAggregatorChat } from "@/lib/llm/aggregator-chat";
import {
  runFactCheckerOnResearch,
  runFactCheckerOnScript,
  type FactCheckResult,
} from "./fact-checker";
import { resolveFactCheckBranch } from "./fact-check-flag";
import { extractJsonObject } from "./json-parse";
import type { JobLlmSession } from "./job-llm-session";
import { runResearchAgent, type ResearchReport } from "./research-agent";
import { resolveRoleModel } from "./role-models";
import { runScriptApprovalLoop } from "./script-approval-loop";
import { runScriptwriter } from "./scriptwriter";
import type {
  VernatunJobBrief,
  VernatunProgressFn,
  VernatunScript,
} from "./types";

const PROMPT_RESEARCH_QUESTIONS = `Ты — маска «Сценарист» Vernatun на этапе FACT_CHECK.
Сформулируй 3–5 конкретных исследовательских вопросов по теме (цифры, правила, сроки, службы, ограничения).
Не утверждай факты. Верни ТОЛЬКО JSON: { "research_questions": string[] }`;

export type FactCheckPipelineLog = {
  branch: "STANDARD" | "FACT_CHECK";
  factCheckRaw: string;
  warning?: string;
  questions?: string[];
  research?: ResearchReport;
  factCheckResearch?: FactCheckResult;
  factCheckFinal?: FactCheckResult;
  blocked?: boolean;
  blockReason?: string;
};

async function progress(
  onProgress: VernatunProgressFn | undefined,
  agent: string,
  message: string,
): Promise<void> {
  if (onProgress) await onProgress(agent, message);
}

async function askResearchQuestions(
  brief: VernatunJobBrief,
  session?: JobLlmSession,
): Promise<string[]> {
  const user = [
    `Тема: ${brief.topic}`,
    brief.audience ? `Аудитория: ${brief.audience}` : "",
    brief.styleNotes ? `Заметки: ${brief.styleNotes.slice(0, 800)}` : "",
    "Нужны вопросы для веб-исследования (посылки / правила / сроки / ограничения — по теме).",
  ]
    .filter(Boolean)
    .join("\n");

  const model = resolveRoleModel("scriptwriter");
  const res = session
    ? await session.callMask({
        role: "scriptwriter",
        system: PROMPT_RESEARCH_QUESTIONS,
        user,
        temperature: 0.3,
        maxTokens: 1024,
      })
    : await callAggregatorChat({
        system: PROMPT_RESEARCH_QUESTIONS,
        user,
        model: model.model,
        temperature: 0.3,
        maxTokens: 1024,
        fallbackModels: true,
      });

  if (!res.ok) {
    return [
      `${brief.topic}: актуальные правила и ограничения`,
      `${brief.topic}: официальные службы и сайты`,
      `${brief.topic}: типичные ошибки и что проверить`,
    ];
  }
  try {
    const parsed = extractJsonObject(res.text) as Record<string, unknown>;
    const q = Array.isArray(parsed.research_questions)
      ? parsed.research_questions.map(String).filter((s) => s.trim())
      : [];
    if (q.length) return q.slice(0, 6);
  } catch {
    /* */
  }
  return [
    `${brief.topic}: актуальные правила и ограничения`,
    `${brief.topic}: официальные источники`,
  ];
}

function researchStyleBlock(report: ResearchReport): string {
  const verified = report.claims.filter((c) => c.status === "VERIFIED");
  const lines = verified.slice(0, 12).map(
    (c) =>
      `- [${c.claim_id}] ${c.safe_wording || c.claim} (src: ${c.source_url})`,
  );
  return `FACT_CHECK_RESEARCH_LOCK (HARD):
Пиши сценарий ТОЛЬКО на проверенных пунктах ниже. Числа/%/сроки вне списка — запрещены (смягчи или убери).
NEEDS_REVIEW/REJECTED не выдавай за факт.
${lines.join("\n") || "- (нет VERIFIED — пиши hedge без цифр)"}
`;
}

/**
 * Run script phase with optional FACT_CHECK masks.
 * Returns script + approval meta + fact-check log.
 */
export async function runScriptPhaseWithOptionalFactCheck(input: {
  brief: VernatunJobBrief;
  /** Initial script if already written (STANDARD path). */
  script?: VernatunScript;
  session?: JobLlmSession;
  onProgress?: VernatunProgressFn;
  onLog?: (log: FactCheckPipelineLog) => void | Promise<void>;
}): Promise<{
  script: VernatunScript;
  approved: boolean;
  rounds: number;
  defects: import("./types").VernatunDefect[];
  notes: string;
  model: string;
  verdict?: "APPROVED" | "REVISION_REQUIRED" | "BLOCKED";
  factLog: FactCheckPipelineLog;
}> {
  const flag = resolveFactCheckBranch(input.brief);
  const factLog: FactCheckPipelineLog = {
    branch: flag.branch,
    factCheckRaw: flag.raw,
    warning: flag.warning,
  };

  await progress(
    input.onProgress,
    "Арт-директор (сценарий)",
    flag.branch === "FACT_CHECK"
      ? `Ветка FACT_CHECK (flag=${flag.raw || "1"}) — вызываю Research + Fact-Checker.`
      : `Ветка STANDARD (flag=${flag.raw || "пусто"}) — Research/Fact-Checker не вызываю.`,
  );

  if (flag.branch === "STANDARD") {
    let script = input.script;
    if (!script) {
      const sw = await runScriptwriter(input.brief, input.session);
      script = sw.script;
    }
    const approval = await runScriptApprovalLoop({
      brief: input.brief,
      script,
      session: input.session,
      onProgress: input.onProgress,
    });
    factLog.blocked = !approval.approved;
    if (input.onLog) await input.onLog(factLog);
    return { ...approval, factLog };
  }

  // ——— FACT_CHECK ———
  await progress(
    input.onProgress,
    "Сценарист",
    "FACT_CHECK: формулирую вопросы для исследования…",
  );
  const questions = await askResearchQuestions(input.brief, input.session);
  factLog.questions = questions;

  await progress(
    input.onProgress,
    "Research Agent",
    "Ищу источники в интернете и открываю страницы…",
  );
  const research = await runResearchAgent({
    topic: input.brief.topic,
    questions,
    session: input.session,
  });
  factLog.research = research;

  await progress(
    input.onProgress,
    "Fact-Checker",
    "Проверяю исследовательскую базу…",
  );
  const fcBase = await runFactCheckerOnResearch(research, input.session);
  factLog.factCheckResearch = fcBase;

  if (!research.research_available || fcBase.status === "BLOCKED") {
    factLog.blocked = true;
    factLog.blockReason =
      research.unavailable_reason ||
      fcBase.summary ||
      "FACT_CHECK_BLOCKED_RESEARCH";
    // Hedged script + editorial AD still run — visual pipeline may continue,
    // but job must NOT be claimed as fact-checked FINAL (orchestrator + factLog.blocked).
    const sw = await runScriptwriter(
      {
        ...input.brief,
        styleNotes: [
          input.brief.styleNotes ?? "",
          "FACT_CHECK_FALLBACK: веб-исследование недоступно или BLOCKED. Без точных цифр/%/сроков. Только hedge + общие шаги. Не выдавай это за проверенные факты.",
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
      input.session,
    );
    const approval = await runScriptApprovalLoop({
      brief: input.brief,
      script: sw.script,
      session: input.session,
      onProgress: input.onProgress,
    });
    if (input.onLog) await input.onLog(factLog);
    return {
      ...approval,
      // Editorial may approve; factLog.blocked stays true for release gate.
      notes: `${approval.notes}\n[FACT_CHECK NOT VERIFIED] ${factLog.blockReason}`,
      verdict: approval.approved ? "REVISION_REQUIRED" : approval.verdict,
      factLog,
    };
  }

  await progress(
    input.onProgress,
    "Сценарист",
    "Пишу сценарий на проверенных фактах…",
  );
  const sw = await runScriptwriter(
    {
      ...input.brief,
      styleNotes: [input.brief.styleNotes ?? "", researchStyleBlock(research)]
        .filter(Boolean)
        .join("\n\n"),
    },
    input.session,
  );

  const approval = await runScriptApprovalLoop({
    brief: input.brief,
    script: sw.script,
    session: input.session,
    onProgress: input.onProgress,
  });

  await progress(
    input.onProgress,
    "Fact-Checker",
    "Финальная проверка текстов слайдов…",
  );
  let fcFinal = await runFactCheckerOnScript(
    approval.script,
    research,
    input.session,
  );
  factLog.factCheckFinal = fcFinal;

  let script = approval.script;
  let rounds = approval.rounds;
  let notes = approval.notes;
  let defects = approval.defects;
  let approved = approval.approved;

  if (fcFinal.status === "BLOCKED" && approval.approved) {
    await progress(
      input.onProgress,
      "Сценарист",
      "Fact-Checker BLOCKED — правлю формулировки…",
    );
    const fixNotes = fcFinal.findings
      .map((f) => `- ${f.issue} → ${f.recommended_change}`)
      .join("\n");
    const sw2 = await runScriptwriter(
      {
        ...input.brief,
        styleNotes: [
          input.brief.styleNotes ?? "",
          researchStyleBlock(research),
          `FACT_CHECKER_REVISION:\n${fixNotes}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
      input.session,
    );
    script = sw2.script;
    rounds += 1;
    const approval2 = await runScriptApprovalLoop({
      brief: input.brief,
      script,
      session: input.session,
      onProgress: input.onProgress,
    });
    script = approval2.script;
    notes = approval2.notes;
    defects = approval2.defects;
    rounds += approval2.rounds;
    approved = approval2.approved;
    fcFinal = await runFactCheckerOnScript(script, research, input.session);
    factLog.factCheckFinal = fcFinal;
  }

  if (fcFinal.status === "BLOCKED") {
    factLog.blocked = true;
    factLog.blockReason = fcFinal.summary || "final_factcheck_blocked";
    notes = `${notes}\n[FACT_CHECK FINAL BLOCKED] ${factLog.blockReason}`;
  }

  if (input.onLog) await input.onLog(factLog);

  return {
    script,
    approved,
    rounds,
    defects,
    notes,
    model: approval.model,
    verdict: approved
      ? factLog.blocked
        ? "REVISION_REQUIRED"
        : "APPROVED"
      : approval.verdict,
    factLog,
  };
}
