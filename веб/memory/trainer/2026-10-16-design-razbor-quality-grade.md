# Trainer grade — 2026-10-16 — design-razbor-quality

## План хода

- Запрос: Settings Design STRICT tokens-only (colors + type/text-block/small-element; no layout kits / no COVER·BODY·CTA sliced prefs; dedup Coffee Doctrine; toolbar LEFT); no coffee/club theme lock → random Armenian; Razbor draft RIGHT preview + remove «Начать разбор» on existing draft + Create agents + carousel context; competitor «Выбрать» + empty square; draft overwrite; quality audit vs folder «эталон карусели»; budget **9 PNG** (3×3) with images.
- Режим: UI (Settings Design + Razbor modal in scope) + AI Bridge prompts/payload + Backend draft upsert; AppShell/left nav **shell_freeze**.
- Роли по chain: Архитектор → Frontend → AI Bridge → Backend → Тестировщик → Фиксер → Деплоер → Клиент.
- Отвергнутое / supersede: S44 Settings Embla 3×4:5 layout strip as product prefs; S51 «Design toolbar must be top-right» when it collides with Settings nav; «Начать разбор» as gate on **existing draft**; coffee-only system theme; draft spam per iteration.

## Грейд: B

Было **C** (критичные пробелы: S51/S44 противоречили явному запросу; нет draft-edit path; нет theme-rotation / etalon / overwrite в skills).  
После закрытия пробелов в skills/rules/plugins — **B**: команда готова к Архитектору.

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 | Status |
|---|--------|------|------|----------|--------|
| 1 | Settings Design всё ещё layout/sliced kits; caption ≠ agent payload | Frontend + AI Bridge | skill→code | P0 | skill closed; implement in chain |
| 2 | Duplicate Coffee Doctrine cards | Frontend | skill→code | P0 | skill closed |
| 3 | Toolbar collide right Settings nav (S51 top-right) | Frontend | skill→code | P0 | S52 LEFT supersede |
| 4 | Hardcoded coffee/club in prompts / live-gen | AI Bridge | skill→code | P0 | skill closed |
| 5 | Open draft: empty RIGHT / «Начать разбор» blocks chat | Frontend + AI Bridge | skill→code | P0 | skill closed |
| 6 | Нет Выбрать + comparison square | Frontend | skill | P1 | skill closed |
| 7 | Черновики spam vs overwrite | Backend + Frontend | skill→code | P0 | skill closed |
| 8 | Нет etalon folder + quality bar 9 PNG | Deployer + Client | skill | P1 | path canon in skills |
| 9 | Exact upsert key / modal wire | Architect | spec | P1 | **open** — lock in chain.md |

## Что добавлено этим ходом

- `.cursor/skills/content-factory-ui/SKILL.md` — **S52** Design tokens-only + toolbar LEFT + shell_freeze note
- `.cursor/skills/content-pipeline-agents/SKILL.md` — Razbor **draft edit path** + overwrite + Выбрать
- `.cursor/skills/carousel-json-contract/SKILL.md` + `create-carousel-prompts-notes.md` — tokens-only / themes / etalon
- `workers/designer-carousel/SKILL.md` — S52 Settings + themes
- `.cursor/skills/ai-bridge/SKILL.md` — S52 brandbook tokens, draft context, Armenian themes, budget 9
- `.cursor/skills/client-scenarios/SKILL.md` — **S52.A–C**
- `.cursor/rules/client.mdc` — §18 S52 HARD
- `.cursor/skills/client-review/SKILL.md` — S52 reject bullets
- `.cursor/skills/trainer/gap-playbook.md` — 10 строк симптомов
- `plugins/trainer/s52-design-razbor-quality.md` + `PLUGINS.md`

## Locks

| Lock | Value |
|------|--------|
| ticket_limit | default≤3 |
| shell_freeze | true (AppShell / left Studio nav) |
| UI in scope | Settings Design chrome + Razbor modal (**user-explicit**) |
| upgrade_only | true |
| no_pipeline_break | true |
| validation_budget_png | **9** (3 carousels × 3 slides, with images) |
| etalon_folder | `generatedMedia/эталон карусели/` |
| no social publish | true |

## Proposed tickets (≤3)

1. `C-design-tokens-only` — 1.1–1.3
2. `C-razbor-draft-edit` — 2.1–2.4
3. `C-carousel-quality-etalon` — §3 + 9 PNG + etalon

## Proposed chain hint

```
Trainer (done) → Architect (spec+chain: tokens-only payload, draft upsert key, etalon path, shell_freeze + Design/Razbor in scope)
  → Frontend (Settings Design cards/toolbar LEFT; Razbor draft preview / no start / Выбрать+square)
  → AI Bridge (agent tokens-only; random Armenian themes; draft carousel context inject)
  → Backend (draft overwrite/upsert; API if needed)
  → Tester (S52.A–C + guards) → Fixer → Deployer (localhost + etalon folder) → Client (Playwright S52)
```

## Вердикт

Команда готова к волне: **да** (грейд **B** — идти к Архитектору сразу).
