# Клиент — C-118 / C-119

**Вердикт:** ПРИНЯТО  
**Дата:** 2026-10-09  
**Доказательство:** Playwright MCP @ 1440 (обязательный gate)

## Playwright evidence

| Page | URL | Badge | Stack | Metrics visible | Screenshot |
|------|-----|-------|-------|-----------------|------------|
| Карусели | `/studio/carousel-engine` | Онлайн · Instagram | flex-col, no inner 2-up | @username + лайки/просмотры | `client-carousel-pw.png` |
| Рилс | `/studio/custom-reels` | Онлайн · Instagram | flex-col | e.g. 283K просмотры / 3.3K лайки | `client-reels-pw.png` |

## Checks

- [x] Playwright navigate + evaluate + screenshot (не API-only)
- [x] Размеры: одна колонка карточек внутри Наши/Конкуренты
- [x] Live конкуренты (не демо): реальные @handles + метрики
- [x] Без нового Apify scrape

## Prod

Не согласовано (только localhost).
