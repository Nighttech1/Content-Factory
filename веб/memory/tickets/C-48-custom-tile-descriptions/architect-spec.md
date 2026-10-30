# Architect spec — C-48 / C-56

## Goal
`GET /api/modules/register` и плитки Студии показывают RU `description` из `custom-modules.json`, не `Custom worker · http://…`.

## Fix
1. `CreateRemoteContentModuleInput` + optional `description`, `icon`.
2. `createRemoteContentModule`: if description trim nonempty — use it; else RU fallback **без URL** (`Пользовательский модуль`). Never bake worker URL into user-facing description.
3. `createRemoteFromRecord` pass `record.description` and `record.icon`.
4. `persist.ts` fallback: same RU string, not Custom worker URL.

## Chain
Backend (factory/persist) → Frontend (only if store still overwrites) → Tester → Deployer → Client
