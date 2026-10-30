# Trainer grade — 2026-10-16 — E2E diffusion carousel (kill HTML overlay)

## План хода

- **Запрос:** END-TO-END diffusion carousel — image model paints **everything** including typography ON the PNG; **KILL** Playwright/HTML text overlay as primary («pretty photo + base text layer»). LLM→image gets **only** Scriptwriter JSON (scenario) + **approximate** design colors. Expensive Instagram look. Budget **2×3 = 6 PNG**. Evidence MD in `docs/карусель тест/`. `@promts` cycle intact.
- **Режим:** draw-path / AI Bridge prompts (не UI chrome). `shell_freeze` = AppShell/Create chrome OK; **draw path IN SCOPE**.
- **Locks:** `upgrade_only` · `no_pipeline_break` (Scriptwriter → Designer → Draft) · Client **S53 HARD**.
- **Роли по chain:** Trainer → Architect → AI Bridge → Backend → Tester → Fixer → Deployer → Client. Frontend **omit**.
- **ticket_limit:** default≤3 (одно фокусное изменение paint path; full-queue не запрошен).

## Грейд: **B** → **A** после закрытия пробелов этим ходом

До апгрейда: **C** — канон Phase3 HTML/CSS-first + «zero text in diffusion» прямо противоречил carte blanche пользователя.  
После апгрейда skills/rules: **A** — команда знает Phase4 / S53 / chain / budget / traces.

## Пробелы (закрыты)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Phase3 «HTML/CSS-first; diffusion = bg only» = product truth | AI Bridge / Architect | skill | **P0** ✅ |
| 2 | `create-carousel-prompts-notes` говорил «zero text in diffusion» | AI Bridge | skill | **P0** ✅ |
| 3 | `carousel-prompt-trace` допускал `image_llm: skipped` + HTML as OK | AI Bridge / Tester | skill | **P0** ✅ |
| 4 | Нет Client HARD REJECT на HTML-overlay-primary | Клиент | rule + scenarios | **P0** ✅ |
| 5 | `content-pipeline-agents` / Designer = «Layout HTML/CSS-first» | Pipeline | skill | **P0** ✅ |
| 6 | gap-playbook хвалил Phase3 HTML как cure «слабые слайды» | Тренер | gap | **P1** ✅ |
| 7 | Путаница shell_freeze ≈ freeze draw | Architect | skill/card | **P1** ✅ |

## Что добавлено этим ходом

- `carousel-json-contract` — **Phase4 E2E diffusion** supersedes Phase3; Designer = Diffusion Visual Engine; pipeline bake typography.
- `create-carousel-prompts-notes` — **E2E DIFFUSION** inject block; Designer overlay wording.
- `ai-bridge` — Phase4 + Designer draw = full paint; S53 note.
- `content-pipeline-agents` — audit table Phase4; Razbor/Create Designer rows.
- `carousel-prompt-trace` + plugin card + Designer MD template — require image prompts w/ type; `html_overlay: none`.
- `prompt-engineering` — Phase4 section.
- `client.mdc` §19 **S53 HARD** + `client-scenarios` **S53.A–B**.
- `gap-playbook` rows for HTML-overlay / E2E / draw-in-scope.
- `plugins/trainer/e2e-image-carousel.md` + PLUGINS index.
- `llm-model-catalog-notes` / `sprint9-prompt-packs` Phase4 pointers.

## Chain hint (для Архитектора)

```
Trainer (done) → Architect
  (spec: Phase4 E2E diffusion; kill HTML-overlay-primary ship path;
   LLM inputs = Dramaturgy JSON + approx brandbook colors only;
   image-2 paints scene+typography+CTA ON PNG;
   budget 6 PNG; traces docs/карусель тест/;
   shell_freeze chrome; draw_path in scope; upgrade_only; no_pipeline_break)
  → AI Bridge (primary: patch create-carousel-prompts + Designer packs = bake type;
               VIRAL CRAFT + E2E DIFFUSION; write MD session logs)
  → Backend (draw path: primary = image API full paint;
             deprecate Playwright/HTML text overlay as product success;
             optional CAROUSEL_PROMPT_TRACE=1 dump)
  → Tester (guards: 6 PNG; traces have per-slide image prompts w/ typography;
            html_overlay none; no HTML-primary PASS; pipeline shape)
  → Fixer → Deployer (localhost API refresh) → Client (S53 + Playwright Create + read traces)
```

Frontend: **omit**. Motion: omit.

## Вердикт

Команда готова к волне: **да** (грейд **A** после закрытия P0 в skills/rules).  
Код Phase4 ещё не написан — это работа AI Bridge + Backend по chain; Тренер прод-код не пишет.
