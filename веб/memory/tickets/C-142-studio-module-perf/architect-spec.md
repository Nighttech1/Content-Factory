# Architect spec — C-142 (studio module perf)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> Path lock **2** — after C-141+C-140. Do not edit mesh release-team files here.

## Goal

Ускорить cold open `studio/[moduleId]`: мгновенный skeleton/fixtures, live Apify в фоне, меньше JS на first paint.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 First paint** | Route shell + module title + fixture/skeleton cards render **without** awaiting Apify/network. |
| **D2 Live fetch** | Apify / live feed starts after paint (or parallel non-blocking); UI upgrades in place; keep «Онлайн» / live usernames+metrics when live arrives. |
| **D3 Code split** | `next/dynamic` (or equivalent) for heavy: Razbor, CapCut editor, mesh-only chunks, large modals — **not** required for first viewport of module feed. |
| **D4 Measure** | Document cold navigation ms **before** and **after** in ticket `status.md` + Tester `guards.md`. Tool: chrome-devtools Performance or Playwright timing. |
| **D5 No fake “fixed”** | Do not claim win without numbers. |
| **D6 Isolation** | Paths under `app/studio/[moduleId]/page.tsx`, workspace feed components, Apify client callers — **not** `components/mesh/**` in this ticket. |

## In scope

- `app/studio/[moduleId]/page.tsx` and workspace shells that gate on Apify
- Dynamic import boundaries for heavy studio widgets
- Fixture/skeleton path already used for soft-fail — promote to default first paint
- Status/guards timing notes

## Out of scope

- Mesh pan/brief (C-140/C-141)
- Settings (C-143/C-144)
- Changing Apify credentials / deleting Redis/Postgres data
- Prod deploy

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| UI split + skeleton-first | **Frontend** | `web-perf-motion`, `content-factory-ui` |
| API only if route handler blocks | **Backend** | rare — only if server component awaits Apify |
| QA | Tester | ms in guards |

## Acceptance (язык Клиента)

1. Клик модуля → title/UI видны быстро; не «пустой экран» пока Apify.
2. Затем карточки обновляются live (или остаётся fixture с понятным soft state).
3. В guards есть before/after ms.
4. Mesh страница не регрессит от этого тикета.

## Risks

- Hydration mismatch if fixture vs live markup differs wildly — keep same card shell.
- Over-splitting causing waterfall — measure.
- Do not parallel with Settings FE on shared studio layout if same files — path lock already sequential.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение.
