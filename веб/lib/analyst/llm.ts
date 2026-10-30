/**
 * Prompt pack loader + LLM call for Analyst (analyst@v2).
 * Secrets never logged. No openai SDK dependency — fetch to Chat Completions.
 *
 * Runtime prefers AGGREGATOR_* (C-34); fallback OPENAI_API_KEY / ANALYST_LLM_API_KEY.
 * Model: request/settings id → env default → gpt-4o-mini (via resolveAggregatorModelId).
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import {
  aggregatorChatCompletionsUrl,
  resolveAggregatorEnv,
  resolveAggregatorModelId,
} from "@/lib/llm/aggregator";

import type { AnalystAggregatesPayload } from "./types";
import { ANALYST_PROMPT_VERSION } from "./types";

export type LlmEnv = {
  apiKey: string;
  model: string;
  /** OpenAI-compatible chat completions endpoint */
  chatUrl: string;
};

export type ResolveLlmEnvOptions = {
  /** UI / request model id (e.g. from Settings localStorage catalog). */
  modelId?: string;
};

/**
 * Resolve LLM key without logging its value. Prefer aggregator env.
 * Model priority: options.modelId → ANALYST_LLM_MODEL / OPENAI_MODEL →
 * AGGREGATOR_DEFAULT_MODEL → gpt-4o-mini (with optional AGGREGATOR_MODEL_MAP_*).
 */
export function resolveLlmEnv(options: ResolveLlmEnvOptions = {}): LlmEnv | null {
  const agg = resolveAggregatorEnv();
  if (!agg) return null;

  const preferred =
    options.modelId?.trim() ||
    process.env.ANALYST_LLM_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    "";

  return {
    apiKey: agg.apiKey,
    model: resolveAggregatorModelId(preferred),
    chatUrl: aggregatorChatCompletionsUrl(agg.baseUrl),
  };
}

/**
 * Load system + user template from workers/analyst/prompt.md (versioned pack).
 */
export async function loadAnalystPromptPack(): Promise<{
  version: typeof ANALYST_PROMPT_VERSION;
  system: string;
  userTemplate: string;
}> {
  const promptPath = path.join(
    process.cwd(),
    "workers",
    "analyst",
    "prompt.md",
  );
  const raw = await fs.readFile(promptPath, "utf8");

  const systemBlock = raw.match(/## SYSTEM\s*```\s*([\s\S]*?)```/);
  const userBlock = raw.match(
    /## USER template[\s\S]*?```\s*([\s\S]*?)```\s*\n---/,
  );

  const system = systemBlock?.[1]?.trim();
  const user = userBlock?.[1]?.trim();

  if (!system || !user) {
    throw new Error(
      `Analyst prompt pack missing SYSTEM/USER sections (${ANALYST_PROMPT_VERSION})`,
    );
  }

  return {
    version: ANALYST_PROMPT_VERSION,
    system,
    userTemplate: user,
  };
}

export function renderAnalystUserPrompt(
  userTemplate: string,
  aggregates: AnalystAggregatesPayload,
): string {
  return userTemplate.replace(
    "{{AGGREGATES_JSON}}",
    JSON.stringify(aggregates, null, 2),
  );
}

export type ChatCompletionResult = {
  content: string;
  model: string;
};

/**
 * Call OpenAI-compatible chat completions. Does not log apiKey or raw secrets.
 */
export async function callAnalystLlm(input: {
  system: string;
  user: string;
  env: LlmEnv;
  signal?: AbortSignal;
}): Promise<ChatCompletionResult> {
  const res = await fetch(input.env.chatUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.env.apiKey}`,
    },
    body: JSON.stringify({
      model: input.env.model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
    }),
    signal: input.signal,
  });

  if (!res.ok) {
    // Do not include response body if it might echo auth — status only.
    throw new Error(`Analyst LLM HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    model?: string;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Analyst LLM empty content");
  }

  return {
    content,
    model: data.model ?? input.env.model,
  };
}
