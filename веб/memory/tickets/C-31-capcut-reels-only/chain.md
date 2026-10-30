# Chain — C-31

> Оркестратор зовёт следующую роль только после checkbox.  
> **Depends:** C-29, C-30.  
> **Порядок волны:** C-29 → C-30 → **C-31**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `lib/studio/capcut-gate.ts`, feed fixtures thumbs | [x] | Gate helper + parseRefDraftId |
| 2 | Frontend | edit page notFound, workspace matrix, FeedPostCard editor CTA, CapCut ref panel | [x] | carousel never CapCut |
| 3 | Motion | CapCut enter + reference | [x] | light springs + reduced-motion |
| 4 | Tester | `guards.md`, `scripts/smoke-c31-capcut-gate.ts` | [x] | GREEN SMOKE_C31_OK |
| 5 | Fixer | — | [x] | N/A |
| 6 | Deployer | localhost | [x] | :3000 already up |
| 7 | Client | приёмка волны | [x] | см. status |

Skills: `content-factory-ui`, `tester`, `web-motion-engine` (light).
