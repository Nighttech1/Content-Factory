# Trainer grade — 2026-10-14 — razbor-live-boards (S48)

## План хода

- Запрос: волна UI+AI — Директор nav `/marketing`; preload slides; feed plaque/metrics scale; expensive L/R motion; fix clipped «Разбор»; Razbor/Create LIVE Haiku + Boards upload + models; carousel UI → **все** studio modules.
- Режим: UI + AI Bridge + Motion (+ Backend wire followers/models/Boards upload). **НЕ prod.**
- `ticket_limit: full-queue` — пользователь явно: all modules / вся очередь OK.
- Роли по chain: Архитектор → Frontend → Motion → Backend → AI Bridge → Тестировщик → Фиксер → Деплоер → Клиент.

## Грейд: B → **A** (после апгрейда skills этим ходом)

До шага 0: **C** — не было канона S48 (Директор IA, preload, 1.5×/2×, horizontal motion, LIVE Razbor, Boards, module parity).  
После дописки skills/rules: **A** — команда готова к Архитектору / full-queue.

## Пробелы (закрыты в skills; код — волна)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Marketing entry = Studio button, не left nav «Директор» | Frontend | skill/ui | P0 |
| 2 | Нет preload all slides → swipe hang | Frontend | skill/ui | P0 |
| 3 | Metrics/plaque sizes + followers missing | Frontend (+ BE map) | skill/ui | P0 |
| 4 | Slide motion = crossfade only / no expensive L/R | Motion | skill/motion | P1 |
| 5 | «Разбор» clipped bottom cards | Frontend | skill/ui | P0 |
| 6 | Razbor mock; no Boards; chrome (title/labels/handoff/preview scale) | FE + AI Bridge | skill/ai | P0 |
| 7 | Models Razbor/Scriptwriter/Designer not locked on Razbor path | AI Bridge | skill/ai | P0 |
| 8 | Other modules without carousel UI parity | Frontend | skill/ui | P0 |
| 9 | No Client S48 HARD | Client | skill/scenarios | P0 |

MCP: Playwright + chrome-devtools в `.cursor/mcp.json` — OK. Платный MCP не предлагать. Prod — запрещён.

## Что добавлено этим ходом

- `content-factory-ui` — S48: Директор→`/marketing`; plaque 1.5× + followers; metrics 2×; preload; Razbor/Create chrome; Boards; module parity; Anti-patterns.
- `web-motion-engine` — S48 expensive horizontal L/R (+ preload gate).
- `client-scenarios` — **S48 HARD** A–E + Hard REJECT.
- `client.mdc` — Hard REJECT **#14 S48**.
- `ai-bridge` + **`razbor-live-prompt.md`** — LIVE Haiku hook/mid/CTA + virality + trainer tasks → Scriptwriter; models.
- `content-pipeline-agents` — S48 LIVE cascade + Boards + model table.
- `gap-playbook` + `plugins/trainer/PLUGINS.md` — S48 rows.

## Recommended tickets (full-queue, P0 first)

| ID (proposed) | Title | Priority |
|---------------|-------|----------|
| **C-director-nav-marketing** | Left nav «Директор» → `/marketing`; remove Studio top-right Marketing | P0 |
| **C-feed-plaque-metrics-s48** | Plaque 1.5× + followers `Nк`; engagement 2× + all 5 metrics | P0 |
| **C-razbor-cta-clip** | Fix clipped «Разбор» on bottom cards (all modules) | P0 |
| **C-carousel-preload-slides** | Preload all slides on Razbor/Create open — no swipe hang | P0 |
| **C-slide-motion-horizontal** | Expensive L/R horizontal slide change (Motion) | P1 |
| **C-razbor-live-haiku-boards** | LIVE Haiku after «Начать разбор»; Competitors\|Boards upload; insights handoff; preview 1.5×; no post title; white labels; handoff in input chrome; models Haiku / image-2 | P0 |
| **C-module-parity-carousel-ui** | Apply carousel feed+Razbor UI patterns to **all** studio modules | P0 |

## Proposed chain (full-queue, no ≤3 split)

```
Тренер ✅ (этот файл)
→ Архитектор (spec + chain.md locks: routes /marketing, followers map, Boards upload API, preload, motion, models, module list)
→ Frontend (nav, feed chrome, Razbor/Create UI, Boards, module parity, preload)
→ Motion (S48 horizontal L/R; reduced-motion)
→ Backend (followers field if missing; Boards upload persist; feed metrics completeness)
→ AI Bridge (razbor-live prompt wire; Haiku path; handoff insights; model defaults on Razbor)
→ Тестировщик (guards S48.A–E + unit where needed)
→ Фиксер
→ Деплоер (localhost only — НЕ prod)
→ Клиент (Playwright @1440 S48 HARD)
```

Не параллелить overlapping: Razbor modal chrome + AI live path после Architect lock; Motion после/с preload FE.

## Вердикт

Команда готова к волне: **да**  
Лимит тикетов: **full-queue**  
Prod: **нет**
