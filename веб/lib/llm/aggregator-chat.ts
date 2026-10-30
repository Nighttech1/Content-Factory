/**
 * C-155 — OpenAI-compatible chat completions via aggregator.
 * Never log apiKey or Authorization headers.
 *
 * C-audit-06 — optional model fallback chain on retryable upstream errors
 * (503/5xx/404), documented — never silent fixture substitution.
 */

import {
  aggregatorChatCompletionsUrl,
  resolveAggregatorEnv,
  resolveAggregatorModelId,
} from "@/lib/llm/aggregator";
import { SCRIPTWRITER_MODEL_FALLBACK_CHAIN } from "@/types/mesh-agent";

export type AggregatorChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/** OpenAI-compatible multimodal parts (vision / design-from-image). */
export type AggregatorChatContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type CallAggregatorChatInput = {
  system: string;
  user: string;
  /**
   * Optional image data URLs (`data:image/...;base64,...`) or https URLs.
   * When set, the user turn is sent as multimodal content parts.
   */
  images?: string[];
  /** Prior turns (user/assistant only). Caller truncates. */
  history?: AggregatorChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /**
   * C-agent-model-defaults — best-effort extended thinking / reasoning.
   * Aggregators that ignore unknown fields stay safe.
   */
  thinking?: boolean;
  reasoningEffort?: "low" | "medium" | "high";
  /**
   * C-audit-06 — try these models in order after `model` on retryable errors.
   * When `true`, use Scriptwriter Sonnet→sonnet-4→haiku chain.
   */
  fallbackModels?: string[] | true;
};

export type CallAggregatorChatResult =
  | {
      ok: true;
      text: string;
      model: string;
      /** Set when a fallback model answered after primary failed. */
      fallbackFrom?: string;
      triedModels?: string[];
    }
  | { ok: false; error: string; triedModels?: string[] };

/** HTTP / network errors that warrant a model fallback (C-audit-06). */
export function isRetryableAggregatorChatError(error: string): boolean {
  if (
    error === "aggregator_network" ||
    error === "aggregator_empty" ||
    error === "aggregator_bad_json"
  ) {
    return true;
  }
  const m = /^aggregator_http_(\d+)$/.exec(error);
  if (!m) return false;
  const status = Number(m[1]);
  // 400: often model-specific payload (thinking/extra_body) — try next slug
  return (
    status === 400 ||
    status === 402 || // payment / plan — try cheaper fallback model
    status === 404 ||
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    status === 529
  );
}

function resolveFallbackChain(
  primary: string,
  fallbackModels?: string[] | true,
): string[] {
  if (!fallbackModels) return [primary];
  const extras =
    fallbackModels === true
      ? [...SCRIPTWRITER_MODEL_FALLBACK_CHAIN]
      : fallbackModels;
  const out: string[] = [];
  for (const id of [primary, ...extras]) {
    const t = id?.trim();
    if (!t) continue;
    if (!out.includes(t)) out.push(t);
  }
  return out.length > 0 ? out : [primary];
}

/**
 * POST aggregator /chat/completions.
 * Soft result object — never throws with secrets; never logs key.
 * C-audit-06: when `fallbackModels` set, retry chain on 503/5xx/404.
 */
export async function callAggregatorChat(
  input: CallAggregatorChatInput,
): Promise<CallAggregatorChatResult> {
  const env = resolveAggregatorEnv();
  if (!env) {
    return { ok: false, error: "aggregator_key_missing" };
  }

  const system = typeof input.system === "string" ? input.system.trim() : "";
  const user = typeof input.user === "string" ? input.user.trim() : "";
  if (!user) {
    return { ok: false, error: "empty_user" };
  }

  const primaryRaw = input.model?.trim() ?? "";
  const chain = resolveFallbackChain(primaryRaw, input.fallbackModels);
  const temperature =
    typeof input.temperature === "number" && Number.isFinite(input.temperature)
      ? input.temperature
      : 0.4;
  const maxTokens =
    typeof input.maxTokens === "number" && Number.isFinite(input.maxTokens)
      ? Math.max(1, Math.round(input.maxTokens))
      : 2048;

  const history = (input.history ?? [])
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .map((m) => ({ role: m.role, content: m.content.trim() }));

  const images = (input.images ?? [])
    .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
    .map((u) => u.trim())
    .slice(0, 4);

  type Msg =
    | { role: "system" | "assistant"; content: string }
    | {
        role: "user";
        content: string | AggregatorChatContentPart[];
      };

  const messages: Msg[] = [];
  if (system) {
    messages.push({ role: "system", content: system });
  }
  for (const turn of history) {
    messages.push(turn);
  }

  if (images.length > 0) {
    const parts: AggregatorChatContentPart[] = [
      { type: "text", text: user },
      ...images.map((url) => ({
        type: "image_url" as const,
        image_url: { url },
      })),
    ];
    messages.push({ role: "user", content: parts });
  } else {
    messages.push({ role: "user", content: user });
  }

  const triedModels: string[] = [];
  let lastError = "aggregator_empty";
  const primaryResolved = resolveAggregatorModelId(chain[0] ?? "");

  for (let i = 0; i < chain.length; i++) {
    const model = resolveAggregatorModelId(chain[i] ?? "");
    triedModels.push(model);

    const payload: Record<string, unknown> = {
      model,
      temperature,
      max_tokens: maxTokens,
      messages,
    };

    // Best-effort thinking / reasoning (OpenRouter / Anthropic / Polza compat).
    // Unknown keys are typically ignored; never log Authorization.
    // Skip thinking on haiku last-resort to maximize chance of a clean reply.
    const isHaikuLast = /haiku/i.test(model);
    if (input.thinking === true && !isHaikuLast) {
      const effort = input.reasoningEffort ?? "high";
      payload.reasoning = { effort };
      payload.thinking = { type: "enabled" };
      payload.extra_body = {
        reasoning: { effort },
        thinking: { type: "enabled" },
      };
    }

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
      lastError = "aggregator_network";
      if (i < chain.length - 1 && isRetryableAggregatorChatError(lastError)) {
        continue;
      }
      return { ok: false, error: lastError, triedModels };
    }

    if (!res.ok) {
      lastError = `aggregator_http_${res.status}`;
      if (i < chain.length - 1 && isRetryableAggregatorChatError(lastError)) {
        continue;
      }
      return { ok: false, error: lastError, triedModels };
    }

    let data: {
      choices?: Array<{ message?: { content?: string } }>;
      model?: string;
    };
    try {
      data = (await res.json()) as typeof data;
    } catch {
      lastError = "aggregator_bad_json";
      if (i < chain.length - 1) continue;
      return { ok: false, error: lastError, triedModels };
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text || typeof text !== "string" || !text.trim()) {
      lastError = "aggregator_empty";
      if (i < chain.length - 1 && isRetryableAggregatorChatError(lastError)) {
        continue;
      }
      return { ok: false, error: lastError, triedModels };
    }

    const resolvedModel =
      typeof data.model === "string" && data.model.trim()
        ? data.model
        : model;
    return {
      ok: true,
      text: text.trim(),
      model: resolvedModel,
      triedModels,
      ...(i > 0 || model !== primaryResolved
        ? { fallbackFrom: primaryResolved }
        : {}),
    };
  }

  return { ok: false, error: lastError, triedModels };
}
