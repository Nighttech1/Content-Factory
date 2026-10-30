# Guards — C-26 Century Gothic typography

Date: 2026-09-20  
Role: Tester  
Result: **GREEN** (source + live HTTP on `:3000`)

Executable smoke:
```bash
node scripts/smoke-c26-century-gothic.mjs
# with localhost:
BASE_URL=http://127.0.0.1:3000 node scripts/smoke-c26-century-gothic.mjs
```

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | `app/layout.tsx` has **no** `Inter`; keeps `JetBrains_Mono` + `Noto_Sans_Armenian` (`--font-mono-jb`, `--font-hy`) | GREEN | `SMOKE_C26_SOURCE_OK` |
| G2 | `app/globals.css`: `--font-ui` includes **Century Gothic**; `@font-face` + `local("Century Gothic")`; body uses `var(--font-ui)`; Inter not in `--font-ui` | GREEN | smoke asserts |
| G3 | Live `GET /studio` → 200; HTML does not load Inter from Google Fonts / next/font Inter markers | GREEN | `SMOKE_C26_LIVE_STUDIO_OK` |
| Fixer | N/A — all green | — | — |

## Acceptance criteria map

| AC | Verdict |
|----|---------|
| Inter removed from layout | GREEN |
| `--font-ui` / Century Gothic in globals.css | GREEN |
| Mono + Armenian stack intact | GREEN |
| Guard + regression mirror | GREEN |

## Mirror in Client skill

Дублируй строку в `.cursor\skills\client-review\regression-guards.md`

## Honesty

- Font file is **OS `local()`** only (no proprietary woff in repo). Machines without Century Gothic fall back to `AppleGothic` / `sans-serif`.
- Visual “looks like Century Gothic” on screen = Client eyes; smoke asserts wiring + no Inter.
