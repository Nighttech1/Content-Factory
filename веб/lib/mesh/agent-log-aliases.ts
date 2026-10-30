/**
 * S55 — Backend pipeline logs often use role names (`scriptwriter`) while
 * mesh cards use store ids (`copywriter`). Map both ways for Logs + RED.
 */

const ALIAS_GROUPS: string[][] = [
  ["copywriter", "scriptwriter"],
  ["team-trainer", "trainer"],
  ["publisher", "publicist"],
];

/** All ids that share the same error/logs bucket as `agentId`. */
export function agentLogAliasIds(agentId: string): string[] {
  const id = agentId.trim();
  if (!id) return [];
  for (const group of ALIAS_GROUPS) {
    if (group.includes(id)) return [...group];
  }
  return [id];
}

/** Expand errorFlags so every alias key is true if any peer is true. */
export function expandAgentErrorFlags(
  flags: Record<string, boolean>,
): Record<string, boolean> {
  const out: Record<string, boolean> = { ...flags };
  for (const group of ALIAS_GROUPS) {
    const any = group.some((k) => Boolean(flags[k]));
    if (!any) continue;
    for (const k of group) out[k] = true;
  }
  return out;
}
