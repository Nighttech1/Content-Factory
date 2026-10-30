"use client";

import { useEffect, useState } from "react";
import { LuxuryDatetimePicker } from "@/components/ui/luxury-datetime";
import { PlatformCarouselPicker } from "@/components/ui/platform-carousel-picker";
import {
  formatSlotLabelRu,
  readScheduleFromStorage,
  upsertSlot,
  writeScheduleToStorage,
} from "@/lib/schedule/storage";
import {
  CAROUSEL_ENGINE_MODULE_ID,
  type CarouselDraft,
} from "@/lib/studio/carousel-draft-types";
import {
  readPlatformsFromStorage,
  type PublishPlatform,
} from "@/lib/settings/platforms";

type RazborPublisherPaneProps = {
  postId: string;
  draft?: CarouselDraft | null;
  onEnsureDraft?: (draft: CarouselDraft) => void;
};

export function RazborPublisherPane({
  postId,
  draft,
  onEnsureDraft,
}: RazborPublisherPaneProps) {
  const [iso, setIso] = useState<string | undefined>(undefined);
  const [platformId, setPlatformId] = useState<string | undefined>(undefined);
  const [platforms, setPlatforms] = useState<PublishPlatform[]>([]);

  useEffect(() => {
    setPlatforms(readPlatformsFromStorage());
    const file = readScheduleFromStorage();
    const slot = file.slots.find((s) => s.postId === postId);
    setIso(slot?.startsAt);
    setPlatformId(slot?.platformId);
  }, [postId]);

  function persistSlot(nextIso: string, nextPlatform?: string) {
    if (draft && onEnsureDraft) {
      onEnsureDraft({
        ...draft,
        id: draft.id || postId,
        updatedAt: new Date().toISOString(),
      });
    }
    const file = readScheduleFromStorage();
    const id = draft?.id ?? postId;
    writeScheduleToStorage(
      upsertSlot(file, {
        postId: id,
        moduleId: CAROUSEL_ENGINE_MODULE_ID,
        startsAt: nextIso,
        platformId: nextPlatform ?? platformId,
      }),
    );
  }

  function persist(nextIso: string) {
    setIso(nextIso);
    persistSlot(nextIso, platformId);
  }

  function onPlatform(nextId: string) {
    setPlatformId(nextId);
    if (iso) persistSlot(iso, nextId);
  }

  return (
    <div data-testid="razbor-publisher-pane" className="flex flex-col gap-3">
      <p className="text-sm text-[var(--text-primary)]">
        Публицист следует календарю: день, время и площадка здесь = слот в
        Расписании (очередь HITL, без автопубликации).
      </p>
      <LuxuryDatetimePicker valueIso={iso} onChangeIso={persist} />
      <div className="flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-wider text-[var(--text-mono)]">
          Площадка
        </span>
        <PlatformCarouselPicker
          platforms={platforms}
          value={platformId}
          onChange={onPlatform}
          testId="razbor-publisher-platform"
        />
      </div>
      {iso ? (
        <p className="font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--accent-gold)]">
          Слот: {formatSlotLabelRu(iso)}
        </p>
      ) : (
        <p className="text-[11px] text-[var(--text-muted)]">Слот не назначен</p>
      )}
    </div>
  );
}
