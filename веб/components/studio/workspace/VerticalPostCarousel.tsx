"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpDown,
  ChevronDown,
  Filter,
  LayoutGrid,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-react";
import { BoardsPanel } from "@/components/studio/workspace/BoardsPanel";
import { DraftsPanel } from "@/components/studio/workspace/DraftsPanel";
import { FeedPostCard } from "@/components/studio/workspace/FeedPostCard";
import type {
  FeedPostCardAspect,
  FeedPostCardLayout,
} from "@/components/studio/workspace/FeedPostCard";
import { cn } from "@/lib/cn";
import type { FeedPost } from "@/lib/studio/feed-types";
import type { CarouselDraft } from "@/lib/studio/carousel-draft-types";
import { useBoardsStore } from "@/lib/studio/boards-store";
import { useCarouselDraftsStore } from "@/lib/studio/carousel-drafts-store";

type CompetitorsPanel = "competitors" | "boards";
type FeedSort = "newest" | "oldest" | "engagement";
type FeedFilter = "all" | "carousel" | "video" | "image";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };
const TAB_SPRING = { type: "spring" as const, damping: 28, stiffness: 340 };
const INSTANT = { duration: 0 };
const SEARCH_DEBOUNCE_MS = 400;

export type OursTab = "published" | "drafts";

type VerticalPostCarouselProps = {
  title: string;
  /** Optional; C-49: do not pass label banners for workspace chrome. */
  subtitle?: string;
  posts: FeedPost[];
  loading?: boolean;
  emptyLabel?: string;
  tone?: "ours" | "competitors";
  className?: string;
  testId?: string;
  /** stack = C-28 vertical list; grid = C-29 3-col carousel-engine */
  layout?: FeedPostCardLayout;
  aspectRatio?: FeedPostCardAspect;
  /** Ours: inline «Опубликовано | Черновики» (C-53: all modules). */
  showDraftsButton?: boolean;
  onDraftsClick?: () => void;
  /** Increment to switch Ours to drafts tab (C-31 carousel draft entry). */
  openDraftsNonce?: number;
  /** C-30: competitor «Разбор» */
  showRazborButton?: boolean;
  onRazborClick?: (post: FeedPost) => void;
  /** C-31: competitor «Открыть в редакторе» (reels) */
  showEditorButton?: boolean;
  onEditorClick?: (post: FeedPost) => void;
  onSelectDraft?: (draft: CarouselDraft) => void;
  /**
   * C-49: competitors search → topic refetch via existing feed API.
   * Empty string = niche clear. Parent should call fetchFeed(topic, "competitors").
   */
  onCompetitorsTopicSearch?: (topic: string) => void;
  /** C-52: media-aware Play (graphics / IMAGE hide overlay). */
  moduleId?: string;
};

function engagementScore(p: FeedPost): number {
  const m = p.metrics;
  if (!m) return 0;
  return (
    (m.views ?? 0) +
    (m.likes ?? 0) * 3 +
    (m.comments ?? 0) * 4 +
    (m.shares ?? 0) * 5 +
    (m.saves ?? 0) * 5
  );
}

function matchesMediaFilter(p: FeedPost, filter: FeedFilter): boolean {
  if (filter === "all") return true;
  const mt = (p.mediaType ?? "").toUpperCase();
  if (filter === "carousel") {
    return mt.includes("CAROUSEL") || (p.slideUrls?.length ?? 0) > 1;
  }
  if (filter === "video") {
    return mt.includes("VIDEO") || mt.includes("REEL");
  }
  if (filter === "image") {
    return (
      mt.includes("IMAGE") ||
      (!mt.includes("VIDEO") &&
        !mt.includes("REEL") &&
        !mt.includes("CAROUSEL") &&
        (p.slideUrls?.length ?? 0) <= 1)
    );
  }
  return true;
}

function ToolbarIconButton({
  testId,
  label,
  active,
  onClick,
  children,
}: {
  testId: string;
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border",
        active
          ? "border-[color-mix(in_srgb,var(--accent-gold)_45%,var(--border-glass))] bg-[color-mix(in_srgb,var(--accent-gold)_14%,transparent)] text-white"
          : "border-[var(--border-glass)] bg-[rgba(0,0,0,0.2)] text-[var(--text-muted)] hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

export function VerticalPostCarousel({
  title,
  subtitle,
  posts,
  loading = false,
  emptyLabel = "Нет постов",
  tone = "ours",
  className,
  testId,
  layout = "stack",
  aspectRatio = "4/5",
  showDraftsButton = false,
  onDraftsClick,
  openDraftsNonce = 0,
  showRazborButton = false,
  onRazborClick,
  showEditorButton = false,
  onEditorClick,
  onSelectDraft,
  onCompetitorsTopicSearch,
  moduleId,
}: VerticalPostCarouselProps) {
  const reduceMotion = useReducedMotion();
  const drafts = useCarouselDraftsStore((s) => s.drafts);
  const boards = useBoardsStore((s) => s.boards);
  const boardsCount = boards.length;
  const addBoard = useBoardsStore((s) => s.addBoard);
  const renameBoard = useBoardsStore((s) => s.renameBoard);
  const [oursTab, setOursTab] = useState<OursTab>("published");
  const [competitorsPanel, setCompetitorsPanel] =
    useState<CompetitorsPanel>("competitors");
  const [tabReady, setTabReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedSort, setFeedSort] = useState<FeedSort>("newest");
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [boardsMenuOpen, setBoardsMenuOpen] = useState(false);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  /** S51: which board row is inline-renaming after double-click */
  const [renamingBoardId, setRenamingBoardId] = useState<string | null>(null);
  const [boardsUploadBusy, setBoardsUploadBusy] = useState(false);
  const skipSearchDebounceRef = useRef(true);
  const searchDebounceTimerRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const boardsUploadRef = useRef<HTMLInputElement>(null);
  const isGrid = layout === "grid";
  /** C-120: 2-up rows → six skeletons (3 rows × 2). */
  const skeletonCount = 6;
  const skeletonAspect =
    aspectRatio === "9/16"
      ? "aspect-[9/16]"
      : aspectRatio === "3/5"
        ? "aspect-[3/5]"
        : "aspect-[4/5]";
  const showCompetitorsSearch = tone === "competitors";
  const showOursSearch = tone === "ours" && showDraftsButton;

  useEffect(() => {
    if (!showDraftsButton || tabReady) return;
    setOursTab(drafts.length > 0 ? "drafts" : "published");
    setTabReady(true);
  }, [showDraftsButton, drafts.length, tabReady]);

  useEffect(() => {
    if (openDraftsNonce > 0 && showDraftsButton) {
      setOursTab("drafts");
      onDraftsClick?.();
    }
  }, [openDraftsNonce, showDraftsButton, onDraftsClick]);

  useEffect(() => {
    if (boards.length === 0) {
      setActiveBoardId(null);
      return;
    }
    if (!activeBoardId || !boards.some((b) => b.id === activeBoardId)) {
      setActiveBoardId(boards[0]!.id);
    }
  }, [boards, activeBoardId]);

  /** Debounced topic refetch (C-49); skip mount to avoid double niche fetch. */
  useEffect(() => {
    if (!showCompetitorsSearch || !onCompetitorsTopicSearch) return;
    if (competitorsPanel === "boards") return;
    if (skipSearchDebounceRef.current) {
      skipSearchDebounceRef.current = false;
      return;
    }
    const q = searchQuery.trim();
    if (searchDebounceTimerRef.current != null) {
      window.clearTimeout(searchDebounceTimerRef.current);
    }
    searchDebounceTimerRef.current = window.setTimeout(() => {
      searchDebounceTimerRef.current = null;
      if (q.length === 0) {
        onCompetitorsTopicSearch("");
      } else if (q.length >= 2) {
        onCompetitorsTopicSearch(q);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (searchDebounceTimerRef.current != null) {
        window.clearTimeout(searchDebounceTimerRef.current);
        searchDebounceTimerRef.current = null;
      }
    };
  }, [
    searchQuery,
    showCompetitorsSearch,
    onCompetitorsTopicSearch,
    competitorsPanel,
  ]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = posts.filter((p) => matchesMediaFilter(p, feedFilter));
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.username ?? "").toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    if (feedSort === "oldest") {
      sorted.reverse();
    } else if (feedSort === "engagement") {
      sorted.sort((a, b) => engagementScore(b) - engagementScore(a));
    }
    return sorted;
  }, [posts, searchQuery, feedFilter, feedSort]);

  const showTabs = showDraftsButton;
  const showDraftsBody = showTabs && oursTab === "drafts";
  const showBoardsBody =
    showCompetitorsSearch && competitorsPanel === "boards";
  const displayPosts = filteredPosts;
  const headerCount = showDraftsBody
    ? drafts.length
    : showBoardsBody
      ? boardsCount
      : displayPosts.length;
  const lastKnownHeaderCountRef = useRef(0);
  const headerCountKnown =
    !loading || showDraftsBody || showBoardsBody || displayPosts.length > 0;
  if (headerCountKnown) {
    lastKnownHeaderCountRef.current = headerCount;
  }
  const visibleHeaderCount = lastKnownHeaderCountRef.current;
  const showHeaderChrome =
    showTabs || showCompetitorsSearch || showOursSearch;
  const showSkeletons =
    !showBoardsBody &&
    loading &&
    displayPosts.length === 0 &&
    posts.length === 0;
  const showRefetchHint =
    !showBoardsBody && loading && displayPosts.length > 0;

  const activeBoard = boards.find((b) => b.id === activeBoardId) ?? null;

  useEffect(() => {
    const section = sectionRef.current;
    const scroller = scrollRef.current;
    if (!section || !scroller) return;

    const onWheel = (e: WheelEvent) => {
      e.stopPropagation();
      const { scrollTop, scrollHeight, clientHeight } = scroller;
      const canScroll = scrollHeight > clientHeight + 1;
      const atTop = scrollTop <= 0 && e.deltaY < 0;
      const atBottom =
        scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;
      if (!canScroll || atTop || atBottom) {
        e.preventDefault();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.stopPropagation();
    };

    section.addEventListener("wheel", onWheel, { passive: false });
    scroller.addEventListener("wheel", onWheel, { passive: false });
    section.addEventListener("touchmove", onTouchMove, { passive: true });
    scroller.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      section.removeEventListener("wheel", onWheel);
      scroller.removeEventListener("wheel", onWheel);
      section.removeEventListener("touchmove", onTouchMove);
      scroller.removeEventListener("touchmove", onTouchMove);
    };
  }, [showDraftsBody]);

  function flushSearchTopic(raw: string) {
    if (searchDebounceTimerRef.current != null) {
      window.clearTimeout(searchDebounceTimerRef.current);
      searchDebounceTimerRef.current = null;
    }
    onCompetitorsTopicSearch?.(raw.trim());
  }

  function commitSearchTopic(raw: string) {
    flushSearchTopic(raw);
  }

  function clearSearch() {
    if (searchDebounceTimerRef.current != null) {
      window.clearTimeout(searchDebounceTimerRef.current);
      searchDebounceTimerRef.current = null;
    }
    skipSearchDebounceRef.current = true;
    setSearchQuery("");
    if (showCompetitorsSearch && competitorsPanel === "competitors") {
      onCompetitorsTopicSearch?.("");
    }
  }

  function createEmptyBoard() {
    const board = addBoard([], "Новая доска");
    setActiveBoardId(board.id);
    setCompetitorsPanel("boards");
    setBoardsMenuOpen(false);
    setRenamingBoardId(null);
    setRenameDraft(board.title);
  }

  function commitRenameFor(boardId: string) {
    if (!renameDraft.trim()) {
      setRenamingBoardId(null);
      return;
    }
    renameBoard(boardId, renameDraft.trim());
    setRenamingBoardId(null);
  }

  function openBoardsUpload() {
    if (competitorsPanel !== "boards" || boardsUploadBusy) return;
    boardsUploadRef.current?.click();
  }

  function onBoardsFileChange(files: FileList | null) {
    if (!files?.length) return;
    setBoardsUploadBusy(true);
    void (async () => {
      try {
        const urls: string[] = [];
        for (const file of Array.from(files)) {
          if (!file.type.startsWith("image/")) continue;
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result ?? ""));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });
          if (dataUrl) urls.push(dataUrl);
        }
        if (urls.length > 0) {
          const board = addBoard(urls);
          setActiveBoardId(board.id);
          setCompetitorsPanel("boards");
        }
      } finally {
        setBoardsUploadBusy(false);
        if (boardsUploadRef.current) {
          boardsUploadRef.current.value = "";
        }
      }
    })();
  }

  const sortMenu = sortOpen ? (
    <div
      data-testid="feed-sort-menu"
      className="absolute left-0 top-[calc(100%+4px)] z-30 min-w-[9rem] rounded-lg border border-[var(--border-glass)] bg-[var(--bg-elevated)] py-1 shadow-lg"
    >
      {(
        [
          { id: "newest" as const, label: "Сначала новые" },
          { id: "oldest" as const, label: "Сначала старые" },
          { id: "engagement" as const, label: "По охвату" },
        ] as const
      ).map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={cn(
            "block w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[var(--bg-hover)]",
            feedSort === opt.id && "text-[var(--accent-gold)]",
          )}
          onClick={() => {
            setFeedSort(opt.id);
            setSortOpen(false);
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  ) : null;

  const filterMenu = filterOpen ? (
    <div
      data-testid="feed-filter-menu"
      className="absolute left-0 top-[calc(100%+4px)] z-30 min-w-[9rem] rounded-lg border border-[var(--border-glass)] bg-[var(--bg-elevated)] py-1 shadow-lg"
    >
      {(
        [
          { id: "all" as const, label: "Все" },
          { id: "carousel" as const, label: "Карусели" },
          { id: "video" as const, label: "Видео" },
          { id: "image" as const, label: "Фото" },
        ] as const
      ).map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={cn(
            "block w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[var(--bg-hover)]",
            feedFilter === opt.id && "text-[var(--accent-gold)]",
          )}
          onClick={() => {
            setFeedFilter(opt.id);
            setFilterOpen(false);
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  ) : null;

  function renderSearchRow(opts: {
    searchTestId: string;
    ariaLabel: string;
    placeholder: string;
    /** S51: stable upload slot — always mounted on competitors column; disabled on Конкуренты */
    stableBoardsUpload?: boolean;
  }) {
    const uploadDisabled =
      !opts.stableBoardsUpload ||
      competitorsPanel !== "boards" ||
      boardsUploadBusy;

    return (
      <div
        className="flex min-h-[34px] min-w-0 flex-1 flex-wrap items-center gap-2"
        data-testid={`${tone}-toolbar-row`}
      >
        <div className="relative shrink-0">
          <ToolbarIconButton
            testId={`${tone}-sort-btn`}
            label="Сортировка"
            active={feedSort !== "newest"}
            onClick={() => {
              setSortOpen((v) => !v);
              setFilterOpen(false);
              setBoardsMenuOpen(false);
            }}
          >
            <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
          </ToolbarIconButton>
          {sortMenu}
        </div>
        <div className="relative shrink-0">
          <ToolbarIconButton
            testId={`${tone}-filter-btn`}
            label="Фильтр"
            active={feedFilter !== "all"}
            onClick={() => {
              setFilterOpen((v) => !v);
              setSortOpen(false);
              setBoardsMenuOpen(false);
            }}
          >
            <Filter className="h-3.5 w-3.5" aria-hidden />
          </ToolbarIconButton>
          {filterMenu}
        </div>

        {/* S51: Upload icon-only ALWAYS right of filter — gray disabled on Конкуренты */}
        {opts.stableBoardsUpload ? (
          <>
            <button
              type="button"
              data-testid="boards-upload-btn"
              aria-label="Загрузить"
              title="Загрузить"
              disabled={uploadDisabled}
              onClick={openBoardsUpload}
              className={cn(
                "inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-[var(--border-glass)]",
                competitorsPanel === "boards"
                  ? "bg-[color-mix(in_srgb,var(--accent-gold)_14%,transparent)] text-white hover:bg-[color-mix(in_srgb,var(--accent-gold)_24%,transparent)]"
                  : "bg-[rgba(0,0,0,0.15)] text-[var(--text-muted)]",
                "disabled:cursor-not-allowed disabled:opacity-40",
              )}
            >
              <Upload className="h-3.5 w-3.5" aria-hidden />
            </button>
            <input
              ref={boardsUploadRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              data-testid="boards-upload-input"
              onChange={(e) => {
                onBoardsFileChange(e.target.files);
              }}
            />
          </>
        ) : null}

        <div
          className={cn(
            "relative flex h-[34px] min-w-[8rem] flex-1 items-center rounded-lg border border-[var(--border-glass)]",
            "bg-[rgba(0,0,0,0.2)] px-2.5",
          )}
        >
          <Search
            className="mr-2 h-3.5 w-3.5 shrink-0 text-[var(--text-mono)]"
            aria-hidden
          />
          <input
            type="search"
            data-testid={opts.searchTestId}
            aria-label={opts.ariaLabel}
            placeholder={opts.placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                showCompetitorsSearch &&
                competitorsPanel === "competitors"
              ) {
                e.preventDefault();
                commitSearchTopic(searchQuery);
              }
            }}
            className={cn(
              "h-full min-w-0 flex-1 bg-transparent py-1.5 text-xs",
              "text-[var(--text-primary)] placeholder:text-[var(--text-mono)]",
              "outline-none focus-visible:outline-none",
            )}
          />
          <AnimatePresence mode="popLayout" initial={false}>
            {searchQuery.length > 0 ? (
              <motion.button
                key="clear"
                type="button"
                aria-label="Очистить поиск"
                onClick={clearSearch}
                className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--text-mono)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.85 }
                }
                transition={reduceMotion ? INSTANT : SPRING}
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <section
      ref={sectionRef}
      data-testid={testId ?? `carousel-${tone}`}
      data-layout={layout}
      data-ours-tab={showTabs ? oursTab : undefined}
      className={cn(
        "relative flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-xl",
        "overscroll-y-contain border border-[var(--border-glass)] bg-[var(--bg-elevated)]",
        className,
      )}
    >
      <header
        className="flex shrink-0 flex-col gap-1 border-b border-[var(--border-glass)] px-3 py-2"
        data-testid={showRefetchHint ? "feed-refetching" : undefined}
        aria-busy={showRefetchHint || undefined}
      >
        {/* S50: no orange/gold accent dots left of Наши/Конкуренты */}
        <div className="flex items-center gap-2 opacity-100">
          <h2 className="text-sm font-semibold tracking-tight text-[var(--text-primary)] opacity-100">
            {title}
          </h2>
          {showRefetchHint ? (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-blue-bright)] opacity-70"
              aria-hidden
              title="Обновление ленты"
            />
          ) : null}
          <span className="ml-auto font-[family-name:var(--font-mono-jb)] text-[10px] text-white opacity-100">
            {visibleHeaderCount}
          </span>
        </div>

        {showHeaderChrome ? (
          <div className="mt-1 flex min-h-[34px] flex-col gap-2">
            {showTabs ? (
              <div className="flex min-h-[34px] flex-wrap items-center gap-2">
                <div
                  className="relative flex shrink-0 gap-1 rounded-lg border border-[var(--border-glass)] bg-[rgba(0,0,0,0.2)] p-0.5"
                  role="tablist"
                  aria-label="Вкладки нашей ленты"
                >
                  {(
                    [
                      {
                        id: "published" as const,
                        label: "Опубликовано",
                        testId: "ours-tab-published",
                      },
                      {
                        id: "drafts" as const,
                        label: "Черновики",
                        testId: "ours-tab-drafts",
                      },
                    ] as const
                  ).map((tab) => {
                    const active = oursTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        data-testid={tab.testId}
                        onClick={() => setOursTab(tab.id)}
                        className={cn(
                          "relative z-10 flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                          "text-white",
                        )}
                      >
                        {active && !reduceMotion ? (
                          <motion.span
                            layoutId="ours-tab-pill"
                            className="absolute inset-0 -z-10 rounded-md bg-[color-mix(in_srgb,var(--accent-gold)_14%,transparent)]"
                            transition={TAB_SPRING}
                            aria-hidden
                          />
                        ) : active ? (
                          <span
                            className="absolute inset-0 -z-10 rounded-md bg-[color-mix(in_srgb,var(--accent-gold)_14%,transparent)]"
                            aria-hidden
                          />
                        ) : null}
                        <span className="relative z-10 text-white">
                          {tab.label}
                        </span>
                        {tab.id === "drafts" && drafts.length > 0 ? (
                          <span className="relative z-10 ml-1 font-[family-name:var(--font-mono-jb)] text-[9px] text-white">
                            {drafts.length}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                {showOursSearch && oursTab === "published"
                  ? renderSearchRow({
                      searchTestId: "ours-search",
                      ariaLabel: "Поиск наших постов",
                      placeholder: "Поиск…",
                    })
                  : null}
              </div>
            ) : null}

            {showCompetitorsSearch ? (
              <div
                className="flex min-h-[34px] flex-wrap items-center gap-2"
                data-testid="competitors-boards-switch"
              >
                <div
                  className="relative flex shrink-0 gap-1 rounded-lg border border-[var(--border-glass)] bg-[rgba(0,0,0,0.2)] p-0.5"
                  role="tablist"
                  aria-label="Конкуренты или доски"
                  data-testid="boards-dropdown"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={competitorsPanel === "competitors"}
                    data-testid="competitors-panel-competitors"
                    onClick={() => {
                      setCompetitorsPanel("competitors");
                      setBoardsMenuOpen(false);
                      setRenamingBoardId(null);
                      setSortOpen(false);
                      setFilterOpen(false);
                    }}
                    className="relative z-10 rounded-md px-2.5 py-1.5 text-xs font-medium text-white"
                  >
                    {competitorsPanel === "competitors" && !reduceMotion ? (
                      <motion.span
                        layoutId="competitors-panel-pill"
                        className="absolute inset-0 -z-10 rounded-md bg-[color-mix(in_srgb,var(--accent-terracotta)_18%,transparent)]"
                        transition={TAB_SPRING}
                        aria-hidden
                      />
                    ) : competitorsPanel === "competitors" ? (
                      <span
                        className="absolute inset-0 -z-10 rounded-md bg-[color-mix(in_srgb,var(--accent-terracotta)_18%,transparent)]"
                        aria-hidden
                      />
                    ) : null}
                    <span className="relative z-10 text-white">Конкуренты</span>
                  </button>

                  {/* S51: dropdown opens FROM «Доски» segment — no extra boards button */}
                  <div className="relative z-10">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={competitorsPanel === "boards"}
                      aria-expanded={boardsMenuOpen}
                      data-testid="competitors-panel-boards"
                      data-boards-dropdown-trigger="true"
                      onClick={() => {
                        setCompetitorsPanel("boards");
                        setSortOpen(false);
                        setFilterOpen(false);
                        setBoardsMenuOpen((open) =>
                          competitorsPanel === "boards" ? !open : true,
                        );
                      }}
                      className="relative inline-flex max-w-[10rem] items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-white"
                    >
                      {competitorsPanel === "boards" && !reduceMotion ? (
                        <motion.span
                          layoutId="competitors-panel-pill"
                          className="absolute inset-0 -z-10 rounded-md bg-[color-mix(in_srgb,var(--accent-terracotta)_18%,transparent)]"
                          transition={TAB_SPRING}
                          aria-hidden
                        />
                      ) : competitorsPanel === "boards" ? (
                        <span
                          className="absolute inset-0 -z-10 rounded-md bg-[color-mix(in_srgb,var(--accent-terracotta)_18%,transparent)]"
                          aria-hidden
                        />
                      ) : null}
                      <span className="relative z-10 inline-flex min-w-0 items-center gap-1 text-white">
                        <LayoutGrid
                          className="h-3 w-3 shrink-0 opacity-80"
                          aria-hidden
                        />
                        <span className="truncate">
                          {activeBoard?.title ?? "Доски"}
                        </span>
                        <ChevronDown
                          className="h-3 w-3 shrink-0 opacity-70"
                          aria-hidden
                        />
                      </span>
                    </button>

                    {boardsMenuOpen ? (
                      <div
                        data-testid="boards-dropdown-menu"
                        className="absolute left-0 top-[calc(100%+6px)] z-40 w-[14rem] rounded-lg border border-[var(--border-glass)] bg-[var(--bg-elevated)] p-2 shadow-lg"
                      >
                        <ul className="mb-2 max-h-40 overflow-y-auto">
                          {boards.length === 0 ? (
                            <li className="px-2 py-2 text-xs text-[var(--text-muted)]">
                              Пока нет досок
                            </li>
                          ) : (
                            boards.map((b) => (
                              <li key={b.id}>
                                {renamingBoardId === b.id ? (
                                  <input
                                    autoFocus
                                    data-testid="boards-rename-input"
                                    value={renameDraft}
                                    onChange={(e) =>
                                      setRenameDraft(e.target.value)
                                    }
                                    onBlur={() => commitRenameFor(b.id)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        commitRenameFor(b.id);
                                      }
                                      if (e.key === "Escape") {
                                        e.preventDefault();
                                        setRenamingBoardId(null);
                                      }
                                    }}
                                    className="w-full rounded-md border border-[var(--border-glass)] bg-[rgba(0,0,0,0.25)] px-2 py-1.5 text-xs text-white outline-none"
                                    aria-label="Переименовать доску"
                                  />
                                ) : (
                                  <button
                                    type="button"
                                    data-testid={`boards-option-${b.id}`}
                                    className={cn(
                                      "block w-full truncate rounded-md px-2 py-1.5 text-left text-xs text-white hover:bg-[var(--bg-hover)]",
                                      b.id === activeBoardId &&
                                        "bg-[color-mix(in_srgb,var(--accent-gold)_12%,transparent)]",
                                    )}
                                    /* Keep menu open on select so double-click can rename (S51) */
                                    onClick={() => {
                                      setActiveBoardId(b.id);
                                      setRenameDraft(b.title);
                                      setRenamingBoardId(null);
                                    }}
                                    onDoubleClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setActiveBoardId(b.id);
                                      setRenameDraft(b.title);
                                      setRenamingBoardId(b.id);
                                    }}
                                  >
                                    {b.title}
                                  </button>
                                )}
                              </li>
                            ))
                          )}
                        </ul>
                        <div className="border-t border-[var(--border-glass)] pt-2">
                          <button
                            type="button"
                            data-testid="boards-create-btn"
                            onClick={createEmptyBoard}
                            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-white hover:bg-[var(--bg-hover)]"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden />
                            Создать доску
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {renderSearchRow({
                  searchTestId: "competitors-search",
                  ariaLabel:
                    competitorsPanel === "boards"
                      ? "Поиск по доскам"
                      : "Поиск конкурентов",
                  placeholder:
                    competitorsPanel === "boards"
                      ? "Поиск по доскам…"
                      : "Поиск по названию или теме…",
                  stableBoardsUpload: true,
                })}
              </div>
            ) : null}
          </div>
        ) : null}

        {subtitle && (!showTabs || oursTab === "published") ? (
          <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
        ) : null}
      </header>

      <div
        key={
          showDraftsBody
            ? "drafts"
            : showBoardsBody
              ? "boards"
              : "published"
        }
        ref={scrollRef}
        className={cn(
          /* S50 CRITICAL: minimal bottom pad — feed flush to column bottom */
          "min-h-0 flex-1 overflow-y-auto overscroll-contain overscroll-y-contain px-2 pb-1 pt-1",
          "touch-pan-y scroll-smooth",
          "[scrollbar-width:thin]",
          "[scrollbar-color:color-mix(in_srgb,var(--accent-gold)_55%,var(--accent-blue))_rgba(255,255,255,0.06)]",
          "[&::-webkit-scrollbar]:w-2",
          "[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[rgba(255,255,255,0.06)]",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:bg-[color-mix(in_srgb,var(--accent-gold)_50%,var(--accent-blue))]",
          showDraftsBody || showBoardsBody
            ? "flex flex-col"
            : "grid grid-cols-2 content-start items-start gap-2",
        )}
        data-testid={`${testId ?? `carousel-${tone}`}-scroll`}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {showDraftsBody ? (
          <DraftsPanel
            onSelectDraft={onSelectDraft}
            aspectRatio={aspectRatio}
            layout={layout}
            moduleId={moduleId}
          />
        ) : showBoardsBody ? (
          <BoardsPanel
            aspectRatio={aspectRatio}
            layout={layout}
            moduleId={moduleId}
            onRazborClick={onRazborClick}
            activeBoardId={activeBoardId}
            searchQuery={searchQuery}
          />
        ) : showSkeletons ? (
          <>
            {Array.from({ length: skeletonCount }, (_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "animate-pulse rounded-xl bg-[rgba(255,255,255,0.04)]",
                  `${skeletonAspect} w-full`,
                )}
                initial={reduceMotion ? false : { opacity: 0.4 }}
                animate={{
                  opacity: reduceMotion ? 0.5 : [0.35, 0.55, 0.35],
                }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: 1.4,
                        repeat: Infinity,
                        delay: i * 0.08,
                      }
                }
              />
            ))}
          </>
        ) : displayPosts.length === 0 ? (
          <motion.p
            className={cn(
              "col-span-2 px-2 py-8 text-center text-sm text-[var(--text-muted)]",
            )}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduceMotion ? INSTANT : SPRING}
          >
            {emptyLabel}
          </motion.p>
        ) : (
          displayPosts.map((post, index) => (
            <FeedPostCard
              key={post.id}
              post={post}
              index={index}
              aspectRatio={aspectRatio}
              layout={layout}
              moduleId={moduleId}
              showRazborButton={showRazborButton}
              onRazborClick={onRazborClick}
              showEditorButton={showEditorButton}
              onEditorClick={onEditorClick}
            />
          ))
        )}
      </div>
    </section>
  );
}
