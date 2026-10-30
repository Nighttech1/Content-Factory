# C-134 — System / Razbor titles: CG white 16px

| Field | Value |
|-------|-------|
| **ID** | `C-134` |
| **Priority** | P1 |
| **Area** | razbor / typography |
| **Wave** | `W-2026-10-10-nav-mesh-rewrite` |
| **Status file** | pending |
| **[MKT]** | Системные заголовки единого кегля 16px белым Century Gothic |

## Repro

1. Открыть Razbor modal — eyebrow/title / system source headings.
2. Размеры/шрифты плавают; не единый app-wide pattern 16px white CG.

**URL:** `http://127.0.0.1:8787/studio/<moduleId>` → Razbor

## Expected

System source titles (Razbor modal eyebrow/title и аналогичные system headings): Century Gothic, **white**, **16px** — app-wide pattern.

## Actual

Нет зафиксированного 16px white CG для system/Razbor titles.

## Notes for Orchestrator

Razbor path first (до C-135 chrome). Не путать с card meta 12px (C-132).
