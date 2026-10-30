# Architect Spec — 2026-10-17 carousel correct pipeline

**Дата:** 2026-10-17  
**Роль:** Архитектор  
**Волна:** полная замена пайплайна генерации карусели на `docs/карусель тест/correct/` + UI Settings + Google Sheet intake  
**ticket_limit:** `full-queue` (волна целиком)  
**shell_freeze:** `true` (AppShell / left nav / module top chrome — freeze)  
**full_pipeline_replace:** `true` (STRICT correct/; supersede Designer invent + S54 bake-off Client gate)  
**S55:** Client acceptance (supersedes S54 bake-off requirement for this wave)  
**Trainer:** `memory/trainer/2026-10-17-carousel-correct-answers-grade.md` · card `plugins/trainer/carousel-correct-pipeline.md`  
**Canon:** `# 00_README.md.txt` + Phase 6 `carousel-json-contract`  
**Код продукта в этом ходе Архитектора:** **нет** — только plan files + schema doc `01`.

**Chain:** `memory/waves/2026-10-17-carousel-correct-pipeline/chain.md`

---

## 1. Зачем (простым языком)

Сейчас Create рисует карусель «по-старому»: Дизайнер может додумывать кадр, bake-off сравнивал несколько режимов. Пользователь утвердил **исправленный** пайплайн в `correct/`:

1. Тема может прийти из **чата Create** или из **Google-таблицы** (таблица — дополнение, не замена чата).
2. Сценарист пишет весь JSON → код-критик + zod проверяют → Дизайнер **только** переводит слайд в `image_prompt` → картинка → vision проверяет текст (макс. 2 попытки) → черновик.
3. В Настройках появляются **Бренд** и **Пейзажи** (персонажи); у агента — вкладка **Логи**; при ошибке карточка агента подсвечивается красным.
4. Публицист публикует черновики по **авто-расписанию** или по **ручному времени**.

**Bake-off S54 (папки compare) для приёмки этой волны не нужен.** Type-on-PNG + vision остаются. CTA 1–4 и `swipe_trigger` (meta) **сохраняются**.

---

## 2. Жёсткие замки (HARD · 10 answers)

| # | Lock | Значение |
|---|------|----------|
| 1 | `create_plus_sheet` | Sheet **дополняет** Create-чат. Автоген по расписанию → **черновики**. Юзер задаёт **время публикации**. |
| 2 | `brand_after_design` | Settings: блок **«Бренд»** сразу **после** «Дизайн» (логотип + brand fields). |
| 3 | `sheet_live_sot` | Sheet ID `1kOJ1CjMK5rNldM1IGNLdiVXqHTMeCuG35yP6_w6Y5Ls` (public CSV). Маппинг **текущих** колонок + опциональные `slides`/`cta_type`/`hero` если появятся. Pick: `status` ∈ `{new, 1}`. После gen — обновить status. |
| 4 | `critic_supplements_zod` | Code critic (05) **дополняет** zod STRICT; retry Scriptwriter ≤2. |
| 5 | `vision_max_2_then_deliver` | Лучшая доступная vision (gpt-4o / OpenRouter vision). Max **2** gens/slide (1 retry) → deliver + `needs_review` + **RED** log. |
| 6 | `full_replace_draw` | **Полная** замена Create draw на correct flow. Designer = **только** `image_prompt`, no invention. |
| 7 | `landscapes_hero` | Settings **«Пейзажи»** ниже Бренд: name + multi-angle photos. Sheet `hero` empty = no char; else number → catalog. |
| 8 | `logs_red_publicist` | Agent tab **«Логи»**; mesh RED perimeter on error; Publicist = auto schedule **OR** manual time. |
| 9 | `s55_supersede_bakeoff` | Strict new pipeline; S55 supersedes bake-off Client requirement. |
| 10 | `cta_swipe_keep` | Brand fields in Brand block; **KEEP** CTA 1–4 + `swipe_trigger` meta. |

| Доп. | Значение |
|------|----------|
| `shell_freeze` | AppShell / Sidebar / left nav IA / module top chrome — **0** redesign. |
| `docs_01_06` | Файлы `01`–`06` в correct/ **не** копировать пустыми в prod. AI Bridge **черновит** 02–04/06 в файлы **и** в runtime overlays из README + locks. Architect заполняет `01` (этот deliverable). |
| `preflight_sheet` | Confirm Sheet visible (headers + sample) **до** localhost fill-тестов. |
| `no_silent_social` | Social publish только Publicist path + существующий HITL; не silent agent side-publish. |
| `html_overlay_primary` | По-прежнему **FAIL** (S53 spirit). |

---

## 3. Layers (контракты)

```text
┌─────────────────────────────────────────────────────────────┐
│ FE Settings: Design → Brand → Landscapes                     │
│ FE Team: agent drawer Logs · RED perimeter on error          │
│ FE Create: chat entry (unchanged chrome; draw path replaced) │
└──────────────────────────┬──────────────────────────────────┘
                           │ placeholders / catalog / mode
┌──────────────────────────▼──────────────────────────────────┐
│ AI Bridge: overlays 02/03/04 · critic 05 · vision gate       │
│ lib/studio/*prompts* · carousel-json-contract · quality-critic│
└──────────────────────────┬──────────────────────────────────┘
                           │ JSON / image_prompt / status
┌──────────────────────────▼──────────────────────────────────┐
│ Backend: Sheet sync · schedule→drafts · status machine       │
│ Publicist auto|manual · Draft/ScheduleSlot SoT               │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Владеет | Не трогает |
|-------|---------|------------|
| **AI Bridge** | System overlays Scriptwriter/Designer/vision; code-critic rules wired into STRICT; vision model pick + ≤2 retry; prompt drafts in `correct/02–04,06`; CTA/swipe KEEP in overlays | Settings UI chrome; Sheet HTTP write semantics beyond contract; AppShell |
| **Backend** | CSV/API read Sheet; pick row; status update; schedule job → Draft; Publicist schedule wire; persist Brand/Landscapes if needed; draft `needs_review` flags | Prompt wording; mesh SVG layout; invent draw |
| **Frontend** | Settings Brand after Design; Landscapes cells; Logs tab; RED perimeter; Publicist time chrome if missing | Prompt files content; Sheet column invent; zod schema invent |

---

## 4. Google Sheet — visibility + mapping

**Preflight (Architect 2026-10-17):** Sheet **readable** via public CSV export.

| Tab UI name | mode | gid | Evidence |
|-------------|------|-----|----------|
| **Темы встреч** | `meetings` | `0` | Headers `Дата,Время,Место,Тема,Примечание,Статус`. Row «Кумовство» `13.10.26` has `Статус=1`. Future dates empty. |
| **Полезные карусели** | `useful` | `902078005` | Headers `,№,topic,category,value,СТА,flag,hero`. `СТА` ∈ {1,2,4} ≈ CTA. `flag` ∈ {useful,meetings}. `hero` empty. No `status`/`slides` yet. |

**SoT schema doc:** `docs/карусель тест/correct/01_sheet_schema.md.txt` (filled this wave).

### 4.1 Normalized row (internal)

```ts
type SheetMode = "meetings" | "useful";

type NormalizedSheetRow = {
  mode: SheetMode;
  sheetRowKey: string;       // stable: meetings=date|topic ; useful=№
  topic: string;             // Тема | topic
  notes?: string;            // Примечание | value
  meta?: Record<string, string>; // Дата,Время,Место / category…
  statusRaw: string;         // Статус | planned status col
  slides?: number;           // optional col; default product default (e.g. 5–7)
  cta_type?: 1 | 2 | 3 | 4;  // optional col OR useful.СТА
  hero?: number | null;      // empty → null; else catalog number
};
```

### 4.2 Pick / status update

| Rule | Value |
|------|-------|
| Pickable | `statusRaw` trimmed case-insensitive ∈ `{ "new", "1" }` **OR** (useful without status col: pick rows with empty status **and** non-empty topic — **TBD Backend**, prefer add `status` col) |
| After start gen | write status → `generating` (or `2`) |
| After ready draft | write → `done` (or `ready`) |
| needs_input / needs_review | write → `needs_input` / `needs_review` (string preferred; if sheet only numeric — map in Backend constants) |
| Write path | Public CSV export is **read-only**. Status update requires Sheets API (service account / OAuth) **or** deferred: local SoT mirror + UI flag until write credentials exist. **Spec:** Backend implements read now; write-back behind `GOOGLE_SHEETS_WRITE=1` + creds in `.env` — if no creds, persist status in Postgres mirror and log RED «sheet write skipped». |

---

## 5. Data model (additive)

### 5.1 Existing (reuse)

- `Draft` / `DraftStatus` (`UNPUBLISHED` | `SCHEDULED`)
- `ScheduleSlot` / `ScheduleSlotStatus`
- `DesignSlot` (palette / brandbook tokens → `{{DESIGN_PALETTE_JSON}}`)
- `ContentJob` for gen pipeline

### 5.2 New / extend (Backend + `safe-db-migrations`)

| Entity | Purpose |
|--------|---------|
| `BrandSettings` (per user/workspace) | `brandName`, `logoRef` (storage path/URL), optional fields (tagline, etc.) → `{{BRAND_NAME}}` `{{LOGO_REF}}` |
| `LandscapeCharacter` | `number` (catalog id), `name`, `photoUrls[]` (multi-angle) → `{{CHARACTER_CATALOG}}` |
| `SheetRowMirror` (optional) | Cache last CSV snapshot + local status if Sheet write unavailable |
| `Draft.payload` flags | `pipeline: "correct"`, `needs_review?: boolean`, `needs_input?: boolean`, `sheetRowKey?`, `mode?`, `visionFailures?` |
| Agent run log | Append-only log lines for **Логи** tab (jobId, agentRole, level, message, ts) — Postgres or JSON file under `data/local/` if Architect-minimal |

**Migration rules:** additive only; no DROP; no wipe volumes.

---

## 6. Status machine (pipeline)

```text
[entry: Create chat | Sheet pick status∈{new,1}]
        │
        ▼
   Scriptwriter → JSON | needs_input ──► STOP (ask user; sheet status needs_input)
        │
        ▼
   zod STRICT + code critic (05)
        │ fail → Scriptwriter retry (count ≤2) → still fail → needs_input / fail job + RED
        ▼
   Designer → per-slide { image_prompt } ONLY
        │
        ▼
   Image model → PNG (type-on-PNG)
        │
        ▼
   Vision text-check (04+05)
        │ mismatch → regen same slide (total gens ≤2)
        │ still bad → keep PNG + needs_review + RED log
        ▼
   ready → Draft (PNG + caption + hashtags)
        │
        ▼
   Publicist: auto schedule (settings) OR manual publish time
        │
        ▼
   ScheduleSlot SCHEDULED / HITL social (existing rules)
```

| Pipeline status | Product surface |
|-----------------|-----------------|
| `needs_input` | Create/Sheet row blocked; Logs entry; no silent invent |
| `needs_review` | Draft visible with badge/flag; RED log; **not** infinite regen |
| `ready` | Draft in Черновики; Publicist can schedule |
| Sheet `generating` / `done` | Mirror of pipeline (when write enabled) |

---

## 7. Pipeline steps (correct STRICT)

| Step | Owner | Contract |
|------|-------|----------|
| 0 Placeholders | FE persist + Backend serve | `{{BRAND_NAME}}` `{{LOGO_REF}}` `{{DESIGN_PALETTE_JSON}}` `{{CHARACTER_CATALOG}}` `{{MODE}}` |
| 1 Entry | Backend + FE Create | Sheet row **or** Create chat topic; both valid |
| 2 Scriptwriter | AI Bridge | Overlay from correct/02 (drafted); full carousel JSON; CTA 1–4; `swipe_trigger` **meta only** |
| 3 Critic | AI Bridge + Backend validate | zod STRICT **plus** deterministic 05 rules; SW retry ≤2 |
| 4 Designer | AI Bridge | Overlay correct/03; output **only** `image_prompt` per slide; **delete/supersede** invent-heavy draw overlays / HTML-primary as success |
| 5 Image | Backend/worker existing image path | Best image model already wired (`openai/gpt-5.4-image-2` default stay unless env) |
| 6 Vision | AI Bridge | correct/04; best vision; ≤2 gens/slide; else `needs_review` |
| 7 Draft out | Backend | PNG + caption + hashtags; status ready/needs_review |
| 8 Publicist | Backend + FE | auto from settings **OR** manual datetime; no agent auto-handoff outside UI |

### 7.1 Docs 01–06 policy

| File | Who fills | Runtime |
|------|-----------|---------|
| `01_sheet_schema` | **Architect** (this wave) | Backend reads schema doc + live CSV |
| `02` Scriptwriter | **AI Bridge** drafts into file + `lib/studio/*prompts*` | Runtime overlay wins if file stale |
| `03` Designer | AI Bridge | same |
| `04` Vision | AI Bridge | same |
| `05` Critic rules | AI Bridge (+ Backend enforce) | Code module, not LLM |
| `06` Brand/palette | AI Bridge draft from Brand UI + DesignSlot | Placeholders at job start |

**Запрет:** `fs.readFile` пустого `02`–`06` как system prompt.

---

## 8. API surface (Backend)

| Method | Path (proposed) | Purpose |
|--------|-----------------|---------|
| `GET` | `/api/intake/sheet/preflight` | Visibility: tabs, headers, sample row, ok/fail |
| `GET` | `/api/intake/sheet/rows?mode=meetings\|useful` | List normalized pickable rows |
| `POST` | `/api/intake/sheet/generate` | `{ mode, sheetRowKey, scheduleAt? }` → enqueue correct pipeline → Draft |
| `POST` | `/api/intake/sheet/cron-tick` | Internal/cron: auto-gen due rows → drafts (idempotent) |
| `PATCH` | `/api/intake/sheet/rows/:key/status` | Local+optional Sheet write-back |
| `GET/PUT` | `/api/settings/brand` | Brand fields + logo upload ref |
| `GET/PUT` | `/api/settings/landscapes` | Character catalog CRUD |
| `GET` | `/api/agents/:id/logs` | Logs tab feed |
| Existing | Drafts / Schedule / agent-chat | Wire `pipeline=correct` on Create draw; Publicist schedule |

Env (secrets only `.env`): `GOOGLE_SHEET_ID`, optional `GOOGLE_SHEETS_API_KEY` / service account JSON path, `GOOGLE_SHEETS_WRITE`, vision model override.

---

## 9. Settings UI (Frontend)

Order in Settings (content blocks):

1. **Дизайн** (existing brandbook / tokens — unchanged intent S52 tokens-only)
2. **Бренд** (NEW) — logo upload + fields: name (required), optional extras used as placeholders
3. **Пейзажи** (NEW, below Brand) — grid of character cells: **имя** + **несколько фото ракурсов**; stable **number** 1..N for Sheet `hero`

**Out of scope UI:** resurrect brand-kit route; Brand before Design; AppShell churn.

---

## 10. Team / mesh UI

| Surface | Spec |
|---------|------|
| Agent drawer | Tab **«Логи»** (with existing Инструкция / Skills·Plugins·MCP / Model) |
| Error | Agent card / node **RED perimeter** when last run level=error or `needs_review` vision fail signal |
| Publicist | Controls: **auto schedule** (from settings) **OR** **manual** publish datetime on draft |

---

## 11. Create draw replacement (AI Bridge primary)

**Remove as primary success path:**

- Designer inventiveness / rich invent overlays that add scenes not in Scriptwriter JSON
- HTML/Playwright text overlay as product success (`CAROUSEL_HTML_FIRST` must not win when `pipeline=correct`)
- Phase5 `anchor_ref` bake-off as acceptance requirement

**Keep:**

- CTA catalog 1–4 + Create «?» cheat sheet
- `swipe_trigger` meta (not painted on slide)
- Type baked into PNG; vision check
- Create-chat as entry parallel to Sheet

**Target draw:** Scriptwriter JSON → Designer `image_prompt` only → image model → vision gate → Draft.

---

## 12. Non-goals

- Prod VPS deploy / Meta Graph live publish
- Filling user-facing marketing copy in empty `02`–`06` by Architect (AI Bridge)
- S54 bake-off folder compare as PASS gate
- Razbor / reels / HeyGen / other modules rewrite
- AppShell / left nav IA redesign
- Dropping CTA 1–4 or `swipe_trigger`
- Infinite vision regen
- Apify / Scout changes
- Copying 0-byte correct files into `lib/`

---

## 13. Acceptance (Client S55 language)

**Доказательство:** Playwright MCP @1440 + clicks (HARD GATE).

| ID | Scenario | PASS |
|----|----------|------|
| **S55.A** | Settings: after Дизайн → **Бренд** (logo+fields); below → **Пейзажи** (name+multi photos) | Snapshot |
| **S55.B** | Sheet preflight visible in report; schedule/auto → **Черновики**; publish time user-settable; Create-chat still works | API note + UI |
| **S55.C** | Logs tab; RED on error; vision ≤2 then deliver `needs_review`; CTA 1–4 + swipe meta alive; Designer not invent-primary | Snapshot + pipeline evidence |

**Hard REJECT:** Brand before Design; no Landscapes; sheet replaces Create; fill tests without visibility; vision infinite; no Logs/RED; CTA/swipe dropped; HTML-overlay-primary; invent-heavy Designer still primary; bake-off required for PASS.

---

## 14. Risks (top) → mitigations

See return summary; full:

1. **Sheet write-back** public CSV is read-only → mirror + optional API write.  
2. **useful** lacks `status` / `slides` → defaults + planned columns in `01`.  
3. **Prompt docs empty** → AI Bridge must draft before paste; runtime overlays SoT until reviewed.  
4. **Draw path churn** large (`carousel-html-renderer`, prompts) → sequential AI Bridge then Backend wire; no FE parallel on same files.  
5. **Vision cost/latency** → hard cap 2; deliver crooked + RED.

---

## 15. Skills / refs

- `plugins/trainer/carousel-correct-pipeline.md`
- `.cursor/skills/carousel-json-contract` Phase 6
- `.cursor/skills/client-scenarios` **S55**
- `.cursor/skills/ai-bridge` · `content-pipeline-agents` · `backend` Phase 6 · `content-factory-ui` Brand/Landscapes · `xyflow-agent-mesh` Logs/RED
- `safe-db-migrations` · `prisma-content-schema`

---

`🏗️ **АРХИТЕКТОР:** Spec locked. Full correct replace + Brand/Landscapes/Logs/RED + Sheet⊕Create + Publicist. Chain → AI Bridge → Backend → Frontend → Tester → Fixer → Deployer → Client (S55).`
