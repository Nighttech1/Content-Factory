# Architect spec — C-143 (Settings Design preview panel)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> Path lock **3**: **after C-144** (Settings trim first).

## Goal

Добавить справа панель превью содержимого design.md: открытие/закрытие, drag, resize ширины; upload сохранить.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 Panel** | Right-side preview shows current design.md text (override or loaded markdown). Scrollable body. |
| **D2 Toggle** | Explicit open/close; closed state does not leave a blocking overlay. |
| **D3 Drag** | Panel position draggable (within viewport safe bounds). |
| **D4 Resize** | Width resizable; clamp sensible min/max (e.g. ~280–560px or % of viewport). |
| **D5 Persist** | `localStorage` keys under `cf.settings.design-preview.*` (open, x/y or edge, width). |
| **D6 Upload** | Keep existing upload → override store (`writeDesignMdOverride`); preview updates. |
| **D7 Order** | Implement only after **C-144** removed Scout/Agents/LLM sections (same SettingsShell sequential path). |

## In scope

- `components/settings/SettingsShell.tsx` Design section (+ optional extracted `DesignPreviewPanel.tsx`)
- Persist helpers colocated under `lib/settings/`
- A11y: focusable toggle; keyboard Esc closes if overlay-like

## Out of scope

- Re-adding Settings LLM/Agents/Scout
- Mesh brief/pan
- Editing DESIGN.md on disk from server (browser override OK)
- Prod

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Preview panel UI | **Frontend** | `content-factory-ui` |
| Motion | optional | panel open 160ms |
| QA | Tester → Client | open/close/drag/resize + upload still works |

## Acceptance (язык Клиента)

1. Settings → Дизайн → открыть превью → виден текст design.md.
2. Закрыть / снова открыть.
3. Перетащить панель; изменить ширину; после reload состояние помнится.
4. Upload файла обновляет превью.
5. Нет секций Разведка/Агенты/LLM (гарантия C-144).

## Risks

- Drag vs text selection inside preview — drag handle only.
- Overlap with Floating TOC if still present — preview must not break TOC for remaining sections.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение.
