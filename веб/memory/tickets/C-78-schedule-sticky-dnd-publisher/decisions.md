# Decisions — C-78

## Канон (без развилок)

| Решение | Канон |
|---------|--------|
| SoT слота | `ScheduleSlotV1` в `localStorage` key `cf.schedule.v1` |
| Sticky popup | pointer-events на popup + leave обоих + grace **≤150ms** |
| DnD date↔date | update `startsAt` **день**; **время** из старого ISO сохранять |
| Rail→cell | сохранить существующий contract |
| Publisher sync | двусторонний по `postId`; календарь очередь ≠ social publish |
| Footer help | **удалить целиком** (время + «Нажмите день…» + «Сначала выберите…») |
| Time edit | только в popup / cell |
| Platforms | **out** → C-79 |
| Wave3 E2E leftover | guards этого тикета (не новый C-76) |
| Schema Postgres | **не** в UX-4a |

## Path lock

```
ALLOWED: schedule/*, lib/schedule/storage.ts, RazborPublisherPane, publisher datetime sync paths
FORBIDDEN: Settings platforms, platformId UI, C-76 manifests, MultiButton VARIANT rewrite
```

## Rollback

1. `git checkout --` paths из chain Frontend/Motion.
2. Папку тикета не удалять.
