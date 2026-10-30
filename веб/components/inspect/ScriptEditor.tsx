"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { useInspectStore } from "@/lib/inspect-store";

const HAS_ARMENIAN = /[\u0530-\u058F]/;
/** Conversational spoken pace for duration estimate. */
const BASE_WPM = 148;

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function densityLabel(wpm: number): string {
  if (wpm < 120) return "Slow deliberate pace";
  if (wpm <= 160) return "Natural conversational pace";
  return "Fast punchy density";
}

export function ScriptEditor() {
  const script = useInspectStore((s) => s.script);
  const setScript = useInspectStore((s) => s.setScript);
  const speechRate = useInspectStore((s) => s.persona.speechRate);

  const stats = useMemo(() => {
    const words = countWords(script);
    const rateMul =
      speechRate === "slow" ? 0.85 : speechRate === "fast" ? 1.2 : 1;
    const wpm = Math.round(BASE_WPM * rateMul);
    const estimatedSec =
      words === 0 ? 0 : Math.max(1, Math.round((words / wpm) * 60));
    return { words, wpm, estimatedSec, density: densityLabel(wpm) };
  }, [script, speechRate]);

  const useHyFont = HAS_ARMENIAN.test(script);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
          Bilingual Voice Script
        </h3>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-blue)]" />
          <span>Markup:</span>
          <span className="font-[family-name:var(--font-mono-jb)] text-[var(--accent-gold)]">
            Culture
          </span>
          <span>/</span>
          <span className="font-[family-name:var(--font-mono-jb)] text-[var(--accent-blue-bright)]">
            Slang
          </span>
          <span>/</span>
          <span className="font-[family-name:var(--font-mono-jb)] text-[var(--accent-terracotta)]">
            CTA
          </span>
        </div>
      </div>

      <div className="flex flex-col rounded-lg bg-[var(--bg-hover)] p-3">
        <label htmlFor="inspect-script-editor" className="sr-only">
          Voice script
        </label>
        <textarea
          id="inspect-script-editor"
          value={script}
          onChange={(e) => setScript(e.target.value)}
          spellCheck={false}
          rows={6}
          className={cn(
            "min-h-[110px] w-full resize-y rounded-md border border-transparent bg-transparent p-2 text-sm leading-relaxed text-[var(--text-primary)]",
            "focus:border-[var(--accent-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]",
            useHyFont && "font-[family-name:var(--font-hy)]",
          )}
        />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded bg-[color-mix(in_srgb,var(--bg-elevated)_60%,transparent)] px-2 py-1.5">
          <div className="flex flex-wrap items-center gap-1.5 font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--text-primary)]">
              {stats.words} words
            </span>
            <span aria-hidden>·</span>
            <span className="text-[var(--accent-blue-bright)]">
              {stats.estimatedSec} sec spoken
            </span>
            <span aria-hidden>·</span>
            <span className="text-[var(--accent-gold)]">{stats.wpm} wpm</span>
          </div>
          <span className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--accent-gold)]">
            {stats.density}
          </span>
        </div>
      </div>
    </div>
  );
}
