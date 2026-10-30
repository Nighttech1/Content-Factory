# Tester report — 2026-10-16-carousel-audit-fix

**Role:** Тестировщик  
**Date:** 2026-10-16  
**Wave:** carousel audit fix (C-audit-01 → 02 → 03)  
**LIVE 6-PNG gen:** **NOT run** — deferred to **Deployer** (`generatedMedia/wave-carousel-audit-fix/`, budget ≤6)

## Verdict per ticket

| Ticket | Result | Evidence |
|--------|--------|----------|
| **C-audit-01** models / routing | **PASS** | `smoke-c-audit-01-routing.ts` 23/23 + S45 models smoke 30/30 |
| **C-audit-02** prompts / CTA / few-shots | **PASS** | routing smoke COMBAT+few-shots + swipe-cta smoke 16/16 |
| **C-audit-03** HTML/CSS-first render | **PASS** | `smoke-c-audit-03-html-first.ts` fixture dry-run (3 PNG, `bgImageCalls=0`) |

**Wave static smokes:** **PASS**  
**Wave LIVE 6-PNG / Client Create:** pending Deployer → Client

## Guards written

| Path | Status |
|------|--------|
| `memory/tickets/C-audit-01-models/guards.md` | written |
| `memory/tickets/C-audit-02-prompts/guards.md` | written |
| `memory/tickets/C-audit-03-html-render/guards.md` | written |
| `.cursor/skills/client-review/regression-guards.md` | appended section **W-2026-10-16 carousel-audit-fix** |

## Commands run (all exit 0)

```bash
npx tsx scripts/smoke-c-audit-01-routing.ts
# → SMOKE_C_AUDIT_01_ROUTING_OK (23/23)

npx tsx scripts/smoke-w-2026-10-13-designer-models-colors-hook.ts
# → SMOKE_W_2026_10_13_DESIGNER_MODELS_COLORS_HOOK_OK (30/30)

npx tsx scripts/smoke-c-audit-03-html-first.ts
# → C-audit-03 HTML-first smoke PASS
# Artifacts: public/generated/carousel/c-audit-03-smoke/slide_01..03.png
# sizes ≈ 48k / 62k / 82k bytes; bgImageCalls=0; htmlFirst; renderMode=html_png

npx tsx scripts/smoke-w-2026-10-13-scriptwriter-swipe-cta.ts
# → SMOKE_W_2026_10_13_SCRIPTWRITER_SWIPE_CTA_OK (incl. COMBAT CTA 1–4)
```

New smoke added: `scripts/smoke-c-audit-01-routing.ts`.

## Assert highlights

### C-audit-01
- Scriptwriter default = `anthropic/claude-3.7-sonnet` (**≠** Haiku) + thinking/high  
- Designer seed: `model` = `openai/gpt-5.4-image-2`, `textModel` = Sonnet  
- `describe`/`chat`/`handoff` with image-2 → resolves to Sonnet; **draw** keeps image-2  
- No `gpt-4o-mini` fallback on describe  
- Razbor = `anthropic/claude-haiku-4.5` (uncoupled)

### C-audit-02
- COMBAT carousel has CTA catalog **1–4** keywords (комментарии / подписка / TG / лайк)  
- **Absent** «бронь стола» / «запись в сторис»  
- Pack + agent-start bundle embed **3** full JSON few-shots with `slides[]` (+ `primary_copy`)

### C-audit-03
- Fixture dark_notes → 3 HTML/CSS PNGs, `htmlFirst`, `bgImageCalls === 0`  
- Text kits skip optional bg; photo/cinematic warrant bg  
- Model id still image-2 when bg path would run

## For Deployer (next)

1. Refresh local API if needed.  
2. Run **LIVE** Create smoke: **2 carousels × 3 slides = 6 PNGs** into `generatedMedia/wave-carousel-audit-fix/` (do **not** exceed budget).  
3. Confirm drafts visible in Studio Ours → Черновики.  
4. Hand to Client for Playwright Create **S41+** @1440 (Scriptwriter → Designer → Draft).

## Out of Tester scope this pass

- Full LIVE LLM Scriptwriter → Designer → draw with live image API  
- Playwright Client acceptance  
- VPS / social publish  
- Fixer (no FAIL to fix)
