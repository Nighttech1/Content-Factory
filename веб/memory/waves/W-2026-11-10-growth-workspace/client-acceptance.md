# Независимая приёмка Клиента — growth workspace

Вердикт: **INTERNAL ACCEPTED — код и QA preview**. Все C закрыты до передачи владельцу. Согласование владельца отдельно; production этой волны не выполнялся.

## Идентичность доказательств

- Actual GitHub Actions run `42798584220`; gate/qa SUCCESS, deploy SKIPPED.
- Source `a1f83cfe792a074fdae0fbac27d2051ad45a6385`; QA marker `dc01033e837309f2196b9abdc5be6fc974d6cf6f`.
- Evidence artifact `13754528476`; tested app artifact `13754898158`.
- `workspace-client-report.json`: passed=true,1440/412/390/360, errors=[], blockedExternal=[]; `workspace-browser-report.json`: status=passed, те же4width, errors=[], external=[]. Намеренные negative-case HTTP400/409 и transport abort учтены отдельно.
- Реальный standalone bundle, изолированное временное runtime хранилище, HTTPS/session/CSRF. Локального Chromium PASS не заявляю.

## Принятые сценарии

| Требование | Реальное доказательство |
|---|---|
| Компактный workspace,4nav,6stages,24карточки | Client браузер/API на4width: точные nav/stage IDs, отсутствие прежних tabs/globalblocks; все24V-ID сохранены, фильтрация этапа точная |
| Общая5колоночная доска и обратные переносы | Carousel/article проходят все колонки туда/назад; desktop native drag; Tester physical ArrowUp/Tab→POST200→DOM+server task на4width |
| Ограниченная доска и доступная последняя карточка | Client geometry634/534px,5equalcolumns620/520px, внутренний scroll, graphgap30/22px; Enter открывает последнюю карточку на4width, no document overflow |
| Общие факты и неизвестные значения | Реальный owner UI: Cancel не меняет state; Save→reload→второй browser context; blank остаётся null, измеренный0 виден как0; stale form не перезаписывает concurrent save |
| Карточка и честный Факт | Script edit виден после server save во втором контексте; unsafe URL/future date отвергнуты; valid synthetic publication появляется в Факте, удаление proof убирает карточку; колонка Выпуск не создаёт proof |
| Только ручной Scout | Reload ничего не ставит в очередь; кнопка создаёт ровно1 queued receipt; нет GitSHA/фальшивой отправки/разведки. Потеря ответа+sameUUID повтор не дублирует запрос |
| Один недельный график выбранного этапа | Actual seeded historical data; correction tooltip показывает10,версию2,QA source; null — gap, неизвестная серия не рисует вымышленные значения |
| Сохранённые разделы/защита | Legacy marketing chat и Studio доступны без отправок; forged client OWNER отклонён, реальная Secure HttpOnly Strict сессия; секрет не попадает в storage/evidence |

Клиент лично прочитала оба JSON и свой DOM360. Визуально просмотрены desktop board/modal, mobile360 board/lastcard/modal,390modal,412header и correctiontooltip: `workspace-client-board-1440.png`, `workspace-client-card-1440.png`, `workspace-board-360.png`, `workspace-client-column-scroll-360.png`, `workspace-client-card-360.png`, `workspace-card-390.png`, `workspace-client-hero-412.png`, `workspace-client-weekly-412.png`. Текст и controls читаемы, график непосредственно под доской. Отдельного PNG fact editor в артефакте нет; его Save/Cancel/persistence подтверждены реальным независимым browser сценарным исполнением, не отдельной визуальной иллюстрацией редактора.

## Тикеты и границы

`C-QA-KEYBOARD-HANDOFF` CLOSED после реального4width keyboard/transport retest; `C-UX-KANBAN-HEIGHT` CLOSED после фикса и независимой geometry/visual проверки. Открытых C нет. Ранние провалы CI1/CI2 не выданы за принятие; подробности в tickets/qa-attempts.

Это приёмка code/изолированного preview. Production/VPS этой волны не менялся и не проверялся. Runtime Git credentials/config и реальная доставка commit в GitHub не испытаны; в fixture Git намеренно disabled, UI честно говорит об этом. Настоящий Scout/trend search/LLM/платный API не вызывались. Moscow weekly cutoff/catchup/correction и Git/CAS отказные режимы покрыты отдельными серверными проверками Тестировщика; браузер доказывает отображение уже подготовленных QA snapshots, а не ожидание реального воскресного scheduler. Реальная scheduler конфигурация VPS здесь не подтверждается. Synthetic counts/scripts/publication proof/QA history принадлежат только изолированному временному runtime и не являются данными клуба.
