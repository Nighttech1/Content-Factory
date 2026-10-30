# C-carousel-quality-etalon — Architect spec

**Priority:** P0 · Wave S52 · `2026-10-16-design-razbor-quality`  
**Covers:** Trainer §3 · Client **S52.C** · budget **9 PNG**

## Goal

Remove coffee/club **product theme lock** from prompts and live-gen (Vernatun brand OK; topic from user / random Armenian pool). Stand up etalon folder `generatedMedia/эталон карусели/` from prior user refs. Run LIVE **3×3 = 9 PNG** with real images (bg via `openai/gpt-5.4-image-2`), overwrite drafts (no spam). Client compares smoke vs etalon.

## Locks

| ID | Lock |
|----|------|
| **D-q-1** | Strip coffee/club-only theme lock from `COMBAT_USER_BRIEFS["carousel-engine"]`, Create overlays, live-gen scripts. Audience/tone may stay premium Vernatun; **topic not hardcoded** to coffee/club. CTA catalog 1–4 retained (CTA-3 may say TG/profile without forcing «клуб» as only topic). |
| **D-q-2** | Armenian **random theme pool** for smoke/live-gen: ritual / city / heritage / food / language / … rotating. Golden few-shots (dark_notes coffee etc.) = **craft examples only**. |
| **D-q-3** | Image backgrounds: **`openai/gpt-5.4-image-2`** (`DEFAULT_CAROUSEL_IMAGE_MODEL`). Slides must include images — **not** text-only smoke. HTML/CSS text craft OK on top of image bg (align with audit wave if that path is live). |
| **D-q-4** | Etalon: create **`generatedMedia/эталон карусели/`** — place prior user reference carousels (copy from user-provided refs / agreed wave artifacts). Short README for Client side-by-side. Optional twin under `memory/fixtures/эталон карусели/` if git-safe small samples needed. |
| **D-q-5** | Validation budget **≤9 PNG** (3 carousels × 3 slides). Overspend → stop-report. Artifacts under `generatedMedia/wave-design-razbor-quality/` (or script default) + `_png_budget.json`. |
| **D-q-6** | Draft persist: smoke/upsert uses **same upsert key** as C-razbor-draft-edit (`draft.id` + overwrite) — **no** spam Черновики. |
| **no social publish** | `true` |
| **shell_freeze** | `true` |

## Paths

| Path | Owner |
|------|--------|
| `lib/mesh/agent-defaults.ts` (COMBAT carousel + related theme strings) | AI Bridge |
| `lib/studio/create-carousel-prompts.ts` | AI Bridge |
| `lib/studio/prompt-packs/sprint9-carousel-pack.ts` | AI Bridge (only if theme lock leaks) |
| `scripts/live-gen-round1.ts` / `round2` / `round3` / `live-gen-audit-fix.ts` **or** new `scripts/live-gen-s52-armenian-9.ts` | AI Bridge |
| Drafts API / store (overwrite only) | Backend |
| `generatedMedia/эталон карусели/` | Deployer (+ AI Bridge place smoke outputs) |
| `types/mesh-agent.ts` / `lib/llm/aggregator-images.ts` | verify image model constant — change only if drift |

## Smoke plan (exact)

| Run | Topic source | Slides | PNGs | Draft id suggestion |
|-----|--------------|--------|------|---------------------|
| A | Armenian random #1 | 3 | 3 | `draft-s52-etalon-a` (overwrite) |
| B | Armenian random #2 | 3 | 3 | `draft-s52-etalon-b` |
| C | Armenian random #3 | 3 | 3 | `draft-s52-etalon-c` |
| **Total** | | | **9** | |

Each slide: visible image URL/path after draw. Client opens Черновики + etalon folder for visual compare.

## Non-goals

- Raising budget above 9  
- VPS / social publish  
- Settings Design UI (ticket 1) except tokens already feeding Designer  
- Soft-mock “success” without PNG files  

## Acceptance (Client S52.C)

1. Folder `generatedMedia/эталон карусели/` exists with reference carousels.  
2. Smoke ≤9 PNG, Armenian themes, **with images**.  
3. No coffee-only hardcoded product theme lock in prompts used for smoke.  
4. Side-by-side vs etalon — Client quality judgment (not API-only).

Hard REJECT: text-only slides; coffee-only theme lock; >9 PNG without stop; missing etalon folder.

## Guards (Tester)

- Grep/assert COMBAT + live-gen script topics are not coffee/club-only locks.  
- Budget file ≤9; three draft ids exist once each after double-run overwrite.  
- Guard file: `memory/tickets/C-carousel-quality-etalon/guards.md` after green.
