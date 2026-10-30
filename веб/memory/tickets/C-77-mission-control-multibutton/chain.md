# Chain — C-77

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** трогать `components/schedule/**` (footer help = C-78).  
> **Wave UX-4a.** После C-76; до C-78. Не параллелить с C-78 (оба могут трогать Razbor UI — C-78 только Publisher datetime).

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Trainer | `memory/trainer/2026-10-08-ux-wave4-grade.md` | [x] | Grade A |
| 1 | Architect | `architect-spec.md`, `decisions.md`, этот `chain.md` | [x] | Spec only |
| 2 | Frontend | `multi-button.tsx`, `RazborModal.tsx`, `CreateCarouselModal.tsx`, `carousel-draft-types.ts`, `razbor-pipeline.ts` (strings) | [ ] | CompactMultiButton + Разборщик; **не** Schedule* |
| 3 | Motion | — | [ ] | skip unless MultiButton spring regress |
| 4 | Tester | `guards.md`; S24 | [ ] | CompactMultiButton; label Разборщик; analytics nav intact |
| 5 | Fixer | _(если красное)_ | [ ] | Surgical |
| 6 | Deployer | localhost Razbor/Create | [ ] | |
| 7 | Client | acceptance S24 | [ ] | |

Skills: `content-factory-ui`, `content-pipeline-agents`, `21st-ui-catalog`, `client-scenarios` S24.  
**Не звать:** Backend, AI Bridge, Coder monolith.  
**Path lock:** `components/schedule/**` — out.
