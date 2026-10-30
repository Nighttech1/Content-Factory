# E2E diffusion carousel — kill HTML text overlay

> **SUPERSEDED (product ship path) 2026-10-17:** use **`plugins/trainer/carousel-layered-html-pipeline.md`** + Client **S57**. Product = image bg + HTML/CSS Puppeteer overlay. Keep this card only as **legacy** history / if a wave explicitly re-arms type-on-PNG.

**When (legacy):** user carte blanche — expensive Instagram carousels; image model paints **everything** including typography ON the PNG; kill «pretty photo + base text layer».

## HARD locks (legacy — not S57 ship)

| Lock | Value |
|------|-------|
| shell_freeze | true — AppShell / Create **chrome** only |
| draw_path | **IN SCOPE** — Backend + AI Bridge upgrade Designer draw |
| upgrade_only | prompts + draw path; no greenfield pipeline |
| no_pipeline_break | Scriptwriter → Designer → Draft |
| LLM→image inputs | scenario JSON + **approx** design colors/tokens **only** |
| primary paint | `openai/gpt-5.4-image-2` full slide (scene + type + CTA) |
| forbidden primary | Playwright / HTML text overlay |
| budget | **6 PNG** (2×3) |
| evidence | MD under `docs/карусель тест/` |
| Client | Legacy **S53**. Current product acceptance → **S57** layered HTML |

## Skills to upgrade / read

- `carousel-json-contract` § Phase4
- `create-carousel-prompts-notes` § E2E DIFFUSION
- `carousel-prompt-trace`
- `ai-bridge` · `content-pipeline-agents` · `prompt-engineering` § Phase4
- `client-scenarios` **S53** · `client.mdc` §19

## Chain hint

```
Trainer → Architect (spec: kill HTML-overlay-primary; image-2 full paint; inputs=JSON+colors;
                      budget 6; trace folder; shell_freeze chrome; draw path in scope)
  → AI Bridge (primary: Designer overlays = bake typography into image prompts;
               VIRAL CRAFT + E2E DIFFUSION inject; MD session logs)
  → Backend (draw path: primary = image API; deprecate HTML/Playwright text as ship path;
             optional CAROUSEL_PROMPT_TRACE dump)
  → Tester (guards: 6 PNG; traces have per-slide image prompts w/ type; html_overlay none;
            no HTML-primary success)
  → Fixer → Deployer (localhost) → Client (S53 + Playwright Create + read traces)
```

Frontend: **omit** (chrome freeze). Motion: omit unless Architect adds micro-polish only.

## Follow-on

**S54 bake-off / anchor_ref:** see `plugins/trainer/carousel-anchor-ref-bakeoff.md` — compare `e2e_diffusion` vs `anchor_ref_pipeline` vs etalon; budget **9 PNG**.
