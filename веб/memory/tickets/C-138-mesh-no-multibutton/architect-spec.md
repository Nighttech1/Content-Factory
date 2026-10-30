# Architect spec — C-138 (mesh no MultiButton)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> Same mesh path as **C-139** — допускается один Frontend pass.  
> Эталон chrome: `code_artifact.html` header (без MultiButton; refresh-кнопка эталона **не** канон продукта — user lock: title+subtitle+Copy TZ only).

## Goal

Убрать весь pipeline / content-type switcher chrome со страниц «Команда выпуска». Top bar = заголовок + подзаголовок + «Скопировать ТЗ для Cursor».

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 Surface** | Все mounts «Команда выпуска»: `/studio/[moduleId]/mesh`, `ReleaseTeamFlowchart` (или successor), `CanvasTopBar` на mesh. |
| **D2 Delete switcher** | **REMOVE** `MeshPipelineSwitcher` usage; **DELETE** `components/mesh/MeshPipelineSwitcher.tsx` if orphaned. |
| **D3 No MultiButton** | Запрет `MultiButton` / CompactMultiButton / tab pills content-type на mesh release-team. |
| **D4 Top bar** | Only: **title** («Команда выпуска») + **subtitle** (короткое описание пайплайна) + **«Скопировать ТЗ для Cursor»**. Нет metrics strip, нет refresh-required, нет pipeline icons. |
| **D5 Copy TZ** | Кнопка копирует prompt/spec text в clipboard + toast (полная реализация текста — C-139; C-138 обязан оставить/ввести кнопку в top bar без switcher). |
| **D6 Type switch** | Смена типа = навигация в другой module workspace, не UI на схеме. |
| **D7 CanvasTopBar** | Либо упростить props (`extra` без switcher), либо заменить тонким header в static shell C-139 — итог: нет Multibutton. |

## In scope — Frontend

- `components/mesh/v2/ReleaseTeamFlowchart.tsx` (or C-139 static replacement) — unmount switcher
- `components/mesh/CanvasTopBar.tsx` — strip MultiButton/`extra` pipeline chrome
- `components/mesh/MeshPipelineSwitcher.tsx` — delete if unused
- Grep: any other import of MeshPipelineSwitcher / MultiButton on mesh pages → remove
- Page `app/studio/[moduleId]/mesh/page.tsx` — only if it wires switcher

## Out of scope

- Static flowchart rewrite (C-139) — same pass OK, but acceptance chrome = this ticket
- Backend / Prisma
- Settings Agents MultiButton (C-87) — **не трогать** Settings
- Prod/VPS

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Remove chrome + orphan delete | **Frontend** | skill `content-factory-ui` + `xyflow-agent-mesh` C-138 |
| Motion | optional polish on Copy button | after FE; primary Motion = C-139 |
| QA | Tester → Client **S37** step 1 (no Multibutton) | |

## Acceptance (язык Клиента)

1. OWNER → «Команда выпуска» @1440.
2. Snapshot top bar: title + subtitle + «Скопировать ТЗ для Cursor»; **нет** MultiButton / MeshPipelineSwitcher / channel filter icons.
3. `MeshPipelineSwitcher` отсутствует в дереве / orphan file deleted.
4. Presence of Multibutton on this page → **НЕ ПРИНЯТО** (client Hard REJECT §8).

## Risks

- Smoke/guards still expect MeshPipelineSwitcher (C-83) — update guards under C-138/C-139 wave, not resurrect chrome.
- Settings or other surfaces import MultiButton — leave those; only mesh release-team.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение.
