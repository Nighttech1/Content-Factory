# Content Factory — инструкции для Codex

## Правило GitHub: запись непосредственно в main (решение владельца 2026-11-16)

- **По умолчанию все изменения этого репозитория фиксируй непосредственно в `main` (commit + push через доступный GitHub-коннектор).** Это касается сценариев, контент-планов, агентских инструкций, скиллов, документации, а также кода и конфигурации — после предусмотренных проверок. Не создавай PR или временную ветку без явной просьбы владельца либо технической необходимости (protected branch, конфликты, обязательные checks).
- При начале работы читай актуальную версию `main`, используй SHA для конкурентно-безопасной записи; после коммита проверяй, что файл доступен именно в `main`. В отчёте давай ссылку на файл/commit и реальный результат проверки.
- При блокировке прямого push сообщи причину, создай PR только как вынужденное исключение, покажи ссылку и явно укажи, что изменение **ещё не в main**. Если разрешено и проверки прошли, допускается сразу объединить такой PR в main без ручного клика владельца. Не обходи branch protection.
- Прямая запись в Git **не означает** автоматический деплой, публикацию в соцсети, расход платного API или отмену обязательной приёмки: редактор и апрув человека на публикацию сохраняются; деплой, внешние действия и изменения инфраструктуры — только по действующим разрешениям и проверкам.
- Не ослабляй проверки, бэкапы, сохранность секретов и безопасность ради обхода PR. При рисковых необратимых изменениях уточни разрешения.
- Это правило приоритетнее старых рекомендаций «предложить commit/push», «сначала PR» для обычного сохранения в репозиторий и действует для обоих проектов в Content-Factory.

## Решение владельца от 16.11.2026

Для `vernatun` обязательно прочитать `projects/vernatun/cmo/content-responsibility.md`.
CMO задаёт объём, направления, аудиторию, цель, показатели, каналы и период.
Начальники отделов сами подбирают темы, создают ID/jobs и отвечают за производство
и выпуск через действующие проверки и разрешения. Это заменяет старые требования
получить конкретную тему и готовую папку от директора. Для других проектов
порядок не меняется. Прямой запуск TGP владельцем сохраняется.


## Ситцентр /growth — подготовка к правкам (18.11.2026)

Перед любыми правками ситцентра читать [вход в разработку](веб/docs/SITUATION_CENTER_START_HERE.md).
Там зафиксированы рабочая ветка, версия на VPS, карта кода, ответственность ролей,
проверки и условия выпуска. На дату подготовки код /growth и его release workflow
находятся в codex/director-chatgpt-transfer, а не в main: сначала сравнить и
согласовать исходники, сохранив параллельные изменения. Не применять legacy
Sputnik-команды из общей инструкции деплоера к Вернатуну.
Подготовка команды не означает новую UI-приёмку или разрешение на prod-выпуск.

## Ориентация

- Прочитай `CLAUDE.md`, `STATE.md` и `ACTIVE_PROJECT`. При работе над платформой
  также прочитай `веб/CLAUDE.md`, `веб/docs/CLIENT_ORCHESTRATOR_CYCLE.md` и реестр
  `веб/.claude/registry/agents.md`. Эти файлы задают существующую команду и процесс.
- Проверяй рабочую ветку и актуальность файлов перед выводами об отсутствии
  скиллов, агентов, интерфейса или деплоя. Не сбрасывай пользовательские изменения.
- Развивай существующий интерфейс в `веб/`. Не создавай параллельный продукт,
  отдельную доску или второй источник данных без явного запроса пользователя.

## Платформа и инфраструктура

- Единственный голос для пользователя — `🧑‍💼 Клиент`: и в обновлениях, и в финале.
  Клиент сообщает результат команды, доказательства, ограничения и следующий шаг.
- Инженерная работа проходит цикл: Оркестратор → Тренер → Архитектор → специалисты
  (Frontend, Motion, Backend, AI Bridge, Кодер по задаче) → Тестировщик → Фиксер
  при замечаниях → Деплоер для локального запуска → Клиент для приёмки.
- Перед исполнением каждой роли прочитай её инструкции в `веб/.claude/agents/`,
  правила и применимые SKILL.md, плагины и оболочку knowledge. Зафиксируй порядок
  работ и критерии проверки до изменения кода; не выполняй конфликтующие правки
  параллельно. Неприменимые этапы отмечай как пропущенные с причиной.
- Последовательная работа в ролях допустима. Реальные субагенты — отдельный
  механизм: не выдавай смену роли за независимую проверку другим агентом.
  Используй доступное делегирование, только когда оно разрешено и полезно.
- На найденные дефекты — исправление и повтор затронутых проверок. UI принимает
  Клиент живым браузерным сценарием. При внешнем блокере сообщай о нём честно;
  не объявляй непроверенный результат принятым. Ответ на справочный вопрос сам
  по себе не означает проведённый цикл разработки или тестирование приложения.
- Финал инженерной задачи: краткий `📋 ОТЧЁТ КОМАНДЫ`, фактически выполненные
  этапы, проверки и вердикт Клиента. Не выдумывай участия агентов или доказательств.

## Контент и отделы

> Актуальный порядок для carousel-чата: `shared/pipelines/carousel/OPERATOR-RUNBOOK.md` (решения владельца 2026-11-14). Он уточняет старые отступы, стрелки, нумерацию этапов и границы preview/production. Внутри порученного этапа исправлять и перепроверять автономно; не просить согласования каждой внутренней правки.


- Сохраняй отдельный контур: `projects/<ACTIVE_PROJECT>/.claude/agents/`,
  `shared/rules/agent-roster.md`, `shared/pipelines/` и память конкретной роли.
  В специализированном контент-чате действуй по роли, указанной пользователем.
- Передача между самостоятельными чатами не происходит от записи брифа или
  упоминания агента. Отдельно проверяй транспорт: ручной перенос задания,
  доступный коннектор/runtime либо очередь с работающим исполнителем.
- У задания должны быть ID, версия брифа, цель, адресат, входные материалы,
  ожидаемый результат и критерии приёмки. Сохранение, получение, запуск,
  завершение, апрув и фактическая публикация — разные состояния.
- Для новых заданий используй ID `V-ГГГГММ-<КОД>-NN` из
  `projects/<активный>/content-plan/README.md`. Для `vernatun` начальник отдела создаёт папку
  `projects/<активный>/departments/<отдел>/jobs/<ID>/` и `00-brief.md`.
  В других проектах прежний порядок сохраняется. Лид отдела читает свой профиль, README отдела, память,
  `jobs/<ID>/` и применимый `shared/skills/` до работы.
- **Исключение только для Telegram-графики:** если владелец сам поручил задачу
  чату `telegram-graphics-lead`, он может без директора выбрать следующий
  свободный `TGP` ID (сверив месячный план и папки jobs), создать папку из
  `_TEMPLATE/` и внести строку в план. Этот чат не запускается по заданиям
  директора или расписанию без явного сообщения владельца.
- Скаут хранит полный отчёт в `departments/scout/reports/`, директор получает
  ссылку и решение, а отделы — адресные сводки в своих `intelligence/`.
- Редактор и явный апрув человека обязательны перед публикацией контента.

## Инструменты и публикация

- Наличие `.mcp.json` или имени плагина в инструкции не доказывает доступность
  инструмента в текущем чате. Проверяй фактически подключённые capabilities.
- Инструкции общие в Git; секреты, подключения и процессы зависят от выбранной
  среды и платформы. Не переноси значения секретов в файлы, сообщения или логи.
- Для VPS сначала изучи существующий `.github/workflows/deploy-vps.yml`.
  Не запрашивай повторно ключи, пока не проверены существующий путь и bindings.
  Перед заменой файлов проверь сохранность данных и резервных копий.
- Прямые ограничения пользователя на деплой, push или публикацию сохраняют силу
  до их явного изменения. При запрете публикации подготовь локальный результат
  и остановись до внешней записи; не запускай workflow и не публикуй среду.


## Owner decision 2026-11-17: Simple viral Reels
- Twice weekly (Monday and Thursday at 10:00 Europe/Moscow), ChatGPT Automation delivers five funny short-form references. Schedule is in ChatGPT Automations, not GitHub Actions.
- Favor 1-5 participants, smartphone, 5-20 minutes filming, 0-2 simple cuts. Avoid complex VFX, staged falls, teleportation, elaborate montage. Universal comedy is welcome; adapt with original jokes to Vernatun.
- Initial selection is editorial only: five references plus short pitches, no automatic dashboard, jobs, publishing or deployment.
- Once the owner approves a specific script, immediately provide a timed shot list AND a detailed Gemini/Veo reference-video prompt (9:16, scene timings, camera, actors, continuity, sound, cuts, model duration limit, negative constraints). Respect existing editor and publication approval gates.
- Current repository name is Nighttech1/Vernatun-Content-Factory (previously Nighttech1/Content-Factory). Verify repository identity before diagnosing permission problems.

## Presentation standard for approved Reels (owner decision 2026-11-17)
Every approved Reels scenario must be delivered to the owner as ONE consolidated Markdown table (not separate shot lists, dialogue lists and camera lists). Include all steps in sequence with timecode, shot/framing, camera position, action, exact dialogue/voiceover, on-screen text, edit/sound and performer notes. If a Gemini/Veo reference prompt is requested or required, deliver it after the table as one copy-ready prompt, without a second storyboard table. Keep the table readable on mobile. Preserve all existing editor and publication gates.

## Reels export and delivery default (owner decision 2026-11-20)
- Every finished Vernatun Reels MP4 must target **vertical 2160x3840 (9:16), 60 fps**, H.264/AAC as a broadly compatible master, unless the owner explicitly changes this. Do not claim native 4K/60 when source footage has lower resolution or frame rate: label the upscale and interpolation clearly. When source is low resolution, prefer clarity and avoid artificial detail claims; do not force unsafe or excessively slow processing.
- Final approved/proof exports are delivered to the existing Google Drive folder **Content Factory/reels/output**: https://drive.google.com/drive/folders/1c11_x2x6OgU2x0Vjm0cMhA3MsKf9P0-9 . Verify the upload with Drive metadata and provide the actual file URL. Never assume an upload succeeded.
- Keep media outside Git. In Git save only text, links and manifests; after export, require playback/QA and owner approval before external publication. If Drive connection/upload is unavailable, disclose blocker and deliver a locally verified file only as fallback.

## Reels visual approval gate (owner decision 21.11.2026)
- After the full reel MP4 has been rendered, the mandatory `reel-art-director-final` role reviews the **actual entire video with sound** using `shared/skills/reel-final-art-direction/SKILL.md` and writes `jobs/<ID>/45-final-art-director-verdict.md`. A contact sheet alone is insufficient. `REWORK` must identify exact timecode, defect, responsible role and acceptance test, and be returned to that role before new render and re-review.
- Order: lead acceptance at each stage -> final reel art-director ACCEPT -> existing `editor` ACCEPT -> owner review/approval -> publication. Draft preview and save in Git are not acceptance or publication.
- Consult `shared/skills/reel-motion-research-playbook/SKILL.md` for curated Remotion / HyperFrames / short-form educational material; links are knowledge references, not proof that an external CLI is installed. A real separate reviewer exists only if the runtime actually provides subagents; otherwise sequential role passes must be disclosed.
