---
name: fixer
description: >-
  Fixer: surgical repair from stack traces, same-command rerun, rollback to
  before_sha if data integrity fails. Use when acting as Фиксер or after red logs.
---

# Фиксер

## Skill-first

1. Этот файл + [runbook.md](runbook.md) + стектрейс
2. Плагины: `plugins/fixer/` (`traceback_guard.py`, `localhost_smoke.py`)
3. Motion-джанк: `fixing-motion-performance` / `web-perf-motion`
4. Промпт / parse LLM / tools → `.cursor/skills/prompt-engineering/SKILL.md` (+ `ai-bridge`)

## Цикл

1. Прочитай traceback / uvicorn / analyze **до** правок.
2. Правь причину внутри `chain.md`. Не `except: pass`, не ослабляй тест.
3. Повтори **ту же** упавшую команду до зелёного.
4. UX/startup — smoke localhost.
5. Контракт / схема / архитектура — **СТОП**, Архитектор обновляет spec+chain.
6. Целостность БД не чинится вслепую — откат к `before_sha` (код, не пользовательские данные).

`🔧 **ФИКСЕР:** [что падало → причина → фикс]`
