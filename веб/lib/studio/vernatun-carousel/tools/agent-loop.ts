import { appendToolLog } from "./tool-log";
import type { ToolExecutor } from "./executor";

export type AgentToolCall = {
  name: string;
  args?: Record<string, unknown>;
};

export type AgentLlmDecision =
  | { type: "tools"; calls: AgentToolCall[] }
  | { type: "done"; status: string; summary?: string };

export type AgentLoopResult = {
  steps: number;
  toolCallCount: number;
  status: string;
  summary: string;
  lastResults: unknown[];
};

/**
 * Generic agent loop: LLM decides tools or done; executor runs tools.
 * Accepts injectible callLlm for tests (mock ≥2 tools then finalize).
 */
export async function runAgentLoop(input: {
  jobDir?: string;
  maxSteps?: number;
  executor: ToolExecutor;
  callLlm: (ctx: {
    step: number;
    lastResults: unknown[];
  }) => Promise<AgentLlmDecision>;
}): Promise<AgentLoopResult> {
  const maxSteps = input.maxSteps ?? 12;
  let toolCallCount = 0;
  let lastResults: unknown[] = [];
  let status = "BUILDING";
  let summary = "";

  for (let step = 0; step < maxSteps; step++) {
    const decision = await input.callLlm({ step, lastResults });
    if (decision.type === "done") {
      status = decision.status;
      summary = decision.summary ?? "";
      if (input.jobDir) {
        await appendToolLog(input.jobDir, {
          at: new Date().toISOString(),
          name: "finalize",
          args: { status, summary },
          ok: true,
          detail: "agent_done",
        });
      }
      return { steps: step + 1, toolCallCount, status, summary, lastResults };
    }

    const batchResults: unknown[] = [];
    for (const call of decision.calls) {
      toolCallCount += 1;
      try {
        const result = await input.executor.execute(call.name, call.args ?? {});
        batchResults.push({ name: call.name, ok: true, result });
        if (input.jobDir) {
          await appendToolLog(input.jobDir, {
            at: new Date().toISOString(),
            name: call.name,
            args: call.args,
            ok: true,
            detail: typeof result === "string" ? result.slice(0, 200) : "ok",
          });
        }
        if (call.name === "finalize") {
          const r = result as { status?: string; summary?: string };
          return {
            steps: step + 1,
            toolCallCount,
            status: r.status ?? "FINAL",
            summary: r.summary ?? "",
            lastResults: batchResults,
          };
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        batchResults.push({ name: call.name, ok: false, error: msg });
        if (input.jobDir) {
          await appendToolLog(input.jobDir, {
            at: new Date().toISOString(),
            name: call.name,
            args: call.args,
            ok: false,
            detail: msg,
          });
        }
        if (msg.startsWith("unknown_tool:")) throw err;
      }
    }
    lastResults = batchResults;
  }

  return {
    steps: maxSteps,
    toolCallCount,
    status: "BLOCKED_WITH_REMARKS",
    summary: "agent_loop_max_steps",
    lastResults,
  };
}

/**
 * Default Vernatun Framework B tool plan (no HTML designer stage).
 * Used when CAROUSEL_AGENT_LOOP=1 — wraps real stage runners.
 * afterVision must return "repair" when majors remain (Client hard gate).
 */
export async function runDefaultVernatunToolPlan(input: {
  jobDir: string;
  executor: ToolExecutor;
  afterVision?: (vision: unknown) => Promise<"repair" | "finalize">;
}): Promise<AgentLoopResult> {
  // B-only product path — colors → script(N) → images → render → qa → vision → finalize
  const plan: AgentToolCall[] = [
    { name: "load_design_colors" },
    { name: "write_script" },
    { name: "plan_images" },
    { name: "build_and_render" },
    { name: "qa_auto" },
    { name: "vision_review" },
  ];

  let step = 0;
  return runAgentLoop({
    jobDir: input.jobDir,
    maxSteps: 16,
    executor: input.executor,
    callLlm: async ({ step: s, lastResults }) => {
      if (s < plan.length) {
        return { type: "tools", calls: [plan[s]!] };
      }
      const vision = lastResults.find(
        (r) =>
          r &&
          typeof r === "object" &&
          (r as { name?: string }).name === "vision_review",
      );
      const verdict = input.afterVision
        ? await input.afterVision(vision)
        : "finalize";
      if (verdict === "repair" && step < 2) {
        step += 1;
        return {
          type: "tools",
          calls: [
            { name: "repair_slides" },
            { name: "build_and_render" },
            { name: "qa_auto" },
            { name: "vision_review" },
          ],
        };
      }
      return {
        type: "tools",
        calls: [
          {
            name: "finalize",
            args: { status: "FINAL", summary: "agent_tool_plan_complete" },
          },
        ],
      };
    },
  });
}
