# Architect spec — C-127 (Analytics menu + RL Trainer HITL)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> **Path lock #5a** — до C-128; не parallel с Retention на тех же files в другом проходе.

## Goal

`/analytics`: (1) меню модулей как Studio Launchpad → (2) dashboard выбранного модуля; RL feed = предложения Тренера с HITL **«Согласовано»**.

## Decision locks

### Menu like Studio

| Lock | Decision |
|------|----------|
| **D1 Flow** | Два уровня: **Menu** (плитки / MultiButton каналов = те же moduleId что Studio Launchpad) → клик → **Dashboard** этого `moduleId` (Scout/Outliers/Retention/RL/Telemetry scoped). |
| **D2 Chrome** | Title «Самообучающаяся диагностика»; RU; без AI eyebrow cycle. Кнопка «назад к меню» / breadcrumb. |
| **D3 Files** | `AnalyticsShell.tsx`, `AnalyticsPageClient.tsx`, optional `AnalyticsModuleMenu.tsx` (new). Не ломать UX-7 header (Синхронизация, Scout topic). |

### RL = Trainer + HITL

| Lock | Decision |
|------|----------|
| **D4 Author** | UI author proposals = **Тренер (пайплайн)**, не Scout. Copy: «Предложение Тренера». |
| **D5 HITL** | На каждом pending proposal: кнопки **«Согласовано»** + «Отклонить». **Без** «Согласовано» — **не** apply к skills/rules. |
| **D6 Wire** | Local mock OK: `status: pending → approved \| rejected`; approved → mock apply log / toast; не писать секреты. Optional Backend route later. |
| **D7 Types** | Расширить / заменить `AgentHeuristicLog` → `RlProposal` (или alias): `author: "trainer"`, `status: "pending" \| "approved" \| "rejected"`, RU fields. Файл `types/analytics.ts` + `RlFeed.tsx` + mock `lib/analytics/self-learning-mock.ts`. |
| **D8 Ban** | Auto-apply; Scout as author; silent overwrite prod prompts. |

## In scope

- Analytics module menu → per-module dashboard
- `RlFeed` HITL «Согласовано»
- Types + mock data
- Optional Backend stub (не блокирует FE mock)

## Out of scope

- Retention %@15s fraction → **C-128** (следующий шаг, те же analytics paths)
- Live Trainer HF/GitHub search
- Mesh dual-lane (C-125)

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| UI + types + mock | **Frontend** | `content-factory-analytics`, `content-factory-ui` |
| RL approve API | **Backend** | optional; mock first |
| AI Bridge | optional | Trainer proposal text later |

## Acceptance (язык Клиента) — S34

1. `/analytics` сначала меню модулей (как Studio), затем метрики выбранного модуля.
2. RL карточки от **Тренера**; без «Согласовано» apply не происходит.
3. После «Согласовано» — видимый approved state (mock OK).
4. Playwright @1440 клики, не API-only.

## Risks

- Overlap с C-128 на `AnalyticsShell` / `RetentionChart` — делать **последовательно** в одном FE analytics pass или C-127 затем C-128 без parallel.
- Не смешивать Разборщик summary anomalies с Trainer RL author.

## Mid-flight escalation

Стоп → Архитектор → правка menu vs MultiButton pattern.
