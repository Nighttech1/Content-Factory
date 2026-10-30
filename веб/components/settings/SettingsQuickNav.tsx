"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  FileText,
  Film,
  Images,
  KeyRound,
  Megaphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type SettingsNavSection = {
  id: string;
  label: string;
  icon: LucideIcon;
};

/** C-144 + S55/S56 — Design → Brand → Персонажи (API id landscapes) → … (no Scout / Agents / LLM). */
export const SETTINGS_NAV_SECTIONS: SettingsNavSection[] = [
  { id: "settings-design", label: "Дизайн", icon: FileText },
  { id: "settings-brand", label: "Бренд", icon: Sparkles },
  { id: "settings-landscapes", label: "Персонажи", icon: Images },
  { id: "settings-platforms", label: "Площадки", icon: KeyRound },
  { id: "settings-schedule", label: "Расписание", icon: CalendarDays },
  { id: "settings-publicist", label: "Публицист", icon: Megaphone },
  { id: "settings-reels", label: "Рилсы", icon: Film },
];

const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };

/**
 * C-85 — Floating Motion TOC for Settings (Dark Luxury).
 */
export function SettingsQuickNav() {
  const reduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState(
    SETTINGS_NAV_SECTIONS[0]!.id,
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );
    for (const { id } of SETTINGS_NAV_SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  function scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (!element) return;
    const y =
      element.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: y, behavior: "smooth" });
    setActiveSection(id);
  }

  return (
    <>
      <aside
        data-testid="settings-quick-nav"
        className="fixed top-24 right-6 z-40 hidden xl:block"
      >
        <nav className="rounded-2xl border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="mb-1 px-3 py-1.5 font-[family-name:var(--font-ui)] text-[10px] font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Навигация
          </div>
          <ul className="relative flex flex-col gap-1">
            {SETTINGS_NAV_SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              const Icon = section.icon;
              return (
                <li key={section.id} className="relative">
                  <button
                    type="button"
                    data-testid={`settings-toc-${section.id}`}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "relative z-10 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors",
                      isActive
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5",
                        isActive
                          ? "text-[var(--accent-gold)]"
                          : "text-[var(--text-mono)]",
                      )}
                    />
                    <span>{section.label}</span>
                  </button>
                  {isActive ? (
                    <motion.div
                      layoutId={
                        reduceMotion ? undefined : "settings-active-toc-pill"
                      }
                      transition={reduceMotion ? { duration: 0 } : SPRING}
                      className="absolute inset-0 z-0 rounded-xl border border-[color-mix(in_srgb,var(--accent-gold)_28%,transparent)] bg-[color-mix(in_srgb,var(--accent-gold)_12%,var(--bg-card))]"
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div
        data-testid="settings-quick-nav-mobile"
        className="mb-4 flex gap-1 overflow-x-auto xl:hidden"
      >
        {SETTINGS_NAV_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollToSection(section.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs",
              activeSection === section.id
                ? "border-[color-mix(in_srgb,var(--accent-gold)_40%,transparent)] text-[var(--accent-gold)]"
                : "border-[var(--border-glass)] text-[var(--text-muted)]",
            )}
          >
            {section.label}
          </button>
        ))}
      </div>
    </>
  );
}
