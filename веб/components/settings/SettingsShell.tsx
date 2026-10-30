"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_REELS_PAGE_SIZE,
  MAX_REELS_PAGE_SIZE,
  MIN_REELS_PAGE_SIZE,
  clampReelsPageSize,
  readReelsPageSizeFromStorage,
  writeReelsPageSizeToStorage,
} from "@/lib/settings/reels-display";
import { BrandPanel } from "@/components/settings/BrandPanel";
import { DesignPreviewPanel } from "@/components/settings/DesignPreviewPanel";
import { DesignLibraryCarousel } from "@/components/settings/DesignLibraryCarousel";
import { LandscapesPanel } from "@/components/settings/LandscapesPanel";
import { PlatformsPanel } from "@/components/settings/PlatformsPanel";
import { PublicistSettingsPanel } from "@/components/settings/PublicistSettingsPanel";
import { ScheduleAutofillPanel } from "@/components/settings/ScheduleAutofillPanel";
import { SettingsQuickNav } from "@/components/settings/SettingsQuickNav";
import type { DesignLibrarySlot } from "@/lib/settings/design-library";

/**
 * S52 + S55/S56 — Settings: Design → Brand → Персонажи (API landscapes) → …
 * shell_freeze: no AppShell / left nav edits here.
 */
export function SettingsShell() {
  const [reelsPageSize, setReelsPageSize] = useState(DEFAULT_REELS_PAGE_SIZE);
  const [hydrated, setHydrated] = useState(false);
  const [designMd, setDesignMd] = useState("");
  const [designFileName, setDesignFileName] = useState("DESIGN.md");
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setReelsPageSize(readReelsPageSizeFromStorage());
    setHydrated(true);
  }, []);

  const onActiveChange = useCallback((slot: DesignLibrarySlot | null) => {
    setDesignMd(slot?.markdown ?? "");
    setDesignFileName(slot?.name ?? "DESIGN.md");
  }, []);

  const onRequestPreviewOpen = useCallback(() => {
    setPreviewOpen(true);
  }, []);

  function onReelsPageSizeChange(raw: string) {
    const next = clampReelsPageSize(raw);
    setReelsPageSize(next);
    writeReelsPageSizeToStorage(next);
  }

  return (
    <div
      className="relative -mx-4 flex w-full max-w-none flex-col gap-6 px-1 pb-8 md:-mx-6 md:px-2 xl:pr-8"
      data-testid="settings-shell"
      data-pad="s50-wide"
    >
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
          Настройки
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">
          Дизайн, бренд, персонажи, площадки, расписание и рилсы. Разведка и модели
          агентов — в «Команда выпуска».
        </p>
      </header>

      <SettingsQuickNav />

      <section
        id="settings-design"
        data-testid="settings-design-panel"
        aria-labelledby="settings-design-heading"
        className="scroll-mt-24 flex flex-col gap-3 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] px-2 py-4 sm:px-3"
      >
        {/* Heading + toolbar live inside DesignLibraryCarousel (S52 LEFT) */}
        <DesignLibraryCarousel
          onActiveChange={onActiveChange}
          onRequestPreviewOpen={onRequestPreviewOpen}
        />

        {/* S52 — tokens-only caption (no layout markup editor) */}
        <p
          className="text-xs text-[var(--text-muted)]"
          data-testid="settings-design-colors-only-caption"
        >
          Только токены (цвета · типографика · текст-блоки · мелкие элементы) —
          разметку придумает Дизайнер
        </p>

        <DesignPreviewPanel
          markdown={designMd}
          fileName={designFileName}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          showToggle={false}
        />
      </section>

      <BrandPanel />

      <LandscapesPanel />

      <PlatformsPanel />

      <ScheduleAutofillPanel />

      <PublicistSettingsPanel />

      <section
        id="settings-reels"
        data-testid="settings-reels-panel"
        aria-labelledby="settings-reels-heading"
        className="scroll-mt-24 flex flex-col gap-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] px-2 py-4 sm:px-3"
      >
        <div className="flex flex-col gap-1">
          <h2
            id="settings-reels-heading"
            className="text-lg font-semibold tracking-tight text-[var(--text-primary)]"
          >
            Рилсы
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Сколько карточек в dual-feed (Наши и Конкуренты).
          </p>
        </div>

        {!hydrated ? (
          <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
            Загрузка…
          </p>
        ) : (
          <div className="flex flex-col gap-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Отображение рилсов (количество на странице)
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                От {MIN_REELS_PAGE_SIZE} до {MAX_REELS_PAGE_SIZE}. По умолчанию{" "}
                {DEFAULT_REELS_PAGE_SIZE}.
              </p>
            </div>
            <label className="flex shrink-0 flex-col gap-1 sm:items-end">
              <span className="font-[family-name:var(--font-mono-jb)] text-[9px] uppercase tracking-wider text-[var(--text-mono)]">
                На странице
              </span>
              <input
                type="number"
                data-testid="settings-reels-page-size"
                min={MIN_REELS_PAGE_SIZE}
                max={MAX_REELS_PAGE_SIZE}
                step={1}
                value={reelsPageSize}
                onChange={(e) => onReelsPageSizeChange(e.target.value)}
                className="w-[6.5rem] rounded-md border border-[var(--border-glass)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue-bright)]"
                aria-label="Отображение рилсов (количество на странице)"
              />
            </label>
          </div>
        )}
      </section>
    </div>
  );
}
