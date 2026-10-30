"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/cn";
import type { RlProposal, RlProposalStatus } from "@/types/analytics";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };
const APPROVED_LS_KEY = "cf.analytics.rl.approved";

const CATEGORY_STYLE: Record<
  RlProposal["category"],
  { border: string; text: string; bg: string }
> = {
  HOOK: {
    border: "border-[color-mix(in_srgb,var(--accent-gold-bright)_35%,transparent)]",
    text: "text-[var(--accent-gold-bright)]",
    bg: "bg-[color-mix(in_srgb,var(--accent-gold-bright)_12%,transparent)]",
  },
  PACING: {
    border: "border-[color-mix(in_srgb,var(--accent-blue-bright)_35%,transparent)]",
    text: "text-[var(--accent-blue-bright)]",
    bg: "bg-[color-mix(in_srgb,var(--accent-blue-bright)_12%,transparent)]",
  },
  VOICEOVER: {
    border: "border-[color-mix(in_srgb,var(--accent-terracotta)_35%,transparent)]",
    text: "text-[var(--accent-terracotta)]",
    bg: "bg-[color-mix(in_srgb,var(--accent-terracotta)_12%,transparent)]",
  },
  VISUAL_BROLL: {
    border: "border-[color-mix(in_srgb,#34d399_35%,transparent)]",
    text: "text-[#34d399]",
    bg: "bg-[color-mix(in_srgb,#34d399_12%,transparent)]",
  },
};

type RlFeedProps = {
  rlFeed: RlProposal[];
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function readApprovedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(APPROVED_LS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function writeApprovedIds(ids: Set<string>) {
  try {
    window.localStorage.setItem(
      APPROVED_LS_KEY,
      JSON.stringify([...ids]),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

function statusBadge(status: RlProposalStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case "approved":
      return {
        label: "Согласовано",
        className:
          "border-[color-mix(in_srgb,#34d399_40%,transparent)] bg-[color-mix(in_srgb,#34d399_14%,transparent)] text-[#34d399]",
      };
    case "rejected":
      return {
        label: "Отклонено",
        className:
          "border-[color-mix(in_srgb,var(--accent-terracotta)_40%,transparent)] bg-[color-mix(in_srgb,var(--accent-terracotta)_12%,transparent)] text-[var(--accent-terracotta)]",
      };
    default:
      return {
        label: "Ожидает",
        className:
          "border-[var(--border-glass)] bg-[var(--bg-hover)] text-[var(--text-muted)]",
      };
  }
}

export function RlFeed({ rlFeed }: RlFeedProps) {
  const reduceMotion = useReducedMotion();
  const [items, setItems] = useState<RlProposal[]>(rlFeed);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const approved = readApprovedIds();
    setItems(
      rlFeed.map((entry) =>
        approved.has(entry.id) && entry.status === "pending"
          ? { ...entry, status: "approved" as const }
          : entry,
      ),
    );
  }, [rlFeed]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  const approve = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.map((e) =>
          e.id === id && e.status === "pending"
            ? { ...e, status: "approved" as const }
            : e,
        );
        const approved = new Set(
          next.filter((e) => e.status === "approved").map((e) => e.id),
        );
        writeApprovedIds(approved);
        return next;
      });
      // Mock apply — toast only; no prod skills/rules write
      showToast("Предложение Тренера согласовано (мок)");
    },
    [showToast],
  );

  const reject = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((e) =>
          e.id === id && e.status === "pending"
            ? { ...e, status: "rejected" as const }
            : e,
        ),
      );
      showToast("Предложение отклонено");
    },
    [showToast],
  );

  return (
    <section data-testid="analytics-rl-feed" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="font-[family-name:var(--font-mono-jb)] text-[11px] uppercase tracking-wider text-[#34d399]">
          Лента самообучения
        </p>
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
          RL · предложения Тренера
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          HITL: без «Согласовано» правки skills/rules не применяются.
        </p>
      </div>

      {toast ? (
        <div
          data-testid="rl-toast"
          role="status"
          className="rounded-lg border border-[color-mix(in_srgb,#34d399_35%,transparent)] bg-[color-mix(in_srgb,#34d399_10%,var(--bg-elevated))] px-3 py-2 text-sm text-[#34d399]"
        >
          {toast}
        </div>
      ) : null}

      <GlassCard className="flex flex-col gap-0 overflow-hidden border-[var(--border-glass)] bg-[var(--bg-elevated)] p-0">
        {items.map((entry, i) => {
          const style = CATEGORY_STYLE[entry.category];
          const st = statusBadge(entry.status);
          const pending = entry.status === "pending";

          return (
            <motion.article
              key={entry.id}
              data-testid={`rl-proposal-${entry.id}`}
              data-status={entry.status}
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { ...SPRING, delay: i * 0.05 }
              }
              className={cn(
                "flex flex-col gap-2 border-b border-[var(--border-glass)] p-4 last:border-b-0",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 font-[family-name:var(--font-mono-jb)] text-[10px] font-semibold uppercase",
                      style.border,
                      style.text,
                      style.bg,
                    )}
                  >
                    {entry.categoryRu}
                  </span>
                  <span
                    data-testid="rl-author-badge"
                    className="rounded-md border border-[color-mix(in_srgb,var(--accent-blue-bright)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent-blue-bright)_10%,transparent)] px-2 py-0.5 font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--accent-blue-bright)]"
                  >
                    Предложение Тренера
                  </span>
                  <span className="font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-muted)]">
                    цикл {entry.cycle}
                  </span>
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 font-[family-name:var(--font-mono-jb)] text-[10px]",
                      st.className,
                    )}
                    data-testid={`rl-status-${entry.id}`}
                  >
                    {st.label}
                  </span>
                </div>
                <time
                  dateTime={entry.timestamp}
                  className="font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-mono)]"
                >
                  {formatTimestamp(entry.timestamp)}
                </time>
              </div>

              <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                {entry.actionText}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--accent-gold-bright)]">
                  {entry.deltaImpact}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-muted)]">
                    сходимость
                  </span>
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--bg-hover)]">
                    <div
                      className="h-full rounded-full bg-[#34d399]"
                      style={{ width: `${entry.lossConvergence}%` }}
                    />
                  </div>
                  <span className="font-[family-name:var(--font-mono-jb)] text-[10px] tabular-nums text-[#34d399]">
                    {entry.lossConvergence}%
                  </span>
                </div>
              </div>

              {pending ? (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    data-testid={`rl-approve-${entry.id}`}
                    onClick={() => approve(entry.id)}
                    className="rounded-md border border-[color-mix(in_srgb,#34d399_45%,transparent)] bg-[color-mix(in_srgb,#34d399_14%,transparent)] px-3 py-1.5 font-[family-name:var(--font-mono-jb)] text-[11px] font-semibold text-[#34d399] transition-colors hover:bg-[color-mix(in_srgb,#34d399_22%,transparent)]"
                  >
                    Согласовано
                  </button>
                  <button
                    type="button"
                    data-testid={`rl-reject-${entry.id}`}
                    onClick={() => reject(entry.id)}
                    className="rounded-md border border-[var(--border-glass)] bg-[var(--bg-hover)] px-3 py-1.5 font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--accent-terracotta)]"
                  >
                    Отклонить
                  </button>
                </div>
              ) : null}
            </motion.article>
          );
        })}
      </GlassCard>
    </section>
  );
}
