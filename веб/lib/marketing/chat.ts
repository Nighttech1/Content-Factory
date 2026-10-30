/**
 * AI Bridge + Backend — Marketing Director chat with optional tool loop.
 * Uses Polza/aggregator; model default Haiku 4.5 + thinking.
 * Never logs API keys.
 */

import {
  aggregatorChatCompletionsUrl,
  resolveAggregatorEnv,
  resolveAggregatorModelId,
} from "@/lib/llm/aggregator";
import {
  MARKETING_DIRECTOR_MODEL,
  MARKETING_DIRECTOR_SYSTEM_PROMPT,
  MARKETING_TOOL_INSTRUCTIONS,
} from "@/lib/marketing/prompt";
import {
  executeMarketingTool,
  MARKETING_OPENAI_TOOLS,
} from "@/lib/marketing/tools";

export type MarketingChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export type MarketingChatResult =
  | {
      ok: true;
      reply: string;
      model: string;
      source: "live";
      toolsUsed: string[];
    }
  | { ok: false; error: string; source: "error" };

type Msg =
  | { role: "system" | "user" | "assistant"; content: string }
  | {
      role: "assistant";
      content: string | null;
      tool_calls: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    }
  | { role: "tool"; tool_call_id: string; content: string };

const HISTORY_LIMIT = 16;
const MAX_TOOL_ROUNDS = 3;

async function postChat(
  env: { apiKey: string; baseUrl: string },
  payload: Record<string, unknown>,
): Promise<
  | {
      ok: true;
      message: {
        role?: string;
        content?: string | null;
        tool_calls?: Array<{
          id: string;
          type?: string;
          function?: { name?: string; arguments?: string };
        }>;
      };
      model: string;
    }
  | { ok: false; error: string }
> {
  let res: Response;
  try {
    res = await fetch(aggregatorChatCompletionsUrl(env.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, error: "aggregator_network" };
  }

  if (!res.ok) {
    return { ok: false, error: `aggregator_http_${res.status}` };
  }

  let data: {
    choices?: Array<{ message?: Msg & { content?: string | null } }>;
    model?: string;
  };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    return { ok: false, error: "aggregator_bad_json" };
  }

  const message = data.choices?.[0]?.message;
  if (!message) {
    return { ok: false, error: "aggregator_empty" };
  }

  return {
    ok: true,
    message: message as {
      role?: string;
      content?: string | null;
      tool_calls?: Array<{
        id: string;
        type?: string;
        function?: { name?: string; arguments?: string };
      }>;
    },
    model:
      typeof data.model === "string" && data.model.trim()
        ? data.model
        : String(payload.model ?? ""),
  };
}

export async function runMarketingDirectorChat(input: {
  user: string;
  history?: MarketingChatTurn[];
  model?: string;
  thinking?: boolean;
}): Promise<MarketingChatResult> {
  const env = resolveAggregatorEnv();
  if (!env) {
    return { ok: false, error: "aggregator_key_missing", source: "error" };
  }

  const user = typeof input.user === "string" ? input.user.trim() : "";
  if (!user) {
    return { ok: false, error: "empty_user", source: "error" };
  }

  const model = resolveAggregatorModelId(
    input.model?.trim() || MARKETING_DIRECTOR_MODEL,
  );

  const history = (input.history ?? [])
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim(),
    )
    .slice(-HISTORY_LIMIT)
    .map((m) => ({ role: m.role, content: m.content.trim() }));

  const system = `${MARKETING_DIRECTOR_SYSTEM_PROMPT}\n${MARKETING_TOOL_INSTRUCTIONS}`;

  const messages: Msg[] = [
    { role: "system", content: system },
    ...history,
    { role: "user", content: user },
  ];

  const toolsUsed: string[] = [];
  let lastModel = model;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const payload: Record<string, unknown> = {
      model,
      temperature: 0.45,
      max_tokens: 2048,
      messages,
      tools: MARKETING_OPENAI_TOOLS,
      tool_choice: "auto",
    };

    if (input.thinking !== false) {
      payload.reasoning = { effort: "high" };
      payload.thinking = { type: "enabled" };
      payload.extra_body = {
        reasoning: { effort: "high" },
        thinking: { type: "enabled" },
      };
    }

    const result = await postChat(env, payload);
    if (!result.ok) {
      return { ok: false, error: result.error, source: "error" };
    }

    lastModel = result.model || model;
    const toolCalls = result.message.tool_calls?.filter(
      (tc) => tc?.function?.name && tc.id,
    );

    if (toolCalls && toolCalls.length > 0) {
      messages.push({
        role: "assistant",
        content: result.message.content ?? null,
        tool_calls: toolCalls.map((tc) => ({
          id: tc.id,
          type: "function" as const,
          function: {
            name: tc.function?.name ?? "unknown",
            arguments: tc.function?.arguments ?? "{}",
          },
        })),
      });

      for (const tc of toolCalls) {
        const name = tc.function?.name ?? "unknown";
        toolsUsed.push(name);
        const toolResult = await executeMarketingTool(
          name,
          tc.function?.arguments ?? "{}",
        );
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: toolResult,
        });
      }
      continue;
    }

    const text =
      typeof result.message.content === "string"
        ? result.message.content.trim()
        : "";
    if (!text) {
      return { ok: false, error: "aggregator_empty", source: "error" };
    }

    return {
      ok: true,
      reply: text,
      model: lastModel,
      source: "live",
      toolsUsed,
    };
  }

  return { ok: false, error: "tool_loop_exhausted", source: "error" };
}
