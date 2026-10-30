# Wave — Vision style-copy (Variant A · character in_image) — 2026-10-18

**When:** user experiment: etalon slide → **copy visual style** via image reference (not layoutMap-as-only path).

## User locks (HARD)

| # | Lock |
|---|------|
| **1 Mode** | `styleCopyMode=vision_ref` — pass **etalon slide PNG** as **image reference** into Designer/draw (OpenAI/GitHub reference-first). Vision sees composition; LLM hard-copies zones/hierarchy/logo/CTA/numbering **from the picture**. |
| **2 Ban stock tokens** | On this path: **FORBIDDEN** to inject **FULL DESIGN TOKEN CARD** / default Manrope·Cormorant / stock `typography.scale` table. Those push LLM to apply a spreadsheet instead of mirroring the ref. |
| **3 Brand Vernatun** | Our **text + CTA catalog 1–4** (+ optional Brand logo from Settings) ship **separately** — content swap, not style invent from tokens. |
| **4 Character** | Product default: `characterPaint` / `character_paint` = **`in_image` ONLY** (girl conductor **in** bg pixels). `overlay_cutout` = **legacy OK**, **NOT** product default. |
| **5 Partial bg** | Refs (orange RE, Luma, Omkopa) often have **partial** photo (not always full-bleed cover). Copy that geometry — do **not** force full-bleed cover every slide. |
| **6 layoutMap** | Optional legacy / parallel. **Do NOT** treat «fix weak layoutMap parser» as the only success path for this experiment. |
| **7 Variant A** | Keep layered HTML + `html_layout` execution (S57). Style comes from **vision ref**, not from inventing via stock DESIGN table. |
| **8 Refs / smoke** | Etalon: `generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/`. Smoke **path A keep:** `docs/карусель тест/layout-copy-dual-char-smoke-A-in-image/` — **6-slide** carousel. |

## Prompt contract (AI Bridge)

```text
VISION STYLE-COPY (styleCopyMode=vision_ref):
- Attach etalon slide(s) as image reference to Designer describe + draw.
- HARD-COPY from ref: composition, zones, hierarchy, logo placement, CTA chrome, numbering presence/absence.
- Brand Vernatun: swap OUR headline/body/CTA (+ optional logo) — keep ref rhythm.
- character_paint=in_image (product default): conductor may appear IN scene pixels.
- BAN: FULL DESIGN TOKEN CARD · stock typography.scale · Manrope/Cormorant defaults forced into system.
- BAN: always full-bleed cover bg when ref shows partial/inset photo.
- layoutMap: do not require as sole path; vision_ref is primary for this wave.
```

## Skills

- `create-carousel-prompts-notes` § VISION STYLE-COPY
- `carousel-json-contract` Phase 7 + vision_ref exception to FULL inject
- `art-director/html-layout-variant-a.md` — `styleCopyMode` + in_image default
- `workers/designer-carousel` § Vision style-copy
- `ai-bridge` · `content-pipeline-agents` · `carousel-prompt-trace`
- gap-playbook rows for this wave

## Chain (user · full-queue)

```text
Trainer (this card + grade)
  → Architect (spec + chain.md: vision_ref, ban FULL TOKEN inject, in_image default, partial bg, smoke A×6)
  → AI Bridge (prompts + image-ref wire + ban stock tokens on path)
  → Backend (draw accepts reference image; characterPaint default in_image; partial bg honor)
  → Settings FE only if ref-upload / mode toggle missing
  → Tester (guards + smoke 6-slide path A)
```

`shell_freeze` AppShell. `ticket_limit: full-queue`. No paid MCP.

**Next wave:** Phase 2 image-prompt scrub + `logoTextColor` + logo quality → `plugins/trainer/phase2-vision-prompt-logo.md`.

## Supersedes (narrow · this experiment)

- **layout-copy-dual-char** «layoutMap is the primary copy path» → for style-copy experiment, **`vision_ref` is primary**; layoutMap = optional legacy.
- **design-inject-logo-br** «FULL DESIGN TOKENS every draw» → **exempt** when `styleCopyMode=vision_ref` (Brand Vernatun text/CTA/logo still allowed separately).
- Dual-char primary orange RE = `overlay_cutout` → **product default flips to `in_image`**; cutout remains legacy switch.
