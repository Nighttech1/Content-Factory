### [C-65] CreateCarouselModal «Создать карусель»
- **Зона / Экран:** `/studio/carousel-engine` workspace chrome + новая модалка
- **Факт:** длинное описание модуля шумит; нет отдельного потока «создать карусель» (только Razbor с конкурента)
- **Ожидание:** скрыть long description на carousel workspace; кнопка **«Создать карусель»**; `CreateCarouselModal` — слева чат, справа 9:16 preview с L/R; **отдельно** от `RazborModal`
- **Приоритет:** P0
- **Скрин-улика:** S15 open Create → dual pane chat+preview
- **Зона:** Frontend | Motion
