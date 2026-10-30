# Wave W-2026-10-05-studio-tiles-cleanup

| Field | Value |
|-------|-------|
| **Sprint** | Studio Launchpad polish (product tiles + header cleanup) |
| **Max tickets** | 3 |
| **Status** | accepted_with_remarks |
| **Depends on** | Trainer grade A — `memory/trainer/2026-10-05-studio-modules-cleanup-grade.md` |
| **Chain (типовой)** | Архитектор → Frontend → Тестировщик → Фиксер → Деплоер → Клиент |
| **before_sha** | N/A (no git) |

## Tickets

| ID | P | Folder | Scope | Result |
|----|---|--------|-------|--------|
| C-45 | P1 | `tickets/C-45-product-module-tiles/` | Убрать QA-плагины C21/C22; 3 продуктовые плитки | **done** (ids/titles; см. C-48) |
| C-46 | P1 | `tickets/C-46-studio-header-cleanup/` | Убрать флуд-статус Launchpad | **done** |
| C-47 | P1 | `tickets/C-47-module-card-height/` | min-h×1.5 + fit description | **done** |
| C-48 | P1 | `tickets/C-48-custom-tile-descriptions/` | RU description из JSON → API/UI | **open** (замечание Клиента) |

## Client acceptance (2026-10-05)

Вердикт: **ПРИНЯТО С ЗАМЕЧАНИЯМИ**. Hard REJECT (S1–S5 / mesh / Generate) не срабатывал — волна про визуал Launchpad.

Live checks (`127.0.0.1:3000`):
- `/studio` HTTP 200; header = Studio Launchpad + пояснение; нет SPEED / Standby / Mock pipeline
- `Բարև` только в sidebar (`SidebarNavigation`), не в header страницы
- API custom: count=3, ids product, titles RU, junk C21/C22 нет; CORE×4 в manifests
- Cards `min-h-[252px]`, без `line-clamp` на description
- **Замечание:** API description = `Custom worker · …` вместо seed RU → **C-48**

Playwright MCP в этой сессии недоступен — визуал словами + HTML/API.


## Safety

- Не трогать Postgres / Redis / generatedMedia.
- Не публиковать в соцсети.
- CORE manifests (`carousel-engine`, `aesthetic-graphics`, `cartoon-reels`, `heygen-reels`) не удалять.
- Smoke QA plugins только из `custom-modules.json` (+ localStorage mirror).
