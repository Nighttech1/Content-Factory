"use client";

/**
 * C-59 publisher datetime. 21st MCP unavailable → Dark Luxury glass date+time.
 */

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };
const INSTANT = { duration: 0 };

function toDateValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toTimeValue(iso?: string): string {
  if (!iso) return "12:00";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "12:00";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function combineLocal(dateStr: string, timeStr: string): string | null {
  if (!dateStr) return null;
  const [hRaw, mRaw] = (timeStr || "12:00").split(":");
  const [y, mo, d] = dateStr.split("-").map((n) => Number.parseInt(n, 10));
  if (!y || !mo || !d) return null;
  const h = Number.parseInt(hRaw ?? "12", 10);
  const m = Number.parseInt(mRaw ?? "0", 10);
  const dt = new Date(y, mo - 1, d, Number.isFinite(h) ? h : 12, Number.isFinite(m) ? m : 0, 0, 0);
  return dt.toISOString();
}

type LuxuryDatetimePickerProps = {
  valueIso?: string;
  onChangeIso: (iso: string) => void;
  className?: string;
};

export function LuxuryDatetimePicker({
  valueIso,
  onChangeIso,
  className,
}: LuxuryDatetimePickerProps) {
  const reduceMotion = useReducedMotion();
  const dateValue = toDateValue(valueIso);
  const timeValue = toTimeValue(valueIso);

  function commit(nextDate: string, nextTime: string) {
    const iso = combineLocal(nextDate, nextTime);
    if (iso) onChangeIso(iso);
  }

  return (
    <motion.div
      data-testid="razbor-publisher-datetime"
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-[var(--border-glass)]",
        "bg-[rgba(255,255,255,0.03)] p-3 backdrop-blur-md",
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduceMotion ? INSTANT : SPRING}
    >
      <label className="flex flex-col gap-1.5">
        <span className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
          День
        </span>
        <input
          type="date"
          data-testid="razbor-publisher-date"
          value={dateValue}
          onChange={(e) => commit(e.target.value, timeValue)}
          className={cn(
            "rounded-lg border border-[var(--border-glass)] bg-[var(--bg-canvas)]",
            "px-3 py-2 text-sm text-[var(--text-primary)] outline-none",
            "focus:border-[color-mix(in_srgb,var(--accent-gold)_40%,transparent)]",
            "[color-scheme:dark]",
          )}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
          Время
        </span>
        <input
          type="time"
          data-testid="razbor-publisher-time"
          value={timeValue}
          onChange={(e) => commit(dateValue || toDateValue(new Date().toISOString()), e.target.value)}
          className={cn(
            "rounded-lg border border-[var(--border-glass)] bg-[var(--bg-canvas)]",
            "px-3 py-2 text-sm text-[var(--text-primary)] outline-none",
            "focus:border-[color-mix(in_srgb,var(--accent-gold)_40%,transparent)]",
            "[color-scheme:dark]",
          )}
        />
      </label>
    </motion.div>
  );
}
