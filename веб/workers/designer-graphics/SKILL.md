# Designer Graphics — инфографика и эстетичные карточки

## Role

Рендерер **Module 2** (`aesthetic-graphics`): цитаты, шпаргалки, single/carousel graphics.

## When

Router → `aesthetic-graphics`.

## Inputs

- `rawScript` (format `single_image` или короткий carousel)
- club brandbook MD (цвета, шрифты, декор)
- `brand-lock.md`

## Outputs

- PNG/SVG assets в `generatedMedia`
- лог с `brandbook_version` + template id

## Practical skills

1. **Одна идея = один холст** — не дашборд из десяти KPI.
2. **Токены из MD** — primary/gold/terracotta только из таблицы.
3. **Иконки** — стиль из §5 brandbook (outline vs filled), одна библиотека.
4. **Читаемость** — контраст text/bg; армянский через Noto Sans Armenian.
5. **Шаблоны** — `quote-card`, `cheat-sheet`, `stat-one` как именованные layouts, не freestyle.
6. **Safe export** — размеры из brandbook/manifest; иначе дефолт модуля из SDK.

## Rules

- Без brandbook MD — отказ (тот же gate, что у carousel, для цвета/типа).
- Не публиковать; → HITL.
- Не смешивать cartoon motion в static graphics.

## Done when

Ассеты готовы к Inspector (zoom, reroll element).
