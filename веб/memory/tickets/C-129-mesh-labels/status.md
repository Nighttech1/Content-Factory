# Status — C-129 mesh handoff labels

## Frontend [x] — 2026-10-10

**D2 HARD:**
- Solid: short RU ≤3 words in gutter above edge (`midX`, `min(srcY,tgtY) − 18`, translate −50%/−100%).
- Dashed Trainer→release: **no** EdgeLabelRenderer / mid-edge text; `handoff: ""` + `ariaLabel` → `title` / `aria-label` on BaseEdge.
- `data-testid="mesh-edge-handoff"` only on visible solid labels.
- `data-testid="mesh-edge"` + `data-dashed` on path wrapper.

**Short labels (seed):**
| Edge | Label |
|------|-------|
| User → … | `запрос` |
| Razbor → copywriter | `разбор` |
| copywriter → designer | `сценарий` |
| designer → publisher | `медиа` |
| scout → analyst | `фильтр постов` |
| analyst → trainer | `выводы` |
| Trainer → release (dashed) | _(none)_ · aria `skill patches` |

**Files:** `lib/mesh-seed.ts`, `components/mesh/edges/PulseEdge.tsx`  
**Next:** Motion (calm appear; offset ≠ done) → Tester bbox @1440.
