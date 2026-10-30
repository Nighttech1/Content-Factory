# C-39 — IG Hashtag top_media competitor feed

| Field | Value |
|-------|-------|
| **ID** | `C-39` |
| **Priority** | P0 |
| **Wave** | W-2026-09-21-ig-hashtag-competitors |
| **Status** | done (ПРИНЯТО С ЗАМЕЧАНИЯМИ) |

## Expected

1. Конкуренты в `carousel-engine` feed берутся через Instagram **Hashtag Search** + **`top_media`** (карусели предпочтительно), по `?topic=`.
2. Без topic → дефолтные нишевые хэштеги (из C-38 / config).
3. `IG_COMPETITOR_USERNAMES` — optional fallback only, не обязателен.
4. Кэш по topic+hashtags; soft-fail → mock; без токена не 500.

## Notes

Depends C-38. UI — C-40.
