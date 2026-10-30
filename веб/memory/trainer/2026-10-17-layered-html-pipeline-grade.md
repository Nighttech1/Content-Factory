# Trainer grade — 2026-10-17 · LAYERED HTML carousel pipeline

## План хода

- Запрос: единственный product render = **image bg + HTML/CSS Puppeteer overlay**; supersede type-on-PNG / `correct_pipeline` paint; locks 1–11 complete (user answers).
- Режим: backend + AI Bridge (prompts/draw/composite); Frontend **optional** (fonts download); UI shell freeze; Client **S57**.
- Роли по chain: **Architect → AI Bridge → Backend (+Frontend fonts if needed) → Tester → Deployer → Client**
- `ticket_limit: default≤3` (одна продуктовая волна / один render-mode ticket cluster; не full-queue бэклог)
- Отвергнуто ранее / superseded: S53 kill-HTML-as-primary; Phase6 vision+type-on-PNG ship; S56 multi-row smoke folder

## Грейд: B → A (после апгрейда skills)

До апгрейда: **C** — Client/skills HARD REJECT HTML overlay и требовали type-on-PNG+vision (прямое противоречие locks).  
После апгрейда: **A** — канон S57 / Phase 7 записан; команда может идти к Архитектору.

## Пробелы (закрыты этим ходом)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | S53/S55 FAIL HTML overlay vs новый ship path | Client | rule/skill | P0 ✅ |
| 2 | Нет Phase 7 / S57 канона layered | Architect/AI Bridge/Backend | skill/plugin | P0 ✅ |
| 3 | Vision≤2 + correct_pipeline paint как product | AI Bridge/Backend | skill | P0 ✅ |
| 4 | Ban letters/logos только «на словах» | AI Bridge/Backend | skill | P0 ✅ |
| 5 | Персонажи в bg / forced split | Pipeline | skill | P1 ✅ |
| 6 | 3 fonts DESIGN.md + download | Frontend/Backend | skill | P1 ✅ |
| 7 | Etalon layered-html-refs + #3 | Client | skill/plugin | P1 ✅ |
| 8 | Smoke DELETE + ONE 4-slide | Backend/Deployer | skill/plugin | P0 ✅ |
| 9 | gap-playbook без симптомов layered | Trainer | gap-playbook | P1 ✅ |

## Что добавлено этим ходом

- `plugins/trainer/carousel-layered-html-pipeline.md` — **S57** locks + flow + chain
- `client.mdc` §22 **S57 HARD**; §19–21 paint bars superseded for ship
- `client-scenarios` **S57.A–C** + Hard REJECT list update
- `carousel-json-contract` **Phase 7**; Designer role → Layered Visual Engine; visual_prompt = scene-only; auto-7
- `create-carousel-prompts-notes` § Phase 7 LAYERED HTML inject
- `carousel-prompt-trace` / `content-pipeline-agents` / `ai-bridge` / `backend` / `tester` — S57 wire
- `gap-playbook` — 10 новых строк layered
- `PLUGINS.md` — карточка layered; e2e/useful-smoke marked legacy
- Etalon README locks synced to complete user answers
- Legacy marked: `e2e-image-carousel.md`, `carousel-correct-pipeline.md` (paint), `useful-smoke-51-1-17.md`

**Не тронуто (Trainer):** `app/` / prod code — только skills/rules/plugins/memory.

## Proposed chain (Orchestrator)

```text
Architect (spec: single layered_html; Puppeteer 1080×1350; ban letters/logos code+prompt;
           vision OFF; deprecate correct_pipeline paint; DELETE smoke-useful-51-1-17 → ONE 4-slide;
           etalon layered-html-refs #3 taste; chain.md)
  → AI Bridge (SW scene-only visual_prompt + auto-7; Designer HTML invent + CTA HTML + Brand/fonts;
               overlays; no vision prompt path)
  → Backend (Puppeteer composite; FORCE bg ban; vision disabled; smoke folder rewrite)
  → Frontend (ONLY if DESIGN.md fonts missing / download wire — else omit)
  → Tester (S57 guards) → Deployer (localhost) → Client (Playwright S57 + score vs #3)
```

`shell_freeze: true` (AppShell). Draw/composite **in scope**.

## Budget

ONE Client-score carousel × **4** finals (≤8 without stop-report). No 12-PNG useful-smoke revival.

## Вердикт

Команда готова к волне: **да** (грейд **A** после закрытия P0 в skills/rules).

Следующий шаг Оркестратора: вызвать **Архитектора** со spec Phase 7 / S57.
