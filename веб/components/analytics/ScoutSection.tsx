"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/cn";
import {
  runScoutTopicSearch,
  SCOUT_TYPE_LABELS,
  type ScoutContentType,
  type ScoutTopicResult,
} from "@/lib/analytics/scout-script";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

type Mode = "search" | "anomalies" | "stable";

/**
 * C-99 — topic search + script counts (no LLM / no «цель»).
 */
export function ScoutSection() {
  const reduceMotion = useReducedMotion();
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<ScoutTopicResult | null>(null);
  const [mode, setMode] = useState<Mode>("search");
  const [busy, setBusy] = useState(false);

  const types = useMemo(
    () => Object.keys(SCOUT_TYPE_LABELS) as ScoutContentType[],
    [],
  );

  async function runSearch() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 280));
    setResult(runScoutTopicSearch(topic));
    setMode("search");
    setBusy(false);
  }

  return (
    <section data-testid="analytics-scout" className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="font-[family-name:var(--font-ui)] text-[20px] font-bold text-[var(--text-primary)]">
          Разведка ниши
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-[14rem] flex-1 items-center gap-0 overflow-hidden rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)]">
            <input
              data-testid="scout-topic-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void runSearch();
              }}
              placeholder="Тема, которая интересует"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 font-[family-name:var(--font-ui)] text-sm text-[var(--text-primary)] outline-none"
            />
            <button
              type="button"
              data-testid="scout-topic-search"
              onClick={() => void runSearch()}
              disabled={busy}
              aria-label="Искать тему"
              className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--accent-gold)] text-[var(--bg-canvas)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Search className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
          <button
            type="button"
            data-testid="scout-pick-topic"
            onClick={() => void runSearch()}
            className="rounded-lg border border-[var(--border-glass)] px-3 py-2 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            Выбрать тему
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="scout-mode-anomalies"
          onClick={() => setMode("anomalies")}
          disabled={!result}
          className={cn(
            "rounded-lg border px-3 py-1.5 font-[family-name:var(--font-ui)] text-sm",
            mode === "anomalies"
              ? "border-[var(--accent-gold)] text-[var(--accent-gold)]"
              : "border-[var(--border-glass)] text-[var(--text-primary)]",
            !result && "opacity-40",
          )}
        >
          Аномалии
        </button>
        <button
          type="button"
          data-testid="scout-mode-stable"
          onClick={() => setMode("stable")}
          disabled={!result}
          className={cn(
            "rounded-lg border px-3 py-1.5 font-[family-name:var(--font-ui)] text-sm",
            mode === "stable"
              ? "border-[var(--accent-blue-bright)] text-[var(--accent-blue-bright)]"
              : "border-[var(--border-glass)] text-[var(--text-primary)]",
            !result && "opacity-40",
          )}
        >
          Стабильно
        </button>
      </div>

      {!result ? (
        <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--text-primary)]">
          Введите тему и нажмите лупу — скрипт посчитает объём контента по типам
          (без ИИ).
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {types.map((t, i) => {
            const row = result.byType[t];
            const value =
              mode === "anomalies"
                ? row.anomalies
                : mode === "stable"
                  ? row.stableChannels
                  : row.total;
            const caption =
              mode === "anomalies"
                ? "аномалий"
                : mode === "stable"
                  ? "стабильных каналов"
                  : "контента";
            return (
              <motion.div
                key={t}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { ...SPRING, delay: i * 0.04 }
                }
              >
                <GlassCard className="flex flex-col gap-1 border-[var(--border-glass)] bg-[var(--bg-elevated)] p-4">
                  <p className="font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--text-primary)]">
                    {SCOUT_TYPE_LABELS[t]}
                  </p>
                  <p
                    data-testid={`scout-type-${t}`}
                    className="text-2xl font-bold tabular-nums text-[var(--accent-gold)]"
                  >
                    {value}
                  </p>
                  <p className="font-[family-name:var(--font-ui)] text-xs text-[var(--text-primary)]">
                    {caption} · тема «{result.topic}»
                  </p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
