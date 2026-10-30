"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TOPIC_PRESETS } from "@/components/studio/modules";
import { cn } from "@/lib/cn";
import { useStudioStore } from "@/lib/studio-store";

type ModuleIdeaBarProps = {
  /**
   * Called on Apply / Enter / preset / clear.
   * Non-empty → refresh competitors by topic; empty → niche-wide (C-40).
   */
  onTopicCommit: (topic: string) => void;
  /** Show clear control when a topic filter is active. */
  canClearTopic?: boolean;
};

export function ModuleIdeaBar({
  onTopicCommit,
  canClearTopic = false,
}: ModuleIdeaBarProps) {
  const reduceMotion = useReducedMotion();
  const topic = useStudioStore((s) => s.topic);
  const setTopic = useStudioStore((s) => s.setTopic);
  const applyPreset = useStudioStore((s) => s.applyPreset);
  const selectedModuleId = useStudioStore((s) => s.selectedModuleId);
  const generateStatus = useStudioStore((s) => s.generateStatus);
  const startGenerate = useStudioStore((s) => s.startGenerate);

  const canGenerate =
    Boolean(selectedModuleId) && generateStatus !== "running";
  const pulseBorder = canGenerate && !reduceMotion;
  const topicTrimmed = topic.trim();
  const showClear = canClearTopic || Boolean(topicTrimmed);

  function commitTopic(raw: string) {
    onTopicCommit(raw.trim());
  }

  function clearTopic() {
    setTopic("");
    onTopicCommit("");
  }

  function handleGenerate() {
    const next = topic.trim();
    if (next) onTopicCommit(next);
    startGenerate();
  }

  return (
    <section
      data-testid="module-idea-bar"
      className="relative overflow-hidden rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
      aria-labelledby="module-idea-heading"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[color-mix(in_srgb,var(--accent-terracotta)_8%,transparent)] blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="module-idea-heading"
            className="font-[family-name:var(--font-mono-jb)] text-[11px] uppercase tracking-[0.16em] text-[var(--accent-terracotta)]"
          >
            Idea / Topic
          </h2>
          {generateStatus === "running" ? (
            <span className="text-xs text-[var(--text-muted)]">
              Генерация через module API…
            </span>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">
              Конкуренты подбираются по теме автоматически · Enter —
              обновить · Generate — пайплайн
            </span>
          )}
        </div>

        <div className="flex w-full flex-col gap-4">
          <label className="sr-only" htmlFor="module-idea-input">
            Тема генерации
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <input
              id="module-idea-input"
              data-testid="module-idea-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (topicTrimmed || canClearTopic) commitTopic(topic);
                }
              }}
              placeholder="Введите тему, тезис или тренд…"
              className={cn(
                "w-full flex-1 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-canvas)] px-4 py-3.5",
                "text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/60",
                "outline-none transition-[border-color,box-shadow] duration-200",
                "focus:border-[color-mix(in_srgb,var(--accent-blue-bright)_45%,var(--border-glass))]",
                "focus:shadow-[0_0_0_1px_rgba(59,130,246,0.25),0_0_20px_rgba(37,99,235,0.12)]",
              )}
            />
            <div className="flex shrink-0 gap-2">
              {showClear ? (
                <button
                  type="button"
                  data-testid="module-idea-clear"
                  onClick={clearTopic}
                  className={cn(
                    "rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-4 py-3",
                    "text-sm font-medium text-[var(--text-muted)]",
                    "transition-colors hover:border-[var(--border-active)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                  )}
                >
                  Сбросить
                </button>
              ) : null}
              <button
                type="button"
                data-testid="module-idea-commit"
                onClick={() => commitTopic(topic)}
                disabled={!topicTrimmed}
                className={cn(
                  "rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-4 py-3",
                  "text-sm font-medium text-[var(--text-primary)]",
                  "transition-colors hover:border-[var(--border-active)] hover:bg-[var(--bg-hover)]",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                Применить
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {TOPIC_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  data-testid="topic-preset"
                  data-preset-id={preset.id}
                  onClick={() => {
                    applyPreset(preset.id);
                    onTopicCommit(preset.topic);
                  }}
                  className={cn(
                    "rounded-md border border-[var(--border-glass)] bg-[var(--bg-card)] px-2.5 py-1.5",
                    "font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--text-muted)]",
                    "transition-colors duration-150 hover:border-[var(--border-active)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <motion.button
              type="button"
              data-testid="generate-draft"
              disabled={!canGenerate}
              onClick={handleGenerate}
              className={cn(
                "relative shrink-0 rounded-lg px-[1px] py-[1px]",
                "bg-[linear-gradient(120deg,var(--accent-blue-bright),var(--accent-gold),var(--accent-terracotta),var(--accent-blue-bright))]",
                "shadow-[0_0_16px_rgba(37,99,235,0.18)]",
                "disabled:cursor-not-allowed disabled:opacity-45",
              )}
              style={{ backgroundSize: "220% 220%" }}
              animate={
                pulseBorder
                  ? {
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      boxShadow: [
                        "0 0 14px rgba(37,99,235,0.16)",
                        "0 0 22px rgba(212,163,89,0.28)",
                        "0 0 14px rgba(37,99,235,0.16)",
                      ],
                    }
                  : {
                      backgroundPosition: "0% 50%",
                      boxShadow: "0 0 16px rgba(37,99,235,0.18)",
                    }
              }
              transition={
                pulseBorder
                  ? {
                      backgroundPosition: {
                        duration: 2.8,
                        repeat: Infinity,
                        ease: "linear",
                      },
                      boxShadow: {
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }
                  : { duration: 0.2 }
              }
              whileHover={
                canGenerate && !reduceMotion
                  ? {
                      boxShadow:
                        "0 0 0 1px rgba(59,130,246,0.35), 0 0 24px rgba(212,163,89,0.28)",
                    }
                  : undefined
              }
            >
              <span
                className={cn(
                  "block rounded-[calc(0.5rem-1px)] px-5 py-2.5 text-sm font-semibold",
                  "bg-[color-mix(in_srgb,var(--accent-blue)_18%,var(--bg-elevated))] text-[var(--text-primary)]",
                )}
              >
                {generateStatus === "running" ? "Генерация…" : "Сгенерировать черновик"}
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
