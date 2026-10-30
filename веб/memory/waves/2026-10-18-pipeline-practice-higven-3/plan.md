# План корректировки пайплайна + тренировка HIGVEN ×3

**Дата:** 2026-10-18  
**Попытки карусели:** ≤3 (STOP после 3-й)  
**ticket_limit:** full-queue  

## Ответы пользователя → locks

| # | Решение |
|---|---------|
| 1 | Активный эталон = **01 HIGVEN** |
| 2 | Раскладка = **Дизайнер (GPT)** до/вместе с генерацией картинки |
| 3 | HITL = чат + кнопка **«Передать дизайнеру»** |
| 4 | Тема = **любая** из useful-таблицы |
| 5 | Строго **3 слайда**: cover · body · cta |
| 6 | Лого = **полный PNG** Vernatun Armenian Club (не split emblem+wordmark) |
| 7 | Дизайнер **параллельно**: `image_prompt` + JSON раскладки → image + renderer (связка заранее; `logo.textColor` из плана зон эталона, не второй вызов после bg) |
| 8 | Art Director после рендера: remarks \| approve, **без** auto-remake |
| 9 | Персонаж = **`none`** |
| 10 | В Settings Design: залить эталоны из `pipeline-practice-2026-10-18`, **активировать 01**, **вычистить** старые эталоны/пресеты из слота |

## Целевой поток (схема GPT, адаптированная)

```text
[Эталон 01 HIGVEN в Settings] + [тема Sheet] + [Brand full logo PNG]
        ↓
Сценарист (Haiku) → текст 3 слайдов
        ↓
HITL чат: пользователь жмёт «Передать дизайнеру»
        ↓
Дизайнер (GPT): ОДНИМ ответом
   • image_prompt ×3 (фон без текста/лого)
   • html_layout JSON ×3 (якоря, кегли/ритм с эталона, logo.placement, logo.textColor по зоне эталона, CTA на last)
        ↓ параллельно
   GPT Image (bg)  ‖  подготовка renderer payload
        ↓
Renderer (Puppeteer layered) → 3 PNG
        ↓
Playwright checks + Art Director + Client
```

## Шаги реализации (роли)

1. **Тренер** — грейд skills под parallel Designer pack + Settings seed HIGVEN-only + 3-slide lock + character none + full logo PNG  
2. **Архитектор** — spec + chain.md (не overlapping paths)  
3. **Backend** — seed Design: clear other etalon presets; install 01 (+ optionally 02 as inactive library); activate 01; brand DEFAULT full `vernatun-logo.png`; force N=3 / characterPaint=none on this smoke job  
4. **AI Bridge** — Scriptwriter 3-slide; Designer system: parallel JSON+prompts; copy HIGVEN grammar; no girl; full logo in HTML `<img>` only (wordmark baked in PNG → no forced HTML textColor invent unless contrast for any residual chrome)  
5. **Smoke** — `scripts/smoke-pipeline-practice-higven-3.ts` → `docs/карусель тест/pipeline-practice-higven-3/` (3 PNG + timeline). Attempt 1; if FAIL visual → Fixer attempt 2; max 3  
6. **Тестер** — guards G: N=3, no character, active pack HIGVEN, logo full PNG, parallel pack fields present  
7. **Деплоер** — public + localhost  
8. **Клиент** — Playwright @1440 → согласовано или тикеты  

## Что НЕ делаем

- Phase 3 girl / Pixar  
- overlay_cutout  
- VPS / social publish  
- Второй Designer-вызов «только ради цвета лого»  
- Больше 3 слайдов в этой тренировке  

## Критерий успеха

Карусель **похожа по оформлению на HIGVEN** (тёмный industrial / оранжевые акценты / чёткая иерархия), наш текст по теме Sheet, лого Vernatun full PNG, 3 кадра, без девочки. Клиент **согласовано** или явный список C-* после ≤3 попыток.
