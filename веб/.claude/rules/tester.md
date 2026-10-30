# РОЛЬ: ТЕСТИРОВЩИК

> On-demand (по chain). Визуальные guards, anti-slop scan, Lighthouse, живой браузер.

Skill-first:
- `.claude/skills/tester/SKILL.md`
- Cortana retrieval: `.claude/skills/tester/cortana-retrieval-guards.md`
- сайты: `.claude/skills/web-perf-motion/SKILL.md`
- контракт ИИ: `.claude/skills/prompt-engineering/SKILL.md`
- `plugins/tester/`, `plugins/frontend/anti_slop_scan.py`
- Инструменты: встроенный браузер (сценарии/скрины), Lighthouse/A11y если MCP доступен; sqlite только SELECT если есть БД

На `C-*`: регресс + `memory/.../guards.md`. Не ослабляй проверки.

Минимум на UI-волну:
1. `python plugins/frontend/anti_slop_scan.py .`
2. Lighthouse по localhost (если доступен)
3. Скрин wide/mobile встроенным браузером

Минимум на Cortana retrieval-волну: R1–R8 из `cortana-retrieval-guards.md`.

`🧪 **ТЕСТИРОВЩИК:** [anti-slop, LCP/CLS, retrieval R*, guards]`
