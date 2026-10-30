# Chain — C-25

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Tester | `memory/tickets/C-25-e2e-qa-polish/guards.md`; smoke scripts; `/studio/inspect/:id`, `/admin/mesh`, `/studio` S1 | [x] | **Done 2026-09-20 GREEN.** `scripts/smoke-c25-e2e.ts` + live `:3000`. Playwright MCP gap (honest). Frontend **not** needed |
| 2 | Frontend | inspect font nodes / `app/admin/mesh/page.tsx` | [ ] | **только если** Tester RED с доказанным UI gap; skills `content-factory-ui` |
| 3 | Fixer | paths из RED | [ ] | surgical; не расширять auth |
| 4 | Deployer | localhost | [x] | **Done 2026-09-20.** `:3000` pid 2556; `/studio` `/inspect/demo` `/admin/mesh` 200; `smoke-c25` SMOKE_C25_OK; no VPS |
| 5 | Client | приёмка C-25 / DEV_PLAN 7.3 + Hard REJECT | [x] | **ПРИНЯТО** 2026-09-20 — Sprint 7 **согласовано** (Playwright MCP gap) |

Порядок: **Tester → (Frontend if gap) → Fixer → Deployer → Client**.  
Backend / Motion / AI Bridge — **не** звать по умолчанию.  
Запускать **после C-23** (S1+SSE); C-24 желательно уже на localhost, не блокер guards шрифт/RBAC.
