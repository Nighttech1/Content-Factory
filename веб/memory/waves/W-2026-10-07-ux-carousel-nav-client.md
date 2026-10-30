# Клиент — приёмка волны UX 2026-10-07

## Вердикт: ПРИНЯТО С ЗАМЕЧАНИЯМИ

Сценарии Playwright на localhost `http://127.0.0.1:3000`:

| Scenario | Result | Evidence |
|----------|--------|----------|
| S15 carousel 9:16 + Разбор + Создать | PASS | DOM: aspect `9/16`, layout `stack`, 12× `razbor-btn`, modal chat+preview; screenshots C-64/C-65 |
| S16 Команда выпуска + panel | PASS | Nav + H1 «Команда выпуска»; нет «Только владелец»; click Исследователь → panel name/skills/заявки |
| S17 Расписание | PASS | folders collapsed; no day-strip; `[prev] октябрь 2026 [next]` |

### Замечания (не P0)

1. Заголовок модуля каруселей всё ещё «Карусели Instagram (4:5)» в H1 — продуктовый label манифеста; фид уже 9:16. Можно отдельно переименовать.
2. На localhost (`next dev`) первая компиляция маршрута всё ещё может быть >1 с; skeleton `loading.tsx` закрывает «белую дыру». Для цифр — смотреть `next start`.

### Tickets

C-63…C-67 → `accepted` / Client `[x]`. VPS не трогали.
