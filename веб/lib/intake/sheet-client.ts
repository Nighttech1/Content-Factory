/**
 * Google Sheet public CSV client — read-only preflight / sync.
 * Write-back gated by GOOGLE_SHEETS_WRITE + creds (else local mirror).
 */

import { parseCsv, rowsToObjects } from "@/lib/intake/csv-parse";
import {
  isGoogleSheetsWriteEnabled,
  resolveGoogleSheetsId,
  resolveIntakeModes,
  resolveSheetGid,
  sheetCsvExportUrl,
  sheetPublicUrl,
  sheetsWriteSkipReason,
} from "@/lib/intake/sheet-config";
import {
  detectStatusColumn,
  findKumovstvoSample,
  normalizeMeetingsRow,
  normalizeUsefulRow,
} from "@/lib/intake/normalize";
import {
  getMirroredStatus,
  listMirroredStatuses,
  upsertSheetMirror,
} from "@/lib/intake/sheet-mirror-store";
import type {
  NormalizedSheetRow,
  SheetMode,
  SheetPreflightResult,
  SheetTabPreflight,
} from "@/lib/intake/types";

export type FetchTabResult = {
  mode: SheetMode;
  gid: string;
  headers: string[];
  rawObjects: Record<string, string>[];
  rows: NormalizedSheetRow[];
  hasStatusColumn: boolean;
};

async function fetchCsvText(url: string): Promise<string> {
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "text/csv,*/*" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`sheet_http_${res.status}`);
  }
  return await res.text();
}

/** Meetings: title row 0, headers row 1. Useful: spacer row 0, headers row 1. */
function headerRowIndex(_mode: SheetMode): number {
  return 1;
}

export async function fetchSheetTab(mode: SheetMode): Promise<FetchTabResult> {
  const url = sheetCsvExportUrl(mode);
  const text = await fetchCsvText(url);
  const matrix = parseCsv(text);
  const hi = headerRowIndex(mode);
  const { headers, objects } = rowsToObjects(matrix, hi);
  const hasStatusColumn = detectStatusColumn(headers);
  const mirrorMap = await listMirroredStatuses(mode);

  const rows: NormalizedSheetRow[] = [];
  for (const obj of objects) {
    const provisional =
      mode === "meetings"
        ? normalizeMeetingsRow(obj)
        : normalizeUsefulRow(obj, undefined, { hasStatusColumn });
    if (!provisional) continue;
    const local = mirrorMap[provisional.sheetRowKey]?.status;
    const normalized =
      mode === "meetings"
        ? normalizeMeetingsRow(obj, local)
        : normalizeUsefulRow(obj, local, { hasStatusColumn });
    if (normalized) rows.push(normalized);
  }

  const gid = resolveSheetGid(mode);

  return { mode, gid, headers, rawObjects: objects, rows, hasStatusColumn };
}

export async function listNormalizedRows(
  mode: SheetMode,
  opts?: { pickableOnly?: boolean },
): Promise<NormalizedSheetRow[]> {
  const tab = await fetchSheetTab(mode);
  if (opts?.pickableOnly) return tab.rows.filter((r) => r.pickable);
  return tab.rows;
}

export async function findSheetRow(
  mode: SheetMode,
  sheetRowKey: string,
): Promise<NormalizedSheetRow | null> {
  const rows = await listNormalizedRows(mode);
  const key = sheetRowKey.trim();
  return rows.find((r) => r.sheetRowKey === key) ?? null;
}

function sampleAsRecord(row: NormalizedSheetRow | null): Record<string, string> | null {
  if (!row) return null;
  return {
    sheetRowKey: row.sheetRowKey,
    topic: row.topic,
    status: row.statusRaw,
    ...(row.notes ? { notes: row.notes } : {}),
    ...(row.meta ?? {}),
    ...(row.cta_type != null ? { cta_type: String(row.cta_type) } : {}),
    ...(row.hero != null ? { hero: String(row.hero) } : {}),
  };
}

/**
 * Preflight: default **useful-only**. Pass `mode=meetings` to check meetings tab.
 * Product path never dual-polls meetings|useful.
 */
export async function runSheetPreflight(
  mode?: SheetMode | null,
): Promise<SheetPreflightResult> {
  const sheetId = resolveGoogleSheetsId();
  const writeEnabled = isGoogleSheetsWriteEnabled();
  const tabs: SheetTabPreflight[] = [];
  let allOk = true;
  const modes = resolveIntakeModes(mode);

  for (const m of modes) {
    try {
      const tab = await fetchSheetTab(m);
      const kum = findKumovstvoSample(tab.rows);
      const sample =
        kum ??
        tab.rows.find((r) => r.pickable) ??
        tab.rows[0] ??
        null;
      tabs.push({
        mode: m,
        gid: tab.gid,
        ok: true,
        headers: tab.headers,
        sampleRow: sampleAsRecord(sample),
        sampleTopic: sample?.topic,
        rowCount: tab.rows.length,
        pickableCount: tab.rows.filter((r) => r.pickable).length,
      });
    } catch (err) {
      allOk = false;
      const message = err instanceof Error ? err.message : "fetch_failed";
      tabs.push({
        mode: m,
        gid: resolveSheetGid(m),
        ok: false,
        headers: [],
        sampleRow: null,
        rowCount: 0,
        pickableCount: 0,
        error: message,
      });
    }
  }

  return {
    ok: allOk && tabs.every((t) => t.ok),
    sheetId,
    sheetUrl: sheetPublicUrl(sheetId),
    writeEnabled,
    writeSkippedReason: writeEnabled ? undefined : sheetsWriteSkipReason(),
    tabs,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Sync CSV → local mirror (status from sheet when present; keep local overrides
 * for generating/needs_* when write disabled).
 */
export async function syncSheetRows(
  mode?: SheetMode,
): Promise<{
  ok: boolean;
  modes: SheetMode[];
  mirrored: number;
  pickable: number;
}> {
  /** Default useful-only — meetings only when explicitly requested. */
  const modes = resolveIntakeModes(mode);
  let mirrored = 0;
  let pickable = 0;
  for (const m of modes) {
    const tab = await fetchSheetTab(m);
    for (const row of tab.rows) {
      await upsertSheetMirror({
        mode: m,
        sheetRowKey: row.sheetRowKey,
        topic: row.topic,
        statusFromSheet: row.statusRaw,
        snapshot: row,
      });
      mirrored += 1;
      if (row.pickable) pickable += 1;
    }
  }
  return { ok: true, modes, mirrored, pickable };
}

/**
 * Update status: always mirror locally; try Sheets API write when enabled.
 * Returns writeSkipped=true + reason when creds missing (RED signal for logs).
 */
export async function updateSheetRowStatus(opts: {
  mode: SheetMode;
  sheetRowKey: string;
  status: string;
  topic?: string;
}): Promise<{
  ok: boolean;
  mirrored: boolean;
  sheetWritten: boolean;
  writeSkipped: boolean;
  writeSkippedReason?: string;
}> {
  const existing = await getMirroredStatus(opts.mode, opts.sheetRowKey);
  await upsertSheetMirror({
    mode: opts.mode,
    sheetRowKey: opts.sheetRowKey,
    topic: opts.topic ?? existing?.topic ?? "",
    localStatus: opts.status,
    statusFromSheet: existing?.statusFromSheet,
  });

  if (!isGoogleSheetsWriteEnabled()) {
    return {
      ok: true,
      mirrored: true,
      sheetWritten: false,
      writeSkipped: true,
      writeSkippedReason: sheetsWriteSkipReason(),
    };
  }

  // Sheets API write not implemented without service account client —
  // flag says write enabled but we still soft-skip with explicit reason
  // until a credentialed client is wired (no silent success).
  return {
    ok: true,
    mirrored: true,
    sheetWritten: false,
    writeSkipped: true,
    writeSkippedReason:
      "GOOGLE_SHEETS_WRITE=1 but Sheets API client not configured — mirrored only",
  };
}
