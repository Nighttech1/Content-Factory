"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/cn";

const CTA_ROWS: ReadonlyArray<{ n: 1 | 2 | 3 | 4; title: string; action: string }> = [
  {
    n: 1,
    title: "Вопрос зрителю",
    action: "напишите в комментариях",
  },
  {
    n: 2,
    title: "Хочешь ещё подобного?",
    action: "подписывайся",
  },
  {
    n: 3,
    title: "Живые встречи армянского разговорного клуба",
    action: "приглашение через TG канал в шапке профиля",
  },
  {
    n: 4,
    title: "Понравился контент?",
    action: "лайк + сохранить",
  },
];

/**
 * C-scriptwriter-cta-hint-ui — «?» cheat sheet for CTA catalog 1–4.
 * Only mount on Scriptwriter Create step.
 */
export function ScriptwriterCtaHint({ className }: { className?: string }) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          data-testid="create-scriptwriter-cta-hint"
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-lg",
            "border border-[var(--border-glass)] bg-[rgba(255,255,255,0.04)]",
            "text-[var(--text-muted)] transition-colors",
            "hover:border-[color-mix(in_srgb,var(--accent-gold)_45%,transparent)]",
            "hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]/50",
            className,
          )}
          aria-label="Шпаргалка типов CTA 1–4"
          title="Типы CTA 1–4"
        >
          <span className="text-sm font-semibold leading-none" aria-hidden>
            ?
          </span>
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-testid="create-scriptwriter-cta-hint-panel"
          side="bottom"
          align="end"
          sideOffset={8}
          className={cn(
            "z-[60] w-[min(22rem,calc(100vw-2rem))] rounded-xl p-3.5",
            "border border-[var(--border-glass)]",
            "bg-[color-mix(in_srgb,var(--bg-elevated)_92%,black)]",
            "shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-md",
            "text-[var(--text-primary)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        >
          <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Типы CTA — напишите номер в чат
          </p>
          <ol className="flex flex-col gap-2.5">
            {CTA_ROWS.map((row) => (
              <li
                key={row.n}
                className="flex gap-2.5 rounded-lg border border-[var(--border-glass)] bg-[rgba(255,255,255,0.03)] px-2.5 py-2"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums text-[var(--accent-gold)]"
                  style={{
                    background:
                      "color-mix(in srgb, var(--accent-gold) 18%, transparent)",
                  }}
                  aria-hidden
                >
                  {row.n}
                </span>
                <div className="min-w-0 text-sm leading-snug">
                  <p className="font-medium text-[var(--text-primary)]">{row.title}</p>
                  <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">
                    → {row.action}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <PopoverPrimitive.Arrow className="fill-[var(--bg-elevated)]" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
