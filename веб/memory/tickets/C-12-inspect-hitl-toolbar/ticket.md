# C-12 — Media Inspector: HITL toolbar (reroll + approve)

| Field | Value |
|-------|-------|
| **ID** | `C-12` |
| **Priority** | P1 |
| **Area** | studio_inspect |
| **Status file** | [status.md](status.md) |
| **Wave** | `W-2026-09-18-sprint4` |

## Repro

1. Нет действий Approve / реролл на Inspector.

## Expected (DEV_PLAN 4.4)

- `[🔄 Перегенерировать слайд #N]` — updates only selected carousel slide (mock state + visible UI change).
- `[Approve & Schedule Post 🚀]` — confirmation + date pick; UI state becomes approved/scheduled (Client S2).
- No full pipeline restart.

## Actual

Missing.

## Notes for Orchestrator

After C-10/C-11. Frontend + Motion CTA. Client Hard REJECT if Approve does not change snapshot.
