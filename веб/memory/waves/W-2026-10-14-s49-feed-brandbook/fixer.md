# 🔧 ФИКСЕР — W-2026-10-14-s49-feed-brandbook

**Scope:** red smoke only (не архитектура).

## Что чинили

Устаревшие static-ассерты в `scripts/smoke-w-2026-10-13-drafts-design-team.ts`:
- искали label «Задание» + `if (raw == null) return ""` — после S49 brief DELETE это ложные FAIL.

## Fix

- Ассерты → S49: нет `user-brief-textarea` / «Задание»; `loadUserBrief` always `""`; `resetUserBrief` → `userBrief: ""`.
- Добавлен `scripts/smoke-w-2026-10-14-s49-feed-brandbook.ts` (8 checks).

## Rerun

`SMOKE_W_2026_10_13_DRAFTS_DESIGN_TEAM_OK`  
`SMOKE_W_2026_10_14_S49_FEED_BRANDBOOK_OK`

Product UI не меняли — Playwright уже зелёный.
