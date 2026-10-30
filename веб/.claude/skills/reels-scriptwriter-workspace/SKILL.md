---
name: reels-scriptwriter-workspace
description: >-
  Чат-воркспейс со Сценаристом рилсов — интерфейс как у Клода: левый рельс тредов по типам идей,
  разговорный поток идея→сценарий→съёмка→загрузка исходников в тот же тред. Wired to agent-chat +
  reels/script + reels/sources. UX-оболочка; саму драматургию держит reels-scriptwriter.
---

# Reels Scriptwriter Workspace — чат как у Клода

## When

Раздел Reels в Studio: левый рельс + чат со Сценаристом. Пользователь заходит, пишет свою идею **или** просит идею, получает чёткий сценарий, снимает и **в этом же окне** грузит исходники.
Оболочка/UX — здесь. Контент/биты/hook/CTA — `reels-scriptwriter`. Монтаж после загрузки — `reels-timeline-editor`.

## Макет (3 колонки, паритет с Клодом)

| Зона | Содержимое |
|------|-----------|
| **Левый рельс** | Список тредов, сгруппированы по типу идеи: `💡 Моя идея`, `🎬 Идея от сценариста`, `🔁 Разбор референса`, `📥 Черновики/снято`. «+ Новый тред». Поиск. |
| **Центр (чат)** | Пузыри user↔Сценарист (markdown, `react-markdown`+`remark-gfm`). Внутри треда: карточка **Сценарий** (hook/beats/CTA), кнопка `→ В монтаж`, зона **Исходники** (drag-drop видео/аудио). |
| **Правый (контекст, опц.)** | Активные правила монтажа (`/api/reels/rules`), стиль-профиль, превью последнего рендера. |

Переиспользовать существующее: `components/studio/workspace/AgentChatComposer.tsx`, `AgentMarkdownBubble.tsx`, `AgentPeopleIconTabs.tsx`. Токены Dark Luxury / GlassCard — `content-factory-ui`. Красивые паттерны — `21st-ui-catalog` (сток запрещён при живом MCP `21st`).

## Поток треда (канон)

1. **Идея.** Пользователь: своя идея _или_ «дай идею». Сценарист отвечает через `/api/studio/agent-chat` (модель по `agent-defaults`; Scriptwriter defaults → Haiku 5.5 + thinking).
2. **Сценарий.** Сценарист выдаёт артефакт `contentType:"reels"` (hook 0–2s · beats · CTA · VO · caption · hashtags · `promptForMontage`) — строго по `reels-scriptwriter`. STRICT: нет hook/beats/CTA → не «успех»-mock, а отметка «нужно доснять». Сохранить → `/api/reels/[reelId]/script`.
3. **Съёмка → загрузка.** В том же треде drag-drop исходников → `/api/reels/[reelId]/sources`. Каждый клип прогоняется `footage-analyzer` (длительность, сцены, пригодность под beats).
4. **В монтаж.** Кнопка открывает `reels-timeline-editor` с черновиком, собранным из сценария + исходников (`generateScriptAndStoryboard` → MontageProject).
5. **Правки → правила.** Правки пользователя в чате уходят в `club-reels-module` loop (`proposeRuleFromFeedback` → confirm). См. ниже.

## Треды = тип идеи (не один чат)

Как у Клода слева несколько чатов — здесь несколько тредов, каждый = одна идея/рилс. Статус треда зеркалит `ReelStatus`. Не сваливать всё в один бесконечный чат: один рилс = один тред = один `reelId`.

## Привязки API

| Действие | Endpoint |
|----------|----------|
| Список рилсов/тредов | `GET /api/reels` |
| Чат со Сценаристом | `POST /api/studio/agent-chat` |
| Сохранить сценарий | `PUT /api/reels/[reelId]/script` |
| Загрузить исходники | `POST /api/reels/[reelId]/sources` |
| Правка словами | `POST /api/reels/[reelId]/revise` (`applyNaturalLanguageRevision`) |
| Правила стиля | `GET/POST /api/reels/rules` |

## Выход роли

`💬 **WORKSPACE:** [рельс тредов: ok, idea→script→sources→монтаж: ok, revise live|—, правила видны: y/n]`

## Related

- `reels-scriptwriter` — драматургия сценария (владелец контента)
- `reels-timeline-editor` — куда уходит «→ В монтаж»
- `club-reels-module` — модуль-владелец, loop правок→правил
- `content-factory-ui`, `21st-ui-catalog` — визуал оболочки
