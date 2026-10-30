# Status — C-26

| Field | Value |
|-------|-------|
| **Status** | deployed_localhost — Client **ПРИНЯТО** |
| **Wave** | W-2026-09-20-studio-workspace |
| **Updated** | 2026-09-20 |

## Frontend checklist

- [x] Inter removed from `app/layout.tsx`
- [x] `--font-ui` → Century Gothic stack in `app/globals.css`
- [x] `@font-face` local() for Century Gothic (400/700)
- [x] JetBrains Mono + Noto Sans Armenian unchanged
- [x] No color/layout changes
- [x] decisions.md: CSS-only / no woff documented

## Role checklist

- [x] Tester Done — `guards.md` + `scripts/smoke-c26-century-gothic.mjs` GREEN; Fixer N/A
- [x] Deployer Done — localhost `:3000`, `GET /studio` → 200; no VPS
- [x] Client — **ПРИНЯТО** (C-26 only; wave not согласовано)
