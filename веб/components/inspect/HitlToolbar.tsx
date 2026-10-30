"use client";

import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonBadge } from "@/components/ui/NeonBadge";
import { ReactiveButton } from "@/components/ui/ReactiveButton";
import { ApproveScheduleModal } from "@/components/inspect/ApproveScheduleModal";
import { useInspectStore } from "@/lib/inspect-store";
import { cn } from "@/lib/cn";
import type { InspectStatus } from "@/lib/inspect-mock";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

function formatScheduledAt(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function statusLabel(status: InspectStatus): string {
  if (status === "scheduled") return "В слоте";
  if (status === "approved") return "Утверждено";
  return "Ждёт подтверждения";
}

function statusTone(
  status: InspectStatus,
): "gold" | "cobalt" | "terracotta" {
  if (status === "scheduled") return "gold";
  if (status === "approved") return "cobalt";
  return "terracotta";
}

export function HitlToolbar() {
  const reduceMotion = useReducedMotion();
  const slides = useInspectStore((s) => s.slides);
  const selectedSlideId = useInspectStore((s) => s.selectedSlideId);
  const status = useInspectStore((s) => s.status);
  const scheduledAt = useInspectStore((s) => s.scheduledAt);
  const rerollSelectedSlide = useInspectStore((s) => s.rerollSelectedSlide);
  const openApproveModal = useInspectStore((s) => s.openApproveModal);

  const prevStatusRef = useRef(status);
  const justScheduled =
    prevStatusRef.current !== "scheduled" && status === "scheduled";

  useEffect(() => {
    prevStatusRef.current = status;
  }, [status]);

  const ordered = useMemo(
    () => [...slides].sort((a, b) => a.order - b.order),
    [slides],
  );

  const selected = ordered.find((s) => s.id === selectedSlideId) ?? ordered[0];
  const displayIndex = selected ? selected.order + 1 : 1;
  const version = selected?.version ?? 1;
  const isScheduled = status === "scheduled";
  const scheduledLabel = formatScheduledAt(scheduledAt);

  return (
    <>
      <div data-testid="hitl-toolbar">
        <GlassCard className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="font-[family-name:var(--font-mono-jb)] text-[11px] uppercase tracking-[0.14em] text-[var(--accent-blue-bright)]">
                Действия согласования
              </p>
              <p
                data-testid="hitl-slide-status"
                className="text-sm font-semibold text-[var(--text-primary)]"
              >
                Слайд №{displayIndex} · версия {version}
              </p>
            </div>

            <div
              data-testid="hitl-status-chip"
              className="relative flex flex-wrap items-center gap-2"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={status}
                  className="relative"
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0.55, scale: 0.94, y: 6 }
                  }
                  animate={
                    reduceMotion
                      ? { opacity: 1, scale: 1, y: 0 }
                      : justScheduled
                        ? { opacity: 1, scale: [0.94, 1.08, 1], y: 0 }
                        : { opacity: 1, scale: 1, y: 0 }
                  }
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.96, y: -4 }
                  }
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                >
                  <NeonBadge tone={statusTone(status)}>
                    {statusLabel(status)}
                    {isScheduled && scheduledLabel ? ` · ${scheduledLabel}` : ""}
                  </NeonBadge>

                  {justScheduled && !reduceMotion ? (
                    <motion.span
                      key={`celebrate-${scheduledAt ?? "now"}`}
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-md bg-[color-mix(in_srgb,var(--accent-gold)_42%,transparent)]"
                      initial={{ opacity: 0.7, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.35 }}
                      transition={SPRING}
                    />
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              type="button"
              data-testid="hitl-reroll"
              onClick={rerollSelectedSlide}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              transition={reduceMotion ? { duration: 0 } : SPRING}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border border-[var(--border-glass)]",
                "bg-[var(--bg-hover)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-primary)]",
                "transition-colors hover:border-[color-mix(in_srgb,var(--accent-blue-bright)_40%,var(--border-glass))]",
              )}
            >
              <span aria-hidden>🔄</span>
              Перегенерировать слайд #{displayIndex}
            </motion.button>

            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Скоро"
              className="cursor-not-allowed rounded-lg border border-[var(--border-glass)] px-3 py-2.5 text-sm text-[var(--text-mono)] opacity-45"
            >
              Субтитры
            </button>
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Скоро"
              className="cursor-not-allowed rounded-lg border border-[var(--border-glass)] px-3 py-2.5 text-sm text-[var(--text-mono)] opacity-45"
            >
              A/B
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-glass)] pt-4">
            <p className="max-w-sm text-xs text-[var(--text-muted)]">
              Реролл обновляет только выбранный слайд. «Утвердить» фиксирует дату
              публикации без перезапуска пайплайна.
            </p>

            <motion.div
              key={isScheduled ? "cta-scheduled" : "cta-approve"}
              initial={
                reduceMotion || !justScheduled
                  ? false
                  : { opacity: 0.7, scale: 0.96 }
              }
              animate={{ opacity: 1, scale: 1 }}
              transition={reduceMotion ? { duration: 0 } : SPRING}
            >
              <ReactiveButton
                data-testid="hitl-approve"
                disabled={isScheduled}
                onClick={openApproveModal}
                className={cn(
                  "min-w-[200px]",
                  isScheduled &&
                    "bg-[color-mix(in_srgb,var(--accent-gold)_18%,var(--bg-elevated))]!",
                )}
              >
                {isScheduled ? (
                  <>В слоте ✓</>
                ) : (
                  <>
                    Утвердить и поставить в слот{" "}
                    <span aria-hidden>🚀</span>
                  </>
                )}
              </ReactiveButton>
            </motion.div>
          </div>
        </GlassCard>
      </div>

      <ApproveScheduleModal />
    </>
  );
}
