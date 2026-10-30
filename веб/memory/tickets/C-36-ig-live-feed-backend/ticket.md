# C-36 — Live Instagram feed backend (ours + competitors)

| Field | Value |
|-------|-------|
| **ID** | `C-36` |
| **Priority** | P0 |
| **Wave** | W-2026-09-20-live-ig-carousels |
| **Status** | client: ПРИНЯТО С ЗАМЕЧАНИЯМИ (2026-09-20) |

## Expected

1. Backend тянет **наши** карусели с Instagram Business/Creator аккаунта `mosarmclub` (Graph API media + children + public metrics).
2. Backend тянет карусели **конкурентов** через Instagram **Business Discovery** по списку usernames из конфига.
3. `GET /api/studio/carousel-engine/feed` отдаёт реальные посты + цифры когда токен настроен; иначе mock + явный `sourceMode: "mock"|"live"` (на `FeedResponse` и каждом `FeedPost`).
4. Кэш in-memory TTL ~10 min (5–15) — без Redis/BullMQ.
5. `.env.example`: `IG_USER_ID`, `IG_OURS_USERNAME=mosarmclub`, `IG_COMPETITOR_USERNAMES=...` рядом с существующими токен-плейсхолдерами. Реальные секреты только в `.env`.
6. Soft-fail per side; Prisma **не** трогаем.

## Spec

- `architect-spec.md` · `chain.md` · `status.md` · `decisions.md`
- Next after C-35: **Backend** → Tester → Fixer → Deployer → Client
- Then unlock C-37.

## Notes

Depends: C-35. UI wiring — C-37. Без scrape HTML. Без wipe БД.
