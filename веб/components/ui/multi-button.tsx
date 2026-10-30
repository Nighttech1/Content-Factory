"use client";

/**
 * C-74 — MultiButton adapted for Content Factory Dark Luxury tokens.
 * API aligned with 21st MultiButton (items / variant / size / highlightColor).
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import * as React from "react";

export type MultiButtonVariant = "default" | "outline" | "secondary" | "ghost";
export type MultiButtonSize = "sm" | "md" | "lg";

export type MultiButtonItem = {
  id: string;
  icon: React.ElementType<{ className?: string }>;
  label: React.ReactNode;
  ariaLabel?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  hoverClassName?: string;
  /** Overrides default `multi-button-${id}` test id. */
  testId?: string;
};

type MultiButtonRootProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onClick"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
>;

export type MultiButtonLayout = "row" | "column";

export type MultiButtonProps = MultiButtonRootProps & {
  items: MultiButtonItem[];
  syncWidthTo?: MultiButtonItem[];
  highlightColor?: string;
  gooey?: boolean;
  variant?: MultiButtonVariant;
  size?: MultiButtonSize;
  /** C-94 — column = vertical stack, labels always visible. */
  layout?: MultiButtonLayout;
  /**
   * C-135 — idle cells stay icon-sized so the chat input can flex-grow;
   * hover/focus still expands the active label.
   */
  dense?: boolean;
};

export type CompactMultiButtonProps = MultiButtonProps & {
  selectedId: string;
  iconOnly?: boolean;
  restIcon?: MultiButtonItem["icon"];
  restAriaLabel?: string;
};

const SIZE_CONFIG: Record<
  MultiButtonSize,
  { cell: number; icon: string; minHeight: string; text: string }
> = {
  sm: { cell: 40, icon: "size-3.5", minHeight: "h-10", text: "text-xs" },
  md: { cell: 40, icon: "size-4", minHeight: "h-10", text: "text-sm" },
  lg: { cell: 40, icon: "size-[18px]", minHeight: "h-10", text: "text-sm" },
};

/** Dark Luxury — map to factory CSS variables (no purple/shadcn defaults). */
const VARIANT_CLASSES: Record<MultiButtonVariant, string> = {
  default:
    "bg-[color-mix(in_srgb,var(--accent-blue)_22%,var(--bg-elevated))] text-[var(--accent-blue-bright)] shadow-sm ring-1 ring-[color-mix(in_srgb,var(--accent-blue)_35%,transparent)]",
  outline:
    "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-xs ring-1 ring-inset ring-[var(--border-glass)]",
  secondary:
    "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs ring-1 ring-[var(--border-glass)]",
  ghost:
    "bg-[rgba(255,255,255,0.04)] text-[var(--text-primary)] ring-1 ring-[var(--border-glass)]",
};

const ITEM_HOVER: Record<MultiButtonVariant, string> = {
  default: "hover:bg-[color-mix(in_srgb,var(--accent-blue)_32%,transparent)]",
  outline: "hover:bg-[var(--bg-hover)]",
  secondary: "hover:bg-[var(--bg-hover)]",
  ghost: "hover:bg-[var(--bg-hover)]",
};

const DIVIDER: Record<MultiButtonVariant, string> = {
  default: "bg-[color-mix(in_srgb,var(--accent-blue-bright)_25%,transparent)]",
  outline: "bg-[var(--border-glass)]",
  secondary: "bg-[var(--border-glass)]",
  ghost: "bg-[var(--border-glass)]",
};

const LABEL_SPRING = { type: "spring" as const, stiffness: 520, damping: 32 };
/** C-88 — width expand must spring, never jump. */
const WIDTH_SPRING = { type: "spring" as const, stiffness: 380, damping: 34 };

function labelText(label: React.ReactNode) {
  return typeof label === "string" || typeof label === "number"
    ? String(label)
    : "";
}

/** Cyrillic UI labels need ~9–10px/ch so «Информационное видео» fits. */
function estimateLabelWidth(label: React.ReactNode, size: MultiButtonSize) {
  const text = labelText(label);
  const perCh = size === "sm" ? 8.2 : size === "lg" ? 10.2 : 9.4;
  return Math.ceil(text.length * perCh) + (size === "lg" ? 14 : 12);
}

function itemAriaLabel(item: MultiButtonItem) {
  return item.ariaLabel ?? (labelText(item.label) || item.id);
}

const MultiButton = React.forwardRef<HTMLDivElement, MultiButtonProps>(
  (
    {
      items,
      highlightColor,
      variant = "outline",
      size = "md",
      layout = "row",
      dense = false,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const reduceMotion = Boolean(useReducedMotion());
    const cfg = SIZE_CONFIG[size];
    const [hoveredId, setHoveredId] = React.useState<string | null>(null);
    const [touchId, setTouchId] = React.useState<string | null>(null);
    const activeId = hoveredId ?? touchId;
    const isColumn = layout === "column";

    const reserved = dense
      ? 0
      : items.reduce(
          (m, it) => Math.max(m, estimateLabelWidth(it.label, size)),
          0,
        );

    const widths = items.map((item) => {
      if (isColumn) {
        return Math.max(cfg.cell + estimateLabelWidth(item.label, size) + 8, 160);
      }
      if (!activeId) {
        return dense
          ? cfg.cell
          : cfg.cell + reserved / Math.max(items.length, 1);
      }
      const activeW = estimateLabelWidth(
        items.find((i) => i.id === activeId)?.label ?? "",
        size,
      );
      if (item.id === activeId) return cfg.cell + activeW;
      if (dense) return cfg.cell;
      const rem = Math.max(0, reserved - activeW);
      return items.length > 1
        ? cfg.cell + rem / (items.length - 1)
        : cfg.cell;
    });

    const totalW = isColumn
      ? Math.max(...widths, 160)
      : widths.reduce((a, b) => a + b, 0) + Math.max(0, items.length - 1);

    return (
      <motion.div
        ref={ref}
        data-slot="multi-button"
        data-layout={layout}
        role="group"
        style={
          {
            ...style,
            "--multi-button-highlight": highlightColor,
          } as React.CSSProperties
        }
        initial={false}
        animate={isColumn ? { width: totalW } : { width: totalW }}
        transition={reduceMotion ? { duration: 0 } : WIDTH_SPRING}
        className={`relative inline-flex overflow-hidden rounded-lg ${
          isColumn
            ? `flex-col items-stretch ${VARIANT_CLASSES[variant]}`
            : `items-stretch ${cfg.minHeight} ${VARIANT_CLASSES[variant]}`
        } ${className ?? ""}`}
        {...props}
      >
        {items.map((item, index) => {
          const active = activeId === item.id;
          const showLabel = isColumn || active;
          const width = widths[index] ?? cfg.cell;
          const Icon = item.icon;
          return (
            <React.Fragment key={item.id}>
              {index > 0 && !isColumn ? (
                <span
                  aria-hidden
                  className={`my-2 w-px shrink-0 transition-opacity duration-200 ${DIVIDER[variant]} ${activeId ? "opacity-0" : "opacity-100"}`}
                />
              ) : null}
              {index > 0 && isColumn ? (
                <span
                  aria-hidden
                  className={`mx-2 h-px shrink-0 ${DIVIDER[variant]}`}
                />
              ) : null}
              <motion.button
                type="button"
                data-testid={item.testId ?? `multi-button-${item.id}`}
                aria-label={itemAriaLabel(item)}
                disabled={item.disabled}
                onClick={(e) => {
                  if (item.disabled) return;
                  item.onClick?.(e);
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(item.id)}
                onBlur={() => setHoveredId(null)}
                onPointerDown={(e) => {
                  if (e.pointerType === "touch") setTouchId(item.id);
                }}
                initial={false}
                animate={isColumn ? { width: "100%" } : { width }}
                transition={reduceMotion ? { duration: 0 } : WIDTH_SPRING}
                className={`relative flex shrink-0 cursor-pointer items-center justify-start overflow-hidden ${cfg.minHeight} focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue-bright)] focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-40 ${ITEM_HOVER[variant]} ${item.className ?? ""} ${isColumn ? "w-full" : ""}`}
              >
                <span
                  className={`relative z-10 flex h-full shrink-0 items-center justify-center`}
                  style={{ width: `${cfg.cell}px` }}
                  aria-hidden
                >
                  <Icon className={cfg.icon} />
                </span>
                <AnimatePresence initial={false} mode="popLayout">
                  {showLabel ? (
                    <motion.span
                      key={item.id}
                      initial={
                        reduceMotion || isColumn
                          ? false
                          : { opacity: 0, x: -4 }
                      }
                      animate={{ opacity: 1, x: 0 }}
                      exit={
                        reduceMotion || isColumn
                          ? undefined
                          : { opacity: 0, x: -4 }
                      }
                      transition={
                        reduceMotion ? { duration: 0 } : LABEL_SPRING
                      }
                      className={`-ml-1 shrink-0 whitespace-nowrap pr-2.5 text-left font-medium leading-none ${cfg.text}`}
                    >
                      {item.label}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.button>
            </React.Fragment>
          );
        })}
      </motion.div>
    );
  },
);
MultiButton.displayName = "MultiButton";

/**
 * C-77 — compact rail: collapsed = selected (or rest) icon;
 * hover/focus expands full MultiButton actions.
 */
const CompactMultiButton = React.forwardRef<
  HTMLDivElement,
  CompactMultiButtonProps
>(
  (
    {
      items,
      selectedId,
      iconOnly = false,
      restIcon: RestIcon,
      restAriaLabel = "Открыть действия",
      highlightColor,
      variant = "outline",
      size = "md",
      className,
      style,
      onMouseEnter: onMouseEnterProp,
      onMouseLeave: onMouseLeaveProp,
      onFocusCapture: onFocusCaptureProp,
      onBlurCapture: onBlurCaptureProp,
      ...rootProps
    },
    ref,
  ) => {
    const reduceMotion = Boolean(useReducedMotion());
    const cfg = SIZE_CONFIG[size];
    const [expanded, setExpanded] = React.useState(false);
    const [hoveredId, setHoveredId] = React.useState<string | null>(null);
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const selected =
      items.find((i) => i.id === selectedId) ?? items[0] ?? null;
    const SelectedIcon = selected?.icon;
    const activeId = expanded && !iconOnly ? hoveredId : null;

    const reserved = items.reduce(
      (m, it) => Math.max(m, estimateLabelWidth(it.label, size)),
      0,
    );
    const widths = items.map((item) => {
      if (!activeId) {
        return cfg.cell + reserved / Math.max(items.length, 1);
      }
      const activeW = estimateLabelWidth(
        items.find((i) => i.id === activeId)?.label ?? "",
        size,
      );
      if (item.id === activeId) return cfg.cell + activeW;
      const rem = Math.max(0, reserved - activeW);
      return items.length > 1
        ? cfg.cell + rem / (items.length - 1)
        : cfg.cell;
    });
    const expandedW =
      widths.reduce((a, b) => a + b, 0) + Math.max(0, items.length - 1);
    const width = expanded ? expandedW : cfg.cell;

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        data-slot="compact-multi-button"
        role="group"
        aria-expanded={expanded}
        style={
          {
            ...style,
            width: `${width}px`,
            "--multi-button-highlight": highlightColor,
          } as React.CSSProperties
        }
        className={`relative inline-flex items-stretch overflow-hidden rounded-lg ${cfg.minHeight} [transition:width_220ms_cubic-bezier(0.22,1,0.36,1)] motion-reduce:[transition:none] ${VARIANT_CLASSES[variant]} ${className ?? ""}`}
        onMouseEnter={(e) => {
          setExpanded(true);
          onMouseEnterProp?.(e);
        }}
        onMouseLeave={(e) => {
          setExpanded(false);
          setHoveredId(null);
          onMouseLeaveProp?.(e);
        }}
        onFocusCapture={(e) => {
          setExpanded(true);
          onFocusCaptureProp?.(e);
        }}
        onBlurCapture={(e) => {
          if (
            !e.relatedTarget ||
            !e.currentTarget.contains(e.relatedTarget as Node)
          ) {
            setExpanded(false);
            setHoveredId(null);
          }
          onBlurCaptureProp?.(e);
        }}
        {...rootProps}
      >
        {!expanded ? (
          <button
            type="button"
            data-testid={
              selected?.testId ?? `compact-multi-button-${selected?.id ?? "rest"}`
            }
            aria-label={
              RestIcon
                ? restAriaLabel
                : selected
                  ? itemAriaLabel(selected)
                  : restAriaLabel
            }
            aria-expanded={false}
            className={`flex h-full w-full items-center justify-center ${ITEM_HOVER[variant]} focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue-bright)] focus-visible:ring-inset`}
            onClick={(e) => {
              setExpanded(true);
              selected?.onClick?.(e);
            }}
          >
            {RestIcon ? (
              <RestIcon className={cfg.icon} />
            ) : SelectedIcon ? (
              <SelectedIcon className={cfg.icon} />
            ) : null}
          </button>
        ) : (
          items.map((item, index) => {
            const active = activeId === item.id;
            const w = widths[index] ?? cfg.cell;
            const Icon = item.icon;
            return (
              <React.Fragment key={item.id}>
                {index > 0 ? (
                  <span
                    aria-hidden
                    className={`my-2 w-px shrink-0 ${DIVIDER[variant]} ${activeId ? "opacity-0" : "opacity-100"}`}
                  />
                ) : null}
                <button
                  type="button"
                  data-testid={item.testId ?? `multi-button-${item.id}`}
                  aria-label={itemAriaLabel(item)}
                  disabled={item.disabled}
                  onClick={(e) => {
                    if (item.disabled) return;
                    item.onClick?.(e);
                    setExpanded(false);
                    setHoveredId(null);
                  }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(item.id)}
                  onBlur={() => setHoveredId(null)}
                  style={{ width: `${w}px` }}
                  className={`relative flex shrink-0 cursor-pointer items-center justify-start overflow-hidden ${cfg.minHeight} focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue-bright)] focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-40 ${ITEM_HOVER[variant]} ${item.className ?? ""}`}
                >
                  <span
                    className="relative z-10 flex h-full shrink-0 items-center justify-center"
                    style={{ width: `${cfg.cell}px` }}
                    aria-hidden
                  >
                    <Icon className={cfg.icon} />
                  </span>
                  <AnimatePresence initial={false} mode="popLayout">
                    {active ? (
                      <motion.span
                        key={item.id}
                        initial={
                          reduceMotion
                            ? false
                            : { opacity: 0, scale: 0.25, filter: "blur(4px)" }
                        }
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={
                          reduceMotion
                            ? undefined
                            : { opacity: 0, scale: 0.25, filter: "blur(4px)" }
                        }
                        transition={
                          reduceMotion ? { duration: 0 } : LABEL_SPRING
                        }
                        className={`-ml-1 shrink-0 whitespace-nowrap pr-2 font-medium leading-none ${cfg.text}`}
                      >
                        {item.label}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </button>
              </React.Fragment>
            );
          })
        )}
      </div>
    );
  },
);
CompactMultiButton.displayName = "CompactMultiButton";

function MultiButtonGroup({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <div
      data-slot="multi-button-group"
      className={`contents ${className ?? ""}`}
      {...props}
    >
      {children}
    </div>
  );
}

export { CompactMultiButton, MultiButton, MultiButtonGroup };
export default MultiButton;
