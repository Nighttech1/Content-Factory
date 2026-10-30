"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { PlatformCarouselPicker } from "@/components/ui/platform-carousel-picker";
import { cn } from "@/lib/cn";
import {
  defaultSchedulePopupPos,
  readSchedulePopupPos,
  writeSchedulePopupPos,
  type SchedulePopupPos,
} from "@/lib/schedule/popup-pos";
import type { ScheduleSlotV1 } from "@/lib/schedule/storage";
import { formatSlotLabelRu } from "@/lib/schedule/storage";
import type { PublishPlatform } from "@/lib/settings/platforms";

const ENTER_SPRING = { type: "spring" as const, damping: 26, stiffness: 300 };
const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;
const SLOT_MIME = "application/x-cf-schedule-slot";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toDayKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function timeFromIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "12:00";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function readDroppedPost(
  e: DragEvent,
): { postId: string; moduleId: string; keepTime?: boolean } | undefined {
  const slotRaw = e.dataTransfer.getData(SLOT_MIME);
  if (slotRaw) {
    try {
      const parsed = JSON.parse(slotRaw) as {
        postId?: unknown;
        moduleId?: unknown;
      };
      if (
        typeof parsed.postId === "string" &&
        typeof parsed.moduleId === "string"
      ) {
        return {
          postId: parsed.postId,
          moduleId: parsed.moduleId,
          keepTime: true,
        };
      }
    } catch {
      /* fall through */
    }
  }
  const raw = e.dataTransfer.getData("application/x-cf-ready-post");
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as { postId?: unknown; moduleId?: unknown };
    if (
      typeof parsed.postId === "string" &&
      typeof parsed.moduleId === "string"
    ) {
      return { postId: parsed.postId, moduleId: parsed.moduleId };
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const jsDay = first.getDay();
  const mondayOffset = jsDay === 0 ? 6 : jsDay - 1;
  const start = new Date(year, month, 1 - mondayOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

type ScheduleCalendarProps = {
  month: Date;
  onMonthChange: (next: Date) => void;
  selectedDay: Date;
  onSelectDay: (
    day: Date,
    dropped?: { postId: string; moduleId: string; keepTime?: boolean },
  ) => void;
  timeValue: string;
  onTimeChange: (value: string) => void;
  slots: ScheduleSlotV1[];
  canAssign: boolean;
  postTitles?: Record<string, string>;
  onSlotTimeChange?: (postId: string, day: Date, time: string) => void;
  platforms?: PublishPlatform[];
  onSlotPlatformChange?: (postId: string, platformId: string) => void;
  /** C-92 — clear calendar slot only; post stays in module rail. */
  onSlotRemove?: (postId: string) => void;
};

/** C-84 — single opaque sticky editor; Save/Cancel only close. */
export function ScheduleCalendar({
  month,
  onMonthChange,
  selectedDay,
  onSelectDay,
  slots,
  postTitles = {},
  onSlotTimeChange,
  platforms = [],
  onSlotPlatformChange,
  onSlotRemove,
}: ScheduleCalendarProps) {
  const reduceMotion = useReducedMotion();
  const today = startOfDay(new Date());
  const draggingRef = useRef(false);
  const [editor, setEditor] = useState<{
    slot: ScheduleSlotV1;
    day: Date;
  } | null>(null);
  const [draftTime, setDraftTime] = useState("12:00");
  const [draftPlatformId, setDraftPlatformId] = useState<string | undefined>();
  /** C-103 / C-126 — fixed viewport coords; persist `cf.schedule.popup.pos`. */
  const [popupPos, setPopupPos] = useState<SchedulePopupPos>({ x: 0, y: 0 });
  const popupPosHydrated = useRef(false);
  const dragPopupRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  useEffect(() => {
    if (popupPosHydrated.current) return;
    popupPosHydrated.current = true;
    const saved = readSchedulePopupPos();
    if (saved) setPopupPos(saved);
  }, []);

  const cells = useMemo(
    () => monthGrid(month.getFullYear(), month.getMonth()),
    [month],
  );

  const slotsByDay = useMemo(() => {
    const map = new Map<string, ScheduleSlotV1[]>();
    for (const slot of slots) {
      const d = new Date(slot.startsAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = toDayKey(d);
      const list = map.get(key) ?? [];
      list.push(slot);
      map.set(key, list);
    }
    return map;
  }, [slots]);

  const monthLabel = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(month);
  const monthKey = `${month.getFullYear()}-${month.getMonth()}`;

  function openEditor(slot: ScheduleSlotV1, day: Date) {
    if (draggingRef.current) return;
    setEditor({ slot, day });
    setDraftTime(timeFromIso(slot.startsAt));
    setDraftPlatformId(slot.platformId);
    // C-126 — restore saved pos; default only if key missing / parse fail.
    const saved = readSchedulePopupPos();
    setPopupPos(saved ?? defaultSchedulePopupPos());
  }

  function closeEditor() {
    setEditor(null);
  }

  function saveEditor() {
    if (!editor) return;
    onSlotTimeChange?.(editor.slot.postId, editor.day, draftTime);
    if (draftPlatformId) {
      onSlotPlatformChange?.(editor.slot.postId, draftPlatformId);
    }
    closeEditor();
  }

  function deleteEditorSlot() {
    if (!editor) return;
    onSlotRemove?.(editor.slot.postId);
    closeEditor();
  }

  useEffect(() => {
    if (!editor) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeEditor();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editor]);

  return (
    <motion.section
      data-testid="schedule-calendar"
      className="relative flex min-h-0 flex-1 flex-col overflow-visible rounded-xl border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] p-4 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.35)] md:p-5"
      initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduceMotion ? { duration: 0 } : ENTER_SPRING}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <NavBtn
            testId="schedule-month-prev"
            label="Предыдущий месяц"
            onClick={() =>
              onMonthChange(
                new Date(month.getFullYear(), month.getMonth() - 1, 1),
              )
            }
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </NavBtn>
          <h2 className="px-1 text-lg font-semibold capitalize tracking-tight text-[var(--text-primary)]">
            {monthLabel}
          </h2>
          <NavBtn
            testId="schedule-month-next"
            label="Следующий месяц"
            onClick={() =>
              onMonthChange(
                new Date(month.getFullYear(), month.getMonth() + 1, 1),
              )
            }
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </NavBtn>
        </div>
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            onMonthChange(new Date(now.getFullYear(), now.getMonth(), 1));
            onSelectDay(today);
          }}
          className="rounded-md px-2.5 py-1.5 font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--accent-gold)] hover:bg-[var(--bg-hover)]"
        >
          Сегодня
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <p
            key={w}
            className="pb-1 text-center font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-mono)]"
          >
            {w}
          </p>
        ))}
        <AnimatePresence initial={false}>
          <motion.div
            key={monthKey}
            className="col-span-7 grid grid-cols-7 gap-1"
            initial={reduceMotion ? false : { opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={reduceMotion ? { duration: 0 } : ENTER_SPRING}
          >
            {cells.map((d) => {
              const inMonth = d.getMonth() === month.getMonth();
              const selected = sameDay(d, selectedDay);
              const isToday = sameDay(d, today);
              const daySlots = slotsByDay.get(toDayKey(d)) ?? [];
              return (
                <DayCell
                  key={toDayKey(d)}
                  day={d}
                  inMonth={inMonth}
                  selected={selected}
                  isToday={isToday}
                  daySlots={daySlots}
                  postTitles={postTitles}
                  activePostId={editor?.slot.postId}
                  onSelectDay={onSelectDay}
                  onOpenSlot={(slot) => openEditor(slot, d)}
                  onDragState={(dragging) => {
                    draggingRef.current = dragging;
                    if (dragging) setEditor(null);
                  }}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {editor ? (
        <div
          data-testid="schedule-slot-popup"
          className={cn(
            "fixed z-[80] w-[min(20rem,calc(100vw-2rem))]",
            "rounded-xl border border-[var(--border-glass)] p-4",
            "bg-[var(--bg-elevated)] shadow-[0_24px_64px_rgba(0,0,0,0.65)]",
            "opacity-100 backdrop-blur-none",
          )}
          style={{ left: popupPos.x, top: popupPos.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            data-testid="schedule-slot-popup-drag"
            className="mb-2 cursor-grab active:cursor-grabbing select-none rounded-md border border-transparent px-1 py-1 hover:border-[var(--border-glass)]"
            onPointerDown={(e) => {
              e.preventDefault();
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              dragPopupRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                origX: popupPos.x,
                origY: popupPos.y,
              };
            }}
            onPointerMove={(e) => {
              if (!dragPopupRef.current) return;
              const dx = e.clientX - dragPopupRef.current.startX;
              const dy = e.clientY - dragPopupRef.current.startY;
              setPopupPos({
                x: Math.max(8, dragPopupRef.current.origX + dx),
                y: Math.max(8, dragPopupRef.current.origY + dy),
              });
            }}
            onPointerUp={(e) => {
              if (dragPopupRef.current) {
                const dx = e.clientX - dragPopupRef.current.startX;
                const dy = e.clientY - dragPopupRef.current.startY;
                const next: SchedulePopupPos = {
                  x: Math.max(8, dragPopupRef.current.origX + dx),
                  y: Math.max(8, dragPopupRef.current.origY + dy),
                };
                setPopupPos(next);
                writeSchedulePopupPos(next);
              }
              dragPopupRef.current = null;
              try {
                (e.currentTarget as HTMLElement).releasePointerCapture(
                  e.pointerId,
                );
              } catch {
                /* ignore */
              }
            }}
          >
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-mono)]">
              Перетащить окно
            </p>
            <p className="text-sm font-semibold leading-snug text-[var(--text-primary)]">
              {postTitles[editor.slot.postId] ?? "Контент"}
            </p>
          </div>
          <p className="font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-mono)]">
            {formatSlotLabelRu(editor.slot.startsAt)}
          </p>
          <label className="mt-3 flex flex-col gap-1">
            <span className="font-[family-name:var(--font-ui)] text-xs font-semibold text-[var(--accent-blue-bright)]">
              Время публикации
            </span>
            <input
              type="time"
              data-testid="schedule-slot-time"
              value={draftTime}
              onChange={(e) => setDraftTime(e.target.value)}
              className="rounded-md border border-[var(--border-glass)] bg-[var(--bg-card)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue-bright)]"
            />
          </label>
          <div className="mt-3 flex flex-col gap-1">
            <span className="font-[family-name:var(--font-ui)] text-xs font-semibold text-[var(--accent-blue-bright)]">
              Площадка
            </span>
            <PlatformCarouselPicker
              platforms={platforms}
              value={draftPlatformId}
              onChange={setDraftPlatformId}
              testId="schedule-slot-platform"
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              data-testid="schedule-slot-delete"
              onClick={deleteEditorSlot}
              className="rounded-lg border border-[var(--border-glass)] px-3 py-1.5 text-sm text-[var(--accent-terracotta)] hover:bg-[var(--bg-hover)]"
            >
              Удалить
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                data-testid="schedule-slot-cancel"
                onClick={closeEditor}
                className="rounded-lg border border-[var(--border-glass)] px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Отмена
              </button>
              <button
                type="button"
                data-testid="schedule-slot-save"
                onClick={saveEditor}
                className="rounded-lg border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--accent-blue)_18%,transparent)] px-3 py-1.5 text-sm font-semibold text-[var(--accent-blue-bright)]"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </motion.section>
  );
}

function NavBtn({
  label,
  onClick,
  children,
  testId,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  testId?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      data-testid={testId}
      onClick={onClick}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
    >
      {children}
    </button>
  );
}

function DayCell({
  day,
  inMonth,
  selected,
  isToday,
  daySlots,
  postTitles,
  activePostId,
  onSelectDay,
  onOpenSlot,
  onDragState,
}: {
  day: Date;
  inMonth: boolean;
  selected: boolean;
  isToday: boolean;
  daySlots: ScheduleSlotV1[];
  postTitles: Record<string, string>;
  activePostId?: string;
  onSelectDay: (
    day: Date,
    dropped?: { postId: string; moduleId: string; keepTime?: boolean },
  ) => void;
  onOpenSlot: (slot: ScheduleSlotV1) => void;
  onDragState: (dragging: boolean) => void;
}) {
  return (
    <div
      data-testid="schedule-day-cell"
      data-day={toDayKey(day)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDragState(false);
        onSelectDay(day, readDroppedPost(e));
      }}
      onClick={() => onSelectDay(day)}
      className={cn(
        "relative flex min-h-[4.5rem] cursor-pointer flex-col items-stretch rounded-lg p-1 text-left",
        "transition-transform duration-150 ease-out active:scale-[0.98]",
        inMonth
          ? "text-[var(--text-primary)]"
          : "text-[var(--text-mono)] opacity-40",
        selected &&
          "bg-[color-mix(in_srgb,var(--accent-blue)_28%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--accent-blue-bright)_50%,transparent)]",
        isToday &&
          !selected &&
          "ring-1 ring-[color-mix(in_srgb,var(--accent-gold)_40%,transparent)]",
      )}
    >
      <span
        className={cn(
          "self-start font-[family-name:var(--font-mono-jb)] text-[10px] tabular-nums",
          selected ? "font-semibold text-[var(--accent-blue-bright)]" : "",
        )}
      >
        {day.getDate()}
      </span>
      <div className="mt-0.5 flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
        {daySlots.slice(0, 3).map((slot) => (
          <button
            key={slot.postId}
            type="button"
            draggable
            data-testid="schedule-file-chip"
            data-active={activePostId === slot.postId ? "true" : undefined}
            onDragStart={(e) => {
              onDragState(true);
              e.dataTransfer.setData(
                SLOT_MIME,
                JSON.stringify({
                  postId: slot.postId,
                  moduleId: slot.moduleId,
                }),
              );
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={() => onDragState(false)}
            onClick={(e) => {
              e.stopPropagation();
              onOpenSlot(slot);
            }}
            className={cn(
              "flex cursor-grab items-center gap-1 truncate rounded border border-[var(--border-glass)] bg-[rgba(255,255,255,0.06)] px-1 py-0.5 text-[9px] text-[var(--text-primary)] active:cursor-grabbing",
              activePostId === slot.postId &&
                "border-[color-mix(in_srgb,var(--accent-gold)_45%,transparent)]",
            )}
          >
            <FileText className="h-2.5 w-2.5 shrink-0 text-[var(--accent-gold)]" />
            <span className="truncate">
              {postTitles[slot.postId] ?? "Файл"}
            </span>
          </button>
        ))}
        {daySlots.length > 3 ? (
          <span className="text-[9px] text-[var(--text-mono)]">
            +{daySlots.length - 3}
          </span>
        ) : null}
      </div>
    </div>
  );
}
