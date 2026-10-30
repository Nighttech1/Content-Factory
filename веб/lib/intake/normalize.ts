/**
 * Normalize live Sheet columns → NormalizedSheetRow (01_sheet_schema).
 */

import type {
  NormalizedSheetRow,
  SheetMode,
} from "@/lib/intake/types";
import { normalizeFactCheckFlag } from "@/lib/studio/vernatun-carousel/fact-check-flag";

const PICKABLE_STATUS = new Set(["new", "1"]);

function lower(s: string): string {
  return s.trim().toLowerCase();
}

function findKey(
  obj: Record<string, string>,
  candidates: string[],
): string | undefined {
  const keys = Object.keys(obj);
  // Exact match only — fuzzy «СТА»⊂«Статус» would steal status as CTA.
  for (const want of candidates) {
    const hit = keys.find((k) => lower(k) === lower(want));
    if (hit) return hit;
  }
  return undefined;
}

function parseCta(raw: string | undefined, fallback: 1 | 2 | 3 | 4): 1 | 2 | 3 | 4 {
  const n = Number.parseInt((raw ?? "").trim(), 10);
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return fallback;
}

function parseHero(raw: string | undefined): number | null {
  const t = (raw ?? "").trim();
  if (!t) return null;
  const n = Number.parseInt(t, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseSlides(raw: string | undefined): number | undefined {
  const t = (raw ?? "").trim();
  if (!t) return undefined;
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n) || n < 3 || n > 10) return undefined;
  return n;
}

/** status ∈ {new,1} case-insensitive. */
export function isPickableStatus(statusRaw: string): boolean {
  return PICKABLE_STATUS.has(lower(statusRaw));
}

/**
 * Meetings: pick when status ∈ {new,1} AND non-empty topic.
 * Useful without status col: pick non-empty topic + empty|new|1 local/status.
 */
export function isRowPickable(
  mode: SheetMode,
  statusRaw: string,
  topic: string,
  opts?: { hasStatusColumn?: boolean },
): boolean {
  if (!topic.trim()) return false;
  if (mode === "meetings") {
    return isPickableStatus(statusRaw);
  }
  // useful
  if (opts?.hasStatusColumn === false && !statusRaw.trim()) {
    return true; // planned col absent — pick by topic
  }
  if (!statusRaw.trim()) {
    return opts?.hasStatusColumn === false;
  }
  return isPickableStatus(statusRaw);
}

export function normalizeMeetingsRow(
  raw: Record<string, string>,
  localStatus?: string,
): NormalizedSheetRow | null {
  const dateK = findKey(raw, ["Дата", "date"]);
  const timeK = findKey(raw, ["Время", "time"]);
  const placeK = findKey(raw, ["Место", "place"]);
  const topicK = findKey(raw, ["Тема", "topic"]);
  const notesK = findKey(raw, ["Примечание", "notes", "note"]);
  const statusK = findKey(raw, ["Статус", "status"]);
  const slidesK = findKey(raw, ["slides", "Слайды"]);
  const ctaK = findKey(raw, ["cta_type", "СТА", "CTA"]);
  const heroK = findKey(raw, ["hero", "герой"]);
  const factsK = findKey(raw, [
    "Проверка достоверности фактов",
    "facts",
    "фактс",
    "Facts",
  ]);

  const topic = topicK ? (raw[topicK] ?? "").trim() : "";
  if (!topic) return null;

  const date = dateK ? (raw[dateK] ?? "").trim() : "";
  const statusRaw =
    (localStatus?.trim() || (statusK ? (raw[statusK] ?? "").trim() : "")) || "";
  const sheetRowKey = `${date}|${topic}`.replace(/\s+/g, " ").trim();

  const meta: Record<string, string> = {};
  if (date) meta.date = date;
  if (timeK && raw[timeK]) meta.time = raw[timeK]!.trim();
  if (placeK && raw[placeK]) meta.place = raw[placeK]!.trim();

  const factCheckRaw = factsK ? (raw[factsK] ?? "").trim() : "";
  const factNorm = normalizeFactCheckFlag(factCheckRaw);
  if (factNorm.warning) {
    meta.fact_check_warning = factNorm.warning;
  }

  return {
    mode: "meetings",
    sheetRowKey,
    topic,
    notes: notesK ? (raw[notesK] ?? "").trim() || undefined : undefined,
    meta,
    statusRaw,
    slides: parseSlides(slidesK ? raw[slidesK] : undefined),
    cta_type: ctaK ? parseCta(raw[ctaK], 3) : 3,
    hero: parseHero(heroK ? raw[heroK] : undefined),
    pickable: isRowPickable("meetings", statusRaw, topic, {
      hasStatusColumn: Boolean(statusK),
    }),
    localStatus,
    factCheckRaw: factCheckRaw || undefined,
    factCheckMode: factNorm.branch,
  };
}

export function normalizeUsefulRow(
  raw: Record<string, string>,
  localStatus?: string,
  opts?: { hasStatusColumn?: boolean },
): NormalizedSheetRow | null {
  const numK = findKey(raw, ["№", "num", "N", "no"]);
  const topicK = findKey(raw, ["topic", "Тема"]);
  const catK = findKey(raw, ["category", "категория"]);
  const valueK = findKey(raw, ["value", "value prop", "угол"]);
  const ctaK = findKey(raw, ["СТА", "cta_type", "CTA"]);
  const flagK = findKey(raw, ["flag"]);
  const heroK = findKey(raw, ["hero"]);
  const statusK = findKey(raw, ["status", "Статус"]);
  const slidesK = findKey(raw, ["slides", "Слайды"]);
  const factsK = findKey(raw, [
    "Проверка достоверности фактов",
    "facts",
    "фактс",
    "Facts",
  ]);

  const topic = topicK ? (raw[topicK] ?? "").trim() : "";
  if (!topic) return null;

  const num = numK ? (raw[numK] ?? "").trim() : "";
  const sheetRowKey = num || `useful|${topic}`.slice(0, 80);

  const statusFromSheet = statusK ? (raw[statusK] ?? "").trim() : "";
  const statusRaw = (localStatus?.trim() || statusFromSheet) || "";
  const hasStatusColumn =
    opts?.hasStatusColumn ?? Boolean(statusK && statusK !== "__col0");

  const meta: Record<string, string> = {};
  if (num) meta.num = num;
  if (catK && raw[catK]) meta.category = raw[catK]!.trim();
  if (flagK && raw[flagK]) meta.flag = raw[flagK]!.trim();

  const factCheckRaw = factsK ? (raw[factsK] ?? "").trim() : "";
  const factNorm = normalizeFactCheckFlag(factCheckRaw);
  if (factNorm.warning) {
    meta.fact_check_warning = factNorm.warning;
  }

  return {
    mode: "useful",
    sheetRowKey,
    topic,
    notes: valueK ? (raw[valueK] ?? "").trim() || undefined : undefined,
    meta,
    statusRaw,
    slides: parseSlides(slidesK ? raw[slidesK] : undefined),
    cta_type: parseCta(ctaK ? raw[ctaK] : undefined, 1),
    hero: parseHero(heroK ? raw[heroK] : undefined),
    pickable: isRowPickable("useful", statusRaw, topic, { hasStatusColumn }),
    localStatus,
    factCheckRaw: factCheckRaw || undefined,
    factCheckMode: factNorm.branch,
  };
}

export function detectStatusColumn(headers: string[]): boolean {
  return headers.some((h) => {
    const l = lower(h);
    return l === "status" || l === "статус";
  });
}

/** Prefer Кумовство sample for preflight evidence. */
export function findKumovstvoSample(
  rows: NormalizedSheetRow[],
): NormalizedSheetRow | null {
  const hit = rows.find((r) => /кумовств/i.test(r.topic));
  return hit ?? null;
}
