/**
 * C-155 / S49 — keep live Create chat user = raw only.
 * Strips Team «Задание» / combat-brief glue; never pass loadUserBrief / defaultCombatBrief.
 */

/** Marker historically used by composeTopicWithBrief (C-140). */
export const COMBAT_BRIEF_GLUE_MARKER = "\n\n---\nБриф:\n";

const BRIEF_PREFIX_RE =
  /^(?:Бриф|Задание|Combat brief|User brief)\s*[:：]\s*/i;

/**
 * If content contains brief glue, return only the topic part before the marker.
 * Otherwise return trimmed content unchanged.
 */
export function stripCombatBriefGlue(content: string): string {
  let raw = typeof content === "string" ? content : "";
  const idx = raw.indexOf(COMBAT_BRIEF_GLUE_MARKER);
  if (idx !== -1) {
    raw = raw.slice(0, idx);
  } else {
    const alt = raw.search(/\n---\nБриф:\n/);
    if (alt !== -1) raw = raw.slice(0, alt);
  }
  raw = raw.trim();
  // S49: drop accidental brief-label prefixes if a client glues them
  raw = raw.replace(BRIEF_PREFIX_RE, "").trim();
  return raw;
}

/**
 * Sanitize chat turns for aggregator: user content never carries Team brief glue.
 * Assistant turns unchanged (aside from trim).
 */
export function sanitizeAgentChatTurnsForC155<
  T extends { role: "user" | "assistant"; content: string },
>(turns: T[]): T[] {
  return turns.map((t) => {
    if (t.role !== "user") {
      return { ...t, content: t.content.trim() };
    }
    return { ...t, content: stripCombatBriefGlue(t.content) };
  });
}
