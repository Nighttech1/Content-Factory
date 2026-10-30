"use client";

/**
 * C-razbor-draft-edit D-rb-4 — «Выбрать» + empty comparison square (top-right).
 * Opens minimal competitor picker from feed posts.
 */

import { useReducedMotion, motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import type { FeedPost } from "@/lib/studio/feed-types";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };
const INSTANT = { duration: 0 };

type RazborCompetitorPickChromeProps = {
  posts: FeedPost[];
  selected: FeedPost | null;
  pickerOpen: boolean;
  onOpenPicker: () => void;
  onClosePicker: () => void;
  onSelect: (post: FeedPost) => void;
};

export function RazborCompetitorPickChrome({
  posts,
  selected,
  pickerOpen,
  onOpenPicker,
  onClosePicker,
  onSelect,
}: RazborCompetitorPickChromeProps) {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <div
        className="absolute right-3 top-3 z-20 flex items-center gap-2"
        data-testid="razbor-competitor-pick-chrome"
      >
        <button
          type="button"
          data-testid="razbor-competitor-vybrat"
          onClick={onOpenPicker}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold text-white",
            "bg-[color-mix(in_srgb,var(--accent-gold)_22%,#0a0c0f)]",
            "border border-[color-mix(in_srgb,var(--accent-gold)_40%,transparent)]",
            "hover:bg-[color-mix(in_srgb,var(--accent-gold)_32%,#0a0c0f)]",
            "font-[family-name:var(--font-century-gothic)]",
          )}
        >
          Выбрать
        </button>
        <button
          type="button"
          data-testid="razbor-comparison-square"
          aria-label={
            selected
              ? `Сравнение: ${selected.title}`
              : "Пустой слот сравнения — выбрать конкурента"
          }
          onClick={onOpenPicker}
          className={cn(
            "size-11 shrink-0 overflow-hidden rounded-md border",
            "border-[var(--border-glass)] bg-[rgba(255,255,255,0.04)]",
            "hover:border-[color-mix(in_srgb,var(--accent-gold)_45%,transparent)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]",
          )}
        >
          {selected?.thumbUrl || selected?.slideUrls?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element -- comparison thumb
            <img
              src={selected.thumbUrl || selected.slideUrls![0]}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <span className="sr-only">Пустой слот</span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {pickerOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Закрыть выбор конкурента"
              className="absolute inset-0 z-30 bg-black/50"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={reduceMotion ? INSTANT : { duration: 0.18 }}
              onClick={onClosePicker}
            />
            <motion.div
              data-testid="razbor-competitor-picker"
              role="dialog"
              aria-label="Выбрать карусель конкурента для сравнения"
              className={cn(
                "absolute inset-x-3 top-14 z-40 max-h-[70%] overflow-y-auto overscroll-contain",
                "rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] p-3",
                "shadow-[0_16px_48px_rgba(0,0,0,0.45)]",
                "font-[family-name:var(--font-century-gothic)]",
              )}
              initial={
                reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduceMotion
                  ? undefined
                  : { opacity: 0, y: -6, scale: 0.98 }
              }
              transition={reduceMotion ? INSTANT : SPRING}
            >
              <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">
                Карусель для сравнения
              </p>
              {posts.length === 0 ? (
                <p className="py-4 text-center text-sm text-[var(--text-muted)]">
                  Нет постов конкурентов в ленте
                </p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {posts.map((p) => {
                    const active = selected?.id === p.id;
                    const thumb = p.thumbUrl || p.slideUrls?.[0];
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          data-testid={`razbor-competitor-pick-${p.id}`}
                          onClick={() => {
                            onSelect(p);
                            onClosePicker();
                          }}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left",
                            "border border-transparent",
                            active
                              ? "border-[color-mix(in_srgb,var(--accent-gold)_40%,transparent)] bg-[color-mix(in_srgb,var(--accent-gold)_12%,transparent)]"
                              : "hover:bg-[rgba(255,255,255,0.04)]",
                          )}
                        >
                          <span
                            className={cn(
                              "size-10 shrink-0 overflow-hidden rounded-md border border-[var(--border-glass)]",
                              "bg-[rgba(255,255,255,0.04)]",
                            )}
                          >
                            {thumb ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={thumb}
                                alt=""
                                className="size-full object-cover"
                              />
                            ) : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-white">
                              {p.username
                                ? p.username.startsWith("@")
                                  ? p.username
                                  : `@${p.username}`
                                : p.title}
                            </span>
                            <span className="block truncate text-[11px] text-[var(--text-muted)]">
                              {p.title}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
