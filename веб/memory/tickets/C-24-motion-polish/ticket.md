# C-24 — Stagger cards + skeleton loaders (Framer Motion)

| Field | Value |
|-------|-------|
| **ID** | `C-24` |
| **Priority** | P1 |
| **Area** | studio / inspect / motion |
| **Wave** | W-2026-09-20-sprint7-sse |
| **Opened by** | Client — Sprint 7 kickoff (DEV_PLAN 7.2) |
| **Status** | done · ПРИНЯТО С ЗАМЕЧАНИЯМИ (2026-09-20) |

## Repro (current gap)

1. Studio module grid / analytics cards / drawer steps appear without consistent `staggerChildren: 0.08`.
2. Inspector video / carousel while rendering show empty or abrupt content — no polished skeleton.

**URL:** `http://localhost:3000/studio`, `http://localhost:3000/studio/inspect/:id`

## Expected

- Card / list appear with stagger (`staggerChildren: 0.08`) and respect `prefers-reduced-motion`.
- Smooth skeleton loaders for video (9:16) and carousel slides during render/loading.
- Spring tokens stay on brand (`damping` ~25–28, `stiffness` ~260–320) — no new purple glow kitsch.

## Actual

Partial motion exists (drawer, grid hover) but DEV_PLAN 7.2 polish (stagger + skeletons) is incomplete.

## Notes for Orchestrator

Зона: **Frontend** + **Motion**. Skills: `web-motion-engine`, `content-factory-ui`.  
Guard: reduced-motion → no stagger delay; loading state shows skeleton with `data-testid`.
