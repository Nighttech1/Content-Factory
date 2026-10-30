"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Clapperboard,
  Globe,
  Layers,
  MonitorPlay,
  Send,
  Video,
} from "lucide-react";
import {
  MultiButton,
  type MultiButtonItem,
} from "@/components/ui/multi-button";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

function formatSyncStamp(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}.${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(-2)}`;
}

type AnalyticsHeaderProps = {
  contentTypeId: string;
  platformId: string;
  onContentTypeChange: (id: string) => void;
  onPlatformChange: (id: string) => void;
};

/**
 * C-98 chrome cleanup + C-100 dual filter MultiButtons.
 */
export function AnalyticsHeader({
  contentTypeId,
  platformId,
  onContentTypeChange,
  onPlatformChange,
}: AnalyticsHeaderProps) {
  const reduceMotion = useReducedMotion();
  const [syncedAt, setSyncedAt] = useState(formatSyncStamp);

  useEffect(() => {
    setSyncedAt(formatSyncStamp());
  }, []);

  const contentItems: MultiButtonItem[] = useMemo(
    () => [
      {
        id: "all",
        icon: Layers,
        label: "Все типы",
        onClick: () => onContentTypeChange("all"),
        className:
          contentTypeId === "all"
            ? "bg-[color-mix(in_srgb,var(--accent-blue)_18%,transparent)]"
            : undefined,
      },
      {
        id: "reels",
        icon: Clapperboard,
        label: "Рилсы",
        onClick: () => onContentTypeChange("reels"),
        className:
          contentTypeId === "reels"
            ? "bg-[color-mix(in_srgb,var(--accent-blue)_18%,transparent)]"
            : undefined,
      },
      {
        id: "carousel",
        icon: Layers,
        label: "Карусели",
        onClick: () => onContentTypeChange("carousel"),
        className:
          contentTypeId === "carousel"
            ? "bg-[color-mix(in_srgb,var(--accent-blue)_18%,transparent)]"
            : undefined,
      },
      {
        id: "shorts",
        icon: Video,
        label: "Shorts",
        onClick: () => onContentTypeChange("shorts"),
        className:
          contentTypeId === "shorts"
            ? "bg-[color-mix(in_srgb,var(--accent-blue)_18%,transparent)]"
            : undefined,
      },
    ],
    [contentTypeId, onContentTypeChange],
  );

  const platformItems: MultiButtonItem[] = useMemo(
    () => [
      {
        id: "all",
        icon: Layers,
        label: "Все площадки",
        onClick: () => onPlatformChange("all"),
        className:
          platformId === "all"
            ? "bg-[color-mix(in_srgb,var(--accent-gold)_18%,transparent)]"
            : undefined,
      },
      {
        id: "instagram",
        icon: Globe,
        label: "Instagram",
        onClick: () => onPlatformChange("instagram"),
        className:
          platformId === "instagram"
            ? "bg-[color-mix(in_srgb,var(--accent-gold)_18%,transparent)]"
            : undefined,
      },
      {
        id: "tiktok",
        icon: Video,
        label: "TikTok",
        onClick: () => onPlatformChange("tiktok"),
        className:
          platformId === "tiktok"
            ? "bg-[color-mix(in_srgb,var(--accent-gold)_18%,transparent)]"
            : undefined,
      },
      {
        id: "youtube",
        icon: MonitorPlay,
        label: "YouTube",
        onClick: () => onPlatformChange("youtube"),
        className:
          platformId === "youtube"
            ? "bg-[color-mix(in_srgb,var(--accent-gold)_18%,transparent)]"
            : undefined,
      },
      {
        id: "telegram",
        icon: Send,
        label: "Telegram",
        onClick: () => onPlatformChange("telegram"),
        className:
          platformId === "telegram"
            ? "bg-[color-mix(in_srgb,var(--accent-gold)_18%,transparent)]"
            : undefined,
      },
    ],
    [onPlatformChange, platformId],
  );

  return (
    <motion.header
      className="flex flex-col gap-4 pb-1"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : SPRING}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-2xl flex-col gap-2">
          <h1 className="font-[family-name:var(--font-ui)] text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
            Самообучающаяся диагностика
          </h1>
          <p className="font-[family-name:var(--font-ui)] text-sm leading-relaxed text-[var(--text-primary)]">
            Разведка ниши, аномалии конкурентов и удержание — экран, где фабрика
            смотрит телеметрию опубликованного контента.
          </p>
        </div>

        <div
          data-testid="analytics-filters"
          className="flex shrink-0 flex-col gap-2"
        >
          <MultiButton
            items={contentItems}
            variant="outline"
            size="sm"
            highlightColor="var(--accent-blue-bright)"
          />
          <MultiButton
            items={platformItems}
            variant="outline"
            size="sm"
            highlightColor="var(--accent-gold)"
          />
        </div>
      </div>

      <button
        type="button"
        data-testid="analytics-sync"
        onClick={() => setSyncedAt(formatSyncStamp())}
        className="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-elevated)] px-3 py-2 font-[family-name:var(--font-ui)] text-xs text-[var(--text-primary)] transition-colors hover:border-[var(--border-active)]"
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-blue-bright)]"
          aria-hidden
        />
        Синхронизация:{" "}
        <strong className="font-semibold tabular-nums">{syncedAt}</strong>
      </button>
    </motion.header>
  );
}
