# Chain — C-02

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> Старт Frontend только после C-01. Backend / AI Bridge — нет.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `app/globals.css`, `app/layout.tsx`, `app/page.tsx` (optional redirect), `app/studio/page.tsx` (placeholder only), `app/analytics/page.tsx`, `app/admin/mesh/page.tsx`, `app/schedule/page.tsx`, `app/brand-kit/page.tsx`, `components/shell/**`, `lib/cn.ts`, `lib/session-store.ts` | [x] | tokens ARCHITECTURE §2; RBAC zustand; **не** `components/ui/**`; studio без demo primitives |
| 2 | Motion | `components/shell/**` | [x] | appearance / enter spring `{ damping: 25, stiffness: 300 }`; не трогать `components/ui/**` |
| 3 | Tester | `memory/tickets/C-02-shell-tokens-rbac/guards.md` | [x] | tokens+RBAC code verified; anti-slop OK; sprint1-guards GREEN |
| 4 | Fixer | paths Frontend+Motion выше (если красное) | [x] | N/A — skipped (Tester GREEN, no fix needed) |
| 5 | Deployer | localhost `:3000` → `/studio` | [x] | reused existing `npm run dev` on `:3000`; `/studio` HTTP 200; не VPS |
| 6 | Client | приёмка C-02 | [x] | ПРИНЯТО 2026-09-16 — tokens + RBAC gate (HTTP+code; no Playwright MCP) |

Порядок: **Frontend → Motion → Tester → Fixer → Deployer → Client**.  
C-03 Frontend не стартует параллельно с C-02 на `app/studio/page.tsx`.
