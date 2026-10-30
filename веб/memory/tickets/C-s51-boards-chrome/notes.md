# C-s51-boards-chrome — Frontend notes

| Field | Value |
|-------|-------|
| **ID** | `C-s51-boards-chrome` |
| **Priority** | P0 |
| **Status** | FE done (await Tester/Client) |

## Done

1. Boards dropdown opens **from** segment «Доски» / selected board title (`competitors-panel-boards`) — **no** extra dropdown button.
2. **Double-click** board name in menu → inline rename (`boards-rename-input`).
3. Selected board title **replaces** label «Доски» on the same segment.
4. Upload = **icon only** (`aria-label` Загрузить), always right of filter.
5. Upload stays mounted on Конкуренты|Доски; **disabled/gray** on Конкуренты — chrome **does not jump**.

## Files

- `components/studio/workspace/VerticalPostCarousel.tsx`
