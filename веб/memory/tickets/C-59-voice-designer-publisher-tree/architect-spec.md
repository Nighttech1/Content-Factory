# Architect spec — C-59

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Один микрофон на все ИИ-чаты (`AgentChatComposer`). Razbor **карусели**: после сценариста — дизайнер слайдов + панель публициста (день+время, **без чата**). `/schedule` справа — animated file-tree модулей Студии.

## Depends

- **C-57 и C-58 Done.**
- Skills: `content-pipeline-agents` § C-59, `content-factory-ui` § Razbor/голос/schedule, `21st-ui-catalog` (datetime + file-tree), `prompt-engineering` (AI Bridge), `ai-bridge`.
- C-51 «Designer вне Razbor» **superseded только для `carousel-engine`**. Остальные moduleId — Analyst → Scriptwriter как C-51.
- Persist слотов расписания уже есть: `cf.schedule.v1` (C-54). **Backend не звать.**

## In scope

### 1. Голос — один канон

Единственный Web Speech: `components/studio/workspace/AgentChatComposer.tsx` (`data-testid="agent-chat-mic"`).

| Поверхность | Действие |
|-------------|----------|
| `RazborModal` analyst/scriptwriter/**designer** | уже / будет composer — **reuse** |
| `GenerationDrawer` | **добавить** `AgentChatComposer` внизу (правка активному шагу / заметка в ленту шагов). Сейчас чата нет — это новый вход, не второй Speech API |
| Прочие ИИ-textarea | audit; если появится чат агенту — только этот composer |

**Не вешать mic:**

- `ScriptEditor` Inspector (HITL текст, не агент-чат) — канон Тренера
- панель **публициста** (нет чата)
- datetime picker, RegisterModuleModal, command-bar темы (не чат)

Запрещено копировать `SpeechRecognition` в новый файл.

### 2. Razbor Designer — только `carousel-engine`

Файлы: `RazborModal.tsx`, `lib/studio/carousel-draft-types.ts`, `lib/studio/razbor-pipeline.ts`, `carousel-drafts-store` (`upsertDraft`).

`moduleId === "carousel-engine"`:

```
Analyst (welcome → start) → Scriptwriter (full script)
  → Designer (чат + слайды, upsertDraft)
  → Publisher pane (datetime, без чата)
```

Любой другой `moduleId`: **не** монтировать Designer и Publisher; **не** CTA публициста (C-51).

#### Designer

- Панель **после** сценариста (вкладки: Аналитик, Сценарист, **Дизайнер**, Публицист).
- Восстановить `buildDesignerMessages` (+ handoff из сценария). Mock delays OK.
- `upsertDraft` из razbor path **снова разрешён** для carousel (C-51 запрет снять **только здесь**).
- Чат дизайнера: `applyDesignerChatRevision` — уменьшить / заменить набор слайдов (parse «3 слайда» / «убери последний» / детерминированный mock). Правая карусель обновляется.
- Правая колонка: тумблер **чужая / наша** карусель (`data-testid="razbor-carousel-toggle"`). Чужая = competitor slides; наша = draft slides. Видео-конкурент: существующий `RazborReelPlayer` когда toggle = competitor и media video; карусель картинок когда slides.

Welcome / «Начать разбор» / no auto-start — **не** регрессировать.

#### CTA «Отправить публицисту»

**Обязательно** в чате/панели **сценариста** после готового скрипта (`data-testid="razbor-send-publisher"`).

Пользователь: CTA **из чата сценариста**. Дополнительная та же кнопка у дизайнера — **можно**, не вместо сценариста.

Клик → активный таб Publisher (дизайнер не удалять из каскада).

#### Publisher pane

- **Не** агент-чат, **не** `AgentChatComposer`, **не** Web Speech.
- Только **день + время** — 21st datetime/calendar (`search` → `get_component` → `framer-motion` + Dark Luxury).
- Сохранение слота в **`cf.schedule.v1`** (`postId` = draft id или competitor id + `moduleId: carousel-engine"`). HITL: слот ≠ публикация в соцсети.
- `data-testid`: `razbor-publisher-pane`, `razbor-publisher-datetime`.

Типы: `RazborAgentId` расширить `"designer" | "publisher"` **для табов**. Сообщения чата publisher **не** создавать (`messagesForAgent` пустой; composer скрыт).

### 3. Расписание — animated file-tree

- Новый `components/ui/animated-file-tree.tsx`: код пользователя / 21st TreeView.
- Import **`cn` из `@/lib/cn`** (не выдуманный `utils`).
- `framer-motion`, не `motion/react`. Ретокены Dark Luxury.
- `ScheduleModuleRail`: данные те же (`mergeStudioModules` + ready posts C-54). UI = **TreeView**: корень/папки = модули Студии, листья = готовые посты (+ подпись слота если есть).
- Сохранить: `schedule-module-rail`, `schedule-ready-post`, `schedule-slot-label`, select/drag на календарь как C-54.

## Out of scope

- Designer на graphics/reels/clips
- Чат публициста / LLM publish
- Prisma calendar API
- Prod social publish
- C-57/C-58 регрессии чинить «заодно» вне своих файлов
- Второй SpeechRecognition

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Типы + designer messages + slide mutate + **нет** publisher prompt | **AI Bridge** | **первым** — FE импортирует контракт |
| Modal tabs/toggle/CTA/datetime/tree/drawer composer | **Frontend** | 21st datetime + file-tree |
| Toggle / tree enter / datetime micro | **Motion** | после DOM |
| Persist | Frontend `cf.schedule.v1` | **Backend не звать** |

## Contracts

### Cascade `carousel-engine`

```
Open → Analyst welcome
«Начать разбор» → Analyst
Script CTA / chat → Scriptwriter (roles/plot/text/location)
Designer messages + upsertDraft(slides)
Designer chat → mutate slide count / replace set
Scriptwriter CTA «Отправить публицисту» → publisher pane
Publisher: datetime → cf.schedule.v1
STOP — no network publish
```

### Cascade other modules

```
C-51 unchanged: no designer, no publisher pane, no send-publisher CTA
```

### Voice

```
SpeechRecognition lives only in AgentChatComposer
```

### Designer chat (mock)

Интенты (примеры, детерминизм от `competitorId` + note):

- «сделай 3 слайда» → `slides.length === 3`
- «короче» / «убери кадр» → length − 1 (min 2)
- иначе — caption/note на текущем наборе, length без изменения

## Acceptance criteria (язык Клиента)

1. Razbor карусели: после сценариста есть дизайнер; справа переключатель наша/чужая карусель; чат может уменьшить число слайдов (S11).
2. У сценариста кнопка «Отправить публицисту»; публицист — день и время, **без** поля чата и без микрофона.
3. Razbor другого модуля: дизайнера и публициста **нет** (C-51).
4. В ИИ-чатах (разбор + drawer) виден mic `agent-chat-mic`; у публициста — нет.
5. `/schedule` справа — дерево модулей, не плоский список секций без tree (S11).
6. Слот с публициста виден после reload (`cf.schedule.v1`); в соцсети ничего не уходит.

## Risks

- Старые guards C-51 «нет Designer» — Tester **сужает** до non-carousel; carousel **ожидает** Designer.
- `emptyPanes` / `MOCK_ACK` должны покрыть `designer`; publisher без MOCK_ACK чата.
- Overlap `RazborModal` у FE / Motion / AI Bridge — порядок: **AI Bridge → Frontend → Motion**.
- 21st datetime unavailable → fallback Dark Luxury date+time inputs, не стоп волны; `decisions.md` `21st=unavailable`.

## Mid-flight escalation

- Persist слота на сервер / multi-user — новый Backend-тикет.
- Live LLM designer — optional; mock **блокер-acceptance**.
- Вернуть Designer на все модули — новый тикет, не patch C-59.
