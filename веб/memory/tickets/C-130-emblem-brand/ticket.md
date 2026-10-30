# C-130 — Emblem-only brand (supersedes C-122)

| Field | Value |
|-------|-------|
| **ID** | `C-130` |
| **Priority** | P0 |
| **Area** | shell_nav |
| **Wave** | `W-2026-10-10-nav-mesh-rewrite` |
| **Status file** | pending |
| **[MKT]** | Круглая эмблема клуба + VERNATUN текстом справа |

## Repro

1. Открыть `/studio` — сайдбар brand.
2. Сейчас PNG может содержать baked wordmark / не circle-only emblem из user asset.

**URL:** `http://127.0.0.1:8787/studio`

## Expected

Круглая эмблема **без** baked wordmark слева; справа текст **VERNATUN** / **ARMENIAN CLUB**. Asset: `public/brand/vernatun-emblem.png` (копия user PNG).

## Actual

C-122 канонил `logo-transparent` / wordmark-baked риск; не user circle emblem.

## Notes for Orchestrator

После **C-133**. Сохранить `data-testid="nav-brand"`. Source asset path в architect-spec.
