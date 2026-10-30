# Chain — 2026-10-18-phase2-vision-prompt

**ticket_limit:** `full-queue`  
**shell_freeze:** `true`  
**spec:** `architect-spec.md`

```text
Trainer ✅
  → Architect ✅ (architect-spec.md + chain.md · Path A logo)
  → AI Bridge (CLEAN-IMAGE-PROMPT.md dump → scrub buildVisionRef* + Designer logo.textColor)
  → Backend (same agent sequential: Zod textColor · composite Path A · fonts scrub · emblem)
  → Tester (guards: ban clean · textColor applied · no Manrope face)
  → smoke (docs/карусель тест/phase2-vision-prompt-smoke/)
  → Client (Playwright @1440 → «согласовано»; Orchestrator cycles)
```

## Path lock (no overlapping writers)

| Order | Role | Paths |
|-------|------|-------|
| 1 | AI Bridge | `lib/studio/create-carousel-prompts.ts` (+ notes if needed) |
| 2 | Backend | `carousel-json-contract.ts` → `carousel-layered-composite.ts` → `carousel-html-renderer.ts` → `brand-store.ts` (thin) |
| 3 | Tester/smoke | `scripts/*phase2*` · smoke folder · wave reports |

**Frontend / Motion:** omit  
**Phase 3:** omit  

## Overlap ban

Do not parallel AI Bridge + Backend on `create-carousel-prompts.ts` / composite same files. Sequential only.
