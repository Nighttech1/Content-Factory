# Workers — агенты-работяги контент-пайплайна

Эта папка — **отдельный контур** от команды разработки Cursor.

| Контур | Где лежит | Кто это | Зачем |
|--------|-----------|---------|--------|
| **Команда разработки** | `.cursor/skills/`, `.cursor/rules/`, `plugins/` | Клиент, Архитектор, Frontend, Backend, Motion… | Пишет продукт (Studio, Mesh, API) |
| **Работяги фабрики** | `workers/` | Researcher, Hook Writer, Designer Carousel… | **Производят контент** по джобам клуба |

Не путать: `content-pipeline-agents` в `.cursor/skills/` — это **спека для AI Bridge** (как встроить пайплайн в код). Папки в `workers/` — **операционные инструкции самих микро-агентов**, когда джоба реально крутится (BullMQ / Mesh).

## Зачем отдельная папка

1. Клуб загружает brandbook (MD) — carousel-агент **жёстко** следует ему, без «креативного дрейфа».
2. Каждый работяга имеет свой `SKILL.md` + `PLUGINS.md` (MCP/tools) — как у ролей команды, но для контента.
3. Можно версионировать промпты и плагины пайплайна **без** смешивания с правилами Frontend/Tester.

## Brand lock (обязательно для визуала)

- Шаблон, который заполняет клуб: [`_shared/brandbook.template.md`](./_shared/brandbook.template.md)
- Правила «не плыть стилем»: [`_shared/brand-lock.md`](./_shared/brand-lock.md)
- Токены UI продукта — из корневого `ARCHITECTURE.md`; токены **слайдов клуба** — только из загруженного brandbook MD.

**Carousel Designer** генерирует слайды **строго** из MD brandbook/spec: одна сетка, одни отступы, одни шрифты/цвета. Freestyle запрещён.

## Реестр

См. [`_index.md`](./_index.md).

## Рекомендуемые MCP / tools (позже, без секретов в репо)

Секреты (`HEYGEN_API_KEY`, соцсети, LLM keys) — только `.env`. Здесь — **какие MCP подключать**, не как ставить ключи.

| Worker | MCP / tools (рекомендация) | Заметки |
|--------|---------------------------|---------|
| `researcher` | WebSearch / fetch URL, (опц.) postgres read | Тренды и источники; без записи в прод |
| `hook-writer` | LLM tool-router (через AI Bridge) | Оценка virality; без публикации |
| `script-writer` | LLM + schema validate (Zod) | Таймлайн слайдов / секунд |
| `router` | внутренний registry модулей | Выбор carousel / graphics / cartoon / heygen |
| `designer-carousel` | Satori/Puppeteer worker, **чтение brandbook MD**, filesystem | Brand lock обязателен |
| `designer-graphics` | SVG/Tailwind templates + brand tokens | Цитаты, инфографика |
| `designer-cartoon` | Remotion / Lottie pipeline MCP | 9:16 reels |
| `designer-heygen` | HeyGen API MCP (ключ в `.env`) | Avatar + субтитры Whisper |
| `hitl-gate` | postgres / job status; **нет** auto-publish | Ждёт апрув админа |
| `publisher` | платформенные API MCP (IG/TT/YT/TG) | Только после HITL |
| `analyst` | postgres metrics + (опц.) RAG read | Инсайты в `/analytics`; промпты не перезаписывает молча |

Связь с Mesh-нодами: `ARCHITECTURE.md` §3, экран 1 (Researcher → … → Analyst).
