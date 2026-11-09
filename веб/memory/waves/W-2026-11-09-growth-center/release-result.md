# QA / release journal

Ветка: codex/director-chatgpt-transfer. Production target: content.vernatunspeakclub.com. Разрешение владельца есть; release marker ещё не создан.

1. Source `392cebd`, QA [42675849920](https://github.com/Nighttech1/Content-Factory/actions/runs/42675849920): install/typecheck/model guards прошли, production build остановился на ESLint. Исправлены внутренние ссылки через Next Link и три inherited prefer-const; правила не отключались.
2. Source `85f2563`, QA [42676728164](https://github.com/Nighttech1/Content-Factory/actions/runs/42676728164): штатный production build и packaging PASS. Основной настоящий browser scenario PASS на1440/390/360, включая план24/факт0, навигацию и сохранённую историю чата. Непустая изолированная fixture PASS на1440/390; на360 обнаружено горизонтальное переполнение. Evidence artifact13702085077 скачан и осмотрен root: hero1440 и nonempty390. JavaScript errors отсутствуют. Release заблокирован этим дефектом.
3. Исправление: tooltip графика наследовал nowrap; добавлены normal wrapping/word break и адаптивная ширина внутри компонента. Guard overflow сохранён; fixture при ошибке сохраняет screenshot и DOM bounds. При редакционной проверке также исправлено поле продукта первого REL-01: «Разговорные встречи»; бриф и проекция синхронизированы, revision growth-v2-20261109-02. Все24 product/title/date mappings проверены,31modelguards и20independent снова PASS. Следующий QA проверит эти изменения.

Факт до успешного release: VPS не изменён. Synthetic fixture никогда не записывалась в production dataset. Ничего не публиковалось, платные API не вызывались. Успех CI, осмотр скриншотов, deployment и приёмка владельцем — отдельные состояния.

## Gate перед VPS — PASS

Source7de8d1c2407df829f06de1c84f60921c883f63bf; QA trigger efa747e3072f885af365fb44905c8cc8abd60311. [Run42677870881](https://github.com/Nighttech1/Content-Factory/actions/runs/42677870881) completed/success: cleaninstall/fulltsc/31guards/штатный Turbopack production build/package, defaultbrowser и nonemptyfixture на1440/390/360. Buildartifact13702100156, evidence13701815874. Независимая Тестировщица проверила обаJSON: errors[], все3width passed, documentWidth=bodyWidth=viewportWidth и offending[]. Root скачала и визуально осмотрела hero1440 и nonempty360; tooltip исправлен, поля продукта синхронизированы. Приёмка владельца ещё открыта.

После QA изменён только rollout workflow: read-only проверка свободного места перед SCP/backup/stop, threshold2×oldapp+bundle+256МиБ, YAML/bash/mock capacity checks PASS. Runtime app code и проверенный bundle не изменялись; выкладываем именно artifact13702100156, а не новую сборку. Это изменение сценария доставки не является app rebuild.
