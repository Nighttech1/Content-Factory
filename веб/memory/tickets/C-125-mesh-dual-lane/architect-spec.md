# Architect spec — C-125 (mesh dual-lane)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> **Тот же mesh path что C-124** — один Frontend проход.

## Goal

На каждом content-type pipeline: две зоны (выпуск + обучение), пунктир от Тренера ко всем агентам выпуска, роли Scout≠Trainer, barbell на Тренере.

## Decision locks

### Dual-lane layout

| Lock | Decision |
|------|----------|
| **D1 Lane A (выпуск)** | Верхняя (или передняя) зона: блок **«Пользователь»** (видимый текст/поле запроса, mock OK) → ветка по типу (D3) → Designer / Publisher / … Сплошные рёбра + concrete handoff labels (C-107). |
| **D2 Lane B (обучение)** | Отдельная линия: **Scout → Аналитик → Тренер (пайплайн)**. Сплошные между собой. От **Тренера** — **пунктирные** (`strokeDasharray`) стрелки **ко всем** агентам зоны A (включая User? **нет** — только release agents: Разборщик/Сценарист/Designer/Publisher и т.д.). |
| **D3 Lane A branch** | Флаг в seed `laneAMode`: |
| | • `"user-script"` — User → Сценарист/Copywriter → … (default для pure generate: heygen, cartoon, clips, site-articles, tg-articles, aesthetic, info-video, custom-reels) |
| | • `"user-razbor-script"` — User → **Разборщик** → Сценарист → … (для типов с Razbor cascade: минимум `carousel-engine`; другие с Razbor CTA — тот же mode) |
| **D4 Gaps** | Y-separation lanes ≥ node height + padding; X-gaps читаемы @1440; **0 overlap**. |
| **D5 Density** | Линии плотные/читаемые; labels не клипаются нодами (C-124). |

### Roles / panel / art

| Lock | Decision |
|------|----------|
| **D6 Scout panel** | `AgentPropertiesPanel` для Scout = **собранная info** (источники, отфильтрованные посты, summary сбора). **Не** skill patches / «улучшения». |
| **D7 Trainer panel** | Тренер = **предложения / вносимые изменения** skills·rules·plugins (+ ссылка на HITL «Согласовано» semantics — apply wire в Analytics C-127). |
| **D8 Barbell** | Avatar Тренера: **значок штанги (barbell) bottom-right** на логотипе (`AgentProfessionAvatar` / `AgentNode`). |
| **D9 Naming** | Разборщик ≠ Аналитик ≠ Тренер ≠ Scout (C-105). Cursor-Тренер ≠ продуктовый Тренер. |

## In scope

Shared paths с C-124 (один FE pass):

- `lib/mesh-seed.ts` — dual-lane positions, User node, dashed edges Trainer→A, `laneAMode`
- `components/mesh/AgentMeshCanvas.tsx` — render fixed dual-lane
- `components/mesh/edges/PulseEdge.tsx` — solid vs dashed variant
- `components/mesh/nodes/AgentNode.tsx` + `AgentProfessionAvatar.tsx` — barbell
- `components/mesh/AgentPropertiesPanel.tsx` — Scout info vs Trainer proposals

## Out of scope

- Analytics RL HITL UI (C-127) — только семантика панели Тренера
- Free canvas chrome (закрыто C-124)
- Live HF/GitHub Trainer search (mock proposals OK)

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Seed + panel + nodes | **Frontend** | `xyflow-agent-mesh`, `content-pipeline-agents` |
| Dashed edges + barbell motion | **Motion** | после FE |
| Backend / AI Bridge | optional later | mock OK |

## Acceptance (язык Клиента) — S33

1. Виден блок **Пользователь** с текстом запроса.
2. Lane B: Scout→Аналитик→Тренер; **пунктир** от Тренера ко всем release agents.
3. У Тренера barbell badge; клик Scout ≠ список патчей; клик Тренер = proposals.
4. Нет overlap; не free playground (C-124). Playwright клики, не screenshot-only.

## Risks

- Слишком много dashed edges на узких экранах — приоритет 1440 desktop; mobile stack later.
- Не вернуть Scout «improvements» copy из C-90.

## Mid-flight escalation

Стоп → Архитектор → правка `laneAMode` table / edge list.
