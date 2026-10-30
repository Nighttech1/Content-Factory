# Wave W-2026-10-07-ux-carousel-nav

| Field | Value |
|-------|--------|
| Status | architect_done — awaiting Frontend |
| Tickets | C-63 C-64 C-65 (wave 1) · C-66 C-67 (wave 2) |
| Plan file | **do not edit** (approved UX plan stays external) |
| Trainer | done — `memory/trainer/2026-10-07-ux-wave-grade.md` (A) |

## Goal

Perceived nav ≤1s; carousel-engine **9:16 stack** + «Создать карусель» modal; mesh **Команда выпуска** + AgentPropertiesPanel; schedule collapsed/wrap/no day-strip/month arrows by title.

## Order

### Wave 1 (implement first)

**Frontend shared-file sequence:** **C-64 → C-65 → C-63** on `StudioModuleWorkspace` (and any shared chrome).  
Не параллелить Frontend на overlapping paths.

| Ticket | Focus |
|--------|--------|
| C-64 | 9:16 stack, feed L/R, Разбор CTA, scrollbar |
| C-65 | CreateCarouselModal + hide long desc + CTA |
| C-63 | loading.tsx, dynamic imports, soften route opacity, Analytics Promise.all |

### Wave 2 (specs ready; same session OK after wave 1 green or non-overlapping owners)

| Ticket | Focus |
|--------|--------|
| C-66 | Nav «Команда выпуска», mesh line + AgentPropertiesPanel |
| C-67 | Schedule folders/wrap/stripDays/month arrows |

C-66 и C-67 **не** пересекают `StudioModuleWorkspace` / feed — можно после C-64/65 или параллельно с C-63 **только если** Frontend paths не overlap (C-63 owns AppShell/Analytics/loading; C-66 owns SidebarNavigation+mesh; C-67 owns schedule/*).

## Path lock summary

| Path | Owner ticket |
|------|----------------|
| `lib/studio/feed-fixtures.ts`, `FeedPostCard`, `VerticalPostCarousel` | **C-64** |
| `CreateCarouselModal` (new), workspace Create CTA / desc hide | **C-65** (after C-64 on workspace) |
| `app/**/loading.tsx`, AppShell route motion, Analytics*, dynamic mesh/chart/razbor | **C-63** (workspace last) |
| `SidebarNavigation` mesh label, `mesh-seed`, AgentMeshCanvas panel | **C-66** |
| `ScheduleCalendar`, `ScheduleModuleRail` (± ScheduleShell) | **C-67** |

## Progress

| Role | Status |
|------|--------|
| Trainer | done |
| Architect | done (this wave) |
| Frontend | pending — start C-64 |
| Motion | pending per chain |
| Tester | pending |
| Fixer | — |
| Deployer | **done** — localhost :3000; smoke OK |
| Client | — |

## Deployer notes (2026-10-07)

- Stopped previous `npm run dev` / Next on :3000; restarted from workspace.
- `next dev --turbopack` Ready; left running.
- Smoke (curl, no cookie session):
  - `http://127.0.0.1:3000/studio` → **200**
  - `http://127.0.0.1:3000/studio/carousel-engine` → **200**
  - `http://127.0.0.1:3000/schedule` → **200**
  - `http://127.0.0.1:3000/admin/mesh` → **200** (no redirect on anonymous curl; follow also 200)
- VPS not touched. Chain Deployer `[x]` on C-63…C-67.

## Skills

`content-factory-ui`, `web-motion-engine`, `content-pipeline-agents`, `xyflow-agent-mesh`, `21st-ui-catalog`, `client-scenarios` (S15–S17).

## Out of wave

- Production app code in Architect pass (none).
- Plan file edits.
- VPS/prod.
- Prisma / Backend / AI Bridge (unless mid-flight escalation).
