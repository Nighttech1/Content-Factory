# Клиент — C-drafts-always

**Дата:** 2026-10-13  
**Сценарий:** S43.1 (partial — без полного Create→draw→publish)  
**Playwright MCP:** `project-0-Content factory-playwright` @ **1440×900**  
**URL:** http://127.0.0.1:3000/studio/carousel-engine  

## Вердикт

**ПРИНЯТО С ЗАМЕЧАНИЯМИ**

Полный Happy Path Create → «Нарисовать» → «Опубликовать» → карточка в Черновиках **без F5** не прогонялся: нужен живой LLM/draw. По инструкции приёмки волны: Embla/Team/N/Close PASS + UI path Черновиков verified → принимать с замечаниями.

## Шаги

1. `navigate` `/studio/carousel-engine`
2. Snapshot: tablist «Вкладки нашей ленты» — tabs **Опубликовано** / **Черновики**
3. Click **Черновики** (`ours-tab-drafts`)
4. Assert empty rail: count `0`; copy  
   «Пока нет черновиков — создайте карусель или сделайте Разбор у конкурента»  
   (Create + Разбор — G4)
5. `localStorage` `cf.carousel.drafts.v1` — отсутствует / пусто → карточек нет (ожидаемо без draw)

## Assert

| Check | Result |
|-------|--------|
| Tab «Черновики» exists | PASS |
| Empty copy mentions Create + Разбор | PASS |
| Cards from localStorage when present | N/A (store empty) |
| Full Create→draw→card without F5 | **NOT RUN** (needs live LLM) |

## Evidence

- Snapshot Черновики empty: Playwright session 2026-10-13T09-49 (heading «Черновики» + empty copy paragraph)
- Screenshot drafts: `.playwright-mcp/page-2026-10-13T09-49-16-244Z.png` (если кадр успел до nav) + re-shot after final click

## Остаток / открытый follow-up

Re-acceptance **S43.1 full** после одного успешного live draw/publish: новая карточка видна на Черновиках без F5. До тех пор тикет **не** закрывать как полный P0 green — только UI path + empty contract.
