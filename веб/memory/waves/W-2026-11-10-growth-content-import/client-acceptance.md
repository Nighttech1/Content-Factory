# Клиент — независимая приёмка prepared content wave

Статус: **PENDING REAL BROWSER CI**. Код прочитан; ACCEPTED/согласовано не выдано. Production этой волны не проверялся и не менялся. Candidate source `930384d438de6f2117932276dc319f87dd2029db`; окончательный QA source и evidence ещё ожидаются.

## Подготовленные независимые сценарии

Собственный root CLI: `node scripts/growth-prepared-client-qa.mjs`, Node syntax PASS. Делит с Tester только безопасный TLS lifecycle; авторские assertions отдельные. Реальные размеры1440/412/390/360. Локальный Chromium ранее доказан socket EPERM, поэтому выполнение браузера будет настоящим CI against standalone bundle, не локальный выдуманный PASS.

- Анонимный fresh context не имеет write-capability; drag/select disabled. Session fixture через настоящий server API и Secure/HttpOnly/Strict cookie, без возврата удалённой owner UI.
- Удалены Update/auth/facteditor/runtimeGit/queue UI entries;4nav/6stages/один selected-stage weekly graph; пять синих bounded columns. Исторические24 остаются в store,6 synthetic active и18archive только в QAfixture. Все шесть stage filters сверяются с actual activeCardIds; пустые stages не получают AI-заглушки.
- Полный inline brief и требования,script/shots, конкретные source URLs, Scout report/department note/director date. Нет Gitbrieflinks. Не называем fixture настоящим research.
- Владелец меняет сценарий через actual modal; второй context видит результат, signed provenance неизменно, local adaptation явно видна и переживает reload. Valid synthetic publication открывает Fact; удаление proof скрывает карточку; countsunknown не становятся0.
- Все4format проходят все5колонок назад через доступный selector. Отдельно физический keyboardhandle Space/Arrow/Space commits и Escape не меняет revision; persisted result виден второму context. Реальные mouse/touch также проверяет отдельный Tester script, не выдаём selector за touch gesture.
- Исторический непустой weekly correction tooltip имеет QA source/version2. Modal/board/hero/graph PNG и DOM для личной визуальной проверки после CI. App errors/external requests запрещены; secrets редактируются из evidence.
- Legacy directorchat и Studio доступны без отправки/генерации/платных действий.

## Наблюдения по исходникам

UI active selection опирается на approved sidecar; immutable approval/provenance не заменяется обычным owner patch. Репозиторный canonical catalog сейчас **empty**. Это честная основа импорта, а не уже исследованные темы. Actual Scout→department→director execution/approval не выполнялись; source/role metadata тестируется синтетически. Новая real content delivery требует настоящих artifacts, review, QA и отдельно разрешённого release.

## Docs drift для Orchestrator/Architect

1. Исходный architect-spec требует отдельные login/fact actions; фактическое последнее поручение владельца, переданное Root/Frontend, удаляет эти entries полностью. Нужен явный amendment, чтобы тесты не возвращали отменённый UI.
2. Spec содержит paid-provider manual workflow/config/limits deliverable. Фактический AI report — публичный manual research toolkit без оплаченного execute/integration. Уточнить deferred scope; не обещать рабочую provider-интеграцию или fundedbudget.
3. Последний абзац aggregator report называет весь prepared import «спецификацией», хотя validated local importer/sidecar reconciler уже реализованы. Нужна точная граница: код готов к QA, настоящий research/approval и production import не выполнены.
4. STATE исторически отстаёт от предыдущего production workspace release; финальное root handoff должно явно назвать текущую production и новую prepared wave отдельно.

До фактического CI+личного осмотра PNG C не считаются закрытыми и UI не принят. На данный момент новых доказанных app C не открыто; документационные расхождения переданы Root, pending resolution.
