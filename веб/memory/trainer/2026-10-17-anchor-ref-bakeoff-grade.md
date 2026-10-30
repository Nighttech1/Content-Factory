# Trainer grade — 2026-10-17 — Carousel pipeline bake-off (anchor_ref)

## План хода

- **Запрос:** Bake-off карусельных paint-путей. User хочет OpenAI/GitHub **reference-first** path: cover = visual anchor → slides 2–N match slide 1. Сравнить с etalon и текущим Phase4 one-shot. Budget **3×3 = 9 PNG**. Темы: Armenian **LANGUAGE** (разные). Outputs в compare-папку с **типом пайплайна в имени**. Вердикт Клиента: какой pipeline ближе к эталону. `@promts` цикл. **shell_freeze** UI.
- **Режим:** draw-path / AI Bridge prompts (не UI chrome). `shell_freeze` = AppShell/Create chrome; **draw path IN SCOPE**.
- **Arms:** `etalon` (existing) · `e2e_diffusion` (Phase4) · **`anchor_ref_pipeline` (NEW)** · optional `html_overlay` (legacy label).
- **Роли по chain:** Trainer → Architect → AI Bridge → Backend → Tester → Fixer → Deployer → Client (**S54**). Frontend **omit**.
- **ticket_limit:** default≤3 (одна фокусная волна bake-off; full-queue не запрошен).

## Грейд: **C** → **A** после закрытия пробелов этим ходом

До апгрейда: **C** — нет канона `anchor_ref_pipeline`, нет naming compare-folder, нет Client bake-off checklist (S54); бюджет/темы Phase4 (6 PNG) конфликтовали с 9 PNG LANGUAGE wave.  
После апгрейда skills/rules: **A** — команда знает Phase5 / S54 / labels / chain / budget / shell_freeze.

## Пробелы (закрыты)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Нет cover→reference paint path | AI Bridge / Backend | skill | **P0** ✅ |
| 2 | Нет labeled compare folder convention | Architect / Deployer | skill + etalon README | **P0** ✅ |
| 3 | Нет Client HARD bake-off (кто ближе к etalon) | Клиент | rule + scenarios | **P0** ✅ |
| 4 | Budget/themes stuck on S53 6 PNG / coffee pool | Trainer / AI Bridge | skill | **P1** ✅ |
| 5 | html_overlay не как labeled legacy arm | Клиент / Tester | skill | **P1** ✅ |
| 6 | gap-playbook без continuity / bake-off rows | Тренер | gap | **P1** ✅ |

## Что добавлено этим ходом

- `plugins/trainer/carousel-anchor-ref-bakeoff.md` + index в `PLUGINS.md`
- `carousel-json-contract` — **Phase5** bake-off + `anchor_ref_pipeline` Designer steps
- `create-carousel-prompts-notes` — **ANCHOR REF** inject block
- `prompt-engineering` — Phase5 + budget table 6 vs 9
- `ai-bridge` · `content-pipeline-agents` — Phase5 / S54 pointers
- `client.mdc` §20 **S54 HARD** + `client-scenarios` **S54.A–C**
- `gap-playbook` rows (continuity / naming / S54 / 9 PNG / LANGUAGE themes)
- `generatedMedia/эталон карусели/README.md` — bake-off path pointer
- `e2e-image-carousel.md` — follow-on to S54 card

## Chain hint (для Архитектора)

```
Trainer (done) → Architect
  (spec: Phase5 bake-off; labels etalon | e2e_diffusion | anchor_ref_pipeline | optional html_overlay;
   compare folder generatedMedia/compare-carousel-bakeoff/{label}/{armenian-language-theme}/slide_0N.png;
   anchor_ref = cover first → 2–N with cover as reference image; still E2E type-on-PNG;
   budget 9 PNG new draw; themes Armenian LANGUAGE (3 different);
   shell_freeze chrome; draw_path in scope; upgrade_only; no_pipeline_break)
  → AI Bridge (ANCHOR REF + E2E DIFFUSION inject; cover-first wording; LANGUAGE topics)
  → Backend (sequential draw + ref image for 2–N; write labeled compare paths;
             reuse prior e2e/html artifacts if present — do not burn budget re-labeling)
  → Tester (guards: naming; ≤9 new PNG; visual continuity cover→2–N on anchor_ref arm;
            no HTML-primary ship claim)
  → Fixer → Deployer (localhost API refresh; folder ready for Client)
  → Client (S54 side-by-side → verdict: which pipeline closest to etalon)
```

Frontend: **omit**. Motion: omit.

## Вердикт

Команда готова к волне: **да** (грейд **A** после закрытия P0 в skills/rules).  
Код `anchor_ref_pipeline` ещё не написан — AI Bridge + Backend по chain; Тренер прод-код не пишет. Клиентский вердикт «кто ближе к эталону» — только после labeled PNG в compare-папке.
