# Клиент — W-2026-10-12-carousel-json-pipeline (S41+S42)

Дата: 2026-10-12  
URL: http://localhost:3000/studio/carousel-engine @1440

## Вердикт: ПРИНЯТО С ЗАМЕЧАНИЯМИ

### Доказано Playwright

| Check | Result |
|-------|--------|
| Create modal chrome (segment + Передать задание) | OK |
| Scriptwriter N=4 → JSON `requested_slide_count: 4` + chip N= | OK |
| media-proxy reject bad host | 400 OK |
| aspect-ratio CSS `4 / 5` | OK |
| Guards static P0/JSON/HTML | PASS (Tester) |

### Fixer mid-flight

`CreateCarouselPreview` `bindFrameImg` вызывал `setState` в commit → **Maximum update depth**. Исправлено: bail если статус уже `loaded`/`error` + `queueMicrotask`.

### Замечания P2

1. Полный live draw (HTML→PNG × N) долгий — повторно прогнать «Нарисовать» после фикса цикла и убедиться, что кадры видны (не чёрный экран).
2. Сценарист иногда даёт длинный hook на обложке (>8 слов) — tone soft.

### P0/P1 после фикса цикла

P0 runtime crash закрыт Фиксером. Повторная приёмка preview load — пользователю на localhost.
