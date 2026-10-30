# Status — C-138

| Field | Value |
|-------|-------|
| **Status** | Motion done |
| **Wave** | `W-2026-10-10-static-release-team` |
| **Updated** | 2026-10-10 |

## Frontend [x]

- Removed `MeshPipelineSwitcher` usage from `ReleaseTeamFlowchart`
- Deleted `components/mesh/MeshPipelineSwitcher.tsx` (orphaned)
- `CanvasTopBar`: title «Команда выпуска» + subtitle + «Скопировать ТЗ для Cursor» (clipboard + toast); no MultiButton
- Same pass as C-139 static flowchart

## Motion [x]

- No MultiButton/xyflow return; Copy TZ toast micro-feedback kept in `CanvasTopBar`
- Primary polish landed under C-139 (drawer / accordion / dashflow)

## Next

Tester → Fixer → Deployer → Client S37
