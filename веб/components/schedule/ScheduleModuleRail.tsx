"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { StudioModule } from "@/components/studio/modules";
import {
  TreeFolder,
  TreeItem,
  TreeView,
} from "@/components/ui/animated-file-tree";
import type { ReadyPost } from "@/lib/schedule/ready-posts";
import {
  formatSlotLabelRu,
  type ScheduleFileV1,
  slotForPost,
} from "@/lib/schedule/storage";

const SLOT_SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

type ScheduleModuleRailProps = {
  modules: StudioModule[];
  postsByModule: Record<string, ReadyPost[]>;
  file: ScheduleFileV1;
  selectedPostId: string | null;
  onSelectPost: (post: ReadyPost) => void;
  onClearSlot: (postId: string) => void;
  /** C-103 — controlled width on desktop. */
  widthPx?: number;
};

export function ScheduleModuleRail({
  modules,
  postsByModule,
  file,
  selectedPostId,
  onSelectPost,
  onClearSlot,
  widthPx,
}: ScheduleModuleRailProps) {
  const reduceMotion = useReducedMotion();

  return (
    <aside
      data-testid="schedule-module-rail"
      style={
        widthPx
          ? { width: widthPx, minWidth: widthPx, maxWidth: widthPx }
          : undefined
      }
      className="flex h-full min-h-[28rem] w-full flex-col overflow-hidden rounded-xl border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] backdrop-blur-md lg:w-[22rem] lg:shrink-0"
    >
      <div className="border-b border-[var(--border-glass)] px-4 py-3">
        <p className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-[0.16em] text-[var(--text-mono)]">
          Очередь
        </p>
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Модули студии
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <TreeView selectedId={selectedPostId}>
          {modules.map((mod) => {
            const posts = postsByModule[mod.id] ?? [];
            return (
              <TreeFolder
                key={mod.id}
                value={mod.id}
                defaultOpen={false}
                label={
                  <span className="min-w-0 whitespace-normal break-words text-wrap">
                    {mod.label}
                  </span>
                }
              >
                {posts.length === 0 ? (
                  <p className="px-1 py-1 text-xs text-[var(--text-muted)]">
                    Нет готовых постов
                  </p>
                ) : (
                  posts
                    .filter((post) => {
                      /** C-96 — past-day slots = published → hide from rail. */
                      const slot = slotForPost(file, post.id);
                      if (!slot) return true;
                      const day = new Date(slot.startsAt);
                      if (Number.isNaN(day.getTime())) return true;
                      const start = new Date(
                        day.getFullYear(),
                        day.getMonth(),
                        day.getDate(),
                      );
                      const today = new Date();
                      const todayStart = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate(),
                      );
                      return start >= todayStart;
                    })
                    .map((post) => {
                    const slot = slotForPost(file, post.id);
                    return (
                      <div key={post.id} className="mb-1">
                        <TreeItem
                          value={post.id}
                          testId="schedule-ready-post"
                          dataPostId={post.id}
                          dataModuleId={post.moduleId}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData(
                              "application/x-cf-ready-post",
                              JSON.stringify({
                                postId: post.id,
                                moduleId: post.moduleId,
                              }),
                            );
                            e.dataTransfer.effectAllowed = "copy";
                          }}
                          onSelect={() => onSelectPost(post)}
                        >
                          <span
                            data-post-id={post.id}
                            data-module-id={post.moduleId}
                            className="flex flex-col"
                          >
                            <span className="whitespace-normal break-words text-wrap text-sm font-medium">
                              {post.title}
                            </span>
                            <span className="mt-1 min-h-[1.125rem]">
                              <AnimatePresence mode="wait" initial={false}>
                                {slot ? (
                                  <motion.span
                                    key={`slot-${slot.startsAt}`}
                                    data-testid="schedule-slot-label"
                                    className="block font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--accent-gold)]"
                                    initial={
                                      reduceMotion
                                        ? false
                                        : { opacity: 0, y: 6, scale: 0.97 }
                                    }
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={
                                      reduceMotion
                                        ? { opacity: 1 }
                                        : { opacity: 0, y: -4, scale: 0.98 }
                                    }
                                    transition={
                                      reduceMotion
                                        ? { duration: 0 }
                                        : SLOT_SPRING
                                    }
                                  >
                                    {formatSlotLabelRu(slot.startsAt)}
                                  </motion.span>
                                ) : (
                                  <motion.span
                                    key="empty"
                                    className="block text-[11px] text-[var(--text-muted)]"
                                    initial={
                                      reduceMotion ? false : { opacity: 0 }
                                    }
                                    animate={{ opacity: 1 }}
                                    exit={
                                      reduceMotion
                                        ? { opacity: 1 }
                                        : { opacity: 0 }
                                    }
                                    transition={
                                      reduceMotion
                                        ? { duration: 0 }
                                        : { duration: 0.15 }
                                    }
                                  >
                                    Слот не назначен
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </span>
                          </span>
                        </TreeItem>
                        {slot ? (
                          <button
                            type="button"
                            onClick={() => onClearSlot(post.id)}
                            className="mt-0.5 px-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--accent-terracotta)]"
                          >
                            Снять слот
                          </button>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </TreeFolder>
            );
          })}
        </TreeView>
      </div>
    </aside>
  );
}
