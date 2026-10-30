# Trainer grade — 2026-10-15 — Sprint 9 Carousel + Reels (Claude Code bar)

## План хода

- Запрос: **Sprint 9** (`DEV_PLAN` **9.1→9.11**) — качество каруселей IG + рилсов IG/YT Shorts как у сильного Claude Code-прогона.
- HARD user: **upgrade-only** prompts/skills/contracts; **no pipeline break** (Razbor→Scriptwriter→Designer→Draft); **no UI shell redesign**; **no social publish**; other modules → **Sprint 23**.
- Режим: AI Bridge primary + Backend fixtures/contracts + Tester smoke/scorecard.
- Роли по chain: Architect → **AI Bridge** → Backend (fixtures/STRICT) → Tester → Fixer → Deployer → Client.
- `ticket_limit: default≤3` (пользователь не снимал лимит явно; full sprint можно идти пачками 9.1–9.3 → 9.4–9.6 → 9.7–9.10).

## Грейд: **B** (волна готова после закрытия skill-gaps этим ходом)

| Роль | Грейд | Комментарий |
|------|-------|-------------|
| **AI Bridge** | **B→A*** | Контракты S44–S50 / reels / s50-hardening уже сильные; не хватало явного Sprint 9 upgrade-only + 9.8 critic/few-shot lock — **закрыто** |
| **Architect** | **A** | Sprint 9 scope + shell_freeze + upgrade_only + proposed chain в skill |
| **Tester** | **B** | S44–S46 HARD уже в client-scenarios; добавлены guards 9.9 smoke + 9.10 scorecard + STRICT + no-pipeline-break diff |
| **Backend** (fixtures/contracts only) | **B** | Scope сужен: golden fixtures + STRICT fail-job; не полный rewrite workers |

\*После Architect thresholds + первый golden pack AI Bridge = **A** на исполнение 9.4–9.8.

**До апгрейда skills:** критичный пробел (**C**) — не было явных `upgrade-only` / `no-pipeline-break` locks в prompt-engineering / carousel-json-contract / reels-scriptwriter / content-pipeline-agents → риск rewrite пайплайна «ради качества».

## Пробелы (до этого хода)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Нет upgrade-only / no-pipeline-break в 4 skills | AI Bridge / Architect | skill | **P0** |
| 2 | Architect без sequential Sprint 9 chain + module lock | Architect | skill | P0 |
| 3 | Tester без 9.9 smoke + 9.10 scorecard guards | Tester | skill | P0 |
| 4 | Backend без Sprint 9 fixtures/STRICT-only scope | Backend | skill | P1 |
| 5 | prompt-engineering без Claude-Code 9.8 critic bar | AI Bridge | skill | P1 |
| 6 | gap-playbook / plugins без Sprint 9 симптомов | Trainer | skill | P2 |

## Что добавлено этим ходом

- `.cursor/skills/prompt-engineering/SKILL.md` — § Sprint 9 upgrade-only / no-pipeline-break + 9.8 bar
- `.cursor/skills/carousel-json-contract/SKILL.md` — § Sprint 9 locks + STRICT + golden
- `.cursor/skills/reels-scriptwriter/SKILL.md` — § Sprint 9 locks (IG+YT, no HeyGen)
- `.cursor/skills/content-pipeline-agents/SKILL.md` — § Sprint 9 pipeline preserve
- `.cursor/skills/ai-bridge/SKILL.md` — Sprint 9 rule + deliverable table
- `.cursor/skills/architect/SKILL.md` — § Sprint 9 chain
- `.cursor/skills/tester/SKILL.md` — § 9.9–9.10 guards
- `.cursor/skills/backend/SKILL.md` — § Sprint 9 fixtures/STRICT only
- `.cursor/skills/trainer/gap-playbook.md` — 6 строк Sprint 9 risks
- `plugins/trainer/sprint9-carousel-reels.md` + строка в `PLUGINS.md`

## As-is product (audit, не код)

- Живой Create/Razbor handoff + Dramaturgy JSON + reels skill + S44–S46 Client HARD уже в библиотеке.
- Golden fixtures pack (3–5 carousel + 2–3 reels) и scorecard numbers в memory — **ещё не артефакты продукта** → работа 9.2/9.3/9.10.
- Inventory live vs chrome (9.1) — сделать AI Bridge+Architect в первой пачке.

## Proposed chain hint

```
Trainer ✅
→ Architect (architect-spec + chain.md;
    shell_freeze: true;
    upgrade_only: true;
    no_pipeline_break: true;
    modules: carousel-engine + custom-reels only;
    no social publish;
    thresholds for 9.10 scorecard)
→ AI Bridge 9.1 (inventory live vs chrome)
→ AI Bridge + Backend 9.2–9.3 (golden fixtures carousel + reels)
→ AI Bridge 9.4–9.6 (Scriptwriter / Designer / reels prompts in place)
→ AI Bridge + Backend 9.7 (STRICT zod — fail job on parse fail)
→ AI Bridge 9.8 (prompt packs + few-shots + critic)
→ Tester 9.9 (smoke Razbor→Create→Draft + reels path @1440)
→ Tester + AI Bridge 9.10 (scorecard in memory/)
→ AI Bridge → Tester → Fixer 9.11 (fix loop on fail)
→ Deployer (localhost) → Client (S44–S46 + quality words; no publish)
```

Frontend / Motion **не** в chain по умолчанию. Не параллелить overlapping prompt files (`create-carousel-prompts.ts` / agent-defaults).

## What NOT to touch

| Запрет | Почему |
|--------|--------|
| AppShell / Sidebar / left nav IA / module top-nav chrome | shell_freeze |
| Rewrite Razbor→Scriptwriter→Designer→Draft / Create handoff chrome | no_pipeline_break |
| HeyGen / cartoon / aesthetic-graphics / articles / clips-to-reels | Sprint **23** |
| Social publish to IG/YT/TikTok | Sprint **22**; blocked until 9.9–9.10 green |
| Deep Analyst / Marketing Director / pipeline Trainer products | Sprint 12 / 23 |
| Mesh parity other modules / Module SDK depth | Sprint 23 |
| Apify cost ops (unless blocks smoke) | Sprint **10** |
| User basic brief revive | S49 deleted forever |
| Soft-mock success on bad JSON / weak hook | STRICT + critic |

## Вердикт

Команда готова к волне: **да** (грейд **B**; можно звать Архитектора).
