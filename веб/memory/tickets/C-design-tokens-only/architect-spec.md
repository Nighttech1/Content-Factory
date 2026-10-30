# C-design-tokens-only — Architect spec

**Priority:** P0 · Wave S52 · `2026-10-16-design-razbor-quality`  
**Covers:** Trainer 1.1–1.3 · Client **S52.A**

## Goal

Settings Design stops teaching layout. Cards and Designer agent payload carry **only** colors + typography / text-block / small-element tokens (Atelier Synth style). COVER/BODY/CTA sliced prefs, button kits, and Coffee Doctrine duplicates go away. Design toolbar sits **LEFT**, clear of the right Settings nav.

## Locks

| ID | Lock |
|----|------|
| **D-tok-1** | Remove `SlicedSlotPreview` from Settings Design (`DesignLibraryCarousel`, `QuickThemeTuner`). Create/feed N×4:5 sliced preview **out of scope** (keep). |
| **D-tok-2** | Embla primary = token brandbook: **colors · typography · text-block · small-element**. **No** button layout kits (`brandbook-buttons-card` Primary/Ghost/CTA chrome). |
| **D-tok-3** | Dedup Coffee Doctrine / HY twin: one slot per preset; strip Doctrine mock copy from Settings chrome. |
| **D-tok-4** | Toolbar **LEFT** (supersedes S51 top-right). Row: **референс** · **новый дизайн**+icon · eye **«код дизайн мд»**. No standalone preview-DESIGN.md button. |
| **D-tok-5** | Agent payload / `formatActiveDesignMdForPrompt` / designer agent-start: tokens JSON only — **no** COVER/BODY/CTA markup, no layout grid builder. LLM invents layout on draw. |
| **D-tok-6** | Cards stay **3:5** Heritage brandbook aspect (S50). Active neon perimeter / no context popup (S51) remain. |
| **shell_freeze** | No AppShell / left nav edits. |

## Paths

| Path | Owner |
|------|--------|
| `components/settings/DesignLibraryCarousel.tsx` | Frontend |
| `components/settings/BrandbookBoard.tsx` | Frontend |
| `components/settings/SlicedSlotPreview.tsx` | Frontend (stop importing from Settings; file may remain for Create if unused elsewhere — prefer dead-code only after grep) |
| `components/settings/QuickThemeTuner.tsx` | Frontend |
| `components/settings/SettingsShell.tsx` | Frontend (comment sync only; no nav rewrite) |
| `components/settings/DesignPreviewPanel.tsx` | Frontend (eye open path only) |
| `lib/settings/design-library.ts` | AI Bridge (`formatActiveDesignMdForPrompt`, seed dedupe) |
| `lib/studio/create-carousel-prompts.ts` | AI Bridge (designer inject wording) |
| `lib/studio/agent-start-bundle.ts` | AI Bridge (designer branch) |

## Non-goals

- Rewriting Create preview / feed carousel chrome  
- Changing Designer image model (`openai/gpt-5.4-image-2` stays draw default)  
- Mesh / Team / Boards chrome  

## Acceptance (Client S52.A)

1. `/settings` → Дизайн @1440 — **no** COVER/BODY/CTA sliced strip.  
2. Cards show **colors + typography / text-block / small-element** only (Atelier-style).  
3. **No** button kits; **no** duplicate Coffee Doctrine cards.  
4. Toolbar **left** — does not collide with right Settings nav.  
5. Optional: agent-start / describe payload = tokens only, no layout markup.

Hard REJECT: sliced role previews in Settings; button kits; duplicate Doctrine; toolbar under/over Settings nav; layout markup in prefs or agent payload.

## Guards (Tester)

- Assert DesignLibraryCarousel does not render `data-testid="sliced-slot-preview"`.  
- Assert toolbar `data-testid="design-library-toolbar"` is left-aligned / not `justify-end` colliding nav.  
- Assert `formatActiveDesignMdForPrompt` output lacks COVER/BODY/CTA role-kit markup; includes token fields.  
- Guard file: `memory/tickets/C-design-tokens-only/guards.md` after green.
