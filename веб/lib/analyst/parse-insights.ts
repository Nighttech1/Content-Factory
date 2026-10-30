/**
 * Safe parse of Analyst LLM JSON (analyst@v2).
 * Never throws for bad model output — returns null so runner can mock-fallback.
 */

import { z } from "zod";

import type {
  AnalystInsight,
  InsightTone,
  PromptHintProposal,
} from "./types";

const TONES = ["green", "blue", "gold", "terracotta"] as const satisfies readonly InsightTone[];

const insightRawSchema = z.object({
  tone: z.enum(TONES),
  badge: z.string().min(1).max(80),
  targetLabel: z.string().min(1).max(120),
  body: z.string().min(1).max(800),
  footer: z.string().min(1).max(200),
  id: z.string().min(1).max(64).optional(),
});

const promptHintSchema = z.object({
  target: z.string().min(1).max(80),
  fromVersion: z.string().min(1).max(40),
  toVersion: z.string().min(1).max(40),
  rationale: z.string().min(1).max(500),
});

const llmPayloadSchema = z.object({
  insights: z.array(insightRawSchema).min(1).max(8),
  promptHints: z.array(promptHintSchema).max(8).optional(),
});

export type ParsedAnalystLlm = {
  insights: AnalystInsight[];
  promptHints: PromptHintProposal[];
};

function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced?.[1]) return fenced[1].trim();
  return trimmed;
}

function slugId(tone: InsightTone, index: number, badge: string): string {
  const slug = badge
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `ins-${tone}-${index + 1}-${slug || "card"}`;
}

/**
 * Parse model text into validated insights + advisory promptHints.
 * Returns null on any parse/schema failure.
 */
export function parseAnalystInsightsJson(
  raw: string | null | undefined,
): ParsedAnalystLlm | null {
  if (raw == null || typeof raw !== "string" || !raw.trim()) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(raw));
  } catch {
    return null;
  }

  const result = llmPayloadSchema.safeParse(parsed);
  if (!result.success) return null;

  const insights: AnalystInsight[] = result.data.insights.map((row, i) => ({
    id: row.id ?? slugId(row.tone, i, row.badge),
    tone: row.tone,
    badge: row.badge.trim(),
    targetLabel: row.targetLabel.trim(),
    body: row.body.trim(),
    footer: row.footer.trim(),
  }));

  if (insights.length < 1) return null;

  const promptHints: PromptHintProposal[] = (result.data.promptHints ?? []).map(
    (h) => ({
      target: h.target.trim(),
      fromVersion: h.fromVersion.trim(),
      toVersion: h.toVersion.trim(),
      rationale: h.rationale.trim(),
    }),
  );

  return { insights, promptHints };
}
