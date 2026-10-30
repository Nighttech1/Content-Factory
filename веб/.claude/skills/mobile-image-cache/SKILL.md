---
name: mobile-image-cache
description: >-
  One-shot decode/cache of localStorage data-URL and remote images for Sputnik
  Life OS mobile. Use when images flash white, reload every navigation, or lock
  / section wallpapers lag. Frontend A + web-perf-motion.
---

# Mobile Image Cache

## Goal

Картинки (data URL из localStorage, CDN stock, section/sphere/lock/dreams) **декодируются один раз** при старте/первом показе и дальше берутся из памяти (Blob URL / ImageBitmap / preloaded HTMLImageElement). Не пересоздавать `url(data:…)` на каждый mount.

## Rules

1. Центральный модуль `src/lib/image-cache.ts` — `warm(src)`, `cachedUrl(src)`, `revokeAll` only on logout.
2. Prefetch batch при unlock / AppShell mount для spheres, sectionBg, lock, dreams thumbs.
3. CSS backgrounds: set `--section-bg` / inline bg from **cached blob URL**, not raw multi-MB data URL repeatedly.
4. `<img>`: `src={cachedUrl}` + `decoding="async"`; avoid remounting with new data URL string identity.
5. Lock: на mobile **не** крутить тяжёлый Three shader — static CSS/`<img>` poster или paused low DPR.
6. Habits cards: opaque `background-color` under glass (no white flash); avoid `backdrop-filter` on scrolling lists on iOS when possible.

## Check

Playwright mobile: navigate away and back — network/data decode should not flash white; lock FPS acceptable.
