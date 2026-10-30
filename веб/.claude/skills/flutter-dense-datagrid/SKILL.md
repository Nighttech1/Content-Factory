---
name: flutter-dense-datagrid
description: >-
  Flutter dense data grid craft: PlutoGrid virtualization, tabular figures,
  pinned columns, fl_chart. Use when Frontend builds Flutter tables. Forbids
  Material DataTable. Luxury websites use CSS/HTML tables instead.
---

# Flutter Dense DataGrid Craft

Канон цветов — `DESIGN.md` / тема проекта. Hex в виджете экрана запрещён.

Пакеты проекта: `pluto_grid`, `fl_chart`. Не подключай новый грид без обновления `DESIGN.md` + chain.

## Когда звать

Реестры ПД/РД, сметы, матрицы, финансовые колонки, графики cash-flow, любой экран «много строк».

## Плотность (Bloomberg / Linear)

| Токен | Значение |
|-------|----------|
| Высота строки | **32–36 px** (канон темы: 34) |
| Высота колонки | **36 px** |
| Cell type | 13, `FontFeature.tabularFigures()` |
| Column label | 12, w600, caps/tracking по `DESIGN.md` |
| Hover строки | токен темы (`rowHover` / surfaceMute), **без** смены высоты |
| Фон сетки | `contentBg` / surface, не Material canvas |
| Сетка линий | hairline `white@~6–8%`, не жирная серая рамка |
| Фокус/activated border | янтарь / `preset.accent` |
| Zebra | опционально через token, не Card на каждую строку |

Целевые поверхности luxury (клади в `DESIGN.md` / preset, не в экран): строка `#13171E`, hover `#1A202A` — если пресет ещё не совпал, сначала тема.

## Правила

1. **Только виртуализированные гриды** (`PlutoGrid`). `DataTable`, `Table`, `ListView`+`Card` на реестрах — запрещены.
2. Pinned columns для ключа (шифр, дата, сумма) — не горизонтальный хаос.
3. Inline-edit: `PlutoGridMode` / enter → вниз; без модалки на одну ячейку.
4. Hover: цвет фона, не layout jump (`enableRowColorAnimation` не должен менять rowHeight).
5. Числа/даты/деньги: tabular figures; выравнивание end для сумм.
6. Статусы: компактный чип (цвет @16–20%), не `Chip` с elevation.
7. Графики: `fl_chart` + токены темы; не дефолтный синий LineChart.
8. Пустая сетка: одна строка-пояснение + CTA, не «No rows» по центру карточки.

## Тема

Источник: `app/lib/core/theme/grid_theme.dart` → `AedificaPlutoGridTheme.configuration(preset)`.

Новый экран:

```dart
PlutoGrid(
  columns: columns,
  rows: rows,
  configuration: AedificaPlutoGridTheme.configuration(preset),
  mode: PlutoGridMode.normal,
)
```

Не копируй `PlutoGridStyleConfig` в экран — расширяй `grid_theme.dart`.

## /audit грида

- [ ] Не `DataTable` на реестре
- [ ] rowHeight 32–36
- [ ] tabular figures на числах
- [ ] hover без дёрганья
- [ ] hairline + янтарь-фокус из темы
- [ ] нет сырого `Color(0xFF…)` в файле экрана
