# Architect spec — C-134 (titles 16px)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> **Razbor path #1** — до C-135.

## Goal

App-wide pattern для system / Razbor source titles: Century Gothic, white, 16px.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 Token** | Font `--font-ui` (Century Gothic). Color **white**. Size **16px** (`text-base` if =16px, else `text-[16px]`). |
| **D2 Surfaces** | Razbor modal eyebrow/title; system source titles; pane titles «Разборщик / …» where they are system headings (not body chat). |
| **D3 Ban mix** | Не применять 16px к feed card meta (остаётся **C-132** 12px). Не синие Schedule labels. |
| **D4 Files** | `components/studio/RazborModal.tsx` (+ shared title chrome if extracted). Spot-check related system headings in studio workspace. |

## In scope

- Typography on Razbor/system titles
- Optional shared class `cf-system-title`

## Out of scope

- Composer layout / red X (C-135)
- Carousel motion
- Mesh inspector titles (C-137 may reuse token — OK if same classes)

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| UI | **Frontend** | `content-factory-ui` § C-134 |

## Acceptance (язык Клиента)

1. S36: Razbor open — titles CG white 16px.
2. Card meta still 12px (no regress C-132).

## Risks

- Bold vs regular — bold OK if still 16px white CG.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение.
