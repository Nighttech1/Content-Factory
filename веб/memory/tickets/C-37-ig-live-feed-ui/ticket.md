# C-37 — Studio UI: real IG carousels + metrics

| Field | Value |
|-------|-------|
| **ID** | `C-37` |
| **Priority** | P0 |
| **Wave** | W-2026-09-20-live-ig-carousels |
| **Status** | client: ПРИНЯТО С ЗАМЕЧАНИЯМИ (2026-09-20) |

## Expected

1. Колонка «Наши» в carousel-engine показывает посты с `mosarmclub` (превью + реальные цифры) когда feed live.
2. Колонка «Конкуренты» — реальные карусели конкурентов + реальные метрики.
3. «Разбор»: слайды из `FeedPost.slideUrls` (не picsum при live), цифры из feed.
4. Бейдж `feed-source-badge`: live vs demo-mock.
5. Без токена Studio не падает — остаётся прежний mock UX.
6. Graph только с сервера (C-36); браузер не скрейпит IG.

## Spec

- `architect-spec.md` · `chain.md` · `status.md` · `decisions.md`
- Next after C-36: **Frontend** → (Motion if needed) → Tester → Fixer → Deployer → Client

## Notes

Depends: C-36 feed contract. Motion только если ломается существующая анимация.
