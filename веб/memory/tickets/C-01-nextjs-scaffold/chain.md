# Chain — C-01

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> Волна: `W-2026-09-16-sprint1`. Backend / AI Bridge — нет.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.*` (если создаёт scaffold), `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore` (Next-часть) | [x] | create-next-app + deps из ticket; **не** `components/shell/**`, **не** `components/ui/**`, **не** product routes |
| 2 | Motion | — | [x] | N/A — skip (нет shell/primitives); checkbox только чтобы не блокировать цепочку |
| 3 | Tester | `memory/tickets/C-01-nextjs-scaffold/guards.md` | [x] | smoke `/`→`/studio` 200; anti-slop OK; `scripts/sprint1-guards.mjs` GREEN |
| 4 | Fixer | пути Frontend выше (только при красном) | [x] | N/A — skipped (Tester GREEN, no fix needed) |
| 5 | Deployer | localhost `:3000` | [x] | reused existing `npm run dev` on `:3000`; `/studio` HTTP 200; не VPS |
| 6 | Client | приёмка C-01 | [x] | ПРИНЯТО 2026-09-16 — scaffold live, guards GREEN |

Порядок: **Frontend → Motion(skip) → Tester → Fixer → Deployer → Client**.  
Следующий тикет волны (C-02) стартует Frontend только после закрытия C-01 Deployer/Client gate Оркестратором.
