# C-carousel-quality-etalon — AI Bridge implementation

**Wave:** `2026-10-16-design-razbor-quality` · **Role:** AI Bridge (+ Backend helpers)  
**Status:** prompts + etalon seed + live-gen script ready · **full 9 PNG = Deployer**

## Done

### D-q-1 / D-q-2 — Topic unlock

| File | Change |
|------|--------|
| `lib/mesh/agent-defaults.ts` | `COMBAT_USER_BRIEFS["carousel-engine"]`: audience = premium Armenian community **brand**; **HARD TOPIC = user only**; forbid coffee/jazz/club ritual as default; CTA-3 softened (TG without club-only topic) |
| `lib/studio/create-carousel-prompts.ts` | Paired invariants + Scriptwriter overlay: TOPIC HARD; cover PASS examples no longer coffee-first; Designer describe = tokens-only wording (`buildDesignTokensPayload`) |
| `lib/studio/prompt-packs/sprint9-carousel-pack.ts` | Few-shot block labeled **«style-only not topic»** + HARD topic = user |
| `lib/studio/agent-start-bundle.ts` | No code change — already injects `CREATE_CAROUSEL_PAIRED_INVARIANTS` + few-shot pack + `appendActiveDesignMdToDesignerPrompt` |

### D-tok leftovers — design tokens inject

Confirmed path:

1. Frontend Settings → active `DesignPresetFile`
2. `formatActiveDesignMdForPrompt` / `formatActivePresetCssVarsForPrompt` call **`buildDesignTokensPayload(preset)`** (colors · typography · textBlock · smallElement)
3. `appendActiveDesignMdToDesignerPrompt` used in `agent-start-bundle.ts` + `app/api/studio/agent-chat/route.ts` for Designer

No layout COVER/BODY/CTA kits in that payload.

### D-q-4 — Etalon folder

Seeded (copy, not regenerate):

```
generatedMedia/эталон карусели/
  README.md
  A-dark_notes/slide_01..03.png
  A-audit_html/slide_01..03.png
  B-bento_glass/slide_01..03.png
  C-audit_poster/slide_01..03.png
```

Sources: `wave-visual-deconstructor` + `wave-carousel-audit-fix`.

### D-q-3 / D-q-5 / D-q-6 — Live smoke script (prepared)

`scripts/live-gen-s52-armenian.ts`

- 3×3 = 9 PNG budget hard cap  
- Random themes from Armenian pool (Ереван ночь, алфавит, гранат, Татев, дудук, диаспора стол, Арагац, Севан) — **not coffee**  
- `CAROUSEL_HTML_FIRST=1` + `CAROUSEL_DRAW_SKIP_BG=0` + `kitAesthetic: cinematic_scene` → image API warranted  
- Model: `openai/gpt-5.4-image-2`  
- Overwrite drafts only: `draft-s52-etalon-a|b|c`  
- Artifacts: `generatedMedia/wave-s52-design-razbor/deliverables/{a,b,c}/` + `_png_budget.json`  
- Fails if `bgImageCalls < 1` (text-only forbidden)

## How to run (Deployer)

Prereqs: `.env` aggregator key, local API on `:3001` (drafts upsert).

```bash
npx tsx scripts/live-gen-s52-armenian.ts
# optional subset:
npx tsx scripts/live-gen-s52-armenian.ts --only=a
```

Report: `memory/waves/2026-10-16-design-razbor-quality/s52-live-gen-report.md`

## Client acceptance hooks

- Etalon folder exists (seeded)  
- After Deployer run: ≤9 PNG with images, Armenian themes, drafts overwritten  
- Grep: no coffee/club **product TOPIC LOCK** in COMBAT / Create overlays  

## Not done here

- Full live 9 PNG burn (Deployer owns)  
- `guards.md` (Tester after green)  
- Client Playwright verdict  
