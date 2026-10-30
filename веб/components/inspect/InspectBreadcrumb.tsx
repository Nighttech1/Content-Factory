"use client";

import { NeonBadge } from "@/components/ui/NeonBadge";
import { useInspectStore } from "@/lib/inspect-store";

export function InspectBreadcrumb() {
  const jobLabel = useInspectStore((s) => s.jobLabel);
  const pipelineName = useInspectStore((s) => s.pipelineName);
  const status = useInspectStore((s) => s.status);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-elevated)] px-3 py-1.5 font-[family-name:var(--font-mono-jb)] text-[11px] tracking-wide text-[var(--text-muted)]">
          <span>STAGE 04</span>
          <span className="text-[var(--text-mono)]">/</span>
          <span className="font-semibold text-[var(--accent-gold)]">
            HUMAN-IN-THE-LOOP
          </span>
        </div>
        <span className="hidden h-1.5 w-1.5 rounded-full bg-[var(--border-active)] sm:inline-block" />
        <div className="flex min-w-0 items-center gap-1.5 truncate font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--text-muted)]">
          <span>Pipeline:</span>
          <span className="truncate text-[var(--text-primary)]">
            {pipelineName}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <NeonBadge tone="gold">{jobLabel}</NeonBadge>
        <NeonBadge tone={status === "awaiting_signoff" ? "terracotta" : "blue"}>
          {status.replaceAll("_", " ")}
        </NeonBadge>
      </div>
    </div>
  );
}
