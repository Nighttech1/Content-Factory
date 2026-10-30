# Architect spec — C-s9-09-smoke (P0)

> DEV_PLAN **9.9** · Wave `W-2026-10-15-sprint9-carousel-reels`

## Goal

Полный smoke на localhost: **Razbor → Scriptwriter → Designer → Draft** (карусель) + **custom-reels → Draft**. Без соцпоста. Проверить, что pipeline **не сломан** upgrade’ами.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-s9-09-paths** | Carousel Create + Razbor cascade + reels script path |
| **D-s9-09-evidence** | Playwright @1440 + `guards.md` |
| **D-s9-09-no-publish** | Нет вызовов social publish |
| **D-s9-09-strict** | Bad JSON path shows fail (not success toast) |
| **D-s9-09-scenarios** | Align Client S44–S46 relevant steps |

## Exact files Tester may write

- `memory/tickets/C-s9-09-smoke/guards.md`
- `memory/tickets/C-s9-09-smoke/tester-report.md`
- Optional smoke script under `scripts/` (no shell UI)

## MUST NOT

- Prod deploy; wipe data; «принять по API без UI»

## Acceptance

- [ ] Carousel path ends in Draft with sliced preview visible
- [ ] Reels script has hook/beats/CTA (or explicit fail if render chrome — documented)
- [ ] Agents still present in UI (Scriptwriter, Designer / Монтажёр)
- [ ] No social publish side-effect

## Skills

`tester` § 9.9 · `client-scenarios` S44–S46 · `ai-bridge` (assist)
