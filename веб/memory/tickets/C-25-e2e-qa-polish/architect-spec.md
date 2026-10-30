# Architect spec — C-25

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Закрыть Sprint 7 **7.3** как E2E/QA полировку: (1) армянские глифы на Inspector без tofu/clipping, (2) роль **ADMIN** не открывает `/admin/mesh` (только **OWNER**), (3) регрессия **S1** — Generate Draft / drawer после C-23. Основной исполнитель — **Tester**; Frontend только при доказанном gap. Hard REJECT из `client.mdc` остаются зелёными.

## In scope

- Guard: на `/studio/inspect/:id` тексты hook/script с `lang="hy"` / класс с `var(--font-hy)` → computed/`font-family` содержит **Noto Sans Armenian** (или эквивалент уже в `app/layout.tsx`).
- Guard: role `ADMIN` → `/admin/mesh` redirect/deny (сейчас client redirect в `app/admin/mesh/page.tsx`); зафиксировать автоматический smoke (HTTP + session role cookie/header **или** store-role script + assert redirect target `/studio`).
- Regression smoke **S1**: drawer opens on Generate; после C-23 — stream/steps still change (`data-step-state`).
- `guards.md` в папке тикета с воспроизводимыми командами (как Sprint 6: script smoke OK если Playwright MCP недоступен — честный gap + script).

## Out of scope

- Новая визуальная дизайн-система, stagger/skeletons (C-24) — только не регрессировать.
- Реализация SSE с нуля (C-23) — только regression после него.
- Server-side middleware RBAC rewrite, если client redirect уже достаточен для локального session-store; **если** Tester найдёт, что ADMIN всё же видит canvas — тогда Frontend patch в chain (укрепить early return / layout gate), без смены product RBAC model.
- Prisma role model migration, real auth provider.
- Prod/VPS deploy.
- Lighthouse полный аудит (опционально note, не блокер).

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Guards / smoke | **Tester** | primary; Armenian CSS assert + mesh deny + S1 |
| UI gapfix | **Frontend** | **только если** font missing on inspect panels or ADMIN sees mesh UI |
| Motion / Backend | — | не в chain по умолчанию |
| Fixer | Fixer | по красным guards |
| Localhost | Deployer | verify routes 200 / deny |
| Приёмка | Client | 7.3 + Hard REJECT checklist |

## Contracts

### Armenian font

- Source of truth: `--font-hy` from `app/layout.tsx` (Noto Sans Armenian).
- Inspect surfaces: Hook panel, Script editor, karaoke captions — must apply `font-[family-name:var(--font-hy)]` (or equivalent) on hy samples.
- Guard: assert CSS variable or computed font-family string includes `Noto Sans Armenian`; sample unicode Armenian present in DOM (seed/mock OK).

### Mesh RBAC

- Roles: `OWNER` | `ADMIN` (`lib/session-store.ts`).
- `ADMIN` → cannot use Mesh canvas; redirect `/studio` (existing) **or** explicit deny UI — both OK if canvas not interactive.
- `OWNER` → `/admin/mesh` usable.
- Guard must flip role and assert behavior (not screenshot-only).

### S1 regression

- `/studio` → Generate Draft → drawer open + agent steps progress (aligned with C-23 guard: EventSource or at least `data-step-state` change).
- Do not require full Playwright MCP if unavailable — document + script equivalent.

## Files to touch (expected)

| Path | Owner | Action |
|------|-------|--------|
| `memory/tickets/C-25-e2e-qa-polish/guards.md` | Tester | **new** (required) |
| `scripts/*-guards*.mjs` or ticket-local smoke | Tester | optional reusable script |
| `components/inspect/HookAlternatives.tsx`, `ScriptEditor.tsx`, captions | Frontend | **if** font gap |
| `app/admin/mesh/page.tsx` / shell | Frontend | **if** ADMIN leak |
| `app/layout.tsx` | Frontend | **only if** font not loaded (unlikely) |

## Acceptance criteria (язык Клиента)

1. В Inspector армянский текст в хуках/скрипте читается нормально — буквы не «квадратики», не обрезаны.
2. Под ролью **ADMIN** зайти на `/admin/mesh` нельзя (уводит в Studio или показывает отказ); Mesh видит только **OWNER**.
3. Сценарий Generate Draft (S1) по-прежнему открывает drawer и двигает шаги (с учётом SSE из C-23).
4. В `guards.md` три проверки зелёные; без guard тикет не closed.

## Risks

- Session role только client zustand — HTTP-only guard может не видеть role; Tester: script через store/playwright evaluate или documented cookie bridge.
- C-25 до закрытия C-23 → S1+SSE regression преждевременна; **порядок: после C-23** (и желательно после C-24, чтобы не ловить motion flake — но C-25 не зависит жёстко от C-24).
- False green: «font in layout» без применения на inspect node.

## Safety

- Нет wipe DB/Redis/media.
- Не публиковать в соцсети.
- Secrets не в guards/memory.

## Mid-flight escalation

Если нужен настоящий auth middleware / cookie session — стоп → Architect (выходит за 7.3 demo RBAC).
