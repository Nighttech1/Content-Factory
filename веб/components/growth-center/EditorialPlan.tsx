"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { EditorialView } from "@/lib/growth-center/editorial-model";
import styles from "./editorial.module.css";

export function EditorialPlan({ editorial }: { editorial: EditorialView }) {
  const { plan } = editorial;
  return <section className={styles.panel} data-testid="growth-editorial-plan">
    <div className={styles.heading}><div><h2>План публикаций до конца года</h2><p>{plan.units.length} материалов · первые шесть недель 80/20 · съёмки: вторник и суббота</p></div><span className={styles.version}>Редакция {plan.sequence}</span></div>
    <p className={styles.status} role="status" data-testid="growth-editorial-sync">{editorial.status === "synced" ? "План получен из GitHub" : editorial.status === "bundled" ? "План из проверенной сборки" : editorial.message} · {plan.revision}{editorial.checkedAt ? ` · проверено ${new Date(editorial.checkedAt).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })} МСК` : ""}</p>
    {editorial.conflicts.length > 0 && <p className={styles.warning} data-testid="growth-editorial-conflicts">Сохранены правки на доске: {editorial.conflicts.join(", ")}. Новая директорская версия доступна в плане ниже; карточки требуют сверки.</p>}
    <div className={styles.weeks} aria-label="Недельный объём">{plan.weeks.map(w => <div key={w.week}><strong>Н{w.week}</strong><span>{w.start.slice(8)}.{w.start.slice(5, 7)}–{w.end.slice(8)}.{w.end.slice(5, 7)}</span><b>{w.total} публикаций</b><small>Шаги 1–2: {w.upper} · остальные: {w.lower}</small></div>)}</div>
    <details data-testid="growth-editorial-report"><summary>Весь план: темы, форматы, сериал, площадки, встречи и задания отделам</summary><div className={styles.report}><ReactMarkdown remarkPlugins={[remarkGfm]}>{plan.report_markdown}</ReactMarkdown></div></details>
  </section>;
}
