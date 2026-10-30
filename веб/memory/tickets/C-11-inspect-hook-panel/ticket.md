# C-11 — Media Inspector: hook / script / HeyGen panel

| Field | Value |
|-------|-------|
| **ID** | `C-11` |
| **Priority** | P0 |
| **Area** | studio_inspect |
| **Status file** | [status.md](status.md) |
| **Wave** | `W-2026-09-18-sprint4` |

## Repro

1. Right control panel on `/studio/inspect/:id` отсутствует.

## Expected (DEV_PLAN 4.2–4.3)

- `Virality Meter` (Hook Score e.g. 92/100).
- 3 alternative hook chips; click swaps active hook and updates UI (Client S2).
- Script editor with duration / word-density counters.
- HeyGen persona block: avatar model, emotion, voice, speech rate selects.
- Armenian text must render correctly (Noto Sans Armenian).

## Actual

Missing.

## Notes for Orchestrator

Depends on C-10 shell. Frontend; Motion for swap feedback. Toolbar Approve → C-12.
