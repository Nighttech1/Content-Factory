"use client";

/**
 * S52 — Quick Theme Tuner (colors only).
 * Live `--cf-design-*` swatches + BrandbookBoard token preview (no COVER/BODY/CTA).
 * 21st id=5402 palette hover + framer-motion modal (DesignPreviewPanel parity).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandbookBoard } from "@/components/settings/BrandbookBoard";
import { cn } from "@/lib/cn";
import {
  applySlotCssVarOverrides,
  designPresetToCssVars,
  resolveSlotPresetFile,
  syncActiveDesignToServer,
  type DesignLibrarySlot,
} from "@/lib/settings/design-library";
import { CF_DESIGN_CSS_VARS } from "@/types/design";

type TunerField = {
  key: keyof typeof CF_DESIGN_CSS_VARS;
  cssVar: string;
  label: string;
  testId: string;
};

const FIELDS: TunerField[] = [
  {
    key: "accent",
    cssVar: CF_DESIGN_CSS_VARS.accent,
    label: "Accent",
    testId: "tuner-swatch-accent",
  },
  {
    key: "bg",
    cssVar: CF_DESIGN_CSS_VARS.bg,
    label: "Background",
    testId: "tuner-swatch-bg",
  },
  {
    key: "surface",
    cssVar: CF_DESIGN_CSS_VARS.surface,
    label: "Surface",
    testId: "tuner-swatch-surface",
  },
  {
    key: "text",
    cssVar: CF_DESIGN_CSS_VARS.text,
    label: "Text",
    testId: "tuner-swatch-text",
  },
];

export type QuickThemeTunerProps = {
  open: boolean;
  slot: DesignLibrarySlot | null;
  onOpenChange: (open: boolean) => void;
  /** After persist — parent refreshes library state. */
  onSlotPatched: (slot: DesignLibrarySlot) => void;
};

function hexForColorInput(raw: string): string {
  const s = raw.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s;
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    const r = s[1]!;
    const g = s[2]!;
    const b = s[3]!;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#2563EB";
}

export function QuickThemeTuner({
  open,
  slot,
  onOpenChange,
  onSlotPatched,
}: QuickThemeTunerProps) {
  const reduceMotion = useReducedMotion();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !slot) return;
    const preset = resolveSlotPresetFile(slot);
    if (!preset) {
      setDraft({});
      return;
    }
    const vars = designPresetToCssVars(preset);
    const next: Record<string, string> = {};
    for (const f of FIELDS) {
      next[f.cssVar] = vars[f.cssVar] ?? "";
    }
    setDraft(next);
  }, [open, slot]);

  const liveSlot = useMemo((): DesignLibrarySlot | null => {
    if (!slot) return null;
    if (Object.keys(draft).length === 0) return slot;
    return {
      ...slot,
      cssVarOverrides: {
        ...(slot.cssVarOverrides ?? {}),
        ...(slot.presetFile?.cssVarOverrides ?? {}),
        ...draft,
      },
      colors: {
        ...(slot.colors ??
          slot.presetFile?.colors ?? {
            bg: "#111317",
            surface: "#1e2023",
            text: "#e2e2e6",
            muted: "#a48c81",
            accent: "#C25E28",
          }),
        bg: draft[CF_DESIGN_CSS_VARS.bg] || slot.colors?.bg || "#111317",
        surface:
          draft[CF_DESIGN_CSS_VARS.surface] ||
          slot.colors?.surface ||
          "#1e2023",
        text: draft[CF_DESIGN_CSS_VARS.text] || slot.colors?.text || "#e2e2e6",
        accent:
          draft[CF_DESIGN_CSS_VARS.accent] ||
          slot.colors?.accent ||
          "#C25E28",
      },
      presetFile: slot.presetFile
        ? {
            ...slot.presetFile,
            cssVarOverrides: {
              ...(slot.presetFile.cssVarOverrides ?? {}),
              ...draft,
            },
            colors: {
              ...slot.presetFile.colors,
              bg:
                draft[CF_DESIGN_CSS_VARS.bg] || slot.presetFile.colors.bg,
              surface:
                draft[CF_DESIGN_CSS_VARS.surface] ||
                slot.presetFile.colors.surface,
              text:
                draft[CF_DESIGN_CSS_VARS.text] ||
                slot.presetFile.colors.text,
              accent:
                draft[CF_DESIGN_CSS_VARS.accent] ||
                slot.presetFile.colors.accent,
            },
          }
        : slot.presetFile,
    };
  }, [slot, draft]);

  const onChangeField = useCallback((cssVar: string, value: string) => {
    setDraft((prev) => ({ ...prev, [cssVar]: value }));
  }, []);

  const onPersist = useCallback(async () => {
    if (!slot) return;
    setBusy(true);
    try {
      const patched = applySlotCssVarOverrides(slot.id, draft);
      if (!patched) return;
      onSlotPatched(patched);
      void syncActiveDesignToServer({
        markdown: patched.markdown,
        name: patched.name,
        presetFile: patched.presetFile ?? null,
      });
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }, [slot, draft, onSlotPatched, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && slot ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          data-testid="quick-theme-tuner"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          <button
            type="button"
            aria-label="Закрыть тюнер"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            data-testid="quick-theme-tuner-backdrop"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Quick Theme Tuner"
            className="relative z-[1] flex w-full max-w-lg flex-col gap-4 rounded-xl border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_96%,transparent)] p-4 shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", damping: 25, stiffness: 300 }
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Quick Theme Tuner
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {slot.name} · live CSS vars
                </p>
                <p
                  className="mt-1 text-[10px] text-[var(--text-muted)]"
                  data-testid="tuner-colors-only-caption"
                >
                  Только цвета — разметку придумает Дизайнер
                </p>
              </div>
              <button
                type="button"
                data-testid="quick-theme-tuner-close"
                aria-label="Закрыть"
                onClick={() => onOpenChange(false)}
                className="rounded-md border border-[var(--border-glass)] p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {liveSlot ? (
              <div
                className="mx-auto aspect-[3/5] max-h-56 w-full max-w-[12rem] overflow-hidden rounded-xl"
                data-testid="tuner-brandbook-preview"
              >
                <BrandbookBoard
                  slot={liveSlot}
                  compact
                  className="h-full w-full rounded-xl border-0"
                />
              </div>
            ) : null}

            <div
              className="flex overflow-hidden rounded-xl border border-[var(--border-glass)]"
              data-testid="tuner-swatch-row"
            >
              {FIELDS.map((f) => {
                const value = draft[f.cssVar] || "#888888";
                return (
                  <label
                    key={f.cssVar}
                    className={cn(
                      "group relative flex h-16 flex-1 cursor-pointer flex-col items-center justify-end pb-1.5 transition-[flex] duration-200 ease-out hover:flex-[1.35]",
                    )}
                    style={{ backgroundColor: value }}
                    data-testid={f.testId}
                  >
                    <span className="mb-0.5 rounded bg-black/45 px-1.5 py-0.5 text-[9px] font-semibold text-white opacity-90">
                      {f.label}
                    </span>
                    <input
                      type="color"
                      value={hexForColorInput(value)}
                      aria-label={f.label}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={(e) => onChangeField(f.cssVar, e.target.value)}
                    />
                  </label>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FIELDS.map((f) => (
                <label
                  key={`${f.cssVar}-hex`}
                  className="flex flex-col gap-1 text-[10px] text-[var(--text-muted)]"
                >
                  {f.label}
                  <input
                    type="text"
                    value={draft[f.cssVar] ?? ""}
                    data-testid={`${f.testId}-hex`}
                    onChange={(e) => onChangeField(f.cssVar, e.target.value)}
                    className="rounded-md border border-[var(--border-glass)] bg-[var(--bg-card)] px-2 py-1 font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--text-primary)]"
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button
                type="button"
                variant="gold"
                size="sm"
                disabled={busy}
                data-testid="quick-theme-tuner-save"
                onClick={() => void onPersist()}
              >
                Сохранить
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Inline clickable swatches under an Embla slot (surface / accent / text). */
export function DesignSlotSwatches({
  slot,
  onOpenTuner,
}: {
  slot: DesignLibrarySlot;
  onOpenTuner: () => void;
}) {
  const preset = resolveSlotPresetFile(slot);
  const vars = preset ? designPresetToCssVars(preset) : null;
  const chips = [
    {
      label: "surface",
      color: vars?.[CF_DESIGN_CSS_VARS.surface] ?? "#1e2023",
      testId: "slot-swatch-surface",
    },
    {
      label: "accent",
      color: vars?.[CF_DESIGN_CSS_VARS.accent] ?? "#C25E28",
      testId: "slot-swatch-accent",
    },
    {
      label: "text",
      color: vars?.[CF_DESIGN_CSS_VARS.text] ?? "#e2e2e6",
      testId: "slot-swatch-text",
    },
  ];

  return (
    <div
      className="mt-2 flex items-center gap-1.5"
      data-testid="design-slot-swatches"
    >
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          title={`${c.label}: ${c.color}`}
          aria-label={`Изменить ${c.label}`}
          data-testid={c.testId}
          onClick={(e) => {
            e.stopPropagation();
            onOpenTuner();
          }}
          className="h-5 w-5 rounded-full border border-white/20 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.35)] transition hover:scale-110"
          style={{ backgroundColor: c.color }}
        />
      ))}
      <button
        type="button"
        data-testid="design-slot-open-tuner"
        onClick={(e) => {
          e.stopPropagation();
          onOpenTuner();
        }}
        className="ml-1 text-[10px] font-semibold text-[var(--accent-gold)] hover:underline"
      >
        Tuner
      </button>
    </div>
  );
}
