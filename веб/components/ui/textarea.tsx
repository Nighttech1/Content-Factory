"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Vernatun Dark Luxury textarea — Century Gothic / CSS tokens.
 * shadcn-compatible API; does not introduce --hu-* globals.
 */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-[var(--border-glass)]",
        "bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] px-3 py-2",
        "font-[family-name:var(--font-ui)] text-sm text-[var(--text-primary)]",
        "placeholder:text-[var(--text-muted)]",
        "shadow-sm transition-[border-color,box-shadow] duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
