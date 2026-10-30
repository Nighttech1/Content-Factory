# Mobile QA — приёмка Клиентом (premium landing)

Код не пишешь. Используй вместе с `web-visual-critic` и `client-review`.

## MCP глаза

| Сервер | Viewport / device | Обязателен |
|--------|-------------------|------------|
| `playwright` | 1440×900 desktop | да |
| `playwright-iphone` | iPhone 15 (~393) | да для mobile-волны |
| `playwright-android` | Pixel 7 (~412) | да для mobile-волны |
| `image-compare` | before/after | после фикса |
| `lighthouse` | mobile metrics | да (LCP/CLS/INP) |
| `a11y` | контраст | выборочно на фото/видео |

Имена в Cursor могут быть с префиксом `user-`.

## Ритуал мобильной приёмки

1. Localhost жив.
2. Открой URL в `playwright-iphone` и `playwright-android`.
3. Дождись шрифтов / Lenis (не скелетон).
4. Скрины: hero, середина главы с интерактивом, footer.
5. Пальцевый скролл: несколько фликов вверх/вниз; отметь jank / залипание.
6. Проверь чеклисты: `responsive-mobile-web/breakpoints.md` + `mobile-touch-scroll/touch-checklist.md`.
7. Тикеты `C-*` через `ticket-engine`. Закрытие — только after-скрин + guard.

## Hard REJECT (mobile) — автоматическое НЕ ПРИНЯТО

Любой пункт на скрине 390/412:

1. Горизонтальный скролл документа
2. Обрезанный тип / недоступный CTA
3. Хаотичная сетка вместо одной колонки
4. Рваный/мёртвый скролл пальцем или сцена, которая перехватывает жест
5. Интерактив только через hover
6. Контент под safe-area (вырез / home indicator) без отступа

Desktop hard-reject из `client.mdc` остаётся в силе для 1440.
