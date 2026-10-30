# Decisions — C-49

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | N/A | Spec 2026-10-05 |
| **after_sha** | | После закрытия |

## Product / tech decisions (locked — wave)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| ModuleIdeaBar | Unmount from workspace | C-49 supersedes C-28 IdeaBar chrome |
| Topic UX | Competitors search → `fetchFeed(topic, "competitors")` | Keep C-40 topic refetch without top bar |
| Local filter | `title` contains, case-insensitive | Instant; no Backend `?q=` |
| Debounce | 400ms, trim ≥ 2 | Spec 350–500ms; Enter / clear immediate |
| Play | Per-card `playing`; no autoplay | Fake play if no `mediaUrl` |
| Subtitles | Not passed from workspace | Remove label banners |

## Role log

| Time | Role | Action | Result |
|------|------|--------|--------|
| 2026-10-05 | Architect | spec+chain | locked |
| 2026-10-05 | Frontend | chrome + search + play | chain Frontend [x] |

## Frontend notes

- `21st id=4586` · element=feed-play-overlay · motion=yes (centered round Play / Pause)
- `21st id=9541` · element=competitors-search · motion=yes (search/clear icon swap; Dark Luxury retoken)
- `ModuleIdeaBar.tsx` left on disk, unmounted only.
- Optional `FeedPost.mediaUrl` / `durationSec` — fixtures without media still OK (poster + fake play).

## Rollback plan

1. Re-mount `ModuleIdeaBar` + subtitle props in `StudioModuleWorkspace`.
2. Revert search chrome / play overlay in carousel + card.
3. `status.md` → `rolled_back`.
