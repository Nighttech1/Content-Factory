"use client";

import type { ReactNode } from "react";
import { useInspectStore } from "@/lib/inspect-store";
import { cn } from "@/lib/cn";

type KaraokeCaptionsProps = {
  className?: string;
};

export function KaraokeCaptions({ className }: KaraokeCaptionsProps) {
  const currentTimeSec = useInspectStore((s) => s.reels.currentTimeSec);
  const captions = useInspectStore((s) => s.reels.captions);

  const active =
    captions.find(
      (line) =>
        currentTimeSec >= line.startSec && currentTimeSec < line.endSec,
    ) ?? captions[captions.length - 1];

  if (!active) return null;

  const highlight = active.highlightHy;
  let hyContent: ReactNode = active.textHy;

  if (highlight && active.textHy.includes(highlight)) {
    const parts = active.textHy.split(highlight);
    hyContent = (
      <>
        {parts[0]}
        <span className="underline decoration-[var(--accent-gold)] decoration-2 underline-offset-4 text-[var(--accent-terracotta)]">
          {highlight}
        </span>
        {parts.slice(1).join(highlight)}
      </>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 px-3 text-center",
        className,
      )}
    >
      <div className="max-w-[280px] rounded-lg border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-canvas)_85%,transparent)] px-3 py-2 backdrop-blur-xl">
        <p
          lang="hy"
          className="font-[family-name:var(--font-hy)] text-base font-bold leading-tight tracking-tight text-[var(--text-primary)]"
        >
          {hyContent}
        </p>
        <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">
          {active.textRu}
        </p>
      </div>
      <div className="mt-0.5 flex items-center gap-1.5">
        <span className="inline-block h-1 w-8 animate-pulse rounded-full bg-[var(--accent-terracotta)]" />
        <span className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-widest text-[var(--accent-gold)]">
          Word Sync ±4ms
        </span>
      </div>
    </div>
  );
}
