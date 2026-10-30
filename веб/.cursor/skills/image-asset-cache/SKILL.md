---
name: image-asset-cache
description: >-
  Cache images once (blob URL / IndexedDB / Memory Cache) so section wallpapers,
  sphere cards, Path/Dreams media do not re-decode data URLs or re-fetch CDN on
  every route open. Use for Frontend A Life OS perf and white-flash fixes.
---

# Image Asset Cache (Life OS web)

## Problem

Large photos live as `data:` URLs in localStorage JSON or remote CDN. Every mount sets `backgroundImage` / `<img src>` → decode + paint flash (white) and jank.

## Rules

1. **Decode once per session:** `new Image()` + `decode()` then hold `blob:` or object URL in a module Map keyed by stable id/hash.
2. **Do not** rewrite localStorage on every paint; resolve URL through cache helper only.
3. Prefer `content-visibility` / solid fallback color under images (never pure flash white).
4. CDN (`stockAt`): `Cache-Control` via browser; still warm via prefetch on app boot after unlock.
5. Lock/WebGL: static poster on mobile — not a looping decode of wallpaper every frame.
6. Invalidate cache only on explicit user replace-image or sync pull that changes bytes.

## API sketch

```ts
// lib/image-cache.ts
getCachedUrl(key: string, source: string): Promise<string> // blob: or original if tiny
prefetchAll(entries: {key, source}[]): Promise<void>
revokeAll(): void // on logout optional
```

## Skills to pair

`web-perf-motion`, `responsive-mobile-web`, `mobile-touch-scroll`.
