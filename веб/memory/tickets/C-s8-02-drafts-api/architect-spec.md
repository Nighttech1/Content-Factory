# Architect spec — C-s8-02-drafts-api (P0)

> DEV_PLAN **8.2** · Wave `W-2026-10-15-sprint8-postgres`  
> Depends on: **C-s8-01**  
> `shell_freeze: true`

## Goal

CRUD API черновиков карусели в Postgres. Create/Razbor будут писать на сервер (wire в C-s8-06). Zustand = кэш, не SoT.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-s8-02-routes** | `GET/POST /api/studio/drafts`, `GET/PATCH/DELETE /api/studio/drafts/[id]` |
| **D-s8-02-scope** | Все операции scoped actor `userId` (wave §5); чужой id → 404/403 |
| **D-s8-02-shape** | Body mirrors `CarouselDraft` + `moduleId`; brand/competitor → `payload` Json |
| **D-s8-02-status** | `UNPUBLISHED` \| `SCHEDULED` (map from `"unpublished"`) |
| **D-s8-02-upsert** | POST with client `id` = upsert (import + Create reuse) |
| **D-s8-02-no-publish** | Нет вызовов соцсетей |

## Field map (request ↔ Prisma Draft)

| API / client | DB |
|--------------|-----|
| `id`, `moduleId`, `title`, `slides`, `scenario` | columns |
| `status: "unpublished"` | `UNPUBLISHED` |
| `sourceCompetitorId`, `competitorId`, `brand` | `payload` |
| `contentJobId?` | optional FK |
| `createdAt`, `updatedAt` | timestamps |

## Acceptance

- [ ] List возвращает только drafts текущего user
- [ ] Upsert по id стабилен
- [ ] После рестарта API данные в Postgres (не только memory)

## Skills

`backend` § Sprint 8 · `prisma-content-schema`
