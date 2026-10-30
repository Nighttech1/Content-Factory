# Architect spec — C-designer-panorama-slice (P0) + Scriptwriter hook

> Wave: `W-2026-10-13-designer-models-colors-hook`.  
> Chain: `memory/waves/W-2026-10-13-designer-models-colors-hook/chain.md`.  
> Skills: `workers/designer-carousel`, `carousel-json-contract`, `workers/script-writer`. Client **S45**.

## Goal

Усилить runtime prompts: Designer **(1)** compose horizontal master N×width×1350 **(2)** slice to N publish-ready 4:5 PNGs with seamless cross-cut elements **(3)** return sliced URLs to Create — **NEVER** panorama as only preview. Scriptwriter: captivating cover hook (curiosity gap, ≤6–8 words).

## Decision locks

| Lock | Decision |
|------|----------|
| **D-ps-1 Prompt pipeline** | `CREATE_CAROUSEL_DESIGNER_DRAW_OVERLAY` + describe: panorama-first → slice HARD verbatim. Bridges/elements cross cut lines. |
| **D-ps-2 Runtime draw** | Current HTML renderer already emits per-slide 1080×1350 — keep. If any path returns a single panorama URL as sole preview → **slice or reject** (error), never show panorama-only in Create. |
| **D-ps-3 Create UI** | `CreateCarouselPreview` already N frames 4:5 — assert/guard; no panorama strip as product preview. |
| **D-ps-4 Hook bar** | Scriptwriter overlay + `agent-defaults` carousel copywriter: curiosity gap; cover `primary_copy` ≤6–8 words; FAIL flat hooks («Лучший вечер», «Секрет успеха» без gap). |
| **D-ps-5 Budget** | Prompt/skill wire enough; optional ≤1 smoke image gen. No burn many gens. |
| **D-ps-6 Razbor freeze** | No `RazborModal.tsx`. |

## In scope

| Path | Owner |
|------|--------|
| `lib/studio/create-carousel-prompts.ts` | AI Bridge |
| `lib/mesh/agent-defaults.ts` (carousel copywriter + designer prompts) | AI Bridge |
| `app/api/studio/agent-chat/route.ts` (draw assert sliced) | Backend |
| `components/studio/workspace/CreateCarouselPreview.tsx` / modal | Frontend — verify/assert only |
| Optional: small assert helper near `mapSlidesToPreviewUrls` | Backend |

## Out of scope

- Full redesign of HTML renderer architecture
- RazborModal
- VPS / mass PNG artifacts

## Acceptance

Create after «Нарисовать»: preview = N×4:5 tiles. Scriptwriter JSON cover hook captivating. Client S45.
