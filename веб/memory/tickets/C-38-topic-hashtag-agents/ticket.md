# C-38 — Topic → hashtags (Researcher upgrade)

| Field | Value |
|-------|-------|
| **ID** | `C-38` |
| **Priority** | P0 |
| **Wave** | W-2026-09-21-ig-hashtag-competitors |
| **Status** | done (ПРИНЯТО С ЗАМЕЧАНИЯМИ) |

## Expected

1. Researcher (agents + workers + skill) умеет из **темы** (RU/EN) выдавать 1–5 Instagram hashtags для поиска топовых каруселей.
2. Если тема пустая — дефолтные нишевые хэштеги Armenian Club / Vernatun (документированный список).
3. Ручной `IG_COMPETITOR_USERNAMES` больше **не primary** способ найти конкурентов (опциональный fallback только).
4. Без HTML scrape; только Hashtag Graph API как канал данных (реализация fetch — C-39).

## Notes

AI Bridge only. Backend/UI — C-39/C-40.
