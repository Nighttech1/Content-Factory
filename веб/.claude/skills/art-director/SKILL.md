---
name: art-director
description: >-
  Pipeline Art Director (Vernatun): after carousel PNG ready, brutal visual QA of
  the sequence — remarks OR approve. NO auto-remake. Use for Art Director agent,
  mesh/Team node, Variant A html_layout critique, S57 layered carousel review.
---

# Art Director — Content Factory (pipeline agent)

**Product agent**, not Cursor Client. Reviews **finished** carousel slides (layered HTML composite PNGs). Writes **remarks** or **approve**. Does **not** regenerate, remake, or call Designer/Image again.

Pair: `critique-checklist.md` · `html-layout-variant-a.md` · Client eyes = `web-visual-critic` (Studio chrome only) · taste bar = `taste-skill` bans + etalon `layered-html-refs-2026-10-17/` (#3).

## When

| Trigger | Action |
|---------|--------|
| Carousel draft ready (Scriptwriter → Designer → Puppeteer composite done) | AD runs once on final `slide_0N.png` (+ optional HTML layout JSON) |
| Mesh / Team UI | Show node **«Арт-директор»** + last verdict (approve / remarks text) |
| Smoke this wave | **ONE** carousel + **AD review text only** (no remake loop) |

## HARD locks

| Lock | Rule |
|------|------|
| **NO AUTO-REMAKE** | AD never triggers redraw / re-composite / new job. Remarks = human-readable text for operator / next manual wave |
| **After ready** | Only runs **after** carousel assets exist — not mid-Designer |
| **HITL** | Approve ≠ social publish. Publish still HITL / Publicist path |
| **upgrade_only** | Insert AD after Designer→Draft; do **not** rewrite Create chrome / AppShell |
| **shell_freeze** | Mesh/Team: add node + panel text only; no AppShell redesign |
| **S57 keep** | Layered HTML product path stays; AD critiques result, does not change render mode |
| **Gemini vision (wave 2026-10-18)** | Prefer **Gemini multimodal vision** (`ART_DIRECTOR_MODEL` / aggregator Gemini flash|pro) on final PNG sequence. Critique = **virality + design craft + content completeness** — not script/copy-only. S57 OCR-remake vision stays **OFF**; AD vision ≠ remake loop |
| **Thin slides** | Body slides with only ~2 thin sentences / empty value = **P1 `copy` or `hierarchy`** remark (concrete: add one proof/ritual beat or denser visual hierarchy) |
| **Budget** | Default smoke: **ONE** **6-slide** set + one AD text artifact. **HIGVEN-3 wave:** **ONE** **3-slide** set + AD text; still **NO remake**; ≤3 carousel attempts then STOP (`pipeline-practice-higven-3.md`) |

## Vision model (AI Bridge / Backend)

| Item | Rule |
|------|------|
| Default prefer | Gemini vision via Polza/aggregator (`gemini-flash` / `gemini-pro` or Architect-locked Gemini id) |
| Env | `ART_DIRECTOR_MODEL` overrides; do **not** silently fall back to text-only if PNGs exist |
| Input | Ordered final `slide_0N.png` as multimodal parts + short brief meta |
| Output | Same `approve` \| `remarks` JSON — never enqueue Designer |
| FAIL | Script-only review ignoring pixels; approve when logo missing / type ignores DESIGN scale / thin 2-sentence bodies |

## Role vs others

| Who | Does | Does not |
|-----|------|----------|
| **Designer** | Variant A: emit `html_layout` JSON; draw bg; composite | Final taste verdict |
| **Art Director** | Sequence QA → `approve` \| `remarks[]` | Auto-fix, paint, publish |
| **HITL Gate / Client** | Human acceptance of product | Replace AD text review |
| **Cursor Клиент** | Playwright Studio acceptance | Run as pipeline AD |

## Output contract (Architect → zod)

```json
{
  "verdict": "approve" | "remarks",
  "summary": "1–3 sentences RU",
  "remarks": [
    {
      "slideIndex": 1,
      "severity": "hook|continuity|hierarchy|safe_zone|contrast|cta|brand|slop|copy",
      "severity": "P0|P1|P2",
      "note": "concrete fix hint — not vague «make nicer»"
    }
  ],
  "sequenceNotes": "optional: story arc / swipe fatigue"
}
```

- `verdict: approve` → `remarks` empty or soft P2 only (Architect lock).
- Never invent missing slides. If assets missing → `remarks` with severity P0 `missing_assets`, no fake approve.

## Skill-first for implementers

1. This file + `critique-checklist.md`
2. Variant A layout: `html-layout-variant-a.md` + `carousel-json-contract` Phase 7
3. `plugins/trainer/variant-a-art-director.md`
4. `content-pipeline-agents` (order: … Designer → **Art Director** → Draft/HITL)
5. `taste-skill` anti-slop + etalon layered refs
6. Mesh: `xyflow-agent-mesh` (node id `art-director`)

## Public craft patterns (inspiration — not vendor lock)

Adapted from public Instagram / AI-carousel visual QA practice:

1. **Sequence over single slide** — hook promise → middle drift → CTA match
2. **Visual continuity** — type, color roles, margins, character/product identity
3. **Phone readability** — 2-second comprehension; one focal point
4. **Safe zones** — Meta-style top/bottom chrome clearance (factory: ≥120 / ≥160)
5. **CTA catalog integrity** — Vernatun 1–4 only; no painted `swipe_trigger`
6. **Brutal reject of slop** — purple gradient, Inter-default, flat label hook, clutter

Sources consulted for checklist shape (patterns only): AttentionClaw visual QA for AI carousels; IG carousel craft (hook → value beats → CTA); Canva “carousels worth swiping” sequence rhythm.

## Smoke (this wave)

1. Generate carousel(s) per wave: layout-copy = dual **6-slide** + layoutMap grammar + character path; else ONE×6. Numbering only if map allows; FULL DESIGN colors/sizes; logo/chrome per map or BR default.
2. Run AD with **Gemini vision** → review text to artifact + Team/mesh UI.
3. Assert AD covers **visual virality + design + content completeness** (logo chrome, slide-num slot, secondary_copy richness, not copy dump alone).
4. **Stop** — no remake even if remarks.
5. Orchestrator may attach VPS checklist at end (Trainer does not write VPS steps).

`🎨 **ART DIRECTOR:** [verdict · N remarks · gemini · no remake]`
