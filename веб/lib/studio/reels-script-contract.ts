/**
 * C-reels-scriptwriter-upgrade + Sprint 9 C-s9-06/07 —
 * STRICT reels script artifact (AI Bridge). Separate from carousel Dramaturgy JSON.
 */

import { z } from "zod";

export type ReelsScriptBeat = {
  t0: number;
  t1: number;
  label: string;
  onScreen: string;
  vo: string;
};

export type ReelsScriptArtifact = {
  contentType: "reels";
  durationSec: number;
  hook: { t0: number; t1: number; onScreen: string; vo: string };
  beats: ReelsScriptBeat[];
  cta: {
    t0: number;
    t1: number;
    onScreen: string;
    vo: string;
    captionLine: string;
  };
  roles?: string[];
  location?: string;
  caption?: string;
  hashtags?: string[];
  promptForMontage: string;
};

export const REELS_SCRIPT_SCHEMA_HINT = [
  "{",
  '  "contentType": "reels",',
  '  "durationSec": 15-30,',
  '  "hook": { "t0": 0, "t1": 2, "onScreen": "…", "vo": "…" },',
  '  "beats": [{ "t0", "t1", "label", "onScreen", "vo" }, …],',
  '  "cta": { "t0", "t1", "onScreen", "vo", "captionLine" },',
  '  "promptForMontage": "cut points, B-roll, subtitle style, end-card CTA",',
  '  "caption?", "hashtags?", "roles?", "location?"',
  "}",
].join(" ");

const reelsBeatSchema = z.object({
  t0: z.number().finite(),
  t1: z.number().finite(),
  label: z.string().min(1),
  onScreen: z.string(),
  vo: z.string(),
});

const reelsHookSchema = z.object({
  t0: z.number().finite(),
  t1: z.number().finite(),
  onScreen: z.string(),
  vo: z.string(),
});

const reelsCtaSchema = z.object({
  t0: z.number().finite(),
  t1: z.number().finite(),
  onScreen: z.string(),
  vo: z.string(),
  captionLine: z.string(),
});

/** Zod contract — STRICT (Sprint 9.7). */
export const reelsScriptSchema = z
  .object({
    contentType: z.literal("reels"),
    durationSec: z.number().finite().positive(),
    hook: reelsHookSchema,
    beats: z.array(reelsBeatSchema).min(2),
    cta: reelsCtaSchema,
    roles: z.array(z.string()).optional(),
    location: z.string().optional(),
    caption: z.string().optional(),
    hashtags: z.array(z.string()).optional(),
    promptForMontage: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.hook.t0 < 0 || data.hook.t1 > 2.05) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "hook must be within 0–2s (t0≥0, t1≤2)",
        path: ["hook"],
      });
    }
    if (!data.hook.onScreen.trim() && !data.hook.vo.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "hook onScreen or vo required",
        path: ["hook"],
      });
    }
    if (!data.cta.onScreen.trim() && !data.cta.captionLine.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "cta onScreen or captionLine required",
        path: ["cta"],
      });
    }
  });

export type ReelsScriptParseResult = {
  artifact: ReelsScriptArtifact | null;
  ok: boolean;
  errors: string[];
};

export class ReelsScriptParseError extends Error {
  readonly code:
    | "NO_JSON"
    | "INVALID_JSON"
    | "SCHEMA"
    | "CAROUSEL_FORBIDDEN"
    | "HOOK"
    | "BEATS"
    | "CTA";

  constructor(code: ReelsScriptParseError["code"], message: string) {
    super(message);
    this.name = "ReelsScriptParseError";
    this.code = code;
  }
}

function asNum(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function asStr(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

/**
 * Soft-parse model JSON into ReelsScriptArtifact.
 * Rejects carousel-shaped payloads (slides[] without hook).
 * Prefer `parseAndAssertReelsScript` on live Create/generate paths (Sprint 9.7).
 */
export function parseReelsScriptArtifact(
  raw: unknown,
): ReelsScriptParseResult {
  const errors: string[] = [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { artifact: null, ok: false, errors: ["not_object"] };
  }
  const o = raw as Record<string, unknown>;

  if (Array.isArray(o.slides) && !o.hook) {
    return {
      artifact: null,
      ok: false,
      errors: ["carousel_slides_forbidden"],
    };
  }

  if (Array.isArray(o.slides) && o.contentType === "carousel") {
    return {
      artifact: null,
      ok: false,
      errors: ["carousel_slides_forbidden"],
    };
  }

  const hookRaw =
    o.hook && typeof o.hook === "object"
      ? (o.hook as Record<string, unknown>)
      : null;
  if (!hookRaw) errors.push("missing_hook");

  const hook = {
    t0: asNum(hookRaw?.t0, 0),
    t1: asNum(hookRaw?.t1, 2),
    onScreen: asStr(hookRaw?.onScreen),
    vo: asStr(hookRaw?.vo),
  };
  if (hook.t1 > 2.05 || hook.t0 < 0) {
    errors.push("hook_not_0_2s");
  }
  if (!hook.onScreen.trim() && !hook.vo.trim()) {
    errors.push("hook_empty");
  }

  const beatsIn = Array.isArray(o.beats) ? o.beats : [];
  const beats: ReelsScriptBeat[] = beatsIn
    .filter((b) => b && typeof b === "object")
    .map((b) => {
      const x = b as Record<string, unknown>;
      return {
        t0: asNum(x.t0, 0),
        t1: asNum(x.t1, 0),
        label: asStr(x.label, "beat"),
        onScreen: asStr(x.onScreen),
        vo: asStr(x.vo),
      };
    });
  if (beats.length < 2) errors.push("need_ge_2_beats");

  const ctaRaw =
    o.cta && typeof o.cta === "object"
      ? (o.cta as Record<string, unknown>)
      : null;
  if (!ctaRaw) errors.push("missing_cta");
  const cta = {
    t0: asNum(ctaRaw?.t0, 0),
    t1: asNum(ctaRaw?.t1, 0),
    onScreen: asStr(ctaRaw?.onScreen),
    vo: asStr(ctaRaw?.vo),
    captionLine: asStr(ctaRaw?.captionLine),
  };
  if (!cta.onScreen.trim() && !cta.captionLine.trim()) {
    errors.push("cta_empty");
  }

  const promptForMontage = asStr(o.promptForMontage);
  if (!promptForMontage.trim()) errors.push("missing_promptForMontage");

  const durationSec = asNum(o.durationSec, Math.max(cta.t1, 15));

  const artifact: ReelsScriptArtifact = {
    contentType: "reels",
    durationSec,
    hook,
    beats,
    cta,
    promptForMontage,
    roles: Array.isArray(o.roles)
      ? o.roles.filter((r): r is string => typeof r === "string")
      : undefined,
    location: typeof o.location === "string" ? o.location : undefined,
    caption: typeof o.caption === "string" ? o.caption : undefined,
    hashtags: Array.isArray(o.hashtags)
      ? o.hashtags.filter((h): h is string => typeof h === "string")
      : undefined,
  };

  const hardFail = errors.some((e) =>
    [
      "missing_hook",
      "hook_not_0_2s",
      "need_ge_2_beats",
      "missing_cta",
      "cta_empty",
      "missing_promptForMontage",
      "carousel_slides_forbidden",
    ].includes(e),
  );

  return { artifact, ok: !hardFail, errors };
}

function extractJsonCandidate(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const fencedJson =
    /```(?:json|JSON)\s*([\s\S]*?)```/.exec(trimmed) ??
    /```\s*([\s\S]*?)```/.exec(trimmed);
  if (fencedJson?.[1]) {
    const inner = fencedJson[1].trim();
    if (inner.startsWith("{")) return inner;
  }
  const start = trimmed.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < trimmed.length; i++) {
    const ch = trimmed[i]!;
    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return trimmed.slice(start, i + 1);
    }
  }
  return null;
}

/** Extract fenced JSON from assistant markdown and soft-parse. */
export function parseReelsScriptFromReply(raw: string): ReelsScriptParseResult {
  const text = (raw ?? "").trim();
  if (!text) return { artifact: null, ok: false, errors: ["empty"] };
  const candidate = extractJsonCandidate(text);
  if (!candidate) {
    return { artifact: null, ok: false, errors: ["NO_JSON"] };
  }
  try {
    return parseReelsScriptArtifact(JSON.parse(candidate));
  } catch {
    return { artifact: null, ok: false, errors: ["json_parse"] };
  }
}

/**
 * STRICT assert (Sprint 9.7): parse fail = throw ReelsScriptParseError.
 * Accepts raw object or chat text with fenced/raw JSON.
 */
export function parseAndAssertReelsScript(
  input: string | unknown,
): ReelsScriptArtifact {
  let raw: unknown = input;

  if (typeof input === "string") {
    const candidate = extractJsonCandidate(input);
    if (!candidate) {
      throw new ReelsScriptParseError(
        "NO_JSON",
        "No reels JSON object found (expected fenced ```json or raw {…}).",
      );
    }
    try {
      raw = JSON.parse(candidate);
    } catch {
      throw new ReelsScriptParseError(
        "INVALID_JSON",
        "Found JSON-looking text but JSON.parse failed.",
      );
    }
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    if (
      (Array.isArray(o.slides) && !o.hook) ||
      o.contentType === "carousel"
    ) {
      throw new ReelsScriptParseError(
        "CAROUSEL_FORBIDDEN",
        "Carousel Dramaturgy JSON is forbidden on custom-reels path.",
      );
    }
  }

  const soft = parseReelsScriptArtifact(raw);
  if (!soft.ok || !soft.artifact) {
    const code: ReelsScriptParseError["code"] = soft.errors.includes(
      "carousel_slides_forbidden",
    )
      ? "CAROUSEL_FORBIDDEN"
      : soft.errors.some((e) => e.startsWith("hook"))
        ? "HOOK"
        : soft.errors.includes("need_ge_2_beats")
          ? "BEATS"
          : soft.errors.some((e) => e.includes("cta"))
            ? "CTA"
            : "SCHEMA";
    throw new ReelsScriptParseError(
      code,
      `Reels script failed STRICT: ${soft.errors.join(", ") || "unknown"}`,
    );
  }

  const zod = reelsScriptSchema.safeParse(soft.artifact);
  if (!zod.success) {
    const detail = zod.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    throw new ReelsScriptParseError(
      "SCHEMA",
      `Reels script failed zod: ${detail}`,
    );
  }

  return soft.artifact;
}
