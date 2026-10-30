"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MessageCircle,
  Pause,
  Play,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { prefetchAll } from "@/lib/image-cache";
import {
  formatFollowersRu,
  resolveFollowersCountOrMock,
} from "@/lib/studio/format-followers-ru";
import {
  isPlayableVideoUrl,
  shouldShowFeedPlay,
} from "@/lib/studio/feed-play";
import type { FeedPost } from "@/lib/studio/feed-types";

/** C-49 Motion: damping ~28; click-only play (no autoplay). */
const CARD_SPRING = { type: "spring" as const, damping: 28, stiffness: 300 };
const PLAY_SPRING = { type: "spring" as const, damping: 28, stiffness: 340 };
const INSTANT = { duration: 0 } as const;
/**
 * S48 Motion — expensive horizontal L/R (extends C-131).
 * Primary = translateX; light opacity overlap; no black flash / mode=wait.
 */
const SLIDE_LR = {
  duration: 0.34,
  ease: [0.23, 1, 0.32, 1] as const,
};
const SLIDE_X = "14%";

const FONT_CG =
  "font-[family-name:var(--font-century-gothic)]" as const;

function formatMetric(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

function displayUsername(username: string): string {
  const trimmed = username.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export type FeedPostCardAspect = "4/5" | "3/5" | "9/16";
export type FeedPostCardLayout = "stack" | "grid";

type FeedPostCardProps = {
  post: FeedPost;
  index?: number;
  /** Default 4/5 (C-28). Carousel-engine stack 9/16 (C-64). Reels 9/16 (C-31). */
  aspectRatio?: FeedPostCardAspect;
  /** Compact body under media for dense grid. */
  layout?: FeedPostCardLayout;
  /** C-30/C-53: show «Разбор» on competitor cards (all workspace modules). */
  showRazborButton?: boolean;
  onRazborClick?: (post: FeedPost) => void;
  /** C-31: show «Открыть в редакторе» on competitor cards (reels only). */
  showEditorButton?: boolean;
  onEditorClick?: (post: FeedPost) => void;
  /** C-52: hide Play on IMAGE / aesthetic-graphics. */
  moduleId?: string;
  /**
   * S49 — show on-photo engagement metrics.
   * Default true; Boards force false.
   */
  showEngagement?: boolean;
  /**
   * S49 — show username/followers plaque.
   * Default: competitors only (`source !== "ours"`).
   */
  showUsernamePlaque?: boolean;
};

type EngagementItem = {
  key: string;
  label: string;
  value: number;
  Icon: typeof Eye;
};

/** S48 — always five metric slots (0 when API omits). */
function buildEngagement(post: FeedPost): EngagementItem[] {
  const m = post.metrics;
  return [
    { key: "views", label: "Просмотры", value: m.views ?? 0, Icon: Eye },
    { key: "likes", label: "Лайки", value: m.likes ?? 0, Icon: Heart },
    {
      key: "comments",
      label: "Комментарии",
      value: typeof m.comments === "number" ? m.comments : 0,
      Icon: MessageCircle,
    },
    {
      key: "shares",
      label: "Репосты",
      value: typeof m.shares === "number" ? m.shares : 0,
      Icon: Share2,
    },
    {
      key: "saves",
      label: "Сохранения",
      value: typeof m.saves === "number" ? m.saves : 0,
      Icon: Bookmark,
    },
  ];
}

export function FeedPostCard({
  post,
  index = 0,
  aspectRatio = "4/5",
  layout = "stack",
  showRazborButton = false,
  onRazborClick,
  showEditorButton = false,
  onEditorClick,
  moduleId,
  showEngagement = true,
  showUsernamePlaque,
}: FeedPostCardProps) {
  const reduceMotion = useReducedMotion();
  const [thumbBroken, setThumbBroken] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isOurs = post.source === "ours";
  const isGrid = layout === "grid";
  const showPlay = shouldShowFeedPlay(post, moduleId);
  const hasVideo = showPlay && isPlayableVideoUrl(post.mediaUrl);
  const slides = post.slideUrls ?? [];
  const hasSlides = slides.length >= 2;
  const slideCount = slides.length;
  const currentSlideUrl = hasSlides
    ? slides[Math.min(slideIndex, slideCount - 1)] ?? post.thumbUrl
    : post.thumbUrl;
  const usernameLabel = post.username
    ? displayUsername(post.username)
    : "";
  const followers = resolveFollowersCountOrMock(post);
  const engagement = buildEngagement(post);
  /** S49: Ours never show plaque; Boards can force off via prop. */
  const plaqueEnabled =
    showUsernamePlaque !== undefined ? showUsernamePlaque : !isOurs;
  const renderEngagement = showEngagement;
  const renderPlaque = plaqueEnabled && Boolean(usernameLabel);

  useEffect(() => {
    setThumbBroken(false);
    setPlaying(false);
    setSlideIndex(0);
    setSlideDir(1);
    const el = videoRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  }, [post.id, post.thumbUrl, post.mediaUrl]);

  useEffect(() => {
    setThumbBroken(false);
  }, [slideIndex, currentSlideUrl]);

  /** S48 preload — warm all slides when card mounts / slide set changes. */
  useEffect(() => {
    const urls = [
      ...(post.slideUrls ?? []),
      post.thumbUrl,
      post.mediaUrl && !isPlayableVideoUrl(post.mediaUrl) ? post.mediaUrl : undefined,
    ].filter((u): u is string => Boolean(u));
    if (urls.length === 0) return;
    void prefetchAll(urls);
  }, [post.id, post.slideUrls, post.thumbUrl, post.mediaUrl]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !hasVideo) return;
    if (playing) {
      void el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  }, [playing, hasVideo]);

  const aspectClass =
    aspectRatio === "9/16"
      ? "aspect-[9/16]"
      : aspectRatio === "3/5"
        ? "aspect-[3/5]"
        : "aspect-[4/5]";
  const showRazbor =
    showRazborButton && !isOurs && typeof onRazborClick === "function";
  const showEditor =
    showEditorButton && !isOurs && typeof onEditorClick === "function";
  const hasFooterActions = showRazbor || showEditor;
  const showThumb = Boolean(currentSlideUrl) && !thumbBroken;
  const playSize = isGrid ? "h-9 w-9" : "h-12 w-12";
  const iconSize = isGrid ? "h-3.5 w-3.5" : "h-5 w-5";
  /* S48 — metrics ≈2× S47 */
  const metricIconSize = isGrid ? "h-4 w-4" : "h-6 w-6";

  function togglePlay(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setPlaying((prev) => !prev);
  }

  function stepSlide(e: MouseEvent, delta: number) {
    e.stopPropagation();
    e.preventDefault();
    if (!hasSlides) return;
    setSlideDir(delta >= 0 ? 1 : -1);
    setSlideIndex((prev) => (prev + delta + slideCount) % slideCount);
  }

  const enterX = slideDir > 0 ? SLIDE_X : `-${SLIDE_X}`;
  const exitX = slideDir > 0 ? `-${SLIDE_X}` : SLIDE_X;

  return (
    <motion.article
      data-testid="feed-post-card"
      data-post-id={post.id}
      data-source={post.source}
      data-aspect={aspectRatio}
      data-layout={layout}
      data-playing={playing ? "true" : "false"}
      className={cn(
        /* C-121 / S48: never overflow-hidden on article — CTA must not clip */
        "w-full self-start overflow-visible rounded-xl border border-[var(--border-glass)]",
        "bg-[rgba(255,255,255,0.03)] shadow-[0_8px_28px_rgba(0,0,0,0.35)]",
        !isGrid && "shrink-0",
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
          hasFooterActions ? "rounded-t-xl" : "rounded-xl",
          "bg-[linear-gradient(160deg,#12151a_0%,#0a0c0f_55%,#141820_100%)]",
        )}
      >
        {hasVideo ? (
          <video
            ref={videoRef}
            src={post.mediaUrl}
            poster={showThumb ? currentSlideUrl : undefined}
            playsInline
            preload="metadata"
            muted={false}
            className="h-full w-full object-cover"
            onEnded={() => setPlaying(false)}
          />
        ) : showThumb ? (
          <div
            className="absolute inset-0 overflow-hidden"
            data-carousel-crossfade
            data-testid="feed-slide-crossfade"
            data-motion="s48-horizontal"
          >
            {reduceMotion ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentSlideUrl}
                alt=""
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setThumbBroken(true)}
              />
            ) : (
              <AnimatePresence initial={false} mode="sync" custom={slideDir}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                  key={currentSlideUrl}
                  src={currentSlideUrl}
                  alt=""
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0.35, x: enterX }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{
                    opacity: 0,
                    x: exitX,
                    transition: SLIDE_LR,
                  }}
                  transition={SLIDE_LR}
                  onError={() => setThumbBroken(true)}
                />
              </AnimatePresence>
            )}
          </div>
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <div
              className={cn(
                "h-16 w-16 rounded-full border border-[var(--border-glass)]",
                "bg-[color-mix(in_srgb,var(--accent-blue)_12%,transparent)]",
              )}
            />
          </div>
        )}

        {/* S49: single black plaque `username | followers` inside; Ours/Boards off */}
        {renderPlaque ? (
          <div
            data-testid="feed-username-plaque-row"
            className={cn(
              "absolute left-1.5 top-1.5 z-10 max-w-[92%]",
              !isGrid && "left-2.5 top-2.5",
            )}
          >
            <span
              data-testid="feed-username-plaque"
              className={cn(
                "inline-flex max-w-full items-center truncate rounded-md bg-black text-white",
                FONT_CG,
                isGrid
                  ? "px-2.5 py-1 text-[13px] leading-tight"
                  : "px-3 py-1.5 text-[18px] leading-snug",
              )}
              title="Профиль · подписчики"
            >
              <span className="truncate">{usernameLabel}</span>
              <span className="mx-1.5 shrink-0 opacity-80" aria-hidden>
                |
              </span>
              <span
                data-testid="feed-followers-count"
                className="shrink-0 tabular-nums"
              >
                {formatFollowersRu(followers)}
              </span>
            </span>
          </div>
        ) : null}

        {playing ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[4] bg-[rgba(0,0,0,0.2)]"
          />
        ) : null}

        {hasSlides ? (
          <>
            <motion.button
              type="button"
              data-testid="feed-slide-prev"
              aria-label="Предыдущий слайд"
              onClick={(e) => stepSlide(e, -1)}
              className={cn(
                "absolute left-1.5 top-1/2 z-[6] flex h-8 w-8 -translate-y-1/2 items-center justify-center",
                "rounded-full border border-[rgba(255,255,255,0.18)]",
                "bg-[rgba(8,9,10,0.55)] text-white backdrop-blur-sm",
                "hover:bg-[rgba(8,9,10,0.72)] focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-[var(--accent-blue-bright)]",
              )}
              whileTap={reduceMotion ? undefined : { scale: 0.94 }}
              transition={reduceMotion ? INSTANT : CARD_SPRING}
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              data-testid="feed-slide-next"
              aria-label="Следующий слайд"
              onClick={(e) => stepSlide(e, 1)}
              className={cn(
                "absolute right-1.5 top-1/2 z-[6] flex h-8 w-8 -translate-y-1/2 items-center justify-center",
                "rounded-full border border-[rgba(255,255,255,0.18)]",
                "bg-[rgba(8,9,10,0.55)] text-white backdrop-blur-sm",
                "hover:bg-[rgba(8,9,10,0.72)] focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-[var(--accent-blue-bright)]",
              )}
              whileTap={reduceMotion ? undefined : { scale: 0.94 }}
              transition={reduceMotion ? INSTANT : CARD_SPRING}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </>
        ) : null}

        {showPlay ? (
          <div className="absolute inset-0 z-[5] flex items-center justify-center">
            <motion.button
              type="button"
              data-testid="feed-play-btn"
              aria-label={playing ? "Пауза" : "Смотреть"}
              aria-pressed={playing}
              onClick={togglePlay}
              className={cn(
                "flex items-center justify-center rounded-full",
                "border border-[rgba(255,255,255,0.18)]",
                "bg-[rgba(8,9,10,0.55)] text-[var(--text-primary)] backdrop-blur-sm",
                "hover:bg-[rgba(8,9,10,0.72)] focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-[var(--accent-blue-bright)]",
                "transition-opacity duration-150 ease-out motion-reduce:transition-none",
                playing
                  ? "opacity-100"
                  : "opacity-85 group-hover/media:opacity-100",
                playSize,
              )}
              initial={false}
              whileHover={reduceMotion ? undefined : { scale: 1.06 }}
              whileTap={reduceMotion ? undefined : { scale: 0.95 }}
              transition={reduceMotion ? INSTANT : PLAY_SPRING}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={playing ? "pause" : "play"}
                  className="flex items-center justify-center"
                  initial={
                    reduceMotion ? false : { opacity: 0, scale: 0.92 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={
                    reduceMotion
                      ? undefined
                      : { opacity: 0, scale: 0.92 }
                  }
                  transition={reduceMotion ? INSTANT : PLAY_SPRING}
                >
                  {playing ? (
                    <Pause
                      className={cn(iconSize, "fill-current")}
                      strokeWidth={2}
                    />
                  ) : (
                    <Play
                      className={cn(iconSize, "ml-0.5 fill-current")}
                      strokeWidth={2}
                    />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        ) : null}

        {/* S48/S49: engagement ≈2× — Century Gothic; Boards hide */}
        {renderEngagement ? (
          <div
            data-testid="feed-engagement-row"
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 z-[7] flex justify-center",
              "bg-gradient-to-t from-[rgba(0,0,0,0.72)] via-[rgba(0,0,0,0.35)] to-transparent",
              isGrid ? "px-1 pb-1.5 pt-6" : "px-2 pb-3 pt-10",
            )}
          >
            <ul
              className={cn(
                "flex flex-wrap items-center justify-center text-white",
                FONT_CG,
                isGrid ? "gap-2 text-[14px]" : "gap-3.5 text-[18px]",
              )}
            >
              {engagement.map(({ key, label, value, Icon }) => (
                <li
                  key={key}
                  title={label}
                  className="flex items-center gap-1 tabular-nums"
                >
                  <Icon
                    className={cn(metricIconSize, "shrink-0 opacity-90")}
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span>{formatMetric(value)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* S50: CTA footer — thin pad so «Разбор» visible without thick black band */}
      {hasFooterActions ? (
        <div
          className={cn(
            "flex flex-col overflow-visible rounded-b-xl",
            isGrid ? "gap-1 p-1.5 pb-1.5" : "gap-2 p-2 pb-2",
          )}
        >
          {showRazbor ? (
            <button
              type="button"
              data-testid="razbor-btn"
              data-architect-testid="competitor-razbor-btn"
              data-competitor-id={post.id}
              onClick={(e) => {
                e.stopPropagation();
                onRazborClick?.(post);
              }}
              className={cn(
                "w-full rounded-md border border-[color-mix(in_srgb,var(--accent-terracotta)_45%,var(--border-glass))]",
                "bg-[color-mix(in_srgb,var(--accent-terracotta)_28%,transparent)]",
                "px-3 py-2.5 text-sm font-semibold text-white",
                "hover:bg-[color-mix(in_srgb,var(--accent-terracotta)_38%,transparent)]",
                "transition-colors",
                FONT_CG,
              )}
            >
              Разбор
            </button>
          ) : null}
          {showEditor ? (
            <button
              type="button"
              data-testid="open-editor-btn"
              data-architect-testid="competitor-open-editor-btn"
              data-competitor-id={post.id}
              onClick={(e) => {
                e.stopPropagation();
                onEditorClick?.(post);
              }}
              className={cn(
                "w-full rounded-md border border-[var(--border-glass)]",
                "bg-[color-mix(in_srgb,var(--accent-blue)_14%,transparent)]",
                "font-medium text-white",
                "hover:bg-[color-mix(in_srgb,var(--accent-blue)_22%,transparent)]",
                "transition-colors",
                FONT_CG,
                isGrid ? "px-1.5 py-1 text-[10px]" : "px-2.5 py-1.5 text-xs",
              )}
            >
              Открыть в редакторе
            </button>
          ) : null}
        </div>
      ) : null}
    </motion.article>
  );
}
