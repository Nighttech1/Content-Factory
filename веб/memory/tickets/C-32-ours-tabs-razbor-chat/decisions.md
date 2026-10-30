# Decisions — C-32

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | `N/A` (no git HEAD at spec) | Spec 2026-09-20 |
| **after_sha** | | После закрытия |

## Product / tech decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Drafts UX | Replace `DraftsPanel` dialog popup with **inline tabs** in Ours carousel | Ticket: not mini popup |
| Tabs | `Черновики` \| `Опубликовано` | Ticket |
| Default tab | `drafts` if `drafts.length > 0`, else `published` | Sensible empty-state |
| Analyst | Detailed breakdown only; **no** «предлагаю сценарий» | Ticket |
| `proposeScenario` | Not used in analyst bubbles; OK as internal Scriptwriter seed if needed | Keep cascade; change analyst copy only |
| Composer | `AgentChatComposer`: text + Web Speech API mic → transcript into input | Ticket |
| Speech fallback | Disable mic + hint when API missing | Cross-browser safety |
| Live LLM on send | Out of scope; mock ack OK | Wave scope |
| Cascade CTA | Keep Scriptwriter primary cascade action | C-30 invariant |
| Persistence | Existing zustand drafts; no DB | Safety |
| CapCut | Never from Ours tabs | C-31 |

## Role log

| Time | Role | Action | Result |
|------|------|--------|--------|
| 2026-09-20 | Architect | spec+chain+decisions | status → specced |
| 2026-09-20 | Backend | analyst analysis-only in `razbor-pipeline.ts`; `proposeScenario` kept for cascade seed | ok |
| 2026-09-20 | Frontend | Ours inline tabs; DraftsPanel no dialog; AgentChatComposer + RazborModal wire | ok |
| 2026-09-20 | Motion | tab pill `layoutId` + composer mic pulse / tap; reduced-motion safe | ok |
| 2026-09-20 | Orchestrator | smoke `scripts/smoke-c32-ours-tabs.ts`; status → implemented | ok |

## Rollback plan

1. Restore `DraftsPanel` popup + prior analyst messages with scenario pitch; remove `AgentChatComposer`.
2. `status.md` → `rolled_back`.
3. Keep ticket folder.
4. Localhost sync.
