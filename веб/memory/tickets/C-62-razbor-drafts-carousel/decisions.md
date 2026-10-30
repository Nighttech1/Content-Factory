# Decisions — C-62

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | (wave start) | |
| **after_sha** | | |

## Role log

| Time | Role | Action | Result |
|------|------|--------|--------|
| 2026-10-06 | Architect | spec+chain | done |
| 2026-10-06 | Frontend | Razbor scrollbar hide, scriptwriter→designer CTA, toggle oursEnabled+white active, DraftsPanel cards L/R + slot label below card, VerticalPostCarousel props | done · 21st=unavailable |

## 21st

| id | element | motion |
|----|---------|--------|
| unavailable | hide-scrollbar chat (`.cf-hide-scrollbar`) | no |
| unavailable | draft carousel L/R on card | yes (framer-motion reuse FeedPostCard chrome) |

## Rollback plan

1. `git checkout -- components/studio/workspace/RazborModal.tsx components/studio/workspace/RazborCarouselToggle.tsx components/studio/workspace/DraftsPanel.tsx components/studio/workspace/VerticalPostCarousel.tsx app/globals.css`
2. Папку `memory/tickets/C-62-razbor-drafts-carousel/` не удалять.
