/** Club lifecycle aggregates. Never populate from content/video mock telemetry. */
export const STAGE_IDS = ["attraction", "interest", "registration", "attendance", "return", "membership", "advocacy", "reactivation"] as const;
export type StageId = (typeof STAGE_IDS)[number];
export type EvidenceKind = "measured" | "owner_estimate" | "scenario" | "unknown";
export type GrowthSnapshot = {
  version: 1;
  unit: "people";
  cohortId: string;
  periodStart: string;
  periodEnd: string;
  source: string;
  observedAt: string;
  evidenceKind: EvidenceKind;
  returnWindowDays: number;
  cohortMature: boolean;
  counts: Record<StageId, number | null>;
  eligibleDormant: number | null;
};
export const STAGES: ReadonlyArray<{ id: StageId; label: string; shortLabel: string; branchFrom: StageId | null }> = [
  { id: "attraction", label: "Захотеть быть с нами", shortLabel: "Привлечение", branchFrom: null },
  { id: "interest", label: "Узнать клуб ближе", shortLabel: "Интерес", branchFrom: "attraction" },
  { id: "registration", label: "Записаться на встречу", shortLabel: "Запись", branchFrom: "interest" },
  { id: "attendance", label: "Прийти впервые", shortLabel: "Первый визит", branchFrom: "registration" },
  { id: "return", label: "Вернуться к своим", shortLabel: "Возвращение", branchFrom: "attendance" },
  { id: "membership", label: "Участвовать регулярно", shortLabel: "Подписка", branchFrom: "attendance" },
  { id: "advocacy", label: "Привести друга", shortLabel: "Рекомендации", branchFrom: "return" },
  { id: "reactivation", label: "Вернуться после паузы", shortLabel: "Реактивация", branchFrom: null },
];
export const EMPTY_SNAPSHOT: GrowthSnapshot = {
  version: 1, unit: "people", cohortId: "campaign-to-measure", periodStart: "2026-11-09", periodEnd: "2026-11-09",
  source: "Замер ещё не подключён", observedAt: "2026-11-09", evidenceKind: "unknown", returnWindowDays: 30, cohortMature: false,
  counts: { attraction: null, interest: null, registration: null, attendance: null, return: null, membership: null, advocacy: null, reactivation: null },
  eligibleDormant: null,
};
const KEYS = ["version", "unit", "cohortId", "periodStart", "periodEnd", "source", "observedAt", "evidenceKind", "returnWindowDays", "cohortMature", "counts", "eligibleDormant"];
const DAY = 86400000;
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
function calendarDate(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : null;
}
function observationDate(value: unknown): number | null {
  if (typeof value !== "string") return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return calendarDate(value);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || calendarDate(value.slice(0, 10)) === null) return null;
  const time = Date.parse(value); return Number.isFinite(time) ? time : null;
}
function count(value: unknown): value is number | null { return value === null || (typeof value === "number" && Number.isSafeInteger(value) && value >= 0); }
export type SnapshotParseResult = { ok: true; data: GrowthSnapshot } | { ok: false; errors: string[] };
/** Strict allowlist: rejects participant lists / PII fields rather than silently storing them. */
export function parseGrowthSnapshot(input: unknown): SnapshotParseResult {
  const errors: string[] = [];
  if (!record(input)) return { ok: false, errors: ["Нужен объект агрегатов, не список участников."] };
  for (const key of Object.keys(input)) if (!KEYS.includes(key)) errors.push(`Недопустимое поле: ${key}. Только обезличенные агрегаты.`);
  for (const key of KEYS) if (!Object.prototype.hasOwnProperty.call(input, key)) errors.push(`Отсутствует поле: ${key}.`);
  if (input.version !== 1) errors.push("Поддерживается version: 1.");
  if (input.unit !== "people") errors.push("Единица — people: уникальные люди одной когорты, не просмотры или посещения.");
  for (const key of ["cohortId", "source"] as const) if (typeof input[key] !== "string" || !input[key].trim() || input[key].length > 500) errors.push(`${key}: нужна непустая строка до 500 знаков.`);
  const start = calendarDate(input.periodStart), end = calendarDate(input.periodEnd), observed = observationDate(input.observedAt);
  if (start === null || end === null) errors.push("periodStart/periodEnd: реальные календарные даты YYYY-MM-DD.");
  if (start !== null && end !== null && start > end) errors.push("Начало периода позже окончания.");
  if (observed === null) errors.push("observedAt: календарная дата или ISO-время с часовым поясом.");
  if (observed !== null && end !== null && observed < end) errors.push("Дата наблюдения раньше конца периода когорты.");
  if (!["measured", "owner_estimate", "scenario", "unknown"].includes(String(input.evidenceKind))) errors.push("Неизвестный evidenceKind.");
  if (typeof input.returnWindowDays !== "number" || !Number.isSafeInteger(input.returnWindowDays) || input.returnWindowDays < 1 || input.returnWindowDays > 365) errors.push("returnWindowDays: целое число 1–365.");
  if (typeof input.cohortMature !== "boolean") errors.push("cohortMature: true/false.");
  if (input.cohortMature === true && observed !== null && end !== null && typeof input.returnWindowDays === "number" && observed < end + input.returnWindowDays * DAY) errors.push("Когорта ещё не созрела: observedAt раньше periodEnd + returnWindowDays.");
  if (!record(input.counts)) errors.push("counts: нужен объект восьми стадий.");
  else {
    for (const key of Object.keys(input.counts)) if (!(STAGE_IDS as readonly string[]).includes(key)) errors.push(`Недопустимая стадия: ${key}.`);
    for (const key of STAGE_IDS) if (!Object.prototype.hasOwnProperty.call(input.counts, key) || !count(input.counts[key])) errors.push(`counts.${key}: неотрицательное целое число или null.`);
    const pairs: ReadonlyArray<readonly [StageId, StageId]> = [["interest", "attraction"], ["registration", "interest"], ["attendance", "registration"], ["return", "attendance"], ["membership", "attendance"], ["advocacy", "return"]];
    // Compare every known ancestor, even when an intermediate stage is unmeasured.
    // A null click count must not allow 100 first guests from only 10 reached people.
    const parents = new Map<StageId, StageId>(pairs);
    for (const child of STAGE_IDS) {
      let ancestor = parents.get(child);
      while (ancestor) {
        const c = input.counts[child], p = input.counts[ancestor];
        if (typeof c === "number" && typeof p === "number" && c > p) errors.push(`${child} больше ${ancestor}: нарушена совместимость одной когорты.`);
        ancestor = parents.get(ancestor);
      }
    }
    if (typeof input.counts.reactivation === "number" && typeof input.eligibleDormant === "number" && input.counts.reactivation > input.eligibleDormant) errors.push("Реактивированных больше eligibleDormant.");
  }
  if (!count(input.eligibleDormant)) errors.push("eligibleDormant: неотрицательное целое число или null.");
  if (errors.length) return { ok: false, errors };
  // Rebuild the object after validation: unknown fields and external references never enter local storage.
  const parsed = input as unknown as GrowthSnapshot;
  return { ok: true, data: { version: 1, unit: "people", cohortId: parsed.cohortId.trim(), periodStart: parsed.periodStart, periodEnd: parsed.periodEnd, source: parsed.source.trim(), observedAt: parsed.observedAt, evidenceKind: parsed.evidenceKind, returnWindowDays: parsed.returnWindowDays, cohortMature: parsed.cohortMature, counts: Object.fromEntries(STAGE_IDS.map(id => [id, parsed.counts[id]])) as Record<StageId, number | null>, eligibleDormant: parsed.eligibleDormant } };
}
export type ConversionResult = { value: number | null; reason: string; numerator: number | null; denominator: number | null };
/** value is a fraction 0..1. Membership/advocacy/reactivation have explicit branch denominators. */
export function conversionRate(snapshot: GrowthSnapshot, stage: StageId): ConversionResult {
  const base: Record<StageId, StageId | "eligibleDormant" | null> = { attraction: null, interest: "attraction", registration: "interest", attendance: "registration", return: "attendance", membership: "attendance", advocacy: "return", reactivation: "eligibleDormant" };
  const key = base[stage]; const numerator = snapshot.counts[stage];
  const denominator = key === "eligibleDormant" ? snapshot.eligibleDormant : key ? snapshot.counts[key] : null;
  const unknown = (reason: string): ConversionResult => ({ value: null, reason, numerator, denominator });
  const parsed = parseGrowthSnapshot(snapshot);
  if (!parsed.ok) return unknown("Сначала исправь качество данных: " + parsed.errors[0]);
  if (snapshot.evidenceKind !== "measured") return unknown("Нет совместимого фактического замера. Оценка и сценарий не являются конверсией.");
  if (!key) return unknown("Это входящий уникальный охват, а не конверсия из населения или подписчиков.");
  if ((stage === "return" || stage === "advocacy") && !snapshot.cohortMature) return unknown("Окно возврата когорты ещё не созрело.");
  if (numerator === null || denominator === null) return unknown("Нет числителя или совместимого знаменателя.");
  if (denominator === 0) return unknown("Знаменатель равен нулю: процент не определён.");
  if (numerator > denominator) return unknown("Числитель превышает базу: проверь когорту и период.");
  return { value: numerator / denominator, reason: stage === "reactivation" ? "Доля вернувшихся среди заранее определённых неактивных гостей." : "Совместимые уникальные люди одной когорты; это наблюдение, не причинный эффект контента.", numerator, denominator };
}
export type MarketScenarioInput = {
  population: number; adultShare: number; languageFitShare: number; travelInterestShare: number; reachableShare: number;
  eventsPerMonth: number; seatsPerEvent: number; visitsPerPerson: number; ticketPrice: number;
};
export type MarketScenarioResult = { samScenario: number | null; reachableScenario: number | null; capacityVisits: number | null; capacityPeople: number | null; grossCapacityRevenue: number | null; errors: string[] };
/** Transparent arithmetic only. Inputs are assumptions, not inferred demand or a market forecast. */
export function evaluateMarketScenario(input: MarketScenarioInput): MarketScenarioResult {
  const errors: string[] = [];
  for (const [key, value] of Object.entries(input)) if (!Number.isFinite(value) || value < 0) errors.push(`${key}: нужно конечное неотрицательное число.`);
  for (const key of ["adultShare", "languageFitShare", "travelInterestShare", "reachableShare"] as const) if (input[key] > 1) errors.push(`${key}: доля должна быть 0–1.`);
  for (const key of ["population", "eventsPerMonth", "seatsPerEvent"] as const) if (!Number.isSafeInteger(input[key])) errors.push(`${key}: нужно целое число.`);
  if (input.visitsPerPerson <= 0) errors.push("visitsPerPerson должно быть больше 0.");
  if (errors.length) return { samScenario: null, reachableScenario: null, capacityVisits: null, capacityPeople: null, grossCapacityRevenue: null, errors };
  const samScenario = Math.floor(input.population * input.adultShare * input.languageFitShare * input.travelInterestShare);
  const reachableScenario = Math.floor(samScenario * input.reachableShare);
  const capacityVisits = input.eventsPerMonth * input.seatsPerEvent;
  const capacityPeople = Math.floor(capacityVisits / input.visitsPerPerson);
  const grossCapacityRevenue = capacityVisits * input.ticketPrice;
  if (![samScenario, reachableScenario, capacityVisits, capacityPeople, grossCapacityRevenue].every(Number.isSafeInteger)) return { samScenario: null, reachableScenario: null, capacityVisits: null, capacityPeople: null, grossCapacityRevenue: null, errors: ["Расчёт превышает безопасную числовую точность."] };
  return { samScenario, reachableScenario, capacityVisits, capacityPeople, grossCapacityRevenue, errors: [] };
}
