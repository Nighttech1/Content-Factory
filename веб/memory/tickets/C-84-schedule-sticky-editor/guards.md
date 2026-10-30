# Guards C-84

| ID | Check | Result |
|----|-------|--------|
| G1 | Single opaque `schedule-slot-popup` + Save/Cancel | PASS |
| G2 | Drag sets `setEditor(null)` — no popup spam | PASS |
| G3 | Rail has no format tags like 4:5 | PASS |
| G4 | Time/platform edits do not auto-close | PASS |

Smoke: `npx tsx scripts/smoke-c82-c87-ux-wave5.ts`
