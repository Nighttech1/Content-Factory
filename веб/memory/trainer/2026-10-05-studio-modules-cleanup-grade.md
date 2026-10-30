# Trainer grade — 2026-10-05-studio-modules-cleanup

## План хода

- Запрос: 3 UI-правки `/studio` — (1) вычистить C21/C22 smoke из `data/local/custom-modules.json`, поставить 3 продуктовые плитки «Рилс» / «Нарезки с видео в рилсы» / «Информационное видео», CORE 4 оставить; (2) убрать флуд-статус из `app/studio/page.tsx`; (3) `min-h` карточек 168→252 + вместить весь текст описания.
- Режим: **UI** Studio Launchpad (спринт 1–2 стиль), **без** backend/SSE/воркеров.
- Роли по chain: **Архитектор → Frontend → Тестировщик → Фиксер → Деплоер → Клиент** (Motion не обязателен).
- Лимит: ≤3 тикета в волне (здесь 3 связанных UI-правки = одна волна).
- Риск: dual-source custom (JSON + `cf.customModules.v1`); ids custom обязаны `custom-*`.
- Не трогать: adapters/registry Node, SSE, prod publish, Prisma.
- Приёмка: Playwright `/studio` — нет C21/C22 titles; есть 3 RU-плитки + 4 CORE; шапка без SPEED/Standby/Mock; карточки ≥252px, description читается целиком.
- После грейда: Архитектор пишет spec + `chain.md` с path lock.

## Грейд: A

(Исходно **C** — не было правил product-tiles vs smoke и Launchpad chrome/card-fit. Пробелы закрыты этим ходом → **A**.)

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Нет контракта «smoke C21/C22 ≠ постоянные плитки» + dual-source clear | Архитектор / Frontend | skill `content-module-sdk` | P0 |
| 2 | Нет запрета флуд-статуса Launchpad | Frontend | skill `content-factory-ui` | P1 |
| 3 | Нет нормы min-h 252 + fit description (vs baseline line-clamp) | Frontend | skill `content-factory-ui` | P1 |
| 4 | 21st / baseline-ui / registry / MCP Playwright — ок для волны | — | — | — |

## Что добавлено этим ходом

- `content-module-sdk/SKILL.md` — § Studio product tiles vs C-21/C-22; пример ids `custom-reels` / `custom-clips-to-reels` / `custom-info-video`; reminder localStorage.
- `content-factory-ui/SKILL.md` — § Launchpad chrome + § ModuleSelectorGrid 252px / text-pretty без агрессивного clamp.
- `trainer/gap-playbook.md` — 3 строки симптомов Launchpad.

## Аудит skills (кратко)

| Skill | Вердикт |
|-------|---------|
| `content-factory-ui` | был недостаточен → **усилен** |
| `21st-ui-catalog` | OK (reuse GlassCard; новых кирпичей не требуется) |
| `content-module-sdk` | был недостаточен → **усилен** |
| `baseline-ui` | OK как deslop; override fit-copy в content-factory-ui при конфликте с line-clamp |

## Вердикт

Команда готова к волне: **да**
