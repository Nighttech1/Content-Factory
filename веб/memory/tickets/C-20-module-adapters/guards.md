# Guards — C-20 Module adapters

Date: 2026-09-19  
Role: Tester → Fixer re-verify  
Result: **GREEN** (Fixer unblocked G7)

Executable smoke:
- `npx tsx scripts/smoke-c20-adapters.ts` → `SMOKE_OK`
- `npx tsx scripts/smoke-c20-isolation.ts` → `ISOLATION_OK`
- `python plugins/frontend/anti_slop_scan.py .` → `anti_slop_scan: OK` (prior Tester)

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | 4× `generateDraft` + `renderAsset` mock | GREEN | Smoke: carousel / aesthetic / cartoon / heygen all `mock=true`, non-empty elements+assets; heygen feedback `heygen=mock\|reason=HEYGEN_API_KEY_absent` |
| G2 | HeyGen without key → mock, no throw | GREEN | Smoke heygen-reels; gateway sole `process.env.HEYGEN_API_KEY` reader (`lib/ai/heygen-gateway.ts`); no key values in `src/modules/**` / `app/**` |
| G3 | `regenerateElement` isolates index | GREEN | Isolation smoke: target payload changes; siblings unchanged (carousel/cartoon/heygen target=1; aesthetic single element) |
| G4 | No secrets committed | GREEN | `.env.example` has `HEYGEN_API_KEY=` empty; grep modules/app: no real key literals; gateway sanitizes provider text |
| G5 | Studio Generate wires to API | GREEN | `lib/studio-store.ts` POSTs `/api/modules/${moduleId}/generate` body `{ topic, render: true }` |
| G6 | anti-slop | GREEN | `anti_slop_scan: OK` |
| G7 | Localhost `/studio` 200 + generate API | **GREEN (Fixer)** | Studio → `@/modules/manifests` (no registry/fs). `GET /studio` → **200**; `POST …/generate` → `ok:true` + render `mock:true`; smokes `SMOKE_OK` / `ISOLATION_OK` |

## Acceptance criteria map (architect-spec)

| AC | Verdict |
|----|---------|
| 1. Draft for M1–M4 on localhost without HeyGen/GPU | **GREEN** — adapters + Studio page unblocked (G1 + G7) |
| 2. `renderAsset` mock or real behind flag | GREEN (G1 smoke `mock:true`) |
| 3. `regenerateElement` changes one element only | GREEN (G3) |
| 4. No key → no app crash / no key in logs | **GREEN** — gateway mock (G2); no fs-in-client (G7) |
| 5. No secrets in git; `.env.example` placeholders | GREEN (G4) |

## Fixer note (G7 P0)

**Cause:** `brand-context.ts` (`node:fs`) ← adapters ← `registry.ts` ← `components/studio/modules.ts` ← client `ModuleSelectorGrid` → Next/Turbopack **500** on `/studio`.

**Fix:** Client-safe `src/modules/manifests.ts` (4× `*/manifest.ts` only). Studio imports manifests, not registry. Registry/adapters stay server. Barrel `_index.ts` does not re-export registry. Do **not** use `import "server-only"` — breaks `tsx` smokes outside Next bundler.

## Failures for Fixer

~~1. **P0 — client bundle imports Node `fs` via module adapters**~~ **CLOSED** — see Fixer note + G7 GREEN.

## Failures: none for AI Bridge prompts/gateway logic

Gateway mock-without-key path is correct in-process.

## Re-run

```bash
npx tsx scripts/smoke-c20-adapters.ts
npx tsx scripts/smoke-c20-isolation.ts
python plugins/frontend/anti_slop_scan.py .
curl -s -o NUL -w "%{http_code}" http://localhost:3000/studio
curl -s -X POST http://localhost:3000/api/modules/carousel-engine/generate -H "Content-Type: application/json" -d "{\"topic\":\"t\",\"render\":true}"
```

Expect: smokes OK; `/studio` **200**; generate JSON `ok:true` + `render.mock:true`.

## Mirror in Client skill

| C-20 | adapters mock / heygen no-key / regenerate isolate / Studio fs-leak | smoke-c20 | `scripts/smoke-c20-adapters.ts` + `scripts/smoke-c20-isolation.ts` + this file |
