"use client";

import { useMemo } from "react";
import { LayoutGrid, Trash2 } from "lucide-react";
import { FeedPostCard } from "@/components/studio/workspace/FeedPostCard";
import { cn } from "@/lib/cn";
import {
  boardToFeedPost,
  useBoardsStore,
  type BoardCarousel,
} from "@/lib/studio/boards-store";
import type { FeedPost } from "@/lib/studio/feed-types";
import type {
  FeedPostCardAspect,
  FeedPostCardLayout,
} from "@/components/studio/workspace/FeedPostCard";

type BoardsPanelProps = {
  aspectRatio?: FeedPostCardAspect;
  layout?: FeedPostCardLayout;
  moduleId?: string;
  onRazborClick?: (post: FeedPost) => void;
  /** S50: focus single board from dropdown (null = all). */
  activeBoardId?: string | null;
  searchQuery?: string;
};

/**
 * S49/S50 — Boards grid. Upload + dropdown live in VerticalPostCarousel header.
 * Cards: no plaque, no engagement metrics.
 */
export function BoardsPanel({
  aspectRatio = "4/5",
  layout = "grid",
  moduleId,
  onRazborClick,
  activeBoardId = null,
  searchQuery = "",
}: BoardsPanelProps) {
  const boards = useBoardsStore((s) => s.boards);
  const removeBoard = useBoardsStore((s) => s.removeBoard);

  const visible = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = boards;
    if (activeBoardId) {
      list = list.filter((b) => b.id === activeBoardId);
    }
    if (q) {
      list = list.filter((b) => b.title.toLowerCase().includes(q));
    }
    return list;
  }, [boards, activeBoardId, searchQuery]);

  function openRazbor(board: BoardCarousel) {
    onRazborClick?.(boardToFeedPost(board));
  }

  return (
    <div
      data-testid="boards-panel"
      className="col-span-2 flex flex-col gap-2 px-1 pb-0"
    >
      {visible.length === 0 ? (
        <div
          data-testid="boards-empty"
          className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--border-glass)] px-4 py-10 text-center"
        >
          <LayoutGrid className="h-8 w-8 text-[var(--text-muted)]" aria-hidden />
          <p className="font-[family-name:var(--font-century-gothic)] text-sm text-[var(--text-muted)]">
            Выберите доску или нажмите «Загрузить» / «Создать доску»
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 content-start items-start gap-2">
          {visible.map((board, index) => {
            const post = boardToFeedPost(board);
            return (
              <div key={board.id} className="relative" data-testid="boards-card">
                <button
                  type="button"
                  aria-label={`Удалить ${board.title}`}
                  data-testid="boards-remove-btn"
                  onClick={() => removeBoard(board.id)}
                  className={cn(
                    "absolute right-1.5 top-1.5 z-20 flex h-7 w-7 items-center justify-center",
                    "rounded-full border border-[var(--border-glass)] bg-[rgba(8,9,10,0.75)] text-white",
                    "hover:bg-[rgba(8,9,10,0.9)]",
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <FeedPostCard
                  post={post}
                  index={index}
                  aspectRatio={aspectRatio}
                  layout={layout}
                  moduleId={moduleId}
                  showRazborButton={Boolean(onRazborClick)}
                  onRazborClick={() => openRazbor(board)}
                  showUsernamePlaque={false}
                  showEngagement={false}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
