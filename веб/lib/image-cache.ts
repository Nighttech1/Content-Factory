/**
 * S48 — session image prefetch / decode cache (image-asset-cache skill).
 * Warm all carousel slide URLs before swipe so motion never waits on network.
 */

type CacheEntry = {
  url: string;
  decoded: boolean;
};

const memoryCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<string>>();

function cacheKey(source: string): string {
  return source;
}

/**
 * Prefetch + decode one image. Returns original URL (browser HTTP cache warmed).
 * Failures resolve to source (best-effort; never throw to callers).
 */
export function getCachedUrl(key: string, source: string): Promise<string> {
  if (!source || typeof window === "undefined") {
    return Promise.resolve(source);
  }
  const id = key || cacheKey(source);
  const hit = memoryCache.get(id);
  if (hit?.decoded) return Promise.resolve(hit.url);

  const pending = inflight.get(id);
  if (pending) return pending;

  const task = new Promise<string>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    const finish = (ok: boolean) => {
      memoryCache.set(id, { url: source, decoded: ok });
      inflight.delete(id);
      resolve(source);
    };
    img.onload = () => {
      if (typeof img.decode === "function") {
        void img
          .decode()
          .then(() => finish(true))
          .catch(() => finish(true));
      } else {
        finish(true);
      }
    };
    img.onerror = () => finish(false);
    img.src = source;
  });

  inflight.set(id, task);
  return task;
}

/** Prefetch a list of slide URLs in parallel (deduped by URL). */
export async function prefetchAll(
  entries: Array<{ key?: string; source: string } | string>,
): Promise<void> {
  if (typeof window === "undefined") return;
  const list = entries
    .map((e) =>
      typeof e === "string"
        ? { key: e, source: e }
        : { key: e.key ?? e.source, source: e.source },
    )
    .filter((e) => Boolean(e.source));
  if (list.length === 0) return;
  await Promise.all(list.map((e) => getCachedUrl(e.key, e.source)));
}

/** Optional: clear session cache (logout / hard reset). */
export function revokeAll(): void {
  memoryCache.clear();
  inflight.clear();
}
