# Decisions — C-28

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Feed data | Mock GET `/api/studio/[moduleId]/feed?topic=` | No live social; no schema change |
| Response shape | `{ ours: FeedPost[], competitors: FeedPost[] }` | Ticket contract |
| Editor entry | Route `/studio/[moduleId]/edit/[draftId]` | Deep-link + Client scenarios; CapCut full-bleed |
| Editor fidelity | Premium shell (preview + timeline scrubber + layers) | Feel CapCut, not full NLE |
| HITL inspect | Keep `/studio/inspect/[id]` | Existing approve flow; reuse pieces as logic only |
| Generate | Reuse module generate + SSE from store | Already on localhost |
| DB | No Prisma / no migrate / no wipe | Max safety |
| Topic → draft empty | Show empty draft block after topic applied | Product §3–4 |
| Unknown moduleId on feed | 404 for non-canonical; `custom-*` → `{ ours:[], competitors:[] }` 200 | Backend implements consistently |
| Feed fixtures location | `lib/studio/feed-types.ts` + `lib/studio/feed-fixtures.ts` | Shared contract for FE; route imports only |
| Topic filter | Case-insensitive substring on `title` **or** any `topicTags` entry; empty topic → full default competitors | Architect contract; ours never filtered |
| custom-* pattern | `/^custom-[a-z0-9][a-z0-9-]*$/i` | Align with register ids; bare `custom-` → 404 |
| 21st UI | unavailable (daily get_component quota) | Fallback: GlassCard patterns + FloatingCommandBar idea patterns + Dark Luxury tokens; search ids noted: video-player 19339, display-cards 892 |
| Draft block placement | Below idea bar, above dual carousels | Product: idea → draft empty → feeds |
| Topic commit | Enter / «Применить» / preset click / Generate | Refetch competitors; show draft empty |
