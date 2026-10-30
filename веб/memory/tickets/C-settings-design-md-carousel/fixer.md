# Fixer — C-settings-design-md-carousel

**Date:** 2026-10-13  
**Role:** Фиксер

## P0 — missing names in agent-chat

**Report:** `Cannot find name 'designMarkdownFromRequestHeaders' | 'resolveServerActiveDesignMarkdown'` @ `app/api/studio/agent-chat/route.ts` ~315–317.

**Cause check:** Imports already present:

```ts
import {
  designMarkdownFromRequestHeaders,
  resolveActiveDesignMarkdown as resolveServerActiveDesignMarkdown,
} from "@/lib/settings/design-active-server";
```

Helpers exported from `lib/settings/design-active-server.ts` (`designMarkdownFromRequestHeaders`, `resolveActiveDesignMarkdown`). File exists; no missing-wire.

**Action:** None (already correct). Verified via `npx tsc --noEmit` — no errors on `agent-chat/route` or `design-active-server`.

## Verify

- Smoke: `npx tsx scripts/smoke-w-2026-10-13-drafts-design-team.ts` → `SMOKE_W_2026_10_13_DRAFTS_DESIGN_TEAM_OK`
