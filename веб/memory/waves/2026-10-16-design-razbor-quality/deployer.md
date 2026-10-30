# Deployer — 2026-10-16-design-razbor-quality (S52)

**Role:** Deployer  
**Gate:** localhost only (no VPS)  
**Status:** READY for Client

## Environment

| Check | Result |
|-------|--------|
| `cf-postgres` | Up (volumes preserved, no wipe) |
| Next.js | `npm run dev -- -p 3001` — Ready |
| `GET /studio` | **200** |
| Localhost URL | **http://localhost:3001/studio** |
| Env | `CAROUSEL_HTML_FIRST=1` · `CAROUSEL_DRAW_SKIP_BG=0` |
| Live-gen | `npx tsx scripts/live-gen-s52-armenian.ts` → **OK png=9** |

## LIVE gen budget

| Metric | Value |
|--------|-------|
| PNG | **9/9** (exact cap, no overspend) |
| bgImageCalls | **9** total (a=3, b=3, c=3) |
| Image model (runtime env) | `google/gemini-2.5-flash-image` (`CAROUSEL_IMAGE_MODEL`; script default would be `openai/gpt-5.4-image-2`) |
| Themes | Armenian pool — **not coffee**: `yerevan_night`, `duduk`, `aragats` |
| Drafts | overwrite only `draft-s52-etalon-a/b/c` — no duplicate spam |

## Drafts (overwrite)

| ID | Draft id | Title | Theme | PNG | bgImageCalls |
|----|----------|-------|-------|-----|--------------|
| A | `draft-s52-etalon-a` | S52 A: Ереван ночь | yerevan_night | 3/3 | 3 |
| B | `draft-s52-etalon-b` | S52 B: Дудук | duduk | 3/3 | 3 |
| C | `draft-s52-etalon-c` | S52 C: Арагац | aragats | 3/3 | 3 |

## 9 PNG paths (deliverables)

1. `generatedMedia/wave-s52-design-razbor/deliverables/a/slide_01.png`
2. `generatedMedia/wave-s52-design-razbor/deliverables/a/slide_02.png`
3. `generatedMedia/wave-s52-design-razbor/deliverables/a/slide_03.png`
4. `generatedMedia/wave-s52-design-razbor/deliverables/b/slide_01.png`
5. `generatedMedia/wave-s52-design-razbor/deliverables/b/slide_02.png`
6. `generatedMedia/wave-s52-design-razbor/deliverables/b/slide_03.png`
7. `generatedMedia/wave-s52-design-razbor/deliverables/c/slide_01.png`
8. `generatedMedia/wave-s52-design-razbor/deliverables/c/slide_02.png`
9. `generatedMedia/wave-s52-design-razbor/deliverables/c/slide_03.png`

Budget JSON: `generatedMedia/wave-s52-design-razbor/_png_budget.json` (`count: 9`, `ok: true`)  
Script report: `memory/waves/2026-10-16-design-razbor-quality/s52-live-gen-report.md`

## Etalon folder (Client compare)

**Present:** `generatedMedia/эталон карусели/`

- `A-dark_notes/` · `A-audit_html/` · `B-bento_glass/` · `C-audit_poster/` · `README.md`

Client compares live deliverables (wave-s52) vs this etalon side-by-side. No social publish.

## Client entry

- Studio: http://localhost:3001/studio  
- Drafts to open: `draft-s52-etalon-a`, `draft-s52-etalon-b`, `draft-s52-etalon-c`  
- Playwright S52.A–C @1440 per Client HARD GATE

`🚀 **ДЕПЛОЕР:** localhost:3001 Ready · 9 PNG · bgImageCalls=9 · drafts a/b/c overwrite · etalon folder OK`
