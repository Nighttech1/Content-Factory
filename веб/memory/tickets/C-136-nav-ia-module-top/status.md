# Status — C-136 nav IA module top

## Frontend [x] — 2026-10-10

**Sidebar NAV_ITEMS (only):**
1. Студия → `/studio`
2. Расписание → `/schedule`
3. Настройки → `/settings`

Removed from sidebar: «Команда выпуска», «Аналитика».

**Routes created:**
- `/studio/[moduleId]/mesh` — OWNER only; mounts `AgentMeshCanvas` with `pipelineId=moduleId`
- `/studio/[moduleId]/analytics` — mounts `AnalyticsShell` via `initialModuleId`

**Top bar (module workspace):** «Команда выпуска» (OWNER) + «Аналитика» → nested routes.

**Legacy shims:**
- `/admin/mesh` → `/studio/carousel-engine/mesh`
- `/analytics` → `/studio/carousel-engine/analytics`

**Files:** `SidebarNavigation.tsx`, `StudioModuleWorkspace.tsx`, `app/studio/[moduleId]/mesh/page.tsx`, `app/studio/[moduleId]/analytics/page.tsx`, `app/admin/mesh/page.tsx`, `app/analytics/page.tsx`, `AgentMeshCanvas.tsx`, `AnalyticsShell.tsx`, `AnalyticsPageClient.tsx`  
## Tester [x] — 2026-10-10

- Static PASS: sidebar 3 only; nested routes + module top nav; guards.md written.
- Playwright @1440 nav IA clicks → **pending Client** (S36).

**Next:** Client S36 → Fixer if red.
