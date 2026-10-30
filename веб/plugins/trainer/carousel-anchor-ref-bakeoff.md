# Carousel pipeline bake-off — anchor_ref + compare folder

**When:** user asks which paint path is closest to etalon — OpenAI/GitHub **reference-first** carousel craft vs current Phase4 one-shot vs legacy HTML overlay.

## HARD locks

| Lock | Value |
|------|-------|
| shell_freeze | true — AppShell / Create **chrome** only |
| draw_path | **IN SCOPE** — Backend + AI Bridge |
| upgrade_only | prompts + draw path; no greenfield Create rewrite |
| no_pipeline_break | Scriptwriter → Designer → Draft |
| budget | **3 carousels × 3 slides = 9 PNG** new draw this wave |
| themes | **Armenian LANGUAGE** related (different topics per carousel) |
| etalon | `generatedMedia/эталон карусели/` (existing; not counted in gen budget) |
| Client | **S54 HARD** — side-by-side verdict (legacy bake-off waves). **Phase6 correct wave:** S54 bake-off **superseded** by **S55** / correct pipeline — do not block PASS for missing compare folder when wave is correct-pipeline |
| `@promts` | cycle intact → Client final word |

## Pipeline labels (folder / file names — HARD)

Every compare artifact **must** include the pipeline type in the path:

| Label | Meaning |
|-------|---------|
| `etalon` | Existing golden in `generatedMedia/эталон карусели/` (copy or symlink into compare root) |
| `e2e_diffusion` | Current Phase4 one-shot (each slide independent full paint) |
| `anchor_ref_pipeline` | **NEW** — cover first as visual anchor; slides 2–N match slide 1 via reference image |
| `html_overlay` | Prior HTML/Playwright text-on-bg (label if present; not a ship target) |

### Compare folder layout

```text
generatedMedia/compare-carousel-bakeoff/
  README.md                          # labels + themes + budget note
  etalon/{theme-slug}/slide_0N.png   # or pointer to эталон карусели/A-* …
  e2e_diffusion/{theme-slug}/slide_01.png … slide_03.png
  anchor_ref_pipeline/{theme-slug}/slide_01.png …
  html_overlay/{theme-slug}/…        # optional legacy
```

**Naming:** `{pipeline_label}/{armenian-language-theme-slug}/slide_0N.png`  
**Forbidden:** anonymous `deliverables/a` without pipeline label; mixing pipelines in one folder without label prefix.

## Anchor-ref pipeline (OpenAI / GitHub best practice)

Reference-first carousel craft (image edit / multi-image / “keep same world”):

1. **Reference-first** — before paint, bind style: active brandbook tokens + etalon craft class (marker/glass/editorial) as *style* refs (not topic lock).
2. **Cover = visual anchor** — generate **slide 1** first (full E2E diffusion: scene + typography ON PNG).
3. **Slides 2–N** — pass **cover PNG as reference image** into image API (edit / variations / multi-ref per Architect). Prompt: same palette, lighting, materials, type treatment, camera grammar as slide 1; only beat/copy/CTA change.
4. Still **Phase4 paint quality**: integrated type on PNG; **not** HTML overlay primary.
5. Consistency of the set > per-slide novelty.

## Skills to upgrade / read

- `carousel-json-contract` § Phase5 bake-off / anchor_ref
- `create-carousel-prompts-notes` § ANCHOR REF
- `prompt-engineering` § Phase5
- `ai-bridge` · `content-pipeline-agents`
- `client-scenarios` **S54** · `client.mdc` §20
- Etalon README + this card

## Chain hint

```
Trainer → Architect (spec: bake-off labels; compare folder; anchor_ref cover→ref;
                      budget 9; Armenian LANGUAGE topics; shell_freeze chrome;
                      draw path in scope; upgrade_only; no_pipeline_break)
  → AI Bridge (ANCHOR REF inject; cover-first prompts; still E2E DIFFUSION type-on-PNG)
  → Backend (draw: slide1 then 2–N with cover as reference; write compare-carousel-bakeoff/{label}/…)
  → Tester (guards: naming; ≤9 new PNG; 2–N visual match slide1; no HTML-primary)
  → Fixer → Deployer (localhost) → Client (S54 side-by-side vs etalon → pick closest)
```

Frontend: **omit**. Motion: omit.
