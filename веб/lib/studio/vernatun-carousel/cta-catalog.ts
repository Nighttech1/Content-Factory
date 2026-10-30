/**
 * CTA catalog for Vernatun carousels.
 * Sheet will pass `ctaType` (or column code); copy can override via brief.cta.
 * Until Sheets wiring (B7): default = speaking meetup.
 */

export const CTA_TYPE_IDS = [
  "speaking_meetup",
  "community_circle",
  "consult_dm",
  "open_event",
] as const;

export type CtaTypeId = (typeof CTA_TYPE_IDS)[number];

export type CtaTypeDef = {
  id: CtaTypeId;
  /** Value expected from Google Sheet column (stable code). */
  sheetCode: string;
  labelRu: string;
  /** Default on-slide / final CTA copy (RU). */
  defaultCopy: string;
};

/** Four CTA types — Sheet picks one; copy can be overridden. */
export const CTA_TYPE_CATALOG: Record<CtaTypeId, CtaTypeDef> = {
  speaking_meetup: {
    id: "speaking_meetup",
    sheetCode: "CTA_MEETING",
    labelRu: "Разговорная встреча Vernatun",
    defaultCopy: "Приходите на разговорную встречу Vernatun",
  },
  community_circle: {
    id: "community_circle",
    sheetCode: "CTA_COMMUNITY",
    labelRu: "Круг / комьюнити",
    defaultCopy: "Присоединяйтесь к кругу Vernatun",
  },
  consult_dm: {
    id: "consult_dm",
    sheetCode: "CTA_DM",
    labelRu: "Написать в Direct",
    defaultCopy: "Напишите Vernatun в Direct — разберём ваш вопрос",
  },
  open_event: {
    id: "open_event",
    sheetCode: "CTA_EVENT",
    labelRu: "Открытое событие / запись",
    defaultCopy: "Запишитесь на встречу Vernatun — ссылка в профиле",
  },
};

const SHEET_CODE_TO_ID: Record<string, CtaTypeId> = Object.fromEntries(
  Object.values(CTA_TYPE_CATALOG).map((d) => [d.sheetCode.toUpperCase(), d.id]),
) as Record<string, CtaTypeId>;

export const DEFAULT_CTA_TYPE: CtaTypeId = "speaking_meetup";

export function isCtaTypeId(raw: unknown): raw is CtaTypeId {
  return (
    typeof raw === "string" &&
    (CTA_TYPE_IDS as readonly string[]).includes(raw.trim())
  );
}

/** Resolve type from Sheet code (CTA_MEETING) or id (speaking_meetup). */
export function parseCtaType(raw: unknown): CtaTypeId {
  if (typeof raw !== "string" || !raw.trim()) return DEFAULT_CTA_TYPE;
  const t = raw.trim();
  if (isCtaTypeId(t)) return t;
  const fromCode = SHEET_CODE_TO_ID[t.toUpperCase()];
  return fromCode ?? DEFAULT_CTA_TYPE;
}

/**
 * Final CTA string for the job.
 * Priority: explicit brief.cta → catalog default for brief.ctaType → speaking_meetup.
 */
export function resolveBriefCta(input: {
  cta?: string;
  ctaType?: string;
}): { ctaType: CtaTypeId; cta: string; from: "brief" | "catalog" } {
  const ctaType = parseCtaType(input.ctaType);
  const explicit = (input.cta ?? "").trim();
  if (explicit) {
    return { ctaType, cta: explicit, from: "brief" };
  }
  return {
    ctaType,
    cta: CTA_TYPE_CATALOG[ctaType].defaultCopy,
    from: "catalog",
  };
}
