# Architect spec — C-carousel-chrome (1.1–1.3)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + wave `chain.md`.  
> **No product code from Architect.**  
> Wave: `W-2026-10-12-carousel-studio-handoff`.  
> Canon: `.cursor/skills/carousel-studio-handoff/SKILL.md`.  
> Shared chain: `memory/waves/W-2026-10-12-carousel-studio-handoff/chain.md`.

## Goal

Перестроить chrome окна **«Создать карусель»**: сегмент шагов сверху в стиле shadcn/`Button` variants; убрать bottom handoff и tools; заложить `components/ui/button.tsx` (+ cva, slot) с маппингом на Vernatun Dark Luxury.

## Covers

| Item | Lock |
|------|------|
| **1.1** | Удалить CTA «передать…» **справа снизу** и кнопку **тулзов** слева снизу из Create |
| **1.2** | Top **segment** шагов (Button variants / 21st button variants), не MultiButton как единственный switcher |
| **1.3** | Добавить `components/ui/button.tsx` + `@radix-ui/react-slot` + `class-variance-authority` при необходимости; токены → Canvas/Glass/Cobalt/Gold |

## Decision locks

| Lock | Decision |
|------|----------|
| **D-chrome-1 Segment** | Labels шагов: **Сценарист \| Дизайнер \| Публикация**. **Нет** агента «Публицист» в segment (полный publish — C-carousel-publish; chrome уже показывает «Публикация»). |
| **D-chrome-2 Handoff placement** | Handoff CTA живёт **справа сверху** (рядом с segment / top bar). Composer = PromptBox send+mic only — **без** handoff/tools в footer. |
| **D-chrome-3 MultiButton** | `CompactMultiButton` / `MultiButton` **запрещены** как agent switcher в Create. Можно оставить файл multi-button для других экранов — не использовать в CreateCarouselModal. |
| **D-chrome-4 Button primitive** | New `components/ui/button.tsx` (cva variants + Slot). Map variants → Vernatun tokens from `content-factory-ui` / ARCHITECTURE. **Запрет** заливать чужой `--hu-*` theme поверх бренда. |
| **D-chrome-5 Segment component** | New dedicated segment chrome component (name OK: `CreateCarouselStepSegment` / `AgentStepSegment`) consuming `Button` variants; stable `data-testid`s for S41 (e.g. `create-carousel-segment`, `create-step-scriptwriter`, `create-step-designer`, `create-step-publication`). |
| **D-chrome-6 Composer** | Keep PromptBox path via `AgentChatComposer` + `chatgpt-prompt-input.tsx`; strip footer handoff/tools from Create usage. Mic + send remain. |

## In scope

| Path | Owner |
|------|--------|
| `components/studio/workspace/CreateCarouselModal.tsx` | Frontend |
| `components/studio/workspace/AgentChatComposer.tsx` | Frontend (Create footer cleanup; shared API keep Razbor-safe) |
| `components/ui/chatgpt-prompt-input.tsx` | Frontend (only if needed for footer tools removal) |
| `components/ui/button.tsx` (**new**) | Frontend |
| Segment chrome component (**new** under `components/studio/workspace/` or `components/ui/`) | Frontend |
| deps: `@radix-ui/react-slot`, `class-variance-authority` | Frontend (package.json if missing) |

## Out of scope

- Agent-start bundle / describe→draw / markdown (→ **C-carousel-agents**)
- Publication draft+schedule wire (→ **C-carousel-publish**)
- Any edits to `RazborModal.tsx` / breaking RazborPublisherPane
- Copy pattern to other Create modules
- Prod/VPS deploy

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| UI chrome | **Frontend** | 21st search button-variants OK; retokenize |
| API | — | none for chrome-only |
| AI | — | none for chrome-only |

## Contracts

- Step id union for Create (chrome): `"scriptwriter" \| "designer" \| "publication"` (replace `"publisher"` agent id in Create).
- Segment checkmark: **UI hook only** in chrome; filled after successful handoff (agents ticket owns when to set).
- Top-right primary CTA slot reserved: label owned by agents ticket («Передать задание» / designer dual CTAs).

## Acceptance criteria (язык Клиента / S41 partial)

1. Открыл «Создать карусель» @1440 — сверху видны **Сценарист / Дизайнер / Публикация** как segment кнопок, не MultiButton-footer.
2. **Нет** кнопки «передать…» справа снизу; **нет** tools слева снизу.
3. Composer внизу = только поле + send + mic.
4. Кнопки выглядят как Vernatun (Cobalt/Gold/Glass), не чужой purple/`--hu-*` theme.

## Risks

- Shared `AgentChatComposer` used by Razbor — strip Create-only props; **не** ломать Razbor footer contracts.
- Installing cva/slot — pin versions consistent with Next 15 / React 19.

## Mid-flight escalation

Контракт segment labels / button tokens неверный → стоп → Архитектор обновляет spec + wave chain → продолжение.
