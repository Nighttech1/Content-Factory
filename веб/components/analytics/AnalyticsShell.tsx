"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Eye,
  UserPlus,
  Send,
  Users,
  Repeat,
  Radar,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/cn";

/**
 * Аналитика — чистая, БЕЗ мокапа. Данные либо реальные (когда подключены
 * источники), либо пусто с пояснением. Тумблер по модулям + полная воронка.
 */

type ModuleTab = {
  id: string;
  label: string;
};

const MODULE_TABS: ModuleTab[] = [
  { id: "all", label: "Все" },
  { id: "carousel-engine", label: "Карусели" },
  { id: "club-reels", label: "Рилс" },
  { id: "cartoon-reels", label: "Мультрилсы" },
  { id: "heygen-reels", label: "HeyGen" },
  { id: "youtube-cartoon", label: "YouTube" },
  { id: "aesthetic-graphics", label: "Графика" },
  { id: "site-articles", label: "Статьи · сайт" },
  { id: "tg-articles", label: "Статьи · TG" },
];

type Stage = {
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const FUNNEL_STAGES: Stage[] = [
  { label: "Посмотрели контент", hint: "охваты рилсов/каруселей/статей — от Scout (Apify) + YouTube API", icon: Eye },
  { label: "Подписались в Instagram", hint: "прирост подписчиков @mosarmclub — IG Insights", icon: UserPlus },
  { label: "Зашли в Telegram", hint: "новые подписчики канала — TG Bot API", icon: Send },
  { label: "Пришли на встречу", hint: "регистрации/явки — @vernatunbot / учёт на встрече", icon: Users },
  { label: "Остались (2-я встреча)", hint: "вернулись на 2-ю+ встречу — учёт клуба", icon: Repeat },
];

const SPRING = { type: "spring" as const, damping: 26, stiffness: 260 };

export function AnalyticsShell({
  initialModuleId,
}: {
  initialModuleId?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<string>(initialModuleId ?? "all");
  const activeLabel =
    MODULE_TABS.find((t) => t.id === active)?.label ?? "Все";

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.05 } },
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
      <motion.header variants={item} className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-[0.2em] text-[var(--accent-gold)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-gold)]" />
          Метрики к встречам
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
          Аналитика
        </h1>
        <p className="max-w-2xl text-[var(--text-muted)]">
          Путь зрителя до живой встречи — по каждому модулю. Цифры появляются по
          мере подключения источников (Scout/Apify, IG Insights, TG-бот, учёт
          явок); пока источник не подключён — честно пусто.
        </p>
      </motion.header>

      {/* Тумблер по модулям — статичный, крупный */}
      <motion.div variants={item}>
        <div
          role="tablist"
          aria-label="Модуль для аналитики"
          className="flex flex-wrap gap-1.5 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] p-1.5"
        >
          {MODULE_TABS.map((t) => {
            const on = active === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(t.id)}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  on
                    ? "bg-[color-mix(in_srgb,var(--accent-gold)_22%,transparent)] text-[var(--accent-gold)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Полная воронка к встречам для выбранного модуля */}
      <motion.div variants={item}>
        <GlassCard disableHoverMotion className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Воронка к встречам · {activeLabel}
            </h2>
            <span className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-mono)]">
              контент → встреча → остались
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {FUNNEL_STAGES.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] p-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-[var(--accent-gold)]">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {i + 1}. {s.label}
                    </span>
                    <span className="truncate text-[11px] text-[var(--text-muted)]">
                      источник: {s.hint}
                    </span>
                  </div>
                  <span className="shrink-0 font-[family-name:var(--font-mono-jb)] text-xl text-[var(--text-mono)]">
                    —
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Значения «—» — источник ещё не подключён. Полная цепочка заполнится,
            когда заработают Scout (Apify), IG Insights, TG-бот и учёт явок.
          </p>
        </GlassCard>
      </motion.div>

      {/* Три честных блока */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <EmptySection
          icon={Radar}
          title="Разведка ниши"
          body="Топ виральных аккаунтов и постов по армянской нише."
          note="Пусто: нужен APIFY_TOKEN на VPS + прогон Scout («Разведать»)."
        />
        <EmptySection
          icon={AlertTriangle}
          title="Аномалии по контенту"
          body="Что вдруг выстрелило/просело — по каждому типу контента. Scout раздаёт аномалии агентам, они правят тему и оформление и уведомляют тебя."
          note="Пусто: появятся после прогона Scout."
        />
        <EmptySection
          icon={FileCheck2}
          title="Опубликованные активы"
          body="Наши вышедшие единицы и их показатели (вовлечённость, сохранения, просмотры) — по типам."
          note="Пусто: появятся после апрува и пуша от агентов."
        />
      </motion.div>
    </motion.div>
  );
}

function EmptySection({
  icon: Icon,
  title,
  body,
  note,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  body: string;
  note: string;
}) {
  return (
    <GlassCard disableHoverMotion className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-[var(--accent-gold)]">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
      </div>
      <p className="text-xs text-[var(--text-muted)]">{body}</p>
      <div className="mt-auto flex items-center gap-2 rounded-lg border border-dashed border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2">
        <span className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-mono)]">
          {note}
        </span>
      </div>
    </GlassCard>
  );
}
