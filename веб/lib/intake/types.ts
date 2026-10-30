/**
 * Phase 6 correct — Google Sheet intake types (01_sheet_schema).
 */

export type SheetMode = "meetings" | "useful";

export type NormalizedSheetRow = {
  mode: SheetMode;
  sheetRowKey: string;
  topic: string;
  notes?: string;
  meta?: Record<string, string>;
  statusRaw: string;
  slides?: number;
  cta_type?: 1 | 2 | 3 | 4;
  hero?: number | null;
  /** True when pick rules say this row can start gen. */
  pickable: boolean;
  /** Local mirror status when Sheet write unavailable. */
  localStatus?: string;
  /** Raw sheet cell: facts / Проверка достоверности фактов / фактс. */
  factCheckRaw?: string;
  /** Normalized: STANDARD | FACT_CHECK (ТЗ conditional factcheck). */
  factCheckMode?: "STANDARD" | "FACT_CHECK";
};

export type SheetTabPreflight = {
  mode: SheetMode;
  gid: string;
  ok: boolean;
  headers: string[];
  sampleRow: Record<string, string> | null;
  sampleTopic?: string;
  rowCount: number;
  pickableCount: number;
  error?: string;
};

export type SheetPreflightResult = {
  ok: boolean;
  sheetId: string;
  sheetUrl: string;
  writeEnabled: boolean;
  writeSkippedReason?: string;
  tabs: SheetTabPreflight[];
  fetchedAt: string;
};

export type SheetStatusValue =
  | "new"
  | "1"
  | "generating"
  | "2"
  | "needs_input"
  | "needs_review"
  | "ready"
  | "done"
  | string;

/** Draft.payload flags for sheet⊕Create intake (S57 layered_html product). */
export type CorrectDraftPayloadFlags = {
  /** Product: layered_html. Archaeology: correct. */
  pipeline: "layered_html" | "correct";
  needs_review?: boolean;
  needs_input?: boolean;
  sheetRowKey?: string;
  mode?: SheetMode;
  visionFailures?: Array<{
    slide: number;
    reason: string;
    gensUsed: number;
  }>;
  criticRetries?: number;
  publishMode?: "auto" | "manual" | null;
  publishAt?: string | null;
  /**
   * Variant A Art Director — last review (approve | remarks).
   * NEVER triggers remake from this field.
   */
  artDirectorReview?: {
    verdict: "approve" | "remarks";
    summary: string;
    remarks?: unknown[];
    score?: number;
    sequenceNotes?: string;
    model?: string;
    source?: string;
    reviewedAt?: string;
    remakeEnqueued?: false;
  };
};
