# QA / release journal

Ветка: codex/director-chatgpt-transfer. Production target: content.vernatunspeakclub.com. Разрешение владельца есть; release marker ещё не создан.

1. Source `392cebd`, QA [42675849920](https://github.com/Nighttech1/Content-Factory/actions/runs/42675849920): install/typecheck/model guards прошли, production build остановился на ESLint. Исправлены внутренние ссылки через Next Link и три inherited prefer-const; правила не отключались.
2. Source `85f2563`, QA [42676728164](https://github.com/Nighttech1/Content-Factory/actions/runs/42676728164): штатный production build и packaging PASS. Основной настоящий browser scenario PASS на1440/390/360, включая план24/факт0, навигацию и сохранённую историю чата. Непустая изолированная fixture PASS на1440/390; на360 обнаружено горизонтальное переполнение. Evidence artifact13702085077 скачан и осмотрен root: hero1440 и nonempty390. JavaScript errors отсутствуют. Release заблокирован этим дефектом.
3. Исправление: tooltip графика наследовал nowrap; добавлены normal wrapping/word break и адаптивная ширина внутри компонента. Guard overflow сохранён; fixture при ошибке сохраняет screenshot и DOM bounds. При редакционной проверке также исправлено поле продукта первого REL-01: «Разговорные встречи»; бриф и проекция синхронизированы, revision growth-v2-20261109-02. Все24 product/title/date mappings проверены,31modelguards и20independent снова PASS. Следующий QA проверит эти изменения.

Факт до успешного release: VPS не изменён. Synthetic fixture никогда не записывалась в production dataset. Ничего не публиковалось, платные API не вызывались. Успех CI, осмотр скриншотов, deployment и приёмка владельцем — отдельные состояния.

## Gate перед VPS — PASS

Source7de8d1c2407df829f06de1c84f60921c883f63bf; QA trigger efa747e3072f885af365fb44905c8cc8abd60311. [Run42677870881](https://github.com/Nighttech1/Content-Factory/actions/runs/42677870881) completed/success: cleaninstall/fulltsc/31guards/штатный Turbopack production build/package, defaultbrowser и nonemptyfixture на1440/390/360. Buildartifact13702100156, evidence13701815874. Независимая Тестировщица проверила обаJSON: errors[], все3width passed, documentWidth=bodyWidth=viewportWidth и offending[]. Root скачала и визуально осмотрела hero1440 и nonempty360; tooltip исправлен, поля продукта синхронизированы. Приёмка владельца ещё открыта.

После QA изменён только rollout workflow: read-only проверка свободного места перед SCP/backup/stop, threshold2×oldapp+bundle+256МиБ, YAML/bash/mock capacity checks PASS. Runtime app code и проверенный bundle не изменялись; выкладываем именно artifact13702100156, а не новую сборку. Это изменение сценария доставки не является app rebuild.

## Попытка VPS — остановлена до изменений

[Release42678794724](https://github.com/Nighttech1/Content-Factory/actions/runs/42678794724), marker7985a345: gate и identity artifact прошли. Первый read-only SSH disk preflight завершился `Connection timed out`, порт22, exit255. До remote mkdir/SCP/backup/PM2stop выполнение не дошло; никакой server backup или rollback не выдаётся за выполненный. Работающий сайт проверен root браузером: прежний /marketing доступен, нового раздела нет.

Следующий шаг — отдельная ограниченная DNS/TCP диагностика через workflow без SSH_KEY/USER, без авторизации и серверных изменений. Выводятся только безопасные статусы, а не значения secrets. Фактическая причина (firewall/route/stale binding/порт) пока не установлена. Проверенный artifact13702100156 сохраняется, новый app build не нужен для повторной доставки.

## Read-only диагноз и повторная доставка

[Connectivity42679851527](https://github.com/Nighttech1/Content-Factory/actions/runs/42679851527): HOST valid/resolves, PORT binding отсутствует (default22), HOST не совпадает с DNS публичного домена; TCP secretHOST22/80/443 timeout, тогда как content_domain_TCP_SSH=ok и referenceGitHub22=ok, публичный HTTPS отвечает307. Это не глобальный запрет исходящегоSSH runner. Значения secrets не выводились; SSH_KEY/USER этот workflow вообще не получал.

Root выбирает явно указанный владельцем target content.vernatunspeakclub.com как SSH hostname вместо недоступного HOSTbinding. USER/KEY и host-key policy сохранены, PM2/app/UID preflight проверит нужный сервер до изменений. Изменены только rollout workflow и gate: optional attempt1…10 служит номером повторной доставки, identity source/QA/artifact не меняет; boundary/unknown/missingfield проверки PASS. App source и проверенный bundle прежние, rebuild не нужен. Повторная доставка ещё должна фактически пройти.

## Итог волны: код/QA готовы, VPS blocked

[Retry42680308401](https://github.com/Nighttech1/Content-Factory/actions/runs/42680308401): verifiedartifact gate PASS, domainSSH доступен, но первый read-only preflight получил `Permission denied(publickey)`. До staging/SCP/backup/PM2stop снова не дошло.

[Guarded probe42681815298](https://github.com/Nighttech1/Content-Factory/actions/runs/42681815298): knownSelectelDNSmatch=true; USER_is_root=false; KEY_PARSE_VALID=true. Одна root auth попытка разрешена root на основании прежнего контекста владельца; реальное соединение закреплено на DNS-адресе с ожидаемым hash, host-key policy не отключалась. AUTH_ROOT_OK=false, publickey_denied. Ни provisioning, ни PM2 invocation, ни изменения сервера не выполнялись. Другие пользователи/пароли не перебирались. Workflow success означает завершённую диагностику, не успешный вход.

Root повторно проверила браузером https://content.vernatunspeakclub.com/marketing: прежний сайт работает, меню ещё без Центра роста. Новый /growth не объявляется выложенным. Итоговый UI preview соответствует проверенному source7de8d1c и revision02; снимок сохранён отдельно для просмотра.

**Готово:** раздел в существующем вебе и нужной ветке; data/model,24briefs, план/факт, графики, manualupdateguide;31+20 semanticguards,63carouseltests,fulltypecheck,productionbuild,realbrowser1440/390/360,independentreview и rootvisualreview. **Не готово:** VPS release и приёмка владельцем.

**Единственный внешний блокер:** актуальная рабочая SSH-пара для нынешнего VPS. Владелец должен сохранить корректные INFINITYS_DOOR_VPS_USER и INFINITYS_DOOR_VPS_SSH_KEY в Repository Secrets; ключ и пароль в чат не передавать. Приватный ключ локально может отличаться от старого binding; проверка формата не подтверждает авторизацию. HOSTbinding оказался недоступен, workflow уже использует явно указанный домен,22 по текущему PORTdefault. Сначала установить/проверить правильную связку, не менять firewall/sshd/authorized_keys наугад.

После сообщения об исправленном доступе root обновляет release manifest attempt3 (source7de8d1c,QA42677870881,triggerefa747,artifact13702100156), без смены проверенного appbundle. Артефакт хранится14дней: если expired, нужен новый QA bundle. Release должен завершиться verifiedHTTPS/APIrevision02 и сохранностью runtime. Только затем писать «выложено». Приёмка волны по слову владельца «согласовано». Публикаций контента/внешних сообщений/платных API не было.
