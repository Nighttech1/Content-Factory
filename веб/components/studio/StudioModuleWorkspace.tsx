"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { DraftEmptyBlock } from "@/components/studio/workspace/DraftEmptyBlock";
import type { DraftEmptyMode } from "@/components/studio/workspace/DraftEmptyBlock";
import { VerticalPostCarousel } from "@/components/studio/workspace/VerticalPostCarousel";
import type { FeedPostCardAspect } from "@/components/studio/workspace/FeedPostCard";
import {
  findStudioModule,
  STUDIO_MODULES,
} from "@/components/studio/modules";
import { isCapCutModule } from "@/lib/studio/capcut-gate";
import {
  DEFAULT_REELS_PAGE_SIZE,
  readReelsPageSizeFromStorage,
} from "@/lib/settings/reels-display";
import { GlowButton } from "@/components/ui/glow-button";
import { ReelsFrameworkPanel } from "@/components/studio/reels/ReelsFrameworkPanel";
import type { CarouselDraft } from "@/lib/studio/carousel-draft-types";
import {
  bootstrapFeed,
  FEED_FETCH_TIMEOUT_MS,
  feedHasPosts,
  readFeedCache,
  shouldSkipFeedNetworkFetch,
  writeFeedCache,
} from "@/lib/studio/feed-client-cache";
import type {
  FeedPost,
  FeedResponse,
  FeedSourceMode,
} from "@/lib/studio/feed-types";
import { SCOUT_SNAPSHOT_UPDATED_EVENT } from "@/lib/settings/scout-search-config";
import { useSessionStore } from "@/lib/session-store";
import { useStudioStore } from "@/lib/studio-store";
import { cn } from "@/lib/cn";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

/** C-63 — defer heavy modals; mount only when open */
const RazborModal = dynamic(
  () =>
    import("@/components/studio/workspace/RazborModal").then(
      (m) => m.RazborModal,
    ),
  { ssr: false },
);

const CreateCarouselModal = dynamic(
  () =>
    import("@/components/studio/workspace/CreateCarouselModal").then(
      (m) => m.CreateCarouselModal,
    ),
  { ssr: false },
);

/** C-142 — drawer not needed for first paint of module feed */
const GenerationDrawer = dynamic(
  () =>
    import("@/components/studio/GenerationDrawer").then(
      (m) => m.GenerationDrawer,
    ),
  { ssr: false },
);

type StudioModuleWorkspaceProps = {
  moduleId: string;
};

function newDraftId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `draft-${crypto.randomUUID()}`;
  }
  return `draft-${Date.now().toString(36)}`;
}

export function StudioModuleWorkspace({ moduleId }: StudioModuleWorkspaceProps) {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const role = useSessionStore((s) => s.role);
  const customModules = useStudioStore((s) => s.customModules);
  const hydrateCustomModules = useStudioStore((s) => s.hydrateCustomModules);
  const setSelectedModuleId = useStudioStore((s) => s.setSelectedModuleId);

  const isCore = STUDIO_MODULES.some((m) => m.id === moduleId);
  const [customReady, setCustomReady] = useState(isCore);

  /** C-142 — paint fixtures immediately (same on SSR + client; cache upgrades in layout). */
  const initialBoot = useMemo(() => bootstrapFeed(moduleId), [moduleId]);
  const [ours, setOurs] = useState<FeedPost[]>(() => initialBoot.ours);
  const [competitors, setCompetitors] = useState<FeedPost[]>(
    () => initialBoot.competitors,
  );
  /** Skeleton only when nothing painted yet (empty custom modules). */
  const [feedLoading, setFeedLoading] = useState(
    () => !feedHasPosts(initialBoot),
  );
  /** Soft background refresh — keeps cards visible (refetch hint). */
  const [feedRefreshing, setFeedRefreshing] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [committedTopic, setCommittedTopic] = useState<string | null>(null);
  const [competitorsLoading, setCompetitorsLoading] = useState(false);
  /** C-30 Razbor — isolated from GenerationDrawer / SSE */
  const [razborPost, setRazborPost] = useState<FeedPost | null>(null);
  const [razborPreviewDraft, setRazborPreviewDraft] =
    useState<CarouselDraft | null>(null);
  /** C-65 Create carousel — separate from Razbor / Drafts */
  const [createCarouselOpen, setCreateCarouselOpen] = useState(false);
  /** C-31: open Drafts from empty-draft CTA on carousel (never CapCut) */
  const [openDraftsNonce, setOpenDraftsNonce] = useState(0);
  /** C-50 — dual-feed page size from Settings (localStorage) */
  const [reelsPageSize, setReelsPageSize] = useState(DEFAULT_REELS_PAGE_SIZE);
  const paintedPostsRef = useRef(feedHasPosts(initialBoot));
  const feedAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;
    void hydrateCustomModules().finally(() => {
      if (!cancelled) setCustomReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [hydrateCustomModules]);

  useEffect(() => {
    setReelsPageSize(readReelsPageSizeFromStorage());
  }, []);

  const mod = findStudioModule(moduleId, customModules);

  useEffect(() => {
    if (mod) setSelectedModuleId(moduleId);
  }, [mod, moduleId, setSelectedModuleId]);

  /** Apply last-known cache before paint when module changes (no blank wait). */
  useLayoutEffect(() => {
    const boot = bootstrapFeed(moduleId);
    const cached = readFeedCache(moduleId);
    const next = cached ?? boot;
    setOurs(next.ours);
    setCompetitors(next.competitors);
    paintedPostsRef.current = feedHasPosts(next);
    setFeedLoading(!paintedPostsRef.current);
    setFeedRefreshing(true);
    setFeedError(null);
    setCommittedTopic(null);
  }, [moduleId]);

  const applyFeedResponse = useCallback(
    (data: FeedResponse, mode: "full" | "competitors") => {
      const nextMode: FeedSourceMode =
        data.sourceMode === "live" || data.sourceMode === "mock"
          ? data.sourceMode
          : "mock";
      if (mode === "full") {
        const oursNext = Array.isArray(data.ours) ? data.ours : [];
        const competitorsNext = Array.isArray(data.competitors)
          ? data.competitors
          : [];
        setOurs(oursNext);
        setCompetitors(competitorsNext);
        paintedPostsRef.current =
          oursNext.length > 0 || competitorsNext.length > 0;
        writeFeedCache(moduleId, {
          ours: oursNext,
          competitors: competitorsNext,
          sourceMode: nextMode,
        });
      } else {
        const competitorsNext = Array.isArray(data.competitors)
          ? data.competitors
          : [];
        setCompetitors(competitorsNext);
        paintedPostsRef.current =
          paintedPostsRef.current || competitorsNext.length > 0;
      }
    },
    [moduleId],
  );

  const fetchFeed = useCallback(
    async (topic?: string, mode: "full" | "competitors" = "full") => {
      if (mode === "full") {
        if (!paintedPostsRef.current) setFeedLoading(true);
        setFeedRefreshing(true);
      } else {
        setCompetitorsLoading(true);
      }
      setFeedError(null);

      feedAbortRef.current?.abort();
      const controller = new AbortController();
      feedAbortRef.current = controller;
      const timeoutId = window.setTimeout(() => {
        controller.abort();
      }, FEED_FETCH_TIMEOUT_MS);

      try {
        const params = new URLSearchParams();
        if (topic && topic.trim()) {
          params.set("topic", topic.trim());
        }
        const qs = params.toString() ? `?${params.toString()}` : "";
        const res = await fetch(
          `/api/studio/${encodeURIComponent(moduleId)}/feed${qs}`,
          { signal: controller.signal },
        );

        if (res.status === 404) {
          if (!paintedPostsRef.current) {
            setOurs([]);
            setCompetitors([]);
          }
          setFeedError("module_not_found");
          return;
        }

        if (!res.ok) {
          if (!paintedPostsRef.current) {
            setFeedError(`feed_error_${res.status}`);
          }
          return;
        }

        const data = (await res.json()) as FeedResponse;
        applyFeedResponse(data, mode);
      } catch (err) {
        const aborted =
          err instanceof DOMException
            ? err.name === "AbortError"
            : err instanceof Error && err.name === "AbortError";
        // C-142 soft-fail: timeout/network → keep fixtures/cache; no blank.
        if (!aborted && !paintedPostsRef.current) {
          setFeedError("feed_network");
        }
      } finally {
        window.clearTimeout(timeoutId);
        // Only the active request may clear flags (avoids abort race on module change).
        if (feedAbortRef.current === controller) {
          feedAbortRef.current = null;
          setFeedLoading(false);
          setFeedRefreshing(false);
          setCompetitorsLoading(false);
        }
      }
    },
    [applyFeedResponse, moduleId],
  );

  /**
   * S51 / S52 — mount / module switch: fetch feed snapshot once (0 Apify).
   * Skip network when localStorage live cache is still fresh (no focus refetch).
   * Topic search always forces network via handleCompetitorsTopicSearch.
   * Never calls /scout/run from this surface.
   */
  useEffect(() => {
    if (shouldSkipFeedNetworkFetch(moduleId)) {
      setFeedLoading(false);
      setFeedRefreshing(false);
      return;
    }
    void fetchFeed(undefined, "full");
    return () => {
      feedAbortRef.current?.abort();
    };
  }, [fetchFeed, moduleId]);

  /** S52 — after Scout «Разведать», refresh competitors from new snapshot. */
  useEffect(() => {
    function onScoutSnap(ev: Event) {
      const detail = (ev as CustomEvent<{ moduleId?: string }>).detail;
      if (detail?.moduleId && detail.moduleId !== moduleId) return;
      void fetchFeed(undefined, "competitors");
    }
    window.addEventListener(SCOUT_SNAPSHOT_UPDATED_EVENT, onScoutSnap);
    return () => {
      window.removeEventListener(SCOUT_SNAPSHOT_UPDATED_EVENT, onScoutSnap);
    };
  }, [fetchFeed, moduleId]);

  /**
   * C-49: topic via Competitors search (replaces ModuleIdeaBar).
   * C-61: must be useCallback — unstable fn retriggers carousel debounce forever.
   */
  const handleCompetitorsTopicSearch = useCallback(
    (topic: string) => {
      const next = topic.trim();
      setCommittedTopic(next || null);
      void fetchFeed(next || undefined, "competitors");
    },
    [fetchFeed],
  );

  /** C-31/C-53: CapCut for reels; all other modules open Drafts tab. */
  const openDraftEditor = useCallback(() => {
    if (isCapCutModule(moduleId)) {
      const id = newDraftId();
      router.push(`/studio/${encodeURIComponent(moduleId)}/edit/${id}`);
      return;
    }
    setOpenDraftsNonce((n) => n + 1);
  }, [moduleId, router]);

  /** C-drafts-always: switch Ours → Черновики after Create draw/publish. */
  const bumpOpenDraftsNonce = useCallback(() => {
    setOpenDraftsNonce((n) => n + 1);
  }, []);

  function openCompetitorEditor(post: FeedPost) {
    if (!isCapCutModule(moduleId)) return;
    const draftId = `ref-${post.id}`;
    const qs = `?ref=${encodeURIComponent(post.id)}`;
    router.push(
      `/studio/${encodeURIComponent(moduleId)}/edit/${encodeURIComponent(draftId)}${qs}`,
    );
  }

  function openRazbor(post: FeedPost) {
    setRazborPreviewDraft(null);
    setRazborPost(post);
  }

  function openDraftPreview(draft: CarouselDraft) {
    const source =
      competitors.find((p) => p.id === draft.sourceCompetitorId) ?? null;
    if (source) {
      setRazborPreviewDraft(draft);
      setRazborPost(source);
    } else {
      setRazborPreviewDraft(draft);
      setRazborPost({
        id: draft.sourceCompetitorId,
        source: "competitor",
        title: draft.title,
        thumbUrl: draft.slides[0]?.imageUrl,
        metrics: { likes: 0, views: 0 },
        sourceMode: "mock",
      });
    }
  }

  function closeRazbor() {
    setRazborPost(null);
    setRazborPreviewDraft(null);
  }

  const unknown = customReady && !mod;
  const showDraft = Boolean(committedTopic);
  const isCarouselEngine = moduleId === "carousel-engine";
  /** C-117: custom-reels is not CapCut, but uses the same 9:16 dual-feed chrome. */
  const isCustomReels = moduleId === "custom-reels";
  const isReels = isCapCutModule(moduleId);
  /** C-120: 2-up dense cards in all feed sections (compact grid chrome). */
  const feedLayout = "grid" as const;
  /** C-121: carousel/other = 4:5; reels modules = 9:16. */
  const feedAspect: FeedPostCardAspect =
    isReels || isCustomReels ? "9/16" : "4/5";
  const draftMode: DraftEmptyMode = isReels ? "capcut" : "drafts";
  const competitorsEmptyLabel = isCarouselEngine
    ? committedTopic
      ? "Нет каруселей по этой теме — попробуйте другую формулировку"
      : "Пока нет каруселей ниши"
    : isCustomReels || isReels
      ? committedTopic
        ? "Нет рилсов по этой теме — попробуйте другую формулировку"
        : "Пока нет рилсов ниши"
      : committedTopic
        ? "Нет постов по этой теме — попробуйте другую формулировку"
        : "Пока нет постов ниши";

  /** C-50: client slice after hydrate; both columns share pageSize. */
  const oursView = useMemo(
    () => ours.slice(0, reelsPageSize),
    [ours, reelsPageSize],
  );
  const competitorsView = useMemo(
    () => competitors.slice(0, reelsPageSize),
    [competitors, reelsPageSize],
  );

  return (
    <>
      <motion.div
        data-testid="studio-module-page"
        data-module-id={moduleId}
        data-capcut-allowed={isReels ? "true" : "false"}
        className="relative flex flex-col gap-3 pb-0"
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : SPRING}
      >
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
              {mod?.label ?? moduleId}
            </h1>
            {mod ? (
              <div
                data-testid="module-top-nav"
                className="flex flex-wrap items-center justify-end gap-2"
              >
                {/* C-136 — Mesh + Analytics live on module top bar, not sidebar */}
                {role === "OWNER" ? (
                  <Link
                    href={`/studio/${encodeURIComponent(moduleId)}/mesh`}
                    data-testid="module-top-mesh"
                    className={cn(
                      "inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border-glass)] bg-[var(--bg-elevated)] px-3.5 py-2 text-sm text-[var(--text-primary)] transition-colors",
                      "hover:border-[color-mix(in_srgb,var(--accent-blue-bright)_40%,var(--border-glass))] hover:text-[var(--accent-blue-bright)]",
                    )}
                  >
                    Команда выпуска
                  </Link>
                ) : null}
                <Link
                  href={`/studio/${encodeURIComponent(moduleId)}/analytics`}
                  data-testid="module-top-analytics"
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border-glass)] bg-[var(--bg-elevated)] px-3.5 py-2 text-sm text-[var(--text-primary)] transition-colors",
                    "hover:border-[color-mix(in_srgb,var(--accent-blue-bright)_40%,var(--border-glass))] hover:text-[var(--accent-blue-bright)]",
                  )}
                >
                  Аналитика
                </Link>
                {isCarouselEngine ? (
                  <GlowButton
                    data-testid="create-carousel-btn"
                    onClick={() => setCreateCarouselOpen(true)}
                  >
                    Создать карусель
                  </GlowButton>
                ) : (
                  <GlowButton
                    data-testid="workspace-create-btn"
                    onClick={openDraftEditor}
                  >
                    Создать
                  </GlowButton>
                )}
              </div>
            ) : null}
          </div>
          {mod && !isCarouselEngine ? (
            <p className="max-w-2xl text-[var(--text-muted)]">
              {mod.description}
            </p>
          ) : unknown ? (
            <p className="max-w-2xl text-[var(--text-muted)]">
              Модуль с id «{moduleId}» не найден. Вернитесь на Студию и выберите
              канал из сетки.
            </p>
          ) : !mod ? (
            <p className="max-w-2xl text-[var(--text-muted)]">Загрузка модуля…</p>
          ) : null}
        </header>

        {!unknown ? (
          <>
            {isCustomReels ? <ReelsFrameworkPanel /> : null}

            {showDraft && committedTopic ? (
              <DraftEmptyBlock
                topic={committedTopic}
                onOpen={openDraftEditor}
                mode={draftMode}
              />
            ) : null}

            {feedError === "module_not_found" ? (
              <p
                data-testid="feed-error"
                className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-muted)]"
              >
                Лента для этого модуля недоступна (404). Custom-плагины могут
                быть пустыми.
              </p>
            ) : null}

            <div className="flex flex-col gap-2">
              {/* S50 CRITICAL: push dual-feed near window bottom — no thick black dead band */}
              <div
                data-testid="workspace-dual-carousels"
                className="grid min-h-[28rem] grid-cols-1 gap-3 lg:grid-cols-2 lg:h-[calc(100dvh-11rem)] lg:min-h-0 lg:items-stretch"
              >
                <VerticalPostCarousel
                  title="Наши"
                  tone="ours"
                  moduleId={moduleId}
                  posts={oursView}
                  loading={
                    ours.length === 0
                      ? feedLoading
                      : feedRefreshing
                  }
                  emptyLabel="Пока нет наших постов"
                  testId="carousel-ours"
                  layout={feedLayout}
                  aspectRatio={feedAspect}
                  showDraftsButton={true}
                  openDraftsNonce={openDraftsNonce}
                  onSelectDraft={openDraftPreview}
                />
                <VerticalPostCarousel
                  title="Конкуренты"
                  tone="competitors"
                  moduleId={moduleId}
                  posts={competitorsView}
                  loading={
                    competitors.length === 0
                      ? feedLoading || competitorsLoading
                      : feedRefreshing || competitorsLoading
                  }
                  emptyLabel={competitorsEmptyLabel}
                  testId="carousel-competitors"
                  layout={feedLayout}
                  aspectRatio={feedAspect}
                  showRazborButton={!isCarouselEngine}
                  onRazborClick={
                    isCarouselEngine ? undefined : openRazbor
                  }
                  showEditorButton={isReels}
                  onEditorClick={isReels ? openCompetitorEditor : undefined}
                  onCompetitorsTopicSearch={handleCompetitorsTopicSearch}
                />
              </div>
            </div>
          </>
        ) : null}
      </motion.div>
      <GenerationDrawer />
      {razborPost ? (
        <RazborModal
          open
          post={razborPost}
          previewDraft={razborPreviewDraft}
          competitorPosts={competitors}
          onClose={closeRazbor}
          moduleId={moduleId}
        />
      ) : null}
      {createCarouselOpen ? (
        <CreateCarouselModal
          open
          onClose={() => setCreateCarouselOpen(false)}
          onDraftPersisted={bumpOpenDraftsNonce}
        />
      ) : null}
    </>
  );
}
