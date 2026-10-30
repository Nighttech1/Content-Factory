/**
 * C-99 — deterministic client-side scout script (no LLM tokens).
 */

export type ScoutContentType = "reels" | "carousel" | "shorts" | "story";

export type ScoutTopicResult = {
  topic: string;
  searchedAt: string;
  byType: Record<
    ScoutContentType,
    { total: number; anomalies: number; stableChannels: number }
  >;
};

function hashTopic(topic: string): number {
  let h = 0;
  const t = topic.trim().toLowerCase();
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
  return h || 1;
}

export function runScoutTopicSearch(topic: string): ScoutTopicResult {
  const seed = hashTopic(topic || "default");
  const types: ScoutContentType[] = ["reels", "carousel", "shorts", "story"];
  const byType = {} as ScoutTopicResult["byType"];
  for (let i = 0; i < types.length; i++) {
    const t = types[i]!;
    const base = 40 + ((seed >> (i * 3)) % 180);
    const anomalies = Math.max(2, Math.round(base * 0.08 + (seed % 7)));
    const stable = Math.max(3, Math.round(base * 0.15 + ((seed >> 4) % 11)));
    byType[t] = { total: base, anomalies, stableChannels: stable };
  }
  return {
    topic: topic.trim() || "без темы",
    searchedAt: new Date().toISOString(),
    byType,
  };
}

export const SCOUT_TYPE_LABELS: Record<ScoutContentType, string> = {
  reels: "Рилсы",
  carousel: "Карусели",
  shorts: "Shorts",
  story: "Stories",
};
