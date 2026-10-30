# Guards — C-24 motion polish

Date: 2026-09-20  
Role: Tester  
Result: **GREEN**

Executable checks (source + static):
- Grep / file-read of `ModuleSelectorGrid`, `GenerationDrawer`, `MediaSkeleton`, `studio-store`
- `python plugins/frontend/anti_slop_scan.py .` → **OK** (2026-09-20)

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | `ModuleSelectorGrid` uses `STAGGER = 0.08` and `staggerChildren: reduceMotion ? 0 : STAGGER` | GREEN | `components/studio/ModuleSelectorGrid.tsx` L14, L42 |
| G2 | `GenerationDrawer` agent-step list same stagger 0.08 / reduce→0 | GREEN | `components/studio/GenerationDrawer.tsx` L7, L44 |
| G3 | Springs in band damping ~28, stiffness ~280 (grid + steps) | GREEN | ModuleSelectorGrid `SPRING` 28/280; drawer `STEP_SPRING` 28/280 |
| G4 | `data-testid="skeleton-video"` on 9:16 video placeholder | GREEN | `MediaSkeleton.tsx` `VideoSkeleton` L48; wired in `ReelsPlayer` via `useDemoMediaLoading` |
| G5 | `data-testid="skeleton-carousel"` on carousel placeholder | GREEN | `MediaSkeleton.tsx` `CarouselSkeleton` L90; wired in `CarouselDeck` |
| G6 | `useReducedMotion` gates shimmer loop off (static surface OK) | GREEN | `ShimmerSurface` — no `animate` / no shimmer gradient when reduce |
| G7 | C-23 SSE intact: `openJobStream` in studio-store; no `runSimulatedPipeline` | GREEN | `lib/studio-store.ts` import + L428; `lib/` grep `runSimulatedPipeline` → 0 matches |
| G8 | anti-slop scan | GREEN | `anti_slop_scan: OK` |

## Acceptance criteria map (architect-spec)

| AC | Verdict |
|----|---------|
| Studio module cards stagger 0.08 | GREEN (source) |
| Drawer agent steps stagger 0.08 | GREEN (source) |
| Inspector video 9:16 + carousel skeletons while loading | GREEN (testids + `useDemoMediaLoading`) |
| prefers-reduced-motion → stagger 0, no shimmer loop | GREEN (source) |
| No purple-glow kitch / Dark Luxury retained | GREEN (anti-slop OK; amber/blue brand glows only on selection) |

## Failures for Fixer

none — Fixer **N/A**

## Re-run

```bash
# source asserts (manual / ripgrep)
rg "STAGGER = 0.08" components/studio/ModuleSelectorGrid.tsx components/studio/GenerationDrawer.tsx
rg "skeleton-video|skeleton-carousel" components/inspect/MediaSkeleton.tsx
rg "openJobStream|runSimulatedPipeline" lib/studio-store.ts
python plugins/frontend/anti_slop_scan.py .
```

Live UI (Deployer / Client): `/studio` stagger cards; `/studio/inspect/demo` briefly shows skeletons then media.

## Mirror in Client skill

| C-24 | stagger 0.08 + skeleton-video/carousel + reduce-motion | source guards | this file |
