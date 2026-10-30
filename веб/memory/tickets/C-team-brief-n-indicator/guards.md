# Guards — C-team-brief-n-indicator

Wave: `W-2026-10-13-drafts-design-team` · Scenario: **S43.5–7**

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | Team User label **«Задание»** (`user-brief-label` / aria-label). |
| G2 | Missing localStorage → `loadUserBrief` returns `""`; known `defaultCombatBrief` hydrate → `""`. |
| G3 | `composeTopicWithBrief(topic)` returns **trimmed topic only** (no `---\nБриф:` glue). |
| G4 | Agent-chat path sanitizes user turns (`stripCombatBriefGlue` / `sanitizeAgentChatTurnsForC155`); no brief in `messages[].role=user`. |
| G5 | `next.config.ts` → `devIndicators: false` (no bottom-left mystery **N**). |
| G6 | `resetUserBrief` → empty string (no baseline refill). |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-13-drafts-design-team.ts
# Expect: SMOKE_W_2026_10_13_DRAFTS_DESIGN_TEAM_OK
```

Live Client: **S43.5–7** — empty Задание; network raw user; no **N** on `/studio` + `/settings` @1440.

## Class of defect

Baseline combat lorem in Team field; brief glued into live chat user; Dev Indicator **N** still visible; reset refills combat seed.
