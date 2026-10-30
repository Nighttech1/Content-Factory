"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/**
 * C-68 — keep a light skeleton until the destination route has painted.
 * loading.tsx alone ends when RSC finishes; fat client shells still load.
 */
export function NavPendingOverlay() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;
    setPending(true);
    const ready = window.setTimeout(() => setPending(false), 280);
    const failsafe = window.setTimeout(() => setPending(false), 2500);
    return () => {
      window.clearTimeout(ready);
      window.clearTimeout(failsafe);
    };
  }, [pathname]);

  if (!pending) return null;

  return (
    <div
      data-testid="nav-pending"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-[35]",
        "bg-[color-mix(in_srgb,var(--bg-canvas)_55%,transparent)]",
        "backdrop-blur-[1px]",
      )}
      style={{ paddingLeft: "var(--cf-sidebar-width, 16rem)" }}
    >
      <div className="flex h-full flex-col gap-4 px-8 py-10">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[rgba(255,255,255,0.06)]" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-[rgba(255,255,255,0.04)]" />
        <div className="mt-4 grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
          <div className="animate-pulse rounded-xl border border-[var(--border-glass)] bg-[rgba(255,255,255,0.03)]" />
          <div className="animate-pulse rounded-xl border border-[var(--border-glass)] bg-[rgba(255,255,255,0.03)]" />
        </div>
      </div>
    </div>
  );
}
