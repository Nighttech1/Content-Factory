# Клиент — C-121

**Вердикт:** ПРИНЯТО  
**Playwright @1440**

| Page | Aspect | Media ratio | Card H | 2-up | Portrait |
|------|--------|-------------|--------|------|----------|
| carousel-engine | 4/5 | 0.80 | ~453 | yes | yes |
| custom-reels | 9/16 | ~0.56 | tall | yes | yes |

Root cause fixed: Grid item `overflow-hidden` collapsed height → flat strips.
Evidence: `client-carousel.png`, `client-reels.png`
