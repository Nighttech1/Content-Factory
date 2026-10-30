# S49 — files + how to verify

**Deployer:** deferred until QA sibling.

## Changed / new files

### Architect memory
- `memory/waves/W-2026-10-14-s49-feed-brandbook/chain.md`
- `memory/waves/W-2026-10-14-s49-feed-brandbook/summary.md`
- `memory/waves/W-2026-10-14-s49-feed-brandbook/files-and-verify.md`
- `memory/tickets/C-feed-s49-chrome/architect-spec.md`
- `memory/tickets/C-boards-s49-upload/architect-spec.md`
- `memory/tickets/C-team-brief-gone-design-brandbook/architect-spec.md`

### C-feed-s49-chrome
- `components/studio/workspace/FeedPostCard.tsx` — single plaque `name | Nк`; Ours no plaque; `showEngagement` / `showUsernamePlaque`
- `components/studio/workspace/VerticalPostCarousel.tsx` — segment toggle (not MultiButton); search same row; white Ours labels; `pb-3`
- `components/studio/StudioModuleWorkspace.tsx` — `pb-4`
- `components/studio/StudioPageClient.tsx` — `pb-4`
- `lib/studio/format-followers-ru.ts` — `resolveFollowersCountOrMock`

### C-boards-s49-upload
- `components/studio/workspace/BoardsPanel.tsx` — no helper; no upload row; cards without metrics/plaque
- `components/studio/workspace/VerticalPostCarousel.tsx` — «Загрузить» same row as search
- `lib/studio/boards-store.ts` — omit username/followers on board posts

### C-team-brief-gone-design-brandbook
- `components/mesh/v2/ReleaseTeamFlowchart.tsx` — brief textarea deleted
- `lib/mesh/agent-store.ts` — `loadUserBrief` always `""`; persist clears; no `userRequest` inject
- `lib/mesh/agent-defaults.ts` — `defaultCombatBrief` deprecated note
- `lib/studio/agent-chat-sanitize.ts` — harden strip prefixes
- `app/api/studio/agent-chat/route.ts` — S49 comment (sanitize)
- `components/settings/BrandbookBoard.tsx` — **new** Heritage brandbook board
- `components/settings/DesignLibraryCarousel.tsx` — brandbook primary + sliced secondary
- `lib/studio/ig-apify-scraper.ts` — map `followers` when actor provides
- `scripts/smoke-w-2026-10-13-drafts-design-team.ts` — S49 loadUserBrief assertion

## Verify each point

| # | Point | How |
|---|--------|-----|
| 1 | Competitor plaque `username \| 1564к` | Open `/studio/carousel-engine` → Competitors cards → one black chip `@name \| Nк` (`data-testid=feed-username-plaque` + `feed-followers-count` inside) |
| 2 | Toggle + search; Ours no plaque | Конкуренты\|Доски = segment like Published/Drafts (`competitors-boards-switch`); search right same row. Switch to Наши → **no** plaque on cards |
| 3 | Minimal bottom gap | Scroll competitors feed — small pad under last row (not huge empty band) |
| 4 | Boards «Загрузить» | Доски → button **Загрузить** same row as search; no «Локально · несколько кадров…»; board cards no engagement row |
| 5 | White Published/Drafts | Наши → «Опубликовано» «Черновики» + draft count = white text |
| 6 | Brief gone | `/studio/carousel-engine/mesh` → User node: **no** textarea (`user-brief-textarea` absent). Create chat user turns = raw topic only |
| 7 | Brandbook Design | Settings → Design → Embla slot shows beige brandbook (colors/Aa/buttons/bars/icons). Upload image «Создать из референса» → deconstruct → new brandbook slot; active still → Designer |

## Suggested smoke

```bash
npx tsx scripts/smoke-w-2026-10-13-drafts-design-team.ts
```
