# Architect spec — C-131 (carousel crossfade)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> **После C-132.** Supersedes wave3 hard-cut канон.

## Goal

Переход между слайдами карусели без чёрной/пустой вспышки: crossfade или shared-layout overlap.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 Transition** | **Crossfade** and/or shared-layout slide — overlapping outgoing/incoming frames. **Ban:** unmount → empty → mount (black flash). |
| **D2 Surfaces** | `VerticalPostCarousel` / feed card media swipe / Create & Razbor preview carousels sharing same component path. |
| **D3 Motion role** | Frontend готовит structure (keep previous slide mounted during fade / AnimatePresence mode=`sync`/`popLayout` as appropriate). **Motion** после FE hook: springs, durations, `useReducedMotion` → instant crossfade or cut without black. |
| **D4 Perf** | Prefer compositor props (`opacity`, `transform`); no layout thrash; skill `web-motion-engine` + `fixing-motion-performance` if jank. |
| **D5 Meta** | Не откатывать C-132 typography. |

## In scope

- Carousel slide transition implementation
- Reduced-motion fallback (no flash)

## Out of scope

- Card meta typography (done in C-132)
- Razbor composer chrome (C-135)
- Mesh rewrite

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Structure / keep-alive slide | **Frontend** | hook first |
| Crossfade polish | **Motion** | after FE; `web-motion-engine` |

## Acceptance (язык Клиента)

1. S38: L/R на карусели — smooth crossfade; snapshot/video без чёрного кадра между.
2. `prefers-reduced-motion`: transition shortened/disabled **без** empty flash.

## Risks

- AnimatePresence `mode="wait"` часто даёт пустой кадр — избегать как default.
- Dual 2-up grid (C-120) — transition per active media, не ломать grid.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение.
