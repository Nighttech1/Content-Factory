# Fixer — C-audit-04

**Cause:** `darkNotesKitHtml` / bento / generic kits used `escapeHtml` only → literal `*рецепта*` painted.

**Fix:** `sanitizeOnSlideMarkup` + `stripMarkdownEmphasis` in `carousel-html-renderer.ts`; all role kits use them (accent path for live-gen kits).

**Verify:** `npx tsx scripts/smoke-c-audit-04-05-06.ts` · PNG A slide 02/03 — no `*` glyphs.
