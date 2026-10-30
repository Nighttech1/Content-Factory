"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useInspectStore } from "@/lib/inspect-store";
import type { CarouselSlide } from "@/lib/inspect-mock";
import {
  CarouselSkeleton,
  useDemoMediaLoading,
} from "@/components/inspect/MediaSkeleton";

const SPRING = { type: "spring" as const, damping: 28, stiffness: 280 };

type SlideThumbProps = {
  slide: CarouselSlide;
  selected: boolean;
  onSelect: () => void;
  dragging?: boolean;
  overlay?: boolean;
};

function SlideThumb({
  slide,
  selected,
  onSelect,
  dragging,
  overlay,
}: SlideThumbProps) {
  return (
    <div
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
        "relative h-32 w-24 shrink-0 cursor-grab overflow-hidden rounded-lg border border-[var(--border-glass)] bg-[var(--bg-elevated)] active:cursor-grabbing",
        selected &&
          "ring-2 ring-[var(--accent-terracotta)] shadow-[0_0_12px_rgba(200,100,70,0.30)]",
        !selected && "hover:ring-1 hover:ring-[var(--border-active)]",
        dragging && "opacity-40",
        overlay && "cursor-grabbing shadow-2xl ring-2 ring-[var(--accent-gold)]",
      )}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundImage: slide.imageUrl ?? undefined }}
      />
      <div className="absolute left-1 top-1 rounded bg-[color-mix(in_srgb,var(--bg-canvas)_90%,transparent)] px-1 font-[family-name:var(--font-mono-jb)] text-[9px] font-bold text-[var(--accent-terracotta)]">
        {slide.badge}
      </div>
      {selected && (
        <div className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--accent-gold)]">
          <span className="text-[8px] font-bold text-[var(--bg-canvas)]">✓</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-[color-mix(in_srgb,var(--bg-canvas)_90%,transparent)] p-1 backdrop-blur-sm">
        <span className="block truncate font-[family-name:var(--font-mono-jb)] text-[9px] text-[var(--text-primary)]">
          {slide.filename}
        </span>
        {slide.version > 1 && (
          <span className="font-[family-name:var(--font-mono-jb)] text-[8px] text-[var(--accent-gold)]">
            v{slide.version}
          </span>
        )}
      </div>
    </div>
  );
}

function SortableSlide({
  slide,
  selected,
  onSelect,
}: {
  slide: CarouselSlide;
  selected: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SlideThumb
        slide={slide}
        selected={selected}
        onSelect={onSelect}
        dragging={isDragging}
      />
    </div>
  );
}

function SelectedStageContent({ slide }: { slide: CarouselSlide }) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{ backgroundImage: slide.imageUrl ?? undefined }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-canvas)] via-transparent to-transparent" />
      <div className="relative z-10 mt-auto p-4">
        <p className="font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--accent-terracotta)]">
          {slide.badge}
        </p>
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {slide.filename}
        </p>
        <p
          lang="hy"
          className="mt-2 font-[family-name:var(--font-hy)] text-sm text-[var(--text-muted)]"
        >
          Կարուսելի սլայդ · drag to reorder below
        </p>
      </div>
    </>
  );
}

type CarouselDeckProps = {
  /** When true, show focused 4:5 stage above the strip (carousel preview mode). */
  showStage?: boolean;
  /** When false, hide the DnD strip (MediaDeck keeps one strip mounted). */
  showStrip?: boolean;
};

export function CarouselDeck({
  showStage = false,
  showStrip = true,
}: CarouselDeckProps) {
  const draftId = useInspectStore((s) => s.id);
  const slides = useInspectStore((s) => s.slides);
  const selectedSlideId = useInspectStore((s) => s.selectedSlideId);
  const selectSlide = useInspectStore((s) => s.selectSlide);
  const reorderSlides = useInspectStore((s) => s.reorderSlides);
  const reduceMotion = useReducedMotion();
  const isMediaLoading = useDemoMediaLoading(`${draftId}:carousel`);

  const sorted = useMemo(
    () => [...slides].sort((a, b) => a.order - b.order),
    [slides],
  );
  const ids = useMemo(() => sorted.map((s) => s.id), [sorted]);
  const selected = sorted.find((s) => s.id === selectedSlideId);

  const [activeId, setActiveId] = useState<string | null>(null);
  const activeSlide = sorted.find((s) => s.id === activeId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
  );

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    reorderSlides(arrayMove(ids, oldIndex, newIndex));
  }

  function onDragCancel() {
    setActiveId(null);
  }

  if (isMediaLoading) {
    // Stage-only or strip-only mounts from MediaDeck share one loading pass.
    return (
      <CarouselSkeleton
        showStage={showStage}
        showStrip={showStrip}
        slideCount={showStrip ? 3 : 0}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {showStage && (
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] p-4">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-1 bg-gradient-to-tr from-[color-mix(in_srgb,var(--accent-blue)_18%,transparent)] via-[color-mix(in_srgb,var(--accent-gold)_8%,transparent)] to-transparent opacity-50 blur-2xl"
          />
          <AnimatePresence mode="wait" initial={false}>
            {selected ? (
              <motion.div
                key={selected.id}
                className="relative mx-auto flex w-full max-w-[280px] flex-col overflow-hidden rounded-lg border border-[var(--border-glass)] bg-[var(--bg-elevated)] shadow-2xl"
                style={{ aspectRatio: "4 / 5" }}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
                transition={reduceMotion ? { duration: 0 } : SPRING}
              >
                <SelectedStageContent slide={selected} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}

      {showStrip && (
        <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] p-4">
          <div className="flex items-center justify-between gap-2 pb-1">
            <div className="flex items-center gap-2">
              <GripHorizontal
                className="h-4 w-4 text-[var(--accent-gold)]"
                strokeWidth={1.75}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                Carousel Synchronized Deck
              </span>
              <span className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--accent-blue-bright)]">
                8 Assets
              </span>
            </div>
            <span className="hidden text-[11px] text-[var(--text-muted)] sm:inline">
              Drag to reorder sequence
            </span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
          >
            <SortableContext
              items={ids}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex items-center gap-2 overflow-x-auto py-1 [scrollbar-width:thin]">
                {sorted.map((slide) => (
                  <SortableSlide
                    key={slide.id}
                    slide={slide}
                    selected={slide.id === selectedSlideId}
                    onSelect={() => selectSlide(slide.id)}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeSlide ? (
                <SlideThumb
                  slide={activeSlide}
                  selected={activeSlide.id === selectedSlideId}
                  onSelect={() => undefined}
                  overlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  );
}
