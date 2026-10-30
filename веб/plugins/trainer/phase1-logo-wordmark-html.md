# Phase 1 — Vernatun wordmark logo HTML-only (2026-10-18)

**When:** user locks **Фаза 1 only** — insert transparent Vernatun PNG on layered composite; **no** separate club-name text.

**SUPERSEDES (logo chrome only):** `design-inject-logo-br.md` lock «club name **beside** icon» and gap row «name beside» — **when** Brand logo is a **wordmark PNG** (letters already in image). Icon-only marks may still use name beside; product Vernatun mark = wordmark → **logo-only**.

## User locks (HARD · Phase 1)

| # | Lock |
|---|------|
| **1 Source** | Transparent PNG: `C:\Users\alexk\.cursor\projects\d-Applications-Content-factory\assets\c__Users_alexk_AppData_Roaming_Cursor_User_workspaceStorage_af706c00c2234488d2e1b065a04a1e63_images_logo-transparent-555fbf86-ea1d-4710-acc5-65722a5a1aa9.png` → Settings Brand `logoRef` / factory brand store (raw for Puppeteer). |
| **2 No duplicate text** | **Omit** HTML `.brand-name` / Vernatun / ARMENIAN CLUB next to the mark. Word is **in** the PNG. |
| **3 Layer** | S57 HTML `<img class="brand">` over bg; `background: transparent`; dual-path **raw** `logoRef` (never sanitize stub as composite src). |
| **4 Placement keep** | ~~Default **bottom-RIGHT** + enlarged mark~~ — **SUPERSEDED by `logo-placement-v2.md`** (body `bottom-left`; cover+cta `top-left`; size 2×). Phase 1 itself did not invent a new system; v2 does. |
| **5 Scope** | Composite / placeholders / Brand logo wire **only**. |
| **Asset note** | Phase1 source PNG path superseded for product install by **v2** source → still `public/brand/vernatun-logo.png`. |

## НЕ делать (другие фазы)

| Phase | Out of scope now |
|-------|------------------|
| **2** | Fonts / type scale / vision prompt |
| **3** | Character Pixar lock |
| — | VPS / publish / DB wipe |

## Skills / code touchpoints (Architect → Backend)

- `lib/studio/carousel-layered-composite.ts` — stop emitting `<div class="brand-name">` when wordmark logo present (`logoUrl` set → name text **off**).
- `lib/studio/carousel-html-renderer.ts` — do **not** default `brandName` into visible chrome when logo is wordmark; keep raw `logoRef` → `resolvePlaywrightImageSrc`.
- Placeholders: `logoRefRaw` path **KEEP**; Brand store must hold the transparent PNG.
- Cards still true: dual-path (`carousel-json-contract` § Brand logo); S57 layered (`carousel-layered-html-pipeline.md`).

## FAIL

- Separate «Vernatun» / «ARMENIAN CLUB» text beside or under the PNG  
- Name-only chrome (no `<img>`) when logo file exists  
- Sanitized stub / solid plate behind logo  
- Baking logo into image-model bg  

## Chain

```text
Architect (spec: logo-only wordmark + PNG path + omit brand-name)
  → Backend (Brand store / raw logoRef + composite omit .brand-name)
  → Tester (guards: img present, no .brand-name when logoUrl)
  → (optional) smoke re-composite ONE slide / short carousel
```

`ticket_limit: full-queue` for this single phase. No AI Bridge / Frontend / Motion unless Brand upload UI broken. No paid MCP.
