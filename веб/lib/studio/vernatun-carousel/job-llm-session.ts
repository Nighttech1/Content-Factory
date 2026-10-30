/**
 * One orchestrator LLM brain per job — roles are masks (like Cursor subagents).
 * Shared transcript so later masks see prior decisions.
 */

import {
  callAggregatorChat,
  type AggregatorChatMessage,
  type CallAggregatorChatResult,
} from "@/lib/llm/aggregator-chat";
import { resolveRoleModel, resolveTextOrchestratorModel } from "./role-models";
import type { RoleId } from "./types";

export type JobLlmSession = {
  jobId: string;
  model: string;
  history: AggregatorChatMessage[];
  callMask: (input: {
    role: RoleId;
    system: string;
    user: string;
    images?: string[];
    temperature?: number;
    maxTokens?: number;
    thinking?: boolean;
  }) => Promise<CallAggregatorChatResult>;
  dump: () => AggregatorChatMessage[];
};

export function createJobLlmSession(jobId: string): JobLlmSession {
  const model = resolveTextOrchestratorModel();
  const history: AggregatorChatMessage[] = [];

  return {
    jobId,
    model,
    history,
    dump: () => [...history],
    async callMask(input) {
      // Shared text brain for most masks; but roles with their OWN strong model
      // keep it — image gen, deterministic QA, AND the vision Art Director + the
      // creative Scriptwriter (Sonnet). Otherwise the AD places vocab pills / judges
      // slides on the weak flash brain (client: плашки должна ставить сильная AD).
      const roleCfg = resolveRoleModel(input.role);
      const useModel =
        input.role === "imageGen" ||
        input.role === "qa" ||
        input.role === "artDirectorFinal" ||
        input.role === "scriptwriter"
          ? roleCfg.model
          : model;

      const res = await callAggregatorChat({
        system: `[MASK:${input.role}]\n${input.system}`,
        user: input.user,
        images: input.images,
        history: history.slice(-24),
        model: useModel,
        temperature: input.temperature ?? 0.4,
        maxTokens: input.maxTokens ?? 4096,
        thinking: input.thinking,
        reasoningEffort: input.thinking ? "high" : undefined,
        fallbackModels: [
          "google/gemini-2.0-flash",
          "openai/gpt-4o",
          "openai/gpt-4o-mini",
        ],
      });

      if (res.ok) {
        history.push({
          role: "user",
          content: `[${input.role}] ${input.user.slice(0, 2000)}`,
        });
        history.push({
          role: "assistant",
          content: `[${input.role}] ${res.text.slice(0, 4000)}`,
        });
      }
      return res;
    },
  };
}
