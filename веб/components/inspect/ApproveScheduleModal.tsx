"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ReactiveButton } from "@/components/ui/ReactiveButton";
import { useInspectStore } from "@/lib/inspect-store";
import { cn } from "@/lib/cn";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultScheduleLocal(): string {
  const d = new Date();
  d.setHours(d.getHours() + 2, 0, 0, 0);
  return toDatetimeLocalValue(d);
}

function localInputToIso(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}

export function ApproveScheduleModal() {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const open = useInspectStore((s) => s.approveModalOpen);
  const confirmApproveSchedule = useInspectStore((s) => s.confirmApproveSchedule);
  const cancelApproveModal = useInspectStore((s) => s.cancelApproveModal);
  const [scheduleLocal, setScheduleLocal] = useState(defaultScheduleLocal);

  useEffect(() => {
    if (!open) return;
    setScheduleLocal(defaultScheduleLocal());
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelApproveModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, cancelApproveModal]);

  const handleConfirm = () => {
    confirmApproveSchedule(localInputToIso(scheduleLocal));
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="approve-schedule-modal"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <motion.button
            type="button"
            aria-label="Закрыть подтверждение"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={cancelApproveModal}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-testid="approve-schedule-modal"
            className={cn(
              "relative z-10 w-full max-w-md rounded-xl border border-[var(--border-glass)]",
              "bg-[var(--bg-elevated)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.55)]",
            )}
            initial={
              reduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 10, scale: 0.97 }
            }
            transition={reduceMotion ? { duration: 0 } : SPRING}
          >
            <p className="font-[family-name:var(--font-mono-jb)] text-[11px] uppercase tracking-[0.14em] text-[var(--accent-gold)]">
              Согласование · Утвердить
            </p>
            <h2
              id={titleId}
              className="mt-1 text-lg font-semibold text-[var(--text-primary)]"
            >
              Утвердить и поставить в слот
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Подтвердите публикацию выбранного черновика. Укажите дату и время —
              статус инспектора сменится на «Запланировано».
            </p>

            <label className="mt-5 flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[var(--text-muted)]">
                Дата и время публикации
              </span>
              <input
                ref={inputRef}
                type="datetime-local"
                data-testid="approve-schedule-datetime"
                value={scheduleLocal}
                onChange={(e) => setScheduleLocal(e.target.value)}
                className={cn(
                  "rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-2.5",
                  "font-[family-name:var(--font-mono-jb)] text-sm text-[var(--text-primary)]",
                  "outline-none focus:border-[color-mix(in_srgb,var(--accent-blue-bright)_55%,var(--border-glass))]",
                )}
              />
            </label>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
              <motion.button
                type="button"
                data-testid="approve-schedule-cancel"
                onClick={cancelApproveModal}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={reduceMotion ? { duration: 0 } : SPRING}
                className={cn(
                  "rounded-lg border border-[var(--border-glass)] px-4 py-2.5",
                  "text-sm font-medium text-[var(--text-muted)]",
                  "transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                )}
              >
                Отмена
              </motion.button>
              <ReactiveButton
                data-testid="approve-schedule-confirm"
                onClick={handleConfirm}
                className="min-w-[140px]"
              >
                Подтвердить слот
              </ReactiveButton>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
