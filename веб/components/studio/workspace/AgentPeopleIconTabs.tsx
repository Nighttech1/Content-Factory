"use client";

import { AgentProfessionAvatar } from "@/components/mesh/nodes/AgentProfessionAvatar";
import { cn } from "@/lib/cn";
import type { AgentRoleKind } from "@/lib/mesh-roles";

export type AgentPeopleTabItem = {
  id: string;
  label: string;
  packId?: string;
  roleKind?: AgentRoleKind;
  /** Status mark shown after label (… / ✓). */
  mark?: string;
  active?: boolean;
  testId?: string;
  onClick: () => void;
};

type AgentPeopleIconTabsProps = {
  items: AgentPeopleTabItem[];
  ariaLabel: string;
  className?: string;
  testId?: string;
};

/**
 * C-razbor-create-modal-s47 — top agent switcher:
 * 4 rounded people icons (release-team avatars) + labels below.
 * Not CompactMultiButton / floating chrome.
 */
export function AgentPeopleIconTabs({
  items,
  ariaLabel,
  className,
  testId = "agent-people-icon-tabs",
}: AgentPeopleIconTabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      data-testid={testId}
      className={cn(
        "flex shrink-0 flex-wrap items-start justify-center gap-3 px-2 py-2",
        "font-[family-name:var(--font-century-gothic)]",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = Boolean(item.active);
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-testid={item.testId ?? `agent-people-tab-${item.id}`}
            onClick={item.onClick}
            className={cn(
              "group flex w-[4.5rem] flex-col items-center gap-1.5 rounded-xl px-1 py-1.5",
              "transition-[background-color,box-shadow,transform] duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]",
              isActive
                ? "bg-[color-mix(in_srgb,var(--accent-gold)_14%,transparent)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent-gold)_40%,transparent)]"
                : "hover:bg-[rgba(255,255,255,0.04)]",
            )}
          >
            <AgentProfessionAvatar
              packId={item.packId}
              label={item.label}
              roleKind={item.roleKind}
              className={cn(
                "h-11 w-11 rounded-full",
                isActive &&
                  "ring-2 ring-[color-mix(in_srgb,var(--accent-gold)_55%,transparent)]",
              )}
            />
            <span
              className={cn(
                "max-w-full truncate text-center text-[10px] leading-tight tracking-wide",
                isActive
                  ? "text-[var(--accent-gold)]"
                  : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]",
              )}
            >
              {item.label}
              {item.mark ? ` ${item.mark}` : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
