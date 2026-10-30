# PLUGINS / MCP — Designer Carousel

## Рекомендуемые tools

| Tool / MCP | Зачем | Секреты |
|------------|-------|---------|
| **Filesystem / brandbook reader** | Парсинг загруженного MD | путь к файлу клуба |
| Satori / Puppeteer worker | PNG 1080×1350 | системные зависимости |
| Font loader | `Noto Sans Armenian`, club fonts | локальные файлы шрифтов |
| Image store | Сохранение PNG | storage path / bucket |
| (опц.) image-compare | Diff vs эталон layout | нет |

## Обязательный порядок вызовов

1. Resolve **active DesignPresetFile** / **colors** (+ CSS var overrides) — Settings = colors-only  
2. Assert brand-lock / preset id (`dark_notes` \| `bento_glass` \| `dark_editorial` \| `bold_poster`)  
3. Bind CSS vars → builder / image prompt  
4. **Compose horizontal panorama** (N×1080)×1350 — bridges may cross future cuts  
5. **Slice** → role frames `cover` / `body_slide` / `cta_slide` — 4:5 each  
6. Write `generatedMedia` (per-slide PNG) + logs — Create preview = **sliced only** (master panorama internal)  
7. Prefer image model default `openai/gpt-5.4-image-2` (catalog notes)

### Visual Style Deconstructor (Settings / Razbor)

1. Vision on reference image → tokens + preset  
2. Write DESIGN.md + DesignPresetFile → library slot ≤10  
3. Set `activeId`; Settings preview = **3 sliced 4:5** (cover/body/cta), not raw panorama alone  

## Не подключать

- LLM «перерисуй красивее» без слотов / без preset
- Publisher / HeyGen
- Платный vision MCP «ради красоты» — только уже настроенные ключи агрегатора
- Секреты в `PLUGINS.md` или MD brandbook

## Связанные файлы

- `workers/_shared/brandbook.template.md`
- `workers/_shared/brand-lock.md`
- `.cursor/skills/carousel-json-contract/SKILL.md`
- `.cursor/skills/create-design-md/SKILL.md` § Deconstructor
- `ARCHITECTURE.md` §4 Module 1
