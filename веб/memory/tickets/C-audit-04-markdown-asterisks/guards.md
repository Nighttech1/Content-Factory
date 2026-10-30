# Guards — C-audit-04 markdown asterisks

| ID | Assert |
|----|--------|
| G1 | `sanitizeOnSlideMarkup("*рецепта*")` → contains `<em` / no literal `*рецепта*` |
| G2 | `darkNotesKitHtml` body/cta paint via `sanitizeOnSlideMarkup` (not bare `escapeHtml` on primary) |
| G3 | Re-render A slides 2–3: zero `*` glyphs in headline HTML |
| G4 | `stripMarkdownEmphasis` used in `resolveCtaPillLabel` |

Smoke: `npx tsx scripts/smoke-c-audit-04-05-06.ts`
