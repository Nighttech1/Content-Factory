"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getWeeklySeries, type WorkspaceStageId, type WorkspaceView } from "@/lib/growth-center/workspace-model";
import styles from "./workspace.module.css";

const day = (value: string) => `${value.slice(8, 10)}.${value.slice(5, 7)}`;
export function WeeklyChart({ view, stageId, label }: { view: WorkspaceView | null; stageId: WorkspaceStageId; label: string }) {
  const points = view ? getWeeklySeries(view, stageId) : [];
  return <section className={styles.chartSection} data-testid="growth-weekly-chart" data-stage-id={stageId} aria-label={`Недельная динамика: ${label}`}>
    <div className={styles.sectionHeading}><h2>Динамика по неделям</h2><span>{label} · человек</span></div>
    {points.some((point) => point.value !== null) ? <div className={styles.chart}>
      <ResponsiveContainer width="100%" height="100%"><LineChart data={points} margin={{ top: 20, left: 0, right: 16, bottom: 4 }}>
        <CartesianGrid stroke="var(--border-glass)" vertical={false} />
        <XAxis dataKey="weekKey" tickFormatter={day} axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} minTickGap={28} />
        <YAxis allowDecimals={false} width={40} axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} domain={[0, "auto"]} />
        <Tooltip content={({ active, payload }) => {
          if (!active || !payload?.length) return null;
          const point = payload[0].payload as typeof points[number];
          return <div className={styles.chartTooltip}><strong>Неделя с {day(point.weekKey)}: {point.value === null ? "нет данных" : `${point.value} чел.`}</strong><span>{point.source}</span><span>{point.kind === "correction" ? `Исправленный снимок · версия ${point.version}` : "Недельный снимок"}</span><span>Зафиксирован {new Date(point.capturedAt).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}</span></div>;
        }} />
        <Line type="linear" dataKey="value" name={label} stroke="var(--accent-blue-bright)" strokeWidth={2} connectNulls={false} dot={{ r: 4 }} isAnimationActive={false} />
      </LineChart></ResponsiveContainer>
    </div> : <div className={styles.emptyChart}>Недельных замеров пока нет</div>}
    <p className={styles.chartNote}>Нет данных — разрыв, а не ноль. {view?.capabilities.schedulerEnabled ? "Недельные снимки: воскресенье, 23:59 по Москве." : "Автоматические недельные снимки пока не настроены."}</p>
  </section>;
}
