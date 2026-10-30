# Клиент — приёмка logo-placement-v2

**Дата:** 2026-10-18  
**HARD GATE:** Playwright MCP @1440 — navigate + screenshot на localhost:3000

## Доказательство

| URL | Screenshot |
|-----|------------|
| http://localhost:3000/logo-placement-v2-smoke/slide_01.png | `client-slide-01.png` |
| http://localhost:3000/logo-placement-v2-smoke/slide_02.png | `client-slide-02.png` |
| http://localhost:3000/logo-placement-v2-smoke/slide_06.png | `client-slide-06.png` |

(также открыты/просмотрены 03–05 в smoke-папке Backend)

## Чеклист locks

| Lock | Результат |
|------|-----------|
| Новый wordmark PNG, без отдельного `.brand-name` | PASS |
| Фон лого прозрачный (углы a=0) | PASS |
| Титул (01) лого **сверху** (top-left) | PASS |
| Последний (06) лого **сверху** (top-left) | PASS |
| Остальные (02–05) лого **слева снизу** (bottom-left) | PASS |
| Размер 2× (88→176) | PASS (код + визуал крупнее Phase1) |

**Вне scope волны:** стоковые шрифты (Фаза 2), Pixar-персонаж (Фаза 3) — не режет вердикт этой волны.

## Вердикт

**ПРИНЯТО**

**согласовано** — волна logo-placement-v2 (размещение / размер / прозрачность / logo-only).

C-*: нет по этой волне.
