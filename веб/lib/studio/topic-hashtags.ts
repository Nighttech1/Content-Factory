/**
 * C-38/C-39 — Deterministic topic → Instagram hashtags mapper.
 * Shared contract with Researcher packs (`instagramHashtags`). No LLM.
 */

export const IG_NICHE_DEFAULT_HASHTAGS = [
  "armenianclub",
  "yerevan",
  "armenianfood",
  "guestnight",
] as const;

/** Always appended (when room) so discovery stays on-niche. */
const NICHE_ANCHORS = ["armenianclub", "yerevan"] as const;

export const TOPIC_HASHTAGS_MAX = 5;
/** Graph rate: Backend queries at most this many tags (callers slice). */
export const TOPIC_HASHTAGS_QUERY_MAX = 3;

export type TopicHashtagsSource = "deterministic_mapper" | "llm_mapper";

export type TopicHashtagsResult = {
  topic: string;
  hashtags: string[];
  source: TopicHashtagsSource;
  emptyTopic: boolean;
};

type AliasRule = {
  /** Matched against normalized topic (lowercase, collapsed spaces). */
  pattern: RegExp;
  tags: string[];
};

/**
 * RU/EN keyword → bare hashtag tokens (no `#`).
 * Order of rules = priority of first matches.
 */
const ALIAS_RULES: AliasRule[] = [
  {
    pattern: /гостев|guest\s*night|guestnight/,
    tags: ["guestnight"],
  },
  {
    pattern: /еда|food|кухн|cuisine|foodie|ресторан|restaurant/,
    tags: ["armenianfood"],
  },
  {
    pattern: /ереван|yerevan/,
    tags: ["yerevan"],
  },
  {
    pattern: /армян|armenian|armenianclub/,
    tags: ["armenianclub"],
  },
  {
    pattern: /клуб|club|vernatun|вернатун/,
    tags: ["armenianclub"],
  },
  {
    pattern: /вечер|night|party|вечеринк|ивент|event/,
    tags: ["guestnight"],
  },
];

function normalizeTopicKey(topic: string): string {
  return topic.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Bare lowercase alphanumeric hashtag token (latin). Empty if nothing left. */
export function slugifyHashtagToken(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 30);
}

/**
 * Parse `IG_DEFAULT_HASHTAGS` (comma-separated bare names) or fall back to niche defaults.
 */
export function parseDefaultHashtags(
  raw: string | undefined,
  fallback: readonly string[] = IG_NICHE_DEFAULT_HASHTAGS,
): string[] {
  if (!raw?.trim()) {
    return [...fallback];
  }
  const list = raw
    .split(",")
    .map((s) => s.trim().replace(/^#/, "").toLowerCase())
    .map((s) => s.replace(/[^a-z0-9_]/g, ""))
    .filter(Boolean);
  return list.length > 0 ? dedupeStable(list).slice(0, TOPIC_HASHTAGS_MAX) : [...fallback];
}

function dedupeStable(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    const key = t.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

function collectAliasTags(normalized: string): string[] {
  const tags: string[] = [];
  for (const rule of ALIAS_RULES) {
    if (rule.pattern.test(normalized)) {
      tags.push(...rule.tags);
    }
  }
  return tags;
}

/**
 * Map a Studio/Researcher topic string to Instagram hashtags (C-38 contract).
 *
 * @param topic - raw topic (may be empty)
 * @param defaultHashtags - optional override list (usually from env via config)
 */
export function mapTopicToHashtags(
  topic?: string | null,
  defaultHashtags?: readonly string[],
): TopicHashtagsResult {
  const trimmed = (topic ?? "").trim();
  const emptyTopic = trimmed.length === 0;
  const defaults =
    defaultHashtags && defaultHashtags.length > 0
      ? dedupeStable([...defaultHashtags]).slice(0, TOPIC_HASHTAGS_MAX)
      : parseDefaultHashtags(process.env.IG_DEFAULT_HASHTAGS);

  if (emptyTopic) {
    return {
      topic: "",
      hashtags: defaults,
      source: "deterministic_mapper",
      emptyTopic: true,
    };
  }

  const normalized = normalizeTopicKey(trimmed);
  const fromAliases = collectAliasTags(normalized);
  const slug = slugifyHashtagToken(normalized.replace(/\s+/g, ""));

  const gathered: string[] = [...fromAliases];
  if (slug && !gathered.includes(slug)) {
    // Only keep slug if it looks useful (len ≥ 3) and aliases were weak
    if (slug.length >= 3) {
      gathered.push(slug);
    }
  }

  // Always append niche anchors so results stay on-niche
  for (const anchor of NICHE_ANCHORS) {
    gathered.push(anchor);
  }

  const hashtags = dedupeStable(gathered).slice(0, TOPIC_HASHTAGS_MAX);

  return {
    topic: trimmed,
    hashtags: hashtags.length > 0 ? hashtags : defaults,
    source: "deterministic_mapper",
    emptyTopic: false,
  };
}

/** First N tags for Graph queries (rate cap). */
export function hashtagsForGraphQuery(
  result: TopicHashtagsResult,
  max: number = TOPIC_HASHTAGS_QUERY_MAX,
): string[] {
  return result.hashtags.slice(0, max);
}
