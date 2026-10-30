"use client";

import { useEffect, useRef } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useInspectStore } from "@/lib/inspect-store";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

export function HookAlternatives() {
  const reduceMotion = useReducedMotion();
  const hooks = useInspectStore((s) => s.hooks);
  const activeHookId = useInspectStore((s) => s.activeHookId);
  const selectHook = useInspectStore((s) => s.selectHook);
  const prevActiveRef = useRef(activeHookId);
  const didSwap = prevActiveRef.current !== activeHookId;

  useEffect(() => {
    prevActiveRef.current = activeHookId;
  }, [activeHookId]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
          Alternative Hook Selector
        </h3>
        <span className="text-[11px] text-[var(--text-muted)]">
          Click to instant swap
        </span>
      </div>

      <LayoutGroup id="hook-alternatives">
        <ul className="flex flex-col gap-1.5" role="listbox" aria-label="Hook alternatives">
          {hooks.slice(0, 3).map((hook) => {
            const active = hook.id === activeHookId;
            const showFlash = active && didSwap && !reduceMotion;

            return (
              <motion.li
                key={hook.id}
                role="option"
                aria-selected={active}
                layout={!reduceMotion}
                transition={reduceMotion ? { duration: 0 } : SPRING}
              >
                <motion.button
                  type="button"
                  onClick={() => selectHook(hook.id)}
                  className={cn(
                    "group relative flex w-full items-start gap-2.5 overflow-hidden rounded-lg p-3 text-left",
                    active
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                  )}
                  whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                >
                  {active ? (
                    <motion.span
                      layoutId={reduceMotion ? undefined : "hook-active-pill"}
                      className="absolute inset-0 rounded-lg bg-[var(--bg-elevated)] ring-1 ring-[var(--accent-blue)]"
                      transition={reduceMotion ? { duration: 0 } : SPRING}
                      aria-hidden
                    />
                  ) : (
                    <span
                      className="absolute inset-0 rounded-lg bg-[color-mix(in_srgb,var(--bg-hover)_70%,transparent)] transition-colors group-hover:bg-[var(--bg-hover)]"
                      aria-hidden
                    />
                  )}

                  {showFlash && (
                    <motion.span
                      key={`flash-${hook.id}-${activeHookId}`}
                      className="pointer-events-none absolute inset-0 rounded-lg bg-[color-mix(in_srgb,var(--accent-blue)_28%,transparent)]"
                      initial={{ opacity: 0.55 }}
                      animate={{ opacity: 0 }}
                      transition={SPRING}
                      aria-hidden
                    />
                  )}

                  <span
                    className={cn(
                      "relative z-10 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]",
                      active
                        ? "border-[var(--accent-blue)] bg-[color-mix(in_srgb,var(--accent-blue)_25%,transparent)] text-[var(--accent-blue-bright)]"
                        : "border-[var(--border-glass)] text-[var(--text-muted)]",
                    )}
                    aria-hidden
                  >
                    {active ? "✓" : ""}
                  </span>

                  <div className="relative z-10 min-w-0 flex-1 pr-14">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        active ? "font-semibold text-[var(--text-primary)]" : "font-medium",
                      )}
                    >
                      {hook.text}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 font-[family-name:var(--font-mono-jb)] text-[10px]",
                        active ? "text-[var(--accent-gold)]" : "text-[var(--text-muted)]",
                      )}
                    >
                      {hook.retentionHint}
                    </p>
                  </div>

                  <motion.span
                    layout={!reduceMotion}
                    className={cn(
                      "absolute right-2 top-2 z-10 rounded px-1.5 py-0.5 font-[family-name:var(--font-mono-jb)] text-[9px]",
                      active
                        ? "bg-[color-mix(in_srgb,var(--accent-blue)_22%,transparent)] font-bold text-[var(--accent-blue-bright)]"
                        : "bg-[var(--bg-hover)] text-[var(--text-muted)]",
                    )}
                    animate={
                      reduceMotion || !showFlash
                        ? undefined
                        : { scale: [1, 1.08, 1] }
                    }
                    transition={reduceMotion ? { duration: 0 } : SPRING}
                  >
                    {active ? "ACTIVE" : "SWAP"}
                  </motion.span>
                </motion.button>
              </motion.li>
            );
          })}
        </ul>
      </LayoutGroup>
    </div>
  );
}
