# Guards — C-audit-05 empty / sparse frames

| ID | Assert |
|----|--------|
| G1 | `darkNotesKitHtml` body includes checklist ≥3 rows + `.value-card` + `.chalk-fill` |
| G2 | `cleanPosterKitHtml` includes `.poster-mid` + `.poster-beat` + brand mark (not headline+CTA only) |
| G3 | Re-run `scripts/live-gen-audit-fix.ts` overwrites same 6 PNGs under `generatedMedia/wave-carousel-audit-fix/deliverables/{a,b}/` — no 3rd carousel |
| G4 | shell_freeze — no AppShell/nav changes |

Smoke: `npx tsx scripts/smoke-c-audit-04-05-06.ts` + visual Client @1440
