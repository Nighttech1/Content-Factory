# Wave — Layout-copy refs + dual character paint (2026-10-18)

**When:** user locks 4-slide grid deconstruct → layout map + 3 DESIGN.md + dual 6-slide character smokes.

## User locks (HARD)

| # | Lock |
|---|------|
| **1 Scriptwriter MUCH wider** | Not 3 short sentences. Expand `secondary_copy` **significantly** beyond prior 2–3× / ≥120-char soft bar. Critic: body slides **≥220 chars AND ≥5 clauses** (or ≥4 short paragraphs). Cover/CTA may be shorter but still multi-beat. Thin 1–3 sentence stubs = **FAIL**. |
| **2 Grid deconstruct + layout map** | Settings Design: user uploads **4** reference slides (cover · mid · mid · CTA last). Deconstruct extracts **colors + fonts + sizes** AND **`layoutMap`**: text anchors per role, numbering style/position **or `absent`**, logo/CTA chrome positions. Generation **copies that layout grammar**; invents only our content + bg + CTA catalog. **No numbering on ref → no numbering in gen.** |
| **3 Three DESIGN.md** | From uploaded grids: **real-estate orange**, **luma coffee**, **omkopa teal**. Persist as library slots. **Primary** carousel = **orange RE** + Vernatun girl character sheet (4th image / Персонажи) as **conductor OVER bg** — **first + last slides mandatory**; she **speaks** the text (cut-out / HTML), **not** baked into scene. |
| **4 Dual 6-slide smokes** | From **other** useful-sheet topics (not only row 1): **(A)** character **painted IN** image by LLM with scene; **(B)** character drawn separately → **HTML overlay cutout**. Both **6 slides**. |
| **5 Etalon refs** | Save layout refs under `generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/` (grids + notes). Taste compare for Client/AD — invent OK, not pixel-clone. |

## Layout map schema (Architect locks names)

```json
{
  "layoutMap": {
    "slides": [
      {
        "role": "cover|body_slide|cta_slide",
        "textAnchor": { "x": "left|center|right", "y": "top|middle|bottom" },
        "numbering": { "present": false } ,
        "logoChrome": { "present": true, "slot": "bottom-right|top-right|top-left|absent" },
        "ctaChrome": { "present": false, "slot": "bottom|center|absent" }
      }
    ],
    "numberingGlobal": "absent|pretty_N_M|digits_only|corner_badge",
    "grammarNote": "short human note of repeated rhythm"
  }
}
```

If any ref slide has `numbering.present: false` and grid has no numbers → `numberingGlobal: "absent"` and composite **must omit** slide-number HTML.

## Dual character paths

| Path | Id | Rule |
|------|-----|------|
| **A In-scene** | `character_paint: in_image` | Image model may include character **in** `visual_prompt` / scene with environment. HTML type/CTA/logo still layered. No separate cutout required. |
| **B Conductor cutout** | `character_paint: overlay_cutout` | Bg = scene **without** character; character sheet → HTML/Puppeteer cutout **OVER** bg. Conductor speaks copy; not “in the photo story”. Primary orange RE = this path; **cover + cta_slide mandatory** conductor. |

## Skills

- `carousel-json-contract` + `create-carousel-prompts-notes` § LAYOUT MAP / MUCH WIDER SW / DUAL CHAR
- `workers/designer-carousel` § Grid deconstruct + layoutMap
- `art-director/html-layout-variant-a.md` — `layoutMap` drives anchors / numbering omit
- `content-pipeline-agents` · `ai-bridge` · `architect`
- gap-playbook rows for this wave

## Chain (user)

```text
Architect (spec + chain.md: layoutMap deconstruct, 3 DESIGN.md, dual char, wider SW, etalon folder, dual smoke×6)
  → AI Bridge (SW widen + layoutMap inject + dual paint prompts)
  → Backend (deconstruct 4-up, persist layoutMap, composite honor absent numbering, dual paint modes)
  → Tester (guards + dual smoke)
```

`shell_freeze` AppShell. Frontend **only if** 4-slide upload UI missing. `ticket_limit: full-queue`. No paid MCP.

## Supersedes (narrow)

- Prior design-inject «always pretty N/M» → **only when layoutMap.numbering present**.
- S52 «Designer invents layout freely» → **when layoutMap present, copy grammar**; still invent content/bg/CTA; no human Settings layout markup editor.
- Prior secondary_copy ≥120 / 2–3× → **MUCH wider** bar above.

## Superseded for style-copy experiment (2026-10-18-vision-style-copy)

When user locks **`styleCopyMode=vision_ref`**: primary path = **etalon image reference** + hard-copy prompt — **not** «fix layoutMap parser only». Product default character = **`in_image`** (cutout legacy). See `plugins/trainer/vision-style-copy.md`.
