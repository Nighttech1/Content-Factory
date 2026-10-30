"use client";

import {
  BarChart2,
  Binoculars,
  Clapperboard,
  Dumbbell,
  Eye,
  Palette,
  PenLine,
  Search,
  Send,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { AgentRoleKind } from "@/lib/mesh-roles";

const BADGE_SPRING = { type: "spring" as const, damping: 24, stiffness: 380 };

type AgentProfessionAvatarProps = {
  packId?: string;
  label: string;
  roleKind?: AgentRoleKind;
  className?: string;
};

type ProfessionSpec = {
  Icon: LucideIcon;
  Acc: LucideIcon;
  accent: string;
  ring: string;
  /** C-125 — Trainer barbell badge (bottom-right). */
  barbell?: boolean;
};

function resolveProfession(
  packId: string | undefined,
  label: string,
  roleKind?: AgentRoleKind,
): ProfessionSpec {
  if (roleKind === "user" || packId === "user") {
    return {
      Icon: UserRound,
      Acc: PenLine,
      accent: "text-[var(--text-primary)]",
      ring: "from-[color-mix(in_srgb,var(--text-muted)_35%,transparent)]",
    };
  }
  if (roleKind === "trainer" || packId === "team-trainer") {
    return {
      Icon: UserRound,
      Acc: Dumbbell,
      accent: "text-[#34d399]",
      ring: "from-[color-mix(in_srgb,#34d399_35%,transparent)]",
      barbell: true,
    };
  }
  if (roleKind === "scout" || packId === "scout") {
    return {
      Icon: UserRound,
      Acc: Binoculars,
      accent: "text-[var(--accent-gold)]",
      ring: "from-[color-mix(in_srgb,var(--accent-gold)_35%,transparent)]",
    };
  }
  if (roleKind === "analyst" || packId === "analyst") {
    return {
      Icon: UserRound,
      Acc: BarChart2,
      accent: "text-[var(--accent-blue-bright)]",
      ring: "from-[color-mix(in_srgb,var(--accent-blue-bright)_35%,transparent)]",
    };
  }

  const key = `${packId ?? ""} ${label}`.toLowerCase();
  if (key.includes("scout") || key.includes("скаут") || key.includes("research")) {
    return {
      Icon: UserRound,
      Acc: Binoculars,
      accent: "text-[var(--accent-gold)]",
      ring: "from-[color-mix(in_srgb,var(--accent-gold)_35%,transparent)]",
    };
  }
  if (key.includes("team-trainer") || key.includes("тренер")) {
    return {
      Icon: UserRound,
      Acc: Dumbbell,
      accent: "text-[#34d399]",
      ring: "from-[color-mix(in_srgb,#34d399_35%,transparent)]",
      barbell: true,
    };
  }
  if (key.includes("analyst") || key.includes("аналит")) {
    return {
      Icon: UserRound,
      Acc: BarChart2,
      accent: "text-[var(--accent-blue-bright)]",
      ring: "from-[color-mix(in_srgb,var(--accent-blue-bright)_35%,transparent)]",
    };
  }
  if (
    key.includes("copywriter") ||
    key.includes("копирайт") ||
    key.includes("script") ||
    key.includes("сценарист")
  ) {
    return {
      Icon: UserRound,
      Acc: PenLine,
      accent: "text-[var(--accent-blue-bright)]",
      ring: "from-[color-mix(in_srgb,var(--accent-blue-bright)_35%,transparent)]",
    };
  }
  if (
    key.includes("art-director") ||
    key.includes("арт-директор") ||
    key.includes("арт директор")
  ) {
    return {
      Icon: UserRound,
      Acc: Eye,
      accent: "text-[#f472b6]",
      ring: "from-[color-mix(in_srgb,#f472b6_35%,transparent)]",
    };
  }
  if (key.includes("design") || key.includes("дизайн") || key.includes("редактор") || key.includes("монтаж")) {
    return {
      Icon: UserRound,
      Acc: Palette,
      accent: "text-[#c084fc]",
      ring: "from-[color-mix(in_srgb,#c084fc_35%,transparent)]",
    };
  }
  if (key.includes("publish") || key.includes("публиц")) {
    return {
      Icon: UserRound,
      Acc: Send,
      accent: "text-[#34d399]",
      ring: "from-[color-mix(in_srgb,#34d399_35%,transparent)]",
    };
  }
  if (key.includes("razbor") || key.includes("разбор") || key.includes("hook")) {
    return {
      Icon: UserRound,
      Acc: Search,
      accent: "text-[var(--accent-terracotta)]",
      ring: "from-[color-mix(in_srgb,var(--accent-terracotta)_35%,transparent)]",
    };
  }
  if (key.includes("reel") || key.includes("video") || key.includes("heygen") || key.includes("cartoon")) {
    return {
      Icon: UserRound,
      Acc: Clapperboard,
      accent: "text-[var(--accent-blue-bright)]",
      ring: "from-[color-mix(in_srgb,var(--accent-blue-bright)_35%,transparent)]",
    };
  }
  return {
    Icon: UserRound,
    Acc: Sparkles,
    accent: "text-[var(--accent-gold)]",
    ring: "from-[color-mix(in_srgb,var(--accent-gold)_30%,transparent)]",
  };
}

/** C-95 / C-125 — human silhouette + profession accessory; Trainer = Dumbbell barbell. */
export function AgentProfessionAvatar({
  packId,
  label,
  roleKind,
  className,
}: AgentProfessionAvatarProps) {
  const reduceMotion = useReducedMotion();
  const { Icon, Acc, accent, ring, barbell } = resolveProfession(
    packId,
    label,
    roleKind,
  );
  return (
    <span
      data-testid="agent-profession-avatar"
      data-barbell={barbell ? "true" : undefined}
      className={cn(
        "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
        "bg-gradient-to-br to-[var(--bg-elevated)]",
        ring,
        "border border-[var(--border-glass)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        className,
      )}
      aria-hidden
    >
      <Icon className={cn("h-6 w-6", accent)} strokeWidth={1.75} />
      <motion.span
        data-testid={barbell ? "trainer-barbell-badge" : undefined}
        className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-md border border-[var(--border-glass)] bg-[var(--bg-card)] shadow-md"
        initial={
          reduceMotion || !barbell ? false : { opacity: 0, scale: 0.92 }
        }
        animate={{ opacity: 1, scale: 1 }}
        transition={
          reduceMotion || !barbell ? { duration: 0 } : BADGE_SPRING
        }
      >
        <Acc className={cn("h-3 w-3", accent)} strokeWidth={2.25} />
      </motion.span>
    </span>
  );
}
