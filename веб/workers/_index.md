# Реестр агентов-работяг (Content Pipeline)

| ID | Папка | Mesh-нода | Выход | Brand lock |
|----|-------|-----------|-------|------------|
| `researcher` | [`researcher/`](./researcher/) | The Researcher | brief: тренды, источники, углы | — |
| `hook-writer` | [`hook-writer/`](./hook-writer/) | The Hook Writer | 10→3→1 хук + virality score | — |
| `script-writer` | [`script-writer/`](./script-writer/) | The Script Writer | таймлайн / слайды JSON | — |
| `router` | [`router/`](./router/) | Dynamic Router | `moduleId` + options | — |
| `designer-carousel` | [`designer-carousel/`](./designer-carousel/) | Designer (M1) | PNG 1080×1350, 4:5 | **обязателен** |
| `designer-graphics` | [`designer-graphics/`](./designer-graphics/) | Designer (M2) | single/carousel graphics | токены brandbook |
| `designer-cartoon` | [`designer-cartoon/`](./designer-cartoon/) | Designer (M3) | MP4 9:16 | стиль из brandbook |
| `designer-heygen` | [`designer-heygen/`](./designer-heygen/) | Designer (M4) | MP4 avatar + captions | persona из brandbook |
| `hitl-gate` | [`hitl-gate/`](./hitl-gate/) | HITL Gate | `AWAITING_APPROVAL` → approve | — |
| `art-director` | [`art-director/`](./art-director/) *(Backend creates worker; Cursor skill stub `.cursor/skills/art-director/`)* | Art Director | `approve` \| `remarks` JSON — **NO auto-remake** | S57 etalon taste |
| `publisher` | [`publisher/`](./publisher/) | The Publisher | post IDs / URLs | — |
| `analyst` | [`analyst/`](./analyst/) | The Analyst | insights + prompt hints | — |

## Shared

| Файл | Назначение |
|------|------------|
| [`_shared/brandbook.template.md`](./_shared/brandbook.template.md) | Шаблон MD, который заполняет клуб |
| [`_shared/brand-lock.md`](./_shared/brand-lock.md) | Инварианты: нет style drift, шрифты, токены |

## Порядок пайплайна

```
Researcher → Hook Writer → Script Writer → Router
    → Designer-* (по moduleId) → Art Director (remarks|approve; NO remake)
    → HITL Gate → Publisher → Analyst
```

Create/Razbor carousel shortcut: Scriptwriter → Designer (+ Variant A `html_layout`) → composite → **Art Director** → Draft/HITL.

Каждый шаг пишет в `ContentJob.feedbackLogs` (см. `ARCHITECTURE.md` §6).
