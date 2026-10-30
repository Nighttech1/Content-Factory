# Architect spec — C-11

> Заполняет **Архитектор** до любого кода. Depends on **C-10** shell + store.

## Goal

Заполнить **правую контрольную панель** Inspector: Virality Meter, 3 hook-альтернативы с мгновенным swap, script editor со счётчиками, HeyGen Persona Switcher (UI-only). DEV_PLAN **4.2–4.3**. Toolbar Approve → **C-12**.

## In scope

- Заменить stub `components/inspect/InspectControlPanel.tsx` на реальную панель:
  - `ViralityMeter.tsx` — Hook Score из store (`viralityScore` / active hook score); `NeonBadge` / gauge OK.
  - `HookAlternatives.tsx` — ровно 3 chip/card; click → `selectHook(id)`; ACTIVE vs SWAP визуально; **обязан** менять snapshot (Client S2).
  - `ScriptEditor.tsx` — editable textarea/contenteditable; counters: words, estimated spoken sec, wpm (client-side math); Armenian text `var(--font-hy)`.
  - `HeyGenPersonaSwitcher.tsx` — selects: avatar model, emotion, voice, speech rate; bind `setPersonaField`; skill `heygen-avatar` **UI only** (no API).
- Job header strip inside panel: `#JOB-…`, status pill `Awaiting Sign-Off` (из store).
- Motion: hook-swap highlight / score bump feedback; spring preset; `useReducedMotion`.
- Consume `useInspectStore` / mock — **не** менять `lib/inspect-store.ts` / `lib/inspect-mock.ts` / left deck / page (если seed неполный — эскалация к Архитектору, не молчатый patch store).

## Out of scope

- Left deck / DnD / Reels player → **C-10**.
- Reroll / Approve & Schedule UI → **C-12** (`HitlToolbar` не трогать).
- HeyGen Interactive Avatar API, Whisper, Prisma, BullMQ.
- Stop-word highlighting advanced NLP — optional light markup OK; не блокирует.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Right control panel | Frontend | paths ниже |
| Hook swap motion | Motion | HookAlternatives / ViralityMeter |
| QA | Tester → Fixer | S2 hook swap; Armenian glyphs; counters |
| Localhost | Deployer | inspect demo |
| Приёмка | Client | hook click меняет UI |

## Contracts

### Props / store usage

| Component | Reads | Writes |
|-----------|-------|--------|
| ViralityMeter | `viralityScore`, `activeHookId`, `hooks` | — |
| HookAlternatives | `hooks`, `activeHookId` | `selectHook(id)` — should update score display + ACTIVE badge |
| ScriptEditor | `script` | `setScript(text)` |
| HeyGenPersonaSwitcher | `persona` | `setPersonaField(key, value)` |

### Select options (mock)

- **Avatar:** Anna (Literary Curator), Gevorg (Casual Yerevan), Lilit (Tech Strategist), Aram (Historian)
- **Emotion:** Warm, Energetic, Documentary, Soft
- **Voice:** Deep Baritone · Eastern Armenian, Warm Alto · Literary Yerevan, Energetic Tenor · Diaspora, Documentary Soft · Bilingual
- **Speech rate:** Slow, Natural, Fast

### Hook swap (S2 contract)

On `selectHook`:
1. `activeHookId` changes.
2. ACTIVE badge moves; previous shows SWAP.
3. Virality meter number updates to selected hook’s `score` (store action must do this — already specified in C-10 store; if missing, Fixer may patch **store only** under Fixer step with Architect note — preferred: C-10 already implemented).

Optional: first slide badge / karaoke first line echo active hook — nice-to-have, not required if left deck owned by C-10 without overlap; **do not** edit CarouselDeck/KaraokeCaptions in C-11.

## Acceptance criteria (язык Клиента)

1. Справа видны Virality Score, 3 хука, редактор сценария, блок HeyGen.
2. Клик по другому хуку **сразу** меняет активный хук и цифру score (видно на скрине до/после).
3. Счётчики слов/секунд обновляются при правке текста.
4. Смена avatar/emotion/voice/rate отражается в UI (выбранные значения).
5. Армянский в script/captions области панели без битых глифов.

## Risks

- Temptation to edit store/left deck for “live hook on player” — запрещено без эскалации.
- contenteditable vs textarea: prefer controlled `<textarea>` for a11y unless Stitch markup required; if markup — keep simple spans, not a full editor framework.

## Mid-flight escalation

Need store field / seed change → Architect updates C-10 contracts; then Fixer or C-10 reopen — not silent FE invent.
