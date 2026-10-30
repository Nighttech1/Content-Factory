# Carousel prompt-trace — weak-link diagnostic

**When:** user wants to find where quality dies Scriptwriter → Designer → Image; Client debugging of flat viral craft.

## HARD locks

| Lock | Value |
|------|-------|
| shell_freeze | true — no AppShell / Create **chrome** |
| draw_path | **in scope** (E2E diffusion / kill HTML overlay) |
| upgrade_only | prompts / skills / draw path / optional dump helper |
| no_pipeline_break | Scriptwriter → Designer → Draft |
| budget | **6 PNG** (2×3) default; useful-smoke **12 PNG** (3×4 rows 51/1/17) |
| secrets | never in `docs/карусель тест/` |
| Client | **S53** — HTML-overlay-primary = HARD REJECT; useful-smoke also **S56** |

## Skills

- **`carousel-prompt-trace`** (primary)
- `carousel-json-contract` Phase4 + `create-carousel-prompts-notes` (VIRAL CRAFT + **E2E DIFFUSION**)
- `ai-bridge` · `prompt-engineering` · `content-pipeline-agents`
- `plugins/trainer/e2e-image-carousel.md`

## Artifacts

- `docs/карусель тест/NN-scriptwriter-*.md`
- `docs/карусель тест/NN-designer-*.md` (per-slide image prompts **must** include typography)
- PNG under `generatedMedia/` (Architect wave folder)

## Chain hint

```
Trainer → Architect (spec: E2E diffusion; kill HTML-overlay-primary; dump path;
                      viral+E2E inject; budget 6; shell_freeze chrome; draw in scope)
  → AI Bridge (primary: overlays bake type into image prompts + MD logs)
  → Backend (draw path primary = image-2; deprecate HTML text ship path; optional TRACE dump)
  → Tester (guards: MD sections; image prompts w/ type; html_overlay none; 6 PNG)
  → Fixer → Deployer (localhost) → Client (S53 + traces + Playwright Create)
```

Frontend: **omit** for pure diagnostic; **include** when Architect chain has Settings rename/half-width (useful-smoke).

## Useful-smoke addendum

See `plugins/trainer/useful-smoke-51-1-17.md`: useful-only gid `902078005`; rows 51/1/17; MD timeline mandatory.
