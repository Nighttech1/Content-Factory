# Wave — FULL DESIGN inject + logo BR + layout variety (2026-10-18)

**When:** user locks design-inject / logo chrome / secondary_copy / layout variety / smoke 6.

## User locks (HARD)

| # | Lock |
|---|------|
| **1 FULL DESIGN** | Inject **complete** active DESIGN.md into Designer LLM: fonts, sizes, **colors per text role**. Drives `html_layout` **and** bg mood (e.g. purple type → not black mud). **Positive** type-scale table only — remove «do not assume 64px» negatives. |
| **2 Motifs** | No forced Armenian motif laundry list (khachkar/apricot/pomegranate every post). Cultural taste **optional**, not mandatory checklist. Still ≥3 concrete scene elements. |
| **3 Logo chrome** | Enlarge icon; **bottom-RIGHT**; transparent bg. Dual-path raw `logoRef` for Puppeteer kept. **SUPERSEDED for Vernatun wordmark PNG (Phase 1 2026-10-18):** **no** separate club-name text — word is in PNG (`phase1-logo-wordmark-html.md`). Icon-only marks may still use name beside. |
| **4 Slide number** | Separate HTML block/slot; font/color/size = **body paragraph** tokens; pretty `N / M`. |
| **5 secondary_copy** | Scriptwriter: **2–3× richer** / more detailed than thin stubs. |
| **6 Font fit** | May **REDUCE** from DESIGN scale only if copy won't fit; never enlarge arbitrarily; document in overlay/`fontFit`. |
| **7 Deconstruct path** | Settings upload liked slide → deconstruct → DESIGN.md colors/fonts/sizes → FULL inject. Architect verifies path in `chain.md`. |
| **8 Layout variety** | `html_layout` NOT always top-left; bottom/right/center variety across adjacent slides. |
| **9 Smoke** | **ONE** **6-slide** carousel + pretty numbering (+ AD if still in chain). |

## Skills

- `carousel-json-contract` + `create-carousel-prompts-notes` § FULL DESIGN / logo chrome / variety
- `art-director/html-layout-variant-a.md` — brandChrome bottom-right, slideNumber, fontFit, variety
- `content-pipeline-agents` wave locks
- `ai-bridge` · `architect` verify deconstruct
- gap-playbook rows for this wave

## Chain

```text
Architect (spec + chain.md: FULL DESIGN inject, logo BR, slide-num slot, secondary_copy, fontFit, variety, deconstruct verify, smoke 6)
  → AI Bridge (overlays + Scriptwriter secondary_copy + motif optional + Designer FULL tokens)
  → Backend (composite chrome + tokens + reduce-only + variety validation)
  → Frontend (ONLY if Brand/deconstruct UI broken — else skip)
  → Tester (guards + smoke ONE×6 pretty N/M)
```

`shell_freeze` AppShell. `ticket_limit: full-queue` for this lock list. No paid MCP.
