"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { mergeStudioModules } from "@/components/studio/modules";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { ScheduleModuleRail } from "@/components/schedule/ScheduleModuleRail";
import { listReadyPostsForModule, type ReadyPost } from "@/lib/schedule/ready-posts";
import {
  emptyScheduleFile,
  moveSlotDay,
  readScheduleFromStorage,
  removeSlot,
  upsertSlot,
  writeScheduleToStorage,
  type ScheduleFileV1,
} from "@/lib/schedule/storage";
import {
  readPlatformsFromStorage,
  type PublishPlatform,
} from "@/lib/settings/platforms";
import { useStudioStore } from "@/lib/studio-store";

function combineLocal(day: Date, time: string): string {
  const [hRaw, mRaw] = time.split(":");
  const h = Number.parseInt(hRaw ?? "12", 10);
  const m = Number.parseInt(mRaw ?? "0", 10);
  const d = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    Number.isFinite(h) ? h : 12,
    Number.isFinite(m) ? m : 0,
    0,
    0,
  );
  return d.toISOString();
}

const RAIL_WIDTH_KEY = "cf.schedule.rail.width";
const RAIL_MIN = 240;
const RAIL_MAX = 480;
const RAIL_DEFAULT = 352;

function clampRail(n: number) {
  return Math.min(RAIL_MAX, Math.max(RAIL_MIN, Math.round(n)));
}

export function ScheduleShell() {
  const customModules = useStudioStore((s) => s.customModules);
  const hydrateCustomModules = useStudioStore((s) => s.hydrateCustomModules);

  const [file, setFile] = useState<ScheduleFileV1>(emptyScheduleFile);
  const [hydrated, setHydrated] = useState(false);
  const [selected, setSelected] = useState<ReadyPost | null>(null);
  const [railWidth, setRailWidth] = useState(RAIL_DEFAULT);
  const railDrag = useRef<{ startX: number; startW: number } | null>(null);
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [timeValue, setTimeValue] = useState("12:00");
  const [platforms, setPlatforms] = useState<PublishPlatform[]>([]);

  useEffect(() => {
    void hydrateCustomModules();
  }, [hydrateCustomModules]);

  useEffect(() => {
    setFile(readScheduleFromStorage());
    setPlatforms(readPlatformsFromStorage());
    try {
      const raw = window.localStorage.getItem(RAIL_WIDTH_KEY);
      if (raw) setRailWidth(clampRail(Number.parseFloat(raw)));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const onRailPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      railDrag.current = { startX: e.clientX, startW: railWidth };
    },
    [railWidth],
  );

  const onRailPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!railDrag.current) return;
      const delta = railDrag.current.startX - e.clientX;
      setRailWidth(clampRail(railDrag.current.startW + delta));
    },
    [],
  );

  const onRailPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!railDrag.current) return;
      railDrag.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      try {
        window.localStorage.setItem(RAIL_WIDTH_KEY, String(railWidth));
      } catch {
        /* ignore */
      }
    },
    [railWidth],
  );

  const modules = useMemo(
    () => mergeStudioModules(customModules),
    [customModules],
  );

  const postsByModule = useMemo(() => {
    const map: Record<string, ReadyPost[]> = {};
    for (const mod of modules) {
      map[mod.id] = listReadyPostsForModule(mod.id);
    }
    for (const slot of file.slots) {
      const list = map[slot.moduleId] ?? [];
      if (!list.some((p) => p.id === slot.postId)) {
        map[slot.moduleId] = [
          ...list,
          {
            id: slot.postId,
            moduleId: slot.moduleId,
            title: "Черновик разбора",
          },
        ];
      }
    }
    return map;
  }, [modules, file.slots]);

  function persist(next: ScheduleFileV1) {
    setFile(next);
    writeScheduleToStorage(next);
  }

  function assign(post: ReadyPost, day: Date, time: string) {
    persist(
      upsertSlot(file, {
        postId: post.id,
        moduleId: post.moduleId,
        startsAt: combineLocal(day, time),
      }),
    );
  }

  function onSelectDay(
    day: Date,
    dropped?: { postId: string; moduleId: string; keepTime?: boolean },
  ) {
    setSelectedDay(day);
    /** C-92 — month only via prev/next arrows, never on day click. */

    /** C-78 — chip date↔date: keep clock time from existing slot. */
    if (dropped?.keepTime) {
      persist(moveSlotDay(file, dropped.postId, day));
      const list = postsByModule[dropped.moduleId] ?? [];
      const found = list.find((p) => p.id === dropped.postId);
      if (found) setSelected(found);
      return;
    }

    let post = selected;
    if (dropped) {
      const list = postsByModule[dropped.moduleId] ?? [];
      const found = list.find((p) => p.id === dropped.postId);
      if (found) {
        post = found;
        setSelected(found);
      } else {
        post = {
          id: dropped.postId,
          moduleId: dropped.moduleId,
          title: "Черновик разбора",
        };
        setSelected(post);
      }
    }
    if (post) assign(post, day, timeValue);
  }

  function onTimeChange(value: string) {
    setTimeValue(value);
    if (selected) assign(selected, selectedDay, value);
  }

  return (
    <div
      data-testid="schedule-page"
      className="flex min-h-[calc(100vh-6rem)] flex-col gap-6 pb-16"
    >
      <header className="flex max-w-2xl flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
          Расписание
        </h1>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          Календарь слотов для готовых постов. Назначение даты — только очередь
          в студии, без публикации в соцсети.
        </p>
      </header>

      {!hydrated ? (
        <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
          Загрузка…
        </p>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:items-stretch">
          <ScheduleCalendar
            month={month}
            onMonthChange={setMonth}
            selectedDay={selectedDay}
            onSelectDay={onSelectDay}
            timeValue={timeValue}
            onTimeChange={onTimeChange}
            slots={file.slots}
            canAssign={Boolean(selected)}
            postTitles={Object.fromEntries(
              Object.values(postsByModule)
                .flat()
                .map((p) => [p.id, p.title]),
            )}
            onSlotTimeChange={(postId, day, time) => {
              const list = Object.values(postsByModule).flat();
              const post = list.find((p) => p.id === postId);
              if (post) assign(post, day, time);
              setTimeValue(time);
            }}
            platforms={platforms}
            onSlotPlatformChange={(postId, platformId) => {
              const slot = file.slots.find((s) => s.postId === postId);
              if (!slot) return;
              persist(
                upsertSlot(file, {
                  ...slot,
                  platformId,
                }),
              );
            }}
            onSlotRemove={(postId) => persist(removeSlot(file, postId))}
          />
          <div
            data-testid="schedule-rail-resize"
            role="separator"
            aria-orientation="vertical"
            aria-label="Ширина модулей студии"
            onPointerDown={onRailPointerDown}
            onPointerMove={onRailPointerMove}
            onPointerUp={onRailPointerUp}
            onPointerCancel={onRailPointerUp}
            className="hidden w-1.5 shrink-0 cursor-col-resize touch-none rounded-full bg-transparent hover:bg-[color-mix(in_srgb,var(--accent-blue-bright)_40%,transparent)] lg:block"
          />
          <ScheduleModuleRail
            modules={modules}
            postsByModule={postsByModule}
            file={file}
            selectedPostId={selected?.id ?? null}
            onSelectPost={setSelected}
            onClearSlot={(postId) => persist(removeSlot(file, postId))}
            widthPx={railWidth}
          />
        </div>
      )}
    </div>
  );
}
