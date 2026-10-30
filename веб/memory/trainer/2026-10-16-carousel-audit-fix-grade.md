# Trainer grade — 2026-10-16 — carousel-audit-fix

## План хода

- Запрос: реконструкция carousel-engine по Gemini + `docs/PROMPT_AUDIT_CAROUSEL_FULL.md` — model routing, Phase1 prompt hygiene, Phase3 HTML/CSS-first, budget 6 PNG, shell_freeze / no_pipeline_break / upgrade_only.
- Режим: AI Bridge + Backend (prompts / routing / renderer); UI chrome freeze.
- Роли по chain: Архитектор → **AI Bridge** (primary) → Backend → Тестировщик → Фиксер → Деплоер → Клиент. Frontend **только** если preview wire сломан; иначе out.
- Отвергнутое: soft-mock; pipeline rewrite; COMBAT CTA «бронь/сторис»; describe через image-id→mini; Scriptwriter Haiku как quality default после аудита.

## Грейд: B

Было **C** (критичные пробелы знаний в skills: Haiku-default, нет Phase3 HTML-first, нет routing describe≠image, нет CTA COMBAT sync / dedupe / full few-shots / budget 6).  
После закрытия пробелов в skills — **B**: команда готова к волне; Architect ещё обязан зафиксировать exact Polza Sonnet slug + route helper в spec.

## Пробелы (закрыты этим ходом / остаток на Architect)

| # | Пробел | Роль | Слой | P0/P1/P2 | Status |
|---|--------|------|------|----------|--------|
| 1 | Scriptwriter default всё ещё Haiku в skills | AI Bridge | skill | P0 | closed in catalog notes + skills |
| 2 | Designer describe → image id → mini | AI Bridge / Backend | skill + code | P0 | skill closed; code = chain |
| 3 | Confirm draw = gpt-5.4-image-2 ≠ mini | AI Bridge | skill + code | P0 | skill closed; verify in chain |
| 4 | Phase1 dedupe / paired invariants / full JSON few-shots | AI Bridge | skill | P0 | closed in prompt-engineering + notes |
| 5 | CTA COMBAT ≠ catalog 1–4 | AI Bridge | skill | P0 | closed in contract + notes |
| 6 | Phase3 HTML/CSS-first (diffusion optional) | Architect + AI Bridge + Backend | skill | P0 | closed in contract; implement in chain |
| 7 | Budget 2×3=6 PNG | Tester / Deployer | skill | P1 | closed in skills + grade |
| 8 | Exact aggregator Sonnet slug | Architect | spec | P1 | **open** — lock in chain.md |

## Что добавлено этим ходом

- `.cursor/skills/trainer/llm-model-catalog-notes.md` — Sonnet + routing HARD
- `.cursor/skills/prompt-engineering/SKILL.md` — § Carousel audit reconstruction (Phase1/3, budget 6)
- `.cursor/skills/ai-bridge/SKILL.md` — model routing table + Phase1 packs
- `.cursor/skills/ai-bridge/sprint9-prompt-packs.md` — audit add-ons
- `.cursor/skills/carousel-json-contract/SKILL.md` — COMBAT CTA sync, Phase3 HTML/CSS-first, budget 6, pipeline rewrite
- `.cursor/skills/carousel-json-contract/create-carousel-prompts-notes.md` — dedupe / COMBAT / Phase3 wording
- `.cursor/skills/content-pipeline-agents/SKILL.md` — audit wave locks + model table
- `.cursor/skills/trainer/gap-playbook.md` — 8 новых строк симптомов
- `plugins/trainer/sprint9-carousel-reels.md` + `PLUGINS.md` — chain hint / catalog blurb

## Locks

| Lock | Value |
|------|-------|
| ticket_limit | default≤3 (волна = один audit-epic; не full-queue unless user says) |
| upgrade_only | true |
| no_pipeline_break | true — Create **Scriptwriter → Designer → Draft** |
| shell_freeze | true |
| validation_budget_png | **6** (2 carousels × 3 slides) |
| no social publish | true |

## Proposed chain hint

```
Trainer (done) → Architect (spec: Sonnet slug, describe textModel, Phase3 HTML/CSS-first, CTA COMBAT sync, dedupe bundle, budget 6, shell_freeze)
  → AI Bridge (prompts/packs/agent-start/defaults — primary)
  → Backend (agent-chat routing + carousel-html-renderer Phase3 + zod if needed)
  → Tester (guards: model ids, CTA sync, 6 PNG, Create shape)
  → Fixer → Deployer (localhost) → Client (Playwright Create S41+)
```

Frontend: **omit** unless preview-black / wire regression.

## Вердикт

Команда готова к волне: **да** (грейд **B** — идти к Архитектору сразу).
