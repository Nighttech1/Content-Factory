# Architect spec — C-s8-06-import-fe (P0)

> DEV_PLAN **8.6** · Wave `W-2026-10-15-sprint8-postgres`  
> Depends on: **C-s8-02…C-s8-05** APIs green  
> `shell_freeze: true` · Frontend-minimal only

## Goal

1. Backend: one-shot `POST /api/studio/migrate-local` — принять legacy buckets, upsert в Postgres, идемпотентно.  
2. Frontend-minimal: при старте один раз прочитать localStorage → import → флаг; дальше stores читают/пишут **API** (кэш в памяти/persist OK).

## Decision locks

| Lock | Decision |
|------|----------|
| **D-s8-06-endpoint** | `POST /api/studio/migrate-local` body: `{ drafts?, boards?, schedule?, designLibrary?, designActiveId? }` |
| **D-s8-06-keys** | Map wave §8; skip chrome keys |
| **D-s8-06-boards-media** | data:/blob: → boards upload внутри import, затем URL |
| **D-s8-06-idempotent** | Same ids → update; second call no dup storms; return counts |
| **D-s8-06-flag** | Client `cf.sprint8.migrated.v1` after success |
| **D-s8-06-wire** | Swap SoT in four libs only (paths below) |
| **D-s8-06-shell** | **0** edits AppShell / Sidebar / nav / feed chrome / Create/Razbor layout |
| **D-s8-06-selected** | `selectedDraftId` может остаться local |

## Paths (Frontend-minimal)

| File | Change |
|------|--------|
| `lib/studio/carousel-drafts-store.ts` | hydrate/mutate via drafts API |
| `lib/studio/boards-store.ts` | via boards API |
| `lib/schedule/storage.ts` | via schedule API (read/write helpers) |
| `lib/settings/design-library.ts` | via design-slots + activate; keep resolve helpers |
| optional thin `lib/studio/sprint8-migrate.ts` | one-shot bootstrap |

## Acceptance

- [x] Старые ключи переносятся один раз (FE one-shot + flag; live proof → C-s8-07)
- [x] Повторный import не дублирует (idempotent API + client flag)
- [ ] После import F5 показывает server data → C-s8-07 Tester
- [x] Diff волны: нет churn shell/nav файлов

## Skills

`backend` § 8.6 · `content-factory-ui` § Frontend-minimal
