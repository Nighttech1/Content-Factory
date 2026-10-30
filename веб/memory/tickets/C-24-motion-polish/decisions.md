# Decisions — C-24 Motion Polish

## Stagger value

**Chosen:** exactly `staggerChildren: 0.08` (DEV_PLAN 7.2). Do not invent 0.05/0.1 variants per screen.

## Reduced motion

**Chosen:** `staggerChildren: 0` + instant/opacity-only; skeletons static (no infinite shimmer loop).

## Skeleton ownership

**Chosen:** Frontend adds DOM + testids; Motion owns enter/shimmer (if any). Shared aspect wrappers preferred over one-off cards.

## Sequencing vs C-23

**Chosen:** Orchestrator runs **C-23 before C-24** when both open — shared `GenerationDrawer.tsx`. If C-23 already merged, C-24 Motion only adds stagger on step list.

## Role log

| Time | Role | Action | Result |
|------|------|--------|--------|
| 2026-09-20 | Architect | spec + chain + decisions | Done |
| 2026-09-20 | Frontend | MediaSkeleton + loading flags + testids; stagger parent/children wiring | Done |
| 2026-09-20 | Motion | stagger 0.08, SPRING 28/280, reduce → delay 0 + static shimmer | Done |

## 21st catalog

| Time | 21st | element | motion |
|------|------|---------|--------|
| 2026-09-20 | id=24972 Skeleton shimmer (motiondotdev) | MediaSkeleton Video/Carousel placeholders | yes (shimmer off if reduced-motion) |
