# Chain — C-54

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Порядок волны:** C-52 → C-53 → **C-54**.  
> **Старт после C-53**, чтобы RU mesh header не конфликтовал с pipeline switcher.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `app/schedule/page.tsx`, `components/schedule/**` (calendar + module rail), `lib/schedule/storage.ts` (`cf.schedule.v1`), mock ready posts (`lib/schedule/ready-posts.ts` или fixtures), `components/shell/SidebarNavigation.tsx`, `app/studio/page.tsx`, `components/studio/ModuleSelectorGrid.tsx`, `app/settings/page.tsx`, `lib/settings/llm-models.ts` (RU agent labels), `app/admin/mesh/page.tsx`, `components/mesh/CanvasTopBar.tsx`, `components/analytics/AnalyticsHeader.tsx`, workspace leftovers (`StudioModuleWorkspace` kicker, `FeedPostCard` Ours/Competitor если ещё EN) | [x] | 21st-first calendar; localStorage slots; full RU chrome; **no Backend** |
| 2 | Motion | schedule calendar enter + slot label; не ломать mesh PulseEdge | [x] | spring `{ damping: 25, stiffness: 300 }`; reduced-motion |
| 3 | Tester | `memory/tickets/C-54-schedule-i18n/guards.md`; S6; nav RU asserts | [x] | no EN placeholder; slot persist reload; C-46 Launchpad EN superseded |
| 4 | Fixer | _(если красное)_ | [x] | Mesh node labels + leftover chrome RU; не Backend |
| 5 | Deployer | localhost `/schedule`, `/studio`, `/settings`, `/admin/mesh`, `/analytics` | [x] | 2026-10-06 — `/schedule` `/studio` `/settings` `/admin/mesh` `/analytics` HTTP 200; no VPS |
| 6 | Client | приёмка | [ ] | S6 + chrome RU walk |

Skills: `21st-ui-catalog` (**обязателен** при живом MCP), `content-factory-ui`, `luxury-web-craft` (fallback), `web-motion-engine`, `client-scenarios`.  
**Не звать:** Backend, AI Bridge, Coder monolith, WebGL.
