# C-26 — Global Century Gothic typography

| Field | Value |
|-------|-------|
| **ID** | `C-26` |
| **Priority** | P1 |
| **Area** | design_system / typography |
| **Wave** | W-2026-09-20-studio-workspace |
| **Opened by** | Client — user request 2026-09-20 |
| **Status** | specced |

## Expected

All primary UI text uses **Century Gothic** (or closest licensed webfont fallback stack that renders as Century Gothic on Windows, with local/woff fallback). Mono labels may stay JetBrains Mono. Armenian support: keep Noto Sans Armenian in stack after Century Gothic for hy glyphs.

## Actual

App uses Inter as `--font-ui` (`app/layout.tsx`).

## Notes for Orchestrator

Зона: **Frontend**. Paths: `app/layout.tsx`, `app/globals.css`, optional `public/fonts/`. Guard: body/computed `--font-ui` includes Century Gothic (or documented local font family name).
