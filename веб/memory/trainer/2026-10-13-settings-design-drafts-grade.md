# Trainer grade — 2026-10-13 — settings-design-drafts

`ticket_limit: default≤3`

## План хода

- Запрос: (1) Create карусели **всегда** в Черновиках; (2) Settings → Design = Embla carousel ≤10 DESIGN.md + preview close + Разборщик «Добавить новый дизайн» (image→MD+HTML→current); (3) Team «Задание» empty, chat **не** читает brief (C-155 verify); (4) mystery bottom-left «N» → identify + disable. Усилить команду **особенно Designer**.
- Режим: усиление команды (skills/rules/workers) — **без** app/components prod-кода Тренером
- Роли по chain: Архитектор → Frontend (+ 21st Embla) → AI Bridge (Razbor parse + Designer active MD) → Backend (если upload/parse API) → Тестировщик → Фиксер → Деплоер → Клиент **S43**

## Грейд: B

До апгрейда: **C** — не было канона Embla DESIGN library / drafts-always HARD / preview Close fail / Team empty «Задание» / Dev Indicator «N» / S43.  
После апгрейда skills: **B** — команда готова к волне; продукт-баги на Архитекторе/FE.

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Create → Черновики пусто / пользователь не находит | Frontend (+ Backend persist if API) | skill→product | **P0** |
| 2 | Settings Design без Embla library / activeId→Designer; preview Close; Разборщик upload | Frontend + AI Bridge | skill+agent | **P0/P1** |
| 3 | Team baseline brief + glue в chat; bottom-left «N» load | Frontend (+ Deployer next.config) | skill→product | P1 |
| 4 | Клиент без S43 | Клиент | scenario | P1 (gate) |

## Что добавлено этим ходом

- **UPD** `.cursor/skills/carousel-json-contract/SKILL.md` — active DESIGN.md library; drafts-always; related tickets
- **UPD** `workers/designer-carousel/SKILL.md` — activeDesignId HARD; Razbor add-design; drafts output
- **UPD** `.cursor/skills/content-factory-ui/SKILL.md` — Embla Design block; C-drafts-always; Dev «N» ban; anti-patterns
- **UPD** `.cursor/skills/carousel-studio-handoff/SKILL.md` — Publication drafts HARD; C-155; active MD
- **UPD** `.cursor/skills/content-pipeline-agents/SKILL.md` — Team «Задание» empty; Разборщик Settings CTA; drafts HARD
- **UPD** `.cursor/skills/xyflow-agent-mesh/SKILL.md` — label «Задание» empty default; Designer chip = active slot
- **UPD** `.cursor/skills/21st-ui-catalog/SKILL.md` — Embla `carousel.tsx` + image upload queries
- **UPD** `.cursor/skills/client-scenarios/SKILL.md` — **S43 HARD**
- **UPD** `.cursor/skills/trainer/gap-playbook.md` — 6 новых строк симптомов
- **UPD** `.cursor/skills/ai-bridge/SKILL.md` — no Team brief in user; Designer active MD; Razbor add-design
- **UPD** `.cursor/registry/agents.md` — Settings Design + S43 pointers
- **UPD** `plugins/trainer/PLUGINS.md` — S43 / new tickets

## Proposed tickets (≤3, bundled UX)

| Id | P | Title | Bundle |
|----|---|--------|--------|
| **C-drafts-always** | **P0** | Create carousel → всегда карточка в Ours→Черновики (persist C-156); S43.1 | alone |
| **C-settings-design-md-carousel** | **P0/P1** | Embla ≤10 DESIGN.md + chip + activeId→Designer; preview **Close**; CTA «Добавить новый дизайн» image→MD+HTML | Design UX pack |
| **C-team-brief-n-indicator** | P1 | Team label «Задание» empty (no baseline); C-155 verify no brief glue; identify+disable bottom-left «N» (likely Next `devIndicators`) | Team + perf chrome |

Не резать на 4-й тикет: Razbor upload + preview close живут внутри **C-settings-design-md-carousel**.

## Proposed chain

```
Тренер (done) → Архитектор (spec + chain.md: 3 tickets; lock draft-on-publish vs draft-on-draw; Embla persist keys; Razbor parse API; next.config devIndicators)
  → Frontend (P0 drafts wire first; then Settings Embla + Close; Team empty «Задание»; remove/disable «N»)
  → AI Bridge (Designer active DESIGN.md; Разборщик image→MD+HTML path; C-155 payload audit)
  → Backend (если нужен upload/parse/store design library — по chain Архитектора)
  → Тестировщик (guards + S43 asserts)
  → Фиксер → Деплоер localhost (devIndicators off) → Клиент (S43 Playwright @1440)
```

Не параллелить overlapping CreateCarouselModal drafts store ↔ Settings design persist keys без Architect lock.

## Note — mystery «N»

Симптом: bottom-left **«N»**, тяжёлый load. Канон Тренера: с высокой вероятностью **Next.js Dev Indicator** (не product CTA). Не путать с chip **N=** slide count внутри Create. Fix: `devIndicators: false` / не монтировать FAB; Client S43 assert absence.

## Вердикт

Команда готова к волне: **да** (грейд B; P0 drafts первым в chain)
