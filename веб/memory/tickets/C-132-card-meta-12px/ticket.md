# C-132 — Card meta: Century Gothic white 12px

| Field | Value |
|-------|-------|
| **ID** | `C-132` |
| **Priority** | P1 |
| **Area** | studio_feed |
| **Wave** | `W-2026-10-10-nav-mesh-rewrite` |
| **Status file** | `status.md` (Frontend done) |
| **[MKT]** | Подписи карточек фида единым шрифтом 12px белым |

## Repro

1. Открыть любой модуль `/studio/[moduleId]` — карточки Наши / Конкуренты.
2. Meta (title snippet, @username, views/likes/comments) — смешанные размеры/цвета/не Century Gothic.

**URL:** `http://127.0.0.1:8787/studio/<moduleId>`

## Expected

Все card caption/meta на VerticalPostCarousel / FeedPostCard **всех модулей**: Century Gothic (`--font-ui` / `--font-century` если есть), **white**, **12px**.

## Actual

Нет единого токена meta 12px white.

## Notes for Orchestrator

Feed path first (до C-131 Motion). Не overlap Razbor titles (C-134 = 16px system).
