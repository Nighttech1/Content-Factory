"use client";

import {
  ArrowRight,
  BarChart2,
  Palette,
  PenLine,
  Send,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { AgentRoleKind } from "@/lib/mesh-roles";

export type HandoffRoundButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  /** Accessible name (e.g. «Передать сценаристу»). */
  ariaLabel: string;
  testId?: string;
  /** Next-agent avatar from release team / mesh. */
  nextPackId?: string;
  nextLabel: string;
  nextRoleKind?: AgentRoleKind;
  className?: string;
};

function resolveNextIcon(
  packId: string | undefined,
  label: string,
  roleKind?: AgentRoleKind,
): LucideIcon {
  if (roleKind === "analyst" || packId === "analyst") return BarChart2;
  const key = `${packId ?? ""} ${label}`.toLowerCase();
  if (key.includes("script") || key.includes("сценарист") || key.includes("copy")) {
    return PenLine;
  }
  if (key.includes("design") || key.includes("дизайн")) return Palette;
  if (key.includes("publish") || key.includes("публиц")) return Send;
  if (key.includes("analyst") || key.includes("разбор")) return BarChart2;
  return Sparkles;
}

/**
 * C-razbor-create-modal-s47 — mic-weight round handoff:
 * right arrow + next-agent logo (not text-only «передать»).
 */
export function HandoffRoundButton({
  onClick,
  disabled = false,
  ariaLabel,
  testId = "handoff-round-button",
  nextPackId,
  nextLabel,
  nextRoleKind,
  className,
}: HandoffRoundButtonProps) {
  const NextIcon = resolveNextIcon(nextPackId, nextLabel, nextRoleKind);

  return (
    <button
      type="button"
      data-testid={testId}
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        "border border-[color-mix(in_srgb,var(--accent-gold)_40%,transparent)]",
        "bg-[color-mix(in_srgb,var(--accent-gold)_16%,var(--bg-elevated))]",
        "text-[var(--accent-gold)]",
        "transition-[background-color,border-color,transform,opacity] duration-150",
        "hover:enabled:bg-[color-mix(in_srgb,var(--accent-gold)_26%,var(--bg-elevated))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]",
        "active:enabled:scale-[0.96]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    >
      <span className="relative flex items-center justify-center" aria-hidden>
        <NextIcon className="h-4 w-4 stroke-[2]" />
        <span
          className={cn(
            "absolute -right-2.5 -top-2.5 flex h-4 w-4 items-center justify-center rounded-full",
            "bg-[var(--bg-elevated)] text-[var(--accent-gold)]",
            "ring-1 ring-[color-mix(in_srgb,var(--accent-gold)_45%,transparent)]",
          )}
        >
          <ArrowRight className="h-2.5 w-2.5 stroke-[2.5]" />
        </span>
      </span>
    </button>
  );
}
