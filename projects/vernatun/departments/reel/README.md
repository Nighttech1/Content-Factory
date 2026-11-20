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

## Разбор чужого рилса и повторное использование оформления

Для анализа видео/ссылки и сохранения «Дизайн N» используй
`shared/skills/reel-reference-analysis/SKILL.md`. Индекс и карточки —
`designs/`. Разбор отделён от производства; исходный ролик не становится
разрешённым материалом нашего монтажа автоматически. В брифе нового рилса можно
указать номер и версию дизайна; параметры переносятся в арт-дирекшен и motion-brief.

## Стандарт монтажа и уровни сложности

Для монтажа комедийных Reels читать `shared/skills/vernatun-reel-editing-craft/SKILL.md` после бренд-правил. Его категории `SIMPLE` (базовый режим), `POLISHED` (акцентная типографика), `SHOWCASE` (маски/графические переходы) — не отдельные пайплайны, а ограничения художественной сложности. Пользовательский референс 19.11.2026 сохранён как `designs/DESIGN-001.md`: переносить общую механику без копирования чужой графики/аудио. FFmpeg — baseline, Remotion только когда действительно нужен motion и среда поддерживает рендер, word-level transcription/автовырезание пауз — только с ручным контролем комедийного ритма. Одна таблица сценария и Gemini/Veo prompt после согласования по действующему правилу.

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

## Продолжение в обычном ChatGPT

- Вход: START-CHATGPT.md; состояние: CHATGPT-HANDOFF.md (в этой папке).
- Реестр профилей оформления: designs/README.md; шаблон: designs/_TEMPLATE.md.
- Апскейл/качество: shared/skills/reel-quality-enhancement/SKILL.md.
- Перед работой проверять инструменты нового чата; Git не переносит runtime/OAuth.

## Отдельный pipeline: улучшение качества

Для существующего видео: `shared/pipelines/video-quality/README.md`.
Это отдельная обработка VQ-YYYYMM-NN, без генерации нового рилса и изменения
контент-плана. Связанный REL ID сохраняется отдельно. Статус локальной проверки
и входы: `quality/`. Права, принятая проба и полный просмотр финала обязательны.


## Owner rule 2026-11-17: approval -> Gemini visual reference prompt
1. Start with five short, sourced, straightforward viral comedy options for selection, not heavy VFX. Prefer 1-5 actors, a smartphone, 5-20 minutes shooting, 0-2 ordinary cuts; universal comedy is fine.
2. After explicit scenario approval, immediately provide the full shooting sheet plus a paste-ready Gemini/Veo prompt for a reference video, with 9:16, model-supported runtime, precise timed scenes, staging, fixed actors/background, camera, edits, audio, and negative instructions. This is a prompt, not an automatically generated MP4.
3. Do not automatically send candidates to the web dashboard or publish. Git content changes go straight to main as permitted; editor review and explicit owner approval are still required before publication. Use shared/skills/reels-competitor-intelligence/SKILL.md for the research methodology.

## Mandatory one-table delivery format (owner decision 2026-11-17)
After the owner approves a Reels idea, ALWAYS send exactly ONE consolidated Markdown shooting/storyboard table containing: timecode; who appears and shot framing / camera placement; actions; exact spoken dialogue and inner voice; overlay texts; cut/edit/sound; acting cues. Avoid separate or duplicated tables for the same reel. This is a presentation rule, not a replacement for files in jobs/<ID>/ or editorial gates. Supply a Gemini/Veo reference-video prompt separately as a copy-ready text block when required by existing instructions. Before approval, use brief pitch format.

## Required mastering / Google Drive delivery (owner decision 2026-11-20)
- Master: **2160x3840 vertical (9:16), constant 60 fps, MP4 H.264 video + AAC audio**. Prefer native 4K/60 source in future shoots. If source is 1080p/30, use high-quality upscaling (and 60 fps conversion when feasible), but report that real detail and real motion information were not recorded natively. Do not report a rescaled file as native.
- Deliver video into the verified Drive folder `output`: https://drive.google.com/drive/folders/1c11_x2x6OgU2x0Vjm0cMhA3MsKf9P0-9 (folder ID: `1c11_x2x6OgU2x0Vjm0cMhA3MsKf9P0-9`). Provide the confirmed Drive file link to the owner; check metadata and the exported MP4 with ffprobe. Prefer Drive link over a sandbox link for user delivery.
- Keep source videos, preview and rendered media off Git; only safe manifests/text in repo. Editorial gate and explicit owner approval remain necessary before public posting.
