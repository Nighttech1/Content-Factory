"use client";

import Link from "next/link";
import { useState, type ComponentType, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

const MotionLink = motion.create(Link);

export type MenuVerticalItem = {
  href: string;
  label: string;
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  testId?: string;
  expandTestId?: string;
  expandAriaLabelOpen?: string;
  expandAriaLabelClosed?: string;
  childrenTestId?: string;
  childrenId?: string;
  active?: boolean;
  /** If set, used for aria-current instead of `active` (parent vs child routes). */
  currentPage?: boolean;
  /** Controlled accordion (persist). Combined with hover + active. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  dataModuleId?: string;
  dataCore?: "true" | "false";
};

type MenuVerticalProps = {
  items: MenuVerticalItem[];
  className?: string;
  size?: "md" | "sm";
  color?: string;
};

export function MenuVertical({
  items,
  className,
  size = "md",
  color = "var(--accent-gold)",
}: MenuVerticalProps) {
  const reduceMotion = useReducedMotion();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  /** C-91 size/weight; color restored — white idle (C-93 user). */
  const typeScale =
    size === "sm"
      ? "font-[family-name:var(--font-ui)] text-sm font-bold"
      : "font-[family-name:var(--font-ui)] text-base font-bold";

  return (
    <div className={cn("w-full", className)}>
      {items.map((item) => {
        const key = item.href + item.label;
        const hovered = hoveredKey === key;
        const hasChildren = Boolean(item.children);
        const expanded =
          hasChildren && Boolean(item.active || item.open || hovered);
        const Icon = item.icon;

        const labelColor = item.active
          ? "var(--accent-blue-bright)"
          : hovered
            ? color
            : "var(--text-primary)";

        return (
          <div
            key={key}
            className="w-full"
            onMouseEnter={() => setHoveredKey(key)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <div
              className={cn(
                "flex items-center gap-0.5 border-b border-[var(--border-glass)]",
                item.active && "bg-[var(--bg-hover)]",
              )}
            >
              <MotionLink
                href={item.href}
                data-testid={item.testId}
                data-module-id={item.dataModuleId}
                data-core={item.dataCore}
                aria-current={
                  (item.currentPage ?? item.active) ? "page" : undefined
                }
                className={cn(
                  "group relative flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 py-2.5 pl-3 pr-1",
                  typeScale,
                  item.active &&
                    "font-semibold underline decoration-[var(--accent-blue-bright)]/40 underline-offset-4",
                )}
                style={{ color: labelColor }}
                initial="initial"
                animate={hovered ? "hovered" : "initial"}
                whileHover={reduceMotion ? undefined : "hovered"}
              >
                <span className="flex min-w-0 items-center gap-3">
                  {Icon ? (
                    <Icon
                      className="h-[18px] w-[18px] shrink-0"
                      strokeWidth={1.75}
                    />
                  ) : null}
                  <motion.span
                    className="truncate"
                    variants={{
                      initial: { x: 0 },
                      hovered: { x: reduceMotion ? 0 : 8 },
                    }}
                    transition={reduceMotion ? { duration: 0 } : SPRING}
                  >
                    {item.label}
                  </motion.span>
                </span>
                <motion.span
                  className="inline-flex shrink-0"
                  aria-hidden
                  variants={{
                    initial: {
                      opacity: 0,
                      x: reduceMotion ? 0 : -8,
                    },
                    hovered: { opacity: 1, x: 0 },
                  }}
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                >
                  <ArrowRight className="size-4" style={{ color }} />
                </motion.span>
              </MotionLink>

              {hasChildren ? (
                <button
                  type="button"
                  data-testid={item.expandTestId}
                  aria-expanded={expanded}
                  aria-controls={item.childrenId}
                  aria-label={
                    expanded
                      ? (item.expandAriaLabelOpen ?? `Свернуть ${item.label}`)
                      : (item.expandAriaLabelClosed ??
                        `Развернуть ${item.label}`)
                  }
                  onClick={() => item.onOpenChange?.(!(item.open ?? false))}
                  className={cn(
                    "mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                    item.active
                      ? "text-[var(--accent-blue-bright)] hover:bg-[var(--bg-card)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]",
                  )}
                >
                  <motion.span
                    animate={{ rotate: expanded ? 90 : 0 }}
                    transition={reduceMotion ? { duration: 0 } : SPRING}
                    className="inline-flex"
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  </motion.span>
                </button>
              ) : null}
            </div>

            <AnimatePresence initial={false}>
              {expanded && item.children ? (
                <motion.div
                  id={item.childrenId}
                  data-testid={item.childrenTestId}
                  key={`${key}-children`}
                  initial={
                    reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: -4, scale: 0.98 }
                  }
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                >
                  {item.children}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
