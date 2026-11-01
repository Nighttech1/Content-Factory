"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, PanelLeftClose } from "lucide-react";
import { NavPendingOverlay } from "./NavPendingOverlay";
import { SidebarNavigation } from "./SidebarNavigation";
import { cn } from "@/lib/cn";
import { useSidebarWidth } from "@/lib/shell/sidebar-width";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };
const OPEN_STORAGE_KEY = "cf.sidebar.open";

export function AppShell({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  const { widthPx, setWidthPx, commitWidth } = useSidebarWidth();
  const [isDesktop, setIsDesktop] = useState(true);
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => {
      const desktop = mq.matches;
      setIsDesktop(desktop);
      if (desktop) {
        let stored: string | null = null;
        try {
          stored = localStorage.getItem(OPEN_STORAGE_KEY);
        } catch {
          /* storage blocked */
        }
        setOpen(stored === null ? true : stored === "1");
      } else {
        setOpen(false);
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      if (isDesktop) {
        try {
          localStorage.setItem(OPEN_STORAGE_KEY, next ? "1" : "0");
        } catch {
          /* storage blocked */
        }
      }
      return next;
    });
  };

  const contentPadLeft = isDesktop && open ? widthPx : 0;
  // Кнопка плавает слева-сверху над контентом, когда сайдбар не раскрыт на десктопе.
  const buttonOverContent = !(isDesktop && open);

  return (
    <div
      className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)]"
      style={
        {
          "--cf-sidebar-width": `${widthPx}px`,
          "--sidebar-width": `${widthPx}px`,
        } as React.CSSProperties
      }
    >
      {/* Красивая кнопка-тоггл меню — слева сверху, всегда доступна */}
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? "Свернуть меню" : "Открыть меню"}
        aria-expanded={open}
        data-testid="sidebar-toggle"
        className={cn(
          "fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-xl",
          "border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)]",
          "text-[var(--text-primary)] shadow-lg backdrop-blur-md",
          "transition-colors hover:border-[color-mix(in_srgb,var(--accent-gold)_45%,transparent)] hover:bg-[var(--bg-hover)]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
            >
              <PanelLeftClose className="h-5 w-5" strokeWidth={1.75} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Скрим под drawer на мобиле */}
      <AnimatePresence>
        {mounted && open && !isDesktop && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={toggle}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <SidebarNavigation
        open={open}
        isDesktop={isDesktop}
        onNavigate={() => {
          if (!isDesktop) setOpen(false);
        }}
        widthPx={widthPx}
        onWidthDrag={(clientX) => setWidthPx(clientX, { debouncePersist: true })}
        onWidthCommit={commitWidth}
      />
      <NavPendingOverlay />
      <div
        className="transition-[padding] duration-300 ease-out"
        style={{ paddingLeft: contentPadLeft }}
      >
        <motion.main
          className={cn(
            "min-h-screen px-4 py-8 md:px-8",
            buttonOverContent ? "pt-16 md:pt-16" : "pt-8",
          )}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : SPRING}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
