"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GripVertical, PanelRightOpen, X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  clampDesignPreviewPosition,
  clampDesignPreviewWidth,
  DESIGN_PREVIEW_MAX_W,
  DESIGN_PREVIEW_MIN_W,
  readDesignPreviewLayout,
  writeDesignPreviewOpen,
  writeDesignPreviewPosition,
  writeDesignPreviewWidth,
} from "@/lib/settings/design-preview-persist";

type DesignPreviewPanelProps = {
  markdown: string;
  fileName: string;
  /** Controlled open (chip DESIGN.md / parent). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * S51: hide standalone «Превью design.md» button — open only via
   * toolbar eye «код дизайн мд».
   */
  showToggle?: boolean;
};

/**
 * C-143 / C-settings-design-md-carousel — floating design.md preview.
 * HARD: Close / Esc live OUTSIDE drag setPointerCapture target (D-sd-7).
 * 21st Floating Panel (id=6326) · Dark Luxury · no ark-ui.
 */
export function DesignPreviewPanel({
  markdown,
  fileName,
  open: openControlled,
  onOpenChange,
  showToggle = true,
}: DesignPreviewPanelProps) {
  const reduceMotion = useReducedMotion();
  const [openUncontrolled, setOpenUncontrolled] = useState(false);
  const controlled = openControlled !== undefined;
  const open = controlled ? openControlled : openUncontrolled;
  const [x, setX] = useState(24);
  const [y, setY] = useState(96);
  const [width, setWidth] = useState(360);
  const [hydrated, setHydrated] = useState(false);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const resizeRef = useRef<{ startX: number; startW: number } | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  function setOpenPersist(next: boolean) {
    if (!controlled) setOpenUncontrolled(next);
    onOpenChange?.(next);
    writeDesignPreviewOpen(next);
  }

  useEffect(() => {
    const layout = readDesignPreviewLayout();
    const pos = clampDesignPreviewPosition(
      layout.x,
      layout.y,
      layout.width,
    );
    if (!controlled) setOpenUncontrolled(layout.open);
    setX(pos.x);
    setY(pos.y);
    setWidth(layout.width);
    setHydrated(true);
  }, [controlled]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenPersist(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setOpenPersist stable enough per open
  }, [open, controlled]);

  const onDragDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: x,
        originY: y,
      };
    },
    [x, y],
  );

  const onDragMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const next = clampDesignPreviewPosition(
        dragRef.current.originX + dx,
        dragRef.current.originY + dy,
        width,
        panelRef.current?.offsetHeight ?? 320,
      );
      setX(next.x);
      setY(next.y);
    },
    [width],
  );

  const onDragUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      dragRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* */
      }
      writeDesignPreviewPosition(x, y);
    },
    [x, y],
  );

  const onResizeDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      resizeRef.current = { startX: e.clientX, startW: width };
    },
    [width],
  );

  const onResizeMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizeRef.current) return;
    const delta = e.clientX - resizeRef.current.startX;
    setWidth(clampDesignPreviewWidth(resizeRef.current.startW + delta));
  }, []);

  const onResizeUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!resizeRef.current) return;
      resizeRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* */
      }
      writeDesignPreviewWidth(width);
      const pos = clampDesignPreviewPosition(x, y, width);
      setX(pos.x);
      setY(pos.y);
      writeDesignPreviewPosition(pos.x, pos.y);
    },
    [width, x, y],
  );

  const onCloseClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setOpenPersist(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [controlled, onOpenChange],
  );

  if (!hydrated) {
    if (!showToggle) return null;
    return (
      <button
        type="button"
        data-testid="settings-design-preview-toggle"
        disabled
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-glass)] px-3 py-2 text-sm font-semibold text-[var(--text-muted)] opacity-60"
      >
        <PanelRightOpen className="h-4 w-4" />
        Превью design.md
      </button>
    );
  }

  return (
    <>
      {showToggle ? (
        <button
          type="button"
          data-testid="settings-design-preview-toggle"
          aria-expanded={open}
          aria-controls="settings-design-preview-panel"
          onClick={() => setOpenPersist(!open)}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border border-[var(--border-glass)] px-3 py-2 text-sm font-semibold transition",
            open
              ? "bg-[color-mix(in_srgb,var(--accent-gold)_14%,transparent)] text-[var(--accent-gold)]"
              : "bg-[color-mix(in_srgb,var(--accent-blue)_14%,transparent)] text-[var(--accent-blue-bright)]",
          )}
        >
          <PanelRightOpen className="h-4 w-4" />
          {open ? "Закрыть превью" : "Превью design.md"}
        </button>
      ) : null}

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={panelRef}
            id="settings-design-preview-panel"
            data-testid="settings-design-preview-panel"
            role="dialog"
            aria-label="Превью design.md"
            className="fixed z-50 flex max-h-[min(70vh,560px)] flex-col overflow-hidden rounded-xl border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_96%,transparent)] shadow-[0_20px_56px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            style={{ left: x, top: y, width }}
            initial={reduceMotion ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: 12 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.16, ease: "easeOut" }
            }
          >
            {/* Chrome row: drag handle + Close as SIBLINGS — Close never under setPointerCapture */}
            <div className="flex items-stretch border-b border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-card)_90%,transparent)]">
              <div
                data-testid="settings-design-preview-drag"
                onPointerDown={onDragDown}
                onPointerMove={onDragMove}
                onPointerUp={onDragUp}
                onPointerCancel={onDragUp}
                className="flex min-w-0 flex-1 cursor-grab touch-none items-center gap-2 px-3 py-2 active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 shrink-0 text-[var(--text-mono)]" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
                    Превью design.md
                  </p>
                  <p className="truncate font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-mono)]">
                    {fileName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-testid="settings-design-preview-close"
                aria-label="Закрыть превью"
                onClick={onCloseClick}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                className="shrink-0 border-l border-[var(--border-glass)] px-3 text-[var(--text-muted)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              data-testid="settings-design-preview-body"
              className="min-h-0 flex-1 overflow-y-auto px-3 py-3"
            >
              {markdown.trim() ? (
                <pre className="whitespace-pre-wrap break-words font-[family-name:var(--font-mono-jb)] text-[11px] leading-relaxed text-[var(--text-primary)]">
                  {markdown}
                </pre>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">
                  Файл пуст. Загрузите design.md выше — превью обновится.
                </p>
              )}
            </div>

            <div
              data-testid="settings-design-preview-resize"
              role="separator"
              aria-orientation="vertical"
              aria-label="Изменить ширину превью"
              aria-valuemin={DESIGN_PREVIEW_MIN_W}
              aria-valuemax={DESIGN_PREVIEW_MAX_W}
              aria-valuenow={width}
              onPointerDown={onResizeDown}
              onPointerMove={onResizeMove}
              onPointerUp={onResizeUp}
              onPointerCancel={onResizeUp}
              className="absolute bottom-0 right-0 top-0 z-10 w-1.5 cursor-ew-resize touch-none hover:bg-[color-mix(in_srgb,var(--accent-blue-bright)_40%,transparent)]"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
