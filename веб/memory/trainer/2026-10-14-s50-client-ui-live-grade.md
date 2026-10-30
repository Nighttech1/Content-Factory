# Trainer grade — 2026-10-14 — s50-client-ui-live (S50)

## План хода

- Запрос: шаг 0 волны **S50** — CRITICAL усилить Client visual pickiness (user angry: Client принимал UI slop — thick bottom clipping carousels, leftover DESIGN.md crumbs, wrong aspect, mock competitors). Также: Settings Design **3:5** brandbook-only + toolbar one row; carousel chrome clean; Create = Razbor UI start Scriptwriter; live competitors + harden Scriptwriter/Designer/Razbor prompts.
- Режим: UI + AI Bridge prompts + Backend live feed (если mock). **НЕ prod.**
- `ticket_limit: default≤3` — явного «до конца / full queue» нет; 5+ пунктов упакованы в **3** тикета.
- Роли по chain: Архитектор → Frontend → AI Bridge → Backend (live if needed) → Тестировщик → Фиксер → Деплоер → Клиент (Playwright S50 HARD).

## Грейд: C → **A** (после апгрейда skills этим ходом)

До шага 0: **C** — Client Hard REJECT останавливался на S49; нет gate на thick bottom / MD crumbs / 3:5 / Boards dropdown / Create parity regress / prompt smoke; риск снова «принять slop».  
После дописки skills/rules: **A** — команда готова к Архитектору / ≤3 tickets.

## Пробелы (закрыты в skills; код — волна)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Client accepts thick bottom clipping / MD crumbs / wrong aspect | Client | rule/scenarios | P0 |
| 2 | Design ≠ horizontal 3:5; MD under cards; slots counter; fat padding; context menu; colors helper | Frontend | skill/ui | P0 |
| 3 | Thick bottom bar; «(4:5)» title; orange dots; Boards not dropdown; no sort+filter | Frontend | skill/ui | P0 |
| 4 | Create ≠ Razbor; not start Scriptwriter; preview ≠1.5× | Frontend | skill/handoff | P0 |
| 5 | Mock competitors / weak Scriptwriter·Designer·Razbor prompts | AI Bridge + Backend + release-team | skill/ai/be | P0 |

MCP: Playwright + chrome-devtools — OK. Платный MCP не предлагать. Prod — запрещён.

## Who strengthened (обязательный отчёт)

### Engineering team (Cursor / Vernatun roles)

| Роль | Что усилено |
|------|-------------|
| **Client** | `client.mdc` Hard REJECT **#16 S50 CRITICAL**; `client-scenarios` **S50 HARD** A–D + Hard REJECT bullets |
| **Frontend** | `content-factory-ui` S50 feed/Design/Create; `frontend.mdc` §23–25 |
| **Architect** | `architect` § S50 ticket pack ≤3 + chain |
| **AI Bridge** | `ai-bridge` S50 prompt bar; **`s50-prompt-hardening.md`**; `razbor-live-prompt.md` S50 harden |
| **Backend** | `backend` S50 live competitors (+ Boards CRUD note) |
| **Tester** | `tester` S50 guards checklist |
| **Motion** | не обязателен; Create/Razbor preview scale restore — FE layout; jank → `web-motion-engine` по chain |
| **Trainer** | `gap-playbook` S50 rows; `plugins/trainer/s50-client-ui-live.md` + PLUGINS |
| **Handoff skill** | `carousel-studio-handoff` S50 Create = Razbor |
| **Pipeline** | `content-pipeline-agents` S50 prompt bar + Designer brandbook 3:5 |
| **Designer worker** | `workers/designer-carousel` S50 3:5 + prompt bar link |

### Release-team (mesh / pipeline agents)

| Агент выпуска | Что усилено |
|---------------|-------------|
| **Разборщик** | S50: live Haiku only; **concrete numbered trainer tasks** (не «улучши»); `razbor-live-prompt` + s50-prompt-hardening |
| **Сценарист** | S50 bar: captivating hook; swipe meta; CTA 1–4; must-consume Razbor insights; Create starts here |
| **Дизайнер** | S50: brandbook **3:5** tokens applied; panorama→slice; specific visual_prompt; no purple-slop / black success |
| **Scout / Публицист / Тренер пайплайна** | без нового UI; task sources без User brief (S49) остаются; generation smoke не путать с mock |

## Что добавлено этим ходом

- `client.mdc` — Hard REJECT **#16** (thick bottom, MD crumbs, 3:5, toolbar, live/mock, Create parity).
- `client-scenarios` — **S50 HARD** A–D + Mesh Hard REJECT bullets.
- `content-factory-ui` — S50 bottom/Boards/sort-filter/Design 3:5/Create parity + Anti-patterns.
- `frontend.mdc` — §23–25.
- `ai-bridge` + `s50-prompt-hardening.md` + `razbor-live-prompt` S50.
- `carousel-studio-handoff` / `content-pipeline-agents` / `backend` / `tester` / `architect` / `designer-carousel`.
- `gap-playbook` + `plugins/trainer/PLUGINS.md` + `s50-client-ui-live.md`.
- Этот файл: `memory/trainer/2026-10-14-s50-client-ui-live-grade.md`.

## Recommended tickets (`ticket_limit: default≤3`)

| ID (proposed) | Title | Priority |
|---------------|-------|----------|
| **C-s50-feed-chrome** | Minimal bottom bar (no clip); no «(4:5)»; no orange dots; Boards dropdown+create/rename; no «1» on Доски; sort+filter left of search both columns; live competitors not mock | P0 |
| **C-s50-settings-design** | Design cards horizontal **3:5** only; no MD crumbs; no slots counter; toolbar one row (дизайн.md icon / референс / новый дизайн+icon / preview icon-only); side padding ~75% smaller; no card context menu; no colors helper | P0 |
| **C-s50-create-prompts** | Create UI = Razbor except start Scriptwriter; source toggle higher; preview ≈1.5×; harden Scriptwriter/Designer/Razbor prompts; smoke live generation pipelines | P0 |

## Proposed chain (≤3, no full-queue)

```
Тренер ✅ (этот файл)
→ Архитектор (spec + chain.md locks: bottom chrome height, 3:5 cards, Boards API if needed, Create start agent, prompt patch list)
→ Frontend (feed chrome + Settings Design + Create parity)
→ AI Bridge (s50-prompt-hardening → Scriptwriter/Designer/Razbor systems)
→ Backend (live competitors if mock; Boards CRUD if dropdown needs API)
→ Тестировщик (guards S50.A–D)
→ Фиксер
→ Деплоер (localhost only — НЕ prod)
→ Клиент (Playwright @1440 S50 HARD — pickiness gate #16)
```

Не параллелить overlapping: Design Settings path vs Create Design tokens; live feed Backend до Client S50.D.

## Вердикт

Команда готова к волне: **да**  
Лимит тикетов: **default≤3**  
Prod: **нет**  
Грейд: **A**
