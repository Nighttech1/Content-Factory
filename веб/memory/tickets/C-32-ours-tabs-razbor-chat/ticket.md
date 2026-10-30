# C-32 — Ours Published|Drafts tabs + analyst analysis-only + chat/voice

| Field | Value |
|-------|-------|
| **ID** | `C-32` |
| **Priority** | P0 |
| **Wave** | W-2026-09-20-agents-brand-settings |
| **Status** | specced |

## Expected

1. Next to «Черновики» add «Опубликовано». Switching tabs shows content **inline in the Ours panel** (same grid area) — **not** mini popup dialog.
2. Analyst in Razbor: **detailed carousel breakdown only** (enough for scriptwriter). **No** «предлагаю сценарий».
3. Every agent chat pane: text input + voice (Web Speech API or mic button → transcript into input) to send corrections to that agent.

## Notes

Зона: Frontend (+ Backend tweak razbor-pipeline). Keep C-30 cascade; change analyst copy only.
