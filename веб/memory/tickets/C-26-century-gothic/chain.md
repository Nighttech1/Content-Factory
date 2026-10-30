# Chain — C-26

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Порядок волны:** C-26 → C-27 → C-28 (этот тикет первый).

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `app/layout.tsx`, `app/globals.css`, optional `public/fonts/` | [x] | Inter removed; `--font-ui` = Century Gothic via `@font-face` local() + CSS stack; Noto + JetBrains kept; no woff (license) |
| 2 | Tester | `memory/tickets/C-26-century-gothic/guards.md`, optional smoke script | [x] | GREEN: Inter out; `--font-ui` Century Gothic; `scripts/smoke-c26-century-gothic.mjs`; Fixer N/A |
| 3 | Fixer | _(если красное)_ те же paths Frontend | [x] | N/A — Tester green |
| 4 | Deployer | localhost refresh | [x] | `:3000` up; `GET /studio` 200; no VPS; status `deployed_localhost` |
| 5 | Client | приёмка | [x] | **ПРИНЯТО** (C-26 only; wave not согласовано) |

Skills: `design-system`, `baseline-ui` (по нужде). Motion / Backend / AI Bridge — не звать.
