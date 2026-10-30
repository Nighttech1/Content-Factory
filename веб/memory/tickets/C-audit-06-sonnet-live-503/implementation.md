# Fixer — C-audit-06

**Cause:** primary `anthropic/claude-3.7-sonnet` 503/400 → wave silently used fixture without trying Sonnet-class fallback.

**Fix:** `callAggregatorChat({ fallbackModels: true })` chain; agent-chat Scriptwriter wired; decisions D-f-1…7; catalog + constants in `types/mesh-agent.ts`.

**Live note (this pass):** chain reached haiku; JSON missing `swipe_trigger`/caption → fixture for PNG render. Degrade path logged (`AUDIT_FIX_LIVE_DEGRADE`), not silent Haiku-first.
