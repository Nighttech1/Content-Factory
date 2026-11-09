# Деплоер — подготовка только QA

Дата: 10.11.2026. Ветка: `codex/director-chatgpt-transfer`.

Прочитаны AGENTS/CLAUDE, web CLAUDE, правило/skill/plugin/knowledge Деплоера, актуальные spec+chain и `growth-center-release.yml`. Legacy skill содержит Sputnik/VPS-рецепт, который к текущей QA-задаче не применяется.

## Изменено

- В существующий `qa` job перед production build добавлен независимый `tester-contract-boundaries.mjs`.
- После штатного production browser QA и isolated synthetic browser fixture добавлен отдельный `scripts/situation-center-client-qa.mjs`.
- Перед независимым Клиентом cwd возвращается из `веб/` в корень checkout. Существующий standalone server и trap остаются активными для всех трёх браузерных проверок.
- Конфигурации `gate`, `deploy`, triggers, permissions, release marker и код VPS не изменены.

## Фактическая проверка

PASS: YAML разобран PyYAML; все `run` блоки QA прошли `bash -n`; сравнение parsed `gate`/`deploy`/triggers/permissions с HEAD показало полное равенство; оба добавленных script path существуют; последовательность cwd и lifetime server trap проверена.

Локальный браузерный/серверный PASS не заявляется: Оркестратором подтверждён environment blocker `socket() EPERM`. Повторный обход ограничений не предпринимался. Реальная проверка нового source должна пройти в GitHub Actions.

## Безопасная передача Оркестратору

1. Дождаться освобождения Backend/Frontend/Tester/Client locks и применимо зелёных локальных model/type/syntax проверок.
2. Сохранить source SHA текущей ветки и доставить исходники в эту же ветку.
3. Отдельным изменением **только QA marker** `.github/releases/growth-center-qa.json` выбрать проверяемый source SHA.
4. Проверить новый CI run: gate mode `qa`, production build, main browser QA, synthetic fixture, независимый Client и evidence artifact. Старый QA run не подтверждает новый source.
5. Передать фактические screenshots/JSON независимому Клиенту для строгой приёмки. Замечания C-* возвращаются команде до показа владельцу.

Commit, push, marker update, SSH, Secrets и VPS этой ролью не выполнялись. Production release этой волной не разрешён.
