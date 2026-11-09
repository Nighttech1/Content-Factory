import { z } from "zod";

export const STAGE_IDS = ["awareness", "desire", "registration", "attendance", "return", "membership", "advocacy", "reactivation"] as const;
export type StageId = (typeof STAGE_IDS)[number];
export type EvidenceKind = "measured" | "owner_estimate" | "scenario" | "unknown";
export type MetricUnit = "people" | "visits" | "publications" | "percent" | "rubles" | "subscribers";
const DAY = 86400000;
export function dateTime(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const t = Date.parse(value + "T00:00:00Z");
  return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === value ? t : null;
}
const date = z.string().refine(s => dateTime(s) !== null, "Нужна реальная календарная дата YYYY-MM-DD.");
const text = z.string().trim().min(1).max(2000);
const id = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,119}$/);
const count = z.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable();
const kind = z.enum(["measured", "owner_estimate", "scenario", "unknown"]);
const unit = z.enum(["people", "visits", "publications", "percent", "rubles", "subscribers"]);
const stageId = z.enum(STAGE_IDS);
const httpUrl = z.string().max(2000).refine(value => { try { const u = new URL(value); return ["http:", "https:"].includes(u.protocol) && !u.username && !u.password; } catch { return false; } }, "Нужен публичный http(s) URL без credentials.");
const provenance = z.object({ sourceId: id, observedAt: date, kind, note: z.string().max(2000) }).strict();
const sourceLocation = text.refine(value => {
  if (value.startsWith("projects/vernatun/") && !value.includes("..") && !value.includes("\\")) return true;
  try { const u = new URL(value); return ["http:", "https:"].includes(u.protocol) && !u.username && !u.password; } catch { return false; }
}, "Источник должен быть http(s) URL или repo path проекта Вернатун.");
const source = z.object({ id, title: text, location: sourceLocation, date, geography: text, limitation: text }).strict();
const stage = z.object({ id: stageId, label: text, audience: text, job: text, barrier: text, product: text, strategy: text, nextAction: text, owner: text, metricId: id, targetId: id.nullable(), contentIds: z.array(id) }).strict();
const metric = z.object({ id, stageId: stageId.nullable(), label: text, definition: text, value: count, unit, periodStart: date, periodEnd: date, cohortId: id.nullable(), provenance, windowDays: z.number().int().min(1).max(365).nullable() }).strict();
const target = z.object({ id, stageId, label: text, value: count, unit, periodStart: date, periodEnd: date, approvalStatus: z.enum(["draft", "approved"]), provisional: z.boolean(), basis: text, owner: text }).strict();
const content = z.object({ id: z.string().regex(/^V-\d{6}-(CAR|REL|ART|YTB|TGP)-\d{2,}$/), title: text, briefPath: z.string().regex(/^projects\/vernatun\/departments\/[a-z-]+\/jobs\/V-\d{6}-[A-Z]+-\d{2,}\/00-brief\.md$/), plannedDate: date, product: text, format: text, channel: z.array(text).min(1), stageIds: z.array(stageId).min(1), status: z.enum(["planned", "in_progress", "review", "approved", "published"]), publication: z.object({ url: httpUrl, publishedAt: date, sourceId: id }).strict().nullable() }).strict();
const mechanic = z.object({ id: z.string().regex(/^idea-[a-z0-9][a-z0-9-]{0,114}$/), stageIds: z.array(stageId).min(1), kind: z.enum(["humor", "useful", "series", "interactive", "trust", "invitation"]), title: text, need: text, barrier: text, purpose: text, example: text, hook: text, format: text, channels: z.array(text).min(1), cta: text, successMetric: text, status: z.literal("proposed"), sourceId: id }).strict();
const point = z.object({ date, value: count, periodStart: date, periodEnd: date, cohortId: id.nullable(), evidenceKind: kind, sourceId: id, observedAt: date }).strict();
const series = z.object({ id, stageId: stageId.nullable(), metricId: id, label: text, points: z.array(point) }).strict();
const meeting = z.object({ id, confirmedDate: date, status: z.enum(["confirmed", "completed", "cancelled"]), registrations: count, attendees: count, newcomers: count, returning: count, capacity: count, revenue: count, sourceId: id, observedAt: date, evidenceKind: kind }).strict();
const schema = z.object({ version: z.literal(2), projectId: z.literal("vernatun"), revision: id, updatedAt: date, planStatus: z.enum(["draft", "approved"]), planHorizon: z.object({ start: date, end: date }).strict(), sources: z.array(source).min(1), stages: z.array(stage).length(8), metrics: z.array(metric), targets: z.array(target), content: z.array(content), series: z.array(series), meetings: z.array(meeting), contentMechanics: z.array(mechanic).default([]) }).strict();
export type ContentMechanic = z.infer<typeof mechanic>;
export type SourceEntry = z.infer<typeof source>;
export type StageConfig = z.infer<typeof stage>;
export type MetricEntry = z.infer<typeof metric>;
export type TargetEntry = z.infer<typeof target>;
export type ContentEntry = z.infer<typeof content>;
export type SeriesEntry = z.infer<typeof series>;
export type SeriesPoint = z.infer<typeof point>;
export type MeetingEntry = z.infer<typeof meeting>;
export type GrowthCenterDataset = z.infer<typeof schema>;
export type ValidationResult = { ok: true; data: GrowthCenterDataset } | { ok: false; errors: string[] };
const parent: Partial<Record<StageId, StageId>> = { desire: "awareness", registration: "desire", attendance: "registration", return: "attendance", membership: "return", advocacy: "return" };

/** Strict v2 aggregate-only validation, including publication proof and referential integrity. */
export function validateGrowthCenterDataset(input: unknown): ValidationResult {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.issues.map(e => `${e.path.join(".")}: ${e.message}`) };
  const d = parsed.data, errors: string[] = [], updated = dateTime(d.updatedAt)!;
  function add(condition: boolean, message: string) { if (!condition) errors.push(message); }
  function unique(values: string[], name: string) { add(new Set(values).size === values.length, `${name}: повторяющиеся ID.`); }
  function observed(value: string, name: string) { add(dateTime(value)! <= updated, `${name}: дата позже updatedAt.`); }
  function period(start: string, end: string, name: string) { add(dateTime(start)! <= dateTime(end)!, `${name}: обратный период.`); }
  function numeric(value: number | null, u: MetricUnit, name: string) { if (value === null) return; if (["people", "visits", "publications", "subscribers"].includes(u)) add(Number.isSafeInteger(value), `${name}: ожидается целое число.`); if (u === "percent") add(value <= 100, `${name}: percent должен быть 0–100.`); }
  for (const key of ["sources", "metrics", "targets", "content", "series", "meetings", "contentMechanics"] as const) unique(d[key].map(x => x.id), key);
  unique(d.stages.map(s => s.id), "stages");
  const sources = new Set(d.sources.map(s => s.id)), metrics = new Map(d.metrics.map(m => [m.id, m])), targets = new Map(d.targets.map(t => [t.id, t])), contents = new Map(d.content.map(c => [c.id, c]));
  for (const s of d.sources) observed(s.date, `source ${s.id}`);
  period(d.planHorizon.start, d.planHorizon.end, "planHorizon");
  for (const s of d.stages) {
    add(metrics.has(s.metricId), `${s.id}: неизвестный metricId.`); add(metrics.get(s.metricId)?.stageId === s.id, `${s.id}: metricId принадлежит другой стадии.`);
    add(s.targetId === null || targets.has(s.targetId), `${s.id}: неизвестный targetId.`); if (s.targetId) add(targets.get(s.targetId)?.stageId === s.id, `${s.id}: targetId другой стадии.`);
    unique(s.contentIds, `${s.id}.contentIds`);
    for (const cid of s.contentIds) { add(contents.has(cid), `${s.id}: неизвестный contentId ${cid}.`); add(contents.get(cid)?.stageIds.includes(s.id) === true, `${s.id}/${cid}: обратная связь stageIds отсутствует.`); }
  }
  for (const idea of d.contentMechanics) {
    unique(idea.stageIds, `${idea.id}.stageIds`);
    add(sources.has(idea.sourceId), `${idea.id}: неизвестный источник идеи.`);
    for (const sid of idea.stageIds) add(d.stages.some(s => s.id === sid), `${idea.id}: неизвестная стадия идеи.`);
  }
  for (const m of d.metrics) {
    add(sources.has(m.provenance.sourceId), `${m.id}: неизвестный источник.`); observed(m.provenance.observedAt, m.id); period(m.periodStart, m.periodEnd, m.id); numeric(m.value, m.unit, m.id);
    if (m.provenance.kind === "measured") { add(dateTime(m.provenance.observedAt)! >= dateTime(m.periodEnd)!, `${m.id}: measured наблюдение раньше конца периода.`); add(m.value !== null, `${m.id}: measured не может означать отсутствие замера.`); }
    if (m.provenance.kind === "unknown") add(m.value === null, `${m.id}: unknown должен хранить null.`);
    if (m.stageId) add(m.unit === "people", `${m.id}: стадия хранит уникальных people, не просмотры/посещения.`);
  }
  for (const t of d.targets) { period(t.periodStart, t.periodEnd, t.id); numeric(t.value, t.unit, t.id); add(d.stages.some(s => s.id === t.stageId), `${t.id}: неизвестная стадия.`); }
  for (const c of d.content) {
    unique(c.stageIds, `${c.id}.stageIds`); add(c.briefPath.includes(`/jobs/${c.id}/`), `${c.id}: briefPath другого задания.`);
    add(dateTime(c.plannedDate)! >= dateTime(d.planHorizon.start)! && dateTime(c.plannedDate)! <= dateTime(d.planHorizon.end)!, `${c.id}: дата вне планового горизонта.`);
    for (const sid of c.stageIds) add(d.stages.find(s => s.id === sid)?.contentIds.includes(c.id) === true, `${c.id}/${sid}: обратная связь contentIds отсутствует.`);
    if (c.status === "published") add(c.publication !== null, `${c.id}: published требует permalink и дату.`);
    if (c.publication) { add(c.status === "published", `${c.id}: proof публикации при непубличном статусе.`); add(sources.has(c.publication.sourceId), `${c.id}: неизвестный источник публикации.`); observed(c.publication.publishedAt, c.id); }
  }
  for (const s of d.series) {
    add(metrics.has(s.metricId), `${s.id}: неизвестная метрика.`); add(metrics.get(s.metricId)?.stageId === s.stageId, `${s.id}: series и metric разных стадий.`);
    unique(s.points.map(p => `${p.date}|${p.cohortId ?? ""}`), `${s.id}.points`);
    for (const p of s.points) { observed(p.date, s.id); observed(p.observedAt, s.id); period(p.periodStart, p.periodEnd, s.id); add(sources.has(p.sourceId), `${s.id}: неизвестный sourceId точки.`); numeric(p.value, metrics.get(s.metricId)?.unit ?? "people", s.id); add(dateTime(p.date)! <= dateTime(p.observedAt)!, `${s.id}: точка позже наблюдения.`); if (p.evidenceKind === "unknown") add(p.value === null, `${s.id}: unknown point не ноль.`); if (p.evidenceKind === "measured") { add(p.value !== null, `${s.id}: measured point без числа.`); add(dateTime(p.observedAt)! >= dateTime(p.periodEnd)!, `${s.id}: measured point до конца периода.`); } }
  }
  for (const m of d.meetings) {
    observed(m.observedAt, m.id); add(sources.has(m.sourceId), `${m.id}: неизвестный источник встречи.`);
    for (const k of ["registrations", "attendees", "newcomers", "returning", "capacity"] as const) numeric(m[k], "people", `${m.id}.${k}`);
    if (m.status === "completed") { observed(m.confirmedDate, m.id); add(dateTime(m.observedAt)! >= dateTime(m.confirmedDate)!, `${m.id}: completed раньше проведения.`); }
    if (m.status !== "completed") add(m.attendees === null && m.newcomers === null && m.returning === null && m.revenue === null, `${m.id}: неподтверждённое проведение не имеет факта посещения/выручки.`);
    if (m.attendees !== null) {
      if (m.newcomers !== null) add(m.newcomers <= m.attendees, `${m.id}: новых больше пришедших.`);
      if (m.returning !== null) add(m.returning <= m.attendees, `${m.id}: повторных больше пришедших.`);
    }
    if (m.evidenceKind === "unknown") add([m.registrations, m.attendees, m.newcomers, m.returning, m.capacity, m.revenue].every(v => v === null), `${m.id}: unknown не может содержать числовые факты.`);
    if (m.newcomers !== null && m.returning !== null && m.attendees !== null) add(m.newcomers + m.returning === m.attendees, `${m.id}: новые + повторные не равно пришедшим.`);
    if (m.attendees !== null && m.capacity !== null) add(m.attendees <= m.capacity, `${m.id}: пришедших больше заявленной вместимости.`);
  }
  // Compare only genuinely compatible data; cross-cohort ratios stay unknown below.
  for (const child of d.stages) {
    const cm = metrics.get(child.metricId); let ancestor = parent[child.id];
    while (ancestor) { const pm = metrics.get(d.stages.find(s => s.id === ancestor)?.metricId ?? "");
      if (cm && pm && comparable(cm, pm) && cm.value !== null && pm.value !== null) add(cm.value <= pm.value, `${child.id}: больше известного предка ${ancestor}.`);
      ancestor = parent[ancestor];
    }
  }
  const re = metrics.get(d.stages.find(s => s.id === "reactivation")?.metricId ?? ""), dormant = metrics.get("eligible-dormant");
  if (re && dormant && comparable(re, dormant) && re.value !== null && dormant.value !== null) add(re.value <= dormant.value, "Реактиваций больше eligible-dormant.");
  return errors.length ? { ok: false, errors } : { ok: true, data: d };
}
function comparable(a: MetricEntry, b: MetricEntry): boolean { return a.unit === "people" && b.unit === "people" && a.cohortId !== null && a.cohortId === b.cohortId && a.periodStart === b.periodStart && a.periodEnd === b.periodEnd && a.provenance.kind === "measured" && b.provenance.kind === "measured" && a.provenance.observedAt === b.provenance.observedAt; }
/** Proposed strategy ideas are separate from production jobs and never publication facts. */
export function getStageContentMechanics(d: GrowthCenterDataset, stageId: StageId): ContentMechanic[] {
  return (d.contentMechanics ?? []).filter(idea => idea.stageIds.includes(stageId));
}
export function getStageContentStats(d: GrowthCenterDataset, stageId?: StageId) {
  const entries = d.content.filter(c => !stageId || c.stageIds.includes(stageId));
  return { planned: entries.length, total: entries.length, published: entries.filter(c => c.status === "published" && c.publication !== null).length, inProgress: entries.filter(c => ["in_progress", "review", "approved"].includes(c.status)).length, content: entries };
}
export function getPlanFact(d: GrowthCenterDataset, stageId: StageId) {
  const stage = d.stages.find(s => s.id === stageId), metric = d.metrics.find(m => m.id === stage?.metricId) ?? null, target = d.targets.find(t => t.id === stage?.targetId) ?? null;
  const actual = metric?.provenance.kind === "measured" ? metric.value : null, planned = target?.value ?? null;
  const actualKind = metric?.provenance.kind ?? null;
  const observed = metric && ["measured", "owner_estimate"].includes(metric.provenance.kind) ? metric.value : null;
  let reason = "Нет фактического замера."; let progress: number | null = null;
  if (target?.approvalStatus === "draft") reason = "Цель предложена, но ещё не утверждена.";
  else if (metric && target && actual !== null && planned !== null && planned > 0 && metric.unit === target.unit && metric.periodStart === target.periodStart && metric.periodEnd === target.periodEnd) { progress = actual / planned; reason = "Факт и утверждённая цель одной единицы и периода."; }
  else if (actual !== null) reason = "Цель отсутствует, равна нулю или период/единица несовместимы.";
  return { metric, target, actual, observed, actualKind, planned, progress, reason };
}
export function getStageSeries(d: GrowthCenterDataset, stageId: StageId, metricId?: string): SeriesEntry[] { return d.series.filter(s => s.stageId === stageId && (!metricId || s.metricId === metricId)); }
export type MeetingField = "attendees" | "registrations" | "newcomers" | "returning";
export function getMeetingSeries(d: GrowthCenterDataset, field: MeetingField, periodStart?: string, periodEnd?: string) {
  return d.meetings.filter(m => (!periodStart || m.confirmedDate >= periodStart) && (!periodEnd || m.confirmedDate <= periodEnd)).sort((a, b) => a.confirmedDate.localeCompare(b.confirmedDate)).map(m => ({ id: m.id, date: m.confirmedDate, value: m.status === "cancelled" || (field !== "registrations" && m.status !== "completed") ? null : m[field], capacity: m.status === "cancelled" ? null : m.capacity, sourceId: m.sourceId, evidenceKind: m.evidenceKind, observedAt: m.observedAt }));
}
export type ConversionResult = { value: number | null; reason: string; numerator: number | null; denominator: number | null };
export function getConversion(d: GrowthCenterDataset, stageId: StageId): ConversionResult {
  const stage = d.stages.find(s => s.id === stageId), m = d.metrics.find(x => x.id === stage?.metricId), baseId = parent[stageId];
  const b = d.metrics.find(x => x.id === (stageId === "reactivation" ? "eligible-dormant" : d.stages.find(s => s.id === baseId)?.metricId));
  const result = (reason: string, value: number | null = null): ConversionResult => ({ value, reason, numerator: m?.value ?? null, denominator: b?.value ?? null });
  const validated = validateGrowthCenterDataset(d);
  if (!validated.ok) return result("Сначала исправь качество данных: " + validated.errors[0]);
  if (!m || !b) return result("Нет совместимого знаменателя; охват не делится на население/подписчиков.");
  if (!comparable(m, b)) return result("Разные когорты, единицы, периоды, даты наблюдения или не фактический замер.");
  if (m.value === null || b.value === null) return result("Нет числителя или знаменателя.");
  if (b.value === 0) return result("При нулевой базе процент не определён.");
  if (m.value > b.value) return result("Числитель превышает базу; проверь качество данных.");
  if (["return", "advocacy", "membership"].includes(stageId)) { const window = stageId === "return" ? m.windowDays : b.windowDays; if (window === null || dateTime(m.provenance.observedAt)! < dateTime(m.periodEnd)! + window * DAY) return result("Окно возврата когорты ещё не созрело."); }
  return result(stageId === "reactivation" ? "Возврат из отдельно определённой неактивной базы." : "Одна совместимая когорта; не доказательство причинного эффекта контента.", m.value / b.value);
}

export type ConversionSeriesPoint = {
  date: string; value: number | null; reason: string; numerator: number | null; denominator: number | null;
  sourceId: string | null; denominatorSourceId: string | null; observedAt: string | null; cohortId: string | null;
  periodStart: string; periodEnd: string; evidenceKind: EvidenceKind;
};
export type ConversionSeriesResult = { mode: "history" | "current" | "empty"; points: ConversionSeriesPoint[] };
/** Historical transitions pair by cohort, window, date, observation and people unit.
 * No interpolation, carry-forward, cross-cohort merge or invented history. */
export function getConversionSeries(d: GrowthCenterDataset, stageId: StageId): ConversionSeriesResult {
  const stage = d.stages.find(s => s.id === stageId), metric = d.metrics.find(m => m.id === stage?.metricId);
  if (!metric) return { mode: "empty", points: [] };
  const baseId = stageId === "reactivation" ? "eligible-dormant" : d.stages.find(s => s.id === parent[stageId])?.metricId;
  const baseMetric = d.metrics.find(m => m.id === baseId);
  const pointsFor = (metricId: string | undefined) => d.series.filter(s => s.metricId === metricId).flatMap(s => s.points);
  const childPoints = pointsFor(metric.id), basePoints = pointsFor(baseId);
  const quality = validateGrowthCenterDataset(d);
  const key = (p: SeriesPoint) => JSON.stringify([p.date, p.cohortId, p.periodStart, p.periodEnd, p.observedAt]);
  const keys = Array.from(new Set([...childPoints, ...basePoints].map(key)));
  if (!keys.length) {
    if (metric.value === null) return { mode: "empty", points: [] };
    const c = getConversion(d, stageId);
    return { mode: "current", points: [{ date: metric.provenance.observedAt, value: c.value, reason: "Только текущий срез: " + c.reason, numerator: c.numerator, denominator: c.denominator, sourceId: metric.provenance.sourceId, denominatorSourceId: baseMetric?.provenance.sourceId ?? null, observedAt: metric.provenance.observedAt, cohortId: metric.cohortId, periodStart: metric.periodStart, periodEnd: metric.periodEnd, evidenceKind: metric.provenance.kind }] };
  }
  const result = keys.map(k => {
    const children = childPoints.filter(p => key(p) === k), bases = basePoints.filter(p => key(p) === k);
    const a = children[0], b = bases[0], p = a ?? b;
    const row: ConversionSeriesPoint = { date: p.date, value: null, reason: "Нет совместимой пары исторических точек.", numerator: a?.value ?? null, denominator: b?.value ?? null, sourceId: a?.sourceId ?? null, denominatorSourceId: b?.sourceId ?? null, observedAt: p.observedAt, cohortId: p.cohortId, periodStart: p.periodStart, periodEnd: p.periodEnd, evidenceKind: a?.evidenceKind ?? "unknown" };
    if (!quality.ok) { row.reason = "Сначала исправь качество данных: " + quality.errors[0]; return row; }
    if (!baseMetric) { row.reason = "Это входящий охват: у него нет предыдущей стадии."; return row; }
    if (children.length > 1 || bases.length > 1) { row.reason = "Неоднозначные дубли исторических точек одной когорты."; return row; }
    if (!a || !b || !p.cohortId) return row;
    if (metric.unit !== "people" || baseMetric.unit !== "people" || a.evidenceKind !== "measured" || b.evidenceKind !== "measured") { row.reason = "Исторические числитель и знаменатель должны быть фактическими people одной когорты."; return row; }
    if (a.value === null || b.value === null) { row.reason = "Нет измеренного числителя или знаменателя; линия имеет разрыв."; return row; }
    if (b.value === 0) { row.reason = "Нулевой исторический знаменатель: процент не определён."; return row; }
    if (a.value > b.value) { row.reason = "Исторический числитель превышает свою базу."; return row; }
    if (["return", "advocacy", "membership"].includes(stageId)) {
      const window = stageId === "return" ? metric.windowDays : baseMetric.windowDays;
      if (window === null || dateTime(p.observedAt)! < dateTime(p.periodEnd)! + window * DAY) { row.reason = "Историческая когорта ещё не созрела для окна возврата."; return row; }
    }
    // Even with missing intermediate series, a known earlier ancestor bounds descendants.
    let ancestor = parent[stageId];
    while (ancestor) {
      const ancestorMetric = d.metrics.find(m => m.id === d.stages.find(s => s.id === ancestor)?.metricId);
      const matches = pointsFor(ancestorMetric?.id).filter(q => key(q) === k && q.evidenceKind === "measured" && q.value !== null);
      if (matches.length > 1) { row.reason = "Неоднозначная историческая база предка."; return row; }
      if (ancestorMetric?.unit === "people" && matches[0]?.value !== null && matches[0]?.value !== undefined && a.value > matches[0].value) { row.reason = "Историческое число превышает известного предка через незамеренные стадии."; return row; }
      ancestor = parent[ancestor];
    }
    row.value = a.value / b.value;
    row.reason = "Историческая пара одной когорты, периода и даты наблюдения. Не доказательство причинного эффекта контента.";
    return row;
  });
  result.sort((a, b) => a.date.localeCompare(b.date) || (a.cohortId ?? "").localeCompare(b.cohortId ?? "") || a.periodStart.localeCompare(b.periodStart));
  return { mode: "history", points: result };
}
