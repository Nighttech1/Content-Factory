# 🧪 ТЕСТИРОВЩИК — phase2-vision-prompt

**Дата:** 2026-10-18  
**Волна:** `memory/waves/2026-10-18-phase2-vision-prompt/`  
**Guards:** `guards.md`

## Scope checked

1. `lib/studio/create-carousel-prompts.ts` → `buildVisionRefBackgroundImagePrompt`
2. `lib/studio/carousel-json-contract.ts` → `logo.textColor` + aliases
3. `lib/studio/carousel-layered-composite.ts` → Path A wordmark color + `BRAND_LOGO_SIZE_PX=200`
4. Smoke folder `docs/карусель тест/phase2-vision-prompt-smoke/` (6 PNG + HTML)
5. Deploy: `public/phase2-vision-prompt-smoke/*.png` → HTTP 200 on localhost:3000

## Results

| Check | Detail | Status |
|-------|--------|--------|
| IMAGE prompt no `#FF5A1F` | Function body + sample prompts | PASS |
| IMAGE prompt no `idx%2` orange/white | Function body | PASS |
| No Photoreal/CGI house lock | Only BAN line «do not force photoreal/CGI/Pixar…» / «house-like object» | PASS |
| `logo.textColor` schema | Zod + normalize aliases | PASS |
| Composite colors wordmark | `.brand-name { color: #FFFFFF\|#1A1A1A }` + `data-logo-text-color` | PASS |
| vision_ref smoke HTML Manrope | 0 hits on all 6 HTML | PASS |
| 6 PNG smoke | slide_01…06 present, sizes ~1.1–1.4 MB | PASS |
| Localhost serve | `/phase2-vision-prompt-smoke/slide_0{1,2,6}.png` → 200 | PASS |

## Notes for Client

- Prompt locks cannot be seen in PNG pixels; Client scores logo contrast / placement / non-Manrope look.
- Smoke placements: 01/06 top-left; 02–05 bottom-left; textColor white on orange plates, near-black on white plates.

## Verdict (Tester)

**GREEN** — all architect HARD locks G1–G8 PASS. Ready for Client Playwright @1440.
