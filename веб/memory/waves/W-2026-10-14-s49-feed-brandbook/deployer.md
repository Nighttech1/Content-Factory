# 🚀 ДЕПЛОЕР — W-2026-10-14-s49-feed-brandbook

**Target:** localhost only — **НЕ prod / НЕ VPS.**

## Status

- `npm run dev` (Next turbopack) уже running — PID терминал `689611`
- Smoke HTTP: `/studio/carousel-engine` → **200**
- `/settings` → **200** (ранее)
- Playwright Client @1440 прогнан на живом `http://127.0.0.1:3000`

## Actions this pass

1. Подтвердил живой localhost после QA/Fixer smokes.
2. Prod/VPS — **не трогали** (нет согласия пользователя + нет «без P0/P1 → release»).

## URLs for Client

- Feed: http://127.0.0.1:3000/studio/carousel-engine
- Team: http://127.0.0.1:3000/studio/carousel-engine/mesh
- Design: http://127.0.0.1:3000/settings → Дизайн
