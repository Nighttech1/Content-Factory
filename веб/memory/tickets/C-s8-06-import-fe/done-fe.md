# Done FE — C-s8-06-import-fe (Frontend-minimal)

**Дата:** 2026-10-15  
**Роль:** Frontend-minimal  
**Wave:** W-2026-10-15-sprint8-postgres  
**shell_freeze:** true (0 edits AppShell / Sidebar / nav chrome)

## What changed

| File | Change |
|------|--------|
| `lib/studio/sprint8-client.ts` | Thin fetch helpers → drafts / boards / upload / schedule / design-slots / migrate-local |
| `lib/studio/sprint8-migrate.ts` | One-shot `ensureSprint8Migrated()`; flag `cf.sprint8.migrated.v1`; clear legacy SoT keys; keep `cf.carousel.selectedDraftId` |
| `lib/studio/carousel-drafts-store.ts` | Hydrate/list from API; upsert/patch via API; selectedDraftId local |
| `lib/studio/boards-store.ts` | Hydrate/list from API; upload data: → URLs; create/rename/delete via API |
| `lib/schedule/storage.ts` | Memory+cache; hydrate from API; writeSchedule upsert/delete slots via API |
| `lib/settings/design-library.ts` | Memory+cache; hydrate from design-slots; append/update/activate/delete via API |

## Behavior

1. On studio/settings init: `ensureSprint8Migrated()` reads legacy keys → `POST /api/studio/migrate-local` → sets `cf.sprint8.migrated.v1` → clears legacy SoT keys.  
2. Stores hydrate from API (SoT); zustand/localStorage remain offline cache only.  
3. Mutations optimistic in memory + write-through to API.  
4. No social publish UI. No shell/nav edits.

## Acceptance self-check

- [x] Stores read/write via fetch to APIs  
- [x] One-shot import + flag  
- [x] Diff limited to allowed lib paths (+ helpers)  
- [ ] Live F5 / second-profile smoke → C-s8-07 Tester

## Next

Chain step 8 → Tester **C-s8-07**.
