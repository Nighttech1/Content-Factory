# Chain — C-03

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> Старт Frontend только после C-02 (studio placeholder + shell готовы). Backend / AI Bridge — нет.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/ui/GlassCard.tsx`, `components/ui/NeonBadge.tsx`, `components/ui/ReactiveButton.tsx`, `app/studio/page.tsx` (demo section only) | [x] | использовать `lib/cn` + tokens; **не** `components/shell/**`, **не** globals token rewrite |
| 2 | Motion | `components/ui/**` | [x] | spring `{ damping: 25, stiffness: 300 }` на badge/button/card hover-press; не shell |
| 3 | Tester | `memory/tickets/C-03-ui-primitives/guards.md` | [x] | primitives+demo on `/studio`; anti-slop OK; C-02 regress via sprint1-guards |
| 4 | Fixer | paths Frontend+Motion выше (если красное) | [x] | N/A — skipped (Tester GREEN, no fix needed) |
| 5 | Deployer | localhost `:3000` → `/studio` | [x] | reused existing `npm run dev` on `:3000`; `/studio` HTTP 200; не VPS |
| 6 | Client | приёмка C-03 | [x] | ПРИНЯТО 2026-09-16 — primitives + hy sample on /studio |

Порядок: **Frontend → Motion → Tester → Fixer → Deployer → Client**.
