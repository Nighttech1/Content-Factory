"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Briefcase, Calendar, Rocket, Settings } from "lucide-react";
import {
  MenuVertical,
  type MenuVerticalItem,
} from "@/components/ui/menu-vertical";
import { SidebarResizeHandle } from "@/components/ui/sidebar-resize-handle";
import { cn } from "@/lib/cn";
import { useSessionStore } from "@/lib/session-store";
import { DEFAULT_SIDEBAR_WIDTH } from "@/lib/shell/sidebar-width";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  /** Visible to ADMIN and OWNER (both session roles). */
  adminOrOwner?: boolean;
  testId?: string;
};

/** C-136 + S48 — Studio / Schedule / Settings / Директор→/marketing. */
const NAV_ITEMS: NavItem[] = [
  { href: "/studio", label: "Студия", icon: Rocket, testId: "nav-studio" },
  { href: "/schedule", label: "Расписание", icon: Calendar },
  {
    href: "/settings",
    label: "Настройки",
    icon: Settings,
    adminOrOwner: true,
    testId: "nav-settings",
  },
  {
    href: "/marketing",
    label: "Директор",
    icon: Briefcase,
    testId: "nav-director",
  },
];

/** C-68 / S48 — warm critical routes after idle (prod + warm turbopack). */
const PREFETCH_HREFS = [
  "/studio",
  "/schedule",
  "/settings",
  "/marketing",
] as const;

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

type SidebarNavigationProps = {
  widthPx?: number;
  onWidthDrag?: (clientX: number) => void;
  onWidthCommit?: () => void;
};

export function SidebarNavigation({
  widthPx = DEFAULT_SIDEBAR_WIDTH,
  onWidthDrag,
  onWidthCommit,
}: SidebarNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const role = useSessionStore((s) => s.role);
  const setRole = useSessionStore((s) => s.setRole);
  const reduceMotion = useReducedMotion();
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const run = () => {
      for (const href of PREFETCH_HREFS) {
        try {
          router.prefetch(href);
        } catch {
          /* prefetch best-effort */
        }
      }
    };
    const ric = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    if (typeof ric === "function") {
      const id = ric(run, { timeout: 1800 });
      return () => {
        (
          window as Window & { cancelIdleCallback?: (id: number) => void }
        ).cancelIdleCallback?.(id);
      };
    }
    const t = window.setTimeout(run, 400);
    return () => window.clearTimeout(t);
  }, [router]);

  const items = NAV_ITEMS.filter((item) => {
    if (item.adminOrOwner) return role === "OWNER" || role === "ADMIN";
    return true;
  });

  const menuItems: MenuVerticalItem[] = items.map((item) => {
    const active =
      item.href === "/studio"
        ? pathname.startsWith("/studio")
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
    return {
      href: item.href,
      label: item.label,
      icon: item.icon,
      testId: item.testId,
      active,
    };
  });

  const finishDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    setDragging(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
    document.body.style.removeProperty("cursor");
    document.body.style.removeProperty("user-select");
    onWidthCommit?.();
  };

  return (
    <motion.aside
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[var(--border-glass)] bg-[var(--bg-elevated)]"
      style={{ width: widthPx }}
      aria-label="Главная навигация"
      /* C-133: initial={false} — avoid SSR/CSR mismatch from useReducedMotion */
      initial={false}
      animate={{ opacity: 1, x: 0 }}
      transition={reduceMotion ? { duration: 0 } : SPRING}
    >
      {/* C-133/C-130: brand markup identical SSR+CSR; testid always present */}
      <div
        data-testid="nav-brand"
        className="flex flex-row items-center gap-3 border-b border-[var(--border-glass)] px-5 py-5"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static brand PNG asset */}
        <img
          src="/brand/vernatun-emblem.png"
          alt=""
          width={36}
          height={36}
          aria-hidden
          className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-[color-mix(in_srgb,var(--accent-gold)_35%,transparent)]"
        />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-[family-name:var(--font-ui)] text-sm font-semibold tracking-wide text-[var(--text-primary)]">
            VERNATUN
          </span>
          <span className="truncate font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
            ARMENIAN CLUB
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        <nav className="flex flex-col">
          <MenuVertical items={menuItems} />
        </nav>
      </div>

      <div className="space-y-3 border-t border-[var(--border-glass)] px-3 py-4">
        {/* Local QA role switcher — acceptance only; no SSR-only branch */}
        <div className="rounded-lg border border-dashed border-[var(--border-glass)] bg-[var(--bg-card)] p-2">
          <p className="mb-1.5 px-1 font-[family-name:var(--font-mono-jb)] text-[9px] uppercase tracking-wider text-[var(--text-mono)]">
            Роль QA (локально)
          </p>
          <div className="flex gap-1">
            {(["OWNER", "ADMIN"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "flex-1 rounded px-2 py-1.5 font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wide transition-colors",
                  role === r
                    ? "bg-[color-mix(in_srgb,var(--accent-blue)_28%,transparent)] text-[var(--accent-blue-bright)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <SidebarResizeHandle
        dragging={dragging}
        onPointerDown={(event) => {
          event.preventDefault();
          setDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
          document.body.style.cursor = "col-resize";
          document.body.style.userSelect = "none";
          onWidthDrag?.(event.clientX);
        }}
        onPointerMove={(event) => {
          if (!dragging && !event.currentTarget.hasPointerCapture(event.pointerId)) {
            return;
          }
          onWidthDrag?.(event.clientX);
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      />
    </motion.aside>
  );
}
