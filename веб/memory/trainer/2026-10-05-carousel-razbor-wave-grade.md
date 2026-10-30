# Trainer grade — 2026-10-05-carousel-razbor-wave

## План хода

- Запрос: волна **Instagram carousel workspace + Razbor** (НЕ Launchpad). Три тикета-черновика C-49 / C-50 / C-51.
- Режим: **UI** Studio module workspace + Settings + Razbor modal/pipeline; лёгкий wire settings→feed slice; **без** Launchpad / mesh / prod publish.
- Роли по chain: **Архитектор → Frontend → Motion → AI Bridge → Тестировщик → Фиксер → Деплоер → Клиент** (Backend только если Architect решит API `limit`/`pageSize`; иначе FE+settings localStorage).
- Лимит: ≤3 тикета (= эта волна целиком).
- Не трогать: Launchpad tiles, `/admin/mesh`, Prisma migrate reset, live IG scrape, secrets.
- Приёмка: Playwright module workspace + Razbor сценарий (welcome → click «Начать разбор»); Settings pageSize; no autoplay; visual parity dual feed.
- После грейда: Архитектор — spec + `chain.md` + path lock по файлам тикетов.

## Тикеты-черновики (зафиксировано)

| ID | Суть | Files (черновик) |
|----|------|------------------|
| **C-49** | Workspace: убрать «Опубликованные посты модуля» / «Актуальные карусели ниши»; убрать `ModuleIdeaBar`; competitors search bar = высота Ours published/drafts toggle; round play на всех feed cards (**no autoplay**); visual parity ours vs competitors | `StudioModuleWorkspace`, `VerticalPostCarousel`, `FeedPostCard`, `ModuleIdeaBar` |
| **C-50** | Settings: блок «Рилсы» — отображение (кол-во на странице); wire в feed slice | `app/settings/page.tsx`, `lib/settings/*`, feed consumers |
| **C-51** | Razbor: analyst welcome + «Начать разбор» (no auto-start); убрать designer из cascade; scriptwriter **full script** (roles/plot/text/location); убрать UI «Готовая карусель»; competitor reel panel = play + CapCut-like timeline scrubber | `RazborModal`, `razbor-pipeline`, `FeedPostCard` |

## Грейд: A

(Исходно **C** — skills противоречили C-49/C-51: C-28 требовал ModuleIdeaBar; C-30 / pipeline держали Designer + auto-start; не было Settings pageSize и feed play/parity. Пробелы закрыты этим ходом → **A**.)

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Нет контракта cleanup workspace (IdeaBar / label-баннеры / parity / round play no-autoplay) | Frontend | skill `content-factory-ui` | P0 |
| 2 | Razbor: Designer в cascade + auto-start + «Готовая карусель» vs C-51 | AI Bridge / Frontend | skill `content-pipeline-agents` | P0 |
| 3 | Нет Settings «Рилсы» pageSize → feed slice | Frontend (± Backend) | skill `content-factory-ui` | P1 |
| 4 | Regression C-28/C-30 устарели — риск ложного FAIL у Тестера | Тестировщик / Клиент | `client-review/regression-guards.md` | P1 |
| 5 | Timeline scrubber — motion contract | Motion | reuse `web-motion-engine` (достаточно) | P2 |
| 6 | Roles / MCP Playwright / registry / data-safety | — | OK | — |

## Что добавлено этим ходом

- `content-factory-ui/SKILL.md` — § Module Workspace C-49; § FeedPostCard play; § Settings Рилсы C-50; § Razbor modal chrome C-51.
- `content-pipeline-agents/SKILL.md` — § Razbor cascade C-51 (Analyst → Scriptwriter only; no auto-start; full script JSON; no Designer / «Готовая карусель»).
- `trainer/gap-playbook.md` — 5 строк симптомов workspace / Razbor / settings.
- `client-review/regression-guards.md` — C-28 / C-30 marked **superseded** by C-49 / C-51.

## Аудит skills (кратко)

| Skill / слой | Вердикт |
|--------------|---------|
| `content-factory-ui` | был недостаточен → **усилен** |
| `content-pipeline-agents` | противоречил C-51 → **усилен** |
| `21st-ui-catalog` | OK (scrubber/play — adapt 21st или local Motion) |
| `web-motion-engine` | OK для scrubber spring |
| `client-scenarios` / Playwright MCP | OK для приёмки |
| `content-module-sdk` | N/A (не Launchpad) |
| Backend / Prisma | не блокер; Architect решает limit API vs client slice |

## Рекомендуемый chain

```
Архитектор → Frontend → Motion → AI Bridge → Тестировщик → Фиксер → Деплоер → Клиент
```

Path lock (не overlap):

1. **Frontend** — C-49 workspace chrome + C-50 settings UI/persist + C-51 modal shell (welcome button, remove designer/carousel UI).
2. **Motion** — FeedPostCard round play + Razbor reel scrubber (после FE shell).
3. **AI Bridge** — `razbor-pipeline` messages/cascade без designer; Scriptwriter full-script fields.

Backend — только если Architect впишет API `?limit=` из settings; иначе не звать.

## Вердикт

Команда готова к волне: **да**
