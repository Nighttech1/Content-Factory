/**
 * S48/S50 / C-s8-06 — Boards uploads (Competitors column).
 * SoT = /api/studio/boards (+ upload); zustand = memory cache.
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FeedPost } from "@/lib/studio/feed-types";
import {
  apiDeleteBoard,
  apiListBoards,
  apiPatchBoard,
  apiUploadBoardSlides,
  apiUpsertBoard,
} from "@/lib/studio/sprint8-client";
import {
  ensureSprint8Migrated,
  emitSprint8Hydrated,
} from "@/lib/studio/sprint8-migrate";

export type BoardCarousel = {
  id: string;
  createdAt: number;
  /** Storage URLs after Sprint 8; data:/blob: only transient before upload */
  slideUrls: string[];
  title: string;
};

type BoardsState = {
  boards: BoardCarousel[];
  hydratedFromApi: boolean;
  addBoard: (slides: string[], title?: string) => BoardCarousel;
  removeBoard: (id: string) => void;
  renameBoard: (id: string, title: string) => void;
  hydrateFromApi: () => Promise<void>;
};

function uniqueBoardTitle(existing: BoardCarousel[], base: string): string {
  const trimmed = base.trim() || "Новая доска";
  const taken = new Set(existing.map((b) => b.title.toLowerCase()));
  if (!taken.has(trimmed.toLowerCase())) return trimmed;
  let n = 2;
  while (taken.has(`${trimmed} (${n})`.toLowerCase())) n += 1;
  return `${trimmed} (${n})`;
}

let hydratePromise: Promise<void> | null = null;

export const useBoardsStore = create<BoardsState>()(
  persist(
    (set, get) => ({
      boards: [],
      hydratedFromApi: false,

      addBoard: (slides, title) => {
        const boards = get().boards;
        const board: BoardCarousel = {
          id: `board-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: Date.now(),
          slideUrls: slides.filter(Boolean),
          title: uniqueBoardTitle(boards, title?.trim() || "Новая доска"),
        };
        set({ boards: [board, ...boards] });

        void (async () => {
          const urls = await apiUploadBoardSlides(board.slideUrls);
          const persisted = await apiUpsertBoard({
            ...board,
            slideUrls: urls.length > 0 ? urls : board.slideUrls,
          });
          if (!persisted) return;
          set({
            boards: get().boards.map((b) =>
              b.id === board.id ? { ...b, ...persisted } : b,
            ),
          });
        })();

        return board;
      },

      removeBoard: (id) => {
        set({ boards: get().boards.filter((b) => b.id !== id) });
        void apiDeleteBoard(id);
      },

      renameBoard: (id, title) => {
        const next = title.trim();
        if (!next) return;
        set({
          boards: get().boards.map((b) =>
            b.id === id ? { ...b, title: next } : b,
          ),
        });
        void apiPatchBoard(id, { title: next });
      },

      hydrateFromApi: async () => {
        if (hydratePromise) return hydratePromise;
        hydratePromise = (async () => {
          await ensureSprint8Migrated();
          const boards = await apiListBoards();
          if (!boards) {
            set({ hydratedFromApi: true });
            return;
          }
          set({ boards, hydratedFromApi: true });
          emitSprint8Hydrated("boards");
        })().finally(() => {
          hydratePromise = null;
        });
        return hydratePromise;
      },
    }),
    {
      name: "cf.studio.boards.v1",
      partialize: (state) => ({ boards: state.boards }),
      onRehydrateStorage: () => () => {
        if (typeof window === "undefined") return;
        void useBoardsStore.getState().hydrateFromApi();
      },
    },
  ),
);

if (typeof window !== "undefined") {
  queueMicrotask(() => {
    void useBoardsStore.getState().hydrateFromApi();
  });
}

/** Map a local board to FeedPost so RazborModal can open unchanged. */
export function boardToFeedPost(board: BoardCarousel): FeedPost {
  return {
    id: board.id,
    source: "competitor",
    title: board.title,
    thumbUrl: board.slideUrls[0],
    slideUrls: board.slideUrls,
    metrics: {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
    },
    sourceMode: "mock",
    /* S49: board cards have no plaque — omit username/followers */
    mediaType: board.slideUrls.length > 1 ? "CAROUSEL_ALBUM" : "IMAGE",
  };
}
