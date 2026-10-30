# Decisions — C-feed-card-chrome-s47

| Decision | Detail |
|----------|--------|
| 21st | `21st=unavailable` for this pass — surgical retokenize of existing FeedPostCard (Lucide engagement icons); no new block paste |
| Badge | Removed workspace `feed-source-badge` entirely (Онлайн/Демо) |
| Column titles | VerticalPostCarousel «Наши»/«Конкуренты» kept |
| Caption | Title, @username under card, topic tags removed |
| Plaque | Black `bg-black` + white CG; `data-testid=feed-username-plaque` |
| Engagement | On-photo bottom-center; `data-testid=feed-engagement-row`; optional comments/shares/saves when number |
| Fixtures | Default mock username + `saves` via `post()` so S47.A readable offline |
| CTAs | Razbor / Editor slim footer retained |