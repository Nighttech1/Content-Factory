# LAYERED HTML carousel pipeline — S57

**When:** user locks complete — **единственный** product render = image background + HTML/CSS Puppeteer overlay. **Supersedes** type-on-PNG / Phase4 E2E diffusion ship path / Phase6 `correct_pipeline` paint as product success.

**Etalon (taste, not rigid clone):** `generatedMedia/эталон карусели/layered-html-refs-2026-10-17/` — especially **`03-website-fast-cutout.png`** (dynamic cut-out). Designer **invents** layout; refs = craft bar.

## User locks (HARD · complete)

| # | Lock |
|---|------|
| **1 Render** | **Single** mode: image bg + HTML/CSS (Puppeteer) overlay → final PNG. **No** parallel `correct_pipeline` / type-on-PNG as product path. |
| **2 Image bg** | Scriptwriter `visual_prompt` drives **scene only**. **FORCE** no logo / no letters / no watermarks on bg via **prompt AND code**. Logo = **HTML layer only** (from Settings Brand). |
| **3 Meta / CTA** | `swipe_trigger` = **meta only** (never painted). CTA catalog **1–4** = **HTML button** on `cta_slide` only. |
| **4 Slide count** | Auto **`slides=7`** when topic needs «N ways / N tips»; Scriptwriter **may bump** N. Else follow user N / sheet. |
| **5 Brand** | Brand **name + logo** from Settings → **Бренд** upload (not baked into image model). |
| **6 Fonts** | **3 fonts** from active DESIGN.md: title / body / content. If missing in factory — **download** into factory font store, then use. |
| **7 Vision** | Vision text-check **OFF** (no OCR regen loop). |
| **8 Etalon** | New refs folder above; #3 cut-out = best taste ref. |
| **9 Characters** | Settings **Персонажи**: cut-out **conductors OVER** background (HTML/composite layer), **not** painted into bg scene. Split-across-slides = **OPTIONAL rare**, not every carousel. |
| **10 Raster** | Localhost **Puppeteer**, canvas **1080×1350** (4:5). |
| **11 Smoke folder** | **DELETE** `docs/карусель тест/smoke-useful-51-1-17/` (user explicit). Put **ONE** new **4-slide** carousel there for Client score. |

## Target flow

```text
Create ⊕ useful sheet (keep)
  → Scriptwriter → Dramaturgy JSON
       visual_prompt = SCENE ONLY (no text/logo in scene)
       headline/body/cta_type for HTML layer
       swipe_trigger = meta; auto N=7 when «N ways»
  → zod STRICT (+ critic 05 OK keep)
  → Designer → (a) image prompts = bg/scene only + HARD ban letters/logos
               (b) HTML/CSS layout invent (taste from layered-html-refs, esp. #3)
               (c) cut-out characters OVER bg if hero set
               (d) brand name+logo + 3 DESIGN.md fonts in HTML
               (e) CTA 1–4 as HTML button on cta_slide
  → Image model → bg PNG(s) 1080×1350 (no text/logo)
  → Puppeteer localhost → composite HTML overlay → final slide_0N.png
  → Drafts (vision OFF)
  → Publicist auto|manual (unchanged)
```

## Explicit SUPERSEDES

| Prior | Status |
|-------|--------|
| **S53** «kill HTML-overlay-primary» | **SUPERSEDED** for ship path — layered HTML **is** the product |
| Phase4 E2E type-on-PNG | **not** product path |
| Phase6 `renderMode: correct_pipeline` paint / vision≤2 | paint **removed** as product; vision **OFF**; sheet/Brand/Персонажи/Logs/Publicist/CTA/swipe **KEEP** |
| S54 bake-off / S55 type-on-PNG bar / S56 useful-smoke folder | acceptance → **S57**; delete old smoke folder per lock 11 |

## Skills / roles

- `carousel-json-contract` § **Phase 7 Layered HTML**
- `create-carousel-prompts-notes` § LAYERED HTML
- `carousel-prompt-trace` — traces: bg image prompts (**no typography**) + HTML layout notes + Puppeteer composite paths
- `ai-bridge` · `backend` (Puppeteer composite; ban letters in image path; vision off)
- `content-factory-ui` — fonts download if missing (**optional** Frontend in chain)
- **Variant A + AD (optional wave):** `art-director` + `html-layout-variant-a.md` + card `variant-a-art-director.md` — Designer `html_layout` → composite; Art Director remarks\|approve (**NO remake**)
- Client: **S57 HARD** + Playwright @1440 + score vs `layered-html-refs-2026-10-17/` (esp. #3)
- Tester: guards — single renderMode layered; vision disabled; no logo/text in bg; CTA HTML; smoke folder rewrite

## Chain (proposed)

```text
Trainer ✅ → Architect (spec Phase7 + Puppeteer 1080×1350 + delete correct_pipeline product path; chain.md)
  → AI Bridge (overlays: scene-only visual_prompt; ban letters/logos; HTML CTA/fonts/brand; invent layout)
  → Backend (Puppeteer composite; FORCE ban in draw code; vision OFF; delete smoke-useful-51-1-17; ONE 4-slide)
  → Frontend (only if DESIGN.md fonts missing / download wire — else omit)
  → Tester → Deployer (localhost) → Client (S57 + Playwright + etalon #3 taste)
```

`shell_freeze` AppShell. Draw/composite path **in scope**. No Motion/Mesh redesign.

## Budget

**ONE** 4-slide carousel for Client score (4 final PNG) + optional bg intermediates. Cap **≤8** new final slides without stop-report. Do not revive 12-PNG useful-smoke set.
