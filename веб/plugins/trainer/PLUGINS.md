# Плагины Тренера — Content Factory

Карточки. Платный MCP не предлагать.

| Name | Type | Path | Когда |
|------|------|------|--------|
| vernatun-a-pipeline-close | ref | `plugins/trainer/vernatun-a-pipeline-close.md` | **DEV_PLAN 0–9** Mode A ×4; одна gpt-5.4; добить карусель; full-queue |
| gap-playbook | ref | `.cursor/skills/trainer/gap-playbook.md` | после «не то» |
| trainer-grade | template | `memory/_templates/trainer-grade.md` | каждый шаг 0 |
| s49-feed-brandbook | ref | `plugins/trainer/s49-feed-brandbook.md` | **S49** feed plaque/toggle/Boards + Team brief delete + Design brandbook |
| s50-client-ui-live | ref | `plugins/trainer/s50-client-ui-live.md` | **S50 CRITICAL** Client pickiness + Design 3:5 + minimal bottom + Create/live prompts |
| s51-design-boards-apify | ref | `plugins/trainer/s51-design-boards-apify.md` | **S51** Design top-right + Boards segment no-jump + Apify cost cache |
| s52-design-razbor-quality | ref | `plugins/trainer/s52-design-razbor-quality.md` | **S52** Design tokens-only + toolbar left + Razbor draft edit + etalon + 9 PNG |
| s52-scout-apify-only | ref | `plugins/trainer/s52-scout-apify-only.md` | **S52.D** Apify **only** Scout «Разведать»/schedule; Competitors = snapshot; 0 Apify on feed open |
| dev-plan-shell-freeze | ref | `plugins/trainer/dev-plan-shell-freeze.md` | Research wave: correct `DEV_PLAN.md` checkboxes; **freeze** AppShell/nav/chrome |
| sprint8-postgres-sot | ref | `plugins/trainer/sprint8-postgres-sot.md` | **Sprint 8** Postgres SoT 8.1–8.7; Frontend-minimal; no social publish |
| sprint9-carousel-reels | ref | `plugins/trainer/sprint9-carousel-reels.md` | **Sprint 9** carousel+reels Claude-Code quality; upgrade-only; no pipeline break; no publish |
| content-factory-ui | skill | `.cursor/skills/content-factory-ui/` | UI + C-138…**C-158** + Embla + **S45–S51** + Design top-right/neon + Boards **from segment** + no UI jump |
| carousel-studio-handoff | skill | `.cursor/skills/carousel-studio-handoff/` | **C-carousel-*** Create: handoff; Публикация→Черновики; active DESIGN.md; S41+**S43**; **S47/S48** Create parity |
| carousel-json-contract | skill | `.cursor/skills/carousel-json-contract/` | Dramaturgy JSON; swipe meta; CTA 1–4; **Phase 7 LAYERED HTML / S57**; drafts; preview-black |
| content-factory-analytics | skill | `.cursor/skills/content-factory-analytics/` | C-127/128 + **module top-nav entry C-136**; Scout params → Team (C-145) |
| 21st-ui-catalog | skill + MCP `21st` | `.cursor/skills/21st-ui-catalog/` | CompactMultiButton, calendar DnD, **Embla**, upload, **AIInput** for Marketing Director |
| client-scenarios | skill | `.cursor/skills/client-scenarios/` | S1–**S57**; **S57 HARD** layered HTML (+ prior S47–S56 where not superseded) |
| marketing-director-prompt | ai-bridge stub | `.cursor/skills/ai-bridge/marketing-director-prompt.md` | **S47** Haiku + GraphQL/search strategy chat |
| razbor-live-prompt | ai-bridge stub | `.cursor/skills/ai-bridge/razbor-live-prompt.md` | **S48** LIVE Haiku Razbor: hook/mid/CTA + virality + trainer tasks → Scriptwriter |
| create-carousel-prompts-notes | ref | `.cursor/skills/carousel-json-contract/create-carousel-prompts-notes.md` | AI Bridge inject: swipe meta + CTA 1–4 + VIRAL CRAFT + **TYPE SCALE** + **rich visual_prompt** + **logo dual-path** + **AD Gemini** + prompt-trace → `create-carousel-prompts.ts` |
| carousel-prompt-trace | skill + card | `.cursor/skills/carousel-prompt-trace/` · `plugins/trainer/carousel-prompt-trace.md` | **Weak-link dump:** MD logs in `docs/карусель тест/`; full system/user/reply; per-slide image prompts **w/ typography**; budget 6 PNG; shell_freeze chrome |
| e2e-image-carousel | ref | `plugins/trainer/e2e-image-carousel.md` | **LEGACY S53** — SUPERSEDED by **carousel-layered-html-pipeline** / S57 for product ship |
| carousel-anchor-ref-bakeoff | ref | `plugins/trainer/carousel-anchor-ref-bakeoff.md` | **S54 bake-off:** etalon vs `e2e_diffusion` vs **`anchor_ref_pipeline`** (cover→ref 2–N); compare folder naming; budget **9 PNG**; Armenian LANGUAGE themes; shell_freeze |
| carousel-correct-pipeline | ref | `plugins/trainer/carousel-correct-pipeline.md` | **Correct-doc** sheet⊕Create / Brand+Персонажи / Logs / Publicist / CTA+swipe; **paint SUPERSEDED by S57 layered** |
| carousel-layered-html-pipeline | ref | `plugins/trainer/carousel-layered-html-pipeline.md` | **S57 product:** image bg + HTML/CSS Puppeteer; ban letters/logos on bg; CTA HTML; fonts×3; vision OFF; etalon layered-html-refs #3; ONE 4-slide smoke |
| design-inject-logo-br | ref | `plugins/trainer/design-inject-logo-br.md` | **2026-10-18:** FULL DESIGN inject (fonts+sizes+colors); logo BR chrome; slide-num slot; secondary_copy 2–3×; fontFit reduce-only; layout variety; deconstruct verify; smoke ONE×6 |
| phase1-logo-wordmark-html | ref | `plugins/trainer/phase1-logo-wordmark-html.md` | **2026-10-18 Phase 1:** Vernatun **wordmark** transparent PNG → S57 HTML `<img>`; **omit** `.brand-name` / Vernatun text; supersedes «name beside» for wordmark |
| logo-placement-v2 | ref | `plugins/trainer/logo-placement-v2.md` | **2026-10-18 after Phase1:** new PNG + strip black matte; body **bottom-left**; cover+cta **top-left**; size **2×** (`88→176`); logo-only KEEP; Client Playwright → «согласовано»; Phase2/3 were OUT — **Phase2 now IN** via `phase2-vision-prompt-logo` |
| phase2-vision-prompt-logo | ref | `plugins/trainer/phase2-vision-prompt-logo.md` | **2026-10-18 Phase 2:** scrub IMAGE prompt (`buildVisionRefBackgroundImagePrompt`+sanitize); strengthen copy-etalon; BAN stock Manrope/scale; **`logoTextColor`** on `html_layout`; logo quality A emblem+HTML wordmark \| B crisp mark; review-before-implement; full-queue → Client; Phase3 Pixar OUT |
| layout-copy-dual-char | ref | `plugins/trainer/layout-copy-dual-char.md` | **2026-10-18:** 4-slide grid deconstruct → **layoutMap**; numbering mirror; MUCH wider SW; 3 DESIGN.md grids; dual `character_paint` in_image\|cutout; etalon `layout-copy-refs-2026-10-18/`; dual smoke×6 |
| vision-style-copy | ref | `plugins/trainer/vision-style-copy.md` | **2026-10-18 experiment:** `styleCopyMode=vision_ref` — etalon as **image ref**; hard-copy composition; **BAN** FULL DESIGN TOKEN CARD inject; Brand Vernatun text/CTA separate; product default `character_paint=in_image`; partial bg OK; layoutMap **not** sole path; smoke A×6 keep |
| variant-a-art-director | ref | `plugins/trainer/variant-a-art-director.md` | **Variant A** Designer `html_layout` → composite + **Art Director** remarks\|approve; NO auto-remake; mesh/Team; ONE smoke + AD text; VPS checklist = Orchestrator |
| pipeline-practice-higven-3 | ref | `plugins/trainer/pipeline-practice-higven-3.md` | **2026-10-18 HIGVEN×3:** etalon 01 active (+02 inactive OK); Designer **parallel** `image_prompt`+`html_layout` ONE reply; SW **Haiku**→HITL «Передать дизайнеру»; N=3; full Vernatun PNG; `characterPaint=none`; AD no remake; ≤3 attempts; full-queue |
| art-director | skill | `.cursor/skills/art-director/` | Pipeline AD: critique-checklist + html-layout-variant-a; rule `art-director.mdc` |
| useful-smoke-51-1-17 | ref | `plugins/trainer/useful-smoke-51-1-17.md` | **LEGACY smoke set** — S57 DELETE folder + ONE 4-slide; useful gid lock may remain |
| reels-scriptwriter | skill | `.cursor/skills/reels-scriptwriter/` | **C-reels-scriptwriter-upgrade**; custom-reels hook 0–2s · beats · CTA · captivating |
| designer-carousel | worker skill | `workers/designer-carousel/` | **Panorama→slice** + DesignPreset + colors-only Settings; top-tier vs golden refs |
| llm-model-catalog-notes | trainer ref | `.cursor/skills/trainer/llm-model-catalog-notes.md` | Draw `gpt-5.4-image-2`; describe+Scriptwriter **Sonnet**; ban image-id→mini chat |
| taste-skill | skill | `.cursor/skills/taste-skill/` | anti-slop |
| xyflow-agent-mesh | skill | `.cursor/skills/xyflow-agent-mesh/` | **C-146…C-152** + **C-155** + **S49 DELETE** User basic brief (never → agents) |
| content-pipeline-agents | skill | `.cursor/skills/content-pipeline-agents/` | **C-151/152**; **C-155**; **C-carousel-***; **S48** LIVE Razbor; **S49** release-team task sources (no User brief) + Designer brandbook tokens |
| web-motion-engine | skill | `.cursor/skills/web-motion-engine/` | C-131; **S48** expensive horizontal L/R + preload; C-139; C-141; **C-158** 9-cube Thinking |
| web-perf-motion | skill | `.cursor/skills/web-perf-motion/` | **C-144** module cold-load root cause + guards ms |
| backend | skill | `.cursor/skills/backend/` | Polza C-145; **C-155**; C-153; **S51→S52** `apify-scraper-cost-discipline.md` Scout-only |
| ai-bridge | skill | `.cursor/skills/ai-bridge/` | **C-155**; **C-carousel-***; **S48** razbor-live; **S50** prompts; **S52** Scout-only / no Apify from agents |
| architect | skill | `.cursor/skills/architect/` | locks **C-146…C-158** incl. live chat + PromptBox wave |
| create-skill / create-rule | Cursor | встроенные | закрыть пробел грейда C/D |
| playwright / chrome-devtools / a11y / lighthouse | MCP | `.cursor/mcp.json` | глаза Клиента/Тренера (бесплатный npx) |
| WebSearch / WebFetch | tools | агент | факты без платного scrape |

Код экранов — Frontend. Вердикт — Клиент. Spec — Архитектор.
