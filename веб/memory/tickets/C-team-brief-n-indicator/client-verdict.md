# Клиент — C-team-brief-n-indicator

**Дата:** 2026-10-13  
**Сценарий:** S43.5 / S43.7  
**Playwright MCP:** `project-0-Content factory-playwright` @ **1440×900**  

## Вердикт

**ПРИНЯТО**

## Шаги

1. `navigate` http://127.0.0.1:3000/admin/mesh → redirect OWNER на `/studio/carousel-engine/mesh` (**Команда выпуска**)
2. Snapshot + evaluate: textbox **«Задание»** value `""` (нет combat lorem / baseline brief)
3. Label **«Задание»** + heading в карточке Клиент видны
4. `navigate` `/studio` и `/settings`: нет видимой кнопки/бейджа **«N»** bottom-left; nextjs-portal 0×0, shadow без «N»
5. Screenshot Team + Studio без «N»

## Assert

| Check | Result |
|-------|--------|
| Team «Задание» empty | PASS (`zadanieVal: ""`) |
| No combat lorem in brief | PASS |
| No bottom-left «N» on /studio | PASS |
| No bottom-left «N» on /settings | PASS |
| No bottom-left «N» on Team mesh | PASS |

## Evidence

- Team screenshot: `.playwright-mcp/page-2026-10-13T09-48-22-973Z.png`
- Studio screenshot: `.playwright-mcp/page-2026-10-13T09-49-38-287Z.png`
- Settings screenshots (no N): `.playwright-mcp/page-2026-10-13T09-47-18-007Z.png`

## Примечание

C-155 network (user = raw only, no brief glue) — **не** прогонялся в этом ходе (нет live chat send). UI brief empty — PASS для S43.5; network verify остаётся на отдельный smoke при живом LLM.
