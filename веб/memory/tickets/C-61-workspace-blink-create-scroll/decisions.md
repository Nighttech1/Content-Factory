# Decisions — C-61

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | (wave in progress) | Старт Frontend+Motion |
| **after_sha** | | |

## Role log

| Time | Role | Action | Result |
|------|------|--------|--------|
| 2026-10-06 | Architect | spec+chain | lock blink / glow / nested scroll |
| 2026-10-06 | Frontend+Motion | chrome, useCallback, loading split, glow CTA, scroll isolation | 21st MCP unavailable; glow adapted from `@waleedkibhen/glow-button` |
| 2026-10-06 | Frontend+Motion | harden blink: dedupe refs; no header animate-pulse; ours loading=false after first posts; wheel on section+scroller | compile fix TS2451; title/count opacity-100 always |

## 21st

- `21st=unavailable` (MCP server missing) · id intended=`waleedkibhen/glow-button` · element=`create-cta` · motion=yes
- Fallback: `components/ui/glow-button.tsx` — Cobalt `#2563EB` + Gold `#D4A359` glare, `framer-motion` spring `{ damping: 25, stiffness: 300 }`, reduced-motion: no glare / no scale
- Click Create = `openDraftEditor` (CapCut edit route / Drafts tab). Not a second SpeechRecognition / Generate-seed bar.

## Blink

- Header title+count: static `opacity: 1` (plain `div`). No `[0.55,1,0.55]`.
- `feed-refetching` + `aria-busy` remain; quiet pulse-dot beside title only.
- `handleCompetitorsTopicSearch` = `useCallback(..., [fetchFeed])`.
- Competitors `loading`: empty → `feedLoading \|\| competitorsLoading`; else only `competitorsLoading`.

## Nested scroll

- Section `overscroll-y-contain`; scroller `overscroll-contain` + `touch-pan-y`.
- `wheel` listener `{ passive: false }`: `stopPropagation`; `preventDefault` at edges / non-scrollable.
- React `onWheel` / `onTouchMove` stopPropagation on scroller.

## Rollback plan

1. Revert the three component files + `glow-button.tsx`.
2. Папку тикета не удалять.
