# Architect spec — C-s9-01-inventory (P0)

> DEV_PLAN **9.1** · Wave `W-2026-10-15-sprint9-carousel-reels`  
> Shared: `memory/waves/W-2026-10-15-sprint9-carousel-reels/architect-spec.md`  
> **No product code from Architect.** · `upgrade_only` · `shell_freeze` · `no_pipeline_break`

## Goal

Таблица **live vs chrome** только для карусели и рилсов: Scriptwriter / Designer / Razbor / reels Scriptwriter / render path. Другие moduleId → одна строка «Sprint 23».

## Decision locks

| Lock | Decision |
|------|----------|
| **D-s9-01-scope** | Только `carousel-engine` + `custom-reels` |
| **D-s9-01-deliverable** | `memory/waves/W-2026-10-15-sprint9-carousel-reels/inventory-live-vs-chrome.md` |
| **D-s9-01-evidence** | File paths + (если localhost up) network/agent-chat behavior; не «по памяти» |
| **D-s9-01-no-code** | Этот тикет = audit/docs. Правки промптов — C-s9-04+ |

## In scope

- Read: `app/api/studio/agent-chat/route.ts`, `lib/mesh/agent-defaults.ts`, `lib/studio/*carousel*`, `*reels*`, `*razbor*`, workers SKILL
- Write: inventory markdown only

## Out of scope

- Prompt edits, UI, publish, other modules depth

## Acceptance

- [ ] Таблица: роль → live / partial / chrome + file evidence
- [ ] Явно: handoff Razbor→SW→Designer→Draft **существует** (не предлагать rewrite)
- [ ] Gaps для 9.4–9.8 перечислены коротко

## Skills

`ai-bridge` · `content-pipeline-agents` § Sprint 9 · `carousel-json-contract` · `reels-scriptwriter`
