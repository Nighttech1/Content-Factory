# Клиент — S52 Scout-only Apify

## Вердикт: ПРИНЯТО С ЗАМЕЧАНИЯМИ

### Playwright @1440

1. `http://localhost:3001/studio/carousel-engine` — колонка Конкуренты открыта (snapshot + screenshot). Feed GET = snapshot path (smoke: 0 Apify in ig-live-feed).
2. `…/mesh` → клик Скаут → вкладка «Разведка» открыта по умолчанию.
3. Видны: блок **«Авторазведка — фильтры и частота»** (просмотры, лайки, виральность, частота часов), кнопка **«Разведать»** снизу (`ref` + screenshot `s52-scout-razvedat.png`).
4. **Не** жали «Разведать» в UI-приёмке (избежать лишнего Apify после smoke POST verify).

### Замечание (P2)

- При деплой-проверке Backend один раз дернул `POST …/scout/run` для smoke endpoint — это ожидаемый Scout-path, не feed. Пользователю: пополнять Apify можно; feed open больше не списывает.

### C-*

- C-scout-apify-bind — guard OK
- C-scout-razvedat-ui — guard OK  
- C-competitors-snapshot — guard OK

### НЕ prod
