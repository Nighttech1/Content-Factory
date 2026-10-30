/**
 * C-139 — typed Agent for Команда выпуска static flowchart + inspector.
 */

export type MeshAgentModelConfig = {
  model: string;
  temperature: number;
  /** UI required; no timeout field. */
  maxTokens: number;
  /**
   * C-audit-01 — chat/describe/handoff text model when `model` is image-class
   * (Designer draw keeps image id on `model`).
   */
  textModel?: string;
  /**
   * C-audit-01 — Scriptwriter Sonnet: request extended thinking /
   * reasoning when aggregator supports it (best-effort).
   */
  thinking?: boolean;
  /** Optional effort hint for OpenRouter/Anthropic-style reasoning. */
  reasoningEffort?: "low" | "medium" | "high";
};

export type MeshAgent = {
  id: string;
  name: string;
  role: string;
  /** Pack / catalog id for Settings sync. */
  packId: string;
  avatarIcon?: string;
  systemPrompt: string;
  skills: string[];
  plugins: string[];
  mcp: string[];
  /** Kept for Settings pack sync; not shown in inspector UI (C-139). */
  rules: string[];
  modelConfig: MeshAgentModelConfig;
  isActive: boolean;
  /** Dual-lane kind for avatar / panel behaviour. */
  roleKind: "user" | "scout" | "analyst" | "trainer" | "release";
  /** User node mock request / brief. */
  userRequest?: string;
};

/** Alias matching product brief. */
export type Agent = MeshAgent;

/** C-agent-model-defaults — Designer default image model (Polza / aggregator). */
export const DEFAULT_CAROUSEL_IMAGE_MODEL = "openai/gpt-5.4-image-2";
/**
 * C-audit-01 — Scriptwriter (carousel copywriter) text default.
 * Supersedes S45 Haiku default for Create carousel.
 */
export const DEFAULT_SCRIPTWRITER_MODEL = "anthropic/claude-3.7-sonnet";

/**
 * C-audit-06 — graceful degrade when primary Sonnet returns aggregator 5xx/404.
 * Order: primary → sonnet-4 → haiku last resort. Never silent fixture.
 */
export const SCRIPTWRITER_SONNET_FALLBACK = "anthropic/claude-sonnet-4";
/** Alias some aggregators expose without `anthropic/` prefix. */
export const SCRIPTWRITER_SONNET_FALLBACK_ALIAS = "claude-sonnet-4";
export const SCRIPTWRITER_HAIKU_LAST_RESORT = "anthropic/claude-haiku-4.5";

/** Full Scriptwriter text fallback chain (dedupe at call site). */
export const SCRIPTWRITER_MODEL_FALLBACK_CHAIN: readonly string[] = [
  DEFAULT_SCRIPTWRITER_MODEL,
  SCRIPTWRITER_SONNET_FALLBACK,
  SCRIPTWRITER_SONNET_FALLBACK_ALIAS,
  SCRIPTWRITER_HAIKU_LAST_RESORT,
];

/**
 * C-audit-01 — Designer chat / describe / handoff text model.
 * Draw keeps `DEFAULT_CAROUSEL_IMAGE_MODEL` on `modelConfig.model`.
 */
export const DEFAULT_DESIGNER_TEXT_MODEL = "anthropic/claude-3.7-sonnet";

export type AggregatorModelKind = "image" | "text" | "other";

const IMAGE_MODEL_RE =
  /image|dall|flux|sdxl|imagen|recraft|kandinsky|midjourney|gpt-image|ideogram|firefly|stable.?diffusion|yandex-art|yandex\/yandex/i;

export function classifyAggregatorModelKind(id: string): AggregatorModelKind {
  if (IMAGE_MODEL_RE.test(id)) return "image";
  if (/embed|whisper|tts|moderation|rerank|stt/i.test(id)) return "other";
  return "text";
}

export function isMeshImageModel(id: string | undefined | null): boolean {
  return Boolean(id && classifyAggregatorModelKind(id) === "image");
}

export const MESH_MODEL_OPTIONS = [
  { value: "claude-sonnet-4", label: "Claude Sonnet" },
  {
    value: "anthropic/claude-3.7-sonnet",
    label: "Claude 3.7 Sonnet",
  },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o mini" },
  { value: "claude-haiku", label: "Claude Haiku 3.5" },
  {
    value: "anthropic/claude-haiku-4.5",
    label: "Claude Haiku 4.5",
  },
  {
    value: "openai/gpt-5.4-image-2",
    label: "GPT-5.4 Image 2 (default)",
  },
  {
    value: "openai/gpt-5-image-mini",
    label: "GPT-5 Image Mini",
  },
  {
    value: "yandex/yandex-art",
    label: "YandexART",
  },
  {
    value: "google/gemini-2.5-flash-image",
    label: "Gemini 2.5 Flash Image (cheap)",
  },
  {
    value: "google/gemini-3.1-flash-lite-image",
    label: "Gemini 3.1 Flash Lite Image",
  },
  {
    value: "openai/gpt-5-image-mini",
    label: "GPT-5 Image Mini",
  },
] as const;

export type MeshModelOption = {
  value: string;
  label: string;
  kind?: AggregatorModelKind;
};
