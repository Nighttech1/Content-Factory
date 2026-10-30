"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AgentChatComposer } from "@/components/studio/workspace/AgentChatComposer";
import { cn } from "@/lib/cn";
import { useStudioStore, type AgentStepState } from "@/lib/studio-store";

const STAGGER = 0.08;
const PANEL_SPRING = { type: "spring" as const, damping: 28, stiffness: 320 };
const STEP_SPRING = { type: "spring" as const, damping: 28, stiffness: 280 };
const PANEL_INSTANT = { duration: 0 };

function stepTone(state: AgentStepState): string {
  if (state === "active") return "text-[var(--accent-blue-bright)]";
  if (state === "done") return "text-[var(--accent-gold)]";
  return "text-[var(--text-muted)]";
}

function stepDot(state: AgentStepState): string {
  if (state === "active") return "bg-[var(--accent-blue-bright)] shadow-[0_0_10px_rgba(59,130,246,0.55)]";
  if (state === "done") return "bg-[var(--accent-gold)]";
  return "bg-[var(--text-mono)]";
}

export function GenerationDrawer() {
  const reduceMotion = useReducedMotion();
  const drawerOpen = useStudioStore((s) => s.drawerOpen);
  const closeDrawer = useStudioStore((s) => s.closeDrawer);
  const agentSteps = useStudioStore((s) => s.agentSteps);
  const progress = useStudioStore((s) => s.progress);
  const generateStatus = useStudioStore((s) => s.generateStatus);
  const generateError = useStudioStore((s) => s.generateError);
  const lastDraftId = useStudioStore((s) => s.lastDraftId);
  const lastAssets = useStudioStore((s) => s.lastAssets);
  const lastRenderMock = useStudioStore((s) => s.lastRenderMock);
  const drawerNotes = useStudioStore((s) => s.drawerNotes);
  const appendDrawerNote = useStudioStore((s) => s.appendDrawerNote);

  const panelTransition = reduceMotion ? PANEL_INSTANT : PANEL_SPRING;
  const progressPulse = !reduceMotion && progress > 0 && progress < 100;
  const assetCount = lastAssets?.length ?? 0;

  const listVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : STAGGER,
      },
    },
  };

  const stepVariants = {
    hidden: reduceMotion
      ? { opacity: 1, y: 0, scale: 1 }
      : { opacity: 0, y: 8, scale: 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: reduceMotion ? PANEL_INSTANT : STEP_SPRING,
    },
  };

  return (
    <>
      <motion.button
        type="button"
        aria-label="Закрыть панель генерации"
        tabIndex={drawerOpen ? 0 : -1}
        onClick={closeDrawer}
        className={cn(
          "fixed inset-0 z-40 bg-black/50",
          drawerOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        initial={false}
        animate={{ opacity: drawerOpen ? 1 : 0 }}
        transition={
          reduceMotion
            ? PANEL_INSTANT
            : { duration: drawerOpen ? 0.26 : 0.2, ease: "easeOut" }
        }
      />

      <motion.aside
        data-testid="generation-drawer"
        aria-hidden={!drawerOpen}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col",
          "border-l border-[var(--border-glass)] bg-[var(--bg-elevated)]",
          "shadow-[-12px_0_40px_rgba(0,0,0,0.45)]",
        )}
        initial={false}
        animate={{ x: drawerOpen ? 0 : "100%" }}
        transition={panelTransition}
      >
        <header className="flex items-center justify-between gap-3 border-b border-[var(--border-glass)] px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <p className="font-[family-name:var(--font-mono-jb)] text-[11px] uppercase tracking-[0.14em] text-[var(--accent-blue-bright)]">
              Журнал генерации
            </p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Конвейер агентов
            </h2>
          </div>
          <button
            type="button"
            data-testid="generation-drawer-close"
            onClick={closeDrawer}
            className="rounded-lg border border-[var(--border-glass)] px-3 py-1.5 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          >
            Закрыть
          </button>
        </header>

        <div className="flex flex-col gap-3 border-b border-[var(--border-glass)] px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">Прогресс</span>
            <span
              data-testid="generation-progress-value"
              className="font-[family-name:var(--font-mono-jb)] text-xs text-[var(--accent-gold)]"
            >
              {progress}%
            </span>
          </div>
          <div
            data-testid="generation-progress"
            className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-canvas)]"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="h-full origin-left rounded-full bg-[linear-gradient(90deg,var(--accent-blue),var(--accent-gold))]"
              initial={false}
              animate={{
                scaleX: Math.max(progress, 0) / 100,
                opacity: progressPulse ? [0.72, 1, 0.72] : 1,
              }}
              transition={{
                scaleX: reduceMotion
                  ? PANEL_INSTANT
                  : { type: "spring", damping: 28, stiffness: 260 },
                opacity: progressPulse
                  ? { duration: 1.35, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.2 },
              }}
            />
          </div>
        </div>

        <motion.ul
          className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-5"
          variants={listVariants}
          initial="hidden"
          animate={drawerOpen ? "show" : "hidden"}
        >
          {agentSteps.map((step) => (
            <motion.li
              key={step.id}
              data-testid="agent-step"
              data-step-id={step.id}
              data-step-state={step.state}
              variants={stepVariants}
              className={cn(
                "rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] p-4",
                step.state === "active" &&
                  "border-[color-mix(in_srgb,var(--accent-blue-bright)_40%,var(--border-glass))] shadow-[0_0_18px_rgba(37,99,235,0.15)]",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    stepDot(step.state),
                  )}
                  aria-hidden
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className={cn("text-sm font-semibold", stepTone(step.state))}>
                    {step.label}
                  </span>
                  <span className="text-sm text-[var(--text-muted)]">
                    {step.state === "pending"
                      ? "Ожидание..."
                      : step.state === "done" && step.id !== "done"
                        ? "Готово"
                        : step.statusText}
                  </span>
                  {drawerNotes
                    .filter((n) => n.stepId === step.id)
                    .map((n) => (
                      <span
                        key={n.id}
                        data-testid="generation-drawer-note"
                        className="mt-1 text-xs text-[var(--text-primary)]"
                      >
                        {n.text}
                      </span>
                    ))}
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>

        {generateStatus === "success" && lastDraftId ? (
          <div
            data-testid="generation-success"
            className="border-t border-[var(--border-glass)] px-5 py-4"
          >
            <p className="text-sm font-medium text-[var(--accent-gold)]">
              Черновик создан
            </p>
            <p className="mt-1 font-[family-name:var(--font-mono-jb)] text-xs text-[var(--text-muted)]">
              {lastDraftId}
            </p>
            {assetCount > 0 ? (
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Файлы: {assetCount}
                {lastRenderMock ? " · демо" : ""}
              </p>
            ) : null}
          </div>
        ) : null}

        {generateStatus === "error" && generateError ? (
          <div
            data-testid="generation-error"
            className="border-t border-[var(--border-glass)] px-5 py-4"
          >
            <p className="text-sm font-medium text-[var(--accent-terracotta)]">
              Ошибка генерации
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{generateError}</p>
          </div>
        ) : null}

        <AgentChatComposer
          onSend={appendDrawerNote}
          disabled={!drawerOpen}
          placeholder="Заметка активному шагу…"
        />
      </motion.aside>
    </>
  );
}
