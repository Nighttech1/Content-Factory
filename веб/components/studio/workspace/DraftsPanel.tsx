"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  buildStoreZip,
  triggerBrowserDownload,
} from "@/lib/zip/store-zip";
import {
  emptyScheduleFile,
  formatSlotLabelRu,
  readScheduleFromStorage,
  slotForPost,
  type ScheduleFileV1,
} from "@/lib/schedule/storage";
import type { CarouselDraft } from "@/lib/studio/carousel-draft-types";
import { useCarouselDraftsStore } from "@/lib/studio/carousel-drafts-store";
import type {
  FeedPostCardAspect,
  FeedPostCardLayout,
} from "@/components/studio/workspace/FeedPostCard";

const CARD_SPRING = { type: "spring" as const, damping: 28, stiffness: 300 };
const INSTANT = { duration: 0 } as const;
/** C-131 Motion: opacity crossfade 160/120ms ease-out; ban mode="wait" / black flash. */
const SLIDE_CROSSFADE = {
  duration: 0.16,
  ease: [0.23, 1, 0.32, 1] as const,
};
const SLIDE_CROSSFADE_EXIT = {
  duration: 0.12,
  ease: [0.23, 1, 0.32, 1] as const,
};

type DraftsPanelProps = {
  /** C-32: inline body inside Ours tabs (no dialog overlay). */
  onSelectDraft?: (draft: CarouselDraft) => void;
  /** Same frame as published FeedPostCard for this module (C-62). */
  aspectRatio?: FeedPostCardAspect;
  layout?: FeedPostCardLayout;
  moduleId?: string;
};

function aspectClassName(aspectRatio: FeedPostCardAspect): string {
  if (aspectRatio === "9/16") return "aspect-[9/16]";
  if (aspectRatio === "3/5") return "aspect-[3/5]";
  return "aspect-[4/5]";
}

function slotLabelForDraft(
  file: ScheduleFileV1,
  draft: CarouselDraft,
): string | null {
  const slot =
    slotForPost(file, draft.id) ??
    slotForPost(file, draft.sourceCompetitorId);
  if (!slot) return null;
  const label = formatSlotLabelRu(slot.startsAt);
  return label || null;
}

function DraftFeedCard({
  draft,
  index,
  active,
  aspectRatio,
  layout,
  slotLabel,
  onSelect,
  onDelete,
  onDownload,
}: {
  draft: CarouselDraft;
  index: number;
  active: boolean;
  aspectRatio: FeedPostCardAspect;
  layout: FeedPostCardLayout;
  slotLabel: string | null;
  onSelect: () => void;
  onDelete: () => void;
  onDownload: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [slideIndex, setSlideIndex] = useState(0);
  const isGrid = layout === "grid";
  const count = draft.slides.length;
  const current = draft.slides[Math.min(slideIndex, Math.max(0, count - 1))];
  const aspectClass = aspectClassName(aspectRatio);

  useEffect(() => {
    setSlideIndex(0);
  }, [draft.id]);

  function step(e: MouseEvent, delta: number) {
    e.stopPropagation();
    e.preventDefault();
    if (count <= 0) return;
    setSlideIndex((i) => (i + delta + count) % count);
  }

  return (
    <div className={cn("flex flex-col", isGrid ? "gap-1" : "gap-1.5")}>
      <motion.article
        data-testid="ours-draft-item"
        data-draft-id={draft.id}
        data-aspect={aspectRatio}
        data-layout={layout}
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className={cn(
          /* C-121: no overflow-hidden on grid item (aspect collapse) */
          "w-full cursor-pointer self-start overflow-visible rounded-xl border border-[var(--border-glass)]",
          "bg-[rgba(255,255,255,0.03)] shadow-[0_8px_28px_rgba(0,0,0,0.35)]",
          !isGrid && "shrink-0",
          active &&
            "border-[color-mix(in_srgb,var(--accent-gold)_40%,transparent)]",
        )}
        initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          reduceMotion
            ? INSTANT
            : {
                ...CARD_SPRING,
                delay: Math.min(index, isGrid ? 20 : 6) * (isGrid ? 0.025 : 0.05),
              }
        }
        whileHover={
          reduceMotion
            ? undefined
            : { y: -2, borderColor: "rgba(255,255,255,0.14)" }
        }
      >
        <div
          className={cn(
            "group/media relative w-full overflow-hidden",
            aspectClass,
            "bg-[linear-gradient(160deg,#12151a_0%,#0a0c0f_55%,#141820_100%)]",
          )}
        >
          <div className="absolute right-1.5 top-1.5 z-20 flex items-center gap-1">
            <button
              type="button"
              data-testid="draft-download-btn"
              aria-label="Скачать PNG архивом"
              title="Скачать PNG архивом"
              className={cn(
                "flex h-8 w-8 items-center justify-center",
                "rounded-full border border-[rgba(255,255,255,0.2)]",
                "bg-[rgba(8,9,10,0.65)] text-white backdrop-blur-sm",
                "hover:bg-[rgba(40,120,80,0.85)]",
              )}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDownload();
              }}
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              data-testid="draft-delete-btn"
              aria-label="Удалить черновик"
              title="Удалить черновик"
              className={cn(
                "flex h-8 w-8 items-center justify-center",
                "rounded-full border border-[rgba(255,255,255,0.2)]",
                "bg-[rgba(8,9,10,0.65)] text-white backdrop-blur-sm",
                "hover:bg-[rgba(180,40,40,0.85)]",
              )}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {current?.imageUrl ? (
            <div
              className="absolute inset-0"
              data-carousel-crossfade
              data-testid="draft-slide-crossfade"
            >
              {reduceMotion ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current.imageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-90"
                />
              ) : (
                <AnimatePresence initial={false} mode="sync">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <motion.img
                    key={current.id}
                    src={current.imageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-90"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    exit={{ opacity: 0, transition: SLIDE_CROSSFADE_EXIT }}
                    transition={SLIDE_CROSSFADE}
                  />
                </AnimatePresence>
              )}
            </div>
          ) : (
            <span className="absolute inset-0 bg-[rgba(255,255,255,0.06)]" />
          )}

          {count > 1 ? (
            <>
              <motion.button
                type="button"
                data-testid="draft-slide-prev"
                aria-label="Предыдущий слайд"
                onClick={(e) => step(e, -1)}
                className={cn(
                  "absolute left-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center",
                  "rounded-full border border-[rgba(255,255,255,0.18)]",
                  "bg-[rgba(8,9,10,0.55)] text-white backdrop-blur-sm",
                )}
                whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                transition={reduceMotion ? INSTANT : CARD_SPRING}
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
              <motion.button
                type="button"
                data-testid="draft-slide-next"
                aria-label="Следующий слайд"
                onClick={(e) => step(e, 1)}
                className={cn(
                  "absolute right-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center",
                  "rounded-full border border-[rgba(255,255,255,0.18)]",
                  "bg-[rgba(8,9,10,0.55)] text-white backdrop-blur-sm",
                )}
                whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                transition={reduceMotion ? INSTANT : CARD_SPRING}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </>
          ) : null}
        </div>

        <div
          className={cn(
            "flex flex-col",
            isGrid ? "gap-1 p-2" : "gap-2.5 p-3.5",
          )}
        >
          <h3 className="cf-card-meta font-medium line-clamp-2">
            {draft.title}
          </h3>
        </div>
      </motion.article>

      {slotLabel ? (
        <p
          data-testid="draft-slot-label"
          className={cn(
            "px-0.5 font-[family-name:var(--font-mono-jb)] text-[var(--accent-gold)]",
            isGrid ? "text-[9px]" : "text-[11px]",
          )}
        >
          {slotLabel}
        </p>
      ) : null}
    </div>
  );
}

/**
 * C-32 / C-62 — drafts as same-size cards as published feed.
 */
export function DraftsPanel({
  onSelectDraft,
  aspectRatio = "4/5",
  layout = "stack",
}: DraftsPanelProps) {
  const drafts = useCarouselDraftsStore((s) => s.drafts);
  const selectedDraftId = useCarouselDraftsStore((s) => s.selectedDraftId);
  const selectDraft = useCarouselDraftsStore((s) => s.selectDraft);
  const removeDraft = useCarouselDraftsStore((s) => s.removeDraft);
  const [schedule, setSchedule] = useState<ScheduleFileV1>(emptyScheduleFile);
  const isGrid = layout === "grid";

  useEffect(() => {
    const refresh = () => setSchedule(readScheduleFromStorage());
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [drafts]);

  return (
    <div
      data-testid="ours-drafts-panel"
      className="flex min-h-0 flex-1 flex-col"
      aria-labelledby="ours-drafts-title"
    >
      <h3 id="ours-drafts-title" className="sr-only">
        Черновики
      </h3>

      {drafts.length === 0 ? (
        <p className="px-2 py-8 text-center text-sm text-[var(--text-muted)]">
          Пока нет черновиков — создайте карусель через «Создать»
        </p>
      ) : (
        <ul
          className="grid grid-cols-2 content-start items-start gap-2"
          data-testid="ours-drafts-list"
        >
          {drafts.map((draft, index) => (
            <li key={draft.id}>
              <DraftFeedCard
                draft={draft}
                index={index}
                active={draft.id === selectedDraftId}
                aspectRatio={aspectRatio}
                layout={layout}
                slotLabel={slotLabelForDraft(schedule, draft)}
                onSelect={() => {
                  selectDraft(draft.id);
                  onSelectDraft?.(draft);
                }}
                onDelete={() => {
                  if (
                    typeof window !== "undefined" &&
                    !window.confirm(`Удалить черновик «${draft.title}»?`)
                  ) {
                    return;
                  }
                  removeDraft(draft.id);
                }}
                onDownload={() => {
                  void (async () => {
                    const slides = draft.slides.filter((s) => s.imageUrl);
                    if (!slides.length) {
                      window.alert("В черновике нет слайдов для скачивания.");
                      return;
                    }
                    const entries: { name: string; data: Uint8Array }[] = [];
                    for (let i = 0; i < slides.length; i++) {
                      const url = slides[i]!.imageUrl;
                      try {
                        const res = await fetch(url);
                        if (!res.ok) continue;
                        const buf = new Uint8Array(await res.arrayBuffer());
                        const ext = url.includes(".jpg") ? "jpg" : "png";
                        entries.push({
                          name: `slide_${String(i + 1).padStart(2, "0")}.${ext}`,
                          data: buf,
                        });
                      } catch {
                        /* skip broken url */
                      }
                    }
                    if (!entries.length) {
                      window.alert("Не удалось скачать файлы слайдов.");
                      return;
                    }
                    const zip = buildStoreZip(entries);
                    const safe =
                      draft.title
                        .replace(/[^\wа-яА-ЯёЁ\- ]+/gi, "")
                        .trim()
                        .slice(0, 48) || "carousel";
                    triggerBrowserDownload(`${safe}.zip`, zip);
                  })();
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
