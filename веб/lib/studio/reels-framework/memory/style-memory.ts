import { listRules, upsertRule } from "../store";
import type { MontageRule } from "../types";
import { randomBytes } from "node:crypto";

export function proposeRuleFromFeedback(opts: {
  feedback: string;
  sourceReelId: string;
}): MontageRule {
  const now = new Date().toISOString();
  return {
    id: `rule_${randomBytes(4).toString("hex")}`,
    title: opts.feedback.slice(0, 60) || "Предпочтение монтажа",
    description: opts.feedback.trim(),
    category: "user_preference",
    scope: "all",
    priority: 50,
    condition: "always",
    exampleOk: opts.feedback.trim(),
    createdAt: now,
    source: `reel:${opts.sourceReelId}`,
    status: "proposed",
    version: 1,
  };
}

export function confirmRule(ruleId: string): MontageRule | null {
  const rule = listRules().find((r) => r.id === ruleId);
  if (!rule) return null;
  return upsertRule({ ...rule, status: "active" });
}

export function rejectRule(ruleId: string): MontageRule | null {
  const rule = listRules().find((r) => r.id === ruleId);
  if (!rule) return null;
  return upsertRule({ ...rule, status: "disabled" });
}

export function findConflicts(candidate: MontageRule): MontageRule[] {
  return listRules().filter(
    (r) =>
      r.status === "active" &&
      r.id !== candidate.id &&
      r.category === candidate.category &&
      r.scope === candidate.scope &&
      r.scopeRef === candidate.scopeRef &&
      r.title.toLowerCase() === candidate.title.toLowerCase(),
  );
}

export function activeRulesFor(
  styleProfileId?: string,
): MontageRule[] {
  return listRules().filter((r) => {
    if (r.status !== "active") return false;
    if (r.scope === "all") return true;
    if (r.scope === "style_profile" && r.scopeRef === styleProfileId) return true;
    return false;
  });
}
