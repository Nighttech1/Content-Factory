# Chain — C-76

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths` с C-77/C-78.  
> **Wave UX-4a.** Порядок волны: **C-76 → C-77 → C-78**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Trainer | `memory/trainer/2026-10-08-ux-wave4-grade.md` | [x] | Grade A |
| 1 | Architect | `architect-spec.md`, `decisions.md`, этот `chain.md` | [x] | Spec only |
| 2 | Frontend | `StudioPageClient.tsx`, `ModuleSelectorGrid.tsx`, `modules.ts`, `src/modules/manifests.ts`, `site-articles/manifest.ts`, `tg-articles/manifest.ts`, id-map если есть | [ ] | Skills: `content-factory-ui`, `content-module-sdk`, `21st-ui-catalog` (optional) |
| 3 | Motion | — | [ ] | skip |
| 4 | Tester | `memory/tickets/C-76-launchpad-channels-copy/guards.md`; S23 | [ ] | Нет «Выберите модуль»; обе плитки; одна descriptive |
| 5 | Fixer | _(если красное)_ | [ ] | Surgical |
| 6 | Deployer | localhost `/studio` | [ ] | после зелёных guards волны / тикета |
| 7 | Client | acceptance S23 | [ ] | |

Skills: `content-factory-ui`, `content-module-sdk`, `client-scenarios` S23.  
**Не звать:** Backend, AI Bridge, Motion, Coder monolith, WebGL.
