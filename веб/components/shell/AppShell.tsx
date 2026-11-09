"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { NavPendingOverlay } from "./NavPendingOverlay";
import { SidebarNavigation } from "./SidebarNavigation";
import { useSidebarWidth } from "@/lib/shell/sidebar-width";
import { isContentFactoryPreview, PREVIEW_READ_ONLY_MESSAGE } from "@/lib/preview";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

export function AppShell({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  const { widthPx, setWidthPx, commitWidth } = useSidebarWidth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => { if (desktop.matches) setMobileOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const sidebar = document.getElementById("cf-primary-navigation");
    const opener = menuButton.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(sidebar?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex="0"]',
    ) ?? []).filter((element) => element.getClientRects().length > 0);
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
      } else if (event.key === "Tab") {
        const elements = focusable();
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (!first) { event.preventDefault(); return; }
        if (event.shiftKey && (document.activeElement === first || !sidebar?.contains(document.activeElement))) {
          event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !sidebar?.contains(document.activeElement))) {
          event.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (!window.matchMedia("(min-width: 768px)").matches) opener?.focus();
    };
  }, [mobileOpen]);

  return (
    <div
      className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] [--cf-sidebar-width:0px] [--sidebar-width:0px] md:[--cf-sidebar-width:var(--cf-desktop-sidebar-width)] md:[--sidebar-width:var(--cf-desktop-sidebar-width)]"
      style={
        {
          "--cf-desktop-sidebar-width": `${widthPx}px`,
        } as React.CSSProperties
      }
    >
      <SidebarNavigation
        widthPx={widthPx}
        onWidthDrag={(clientX) => setWidthPx(clientX, { debouncePersist: true })}
        onWidthCommit={commitWidth}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <NavPendingOverlay />
      <div className="min-w-0 md:pl-[var(--cf-sidebar-width)]" inert={mobileOpen || undefined}>
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border-glass)] bg-[var(--bg-elevated)] px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:hidden">
          <button
            ref={menuButton}
            type="button"
            aria-label="Открыть меню"
            aria-expanded={mobileOpen}
            aria-controls="cf-primary-navigation"
            onClick={() => setMobileOpen(true)}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-blue)]"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <span className="min-w-0 truncate text-sm font-semibold tracking-wide">VERNATUN</span>
        </header>
        {isContentFactoryPreview() ? (
          <div
            role="note"
            data-testid="preview-read-only-notice"
            className="border-b border-[var(--border-glass)] bg-[var(--bg-elevated)] px-4 py-3 text-xs leading-relaxed text-[var(--text-muted)] md:px-8"
          >
            <span className="font-semibold text-[var(--text-primary)]">Тестовый просмотр. </span>
            {PREVIEW_READ_ONLY_MESSAGE}
          </div>
        ) : null}
        <motion.main
          className="min-h-screen min-w-0 px-4 py-6 md:px-8 md:py-8"
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
