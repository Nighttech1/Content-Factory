# Клиент — авто-Playwright без пользователя

Скрипт: `scripts/client-playwright-carousel-accept.ts`  
Вызывается после smoke и вручную Оркестратором.

Проверяет:
1. `/studio` жив
2. Каждый PNG в `public/vernatun-jobs/*` (режимы A и B)
3. Размеры / вес / HTTP / скриншоты

Отчёт: `memory/client-accept/YYYY-MM-DD/CLIENT_ACCEPT_REPORT.md`
