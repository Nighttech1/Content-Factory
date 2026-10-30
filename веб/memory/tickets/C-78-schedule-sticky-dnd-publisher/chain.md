# Chain — C-78

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** platforms / Settings CRUD (C-79).  
> **Wave UX-4a.** После C-76 + C-77. Не параллелить overlapping с C-77 на `RazborModal` (C-77 сначала).

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Trainer | `memory/trainer/2026-10-08-ux-wave4-grade.md` | [x] | Grade A |
| 1 | Architect | `architect-spec.md`, `decisions.md`, этот `chain.md` | [x] | Spec only |
| 2 | Frontend | `ScheduleCalendar.tsx`, `ScheduleShell.tsx`, optional `ScheduleModuleRail.tsx`, `lib/schedule/storage.ts`, `RazborPublisherPane.tsx`, publisher sync in Razbor/Create, drafts-store если нужно | [ ] | sticky + DnD wire + remove help + publisher↔slot |
| 3 | Motion | `ScheduleCalendar.tsx` (popup bridge / DnD settle) | [ ] | grace ≤150ms; `web-motion-engine` |
| 4 | Tester | `guards.md`; S26 + wave3 publisher E2E residual | [ ] | sticky; date↔date; no help footer; publisher sync |
| 5 | Fixer | _(если красное)_ | [ ] | Surgical |
| 6 | Deployer | localhost `/schedule` + Razbor publisher | [ ] | no VPS |
| 7 | Client | acceptance S26 | [ ] | |

Skills: `content-factory-ui`, `web-motion-engine`, `content-pipeline-agents`, `client-scenarios` S26.  
**Не звать:** AI Bridge, Platforms Backend (C-79), WebGL, Coder monolith.  
**Path lock out:** Settings platforms, Launchpad manifests, MultiButton rename (уже C-77).
