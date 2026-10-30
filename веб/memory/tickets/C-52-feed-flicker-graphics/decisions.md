# Frontend decisions — C-52

- 21st id=4586 · element=FeedPostCard Play overlay · motion=yes · action=reuse (hide when `shouldShowFeedPlay` false; no new brick)
- 21st=reuse · element=VerticalPostCarousel skeletons · motion=yes · first-empty-load only; refetch keeps cards + `data-testid="feed-refetching"`
- Live IG: `shares` omitted in `ig-live-feed` (unchanged); mock CORE fixtures fill shares
