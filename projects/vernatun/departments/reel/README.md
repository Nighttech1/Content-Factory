# Отдел рилсов

## Что читать при старте чата

1. `AGENTS.md`, `CLAUDE.md`, `ACTIVE_PROJECT`.
2. `projects/vernatun/.claude/agents/reel-lead.md`.
3. `projects/vernatun/departments/README.md` и этот файл.
4. `projects/vernatun/memory/reel-lead.md`.
5. Задание с ID в месячном плане, затем `jobs/<ID>/`.
6. `shared/pipelines/reel/README.md`.
7. `intelligence/` — только адресные сводки скаута по этому формату.
8. `shared/skills/reel-department-runner/SKILL.md` и профили масок `projects/vernatun/.claude/agents/reel-*.md`.

## Папка одного задания

Создай `jobs/<ID>/` по `jobs/_TEMPLATE/`:

```text
00-brief.md              → ссылка на план и уточнения
10-script.md             → хук, биты, VO, CTA
20-art-direction.md      → стиль кадров, вставки, субтитры
30-edit-plan.md          → монтажный лист и исходники
40-output-manifest.md    → ссылка на файл, субтитры, технические параметры
50-editor-verdict.md     → редакторский гейт
```

В `20-art-direction.md` лид обязан запросить отдельный покадровый
`20-art-direction/motion-brief.md` по шаблону отдела. Это обязательный handoff
для красивых смысловых motion-вставок: тайм-коды, анимированный текст/слои,
переходы, safe-zone, бренд-токены и статический запасной вариант. Remotion
анимирует элементы при наличии рантайма; FFmpeg монтирует и кодирует итог.
Если Remotion отсутствует в чате/среде — честно укажи блокер, не называй
статическую композицию motion-рендером.

В чате веди чек-лист текущей фазы, маски, gate начальника, итераций и замечаний.
После каждого задания дописывай фактический производственный след и уроки в
`projects/vernatun/memory/reel-log.md`. Не клади медиа в Git.

Тяжёлые исходники и готовые рилсы остаются в `Content Factory/reels/incoming` и
`Content Factory/reels/output` либо согласованном внешнем хранилище. В Git — только
ссылки, права на материал и манифесты.

## Готово, когда

У рилса есть хук в первые две секунды, один главный CTA, монтажный лист, список
исходников, читаемые субтитры, ссылка на итоговый файл и редакторский вердикт.
Подробные режимы запуска, обязательные роли-маски, gates и one-turn правило см. в
`shared/skills/reel-department-runner/SKILL.md`.
