/**
 * Conditional fact-check routing from Google Sheets (ТЗ §1).
 * Column by header — never by column index. LLM must not override sheet flag.
 */

export type FactCheckBranch = "STANDARD" | "FACT_CHECK";

export type FactCheckFlagResult = {
  branch: FactCheckBranch;
  raw: string;
  /** true when raw was non-empty and not 0/1 */
  unknownRaw: boolean;
  warning?: string;
};

const FACT_HEADERS = [
  "Проверка достоверности фактов",
  "проверка достоверности фактов",
  "facts",
  "фактс",
  "Facts",
  "Фактс",
] as const;

export function findFactCheckHeader(headers: string[]): string | undefined {
  const lower = (s: string) => s.trim().toLowerCase();
  for (const want of FACT_HEADERS) {
    const hit = headers.find((h) => lower(h) === lower(want));
    if (hit) return hit;
  }
  // soft: contains both «факт» and («провер»|facts)
  return headers.find((h) => {
    const l = lower(h);
    return (
      l === "facts" ||
      l === "фактс" ||
      (l.includes("факт") && (l.includes("провер") || l.includes("достовер")))
    );
  });
}

/**
 * Normalize sheet cell → branch.
 * 1 → FACT_CHECK; 0 / empty → STANDARD; unknown → STANDARD + warning.
 */
export function normalizeFactCheckFlag(raw: unknown): FactCheckFlagResult {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!s) {
    return { branch: "STANDARD", raw: "", unknownRaw: false };
  }
  if (s === "1" || s === "true" || s === "yes" || s === "да") {
    return { branch: "FACT_CHECK", raw: String(raw).trim(), unknownRaw: false };
  }
  if (s === "0" || s === "false" || s === "no" || s === "нет") {
    return { branch: "STANDARD", raw: String(raw).trim(), unknownRaw: false };
  }
  return {
    branch: "STANDARD",
    raw: String(raw).trim(),
    unknownRaw: true,
    warning: `unknown fact-check flag "${String(raw).trim()}" → STANDARD`,
  };
}

export function resolveFactCheckBranch(input: {
  factCheckMode?: FactCheckBranch | boolean | null;
  factCheckRaw?: string | null;
  styleNotes?: string | null;
}): FactCheckFlagResult {
  // Explicit brief wins (wired from Sheet). LLM cannot invent this.
  if (input.factCheckMode === "FACT_CHECK" || input.factCheckMode === true) {
    return {
      branch: "FACT_CHECK",
      raw: input.factCheckRaw ?? "1",
      unknownRaw: false,
    };
  }
  if (input.factCheckMode === "STANDARD" || input.factCheckMode === false) {
    return {
      branch: "STANDARD",
      raw: input.factCheckRaw ?? "0",
      unknownRaw: false,
    };
  }
  if (input.factCheckRaw != null && String(input.factCheckRaw).trim() !== "") {
    return normalizeFactCheckFlag(input.factCheckRaw);
  }
  // Dev/smoke markers in styleNotes
  const notes = input.styleNotes ?? "";
  if (/FACT_CHECK\s*=\s*1|FORCE_FACT_CHECK/i.test(notes)) {
    return { branch: "FACT_CHECK", raw: "styleNotes", unknownRaw: false };
  }
  if (/FACT_CHECK\s*=\s*0|FORCE_STANDARD/i.test(notes)) {
    return { branch: "STANDARD", raw: "styleNotes", unknownRaw: false };
  }
  return { branch: "STANDARD", raw: "", unknownRaw: false };
}
