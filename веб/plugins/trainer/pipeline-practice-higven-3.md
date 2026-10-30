# Pipeline practice — HIGVEN ×3 (trainer card)

**When:** wave `2026-10-18-pipeline-practice-higven-3`. Canon = `memory/waves/2026-10-18-pipeline-practice-higven-3/plan.md`.  
**ticket_limit:** **full-queue**. **Carousel attempts:** ≤3 then STOP.

## HARD locks (supersede product defaults **for this wave only**)

| Lock | Value |
|------|-------|
| **etalon** | Active Settings Design pack = **01 HIGVEN** (`01-higven-heavy-lifting-grid.png` from `docs/карусель тест/эталон/pipeline-practice-2026-10-18/`). Clear **other** etalon presets from slot. **02** SUA may stay as **inactive library** only |
| **N** | Strict **3** slides: **cover · body · cta** (not 4 / 6 / 7) |
| **Scriptwriter** | **Haiku** (+ thinking if API) → text Dramaturgy for 3 slides |
| **HITL** | User chat + button **«Передать дизайнеру»** — no auto-handoff |
| **Designer pack (parallel)** | GPT **ONE** reply: `image_prompt`×3 (bg scene-only, no letters/logos) **+** `html_layout` JSON×3 (anchors, type rhythm from HIGVEN, `logo.placement`, CTA on last). Then **parallel**: GPT Image bg ‖ renderer payload prep. **No** second Designer call «only for logo.textColor» |
| **logo** | Brand DEFAULT = **full** Vernatun PNG (`vernatun-logo.png` — wordmark **baked in**). HTML `<img>` only. **Omit** forced HTML name / invent `logo.textColor` unless residual chrome contrast truly needed |
| **characterPaint** | **`none`** (overrides product default `in_image`; no girl / Phase3 / cutout) |
| **Art Director** | After 3 PNG ready: `approve` \| `remarks` only — **NO auto-remake** |
| **theme** | Any useful-sheet topic |
| **smoke** | `scripts/smoke-pipeline-practice-higven-3.ts` → `docs/карусель тест/pipeline-practice-higven-3/` (3 PNG + timeline). Attempt 1→Fixer 2→max 3 |
| **S57 keep** | Layered HTML: bg + Puppeteer overlay; vision OCR remake OFF |
| **shell_freeze** | AppShell / nav freeze; Frontend only if HITL button / Brand seed UI missing |
| **out** | Phase3 girl · overlay_cutout · VPS · social publish · >3 slides · >3 gen attempts |

## Visual bar (Client)

Resemble **HIGVEN** grammar: dark industrial · orange accents · clear hierarchy. Our Sheet text. Full Vernatun PNG. 3 frames. No character. Pass ≤3 attempts → Client **согласовано** or explicit C-* list.

## Skills / rules

| Layer | Path |
|-------|------|
| Canon plan | `memory/waves/2026-10-18-pipeline-practice-higven-3/plan.md` |
| Grade | `memory/trainer/2026-10-18-pipeline-practice-higven-3-grade.md` |
| Variant A layout | `art-director/html-layout-variant-a.md` § HIGVEN-3 |
| Layered product | `carousel-json-contract` Phase 7 · `carousel-layered-html-pipeline.md` |
| Prompts | `create-carousel-prompts-notes` § HIGVEN-3 PARALLEL PACK |
| AD | `art-director` + `variant-a-art-director` (no remake KEEP) |
| Pipeline | `content-pipeline-agents` HITL handoff |
| Models | Scriptwriter **Haiku** this wave; Designer chat/layout GPT; draw `openai/gpt-5.4-image-2` |

## Chain (proposed)

```text
Trainer ✅
  → Architect (spec + chain.md; locks above; no overlapping paths)
  → AI Bridge (SW Haiku 3-slide; Designer parallel pack; HIGVEN grammar; no girl; full logo img)
  → Backend (seed Design: clear others, activate 01, 02 inactive OK; brand full PNG;
             force N=3 + characterPaint=none; smoke script)
  → Tester (guards G: N=3, no character, active HIGVEN, full logo PNG, parallel fields)
  → Fixer if needed (≤3 carousel attempts)
  → Deployer (localhost + public assets)
  → Client (Playwright @1440)
```

## Budget

**ONE** 3-slide carousel per attempt · ≤**3** attempts · Art Director text artifact · no 6/12 PNG multi-row.

## Out of scope

Trainer product code · paid MCP · Motion redesign · VPS runbook body.
