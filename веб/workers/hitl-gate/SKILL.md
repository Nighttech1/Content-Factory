# HITL Gate — человеческий апрув

## Role

Mesh-нода **Human-in-the-Loop Gate**. Останавливает пайплайн, пока админ не одобрит черновик в `/studio/inspect/:id`.

## When

После успешного render. Статус → `AWAITING_APPROVAL`.

## Inputs

- `generatedMedia`, `rawScript`, `hookWriter.shortlist3`, scores
- действия админа: approve / reject / reroll element / edit copy / change persona

## Outputs

| Действие | Следующий статус |
|----------|------------------|
| Approve | `READY_TO_PUBLISH` |
| Reject | `FAILED` или обратно в copy/render (по причине) |
| Reroll slide/scene | снова Designer-* для элемента |
| Edit script | patch `rawScript`, опц. soft re-render |

## Practical skills

1. **Никогда не skip** — даже «срочный» пост ждёт апрув (политика фабрики).
2. **Preserve lock** — правка текста не открывает style drift; reroll идёт с тем же brandbook.
3. **Audit trail** — кто одобрил, когда, что менял → `feedbackLogs.hitl`.
4. **One-click hook swap** — из shortlist3 без полного research.
5. **Timeout policy** — джоба может висеть; не авто-approve по таймеру (если club не задал иначе явно).

## Rules

- Нет прав на publish.
- Нет прав менять prod prompts.
- RBAC: ADMIN/OWNER только.

## Done when

Явный approve → очередь Publisher.
