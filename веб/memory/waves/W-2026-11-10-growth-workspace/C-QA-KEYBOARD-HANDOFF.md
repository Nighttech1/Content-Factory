# C-QA-KEYBOARD-HANDOFF — подтвердить реальный клавиатурный перенос

Статус: **CLOSED**. Приоритет: **P1 для приёмочного гейта**, не доказанный дефект приложения. Исполнитель: Тестировщик; application paths не переданы.

## Факт и доказательство

CI `42795772848`, source `c03f2d7dd9993cb12e31dcd00bcbd6740c82a1d8`: browser QA завершилась timeout на ожидании колонки task в строке55 `scripts/growth-workspace-browser-qa.mjs`. Клиент сама прочитала отчёт и осмотрела фактический `workspace-failure.png` из evidence: карточка уже в «Съёмке», поэтому native drag до этого визуально подтверждён; обратный keyboard перенос не подтверждён. `errors=[]`, external calls=[]; это не evidence падения приложения.

Последовательность теста: drag → ожидание data-column → focus native select → Home/Enter. Ожидание DOM-переноса не обязательно означает, что busy уже снят и disabled select получил focus; Home/Enter также не задаёт однозначный commit closed-select в этой среде.

## Ожидание и guard

Сохранить требование доступного **реального keyboard** переноса назад. Перед вводом клавиш дождаться enabled, проверить настоящий activeElement. Использовать нормальный протокол native select (например ArrowUp/Tab для перехода shooting→task), подтвердить реальный POST move_card и task в DOM **и server state**. Не заменять этот случай `selectOption` и не удалять keyboard критерий ради PASS.

При подтверждённом browser/product дефекте создать отдельный app C-* с воспроизводимыми фактами и передать Frontend. Этот C-* закрывается только после нового настоящего browser retest и просмотра доказательств Клиентом. До этого итоговая приёмка заблокирована.


## Закрытие — actual CI3

Клиент самостоятельно прочитала `workspace-browser-report.json` и `workspace-client-report.json` из artifact `13754528476`, run `42798584220`, source `a1f83cfe792a074fdae0fbac27d2051ad45a6385`. На1440/412/390/360 физические `ArrowUp`/`Tab` дали настоящий `move_card` POST200 и подтверждённый task; independent Client отдельно выполнил произвольные обратные переносы/desktop drag. Оба реальных browser отчёта PASS4width, errors/external пусты.

В CI2 обнаружено также преждевременное ожидание generic role=alert в lost-response тесте. QA ожидание уточнено до actual upstream commit+receipt, завершённого abort, конкретного application сообщения и enabled control. CI3 доказывает один durable Scout request после потерянного ответа и повтора с тем же UUID (`committedCount=1`, `afterCount=1`, `ambiguousScoutResponseReplayed=true`). Критерии не удалены, app bug не приписан harness. Future publication в Client QA теперь подтверждается конкретным POST400 `future_evidence_date` и alert внутри card dialog. Ожидаемые намеренные HTTP400/409 и aborted response выделены отдельно от ошибок приложения.
