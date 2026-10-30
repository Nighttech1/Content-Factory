# Architect Spec — W-2026-10-15-sprint9-live-gen

**Дата:** 2026-10-15  
**Роль:** Архитектор  
**Волна:** LIVE-GEN — живая генерация каруселей Vernatun после Sprint 9  
**Предшественник:** `W-2026-10-15-sprint9-carousel-reels` (Client: **ПРИНЯТО С ЗАМЕЧАНИЯМИ**; хвост F-s9-11-c / live eye-pass)  
**ticket_limit:** `full-queue` (один контур «ген → критика → усиление», не пачки UI-тикетов)  
**shell_freeze:** `true`  
**upgrade_only:** `true`  
**no_pipeline_break:** `true`  
**Код продукта в этом ходе Архитектора:** **нет** — только plan files (`architect-spec.md` + `chain.md`).

---

## 1. Зачем это нужно (простым языком)

Sprint 9 усилил «мозги» ИИ (промпты, эталоны, жёсткий JSON, критик), но **полную живую генерацию картинок** до красивых PNG почти не гоняли — дорого и отложили.

Сейчас пользователь **сам разрешил** сделать ограниченный live-прогон: сгенерировать карусели, сравнить глазами с тремя эталонными фото (недвижимость / зал / мотивация), понять **почему слабо**, усилить промпты и повторить — **не больше 3 кругов**. Всё готовое обязательно лежит во вкладке **Черновики** (Postgres через API Sprint 8).

**Темы контента** — клуб Vernatun (кофе, сообщество, наследие). **Не копируем** бренды риелтора / зала / чужой мотивации — берём только **уровень качества** картинки и типографики.

**Не делаем:** выкладку в Instagram/Telegram; переделку меню/экранов; новые модули; рилсы в этой волне (только карусели).

---

## 2. Жёсткие замки (HARD)

| Lock | Значение |
|------|----------|
| **authorized_live_gen** | Пользователь явно разрешил генерацию. Без «спросить ещё раз» на каждый PNG. |
| **budget_slides** | **Макс. 3 слайда** на карусель. |
| **budget_carousels** | **Макс. 3 карусели** за волну (всего **≤ 9 PNG** на весь LIVE-GEN, считая все раунды **или** финальный deliverable — см. §4). |
| **refs** | 3 пользовательских референса (пути ниже). Клиент сравнивает **строго** с ними. |
| **topics** | Только Vernatun Armenian club (coffee / community / heritage). Запрет копировать real-estate / OM GYM / чужой tip-бренд. |
| **persist** | Каждый успешный gen → **Черновики** через Sprint 8 SoT (`POST /api/studio/drafts` / Create → Публикация → Draft). Без «только в папке на диске». |
| **upgrade_only** | Усиливаем промпты / critic / few-shots / overlays **на месте**. Запрет rewrite пайплайна. |
| **no_pipeline_break** | Сохранить **Create: Scriptwriter → Designer → шаг Публикация → Draft** (и при необходимости Razbor→…→Draft). Не схлопывать агентов, не auto-skip handoff. |
| **shell_freeze** | 0 правок AppShell / Sidebar / left nav IA / module top chrome / Create-Razbor redesign. |
| **modules** | Только `carousel-engine`. `custom-reels` / HeyGen / articles → вне волны. |
| **no social publish** | Только Draft / HITL queue. Meta / YT **запрещены**. |
| **Frontend / Motion** | **Вне** chain по умолчанию. Deployer — только если localhost мёртв для Client Playwright. |
| **critic_loop** | ≤ **3** раунда: gen → Client critic vs refs → strengthen prompts → gen. После 3-го — финальный вердикт Клиента (принять / принять с замечаниями / не принять), без 4-го gen. |

---

## 3. Референсы (эталон качества, не бренд)

Абсолютные пути (workspace assets):

| # | Файл (суффикс) | Эстетика (что копировать) | Что **не** копировать |
|---|----------------|---------------------------|------------------------|
| R1 | `...image-d4bd41b6-9b65-4288-953d-dcbcfb3e1090.png` | Светлый orange/white, чистая сетка, крупные цифры/типографика, «дорогой» real-estate layout | Логотип/адреса/офферы недвижимости |
| R2 | `...image-1bb3193f-f478-4596-baeb-c675f4439cea.jpg` | Тёмный cinematic + orange accents, drama light, спорт-энергия | Бренд OM GYM / тренерские лица как identity |
| R3 | `...image-d91b770d-4ad2-4328-8409-fb3caba51e9a.png` | Чёрный + жёлтый, tip-карточки, жирный hook, high-contrast | Чужой tip-бренд / stock-мотивация без Vernatun |

Полные пути (канон для AI Bridge / Client):

```
C:\Users\alexk\.cursor\projects\d-Applications-Content-factory\assets\c__Users_alexk_AppData_Roaming_Cursor_User_workspaceStorage_af706c00c2234488d2e1b065a04a1e63_images_image-d4bd41b6-9b65-4288-953d-dcbcfb3e1090.png
C:\Users\alexk\.cursor\projects\d-Applications-Content-factory\assets\c__Users_alexk_AppData_Roaming_Cursor_User_workspaceStorage_af706c00c2234488d2e1b065a04a1e63_images_image-1bb3193f-f478-4596-baeb-c675f4439cea.jpg
C:\Users\alexk\.cursor\projects\d-Applications-Content-factory\assets\c__Users_alexk_AppData_Roaming_Cursor_User_workspaceStorage_af706c00c2234488d2e1b065a04a1e63_images_image-d91b770d-4ad2-4328-8409-fb3caba51e9a.png
```

Копия в волну (опционально, read-only symlink/copy **без** wipe `generatedMedia`):  
`memory/waves/W-2026-10-15-sprint9-live-gen/refs/` — если AI Bridge/Client так удобнее; **не** обязателен для старта.

---

## 4. Бюджет PNG (строго)

| Правило | Значение |
|---------|----------|
| Каруселей | **3** (по одной на тему/эстетику) |
| Слайдов на карусель | **3** (cover / mid / CTA) |
| PNG всего | **≤ 9** |
| Раунды | До **3** циклов критики. **Интерпретация бюджета:** суммарно за волну генерируем **не больше 9 финальных PNG**, которые лежат в Черновиках как deliverable. Промежуточные failed rounds: либо **overwrite** тех же 3 draft-id (предпочтительно), либо soft-delete старых draft перед новым gen — **не** копить 9×3=27 файлов. |
| Stop | После 9 PNG deliverable **или** после 3-го круга критики — стоп gen. Отчёт в `memory/waves/.../stop-report.md` если упёрлись в лимит без PASS. |

**HARD REJECT бюджета:** 4-й слайд, 4-я карусель, panorama-as-only preview, batch >9 без stop-report.

---

## 5. Три темы Vernatun × три эстетики

| ID | Тема Vernatun | Эстетика как у ref | Структура 3 слайдов |
|----|---------------|--------------------|---------------------|
| **LG-A** | **Кофе и ритуал** — утро в клубе, чашка, «место встречи» | R1 orange/white clean editorial | 1 cover hook · 2 value (ритуал/атмосфера) · 3 CTA (прийти / сохранить) |
| **LG-B** | **Сообщество и энергия** — люди клуба, сила вместе (без gym-бренда) | R2 dark/orange cinematic | 1 drama hook · 2 proof/vibe · 3 CTA |
| **LG-C** | **Наследие и советы** — армянские корни / мудрые tip-карточки клуба | R3 black/yellow tip stack | 1 bold tip hook · 2 mid tip · 3 CTA tip |

Общие требования контента (из Sprint 9 + Client HARD S44–S46):

- Hook **цепляющий** (не flat label).
- `swipe_trigger` = **meta** QA, **не** текст на кадре.
- CTA только из каталога **1–4** на `cta_slide`.
- Preview = **нарезанные 4:5**, не одна панорама.
- Designer colors-only + panorama→slice (S45).
- Язык: RU (и армянские глифы если в brandbook — не ломать).

---

## 6. Пайплайн (сохраняем as-is)

```
Create (carousel-engine)
  → Scriptwriter (STRICT Dramaturgy JSON, slideCount=3)
  → Designer (describe → draw, panorama→slice → 3×4:5 PNG)
  → шаг Публикация
  → Draft Postgres (Sprint 8 API)
```

Альтернатива (если нужен handoff из разбора):  
`Razbor → Scriptwriter → Designer → Draft` — **тот же** budget и topics; не обязателен для первого круга.

**Сохраняемые handoffs:** кнопки Create segment, «Передать задание дизайнеру», шаг Публикация → Черновики.  
**Запрет:** mock «готово» без PNG; soft-parse вместо STRICT; обход Draft API.

---

## 7. Persist в Черновики (Sprint 8)

| Lock | Деталь |
|------|--------|
| SoT | Postgres `Draft` via `POST/GET /api/studio/drafts` |
| UI | Вкладка **Черновики** (Ours) — карточки видны после reload (как S8 Client) |
| FE store | `carousel-drafts-store` = cache; не писать «только zustand» |
| Медиа | slide URLs в draft payload / storage; не orphan PNG без draft row |
| Actor | Dev actor Sprint 8 (`x-cf-user-id` / `CF_DEV_USER_ID` / seed) — один userId на волну |
| Titles | Префикс `LIVE-GEN LG-A|B|C r{N}` для трассировки в Client report |

Пути (read/use, не redesign):

- `app/api/studio/drafts/**`
- `lib/studio/sprint8-client.ts`
- `lib/studio/carousel-drafts-store.ts`
- `lib/studio/create-carousel-publish.ts` (если Create publish path)

---

## 8. Цикл критики (≤3)

| Раунд | Кто | Что |
|-------|-----|-----|
| **r1** | AI Bridge | Gen LG-A/B/C (3×3), persist Drafts, артефакты в `generatedMedia/wave-live-gen/` + ссылки в wave md |
| **r1 critic** | **Client** | Playwright @1440: Черновики + сравнение с R1/R2/R3. Словами: что слабее (hook / contrast / type / CTA / slop). Тикеты замечаний `C-live-gen-*` или запись в `critic-r1.md` |
| **strengthen** | Fixer **или** AI Bridge | Только prompt/critic/few-shot upgrades по замечаниям; **overwrite** drafts |
| **r2 / r3** | то же | Пока PASS или лимит 3 |
| **final** | Client | Вердикт ПРИНЯТО / ПРИНЯТО С ЗАМЕЧАНИЯМИ / НЕ ПРИНЯТО |

**Критерий PASS (глазами Клиента):** качество **на уровне** refs по плотности, контрасту, типографике, «дорогому» ощущению — при **своих** Vernatun смыслах. Flat Inter / purple slop / tiny type / panorama-only / нет CTA → **НЕ ПРИНЯТО**.

---

## 9. Что AI Bridge **МОЖЕТ** править (upgrade_only)

| Path | Зачем |
|------|-------|
| `lib/studio/create-carousel-prompts.ts` | Усиление Scriptwriter/Designer под 3-slide + aesthetic locks |
| `lib/mesh/agent-defaults.ts` — **только** `carousel-engine` | Seeds под Vernatun themes |
| `workers/script-writer/SKILL.md`, `workers/designer-carousel/SKILL.md` | Канон без ломки контракта |
| `lib/studio/agent-start-bundle.ts` | Inject round critic notes / few-shots |
| `*-quality-critic` / Sprint 9 packs | Поднять порог до ref-likeness |
| `memory/waves/W-2026-10-15-sprint9-live-gen/**` | critic md, stop-report, gen logs (**без секретов**) |
| `generatedMedia/wave-live-gen/**` | PNG артефакты волны (≤9 deliverable) |

**Не трогать:** shell, Create chrome layout, mesh graph, Prisma schema, Apify, reels, social publish.

---

## 10. Что **MUST NOT**

| Запрет | Почему |
|--------|--------|
| >3 slides / >3 carousels / >9 PNG deliverable | budget lock |
| Копировать текст/лого R1–R3 брендов | topics lock |
| Правки AppShell / Sidebar / nav | shell_freeze |
| Rewrite Create/Razbor | upgrade_only + no_pipeline_break |
| Social publish | HITL draft only |
| Wipe Postgres / Redis / чужой `generatedMedia` | data-safety |
| Frontend redesign «чтобы красивее смотреть» | shell_freeze; смотрим живой UI as-is |
| 4-й круг gen без новой волны | critic_loop ≤3 |

---

## 11. Acceptance (язык Клиента)

1. Playwright MCP @1440 → `/studio/carousel-engine` → **Черновики**.  
2. Видны **3** draft-карточки LIVE-GEN (LG-A/B/C), у каждой **3** слайда L/R.  
3. Скриншоты vs refs: critic words в wave.  
4. Нет публикации в соцсеть.  
5. Меню/шелл без redesign.  
6. После финального круга — вердикт в `client-verdict.md`.

---

## 12. Skills / plugins

- `.cursor/skills/architect/SKILL.md` (этот план)  
- `.cursor/skills/ai-bridge/SKILL.md` + `prompt-engineering` + `carousel-json-contract` + `s50-prompt-hardening` + Sprint 9 packs  
- `.cursor/skills/content-pipeline-agents/SKILL.md`  
- `.cursor/skills/client-review/SKILL.md` + `client-scenarios` (Черновики / Create smoke) + `web-visual-critic`  
- `.cursor/skills/fixer/SKILL.md` (только strengthen по critic)  
- `.cursor/skills/deployer/SKILL.md` (localhost if needed)  
- Backend **вне** chain unless Draft API regress (escalation → Architect)

---

## 13. Тикеты волны (логика, не UI-бэклог)

| ID | Суть |
|----|------|
| **C-live-gen-01** | Round-1 gen 3×3 Vernatun + persist Drafts + artifact links |
| **C-live-gen-02** | Client critic r1 vs refs → `critic-r1.md` |
| **C-live-gen-03** | Strengthen prompts (Fixer/AI Bridge) + overwrite gen ≤ remaining rounds |
| **C-live-gen-04** | Client final @1440 Черновики |

---

## 14. Выход Архитектора

Файлы:

- `memory/waves/W-2026-10-15-sprint9-live-gen/architect-spec.md` (этот документ)  
- `memory/waves/W-2026-10-15-sprint9-live-gen/chain.md`

`🏗️ **АРХИТЕКТОР:** LIVE-GEN locked — 3 темы Vernatun × 3 слайда (≤9 PNG), critic loop ≤3, Drafts Postgres, shell_freeze / upgrade_only / no_pipeline_break. Следующий: AI Bridge C-live-gen-01.`
