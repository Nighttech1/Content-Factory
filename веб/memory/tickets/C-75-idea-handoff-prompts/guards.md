# Guards C-75 — idea brief + галки + draft/calendar + prompts

| ID | Check | Result |
|----|-------|--------|
| G1 | `buildCarouselIdeaBrief` + `handoffPayload` «Карусель N:» | PASS |
| G2 | Tab ✓ only when `status === "handed"` | PASS |
| G3 | RazborPublisherPane: upsertDraft + upsertSlot | PASS |
| G4 | `packScopedKey` / content-type filter in Settings | PASS |
| G5 | Create: idea handoff + ✓ on handed | PASS |

Smoke: `npx tsx scripts/smoke-c73-c75-ux-wave3.ts`
