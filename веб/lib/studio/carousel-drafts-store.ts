"use client";

/**
 * C-30 / C-155 D4 / C-s8-06 — Carousel drafts.
 * SoT = POST/GET /api/studio/drafts; zustand = memory cache.
 * selectedDraftId stays local (cf.carousel.selectedDraftId).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CarouselDraft } from "@/lib/studio/carousel-draft-types";
import {
  apiDeleteDraft,
  apiListDrafts,
  apiPatchDraft,
  apiUpsertDraft,
} from "@/lib/studio/sprint8-client";
import {
  SELECTED_DRAFT_ID_KEY,
  ensureSprint8Migrated,
  emitSprint8Hydrated,
} from "@/lib/studio/sprint8-migrate";

export const CAROUSEL_DRAFTS_STORAGE_KEY = "cf.carousel.drafts.v1";

type CarouselDraftsState = {
  drafts: CarouselDraft[];
  selectedDraftId: string | null;
  hydratedFromApi: boolean;
  upsertDraft: (draft: CarouselDraft) => void;
  updateDraft: (
    id: string,
    patch: Partial<Pick<CarouselDraft, "title" | "scenario" | "slides">>,
  ) => void;
  removeDraft: (id: string) => void;
  selectDraft: (id: string | null) => void;
  getDraft: (id: string) => CarouselDraft | undefined;
  hydrateFromApi: () => Promise<void>;
};

function readLocalSelectedDraftId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SELECTED_DRAFT_ID_KEY);
    return raw && raw.trim() ? raw.trim() : null;
  } catch {
    return null;
  }
}

function writeLocalSelectedDraftId(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!id) {
      window.localStorage.removeItem(SELECTED_DRAFT_ID_KEY);
      return;
    }
    window.localStorage.setItem(SELECTED_DRAFT_ID_KEY, id);
  } catch {
    /* quota */
  }
}

let hydratePromise: Promise<void> | null = null;

export const useCarouselDraftsStore = create<CarouselDraftsState>()(
  persist(
    (set, get) => ({
      drafts: [],
      selectedDraftId: null,
      hydratedFromApi: false,

      upsertDraft: (draft) => {
        set((state) => {
          const idx = state.drafts.findIndex((d) => d.id === draft.id);
          if (idx === -1) {
            return {
              drafts: [draft, ...state.drafts],
              selectedDraftId: draft.id,
            };
          }
          const next = state.drafts.slice();
          next[idx] = {
            ...next[idx],
            ...draft,
            updatedAt: draft.updatedAt || new Date().toISOString(),
          };
          return { drafts: next, selectedDraftId: draft.id };
        });
        writeLocalSelectedDraftId(draft.id);
        void apiUpsertDraft(draft);
      },

      updateDraft: (id, patch) => {
        set((state) => {
          const idx = state.drafts.findIndex((d) => d.id === id);
          if (idx === -1) return state;
          const next = state.drafts.slice();
          next[idx] = {
            ...next[idx],
            ...patch,
            updatedAt: new Date().toISOString(),
          };
          return { drafts: next };
        });
        void apiPatchDraft(id, patch);
      },

      removeDraft: (id) => {
        set((state) => {
          const drafts = state.drafts.filter((d) => d.id !== id);
          const selectedDraftId =
            state.selectedDraftId === id
              ? drafts[0]?.id ?? null
              : state.selectedDraftId;
          writeLocalSelectedDraftId(selectedDraftId);
          return { drafts, selectedDraftId };
        });
        void apiDeleteDraft(id);
      },

      selectDraft: (id) => {
        set({ selectedDraftId: id });
        writeLocalSelectedDraftId(id);
      },

      getDraft: (id) => get().drafts.find((d) => d.id === id),

      hydrateFromApi: async () => {
        if (hydratePromise) return hydratePromise;
        hydratePromise = (async () => {
          await ensureSprint8Migrated();
          const drafts = await apiListDrafts("carousel-engine");
          if (!drafts) {
            set({ hydratedFromApi: true });
            return;
          }
          const selected =
            readLocalSelectedDraftId() ?? get().selectedDraftId;
          const selectedDraftId =
            selected && drafts.some((d) => d.id === selected)
              ? selected
              : drafts[0]?.id ?? null;
          set({
            drafts,
            selectedDraftId,
            hydratedFromApi: true,
          });
          writeLocalSelectedDraftId(selectedDraftId);
          emitSprint8Hydrated("drafts");
        })().finally(() => {
          hydratePromise = null;
        });
        return hydratePromise;
      },
    }),
    {
      name: CAROUSEL_DRAFTS_STORAGE_KEY,
      /** Offline cache only — SoT is API after hydrate. */
      partialize: (state) => ({
        drafts: state.drafts,
        selectedDraftId: state.selectedDraftId,
      }),
      onRehydrateStorage: () => (state) => {
        if (typeof window === "undefined") return;
        const localSelected = readLocalSelectedDraftId();
        if (localSelected && state) {
          state.selectedDraftId = localSelected;
        }
        void useCarouselDraftsStore.getState().hydrateFromApi();
      },
    },
  ),
);

/** Kick hydrate when persist middleware did not run (SSR→client edge). */
if (typeof window !== "undefined") {
  queueMicrotask(() => {
    void useCarouselDraftsStore.getState().hydrateFromApi();
  });
}
