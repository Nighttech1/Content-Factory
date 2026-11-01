"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Clapperboard,
  Images,
  Newspaper,
  Send,
  Video,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

/**
 * Расписание — только просмотр. Расписание составляет Контент-директор
 * (облачный агент) и присылает готовые единицы; веб показывает список по датам.
 * Пока агенты не пушат реальное расписание — seed-демо (помечено).
 */

type SlotType = "reel" | "carousel" | "article-site" | "article-tg" | "cartoon";

type Slot = {
  type: SlotType;
  title: string;
  dest: string;
  time: string;
};

type DayPlan = { date: string; weekday: string; slots: Slot[] };

const TYPE_META: Record<
  SlotType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    fg: string;
    bg: string;
  }
> = {
  reel: {
    label: "Рилс",
    icon: Video,
    fg: "var(--accent-gold)",
    bg: "color-mix(in srgb, var(--accent-gold) 16%, transparent)",
  },
  carousel: {
    label: "Карусель",
    icon: Images,
    fg: "var(--accent-blue-bright)",
    bg: "color-mix(in srgb, var(--accent-blue-bright) 16%, transparent)",
  },
  "article-site": {
    label: "Статья · сайт",
    icon: Newspaper,
    fg: "#3ddc97",
    bg: "color-mix(in srgb, #3ddc97 16%, transparent)",
  },
  "article-tg": {
    label: "Статья · TG",
    icon: Send,
    fg: "#59b0ff",
    bg: "color-mix(in srgb, #59b0ff 16%, transparent)",
  },
  cartoon: {
    label: "Мультрилс",
    icon: Clapperboard,
    fg: "#c08bff",
    bg: "color-mix(in srgb, #c08bff 16%, transparent)",
  },
};

// Seed-демо расписания (заменится пушами Контент-директора).
const SEED: DayPlan[] = [
  {
    date: "4 ноября",
    weekday: "Вт",
    slots: [
      { type: "reel", title: "«3 места, где звучит армянский в Москве»", dest: "Instagram Reels + TG", time: "20:00" },
    ],
  },
  {
    date: "8 ноября",
    weekday: "Сб",
    slots: [
      { type: "reel", title: "«Как вернуть подзабытый армянский»", dest: "Instagram Reels", time: "19:00" },
      { type: "article-site", title: "Гид: куда пойти армянину в Москве", dest: "vernatunspeakclub.com + TG", time: "12:00" },
    ],
  },
  {
    date: "11 ноября",
    weekday: "Вт",
    slots: [
      { type: "carousel", title: "«5 фраз для первого разговора»", dest: "Instagram", time: "20:00" },
      { type: "article-tg", title: "Мини-история клуба: встреча недели", dest: "Telegram (Telegra.ph)", time: "18:00" },
    ],
  },
  {
    date: "15 ноября",
    weekday: "Сб",
    slots: [
      { type: "reel", title: "«Один вечер в разговорной комнате»", dest: "Instagram Reels", time: "15:00" },
      { type: "cartoon", title: "Мульт-история: как я заговорил", dest: "Instagram + TG", time: "19:00" },
    ],
  },
  {
    date: "18 ноября",
    weekday: "Вт",
    slots: [
      { type: "carousel", title: "«Разбор: армянский за 15 минут в день»", dest: "Instagram", time: "20:00" },
    ],
  },
];

const SPRING = { type: "spring" as const, damping: 26, stiffness: 260 };

export function ScheduleListShell() {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.06 } },
  };
  const item = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduceMotion ? { duration: 0 } : SPRING,
    },
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
          Готовые публикации по датам. Расписание составляет Контент-директор в
          облачном чате и присылает сюда готовое — это просмотр, без правок.
        </p>
        <span className="w-fit rounded-md border border-[color-mix(in_srgb,var(--accent-gold)_30%,var(--border-glass))] bg-[color-mix(in_srgb,var(--accent-gold)_10%,transparent)] px-2 py-0.5 font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--accent-gold)]">
          демо · ждёт расписание от Контент-директора
        </span>
      </header>

      <motion.div
        className="flex flex-col gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {SEED.map((day) => (
          <motion.div key={day.date} variants={item}>
            <GlassCard disableHoverMotion className="flex flex-col gap-3">
              <div className="flex items-baseline gap-3 border-b border-[var(--border-glass)] pb-2.5">
                <span className="text-lg font-semibold text-[var(--text-primary)]">
                  {day.date}
                </span>
                <span className="font-[family-name:var(--font-mono-jb)] text-[11px] uppercase tracking-wider text-[var(--text-mono)]">
                  {day.weekday}
                </span>
                <span className="ml-auto font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--text-mono)]">
                  {day.slots.length} публ.
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {day.slots.map((slot, i) => {
                  const meta = TYPE_META[slot.type];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={i}
                      className="flex flex-col gap-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] p-3 sm:flex-row sm:items-center sm:gap-4"
                    >
                      <span
                        className="flex w-fit shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
                        style={{ background: meta.bg, color: meta.fg }}
                      >
                        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                        {meta.label}
                      </span>
                      <span className="min-w-0 flex-1 text-sm text-[var(--text-primary)]">
                        {slot.title}
                      </span>
                      <span className="shrink-0 text-xs text-[var(--text-muted)]">
                        {slot.dest}
                      </span>
                      <span className="shrink-0 font-[family-name:var(--font-mono-jb)] text-xs text-[var(--text-mono)]">
                        {slot.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
