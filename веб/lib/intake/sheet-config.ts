/**
 * Sheet IDs / gids from env (names only in .env.example — never commit secrets).
 *
 * Product default (useful-smoke wave): intake polls **useful only**
 * (gid 902078005 «Полезные карусели»). Meetings tab is opt-in via
 * explicit `mode=meetings` — never dual-polled by cron/preflight/sync.
 */

import type { SheetMode } from "@/lib/intake/types";

export const DEFAULT_GOOGLE_SHEETS_ID =
  "1kOJ1CjMK5rNldM1IGNLdiVXqHTMeCuG35yP6_w6Y5Ls";

export const DEFAULT_MEETINGS_GID = "0";
export const DEFAULT_USEFUL_GID = "902078005";

/** Product intake default — useful-only; meetings require explicit mode. */
export const DEFAULT_SHEET_INTAKE_MODE: SheetMode = "useful";

/**
 * Resolve intake mode list for sync / preflight / cron / list.
 * - Explicit `mode` → that tab only
 * - Unset → `[DEFAULT_SHEET_INTAKE_MODE]` (useful) — **not** meetings|useful dual
 */
export function resolveIntakeModes(mode?: SheetMode | null): SheetMode[] {
  if (mode === "meetings" || mode === "useful") return [mode];
  return [DEFAULT_SHEET_INTAKE_MODE];
}

/** Parse query/body mode; null/empty → default useful. */
export function parseSheetModeOrDefault(
  raw: unknown,
): SheetMode {
  if (raw === "meetings" || raw === "useful") return raw;
  return DEFAULT_SHEET_INTAKE_MODE;
}

export function resolveGoogleSheetsId(): string {
  return (
    process.env.GOOGLE_SHEETS_ID?.trim() ||
    process.env.GOOGLE_SHEET_ID?.trim() ||
    DEFAULT_GOOGLE_SHEETS_ID
  );
}

export function resolveSheetGid(mode: SheetMode): string {
  if (mode === "meetings") {
    return (
      process.env.GOOGLE_SHEETS_GID_MEETINGS?.trim() || DEFAULT_MEETINGS_GID
    );
  }
  return process.env.GOOGLE_SHEETS_GID_USEFUL?.trim() || DEFAULT_USEFUL_GID;
}

export function sheetPublicUrl(sheetId?: string): string {
  const id = sheetId || resolveGoogleSheetsId();
  return `https://docs.google.com/spreadsheets/d/${id}`;
}

export function sheetCsvExportUrl(mode: SheetMode, sheetId?: string): string {
  const id = sheetId || resolveGoogleSheetsId();
  const gid = resolveSheetGid(mode);
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}

/** Write-back only when flag + credentials present. */
export function isGoogleSheetsWriteEnabled(): boolean {
  const flag = process.env.GOOGLE_SHEETS_WRITE?.trim();
  if (flag !== "1" && flag?.toLowerCase() !== "true") return false;
  const hasKey = Boolean(process.env.GOOGLE_SHEETS_API_KEY?.trim());
  const hasSa = Boolean(
    process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON?.trim() ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim(),
  );
  return hasKey || hasSa;
}

export function sheetsWriteSkipReason(): string | undefined {
  if (isGoogleSheetsWriteEnabled()) return undefined;
  const flag = process.env.GOOGLE_SHEETS_WRITE?.trim();
  if (flag !== "1" && flag?.toLowerCase() !== "true") {
    return "GOOGLE_SHEETS_WRITE not set — status mirrored locally only";
  }
  return "Sheet write credentials missing — status mirrored locally; RED log";
}
