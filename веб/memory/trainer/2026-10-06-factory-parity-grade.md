# Trainer grade — 2026-10-06-factory-parity

## План хода

- Запрос: волна **W-2026-10-06-factory-parity**. 7 user asks в 3 тикета. **C-48 deferred.** Прод-код Тренер не пишет.
- Режим: UI workspace/feed + Mesh per-module + `/schedule` 21st + RU chrome. Без prod publish, без wipe DB.
- Роли: **Архитектор → Frontend (+ 21st, xyflow, content-factory-ui) → Motion → Тестировщик → Фиксер → Деплоер → Клиент**. AI Bridge — только если Architect найдёт `moduleId` gate в razbor-pipeline. Backend — только если persist слотов календаря не в клиентском store.
- Лимит: ≤3 тикета = C-52 P0, C-53 P0, C-54 P1. Overlap: `FeedPostCard` / `StudioModuleWorkspace` / `VerticalPostCarousel` — **последовательно** C-52 → C-53 → C-54.
- Приёмка: client-scenarios S3/S6/S7/S8 + Playwright; guards после Тестера.

## Тикеты волны

| ID | P | Суть |
|----|---|------|
| **C-52** | P0 | SWR: скелетоны только на пустой первой загрузке; graphics: нет Play, comments + `metrics.shares` |
| **C-53** | P0 | Опубликовано/Черновики + Разбор (C-51 агенты) на всех модулях; mesh = 7 пайплайнов Студии |
| **C-54** | P1 | `/schedule` 21st calendar + правый список модулей/постов; весь chrome RU |
| **C-48** | P1 | **вне волны** (описания custom-плиток) |

## Грейд: A

Исходно **C**: skills противоречили запросу (скелетоны на каждый loading; Play на всех карточках; EN `Studio Launchpad` как канон C-46; mesh = один Router 1..N; нет контракта `/schedule`). Пробелы закрыты этим ходом → **A**.

Цикл/MCP/роли: не D. Playwright + 21st в `.cursor/mcp.json` живы. Платный MCP не предлагать.

## Пробелы (до патча)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | `if (loading) skeletons` / `feedLoading\|\|competitorsLoading` → моргание | Frontend | skill `content-factory-ui` | P0 |
| 2 | Play на image-карточках; нет comments/shares | Frontend | `content-factory-ui` FeedPostCard | P0 |
| 3 | Drafts/Razbor только carousel-engine | Frontend / AI Bridge | `content-factory-ui` + `content-pipeline-agents` | P0 |
| 4 | Canvas один graph Router→1..N | Frontend Mesh | `xyflow-agent-mesh` | P0 |
| 5 | Нет 21st calendar + очередь «готово к слоту» | Frontend | `21st-ui-catalog` + `content-factory-ui` `/schedule` | P1 |
| 6 | EN chrome (Launchpad/Canvas/Schedule/Analytics/Brand Kit) канонизирован C-46 | Frontend | `content-factory-ui` + `frontend.mdc` | P1 |
| 7 | Регрессии C-46/C-49/C-40 устарели | Тестировщик / Клиент | `client-review` + `client-scenarios` S6–S8 | P1 |

## Что добавлено этим ходом

- `content-factory-ui/SKILL.md` — SWR C-52; media-aware Play + `metrics.shares`; all-modules C-53; `/schedule` + RU glossary C-54 (C-46 EN title superseded).
- `xyflow-agent-mesh/SKILL.md` — 7 пайплайнов: `carousel-engine`, `aesthetic-graphics`, `cartoon-reels`, `heygen-reels`, `custom-reels`, `custom-clips-to-reels`, `custom-info-video`.
- `21st-ui-catalog/SKILL.md` — calendar search; skeleton ≠ refetch replace.
- `content-pipeline-agents/SKILL.md` — Razbor на всех moduleId.
- `trainer/gap-playbook.md` — 6 строк симптомов волны.
- `client-review/regression-guards.md` — C-46 superseded; C-52/53/54 stubs; C-40/C-49 nuance.
- `client-scenarios/SKILL.md` — S6 schedule, S7 flicker/graphics, S8 all-modules Razbor; S3 mesh per-type.
- `.cursor/rules/frontend.mdc` — RU chrome + SWR + mesh per-type.
- `plugins/trainer/PLUGINS.md` — `/schedule` в карточке 21st.

## Аудит слоёв

| Слой | Вердикт |
|------|---------|
| Роли registry + trainer/architect/frontend/client | OK |
| MCP playwright / chrome-devtools / 21st | OK, бесплатный путь |
| data-safety | OK — не wipe, не publish |
| Env IG | не блокер этой волны (mock/live как есть) |
| C-48 | не в chain |

## Рекомендуемый chain

```
Архитектор → Frontend → Motion → Тестировщик → Фиксер → Деплоер → Клиент
```

Path lock (не overlap параллельно):

1. **Архитектор** — spec + `chain.md`: SWR contract; media vs video; workspace flags all modules; mesh graphs ×7; schedule persist; RU string inventory. Не трогать C-48.
2. **Frontend** — C-52 (`VerticalPostCarousel`, `FeedPostCard`, `StudioModuleWorkspace`, `feed-types`) → C-53 (те же workspace files + `/admin/mesh` + `xyflow-agent-mesh`) → C-54 (`/schedule` 21st + nav/i18n).
3. **Motion** — тихий refetch indicator (не pulse-replace); mesh PulseEdge на каждом пайплайне; calendar enter/slot micro-motion.
4. **AI Bridge** — только если razbor-pipeline режется по `carousel-engine`.
5. **Тестировщик** — guards C-52/53/54 + S6–S8; RBAC Холст OWNER.

## Вердикт

Команда готова к волне: **да**
