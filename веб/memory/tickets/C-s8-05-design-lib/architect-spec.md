# Architect spec — C-s8-05-design-lib (P0)

> DEV_PLAN **8.5** · Wave `W-2026-10-15-sprint8-postgres`  
> Depends on: **C-s8-01**  
> `shell_freeze: true`

## Goal

Библиотека дизайна ≤10 слотов на пользователя в Postgres. Активный brandbook для draw всегда резолвится с сервера. Довести CRUD; уйти от sole SoT `data/local/design-active.json` + browser library.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-s8-05-routes** | `GET/POST /api/settings/design-slots`, `PATCH/DELETE …/[id]`, `POST …/[id]/activate` |
| **D-s8-05-cap** | Max **10** slots / user → **409** `design_library_full` |
| **D-s8-05-active** | Ровно один `isActive=true` на user; activate атомарно |
| **D-s8-05-dual** | `GET /api/settings/design-active`: Postgres active **first**, fallback JSON file; POST sync пишет Postgres (+ optional JSON cache) |
| **D-s8-05-shape** | `label←name`, `markdown`, `html?`, `previewUrl?`, `brandbook` Json ← `presetFile`/colors |
| **D-s8-05-no-log** | Не логировать полный markdown в tickets/guards |
| **D-s8-05-ui** | Не redesign Embla/Settings Design chrome — wire в C-s8-06 |

## Map from `DesignLibrarySlot`

| Client | DesignSlot |
|--------|------------|
| `id`, `createdAt` | id, createdAt |
| `name` | `label` |
| `markdown`, `html`, `previewUrl` | columns |
| `presetFile`, `colors`, `cssVarOverrides`, `presetId` | `brandbook` Json |
| `activeId` | `isActive` |

## Acceptance

- [ ] 11-й create → 409
- [ ] Activate переживает API restart; draw/agent path видит active markdown
- [ ] Isolation по userId

## Skills

`backend` § Sprint 8 · existing `design-active` routes
