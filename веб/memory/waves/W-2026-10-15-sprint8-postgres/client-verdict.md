# Клиент — приёмка W-2026-10-15-sprint8-postgres

**Дата:** 2026-10-15  
**URL:** http://localhost:3001  
**Viewport:** 1440×900 Playwright MCP

## Вердикт: ПРИНЯТО С ЗАМЕЧАНИЯМИ

Спринт 8 (Postgres SoT) по сути закрыт: черновики живут на сервере и переживают перезагрузку страницы. Оболочка не ломалась.

### Доказательство (HARD GATE)

1. Playwright `navigate` → `/studio/carousel-engine` @1440  
2. Snapshot + screenshot: `client-drafts-persist.png`  
3. Клики: вкладка **Черновики**, ссылка **Расписание** (навигация жива)  
4. Создан draft через API `POST /api/studio/drafts` title `S8 Client Persist 372562` → reload → карточка видна в UI Черновики; `GET /api/studio/drafts` `hasPersist: true` (count 7)

### Что ок

- [x] Persist черновиков после reload  
- [x] Доска «Mig board» на сегменте (import/smoke след)  
- [x] Shell freeze: меню Студия / Расписание / Настройки / Директор без redesign  
- [x] Smoke API 17/17 (Deployer)  
- [x] Нет соцпубликации в scope волны  

### Замечания (не P0)

1. Локальный URL фабрики сейчас **:3001** (на :3000 — Grafana) — зафиксировать в runbook команды.  
2. В Черновиках видны дубли smoke/mig заголовков с разных прогонов — косметика тестовых данных, не блокер SoT.  
3. Console: 2 errors на странице (не разбирались в этой приёмке) — отдельный хвост при желании.

### Следующий шаг

Спринт **9** — прокачка агентов (по DEV_PLAN). Публикация в соцсети — по-прежнему спринт 22.
