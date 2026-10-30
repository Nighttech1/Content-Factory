# Trainer grade — 2026-10-06-nav-mesh-razbor

## План хода

- Запрос: волна **W-2026-10-06-nav-mesh-razbor**. Три тикета пользователя. Прод-код Тренер не пишет.
- Режим: UI Launchpad/сайдбар + Mesh view-only + dual-feed header + Razbor carousel Designer/Publisher + голос + `/schedule` file-tree. Без prod publish, без wipe DB.
- Роли: **Архитектор → Frontend (+ 21st, xyflow, content-factory-ui) → Motion → AI Bridge → Тестировщик → Фиксер → Деплоер → Клиент**. Backend — только если Architect решит persist datetime Razbor/слота не в существующем C-54 store.
- Лимит: ≤3 тикета = **C-58 P0, C-59 P0, C-57 P1**. Path lock: **C-57 → C-58 → C-59** (не overlap параллельно).
- Приёмка: client-scenarios **S9 / S10 / S11** + Playwright; guards после Тестера.
- Отвергнуто ранее: C-51 «Designer вне Razbor» — **частично superseded** C-59 только для `carousel-engine`. C-08 plugin-slot add — **superseded** C-58 (холст не конструктор).

## Тикеты волны

| ID | P | Суть |
|----|---|------|
| **C-57** | P1 | Убрать «Ничего не выбрано / 1 выбран»; `SidebarNavigation` = MenuVertical (`framer-motion`, `text-sm`, Studio children мельче) |
| **C-58** | P0 | `MeshPipelineSwitcher` сверху; нет add-module; `nodesDraggable=false`; no connect; LR view-only; шапка конкурентов last-known count |
| **C-59** | P0 | Mic во всех AI-чатах через `AgentChatComposer`; Designer после сценариста только carousel; публицист datetime 21st без чата; schedule animated-file-tree |

## Грейд: A

Исходно знания волны уже лежат в skills (после закрытия тех же пробелов в playbook + domain skills). Критичных дыр C/D нет: роли в реестре, MCP Playwright/21st/chrome-devtools живы, цикл Клиент↔Оркестратор цел, data-safety не нарушается.

Цикл/MCP/роли: не D. Платный MCP не предлагать.

## Пробелы (закрыты в skills до кода; не блокер)

| # | Пробел | Роль | Слой | P0/P1/P2 | Статус |
|---|--------|------|------|----------|--------|
| 1 | Счётчик Launchpad | Frontend | `content-factory-ui` C-57 | P1 | skill OK |
| 2 | Paste 21st `motion/react` + `text-4xl` | Frontend | `21st-ui-catalog` adapt | P1 | skill OK |
| 3 | Mesh как конструктор (C-08) | Frontend Mesh | `xyflow-agent-mesh` view-only C-58 | P0 | skill OK |
| 4 | Header `loading ? "…" : count` | Frontend | `content-factory-ui` dual feed C-58 | P0 | skill OK |
| 5 | Второй Web Speech / чужой composer | Frontend | `content-factory-ui` AgentChatComposer | P0 | skill OK |
| 6 | Designer вырезан C-51 на карусели | AI Bridge / Frontend | `content-pipeline-agents` C-59 | P0 | skill OK |
| 7 | Чат у публициста | Frontend | Razbor publisher pane | P0 | skill OK |
| 8 | Плоский список `/schedule` | Frontend | `21st-ui-catalog` file-tree | P1 | skill OK |

Мелочь для Architect (не C): HITL `ScriptEditor` в Inspector — **не** AI-чат, mic не вешать. Живой SpeechRecognition сейчас только в `AgentChatComposer` (+ Razbor reuse). C-08 `onAddModule` в `CanvasTopBar` — удалить, не «спрятать».

## Что добавлено этим ходом

- Артефакт: этот файл (`memory/trainer/2026-10-06-nav-mesh-razbor-grade.md`).
- Патч skills **не делался**: грейд A; канон C-57/58/59 уже в `content-factory-ui`, `21st-ui-catalog`, `xyflow-agent-mesh`, `content-pipeline-agents`, `frontend.mdc`, `ai-bridge`, `tester`, `client-scenarios` S9–S11, `client-review/regression-guards.md`, `gap-playbook`.

## Аудит слоёв

| Слой | Вердикт |
|------|---------|
| Роли registry + trainer/architect/frontend/motion/ai-bridge/tester/client | OK |
| MCP playwright / chrome-devtools / 21st | OK, бесплатный путь |
| data-safety | OK — не wipe, не publish в обход HITL |
| Env IG | не блокер (mock/live как есть) |
| Overlap | `VerticalPostCarousel` (C-58 header) ≠ RazborModal (C-59); shell сайдбара (C-57) отдельно. Всё равно **последовательно**. |

## Рекомендуемый chain

```
Архитектор → Frontend → Motion → AI Bridge → Тестировщик → Фиксер → Деплоер → Клиент
```

Path lock:

1. **Архитектор** — spec + `chain.md`: MenuVertical files; mesh view-only supersedes C-08; last-known `headerCount`; Razbor ветка `carousel-engine` vs others; publisher не LLM; persist datetime; schedule tree = модули Студии. Не трогать prod publish.
2. **Frontend** — C-57 (`ModuleSelectorGrid`, `components/ui/menu-vertical.tsx`, `SidebarNavigation`) → C-58 (`MeshPipelineSwitcher` top, `AgentMeshCanvas`/`CanvasTopBar`, `VerticalPostCarousel` header) → C-59 (`RazborModal` + 21st datetime + schedule file-tree + audit composers).
3. **Motion** — hover-стрелка MenuVertical; file-tree enter; datetime micro-motion; mesh PulseEdge без drag.
4. **AI Bridge** — Designer packs/prompts только `carousel-engine`; slide reduce/replace; Publisher pane без chat-prompt.
5. **Тестировщик** — guards C-57/58/59 + S9–S11; RBAC Холст OWNER; C-51 non-carousel без Designer.

## Вердикт

Команда готова к волне: **да**
