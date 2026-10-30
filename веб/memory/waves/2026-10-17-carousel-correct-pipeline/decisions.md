# Frontend decisions — chain step 4 (S55 Brand / Landscapes / Logs / RED)

**Date:** 2026-10-17  
**Role:** Lead Frontend  
**Wave:** `memory/waves/2026-10-17-carousel-correct-pipeline/`

## 21st.dev

| 21st id | element | motion | notes |
|---------|---------|--------|-------|
| `id=4539` (sean0205 File Upload / gallery) | Brand logo + Landscapes multi-angle dropzones | yes (drag hover border) | Adapted pattern only — Dark Luxury tokens, RU labels, no purple; did **not** paste full demo (Alert/Button-1 deps). Reused vernacular inputs from PlatformsPanel. |

`21st=available` (search + 1× get_component). Further retrievals skipped to save quota; Publicist/Logs reuse existing drawer/settings chrome.

## Layout locks

- Settings TOC/sections order: **Дизайн → Бренд → Пейзажи → Площадки → Расписание → Публицист → Рилсы**
- shell_freeze: no AppShell / Sidebar IA edits
- Agent drawer: new tab **«Логи»** (GET `/api/agents/:id/logs`)
- Mesh AgentCard: RED perimeter when `errorFlags[agentId]` from GET `/api/agents/logs`

## Bind map (consume Backend)

| UI | API |
|----|-----|
| BrandPanel | GET/PUT `/api/settings/brand` |
| LandscapesPanel | GET/POST `/api/settings/landscapes`, DELETE `/api/settings/landscapes/:n` |
| PublicistSettingsPanel | GET/PUT `/api/settings/publicist` |
| Create publication mode | publicist settings + POST `/api/publicist/schedule` |
| Logs tab | GET `/api/agents/:id/logs` |
| RED perimeter | GET `/api/agents/logs` → `errorFlags` → `expandAgentErrorFlags` |
| Log id aliases | `scriptwriter`↔`copywriter`, `trainer`↔`team-trainer`, `publicist`↔`publisher` |

## Files touched

- `components/settings/BrandPanel.tsx` (new)
- `components/settings/LandscapesPanel.tsx` (new)
- `components/settings/PublicistSettingsPanel.tsx` (new)
- `components/settings/SettingsShell.tsx`
- `components/settings/SettingsQuickNav.tsx`
- `components/mesh/v2/AgentInspectorDrawer.tsx`
- `components/mesh/v2/ReleaseTeamFlowchart.tsx`
- `lib/mesh/agent-log-aliases.ts` (new)
- `components/studio/workspace/CreateCarouselPublicationPane.tsx`
