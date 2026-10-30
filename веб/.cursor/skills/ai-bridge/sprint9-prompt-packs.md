# Sprint 9 — Prompt packs + critic (C-s9-08)

**Code packs (live inject):**

| Pack | Module | Path |
|------|--------|------|
| Carousel Scriptwriter | `carousel-engine` | `lib/studio/prompt-packs/sprint9-carousel-pack.ts` |
| Reels Scriptwriter | `custom-reels` | `lib/studio/prompt-packs/sprint9-reels-pack.ts` |

**Critics (gate before Draft — not mesh agents):**

| Critic | Path |
|--------|------|
| Carousel | `lib/studio/carousel-quality-critic.ts` |
| Reels | `lib/studio/reels-quality-critic.ts` |

**Wire:**

- Agent-start Create: `lib/studio/agent-start-bundle.ts` (few-shot + critic instructions)
- Live chat: `app/api/studio/agent-chat/route.ts` (STRICT parse + critic on JSON replies / draw)

**Goldens:** `memory/fixtures/sprint9/carousel/**`, `memory/fixtures/sprint9/reels/**`

**Locks:** upgrade_only · no_pipeline_break · shell_freeze · no social publish · no soft-mock success.

**Audit 2026-10-16 add-ons:**

| Item | Rule |
|------|------|
| Dedupe | One HARD block in agent-start — no overlay×mesh×pack triple |
| Few-shots | Full JSON bodies from `memory/fixtures/sprint9/carousel/**` |
| CTA | COMBAT brief = catalog 1–4 |
| Models | Scriptwriter Sonnet; Designer describe Sonnet; draw image-2 |
| Phase4 | E2E diffusion prompts (type ON image); HTML overlay **not** primary (**S53**) |
| Budget | Smoke ≤6 PNG (2×3) |
