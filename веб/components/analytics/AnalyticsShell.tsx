"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { AnalyticsMainGrid } from "@/components/analytics/AnalyticsMainGrid";
import { AnalyticsModuleMenu } from "@/components/analytics/AnalyticsModuleMenu";
import { KpiCardsRow } from "@/components/analytics/KpiCardsRow";
import { OutliersVault } from "@/components/analytics/OutliersVault";
import { ScoutSection } from "@/components/analytics/ScoutSection";
import { TelemetryMatrix } from "@/components/analytics/TelemetryMatrix";
import { InsightsFeed } from "@/components/analytics/InsightsFeed";
import { PublishedPostsTable } from "@/components/analytics/PublishedPostsTable";
import { findStudioModule } from "@/components/studio/modules";
import { getSelfLearningDashboard } from "@/lib/analytics/self-learning-mock";
import { useStudioStore } from "@/lib/studio-store";
import type { TopKpiMetric } from "@/types/analytics";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

type AnalyticsView = "menu" | "dashboard";

/** C-99 — merge volume + anomalies into one card «N / M». */
function mergeKpis(kpis: TopKpiMetric[]): TopKpiMetric[] {
  const volume = kpis.find((k) => k.id === "scout-volume");
  const outliers = kpis.find((k) => k.id === "outliers");
  const rest = kpis.filter(
    (k) => k.id !== "scout-volume" && k.id !== "outliers",
  );
  const merged: TopKpiMetric = {
    id: "content-anomalies",
    label: "Контент / аномалии",
    value: `${volume?.value ?? "0"} / ${outliers?.value ?? "0"}`,
    delta: outliers?.delta ?? volume?.delta ?? "",
    isPositive: true,
    subtext: "всего разведано / аномалий 5×+",
    accentColor: "cyan",
  };
  return [merged, ...rest];
}

type AnalyticsShellProps = {
  /** C-136 — open dashboard for nested `/studio/[moduleId]/analytics`. */
  initialModuleId?: string;
};

export function AnalyticsShell({ initialModuleId }: AnalyticsShellProps = {}) {
  const reduceMotion = useReducedMotion();
  const dashboard = useMemo(() => getSelfLearningDashboard(), []);
  // KPI №1 Вернатуна — люди на живых встречах (воронка). Значение приходит из
  // ingest воронки (клики бот/регистрация, заходы /campus); до подключения — «—».
  const kpis = useMemo(() => {
    const funnel: TopKpiMetric = {
      id: "meetings-funnel",
      label: "Люди на встречах",
      value: "—",
      delta: "",
      isPositive: true,
      subtext: "KPI №1 · воронка (ждёт данных)",
      accentColor: "cyan",
    };
    return [funnel, ...mergeKpis(dashboard.kpis)];
  }, [dashboard.kpis]);
  const [contentTypeId, setContentTypeId] = useState("all");
  const [platformId, setPlatformId] = useState("all");
  const [view, setView] = useState<AnalyticsView>(
    initialModuleId ? "dashboard" : "menu",
  );
  const [moduleId, setModuleId] = useState<string | null>(
    initialModuleId ?? null,
  );

  const customModules = useStudioStore((s) => s.customModules);
  const hydrateCustomModules = useStudioStore((s) => s.hydrateCustomModules);

  useEffect(() => {
    void hydrateCustomModules();
  }, [hydrateCustomModules]);

  const moduleLabel = useMemo(() => {
    if (!moduleId) return null;
    return findStudioModule(moduleId, customModules)?.label ?? moduleId;
  }, [moduleId, customModules]);

  function openModule(id: string) {
    setModuleId(id);
    setView("dashboard");
  }

  function backToMenu() {
    setView("menu");
    setModuleId(null);
  }

  return (
    <motion.div
      data-testid="analytics-shell"
      className="flex w-full min-w-0 flex-col gap-8 pb-16"
      initial={false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduceMotion ? { duration: 0 } : SPRING}
    >
      <AnalyticsHeader
        contentTypeId={contentTypeId}
        platformId={platformId}
        onContentTypeChange={setContentTypeId}
        onPlatformChange={setPlatformId}
      />

      {view === "menu" ? (
        <AnalyticsModuleMenu onSelectModule={openModule} />
      ) : (
        <div
          data-testid="analytics-dashboard"
          data-module-id={moduleId ?? undefined}
          className="flex flex-col gap-8"
        >
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-testid="analytics-back-menu"
              onClick={backToMenu}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-glass)] bg-[var(--bg-elevated)] px-3 py-1.5 font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--text-primary)] transition-colors hover:border-[color-mix(in_srgb,var(--accent-blue-bright)_40%,var(--border-glass))] hover:text-[var(--accent-blue-bright)]"
            >
              ← К меню
            </button>
            <nav
              aria-label="Навигация аналитики"
              className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--text-muted)]"
            >
              <button
                type="button"
                onClick={backToMenu}
                className="hover:text-[var(--text-primary)]"
              >
                Модули
              </button>
              <span aria-hidden className="text-[var(--text-mono)]">
                /
              </span>
              <span className="font-medium text-[var(--text-primary)]">
                {moduleLabel}
              </span>
            </nav>
          </div>

          <KpiCardsRow kpis={kpis} />
          <ScoutSection />
          <OutliersVault
            outliers={dashboard.outliers}
            platformFilter={platformId}
          />
          <AnalyticsMainGrid
            retention={dashboard.retention}
            retentionSummary={dashboard.retentionSummary}
            rlFeed={dashboard.rlFeed}
          />
          <TelemetryMatrix telemetry={dashboard.telemetry} />

          {/* C-A1 — реальный путь данных на экране: ingest → API → store.
              Показывает живые данные при наличии ключей/ингеста, иначе seed-fallback. */}
          <div className="flex flex-col gap-2">
            <p className="font-[family-name:var(--font-mono-jb)] text-[11px] uppercase tracking-wider text-[var(--accent-gold)]">
              Реальные данные (API) · источник помечен в блоке · seed-демо пока нет ключей/ингеста
            </p>
            <InsightsFeed />
          </div>
          <PublishedPostsTable />
        </div>
      )}
    </motion.div>
  );
}
