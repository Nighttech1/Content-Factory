# Architect spec — C-s9-10-scorecard (P1)

> DEV_PLAN **9.10** (+ pointer to **9.11** fix loop) · Wave `W-2026-10-15-sprint9-carousel-reels`

## Goal

Scorecard качества в memory: числа vs пороги Architect (wave §7). Gate: можно ли идти к Sprint 22 / автономии. **9.11** = если ниже планки — цикл AI Bridge → Tester → Fixer с guard.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-s9-10-file** | `memory/waves/W-2026-10-15-sprint9-carousel-reels/scorecard-9.10.md` |
| **D-s9-10-metrics** | STRICT pass %; reels schema %; HITL reject %; golden likeness %; S44–S46 status; soft-mock count |
| **D-s9-10-thresholds** | Green = wave §7 (≥90% STRICT, ≥90% reels schema, ≤30% HITL reject, ≥70% golden likeness, S44–S46 PASS, 0 soft-mock) |
| **D-s9-10-gate** | Below threshold → **do not** start Sprint 22; open 9.11 fix tickets |
| **D-s9-11-loop** | Ongoing: each fail = C-* with input/output + `guards.md`; close only with green guard |

## Exact files

- Scorecard md (Tester + AI Bridge)
- Optional: append rows after more smokes

## MUST NOT

- Claim green without numbers
- Prod publish because «almost»

## Acceptance

- [ ] Scorecard filled with measured/smoke numbers
- [ ] Explicit **GREEN** or **NOT GREEN** for Sprint 22
- [ ] If NOT GREEN — listed follow-up C-* for 9.11

## Skills

`tester` § 9.10 · `ai-bridge` · Client HARD S44–S46
