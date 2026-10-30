import type { FeedPost } from "@/lib/studio/feed-types";

const IMAGE_EXT = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(\?|#|$)/i;

/** True when `mediaUrl` can be used as a click-to-play video source. */
export function isPlayableVideoUrl(url: string | undefined): boolean {
  const raw = url?.trim();
  if (!raw) return false;
  if (IMAGE_EXT.test(raw)) return false;
  return true;
}

function mediaTypeUpper(
  post: Pick<FeedPost, "mediaType">,
): string {
  return (post.mediaType ?? "").trim().toUpperCase();
}

/**
 * C-52: round Play overlay only for video intent.
 * Hide for IMAGE, aesthetic-graphics, carousel slides without video URL,
 * or any post with no mediaUrl and mediaType !== VIDEO.
 */
export function shouldShowFeedPlay(
  post: Pick<FeedPost, "mediaType" | "mediaUrl">,
  moduleId?: string,
): boolean {
  if (moduleId === "aesthetic-graphics") return false;

  const type = mediaTypeUpper(post);
  if (type === "IMAGE") return false;

  const playable = isPlayableVideoUrl(post.mediaUrl);

  if (type === "CAROUSEL_ALBUM") return playable;
  if (type === "VIDEO") return true;
  if (playable) return true;

  return false;
}
