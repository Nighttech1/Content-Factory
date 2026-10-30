# Architect spec — C-s8-07-guards (P0)

> DEV_PLAN **8.7** · Wave `W-2026-10-15-sprint8-postgres`  
> Depends on: **C-s8-01…C-s8-06**  
> `shell_freeze: true`

## Goal

Зафиксировать guards: данные после refresh, изоляция профилей, идемпотентный import, нет social publish, библиотека ≤10, diff без shell redesign.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-s8-07-f5** | Create draft/board/slot/design → hard refresh → still present from server |
| **D-s8-07-iso** | Actor A vs B: B не видит данные A |
| **D-s8-07-import** | Second migrate-local idempotent |
| **D-s8-07-hitl** | Approve path → SCHEDULED/draft only; no social side-effect |
| **D-s8-07-cap** | Design 11th → rejected |
| **D-s8-07-shell** | `git diff` / file list: 0 churn AppShell/SidebarNavigation/MenuVertical/module top nav |
| **D-s8-07-evidence** | `guards.md` + smoke script; не принимать «в API есть» без refresh proof |

## Deliverables

- `memory/tickets/C-s8-07-guards/guards.md`
- Smoke script (e.g. `scripts/smoke-sprint8-postgres-sot.ts`) — API + optional Playwright notes for Client

## Client acceptance (plain language)

См. wave architect-spec §10. Playwright persistence smoke @1440 после Deployer.

## Skills

`tester` § Sprint 8.7
