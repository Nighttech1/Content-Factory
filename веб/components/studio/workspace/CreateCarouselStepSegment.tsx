"use client";

import { Check } from "lucide-react";
import { AgentProfessionAvatar } from "@/components/mesh/nodes/AgentProfessionAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export type CreateCarouselStepId =
  | "scriptwriter"
  | "designer"
  | "publication";

const STEPS: {
  id: CreateCarouselStepId;
  label: string;
  testId: string;
  packId: string;
  avatarLabel: string;
}[] = [
  {
    id: "scriptwriter",
    label: "Сценарист",
    testId: "create-step-scriptwriter",
    packId: "scriptwriter",
    avatarLabel: "Сценарист",
  },
  {
    id: "designer",
    label: "Дизайнер",
    testId: "create-step-designer",
    packId: "designer",
    avatarLabel: "Дизайнер",
  },
  {
    id: "publication",
    label: "Публикация",
    testId: "create-step-publication",
    packId: "publisher",
    avatarLabel: "Публицист",
  },
];

type CreateCarouselStepSegmentProps = {
  active: CreateCarouselStepId;
  handed: Partial<Record<CreateCarouselStepId, boolean>>;
  onSelect: (id: CreateCarouselStepId) => void;
  className?: string;
};

/**
 * C-carousel-chrome / S47 — top step segment (Button variants) retained (D-icons-1).
 * People icons from release team sit beside labels — not a CompactMultiButton replace.
 */
export function CreateCarouselStepSegment({
  active,
  handed,
  onSelect,
  className,
}: CreateCarouselStepSegmentProps) {
  return (
    <div
      role="tablist"
      aria-label="Шаги создания карусели"
      data-testid="create-carousel-segment"
      className={cn(
        "flex flex-wrap items-center gap-1.5 font-[family-name:var(--font-century-gothic)]",
        className,
      )}
    >
      {STEPS.map((step) => {
        const isActive = active === step.id;
        const isHanded = Boolean(handed[step.id]);
        return (
          <Button
            key={step.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-testid={step.testId}
            variant={isActive ? "gold" : "glass"}
            size="sm"
            onClick={() => onSelect(step.id)}
            className={cn(
              "min-w-0 gap-1.5",
              isActive &&
                "shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent-gold)_35%,transparent)]",
            )}
          >
            <AgentProfessionAvatar
              packId={step.packId}
              label={step.avatarLabel}
              className="!h-6 !w-6 rounded-full border-0 shadow-none"
            />
            <span>{step.label}</span>
            {isHanded ? (
              <Check
                className="h-3.5 w-3.5 text-[var(--accent-gold)]"
                aria-hidden
                data-testid={`create-tab-check-${step.id}`}
              />
            ) : null}
          </Button>
        );
      })}
    </div>
  );
}
