# Architect spec — C-144 (SettingsShell trim + Scout on Team)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> Path lock **3** first; then **C-143**. Mesh Scout drawer edits only **after** path 1.

## Goal

Убрать из Settings блоки Разведка / Агенты / Rules·LLM; параметры разведки перенести в инспектор Scout на «Команда выпуска».

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 Remove** | From `SettingsShell`: `ScoutSettingsPanel` / «Разведка»; Agents prompts/rules block; LLM aggregator UI (`lib/settings/llm-aggregator` browser form). |
| **D2 Keep** | Design (upload; preview = C-143), Platforms, Schedule-related settings if present, Reels settings as currently required. |
| **D3 Scout home** | Scout sources / niches / frequency / top-N / toggles live in **Team** `AgentInspectorDrawer` when selected agent is Scout — **per pipeline** (per module / scout agent id). |
| **D4 Persist** | Reuse existing scout persist keys if any; migrate Settings-only keys → Team scout store without wiping user data. |
| **D5 Model pick** | LLM model/temp/maxTokens remain on Team drawer tab «Модель» (C-139). Env `AGGREGATOR_*` remains server truth (see C-145). |
| **D6 TOC** | Floating TOC must not keep anchors to removed sections. |
| **D7 Order** | FE Settings trim **before** C-143 preview. Scout-on-Team UI after mesh path 1 stable. |

## In scope

- `components/settings/SettingsShell.tsx`
- `components/settings/ScoutSettingsPanel.tsx` — unmount from Settings; relocate logic into mesh scout inspector or shared lib
- `components/mesh/v2/AgentInspectorDrawer.tsx` — Scout-specific settings panel/tab section
- Copy/subtitle on Settings page (no «промпты агентов, LLM»)

## Out of scope

- Deleting `lib/llm/aggregator.ts` env helper
- Wiring all generateDraft to Polza (audit C-145; wire = follow-up)
- Design preview chrome (C-143)
- Prod

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Settings trim + Scout on Team | **Frontend** | `content-factory-ui`, `xyflow-agent-mesh` Scout-on-Team |
| QA | Tester → Client S39 | Settings без Разведка/Агенты/LLM; Scout params on Team |

## Acceptance (язык Клиента)

1. `/settings`: нет секций Разведка, Агенты, LLM.
2. Есть Дизайн / Площадки / (Schedule|Reels по продукту).
3. Mesh → Scout → в drawer доступны параметры разведки; persist после reload.
4. ADMIN по-прежнему не видит mesh (RBAC unchanged).

## Risks

- Orphan `ScoutSettingsPanel` import — delete or rehome cleanly.
- Users with Settings-only scout localStorage — migrate once.
- Do not parallel C-143 writer until trim lands.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение.
