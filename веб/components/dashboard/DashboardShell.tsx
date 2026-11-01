"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  CalendarClock,
  Clapperboard,
  Images,
  LayoutGrid,
  Newspaper,
  Palette,
  Send,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { FunnelChart } from "@/components/analytics/FunnelChart";
import {
  getContentFunnelSeed,
  funnelConversions,
} from "@/lib/analytics/funnel";
import { cn } from "@/lib/cn";

const SPRING = { type: "spring" as const, damping: 26, stiffness: 260 };
const STAGGER = 0.06;

type Stat = {
  id: string;
  label: string;
  value: string;
  sub?: string;
  accent: "gold" | "blue" | "green";
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const STATS: Stat[] = [
  { id: "meetings", label: "Люди на встречах (KPI №1)", value: "—", sub: "цель месяца · данные от аналитика", accent: "gold", icon: Users },
  { id: "published", label: "Опубликовано за 30 дней", value: "—", sub: "из витрины «Опубликовано»", accent: "blue", icon: Activity },
  { id: "reach", label: "Суммарный охват", value: "—", sub: "Scout: свои + ниша", accent: "blue", icon: TrendingUp },
  { id: "scheduled", label: "В расписании", value: "—", sub: "ближайшие публикации", accent: "green", icon: CalendarClock },
];

const MODULES: { id: string; label: string; icon: Stat["icon"] }[] = [
  { id: "carousel-engine", label: "Карусели", icon: Images },
  { id: "club-reels", label: "Рилс", icon: Video },
  { id: "cartoon-reels", label: "Мультрилсы", icon: Clapperboard },
  { id: "heygen-reels", label: "HeyGen-рилсы", icon: Video },
  { id: "aesthetic-graphics", label: "Графика", icon: Palette },
  { id: "site-articles", label: "Статьи · сайт", icon: Newspaper },
  { id: "tg-articles", label: "Статьи · TG", icon: Send },
];

const ACCENT_BG: Record<Stat["accent"], string> = {
  gold: "color-mix(in srgb, var(--accent-gold) 22%, transparent)",
  blue: "color-mix(in srgb, var(--accent-blue-bright) 22%, transparent)",
  green: "color-mix(in srgb, #3ddc97 22%, transparent)",
};
const ACCENT_FG: Record<Stat["accent"], string> = {
  gold: "var(--accent-gold)",
  blue: "var(--accent-blue-bright)",
  green: "#3ddc97",
};

export function DashboardShell() {
  const reduceMotion = useReducedMotion();
  const funnel = getContentFunnelSeed();
  const conversions = funnelConversions(funnel);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : STAGGER } },
  };
  const item = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: reduceMotion ? { duration: 0 } : SPRING },
  };

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Hero */}
      <motion.header variants={item} className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-gold)]" />
          Командный центр
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
          Ситуационный центр
        </h1>
        <p className="max-w-2xl text-[var(--text-muted)]">
          Общая картина фабрики: воронка к встречам, статус модулей и свежие
          сигналы. Данные наполняются агентами (Scout / Аналитик) и витриной
          «Опубликовано».
        </p>
      </motion.header>

      {/* KPI strip */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <GlassCard
              key={s.id}
              disableHoverMotion
              className="relative flex flex-col gap-3 overflow-hidden"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl"
                style={{ background: ACCENT_BG[s.accent], opacity: 0.6 }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">{s.label}</span>
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: ACCENT_BG[s.accent], color: ACCENT_FG[s.accent] }}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
              </div>
              <div
                className="text-3xl font-semibold tracking-tight"
                style={{ color: ACCENT_FG[s.accent] }}
              >
                {s.value}
              </div>
              {s.sub ? (
                <p className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-mono)]">
                  {s.sub}
                </p>
              ) : null}
            </GlassCard>
          );
        })}
      </motion.div>

      {/* Funnel + статус */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <motion.div variants={item} className="xl:col-span-2">
          <GlassCard disableHoverMotion className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Воронка к встречам
              </h2>
              <span className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-mono)]">
                Контент → Telegram → Встреча → Остались
              </span>
            </div>
            <FunnelChart funnel={funnel} />
            <p className="text-xs text-[var(--text-muted)]">
              Итоговая конверсия контент → остались:{" "}
              <span className="text-[var(--accent-gold)]">
                {conversions.length
                  ? `${conversions[conversions.length - 1]}%`
                  : "—"}
              </span>
              . Seed-данные; реальные подтянет Аналитик.
            </p>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard disableHoverMotion className="flex h-full flex-col gap-3">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Статус модулей
            </h2>
            <div className="flex flex-col gap-1.5">
              {MODULES.map((m) => {
                const Icon = m.icon;
                return (
                  <Link
                    key={m.id}
                    href={`/studio/${m.id}`}
                    className={cn(
                      "group flex items-center justify-between rounded-lg border border-transparent px-2.5 py-2 transition-colors",
                      "hover:border-[var(--border-glass)] hover:bg-[var(--bg-hover)]",
                    )}
                  >
                    <span className="flex items-center gap-2.5 text-sm text-[var(--text-primary)]">
                      <Icon
                        className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--accent-gold)]"
                        strokeWidth={1.75}
                      />
                      {m.label}
                    </span>
                    <span className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-mono)]">
                      открыть →
                    </span>
                  </Link>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Быстрые переходы */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {[
          { href: "/studio", label: "Студия", desc: "Каналы рендера и ленты результатов", icon: LayoutGrid },
          { href: "/schedule", label: "Расписание", desc: "Готовые публикации по датам", icon: CalendarClock },
          { href: "/analytics", label: "Аналитика", desc: "Самообучающаяся диагностика", icon: Activity },
        ].map((q) => {
          const Icon = q.icon;
          return (
            <Link key={q.href} href={q.href}>
              <GlassCard className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-[var(--accent-gold)]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {q.label}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{q.desc}</span>
                </div>
              </GlassCard>
            </Link>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
