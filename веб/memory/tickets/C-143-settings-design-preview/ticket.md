# C-143 — Settings Design preview panel

| Field | Value |
|-------|-------|
| **ID** | `C-143` |
| **Priority** | P1 |
| **Area** | settings / design.md |
| **Wave** | `W-2026-10-10-team-settings-perf` |
| **Status file** | pending |
| **[MKT]** | Справа видно содержимое design.md — панель двигается и меняет ширину |

## Repro

1. `/settings` → блок Дизайн.
2. Есть upload/filename, но **нет** правой панели превью markdown/design.md с open/close, drag, resize.

**URL:** `http://127.0.0.1:8787/settings`

## Expected

- Right **preview panel** for design.md content.
- Controls: **open/close** toggle, **draggable** position, **resizable** width.
- Persist pos/size (suggested keys `cf.settings.design-preview.*`).
- **Keep** upload (and filename display).
- Runs **after C-144** trim (path lock 3) so Settings shell is already without Scout/Agents/LLM clutter.

## Actual

Design block without interactive preview panel (C-85-era filename+upload).

## Notes for Orchestrator

Path 3 after C-144. Frontend. Skill rows that called this «C-145 preview» → **this ticket is C-143**.
