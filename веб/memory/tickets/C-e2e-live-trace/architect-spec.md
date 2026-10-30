# Architect spec — C-e2e-live-trace (P0)

> Wave: `memory/waves/2026-10-16-e2e-image-carousel/`  
> Chain: wave `chain.md` step 4 · after **C-e2e-draw-integrated-text**  
> Skills: `carousel-prompt-trace` · Client **S53**  
> Templates: `docs/карусель тест/_templates/`

## Goal

Run **live** Scriptwriter (viral Dramaturgy JSON) → Designer E2E draw for **two Armenian topics**, overwrite drafts `draft-e2e-a` / `draft-e2e-b`, write full MD traces under `docs/карусель тест/`, and produce **exactly 6 PNG** — proving typography is in image prompts and `html_overlay: none`.

## Decision locks

| ID | Lock |
|----|------|
| **D-l-1 Script** | Extend `scripts/trace-carousel-session.ts` (preferred) **or** add thin `scripts/live-gen-e2e-diffusion.ts` that reuses assemble + `runCreateCarouselDraw` — **one** primary runner. Flip env: E2E ON, do **not** force `CAROUSEL_HTML_FIRST=1`. |
| **D-l-2 Env** | `CAROUSEL_E2E_TEXT_IN_IMAGE=1`, `CAROUSEL_PROMPT_TRACE=1`, `CAROUSEL_DRAW_SKIP_BG=0`. |
| **D-l-3 Topics** | Two Armenian user-like briefs ≠ coffee product lock (examples: alphabet/heritage; Sevan / Yerevan evening). N=3 slides each. CTA from catalog 1–4. |
| **D-l-4 Drafts** | Overwrite **only** `draft-e2e-a`, `draft-e2e-b` — no spam Черновики. |
| **D-l-5 MD** | Scriptwriter sessions + Designer sessions from templates; Designer §3 = **EXACT** image prompts **including** headline/body/CTA; §4 `html_overlay: none`; `Paint path: e2e_diffusion`. |
| **D-l-6 PNG** | ≤6 under `generatedMedia/wave-e2e-image-carousel/` (+ public carousel paths). Overspend → stop-report. |
| **D-l-7 FAIL conditions** | `image_llm: skipped` as success; prompts still contain `ABSOLUTELY NO readable text`; `html_overlay` not none while claiming PASS; HTML-primary `renderMode`. |
| **D-l-8 Scriptwriter** | Still viral JSON via same Create assemble path (VIRAL CRAFT). Designer = integrated-text draw only. |
| **D-l-9 Secrets** | No API keys / Authorization / DATABASE_URL in MD. |
| **D-l-10 shell_freeze** | No Create chrome edits. |
| **D-l-11 README** | Update `docs/карусель тест/README.md` index: files, draft ids, PNG paths, Phase4 / S53 note. |

## Exact files AI Bridge may edit

| Path | Action |
|------|--------|
| `scripts/trace-carousel-session.ts` (or new live-e2e sibling) | E2E env, draft ids, MD/PNG paths |
| `docs/карусель тест/*.md` | Write session logs + README index |
| `generatedMedia/wave-e2e-image-carousel/**` | ≤6 PNG |
| Drafts API upsert | Via existing localhost API only |

## MUST NOT

- Re-flip draw logic in renderer (ticket 2 owns)  
- Rewrite Scriptwriter/Designer overlay constants (ticket 1 owns) except script env  
- Raise budget above 6  
- Social publish / VPS  
- Touch AppShell / Create chrome  

## Smoke plan

| Run | Draft id | Slides | PNGs | MD |
|-----|----------|--------|------|-----|
| A | `draft-e2e-a` | 3 | 3 | `01-scriptwriter-<slug-a>.md` + `02-designer-<slug-a>.md` (or next free index) |
| B | `draft-e2e-b` | 3 | 3 | pair for B |
| **Total** | | | **6** | |

Filenames: reuse naming scheme under `docs/карусель тест/`; do not delete prior audit traces — add/overwrite Phase4 session files clearly labeled (e.g. `05-…` / `06-…` or replace README pointers to e2e sessions).

## Acceptance

- [ ] Two Scriptwriter MDs with full system/user/reply/final JSON  
- [ ] Two Designer MDs: §3 prompts include copy text; §4 `html_overlay: none`; paint path `e2e_diffusion`  
- [ ] 6 PNG on disk; wave total ≤6  
- [ ] Drafts `draft-e2e-a/b` overwritten  
- [ ] README indexed for Client  
- [ ] Create pipeline shape unchanged  

Hard REJECT (S53): HTML-overlay-primary still shown as success; NO-letters prompts; missing traces; >6 PNG without stop.

## Guards (Tester)

- PNG count ≤6  
- Grep Designer MD prompts: contain primary_copy fragment; lack `ABSOLUTELY NO readable text`  
- `html_overlay: none` present  
- Guard: `memory/tickets/C-e2e-live-trace/guards.md`

## Skills

`carousel-prompt-trace` · `ai-bridge` · `carousel-json-contract` § Phase4 · `client-scenarios` **S53** · `content-pipeline-agents`
