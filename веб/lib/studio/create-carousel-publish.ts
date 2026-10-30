/**
 * C-carousel-publish / C-drafts-always D-da-2 — Create «Опубликовать».
 * Always upsertDraft (same draft id as draw) + schedule slot.
 * No silent IG / social publish.
 */

"use client";

import {
  readScheduleFromStorage,
  upsertSlot,
  writeScheduleToStorage,
} from "@/lib/schedule/storage";
import {
  CAROUSEL_ENGINE_MODULE_ID,
  type CarouselDraft,
} from "@/lib/studio/carousel-draft-types";
import { useCarouselDraftsStore } from "@/lib/studio/carousel-drafts-store";

export type PublishCreateCarouselInput = {
  draft: CarouselDraft;
  startsAt: string;
  platformId?: string;
};

export type PublishCreateCarouselResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Persist Create carousel draft + calendar slot (HITL queue only).
 */
export function publishCreateCarousel(
  input: PublishCreateCarouselInput,
): PublishCreateCarouselResult {
  const draft = input.draft;
  if (!draft?.id?.trim()) {
    return { ok: false, error: "Нет черновика карусели." };
  }
  if (!Array.isArray(draft.slides) || draft.slides.length === 0) {
    return {
      ok: false,
      error: "Сначала нарисуйте слайды, затем публикуйте.",
    };
  }
  const startsAt =
    typeof input.startsAt === "string" ? input.startsAt.trim() : "";
  if (!startsAt || !Number.isFinite(Date.parse(startsAt))) {
    return { ok: false, error: "Укажите дату и время публикации." };
  }

  const now = new Date().toISOString();
  const nextDraft: CarouselDraft = {
    ...draft,
    id: draft.id.trim(),
    status: "unpublished",
    updatedAt: now,
    createdAt: draft.createdAt || now,
  };

  try {
    useCarouselDraftsStore.getState().upsertDraft(nextDraft);
    const file = readScheduleFromStorage();
    writeScheduleToStorage(
      upsertSlot(file, {
        postId: nextDraft.id,
        moduleId: CAROUSEL_ENGINE_MODULE_ID,
        startsAt,
        platformId: input.platformId?.trim() || undefined,
      }),
    );
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Не удалось сохранить черновик или слот. Попробуйте ещё раз.",
    };
  }
}
