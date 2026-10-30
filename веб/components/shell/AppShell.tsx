"use client";

import { motion, useReducedMotion } from "framer-motion";
import { NavPendingOverlay } from "./NavPendingOverlay";
import { SidebarNavigation } from "./SidebarNavigation";
import { useSidebarWidth } from "@/lib/shell/sidebar-width";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

export function AppShell({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  const { widthPx, setWidthPx, commitWidth } = useSidebarWidth();

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
      <SidebarNavigation
        widthPx={widthPx}
        onWidthDrag={(clientX) => setWidthPx(clientX, { debouncePersist: true })}
        onWidthCommit={commitWidth}
      />
      <NavPendingOverlay />
      <div style={{ paddingLeft: widthPx }}>
        <motion.main
          className="min-h-screen px-6 py-8 md:px-8"
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
