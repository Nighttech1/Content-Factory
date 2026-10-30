# Guards — C-136 nav IA: sidebar 3 + module top Mesh/Analytics

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| static | Sidebar `NAV_ITEMS` = Studio `/studio`, Schedule `/schedule`, Settings `/settings` only | `components/shell/SidebarNavigation.tsx` |
| static | **No** `/admin/mesh`, `/analytics`, «Команда выпуска», «Аналитика» in sidebar | `components/shell/SidebarNavigation.tsx` |
| static | Routes exist: `app/studio/[moduleId]/mesh/page.tsx`, `app/studio/[moduleId]/analytics/page.tsx` | `app/studio/` |
| static | Module workspace top nav: `module-top-mesh` (OWNER), `module-top-analytics` | `components/studio/StudioModuleWorkspace.tsx` |
| static | Legacy shims redirect → nested | `app/admin/mesh/page.tsx`, `app/analytics/page.tsx` |
| static | Mesh page OWNER-only; ADMIN redirect | `app/studio/[moduleId]/mesh/page.tsx` |
| localhost | S36: sidebar 3 items; top bar links → `/studio/{id}/mesh` & `/studio/{id}/analytics` | Playwright S36 steps 2, 4 |
| regression | ADMIN must not open mesh (S3 legacy + C-136) | Client |

## Static asserts (grep)

1. `grep -E '/admin/mesh|/analytics|Команда выпуска|Аналитика' components/shell/SidebarNavigation.tsx` → **0** href/label hits.
2. `grep module-top-mesh components/studio/StudioModuleWorkspace.tsx` → Link to `/studio/${moduleId}/mesh`.
3. `grep studio-module-mesh app/studio/[moduleId]/mesh/page.tsx` → page testid present.
4. `grep studio-module-analytics app/studio/[moduleId]/analytics/page.tsx` → page testid present.

## Localhost asserts (Playwright / Client — pending)

1. `navigate` → `http://127.0.0.1:8787/studio/carousel-engine`
2. Sidebar: only «Студия», «Расписание», «Настройки» (`nav-studio`, settings if OWNER)
3. `expect(page.getByTestId('module-top-nav')).toBeVisible()`
4. OWNER: `module-top-mesh` → `/studio/carousel-engine/mesh`
5. `module-top-analytics` → `/studio/carousel-engine/analytics`
6. ADMIN: no `module-top-mesh`; mesh route redirects to studio

## Tester static (2026-10-10)

| ID | Check | Result |
|----|-------|--------|
| G1 | Sidebar 3 items only | **PASS** |
| G2 | Nested mesh + analytics pages | **PASS** |
| G3 | Module top nav testids + hrefs | **PASS** |
| G4 | Legacy shims redirect | **PASS** |
| G5 | Playwright live @1440 | **pending Client** |

## Mirror in Client skill

`| C-136 | nav IA module top | sidebar 3 only; mesh/analytics nested under module | memory/tickets/C-136-nav-ia-module-top/guards.md |`
