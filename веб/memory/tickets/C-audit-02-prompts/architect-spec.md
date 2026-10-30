# Architect spec — C-audit-02 prompts / Phase1 (P0)

> Wave: `memory/waves/2026-10-16-carousel-audit-fix/`  
> Chain: `memory/waves/2026-10-16-carousel-audit-fix/chain.md`  
> Depends on: **C-audit-01** (same `agent-defaults.ts` — sequential)  
> Audit contradictions: P3 (name-only few-shots), P4 (COMBAT CTA), P5 (dedupe)

## Goal

Clean Create agent-start for carousel: **one** paired-invariants surface, **CTA COMBAT = catalog 1–4**, and **full JSON few-shots** (not fixture names only) — so Sonnet sees the same combat rules Claude-chat users get, without 3–4× HARD spam.

## Decision locks

| ID | Decision |
|----|----------|
| **D-p-1 Dedupe** | `buildCreateCarouselAgentBundle` / `buildRulesBlock` / `assembleAgentStartSystemPrompt`: stop concatenating full `CREATE_*_OVERLAY` + full mesh `systemPrompt` + pack HARD. Structure: **paired invariants (once)** → short role overlay delta → skills/plugins/mcp → **full few-shot JSON**. Mesh seed prompt may stay as short “role identity”; runtime rules live in one place. |
| **D-p-2 Paired invariants** | Single block covering: user N = `requested_slide_count` = `slides.length`; cover hook curiosity ≤6–8; `swipe_trigger` META never painted; CTA **1–4** + ask if missing; concrete `visual_prompt` every slide; Razbor consume when present; no auto-handoff. |
| **D-p-3 CTA COMBAT sync** | In `COMBAT_USER_BRIEFS["carousel-engine"]` **replace** «CTA: бронь стола / запись в сторис / осмысленный финал под тему.» with catalog intents: **1** вопрос→комменты · **2** ещё→подписка · **3** клуб→TG в шапке · **4** лайк+сохранить. Mesh copywriterPrompt CTA line must match Create overlay (`create-carousel-prompts.ts`). |
| **D-p-4 Full few-shots** | `sprint9-carousel-pack.ts` (and/or agent-start inject): embed **2–3 complete** golden JSON bodies from `memory/fixtures/sprint9/carousel/*` (e.g. dark_notes_coffee, bento_glass_metrics, dark_editorial_night). **Forbidden:** name-only bullets as sole few-shot. Trim long caption/hashtags if token pressure; keep slides[] + hook + cta_type. |
| **D-p-5 Designer overlay Phase3 prep** | Wording: HTML/CSS + Playwright = primary; image-2 = optional background / zero text in diffusion. Do **not** claim panorama→slice as the only draw path (align with C-audit-03). |
| **D-p-6 upgrade_only** | Edit existing overlays/pack/bundle — no new pipeline agent. |
| **D-p-7 Schema** | JSON field names stay compatible with `carousel-json-contract` zod (no breaking rename). |

## In scope

| Path | Owner |
|------|--------|
| `lib/studio/agent-start-bundle.ts` | AI Bridge |
| `lib/studio/create-carousel-prompts.ts` | AI Bridge |
| `lib/studio/prompt-packs/sprint9-carousel-pack.ts` | AI Bridge |
| `lib/mesh/agent-defaults.ts` — COMBAT carousel + carousel PIPELINE_COPY prompts only | AI Bridge |
| Read-only: `memory/fixtures/sprint9/carousel/**` | AI Bridge |

## Out of scope

- Model routing → **C-audit-01**  
- `runCreateCarouselDraw` implementation → **C-audit-03**  
- UI chrome / «?» CTA hint redesign  
- custom-reels packs (unless shared helper breaks — Fixer only)  

## Invariants

1. `no_pipeline_break`: Scriptwriter → Designer → Draft.  
2. `shell_freeze`.  
3. Critic gate before Draft remains (do not weaken).  
4. swipe_trigger stays META-only.  

## Acceptance (Client language)

1. Opening Create Scriptwriter, system context no longer repeats the same HARD CTA/hook rules three times in a row (spot-check assembled system length / sections).  
2. Team combat brief / User combat for carousel mentions CTA **1–4**, not «бронь/сторис».  
3. Agent-start / pack contains **fenced JSON examples** with real `slides[]`, not only names like `dark_notes_coffee`.  
4. Designer describe overlay mentions HTML/CSS-first (not panorama-only promise).  

## Guards (Tester)

- String assert: COMBAT carousel CTA line matches catalog 1–4 keywords; **absent** «бронь стола» / «запись в сторис».  
- Pack/bundle contains at least two `{`…`slides`…`}` few-shot bodies (or fixture file contents embedded).  
- Smoke: Scriptwriter ask CTA without number → asks 1–4 (behavior).  

## Dependencies

Implement **after** C-audit-01 model seed edits on `agent-defaults.ts` land (or same AI Bridge pass if one writer — still order models → prompts inside the file).
