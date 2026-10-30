# C-e2e-live-trace — Live Armenian E2E + MD traces + 6 PNG

| Field | Value |
|-------|-------|
| **ID** | `C-e2e-live-trace` |
| **Priority** | P0 |
| **Area** | ai_chat / evidence |
| **Status file** | [status.md](status.md) |
| **Wave** | `2026-10-16-e2e-image-carousel` |

## Repro

1. After draw flip + prompt invert, need live proof for Client S53.  
2. Prior traces still show Phase3 NO-letters + HTML overlay.  
3. Budget 2×3=6 PNG; drafts must overwrite stable ids.

**URL:** localhost Create + `docs/карусель тест/` + drafts `draft-e2e-a/b`.

## Expected

Two Armenian carousels: viral Scriptwriter JSON → E2E draw; exact prompts with typography in MD; `html_overlay: none`; 6 PNG; drafts overwritten.

## Actual

(Pre-ticket) Phase3 traces / HTML-primary evidence.

## Notes for Orchestrator

Зона: **AI Bridge** last. Requires tickets 1+2 done. Then Tester → Deployer → Client S53.
