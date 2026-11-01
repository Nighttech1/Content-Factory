"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Clapperboard,
  Images,
  Newspaper,
  Send,
  Video,
  PlayCircle,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/cn";
import {
  PLAN_MONTH,
  PLAN_YEAR,
  SEED_PLAN,
  type PlanSlotType,
} from "@/lib/schedule/seed-plan";

const TYPE_META: Record<
  PlanSlotType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    fg: string;
    bg: string;
    dot: string;
  }
> = {
  reel: { label: "Рилс", icon: Video, fg: "var(--accent-gold)", bg: "color-mix(in srgb, var(--accent-gold) 16%, transparent)", dot: "var(--accent-gold)" },
  carousel: { label: "Карусель", icon: Images, fg: "var(--accent-blue-bright)", bg: "color-mix(in srgb, var(--accent-blue-bright) 16%, transparent)", dot: "var(--accent-blue-bright)" },
  "article-site": { label: "Статья · сайт", icon: Newspaper, fg: "#3ddc97", bg: "color-mix(in srgb, #3ddc97 16%, transparent)", dot: "#3ddc97" },
  "article-tg": { label: "Статья · TG", icon: Send, fg: "#59b0ff", bg: "color-mix(in srgb, #59b0ff 16%, transparent)", dot: "#59b0ff" },
  cartoon: { label: "Мультрилс", icon: Clapperboard, fg: "#c08bff", bg: "color-mix(in srgb, #c08bff 16%, transparent)", dot: "#c08bff" },
  youtube: { label: "YouTube", icon: PlayCircle, fg: "#ff6b6b", bg: "color-mix(in srgb, #ff6b6b 16%, transparent)", dot: "#ff6b6b" },
};

const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const SPRING = { type: "spring" as const, damping: 26, stiffness: 260 };

function monthGrid(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const jsDay = first.getDay(); // 0=Sun
  const mondayOffset = jsDay === 0 ? 6 : jsDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < mondayOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function ScheduleSplitShell() {
  const reduceMotion = useReducedMotion();
  const cells = monthGrid(PLAN_YEAR, PLAN_MONTH);
  const byDay = new Map(SEED_PLAN.map((d) => [d.day, d]));
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === PLAN_YEAR && today.getMonth() === PLAN_MONTH;
  const todayDay = isCurrentMonth ? today.getDate() : -1;

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.05 } },
  };
  const item = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: reduceMotion ? { duration: 0 } : SPRING },
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-gold)]" />
          Контент-план
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
          Расписание
        </h1>
        <p className="max-w-2xl text-[var(--text-muted)]">
          Слева — месяц целиком, справа — список по датам. Расписание составляет
          Контент-директор в облачном чате; здесь только просмотр.
        </p>
        <span className="w-fit rounded-md border border-[color-mix(in_srgb,var(--accent-gold)_30%,var(--border-glass))] bg-[color-mix(in_srgb,var(--accent-gold)_10%,transparent)] px-2 py-0.5 font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--accent-gold)]">
          демо · ждёт расписание от Контент-директора
        </span>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Календарь — слева */}
        <div className="lg:col-span-2">
          <GlassCard disableHoverMotion className="flex flex-col gap-3">
            <div className="flex items-baseline gap-3">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {MONTH_NAMES[PLAN_MONTH]} {PLAN_YEAR}
              </h2>
              <span className="font-[family-name:var(--font-mono-jb)] text-[11px] uppercase tracking-wider text-[var(--text-mono)]">
                {SEED_PLAN.reduce((n, d) => n + d.slots.length, 0)} публикаций
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAYS.map((w) => (
                <div
                  key={w}
                  className="pb-1 text-center font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-mono)]"
                >
                  {w}
                </div>
              ))}
              {cells.map((day, i) => {
                const plan = day != null ? byDay.get(day) : undefined;
                const isToday = day === todayDay;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex min-h-[64px] flex-col gap-1 rounded-lg border p-1.5",
                      day == null
                        ? "border-transparent"
                        : plan
                          ? "border-[color-mix(in_srgb,var(--accent-gold)_30%,var(--border-glass))] bg-[var(--bg-card)]"
                          : "border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-card)_50%,transparent)]",
                      isToday &&
                        "ring-1 ring-[color-mix(in_srgb,var(--accent-blue-bright)_60%,transparent)]",
                    )}
                  >
                    {day != null && (
                      <>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            isToday
                              ? "text-[var(--accent-blue-bright)]"
                              : plan
                                ? "text-[var(--text-primary)]"
                                : "text-[var(--text-muted)]",
                          )}
                        >
                          {day}
                        </span>
                        {plan && (
                          <div className="flex flex-col gap-0.5">
                            {plan.slots.slice(0, 2).map((s, j) => {
                              const m = TYPE_META[s.type];
                              return (
                                <span
                                  key={j}
                                  className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[9px]"
                                  style={{ background: m.bg, color: m.fg }}
                                  title={s.title}
                                >
                                  <span
                                    className="inline-block h-1 w-1 shrink-0 rounded-full"
                                    style={{ background: m.dot }}
                                  />
                                  {m.label}
                                </span>
                              );
                            })}
                            {plan.slots.length > 2 && (
                              <span className="px-1 text-[9px] text-[var(--text-mono)]">
                                +{plan.slots.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Список — справа (тонкий) */}
        <motion.div
          className="flex flex-col gap-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {SEED_PLAN.map((d) => (
            <motion.div key={d.day} variants={item}>
              <GlassCard disableHoverMotion className="flex flex-col gap-2 p-3">
                <div className="flex items-baseline gap-2 border-b border-[var(--border-glass)] pb-1.5">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {d.day} {MONTH_NAMES[PLAN_MONTH].toLowerCase()}
                  </span>
                  <span className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-mono)]">
                    {d.weekday}
                  </span>
                </div>
                {d.slots.map((s, j) => {
                  const m = TYPE_META[s.type];
                  const Icon = m.icon;
                  return (
                    <div key={j} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ background: m.bg, color: m.fg }}
                        >
                          <Icon className="h-3 w-3" strokeWidth={2} />
                          {m.label}
                        </span>
                        <span className="font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-mono)]">
                          {s.time}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--text-primary)]">
                        {s.title}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        → {s.dest}
                      </span>
                    </div>
                  );
                })}
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
