/**
 * Map ArtDirectorFinding v2 ↔ legacy VernatunDefect for repair/QA readers.
 */

import type {
  ArtDirectorFinding,
  DefectPriority,
  FindingSeverity,
  VernatunDefect,
} from "./types";

export function severityToPriority(s: FindingSeverity): DefectPriority {
  if (s === "blocker") return "BLOCKER";
  if (s === "major") return "MAJOR";
  return "MINOR";
}

export function priorityToSeverity(p: DefectPriority): FindingSeverity {
  if (p === "BLOCKER") return "blocker";
  if (p === "MAJOR") return "major";
  return "minor";
}

export function findingToDefect(f: ArtDirectorFinding): VernatunDefect {
  const m = /^slide[_\s-]?(\d+)$/i.exec(f.slide_id.trim());
  const slide_index = m ? Number(m[1]) : Number(f.slide_id.replace(/\D/g, "")) || 0;
  return {
    priority: severityToPriority(f.severity),
    slide_index,
    element: f.element,
    reason: f.reason || f.observed_issue,
    fix: f.recommended_change,
  };
}

export function defectToFinding(d: VernatunDefect): ArtDirectorFinding {
  return {
    slide_id: `slide_${d.slide_index}`,
    severity: priorityToSeverity(d.priority),
    element: d.element,
    observed_issue: d.reason,
    recommended_change: d.fix,
    reason: d.reason,
    acceptance_check: `Verify ${d.element} on slide ${d.slide_index} matches: ${d.fix}`,
  };
}

export function normalizeFindings(raw: unknown): ArtDirectorFinding[] {
  if (!Array.isArray(raw)) return [];
  const out: ArtDirectorFinding[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    // v2 shape
    if (typeof o.slide_id === "string" && typeof o.observed_issue === "string") {
      const sev = String(o.severity ?? "major").toLowerCase();
      const severity: FindingSeverity =
        sev === "blocker" || sev === "major" || sev === "minor" || sev === "suggestion"
          ? (sev as FindingSeverity)
          : "major";
      out.push({
        slide_id: o.slide_id,
        severity,
        element: String(o.element ?? "layout"),
        observed_issue: String(o.observed_issue),
        recommended_change: String(o.recommended_change ?? o.fix ?? ""),
        reason: String(o.reason ?? o.observed_issue),
        acceptance_check: String(
          o.acceptance_check ?? `Confirm fix for ${o.element}`,
        ),
      });
      continue;
    }
    // legacy defect shape
    if (typeof o.slide_index === "number" || typeof o.reason === "string") {
      out.push(
        defectToFinding({
          priority: (String(o.priority ?? "MAJOR").toUpperCase() as DefectPriority) ||
            "MAJOR",
          slide_index: Number(o.slide_index ?? 0),
          element: String(o.element ?? "layout"),
          reason: String(o.reason ?? ""),
          fix: String(o.fix ?? o.recommended_change ?? ""),
        }),
      );
    }
  }
  return out;
}

export function findingsHaveBlocker(findings: ArtDirectorFinding[]): boolean {
  return findings.some((f) => f.severity === "blocker");
}

/**
 * Framework B Client rule: ANY unresolved major or blocker blocks FINAL.
 * (Mode A false-positive majors should be demoted to minor BEFORE this check.)
 */
export function findingsBlockFinalize(
  findings: ArtDirectorFinding[],
): boolean {
  return findings.some(
    (f) => f.severity === "blocker" || f.severity === "major",
  );
}

/** Alias used across AD/orchestrator — same as findingsBlockFinalize (B-only product). */
export function findingsHaveWowMajor(findings: ArtDirectorFinding[]): boolean {
  return findingsBlockFinalize(findings);
}
