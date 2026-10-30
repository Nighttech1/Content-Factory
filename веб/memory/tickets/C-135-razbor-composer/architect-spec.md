# Architect spec — C-135 (Razbor composer chrome)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> **После C-134.**

## Goal

Razbor modal composer и close control по продуктовому скетчу: длинный input, кластер из 3 кнопок справа, круглый красный X.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 Input** | Chat input **longer** (flex-grow / max width of composer row) — primary horizontal space. |
| **D2 Actions** | **Exactly 3** action buttons **to the right** of the input (send / reply-style cluster). Icons or short labels OK; не размазывать под input. |
| **D3 Close** | Close control = **circular** button with **red X** (destructive accent). **Ban:** rectangular text button «Закрыть» as primary close. Esc/outside close may remain as secondary behaviors. |
| **D4 Titles** | Не откатывать C-134 16px titles. |
| **D5 File** | `components/studio/RazborModal.tsx` (+ `AgentChatComposer` if shared — only if Razbor uses it; don't break Mesh Settings composers unintentionally). |
| **D6 A11y** | Close button: accessible name (aria-label «Закрыть»); focus ring; 44px touch target preferred. |

## In scope

- Composer row layout
- Circular red X close
- Keep existing send/pipeline CTAs semantics mapped into the 3-button cluster (document mapping in PR/guards if labels change)

## Out of scope

- Agent pipeline rename (C-105)
- Mesh rewrite
- Feed carousel

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| UI | **Frontend** | `content-factory-ui` § C-135 |
| Motion | optional | 120–200ms press on buttons; not blocking |

## Acceptance (язык Клиента)

1. S38: Razbor open — long input + 3 buttons right visible @1440.
2. Close = circular red X; click closes modal.
3. Titles still 16px white CG (C-134).

## Risks

- Shrinking 3 buttons on narrow — keep cluster; input may shrink first but stay «longer» than before.
- Don't break scrollbar-hide chat (C-62).

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение.
