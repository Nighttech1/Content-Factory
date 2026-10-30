"use client";

/**
 * C-79 — carousel-style platform picker (same chrome language as month nav).
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import type { PublishPlatform } from "@/lib/settings/platforms";
import { PLATFORM_KIND_LABELS } from "@/lib/settings/platforms";

type PlatformCarouselPickerProps = {
  platforms: PublishPlatform[];
  value?: string;
  onChange: (platformId: string) => void;
  testId?: string;
};

export function PlatformCarouselPicker({
  platforms,
  value,
  onChange,
  testId = "platform-carousel-picker",
}: PlatformCarouselPickerProps) {
  const enabled = useMemo(
    () => platforms.filter((p) => p.enabled),
    [platforms],
  );
  const index = Math.max(
    0,
    enabled.findIndex((p) => p.id === value),
  );
  const [i, setI] = useState(index >= 0 ? index : 0);
  const current = enabled[Math.min(i, Math.max(0, enabled.length - 1))];

  if (enabled.length === 0) {
    return (
      <p
        data-testid={`${testId}-empty`}
        className="text-xs text-[var(--text-muted)]"
      >
        Нет подключённых площадок — добавьте в Настройках.
      </p>
    );
  }

  function step(delta: number) {
    const next = (i + delta + enabled.length) % enabled.length;
    setI(next);
    const p = enabled[next];
    if (p) onChange(p.id);
  }

  return (
    <div
      data-testid={testId}
      className="flex items-center gap-1.5"
      role="group"
      aria-label="Площадка публикации"
    >
      <button
        type="button"
        aria-label="Предыдущая площадка"
        data-testid={`${testId}-prev`}
        onClick={() => step(-1)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        data-testid={`${testId}-current`}
        onClick={() => current && onChange(current.id)}
        className={cn(
          "min-w-[9rem] flex-1 rounded-md border border-[var(--border-glass)] px-2.5 py-1.5 text-center",
          "bg-[var(--bg-card)] text-sm font-medium text-[var(--text-primary)]",
        )}
      >
        <span className="block truncate">
          {current?.label ?? "Площадка"}
        </span>
        <span className="block font-[family-name:var(--font-mono-jb)] text-[9px] uppercase tracking-wider text-[var(--text-mono)]">
          {current ? PLATFORM_KIND_LABELS[current.kind] : ""}
        </span>
      </button>
      <button
        type="button"
        aria-label="Следующая площадка"
        data-testid={`${testId}-next`}
        onClick={() => step(1)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
