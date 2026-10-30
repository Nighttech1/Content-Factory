"use client";

import { cn } from "@/lib/cn";

type SidebarResizeHandleProps = {
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerCancel?: (event: React.PointerEvent<HTMLButtonElement>) => void;
  dragging?: boolean;
};

/**
 * C-60 — luxury drag rail on the aside’s right edge.
 * 21st MCP unavailable; Dark Luxury fallback (gold/cobalt, no purple).
 */
export function SidebarResizeHandle({
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  dragging = false,
}: SidebarResizeHandleProps) {
  return (
    <button
      type="button"
      data-testid="sidebar-resize-handle"
      aria-label="Изменить ширину боковой панели"
      className={cn(
        "group absolute top-0 right-0 z-50 h-full w-3 -translate-x-1/2 cursor-col-resize touch-none",
        "border-0 bg-transparent p-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]/40",
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel ?? onPointerUp}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 left-1/2 h-16 w-px -translate-x-1/2 -translate-y-1/2 rounded-full",
          "bg-[color-mix(in_srgb,var(--accent-gold)_45%,transparent)]",
          "transition-[height,background-color,box-shadow] duration-200",
          dragging
            ? "h-24 bg-[var(--accent-gold)] shadow-[0_0_12px_color-mix(in_srgb,var(--accent-gold)_55%,transparent)]"
            : "group-hover:h-20",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2",
          "bg-[color-mix(in_srgb,var(--border-glass)_80%,transparent)]",
          dragging &&
            "bg-[color-mix(in_srgb,var(--accent-blue)_35%,var(--accent-gold))]",
        )}
      />
    </button>
  );
}
