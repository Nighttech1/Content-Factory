# Guards — C-settings-design-md-carousel

Wave: `W-2026-10-13-drafts-design-team` · Scenario: **S43.2–4**

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | Library persist key `cf.settings.design.library.v1`, **cap ≤10**; active id `cf.settings.design.activeId`. |
| G2 | Embla/carousel UI: slide preview + chip **DESIGN.md**; select → active (`aria-selected` / active badge). |
| G3 | MD upload **blocks** at 10 (`appendDesignLibrarySlot` → null + toast). |
| G4 | CTA **«Добавить новый дизайн»** + file input smoke present in Settings Design. |
| G5 | `DesignPreviewPanel` Close / Esc: `open=false`, panel unmounted (`{open ? … : null}`); Close **outside** drag `setPointerCapture` target. |
| G6 | Designer / agent-start resolves **active** library markdown (`resolveActiveDesignMarkdown`). |
| G7 | No `@appica` dependency. |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-13-drafts-design-team.ts
# Expect: SMOKE_W_2026_10_13_DRAFTS_DESIGN_TEAM_OK
```

Live Client: **S43.2–4** — Embla ≤10, Close gone, CTA visible @1440.

## Class of defect

Library >10 without policy; Close swallowed by pointer capture; preview stuck open; Designer ignores activeId; `@appica` reintroduced.
