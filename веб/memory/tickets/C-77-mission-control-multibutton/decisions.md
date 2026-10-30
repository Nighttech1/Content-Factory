# Decisions — C-77

## Канон (без развилок)

| Решение | Канон |
|---------|--------|
| UI выбора агента | Только **`CompactMultiButton`** из `components/ui/multi-button.tsx` |
| Второй segmented | **Запрещён** |
| VARIANT_CLASSES | Dark Luxury CSS vars (`--accent-blue*`, `--bg-elevated`, `--border-glass`); **не** purple/shadcn |
| Motion lib | `framer-motion` (уже в deps); не ставить `motion/react` вторым runtime |
| Icons | `lucide-react` |
| Agent id | `analyst` остаётся id в коде/panes |
| Razbor UI label | **«Разборщик»** |
| Analytics product | **«Аналитик» / «Аналитика»** на `/analytics` и nav — **без** rename в Разборщик |
| FloatingCommandBar on `/studio` | **Не** возвращать (C-27) |
| Schedule footer | **Не трогать** в C-77 (C-78) |

## Path lock

```
ALLOWED: multi-button, RazborModal, CreateCarouselModal, carousel-draft-types, razbor-pipeline (strings)
FORBIDDEN: components/schedule/**
```

## Rollback

1. `git checkout --` paths из chain Frontend.
2. Папку тикета не удалять.
