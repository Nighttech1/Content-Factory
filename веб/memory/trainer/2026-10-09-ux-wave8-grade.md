# Trainer grade — 2026-10-09-ux-wave8

## План хода

- Запрос: **UX-8** (full backlog) — Mesh naming + Scout→Analyst→Trainer chain + edge handoff labels; Schedule popup independence/drag + rail resize; Settings Scout icons + per-type copywriters + MD agent rules.
- `ticket_limit:` **full-queue** (пользователь явно: весь бэклог UX-8; без нарезки по 3).
- Режим: UI / Mesh / Schedule / Settings — усиление skills до кода.
- Роли по chain: **Тренер → Архитектор → Frontend (+ 21st) → Motion → Backend (agent ids / MD persist) → AI Bridge (опц. Trainer skill discovery) → Тестировщик → Фиксер → Деплоер → Клиент**.
- Контекст: UX-7 (C-97…C-104) залочен; UX-8 = gap-волна после «не то» по ролям/handoff/schedule/settings.
- MCP: Playwright / chrome-devtools — бесплатные; платный MCP не предлагать. HF discovery — через уже доступный Hugging Face MCP / WebSearch, без нового платного scrape.
- Тренер **не** пишет app UI.

## Грейд: C → A

**До усиления:** **C** — в skills не было: (1) жёсткого канона Разборщик≠Аналитик≠Тренер пайплайна + Scout→Analyst→Trainer на каждом chain; (2) concrete edge handoff labels (C-99 оставил «pulse only»); (3) schedule popup independent/drag + rail resize; (4) Scout MultiButton platform icons + per-type copywriter + MD upload UI.

**После апгрейда skills (этот ход):** **A** — команда готова к full-queue UX-8.

### По ролям

| Роль / skill | Грейд | Комментарий |
|--------------|-------|-------------|
| Pipeline (`content-pipeline-agents`) | A | C-105/106/112/113 канон ролей + chain + MD |
| Mesh (`xyflow-agent-mesh`) | A | C-105…107 + MD panel; edges supersede pulse-only |
| Frontend (`content-factory-ui`) | A | C-108…113 schedule + settings |
| Motion (`web-motion-engine`) | A | popup drag / rail resize / edge label |
| Architect | A | locks C-105…C-113 |
| Backend | B+ | agent id per type + MD persist — в spec |
| AI Bridge | B | Trainer discovery mock OK; live HF/GitHub — опц. |
| Client scenarios | B | S40+ допишет Тестировщик (не блокер) |
| MCP / registry | A | без дыр; Cursor-Тренер ≠ pipeline Trainer |

## Пробелы (код — закрывает волна, не Тренер)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | UI «Аналитик» там, где нужен «Разборщик» | FE | skill→code | P0 |
| 2 | Нет Scout→Аналитик→Тренер на mesh pipelines | FE (+ AI Bridge) | skill→code | P0 |
| 3 | Edges без concrete handoff / ещё «json» | FE + Motion | skill→code | P0 |
| 4 | Popup едет при expand папок rail | FE | skill→code | P0 |
| 5 | Popup не draggable | FE + Motion | skill→code | P1 |
| 6 | Rail «Модули студии» не resizable | FE | skill→code | P1 |
| 7 | Scout MultiButton: все типы + generic icons | FE | skill→code | P0 |
| 8 | Один shared copywriter | FE + BE | skill→code | P0 |
| 9 | Agent prompt = code textarea, нет MD/filename/skills list | FE (+ BE) | skill→code | P0 |

Data-safety: не трогать Postgres/Redis/медиа; секреты не в MD агентов / memory; HITL publish не обходить. Продуктовый Тренер пайплайна ≠ Cursor-роль Тренер.

## Что добавлено этим ходом

- `content-pipeline-agents` — UX-8: Разборщик≠Аналитик≠Тренер; Scout→Analyst→Trainer; Razbor labels; per-type copywriter; MD upload contract.
- `xyflow-agent-mesh` — C-105…107 chain/naming/edges; AgentNode accessories; MD panel C-113; checklist.
- `content-factory-ui` — C-108…110 schedule; C-111 Scout icons; C-112/113 Agents; Razbor «Разборщик»; Do-not UX-8.
- `web-motion-engine` — popup drag / rail resize / edge label fade.
- `architect` — locks C-105…C-113 + path lock full-queue.
- `gap-playbook` — 9 строк симптомов UX-8.
- `plugins/trainer/PLUGINS.md` — UX-8 pointers.
- Этот артефакт.

## Вердикт

Команда готова к волне: **да**  
`ticket_limit: full-queue`

### Proposed tickets C-105…C-113

| ID | P | Scope |
|----|---|-------|
| **C-105** | P0 | Naming: везде Разборщик≠Аналитик≠Тренер пайплайна |
| **C-106** | P0 | Mesh/pipelines: Scout → Аналитик → Тренер → release |
| **C-107** | P0 | Edges: стрелки + concrete handoff labels (не json) |
| **C-108** | P0 | Schedule: popup position независима от expand папок |
| **C-109** | P1 | Schedule: popup draggable |
| **C-110** | P1 | Schedule: rail «Модули студии» resizable |
| **C-111** | P0 | Settings Scout: subset MultiButton + platform icons |
| **C-112** | P0 | Per content-type свой copywriter |
| **C-113** | P0 | Agent rules: MD upload + filename + skills/plugins/MCP list |

### Recommended chain (full-queue, один проход)

`Архитектор (spec + chain.md, locks C-105…C-113) → Frontend (+ 21st-ui-catalog, content-factory-ui, xyflow-agent-mesh, content-pipeline-agents) → Motion (popup drag, rail resize, edge labels) → Backend (per-type agent ids + MD persist) → AI Bridge (опц. Trainer discovery mock) → Тестировщик (guards S40+) → Фиксер → Деплоер localhost → Клиент`

Path lock (без overlap):

1. **C-105 + C-106 + C-107** — mesh (один path)
2. **C-108 + C-109 + C-110** — schedule shell
3. **C-111 + C-112 + C-113** — Settings (+ sync AgentPropertiesPanel)

Не резать UX-8a/8b. После guards всей девятки — приёмка Клиента.
