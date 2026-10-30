# Глаза Клиента — MCP (сайты)

Конфиг: `.mcp.json`. Node: `E:\Applications\Tools\node` (PATH в mcp).

| Сервер | Зачем |
|--------|--------|
| `playwright` | desktop 1440×900: клики, screenshot, vision |
| `playwright-iphone` | **iPhone 15** — вёрстка + touch scroll |
| `playwright-android` | **Pixel 7** — вёрстка + touch scroll |
| `chrome-devtools` | bounding box, computed styles, сеть |
| `image-compare` | before/after, красная diff-маска |
| `a11y` | контраст WCAG AA |
| `lighthouse` | LCP, CLS, INP, TBT |

Имена в Cursor могут быть с префиксом `user-`.

## Ритуал

1. Localhost жив (URL из спеки проекта).
2. Desktop: `playwright` 1440×900. Mobile: **оба** `playwright-iphone` и `playwright-android`.
3. Подожди шрифты/Lenis (не скелетон).
4. Скролл пальцем / фликом: hero → интерактивная глава → футер. Зафиксируй jank.
5. Контраст текста на фото/видео — отдельно, не верь общему axe-URL.
6. Тикеты через ticket-engine. После фикса — `compare_images` + lighthouse повторно.
7. Mobile hard-reject: `client-review/mobile-qa.md`.

Курсор/часы на diff — ложное срабатывание. Сдвиг сетки — нет.
