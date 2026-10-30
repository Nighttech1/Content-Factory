# Architect spec — C-s8-03-boards (P0)

> DEV_PLAN **8.3** · Wave `W-2026-10-15-sprint8-postgres`  
> Depends on: **C-s8-01** (после C-s8-02 по wave order)  
> `shell_freeze: true`

## Goal

Доски референсов и их картинки переживают refresh и другой браузер: CRUD в Postgres + файлы в storage (URL в БД).

## Decision locks

| Lock | Decision |
|------|----------|
| **D-s8-03-routes** | `GET/POST /api/studio/boards`, `PATCH/DELETE /api/studio/boards/[id]`, `POST /api/studio/boards/upload` |
| **D-s8-03-media** | Upload пишет на диск/bucket (`generatedMedia/boards/{userId}/…`); в Postgres только URL/paths — **не** гигантский base64 как SoT |
| **D-s8-03-import-prep** | Upload принимает data-URL для будущего one-shot import |
| **D-s8-03-shape** | `id`, `title`, `slideUrls[]`, `createdAt` (ms→DateTime) |
| **D-s8-03-scope** | userId isolation |
| **D-s8-03-ui** | Не менять Boards segment chrome (S51) — только будущий data wire в C-s8-06 |

## Acceptance

- [ ] Создал доску через API → GET list после рестарта API видит её
- [ ] Upload возвращает https/relative URL, не data: как единственный SoT
- [ ] Чужой userId не видит доски

## Skills

`backend` § Sprint 8 · `safe-db-migrations` (no DDL here unless missed FK)
