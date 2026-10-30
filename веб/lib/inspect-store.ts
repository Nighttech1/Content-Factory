"use client";

import { create } from "zustand";
import {
  createInspectDraft,
  type InspectDraft,
  type PersonaState,
  type PreviewMode,
} from "@/lib/inspect-mock";

type InspectActions = {
  hydrateDraft: (id: string) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  togglePlay: () => void;
  setCurrentTime: (timeSec: number) => void;
  reorderSlides: (orderedIds: string[]) => void;
  selectSlide: (slideId: string) => void;
  selectHook: (hookId: string) => void;
  setScript: (script: string) => void;
  setPersonaField: <K extends keyof PersonaState>(
    field: K,
    value: PersonaState[K],
  ) => void;
  rerollSelectedSlide: () => void;
  openApproveModal: () => void;
  confirmApproveSchedule: (scheduledAt: string) => void;
  cancelApproveModal: () => void;
};

export type InspectStore = InspectDraft & InspectActions;

function clampTime(value: number, duration: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(Math.max(value, 0), duration);
}

export const useInspectStore = create<InspectStore>((set, get) => ({
  ...createInspectDraft("demo"),

  hydrateDraft: (id) => {
    const current = get().id;
    if (current === (id || "demo") && get().slides.length > 0) return;
    set({ ...createInspectDraft(id || "demo") });
  },

  setPreviewMode: (mode) => set({ previewMode: mode }),

  togglePlay: () =>
    set((state) => ({
      reels: { ...state.reels, playing: !state.reels.playing },
    })),

  setCurrentTime: (timeSec) =>
    set((state) => ({
      reels: {
        ...state.reels,
        currentTimeSec: clampTime(timeSec, state.reels.durationSec),
        playing:
          timeSec >= state.reels.durationSec ? false : state.reels.playing,
      },
    })),

  reorderSlides: (orderedIds) =>
    set((state) => {
      const byId = new Map(state.slides.map((s) => [s.id, s]));
      const slides = orderedIds
        .map((id, index) => {
          const slide = byId.get(id);
          if (!slide) return null;
          return { ...slide, order: index };
        })
        .filter((s): s is NonNullable<typeof s> => s !== null);

      // Keep any slides missing from payload at the end (defensive).
      for (const slide of state.slides) {
        if (!orderedIds.includes(slide.id)) {
          slides.push({ ...slide, order: slides.length });
        }
      }

      return { slides };
    }),

  selectSlide: (slideId) => set({ selectedSlideId: slideId }),

  selectHook: (hookId) => set({ activeHookId: hookId }),

  setScript: (script) => set({ script }),

  setPersonaField: (field, value) =>
    set((state) => ({
      persona: { ...state.persona, [field]: value },
    })),

  rerollSelectedSlide: () =>
    set((state) => ({
      slides: state.slides.map((slide) =>
        slide.id === state.selectedSlideId
          ? { ...slide, version: slide.version + 1 }
          : slide,
      ),
    })),

  openApproveModal: () => set({ approveModalOpen: true }),

  confirmApproveSchedule: (scheduledAt) =>
    set({
      status: "scheduled",
      scheduledAt,
      approveModalOpen: false,
    }),

  cancelApproveModal: () => set({ approveModalOpen: false }),
}));
